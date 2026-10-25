import { createClient } from "@/lib/supabase/server";
import { getWaqfScope, scopeQuery } from "@/lib/waqf-scope";
import styles from "../assets/assets.module.css";

const MONTHS_AR = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];
const CAT_AR: Record<string, string> = { real_estate: "عقاري", investment: "استثماري", cash: "نقد", other: "أخرى" };

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("is_platform_admin").eq("id", user?.id).single();
  const scope = profile?.is_platform_admin ? await getWaqfScope() : null;

  const [{ data: transactions }, { data: assets }, { data: tasks }, { data: investments }, { data: beneficiaries }] = await Promise.all([
    scopeQuery(supabase.from("transactions").select("amount, type, transaction_date"), scope),
    scopeQuery(supabase.from("assets").select("category, valuation"), scope),
    scopeQuery(supabase.from("maintenance_tasks").select("status"), scope),
    scopeQuery(supabase.from("investments").select("risk_level, valuation, status"), scope),
    scopeQuery(supabase.from("beneficiaries").select("wallet_balance"), scope),
  ]);

  // 12 شهر: إيراد مقابل مصروف
  const now = new Date();
  const buckets: { label: string; income: number; expense: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({ label: MONTHS_AR[d.getMonth()], income: 0, expense: 0 });
  }
  const keyIdx = new Map<string, number>();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keyIdx.set(`${d.getFullYear()}-${d.getMonth()}`, 11 - i);
  }
  (transactions || []).forEach(t => {
    const d = new Date(t.transaction_date);
    const i = keyIdx.get(`${d.getFullYear()}-${d.getMonth()}`);
    if (i === undefined) return;
    if (t.type === "income") buckets[i].income += Number(t.amount);
    else buckets[i].expense += Number(t.amount);
  });
  const maxBar = Math.max(...buckets.flatMap(b => [b.income, b.expense]), 1);

  // توزيع الأصول
  const catTotals = new Map<string, number>();
  (assets || []).forEach(a => catTotals.set(a.category || "other", (catTotals.get(a.category || "other") || 0) + Number(a.valuation || 0)));
  const totalAssetsVal = [...catTotals.values()].reduce((s, v) => s + v, 0);

  // مؤشرات
  const totalIncome = (transactions || []).filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = (transactions || []).filter(t => t.type !== "income").reduce((s, t) => s + Number(t.amount), 0);
  const efficiency = totalIncome > 0 ? Math.max(0, 100 - (totalExpense / totalIncome) * 100) : 100;
  const openTasks = (tasks || []).filter(t => t.status === "open").length;
  const doneTasks = (tasks || []).filter(t => t.status !== "open").length;
  const taskRate = tasks && tasks.length > 0 ? Math.round((doneTasks / tasks.length) * 100) : 100;
  const invVal = (investments || []).filter(i => i.status === "active").reduce((s, i) => s + Number(i.valuation || 0), 0);
  const wallets = (beneficiaries || []).reduce((s, b) => s + Number(b.wallet_balance || 0), 0);

  const kpis = [
    { label: "كفاءة التشغيل (صافي/إيراد)", value: `${efficiency.toFixed(0)}٪`, color: "#8561AD" },
    { label: "معدل إنجاز المهام", value: `${taskRate}٪`, color: "#10B981" },
    { label: "مهام مفتوحة", value: openTasks, color: "#F59E0B" },
    { label: "قيمة الاستثمارات النشطة", value: `${Math.round(invVal).toLocaleString()} ر.س`, color: "#3B82F6" },
    { label: "أرصدة محافظ المستفيدين", value: `${Math.round(wallets).toLocaleString()} ر.س`, color: "#0D9488" },
  ];

  return (
    <div className="fade-in">
      <div className={styles.header}>
        <div className={styles.titleInfo}>
          <h1>التحليلات والإحصائيات</h1>
          <p>مؤشرات الأداء المالي وكفاءة التشغيل — من بيانات النظام الفعلية.</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "1rem", marginTop: "1.5rem" }}>
        {kpis.map(s => (
          <div key={s.label} className="glass-card" style={{ padding: "1rem 1.25rem", borderTop: `3px solid ${s.color}` }}>
            <div style={{ fontSize: "1.2rem", fontWeight: 800 }}>{s.value}</div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="glass-card" style={{ padding: "1.5rem", marginTop: "1.5rem" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#8561AD", marginBottom: "1rem" }}>📊 الإيرادات مقابل المصروفات — آخر 12 شهراً</h3>
        <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", height: "180px" }}>
          {buckets.map((b, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: "3px", height: "150px" }}>
                <div title={`إيراد: ${Math.round(b.income).toLocaleString()}`} style={{ width: 12, height: `${(b.income / maxBar) * 150}px`, minHeight: 2, background: "linear-gradient(180deg,#34D399,#059669)", borderRadius: "3px 3px 0 0" }} />
                <div title={`مصروف: ${Math.round(b.expense).toLocaleString()}`} style={{ width: 12, height: `${(b.expense / maxBar) * 150}px`, minHeight: 2, background: "linear-gradient(180deg,#F87171,#DC2626)", borderRadius: "3px 3px 0 0" }} />
              </div>
              <span style={{ fontSize: "0.62rem", color: "var(--text-muted)", marginTop: 4 }}>{b.label}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: "1.5rem", justifyContent: "center", marginTop: "0.75rem", fontSize: "0.78rem", color: "var(--text-muted)" }}>
          <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 3, background: "#059669", marginLeft: 5 }} />الإيرادات</span>
          <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 3, background: "#DC2626", marginLeft: 5 }} />المصروفات والتوزيعات</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem", marginTop: "1.5rem" }}>
        <div className="glass-card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#8561AD", marginBottom: "1rem" }}>🏛️ توزيع قيمة الأصول حسب التصنيف</h3>
          {[...catTotals.entries()].map(([cat, val]) => (
            <div key={cat} style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.6rem", fontSize: "0.85rem" }}>
              <span style={{ width: 90, color: "var(--text-main)" }}>{CAT_AR[cat] || cat}</span>
              <div style={{ flex: 1, background: "#F1F5F9", borderRadius: 6, height: 14, overflow: "hidden" }}>
                <div style={{ width: `${totalAssetsVal > 0 ? (val / totalAssetsVal) * 100 : 0}%`, height: "100%", background: "#8561AD", borderRadius: 6 }} />
              </div>
              <span style={{ width: 110, textAlign: "left", fontWeight: 700, fontSize: "0.78rem" }}>{totalAssetsVal > 0 ? ((val / totalAssetsVal) * 100).toFixed(1) : 0}٪</span>
            </div>
          ))}
          {catTotals.size === 0 && <p style={{ color: "var(--text-muted)", textAlign: "center" }}>لا توجد أصول</p>}
        </div>

        <div className="glass-card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#8561AD", marginBottom: "1rem" }}>⚖️ توزيع مخاطر الاستثمارات</h3>
          {(["low", "medium", "high"] as const).map(rk => {
            const val = (investments || []).filter(i => i.risk_level === rk && i.status === "active").reduce((s, i) => s + Number(i.valuation || 0), 0);
            const color = rk === "low" ? "#10B981" : rk === "medium" ? "#F59E0B" : "#EF4444";
            const label = rk === "low" ? "منخفض" : rk === "medium" ? "متوسط" : "مرتفع";
            return (
              <div key={rk} style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.6rem", fontSize: "0.85rem" }}>
                <span style={{ width: 90, color: "var(--text-main)" }}>{label}</span>
                <div style={{ flex: 1, background: "#F1F5F9", borderRadius: 6, height: 14, overflow: "hidden" }}>
                  <div style={{ width: `${invVal > 0 ? (val / invVal) * 100 : 0}%`, height: "100%", background: color, borderRadius: 6 }} />
                </div>
                <span style={{ width: 110, textAlign: "left", fontWeight: 700, fontSize: "0.78rem" }}>{Math.round(val).toLocaleString()} ر.س</span>
              </div>
            );
          })}
          {(investments || []).length === 0 && <p style={{ color: "var(--text-muted)", textAlign: "center" }}>لا توجد استثمارات</p>}
        </div>
      </div>
    </div>
  );
}
