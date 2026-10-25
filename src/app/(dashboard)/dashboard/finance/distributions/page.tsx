import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { getWaqfScope, scopeQuery } from "@/lib/waqf-scope";
import styles from "../../assets/assets.module.css";

export default async function FinanceDistributionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("role, is_platform_admin").eq("id", user?.id).single();
  const scope = profile?.is_platform_admin ? await getWaqfScope() : null;

  const { data: distributions } = await scopeQuery(
    supabase.from("distributions").select("*, waqfs(name)"), scope
  ).order("distribution_date", { ascending: false });

  const total = (distributions || []).reduce((s, d) => s + Number(d.total_amount || 0), 0);

  return (
    <div className="fade-in">
      <div className={styles.header}>
        <div className={styles.titleInfo}>
          <h1>التوزيعات المنفذة</h1>
          <p>سجل توزيعات الريع على المستفيدين — تفاصيل كل توزيعة في صفحة المستفيدين.</p>
        </div>
        <div className={styles.actions}>
          <Link href="/dashboard/beneficiary" className={styles.secBtn} style={{ textDecoration: "none" }}>إدارة المستفيدين ←</Link>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", marginTop: "1.5rem" }}>
        {[
          { label: "إجمالي الموزع", value: `${Math.round(total).toLocaleString()} ر.س`, color: "#3B82F6" },
          { label: "عدد التوزيعات", value: distributions?.length ?? 0, color: "#8561AD" },
        ].map(s => (
          <div key={s.label} className="glass-card" style={{ padding: "1rem 1.25rem", borderTop: `3px solid ${s.color}` }}>
            <div style={{ fontSize: "1.2rem", fontWeight: 800 }}>{s.value}</div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className={`${styles.ledgerContainer} glass-card`} style={{ marginTop: "1.5rem" }}>
        <table className={styles.table}>
          <thead><tr><th>الرمز</th><th>الوقف</th><th>التاريخ</th><th>الحالة</th><th>المبلغ الإجمالي</th><th></th></tr></thead>
          <tbody>
            {distributions && distributions.length > 0 ? distributions.map(d => (
              <tr key={d.id}>
                <td><code className={styles.code}>{d.id.split("-")[0]}</code></td>
                <td>{(d.waqfs as any)?.name || "—"}</td>
                <td>{new Date(d.distribution_date).toLocaleDateString("ar-SA")}</td>
                <td>{d.status === "completed" || d.status === "done" ? "✅ منفذة" : d.status === "pending" ? "⏳ معلقة" : d.status}</td>
                <td style={{ fontWeight: 700 }}>{Number(d.total_amount).toLocaleString()} ر.س</td>
                <td><Link href={`/dashboard/beneficiary/distributions/${d.id}`} style={{ color: "#8561AD", textDecoration: "none", fontSize: "0.82rem", fontWeight: 700 }}>التفاصيل ←</Link></td>
              </tr>
            )) : (
              <tr><td colSpan={6} style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>لا توجد توزيعات بعد.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
