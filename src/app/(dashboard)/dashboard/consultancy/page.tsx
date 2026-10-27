import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { getWaqfScope, scopeQuery } from "@/lib/waqf-scope";
import ModuleForm from "@/components/dashboard/ModuleForm";
import StatusButtons from "@/components/dashboard/StatusButtons";
import { addConsultation, setConsultationStatus } from "@/app/actions";
import styles from "../assets/assets.module.css";

const TYPE_AR: Record<string, { label: string; icon: string }> = {
  sharia: { label: "شرعية", icon: "🕌" },
  legal: { label: "قانونية", icon: "⚖️" },
  financial: { label: "مالية", icon: "💰" },
  technical: { label: "فنية", icon: "🛠️" },
};
const STATUS_AR: Record<string, { label: string; color: string; bg: string }> = {
  under_review: { label: "قيد المراجعة", color: "#B45309", bg: "#FFFBEB" },
  scheduled: { label: "مجدولة", color: "#1D4ED8", bg: "#EFF6FF" },
  resolved: { label: "تمت الإجابة", color: "#15803D", bg: "#F0FDF4" },
};

export default async function ConsultancyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("role, is_platform_admin").eq("id", user?.id).single();
  const canWrite = ["admin", "supervisor"].includes(profile?.role || "");
  const scope = profile?.is_platform_admin ? await getWaqfScope() : null;

  const { data: consultations } = await scopeQuery(
    supabase.from("consultations").select("*, profiles:created_by(full_name)"), scope
  ).order("created_at", { ascending: false });

  return (
    <div className="fade-in">
      <div className={styles.header}>
        <div className={styles.titleInfo}>
          <h1>الاستشارات الشرعية والقانونية</h1>
          <p>طلبات المراجعة الشرعية والقانونية والمالية لأوقافك ومتابعة توصيات المستشارين.</p>
        </div>
        <div className={styles.actions}>
          {canWrite && (
            <ModuleForm
              action={addConsultation}
              triggerLabel="طلب استشارة +"
              fields={[
                { name: "topic", label: "موضوع الاستشارة", required: true, placeholder: "مثال: تفسير بند الصرف التعليمي" },
                { name: "type", label: "نوع الاستشارة", type: "select", required: true, options: Object.entries(TYPE_AR).map(([value, t]) => ({ value, label: t.label })) },
                { name: "expert_name", label: "المستشار المستهدف (اختياري)" },
                { name: "notes", label: "تفاصيل إضافية", type: "textarea" },
              ]}
            />
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem", flexWrap: "wrap" }}>
        <Link href="/dashboard/consultancy" className={styles.secBtn} style={{ textDecoration: "none", fontWeight: 800 }}>📋 الطلبات</Link>
        <Link href="/dashboard/consultancy/experts" className={styles.secBtn} style={{ textDecoration: "none" }}>🎓 دليل الخبراء</Link>
        <Link href="/dashboard/consultancy/ai" className={styles.secBtn} style={{ textDecoration: "none" }}>🤖 المساعد الذكي</Link>
        <Link href="/dashboard/bookings/new" className={styles.secBtn} style={{ textDecoration: "none" }}>📅 احجز جلسة مرئية</Link>
      </div>

      <div className={`${styles.ledgerContainer} glass-card`} style={{ marginTop: "1.5rem" }}>
        <table className={styles.table}>
          <thead>
            <tr><th>الرمز</th><th>النوع</th><th>الموضوع</th><th>المستشار</th><th>مقدم الطلب</th><th>التاريخ</th><th>الحالة</th>{canWrite && <th>إجراء</th>}</tr>
          </thead>
          <tbody>
            {consultations && consultations.length > 0 ? consultations.map(c => {
              const t = TYPE_AR[c.type] || TYPE_AR.sharia;
              const st = STATUS_AR[c.status] || STATUS_AR.under_review;
              return (
                <tr key={c.id}>
                  <td><code className={styles.code}>{c.id.split("-")[0]}</code></td>
                  <td>{t.icon} {t.label}</td>
                  <td><strong>{c.topic}</strong>{c.notes && <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{c.notes}</div>}</td>
                  <td>{c.expert_name || "—"}</td>
                  <td style={{ fontSize: "0.8rem" }}>{(c.profiles as any)?.full_name || "—"}</td>
                  <td>{new Date(c.created_at).toLocaleDateString("ar-SA")}</td>
                  <td><span style={{ background: st.bg, color: st.color, padding: "0.2rem 0.55rem", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 700 }}>{st.label}</span></td>
                  {canWrite && (
                    <td>
                      <StatusButtons id={c.id} action={setConsultationStatus} options={[
                        ...(c.status === "under_review" ? [{ value: "scheduled", label: "جدولة" }] : []),
                        ...(c.status !== "resolved" ? [{ value: "resolved", label: "تمت الإجابة" }] : []),
                      ]} />
                    </td>
                  )}
                </tr>
              );
            }) : (
              <tr><td colSpan={8} style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>لا توجد طلبات استشارة بعد.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
