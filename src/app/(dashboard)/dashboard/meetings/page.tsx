import { createClient } from "@/lib/supabase/server";
import { getWaqfScope, scopeQuery } from "@/lib/waqf-scope";
import ModuleForm from "@/components/dashboard/ModuleForm";
import StatusButtons from "@/components/dashboard/StatusButtons";
import { addMeeting, setMeetingStatus } from "@/app/actions";
import styles from "../assets/assets.module.css";

const STATUS_AR: Record<string, { label: string; color: string; bg: string }> = {
  scheduled: { label: "مجدول", color: "#1D4ED8", bg: "#EFF6FF" },
  in_voting: { label: "قيد التصويت", color: "#B45309", bg: "#FFFBEB" },
  documented: { label: "تم التوثيق", color: "#15803D", bg: "#F0FDF4" },
};

export default async function MeetingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("role, is_platform_admin").eq("id", user?.id).single();
  const canWrite = ["admin", "supervisor"].includes(profile?.role || "");
  const scope = profile?.is_platform_admin ? await getWaqfScope() : null;

  const { data: meetings } = await scopeQuery(
    supabase.from("meetings").select("*, decisions(id, status)"), scope
  ).order("meeting_date", { ascending: false });

  return (
    <div className="fade-in">
      <div className={styles.header}>
        <div className={styles.titleInfo}>
          <h1>اجتماعات المجالس واللجان</h1>
          <p>توثيق محاضر الاجتماعات ومتابعة التصويت على القرارات وربطها بسجل الحوكمة.</p>
        </div>
        <div className={styles.actions}>
          {canWrite && (
            <ModuleForm
              action={addMeeting}
              triggerLabel="جدولة اجتماع +"
              fields={[
                { name: "title", label: "اسم الاجتماع", required: true, placeholder: "مثال: الجمعية العمومية السنوية" },
                { name: "committee", label: "اللجنة / المجلس", placeholder: "مثال: مجلس النظارة الموحد" },
                { name: "meeting_date", label: "تاريخ الانعقاد", type: "date", required: true },
                { name: "quorum_pct", label: "النصاب %", type: "number" },
                { name: "notes", label: "ملاحظات", type: "textarea" },
              ]}
            />
          )}
        </div>
      </div>

      <div className={`${styles.ledgerContainer} glass-card`} style={{ marginTop: "2rem" }}>
        <table className={styles.table}>
          <thead>
            <tr><th>الاجتماع</th><th>اللجنة / المجلس</th><th>التاريخ</th><th>النصاب</th><th>القرارات</th><th>الحالة</th>{canWrite && <th>إجراء</th>}</tr>
          </thead>
          <tbody>
            {meetings && meetings.length > 0 ? meetings.map(m => {
              const st = STATUS_AR[m.status] || STATUS_AR.scheduled;
              const decs = (m.decisions as any[]) || [];
              return (
                <tr key={m.id}>
                  <td><strong>{m.title}</strong>{m.notes && <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{m.notes}</div>}</td>
                  <td>{m.committee || "—"}</td>
                  <td>{new Date(m.meeting_date).toLocaleDateString("ar-SA")}</td>
                  <td>{m.quorum_pct ? `${m.quorum_pct}٪` : "—"}</td>
                  <td>{decs.length > 0 ? `${decs.filter(d => d.status === "approved").length}/${decs.length} معتمد` : "—"}</td>
                  <td><span style={{ background: st.bg, color: st.color, padding: "0.2rem 0.55rem", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 700 }}>{st.label}</span></td>
                  {canWrite && (
                    <td>
                      <StatusButtons id={m.id} action={setMeetingStatus} options={[
                        ...(m.status === "scheduled" ? [{ value: "in_voting", label: "بدء التصويت" }] : []),
                        ...(m.status !== "documented" ? [{ value: "documented", label: "توثيق" }] : []),
                      ]} />
                    </td>
                  )}
                </tr>
              );
            }) : (
              <tr><td colSpan={7} style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>لا توجد اجتماعات مجدولة.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
