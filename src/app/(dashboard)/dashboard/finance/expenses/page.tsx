import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { getWaqfScope, scopeQuery } from "@/lib/waqf-scope";
import styles from "../../assets/assets.module.css";

export default async function ExpensesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("role, is_platform_admin").eq("id", user?.id).single();
  const scope = profile?.is_platform_admin ? await getWaqfScope() : null;

  const { data: expenses } = await scopeQuery(
    supabase.from("transactions").select("*, assets(name), waqfs(name)").eq("type", "expense"), scope
  ).order("transaction_date", { ascending: false });

  const total = (expenses || []).reduce((s, r) => s + Number(r.amount || 0), 0);
  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
  const monthTotal = (expenses || []).filter(r => new Date(r.transaction_date) >= monthStart).reduce((s, r) => s + Number(r.amount || 0), 0);

  return (
    <div className="fade-in">
      <div className={styles.header}>
        <div className={styles.titleInfo}>
          <h1>المصروفات التشغيلية</h1>
          <p>مصروفات الصيانة والإدارة والتشغيل الموثقة في دفتر الأستاذ.</p>
        </div>
        <div className={styles.actions}>
          <Link href="/dashboard/finance" className={styles.secBtn} style={{ textDecoration: "none" }}>دفتر الأستاذ الكامل ←</Link>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", marginTop: "1.5rem" }}>
        {[
          { label: "إجمالي المصروفات", value: `${Math.round(total).toLocaleString()} ر.س`, color: "#EF4444" },
          { label: "مصروفات الشهر الحالي", value: `${Math.round(monthTotal).toLocaleString()} ر.س`, color: "#F59E0B" },
          { label: "عدد المصروفات", value: expenses?.length ?? 0, color: "#3B82F6" },
        ].map(s => (
          <div key={s.label} className="glass-card" style={{ padding: "1rem 1.25rem", borderTop: `3px solid ${s.color}` }}>
            <div style={{ fontSize: "1.2rem", fontWeight: 800 }}>{s.value}</div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className={`${styles.ledgerContainer} glass-card`} style={{ marginTop: "1.5rem" }}>
        <table className={styles.table}>
          <thead><tr><th>الرمز</th><th>البند / الوصف</th><th>الأصل</th><th>الوقف</th><th>التاريخ</th><th>المبلغ</th></tr></thead>
          <tbody>
            {expenses && expenses.length > 0 ? expenses.map(r => (
              <tr key={r.id}>
                <td><code className={styles.code}>{r.id.split("-")[0]}</code></td>
                <td><strong>{r.description || "مصروف"}</strong></td>
                <td>{(r.assets as any)?.name || "—"}</td>
                <td style={{ fontSize: "0.8rem" }}>{(r.waqfs as any)?.name || "—"}</td>
                <td>{new Date(r.transaction_date).toLocaleDateString("ar-SA")}</td>
                <td style={{ color: "#EF4444", fontWeight: 700 }}>−{Number(r.amount).toLocaleString()} ر.س</td>
              </tr>
            )) : (
              <tr><td colSpan={6} style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>لا توجد مصروفات مسجلة.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
