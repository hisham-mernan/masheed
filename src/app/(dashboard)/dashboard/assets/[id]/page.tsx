import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import styles from "../assets.module.css";

const CAT_AR: Record<string, string> = {
  real_estate: "عقاري",
  agricultural: "زراعي",
  investment: "مالي / أسهم",
  cash: "نقد",
};
const TX_AR: Record<string, string> = { income: "إيراد", expense: "مصروف", distribution: "توزيع" };
const STATUS_AR: Record<string, string> = { active: "نشط", maintenance: "صيانة", sold: "مباع", inactive: "غير نشط" };
const TASK_STATUS: Record<string, string> = { open: "مفتوحة", done: "مكتملة", cancelled: "ملغاة" };

export default async function AssetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const canWrite = ["admin", "supervisor"].includes(profile?.role || "");

  const { data: asset } = await supabase
    .from("assets")
    .select("*, waqfs(id, name)")
    .eq("id", id)
    .single();
  if (!asset) notFound();

  const [txs, tasks, docs] = await Promise.all([
    supabase.from("transactions").select("*").eq("asset_id", id).order("transaction_date", { ascending: false }),
    supabase.from("maintenance_tasks").select("id, title, priority, status, due_date, created_at").eq("asset_id", id).order("created_at", { ascending: false }),
    supabase.from("documents").select("id, title, doc_type, doc_date, created_at").eq("asset_id", id).order("created_at", { ascending: false }),
  ]);

  const income = txs.data?.filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0) || 0;
  const expense = txs.data?.filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0) || 0;
  const openTasks = tasks.data?.filter(t => t.status === "open").length || 0;

  return (
    <div className="fade-in">
      <div className={styles.header}>
        <div className={styles.titleInfo}>
          <h1>{asset.name}</h1>
          <p>
            {CAT_AR[asset.category] || asset.category} ·{" "}
            <Link href={`/dashboard/waqfs/${asset.waqf_id}`} style={{ color: "#8561AD" }}>
              {(asset.waqfs as any)?.name}
            </Link>
            {" "}· أُضيف {new Date(asset.created_at).toLocaleDateString("ar-SA")}
          </p>
        </div>
        <div className={styles.actions}>
          <Link href={`/dashboard/tasks?asset=${asset.id}`} className={styles.secBtn} style={{ textDecoration: "none" }}>
            سجل الصيانة ({openTasks.toLocaleString("ar-SA")} مفتوحة)
          </Link>
          {canWrite && (
            <Link href={`/dashboard/assets/edit/${asset.id}`} className="btn-primary" style={{ textDecoration: "none" }}>تعديل الأصل ✏️</Link>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        {[
          { label: "التقييم الحالي", value: Number(asset.valuation).toLocaleString() + " ر.س" },
          { label: "الحالة", value: STATUS_AR[asset.status] || asset.status },
          { label: "إجمالي الإيرادات", value: income.toLocaleString() + " ر.س" },
          { label: "إجمالي المصروفات", value: expense.toLocaleString() + " ر.س" },
          { label: "صافي الريع", value: (income - expense).toLocaleString() + " ر.س" },
          { label: "الموقع", value: asset.location || "غير محدد" },
        ].map((c) => (
          <div key={c.label} className="glass-card" style={{ padding: "1rem", textAlign: "center" }}>
            <div style={{ fontSize: "1.1rem", fontWeight: 700 }}>{c.value}</div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{c.label}</div>
          </div>
        ))}
      </div>

      <div className="glass-card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ marginTop: 0 }}>الحركات المالية ({txs.data?.length || 0})</h3>
          {canWrite && (
            <Link href="/dashboard/finance/add" className="btn-outline" style={{ fontSize: "0.8rem", padding: "0.3rem 0.8rem", textDecoration: "none" }}>
              تسجيل معاملة +
            </Link>
          )}
        </div>
        {txs.data && txs.data.length > 0 ? (
          <table className={styles.table}>
            <thead>
              <tr><th>النوع</th><th>المبلغ</th><th>الوصف</th><th>التاريخ</th><th>المرجع</th></tr>
            </thead>
            <tbody>
              {txs.data.map((t) => (
                <tr key={t.id}>
                  <td><span className={`${styles.status} ${t.type === "income" ? styles.active : ""}`}>{TX_AR[t.type] || t.type}{t.is_yield ? "" : " (أصل)"}</span></td>
                  <td style={{ color: t.type === "income" ? "#10B981" : "#EF4444", fontWeight: "bold" }}>
                    {t.type === "income" ? "+" : "-"}{Number(t.amount).toLocaleString()}
                  </td>
                  <td>{t.description || "—"}</td>
                  <td>{new Date(t.transaction_date).toLocaleDateString("ar-SA")}</td>
                  <td>{t.reference_no || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p style={{ color: "var(--text-muted)" }}>لا توجد حركات مالية مسجلة على هذا الأصل.</p>}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        <div className="glass-card" style={{ padding: "1.5rem" }}>
          <h3 style={{ marginTop: 0 }}>مهام الصيانة ({tasks.data?.length || 0})</h3>
          {tasks.data && tasks.data.length > 0 ? tasks.data.map((t) => (
            <div key={t.id} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid #f0f0f0" }}>
              <span style={{ textDecoration: t.status === "done" ? "line-through" : "none" }}>{t.title}</span>
              <span style={{ color: t.status === "open" ? "#F59E0B" : "#10B981", fontSize: "0.85rem" }}>
                {TASK_STATUS[t.status] || t.status}{t.due_date ? ` · ${new Date(t.due_date).toLocaleDateString("ar-SA")}` : ""}
              </span>
            </div>
          )) : <p style={{ color: "var(--text-muted)" }}>لا مهام مسجلة.</p>}
        </div>

        <div className="glass-card" style={{ padding: "1.5rem" }}>
          <h3 style={{ marginTop: 0 }}>المستندات ({docs.data?.length || 0})</h3>
          {docs.data && docs.data.length > 0 ? docs.data.map((d) => (
            <div key={d.id} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid #f0f0f0" }}>
              <span>{d.title}</span>
              <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{d.doc_type}{d.doc_date ? ` · ${d.doc_date}` : ""}</span>
            </div>
          )) : <p style={{ color: "var(--text-muted)" }}>لا مستندات مرفوعة لهذا الأصل.</p>}
        </div>
      </div>

      <p style={{ marginTop: "1.5rem" }}>
        <Link href="/dashboard/assets" style={{ color: "#8561AD" }}>← العودة لسجل الأصول</Link>
      </p>
    </div>
  );
}
