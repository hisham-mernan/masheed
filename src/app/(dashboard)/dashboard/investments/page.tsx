import { createClient } from "@/lib/supabase/server";
import { getWaqfScope, scopeQuery } from "@/lib/waqf-scope";
import ModuleForm from "@/components/dashboard/ModuleForm";
import StatusButtons from "@/components/dashboard/StatusButtons";
import { addInvestment, setInvestmentStatus } from "@/app/actions";
import styles from "../assets/assets.module.css";

const TYPE_AR: Record<string, string> = { fund: "صناديق استثمارية", sukuk: "صكوك دين", stocks: "أسهم عامة", deposit: "ودائع", other: "أخرى" };
const RISK_AR: Record<string, { label: string; color: string }> = {
  low: { label: "منخفض", color: "#10B981" },
  medium: { label: "متوسط", color: "#F59E0B" },
  high: { label: "مرتفع", color: "#EF4444" },
};
const STATUS_AR: Record<string, string> = { active: "نشط", exited: "مُتخارج منه", suspended: "معلق" };

export default async function InvestmentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("role, is_platform_admin").eq("id", user?.id).single();
  const canWrite = ["admin", "supervisor"].includes(profile?.role || "");
  const scope = profile?.is_platform_admin ? await getWaqfScope() : null;

  const { data: investments } = await scopeQuery(
    supabase.from("investments").select("*"), scope
  ).order("created_at", { ascending: false });

  const active = (investments || []).filter(i => i.status === "active");
  const totalVal = active.reduce((s, i) => s + Number(i.valuation || 0), 0);
  const weightedReturn = totalVal > 0
    ? active.reduce((s, i) => s + Number(i.valuation || 0) * Number(i.expected_return || 0), 0) / totalVal
    : 0;

  return (
    <div className="fade-in">
      <div className={styles.header}>
        <div className={styles.titleInfo}>
          <h1>محافظ الاستثمار الوقفية</h1>
          <p>إدارة المحافظ والصكوك والأدوات المالية المستثمرة لتعظيم ريع الأوقاف.</p>
        </div>
        <div className={styles.actions}>
          {canWrite && (
            <ModuleForm
              action={addInvestment}
              triggerLabel="إضافة استثمار +"
              fields={[
                { name: "name", label: "اسم المحفظة / الأداة", required: true, placeholder: "مثال: صندوق الإنماء العقاري" },
                { name: "type", label: "التصنيف", type: "select", required: true, options: Object.entries(TYPE_AR).map(([value, label]) => ({ value, label })) },
                { name: "valuation", label: "القيمة الحالية (ر.س)", type: "number", required: true, step: "any" },
                { name: "expected_return", label: "العائد المتوقع % سنوي", type: "number", step: "any" },
                { name: "risk_level", label: "مستوى المخاطر", type: "select", required: true, options: Object.entries(RISK_AR).map(([value, r]) => ({ value, label: r.label })) },
              ]}
            />
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", marginTop: "1.5rem" }}>
        {[
          { label: "إجمالي المحافظ النشطة", value: `${Math.round(totalVal).toLocaleString()} ر.س`, color: "#8561AD" },
          { label: "العائد المتوقع المرجّح", value: `${weightedReturn.toFixed(1)}٪`, color: "#10B981" },
          { label: "عدد الاستثمارات", value: active.length, color: "#3B82F6" },
        ].map(s => (
          <div key={s.label} className="glass-card" style={{ padding: "1rem 1.25rem", borderTop: `3px solid ${s.color}` }}>
            <div style={{ fontSize: "1.2rem", fontWeight: 800 }}>{s.value}</div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className={`${styles.ledgerContainer} glass-card`} style={{ marginTop: "1.5rem" }}>
        <table className={styles.table}>
          <thead>
            <tr><th>الرمز</th><th>اسم المحفظة / الأداة</th><th>التصنيف</th><th>القيمة الحالية</th><th>العائد المتوقع</th><th>المخاطر</th><th>الحالة</th>{canWrite && <th>إجراء</th>}</tr>
          </thead>
          <tbody>
            {investments && investments.length > 0 ? investments.map(inv => {
              const risk = RISK_AR[inv.risk_level] || RISK_AR.low;
              return (
                <tr key={inv.id}>
                  <td><code className={styles.code}>{inv.id.split("-")[0]}</code></td>
                  <td><strong>{inv.name}</strong></td>
                  <td>{TYPE_AR[inv.type] || inv.type}</td>
                  <td style={{ fontWeight: 700 }}>{Number(inv.valuation).toLocaleString()} ر.س</td>
                  <td style={{ color: "#10B981", fontWeight: 700 }}>{inv.expected_return ? `${inv.expected_return}٪ سنوي` : "—"}</td>
                  <td><span style={{ color: risk.color, fontWeight: 700 }}>{risk.label}</span></td>
                  <td>{STATUS_AR[inv.status] || inv.status}</td>
                  {canWrite && (
                    <td>
                      {inv.status === "active" && (
                        <StatusButtons id={inv.id} action={setInvestmentStatus} options={[
                          { value: "exited", label: "تخارج" },
                          { value: "suspended", label: "تعليق", danger: true },
                        ]} />
                      )}
                      {inv.status === "suspended" && (
                        <StatusButtons id={inv.id} action={setInvestmentStatus} options={[{ value: "active", label: "إعادة تفعيل" }]} />
                      )}
                    </td>
                  )}
                </tr>
              );
            }) : (
              <tr><td colSpan={8} style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>لا توجد استثمارات مسجلة بعد.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
