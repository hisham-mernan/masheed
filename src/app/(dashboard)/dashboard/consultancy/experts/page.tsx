import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import ModuleForm from "@/components/dashboard/ModuleForm";
import StatusButtons from "@/components/dashboard/StatusButtons";
import { addExpert, toggleExpertAvailability } from "@/app/actions";
import styles from "../../assets/assets.module.css";

const TYPE_AR: Record<string, { label: string; icon: string }> = {
  sharia: { label: "شرعي", icon: "🕌" },
  legal: { label: "قانوني", icon: "⚖️" },
  financial: { label: "مالي", icon: "💰" },
  technical: { label: "فني", icon: "🛠️" },
};

export default async function ExpertsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("is_platform_admin").eq("id", user?.id).single();
  const isPlatformAdmin = !!profile?.is_platform_admin;

  const { data: experts } = await supabase.from("experts").select("*").order("rating", { ascending: false });

  return (
    <div className="fade-in">
      <div className={styles.header}>
        <div className={styles.titleInfo}>
          <h1>دليل مستشاري الأوقاف</h1>
          <p>الخبراء والمستشارون المعتمدون في الشؤون الشرعية والقانونية والمالية والفنية للأوقاف.</p>
        </div>
        <div className={styles.actions}>
          <Link href="/dashboard/consultancy" className={styles.secBtn} style={{ textDecoration: "none" }}>طلبات الاستشارة ←</Link>
          {isPlatformAdmin && (
            <ModuleForm
              action={addExpert}
              triggerLabel="إضافة خبير +"
              fields={[
                { name: "name", label: "اسم الخبير", required: true },
                { name: "type", label: "التخصص", type: "select", required: true, options: Object.entries(TYPE_AR).map(([value, t]) => ({ value, label: t.label })) },
                { name: "specialty", label: "وصف التخصص", required: true },
                { name: "rating", label: "التقييم (1-5)", type: "number", step: "0.1" },
                { name: "bio", label: "نبذة", type: "textarea" },
              ]}
            />
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))", gap: "1.25rem", marginTop: "2rem" }}>
        {experts && experts.length > 0 ? experts.map(e => {
          const t = TYPE_AR[e.type] || TYPE_AR.sharia;
          return (
            <div key={e.id} className="glass-card" style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", gap: "0.9rem", alignItems: "center" }}>
                  <div style={{ width: 46, height: 46, borderRadius: "12px", background: "linear-gradient(135deg, #8561AD, #6B46A0)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.15rem", flexShrink: 0 }}>
                    {t.icon}
                  </div>
                  <div>
                    <strong>{e.name}</strong>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{t.label} · ⭐ {Number(e.rating).toFixed(1)}</div>
                  </div>
                </div>
                <span style={{ fontSize: "0.72rem", fontWeight: 700, padding: "0.2rem 0.55rem", borderRadius: "6px", background: e.available ? "#F0FDF4" : "#FEF2F2", color: e.available ? "#15803D" : "#DC2626" }}>
                  {e.available ? "متاح" : "غير متاح"}
                </span>
              </div>
              <p style={{ fontSize: "0.85rem", color: "var(--text-main)", marginTop: "0.85rem" }}>{e.specialty}</p>
              {e.bio && <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.35rem" }}>{e.bio}</p>}
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem", alignItems: "center" }}>
                {e.available && (
                  <Link href={`/dashboard/consultancy?expert=${encodeURIComponent(e.name)}`} className="btn-outline" style={{ textDecoration: "none", fontSize: "0.8rem" }}>
                    طلب استشارة معه ←
                  </Link>
                )}
                {isPlatformAdmin && (
                  <StatusButtons id={e.id} action={toggleExpertAvailability as any} options={[{ value: String(!e.available), label: e.available ? "إيقاف التاحة" : "تفعيل", danger: e.available }]} />
                )}
              </div>
            </div>
          );
        }) : (
          <div className="glass-card" style={{ padding: "2.5rem", textAlign: "center", color: "var(--text-muted)", gridColumn: "1/-1" }}>
            لا يوجد خبراء في الدليل بعد.
          </div>
        )}
      </div>
    </div>
  );
}
