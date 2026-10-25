import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { getWaqfScope, scopeQuery } from "@/lib/waqf-scope";
import styles from "../assets/assets.module.css";

const TYPE_AR: Record<string, string> = { distribute_yield: "توزيع ريع", settle_wallets: "تسوية محافظ" };

export default async function WorkflowsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("is_platform_admin").eq("id", user?.id).single();
  const scope = profile?.is_platform_admin ? await getWaqfScope() : null;

  const { data: requests } = await scopeQuery(
    supabase.from("approval_requests").select("*, creator:created_by(full_name), approver:approved_by(full_name)"), scope
  ).order("created_at", { ascending: false }).limit(20);

  const pending = (requests || []).filter(r => r.status === "pending");
  const approved = (requests || []).filter(r => r.status === "approved");
  const executed = (requests || []).filter(r => r.status === "executed");

  const Stage = ({ label, count, color, active }: { label: string; count: number; color: string; active?: boolean }) => (
    <div style={{ flex: 1, textAlign: "center", padding: "1rem", borderRadius: "10px", background: active ? "#F0E7FF" : "#F8FAFC", border: `1.5px solid ${active ? "#8561AD" : "#E2E8F0"}` }}>
      <div style={{ fontSize: "1.5rem", fontWeight: 800, color }}>{count}</div>
      <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>{label}</div>
    </div>
  );

  return (
    <div className="fade-in">
      <div className={styles.header}>
        <div className={styles.titleInfo}>
          <h1>محرك تدفقات العمل والاعتمادات</h1>
          <p>كل عملية حساسة في مَشيد تمر بتدفق Maker–Checker: إنشاء → اعتماد طرف آخر → تنفيذ موثق.</p>
        </div>
        <div className={styles.actions}>
          <Link href="/dashboard/approvals" className="btn-primary" style={{ textDecoration: "none" }}>مركز الاعتمادات ←</Link>
        </div>
      </div>

      <div className="glass-card" style={{ padding: "1.5rem", marginTop: "1.5rem" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#8561AD", marginBottom: "1rem" }}>⚙️ التدفق النشط: اعتماد العمليات المالية (توزيع ريع / تسوية محافظ)</h3>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "stretch" }}>
          <Stage label="المرحلة 1: إنشاء الطلب (Maker)" count={requests?.length ?? 0} color="#3B82F6" active />
          <div style={{ alignSelf: "center", color: "#94A3B8", fontSize: "1.3rem" }}>←</div>
          <Stage label="المرحلة 2: الاعتماد (Checker ≠ Maker)" count={approved.length + executed.length} color="#F59E0B" active />
          <div style={{ alignSelf: "center", color: "#94A3B8", fontSize: "1.3rem" }}>←</div>
          <Stage label="المرحلة 3: التنفيذ والتوثيق" count={executed.length} color="#10B981" active />
        </div>
        <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "1rem" }}>
          🔒 قواعد مفروضة على مستوى قاعدة البيانات: لا يمكن لمنشئ الطلب اعتماده بنفسه، ولا يمكن تنفيذ طلب قبل اعتماده، وكل خطوة موثقة باسم المستخدم والوقت.
        </p>
      </div>

      <div className={`${styles.ledgerContainer} glass-card`} style={{ marginTop: "1.5rem" }}>
        <table className={styles.table}>
          <thead><tr><th>الطلب</th><th>النوع</th><th>المبلغ</th><th>أنشأه (Maker)</th><th>اعتمد (Checker)</th><th>المرحلة الحالية</th><th>التاريخ</th></tr></thead>
          <tbody>
            {requests && requests.length > 0 ? requests.map(r => {
              const stage = r.status === "executed" ? { l: "✅ منفذ", c: "#15803D" } : r.status === "approved" ? { l: "معتمد — بانتظار التنفيذ", c: "#B45309" } : r.status === "rejected" ? { l: "❌ مرفوض", c: "#DC2626" } : { l: "⏳ بانتظار الاعتماد", c: "#1D4ED8" };
              return (
                <tr key={r.id}>
                  <td><code className={styles.code}>{r.id.split("-")[0]}</code></td>
                  <td>{TYPE_AR[r.type] || r.type}</td>
                  <td style={{ fontWeight: 700 }}>{r.amount ? `${Number(r.amount).toLocaleString()} ر.س` : "—"}</td>
                  <td style={{ fontSize: "0.8rem" }}>{(r.creator as any)?.full_name || "—"}</td>
                  <td style={{ fontSize: "0.8rem" }}>{(r.approver as any)?.full_name || "—"}</td>
                  <td><span style={{ color: stage.c, fontWeight: 700, fontSize: "0.8rem" }}>{stage.l}</span></td>
                  <td style={{ fontSize: "0.78rem" }}>{new Date(r.created_at).toLocaleDateString("ar-SA")}</td>
                </tr>
              );
            }) : (
              <tr><td colSpan={7} style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>لا توجد طلبات في التدفق بعد.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
