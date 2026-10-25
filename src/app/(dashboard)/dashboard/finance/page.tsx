import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import ExportButton from "@/components/dashboard/ExportButton";
import styles from "../assets/assets.module.css";
import { getWaqfScope, scopeQuery } from "@/lib/waqf-scope";

export default async function FinancePage({ searchParams }: { searchParams: Promise<{ success?: string; error?: string }> }) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("role, is_platform_admin").eq("id", user?.id).single();
  const canWrite = ["admin", "supervisor"].includes(profile?.role || "");
  const scope = profile?.is_platform_admin ? await getWaqfScope() : null;
  const { data: transactions } = await scopeQuery(
    supabase.from("transactions").select("*, assets(name)"), scope
  ).order("created_at", { ascending: false });

  const formatType = (type: string) => {
    switch (type) {
      case "income": return "إيراد (Ri'a)";
      case "expense": return "مصروف (صيانة/إدارة)";
      case "distribution": return "توزيع (للمستفيدين)";
      default: return type;
    }
  };

  return (
    <div className="fade-in">
      {params?.error && (
        <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", padding: "0.75rem 1rem", borderRadius: "6px", marginBottom: "1rem" }}>
          {params.error}
        </div>
      )}
      {params?.success && (
        <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", color: "#15803D", padding: "0.75rem 1rem", borderRadius: "6px", marginBottom: "1rem" }}>
          تم تسجيل المعاملة بنجاح وتوثيقها في سجل المراجعة.
        </div>
      )}
      <div className={styles.header}>
        <div className={styles.titleInfo}>
          <h1>المالية والمصارف (دفتر الأستاذ)</h1>
          <p>إدارة وتوثيق الإيرادات والمصروفات والتوزيعات النقدية للأوقاف.</p>
        </div>
        <div className={styles.actions}>
          <Link href="/dashboard/reports/finance" className={styles.secBtn} style={{ textDecoration: 'none' }}>📄 تقرير PDF</Link>
          <ExportButton data={transactions || []} filename="سجل_المالية" className={styles.secBtn} />
          {canWrite && (
            <Link href="/dashboard/finance/add" className="btn-primary" style={{ textDecoration: 'none' }}>تسجيل معاملة +</Link>
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem", flexWrap: "wrap" }}>
        {[
          { href: "/dashboard/finance/revenues", label: "💰 الإيرادات والريع" },
          { href: "/dashboard/finance/expenses", label: "🧾 المصروفات" },
          { href: "/dashboard/finance/budgets", label: "📊 الميزانيات" },
          { href: "/dashboard/finance/distributions", label: "💸 التوزيعات" },
        ].map(l => (
          <Link key={l.href} href={l.href} className={styles.secBtn} style={{ textDecoration: "none" }}>{l.label}</Link>
        ))}
      </div>

      <div className={`${styles.ledgerContainer} glass-card`} style={{ marginTop: '2rem' }}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>رقم المعاملة</th>
              <th>النوع</th>
              <th>المبلغ (ر.س)</th>
              <th>الأصل المرتبط</th>
              <th>الوصف</th>
              <th>التاريخ</th>
            </tr>
          </thead>
          <tbody>
            {transactions && transactions.length > 0 ? transactions.map((t) => (
              <tr key={t.id}>
                <td><code className={styles.code}>{t.id.split("-")[0]}</code></td>
                <td>
                  <span className={`${styles.status} ${t.type === 'income' ? styles.active : t.type === 'expense' ? styles.suspended : ''}`}>
                    {formatType(t.type)}
                  </span>
                </td>
                <td style={{ color: t.type === 'income' ? '#10B981' : '#EF4444', fontWeight: 'bold' }}>
                  {t.type === 'income' ? '+' : '-'}{Number(t.amount).toLocaleString()}
                </td>
                <td>{t.asset_id ? <Link href={`/dashboard/assets/${t.asset_id}`} style={{ color: "#8561AD", textDecoration: "none" }}>{(t.assets as any)?.name}</Link> : "—"}</td>
                <td>{t.description || "—"}</td>
                <td>{new Date(t.transaction_date).toLocaleDateString("ar-SA")}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  لا توجد معاملات مالية بعد. قم بتسجيل الإيرادات أو المصروفات أولاً.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
