import { createClient } from "@/lib/supabase/server";
import { getWaqfScope, scopeQuery } from "@/lib/waqf-scope";
import ModuleForm from "@/components/dashboard/ModuleForm";
import StatusButtons from "@/components/dashboard/StatusButtons";
import { addContract, setContractStatus } from "@/app/actions";
import styles from "../assets/assets.module.css";

const STATUS_AR: Record<string, { label: string; color: string; bg: string }> = {
  active: { label: "نشط", color: "#15803D", bg: "#F0FDF4" },
  expired: { label: "منتهي", color: "#64748B", bg: "#F1F5F9" },
  suspended: { label: "معلق", color: "#DC2626", bg: "#FEF2F2" },
};

export default async function ContractsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("role, is_platform_admin").eq("id", user?.id).single();
  const canWrite = ["admin", "supervisor"].includes(profile?.role || "");
  const scope = profile?.is_platform_admin ? await getWaqfScope() : null;

  const [{ data: contracts }, { data: assets }] = await Promise.all([
    scopeQuery(supabase.from("contracts").select("*, assets(name)"), scope).order("end_date", { ascending: true }),
    scopeQuery(supabase.from("assets").select("id, name"), scope),
  ]);

  const now = new Date();
  const soon = new Date(now.getTime() + 90 * 86400000);
  const activeContracts = (contracts || []).filter(c => c.status === "active");
  const expiringSoon = activeContracts.filter(c => c.end_date && new Date(c.end_date) <= soon && new Date(c.end_date) >= now);
  const totalRent = activeContracts.reduce((s, c) => s + Number(c.annual_rent || 0), 0);

  return (
    <div className="fade-in">
      <div className={styles.header}>
        <div className={styles.titleInfo}>
          <h1>عقود الإيجار والاستثمار</h1>
          <p>تتبع عقود المستأجرين ومواعيد التجديد والقيم الإيجارية لكل أصل.</p>
        </div>
        <div className={styles.actions}>
          {canWrite && (
            <ModuleForm
              action={addContract}
              triggerLabel="تسجيل عقد +"
              fields={[
                { name: "counterparty", label: "المستأجر / الطرف الثاني", required: true },
                { name: "asset_id", label: "الأصل المستأجر", type: "select", options: (assets || []).map(a => ({ value: a.id, label: a.name })) },
                { name: "start_date", label: "بداية العقد", type: "date", required: true },
                { name: "end_date", label: "نهاية العقد", type: "date", required: true },
                { name: "annual_rent", label: "الإيجار السنوي (ر.س)", type: "number", required: true, step: "any" },
              ]}
            />
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", marginTop: "1.5rem" }}>
        {[
          { label: "عقود نشطة", value: activeContracts.length, color: "#10B981" },
          { label: "تنتهي خلال 90 يوماً", value: expiringSoon.length, color: "#F59E0B" },
          { label: "إجمالي الإيجار السنوي", value: `${Math.round(totalRent).toLocaleString()} ر.س`, color: "#8561AD" },
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
            <tr><th>الرمز</th><th>المستأجر / الطرف الثاني</th><th>الأصل</th><th>البداية</th><th>النهاية</th><th>الإيجار السنوي</th><th>الحالة</th>{canWrite && <th>إجراء</th>}</tr>
          </thead>
          <tbody>
            {contracts && contracts.length > 0 ? contracts.map(c => {
              const st = STATUS_AR[c.status] || STATUS_AR.active;
              const expiring = c.status === "active" && c.end_date && new Date(c.end_date) <= soon && new Date(c.end_date) >= now;
              return (
                <tr key={c.id}>
                  <td><code className={styles.code}>{c.id.split("-")[0]}</code></td>
                  <td><strong>{c.counterparty}</strong></td>
                  <td>{(c.assets as any)?.name || "—"}</td>
                  <td>{c.start_date ? new Date(c.start_date).toLocaleDateString("ar-SA") : "—"}</td>
                  <td style={{ color: expiring ? "#B45309" : undefined, fontWeight: expiring ? 700 : undefined }}>
                    {c.end_date ? new Date(c.end_date).toLocaleDateString("ar-SA") : "—"}
                    {expiring && <div style={{ fontSize: "0.7rem" }}>⏰ يقترب من الانتهاء</div>}
                  </td>
                  <td style={{ fontWeight: 700 }}>{Number(c.annual_rent).toLocaleString()} ر.س</td>
                  <td><span style={{ background: st.bg, color: st.color, padding: "0.2rem 0.55rem", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 700 }}>{st.label}</span></td>
                  {canWrite && (
                    <td>
                      {c.status === "active" && (
                        <StatusButtons id={c.id} action={setContractStatus} options={[
                          { value: "expired", label: "إنهاء" },
                          { value: "suspended", label: "تعليق", danger: true },
                        ]} />
                      )}
                      {c.status !== "active" && (
                        <StatusButtons id={c.id} action={setContractStatus} options={[{ value: "active", label: "تجديد/تفعيل" }]} />
                      )}
                    </td>
                  )}
                </tr>
              );
            }) : (
              <tr><td colSpan={8} style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>لا توجد عقود مسجلة بعد.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
