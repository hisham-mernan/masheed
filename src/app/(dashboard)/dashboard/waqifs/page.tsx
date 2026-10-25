import { createClient } from "@/lib/supabase/server";
import { getWaqfScope, scopeQuery } from "@/lib/waqf-scope";
import ModuleForm from "@/components/dashboard/ModuleForm";
import { addWaqif } from "@/app/actions";
import styles from "../assets/assets.module.css";

export default async function WaqifsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("role, is_platform_admin").eq("id", user?.id).single();
  const canWrite = ["admin", "supervisor"].includes(profile?.role || "");
  const scope = profile?.is_platform_admin ? await getWaqfScope() : null;

  const { data: waqifs } = await scopeQuery(
    supabase.from("waqifs").select("*, waqfs(name)"), scope
  ).order("created_at", { ascending: false });

  return (
    <div className="fade-in">
      <div className={styles.header}>
        <div className={styles.titleInfo}>
          <h1>الواقفون (مؤسسو الأوقاف)</h1>
          <p>توثيق بيانات مؤسسي الأوقاف وسيرتهم وشروطهم — حفاظاً على إرث الوقف وشرط الواقف.</p>
        </div>
        <div className={styles.actions}>
          {canWrite && (
            <ModuleForm
              action={addWaqif}
              triggerLabel="تسجيل واقف +"
              fields={[
                { name: "name", label: "اسم الواقف", required: true },
                { name: "founder_type", label: "نوع المؤسس", type: "select", required: true, options: [
                  { value: "individual", label: "فرد (Individual)" },
                  { value: "organization", label: "منظمة (Organization)" },
                ] },
                { name: "nationality", label: "الجنسية" },
                { name: "national_id", label: "رقم الهوية / السجل" },
                { name: "birth_date", label: "تاريخ الميلاد / التأسيس", type: "date" },
                { name: "relationship", label: "صلته بالوقف", placeholder: "مثال: المؤسس الرئيسي" },
                { name: "biography", label: "السيرة وشروط الواقف", type: "textarea" },
              ]}
            />
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.25rem", marginTop: "2rem" }}>
        {waqifs && waqifs.length > 0 ? waqifs.map(w => (
          <div key={w.id} className="glass-card" style={{ padding: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.9rem", marginBottom: "1rem" }}>
              <div style={{ width: 46, height: 46, borderRadius: "12px", background: "linear-gradient(135deg, #8561AD, #6B46A0)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", fontWeight: 700, flexShrink: 0 }}>
                {w.name?.substring(0, 1) || "؟"}
              </div>
              <div>
                <strong style={{ fontSize: "1rem" }}>{w.name}</strong>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  {w.founder_type === "organization" ? "منظمة" : "فرد"} · {w.status === "deceased" ? "متوفى" : "نشط"}
                </div>
              </div>
            </div>
            <div style={{ fontSize: "0.83rem", display: "grid", gap: "0.35rem", color: "var(--text-main)" }}>
              {w.nationality && <div>🌍 الجنسية: {w.nationality}</div>}
              {w.national_id && <div>🪪 الهوية: {w.national_id}</div>}
              {w.birth_date && <div>📅 {new Date(w.birth_date).toLocaleDateString("ar-SA")}</div>}
              {w.relationship && <div>🔗 {w.relationship}</div>}
              {(w.waqfs as any)?.name && <div>🏛️ الوقف: {(w.waqfs as any).name}</div>}
            </div>
            {w.biography && (
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.75rem", lineHeight: 1.7, borderTop: "1px dashed var(--color-border, #E4E7EF)", paddingTop: "0.75rem" }}>
                {w.biography}
              </p>
            )}
          </div>
        )) : (
          <div className="glass-card" style={{ padding: "2.5rem", textAlign: "center", color: "var(--text-muted)", gridColumn: "1/-1" }}>
            لا يوجد واقفون مسجلون بعد. وثّق بيانات مؤسس الوقف وشروطه.
          </div>
        )}
      </div>
    </div>
  );
}
