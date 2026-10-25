import { createClient } from "@/lib/supabase/server";
import { getWaqfScope, scopeQuery } from "@/lib/waqf-scope";
import ModuleForm from "@/components/dashboard/ModuleForm";
import StatusButtons from "@/components/dashboard/StatusButtons";
import { addDecision, decideDecision } from "@/app/actions";
import styles from "../assets/assets.module.css";

const TYPE_AR: Record<string, string> = {
  asset_sale: "بيع أصل", budget: "ميزانية", distribution: "توزيع ريع",
  appointment: "تعيين", policy: "سياسة", other: "أخرى",
};
const STATUS_AR: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "بانتظار الاعتماد", color: "#B45309", bg: "#FFFBEB" },
  approved: { label: "معتمد", color: "#15803D", bg: "#F0FDF4" },
  rejected: { label: "مرفوض", color: "#DC2626", bg: "#FEF2F2" },
};

export default async function GovernancePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("role, is_platform_admin").eq("id", user?.id).single();
  const canWrite = ["admin", "supervisor"].includes(profile?.role || "");
  const scope = profile?.is_platform_admin ? await getWaqfScope() : null;

  const [{ data: decisions }, { data: meetings }] = await Promise.all([
    scopeQuery(supabase.from("decisions").select("*, meetings(title), creator:created_by(full_name), decider:decided_by(full_name)"), scope).order("created_at", { ascending: false }),
    scopeQuery(supabase.from("meetings").select("id, title, committee, meeting_date, status"), scope).order("meeting_date", { ascending: false }).limit(20),
  ]);

  const pending = (decisions || []).filter(d => d.status === "pending").length;
  const approved = (decisions || []).filter(d => d.status === "approved").length;
  const documented = (meetings || []).filter(m => m.status === "documented").length;
  const govScore = decisions && decisions.length > 0 ? Math.round((approved / decisions.length) * 100) : 100;

  return (
    <div className="fade-in">
      <div className={styles.header}>
        <div className={styles.titleInfo}>
          <h1>الحوكمة وسجل القرارات</h1>
          <p>توثيق قرارات مجالس النظارة واللجان مع المبررات وتحليل الأثر — بمبدأ Maker–Checker.</p>
        </div>
        <div className={styles.actions}>
          {canWrite && (
            <ModuleForm
              action={addDecision}
              triggerLabel="تسجيل قرار +"
              fields={[
                { name: "title", label: "عنوان القرار", required: true, placeholder: "مثال: بيع المبنى القديم بحي الروضة" },
                { name: "type", label: "نوع القرار", type: "select", required: true, options: Object.entries(TYPE_AR).map(([value, label]) => ({ value, label })) },
                { name: "meeting_id", label: "الاجتماع المرتبط", type: "select", options: (meetings || []).map(m => ({ value: m.id, label: `${m.title} (${new Date(m.meeting_date).toLocaleDateString("ar-SA")})` })) },
                { name: "description", label: "الوصف", type: "textarea" },
                { name: "reason", label: "المبررات", type: "textarea" },
                { name: "impact_analysis", label: "تحليل الأثر", type: "textarea", placeholder: "الأثر على الإيرادات والمستفيدين وشروط الواقف" },
              ]}
            />
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", marginTop: "1.5rem" }}>
        {[
          { label: "مؤشر الحوكمة", value: `${govScore}٪`, color: "#8561AD" },
          { label: "قرارات بانتظار الاعتماد", value: pending, color: "#F59E0B" },
          { label: "قرارات معتمدة", value: approved, color: "#10B981" },
          { label: "اجتماعات موثقة", value: documented, color: "#3B82F6" },
        ].map(s => (
          <div key={s.label} className="glass-card" style={{ padding: "1rem 1.25rem", borderTop: `3px solid ${s.color}` }}>
            <div style={{ fontSize: "1.3rem", fontWeight: 800 }}>{s.value}</div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className={`${styles.ledgerContainer} glass-card`} style={{ marginTop: "1.5rem" }}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>القرار</th><th>النوع</th><th>الاجتماع</th><th>المبررات والأثر</th><th>أنشأه</th><th>الحالة</th>{canWrite && <th>اعتماد</th>}
            </tr>
          </thead>
          <tbody>
            {decisions && decisions.length > 0 ? decisions.map(d => {
              const st = STATUS_AR[d.status] || STATUS_AR.pending;
              return (
                <tr key={d.id}>
                  <td><strong>{d.title}</strong>{d.description && <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{d.description}</div>}</td>
                  <td>{TYPE_AR[d.type] || d.type}</td>
                  <td>{(d.meetings as any)?.title || "—"}</td>
                  <td style={{ maxWidth: "260px" }}>
                    {d.reason && <div style={{ fontSize: "0.78rem" }}>📌 {d.reason}</div>}
                    {d.impact_analysis && <div style={{ fontSize: "0.78rem", color: "#B45309" }}>⚠️ {d.impact_analysis}</div>}
                  </td>
                  <td style={{ fontSize: "0.8rem" }}>{(d.creator as any)?.full_name || "—"}</td>
                  <td>
                    <span style={{ background: st.bg, color: st.color, padding: "0.2rem 0.55rem", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 700 }}>{st.label}</span>
                    {d.status !== "pending" && (d.decider as any)?.full_name && (
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>بواسطة {(d.decider as any).full_name}</div>
                    )}
                  </td>
                  {canWrite && (
                    <td>
                      {d.status === "pending" && (
                        <StatusButtons id={d.id} action={decideDecision} options={[
                          { value: "approved", label: "اعتماد" },
                          { value: "rejected", label: "رفض", danger: true },
                        ]} />
                      )}
                    </td>
                  )}
                </tr>
              );
            }) : (
              <tr><td colSpan={7} style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                لا توجد قرارات مسجلة بعد. سجّل أول قرار لمجلس النظارة.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
