import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { getWaqfScope } from "@/lib/waqf-scope";
import WaqfSettingsForm from "@/components/dashboard/WaqfSettingsForm";
import styles from "../assets/assets.module.css";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("full_name, role, waqf_id, is_platform_admin").eq("id", user?.id).single();
  const scope = profile?.is_platform_admin ? await getWaqfScope() : null;
  const effectiveWaqfId = scope && scope !== "all" ? scope : profile?.waqf_id;

  const { data: waqf } = effectiveWaqfId
    ? await supabase.from("waqfs").select("id, name, total_shares, created_at").eq("id", effectiveWaqfId).single()
    : { data: null };

  const roleAr: Record<string, string> = { admin: "مدير النظام", supervisor: "مشرف", viewer: "مطالع" };
  const canEdit = profile?.role === "admin" || !!profile?.is_platform_admin;

  return (
    <div className="fade-in">
      <div className={styles.header}>
        <div className={styles.titleInfo}>
          <h1>الإعدادات</h1>
          <p>إعدادات الوقف والحساب والمنصة.</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "1.5rem", marginTop: "1.5rem" }}>
        <div className="glass-card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#8561AD", marginBottom: "1rem" }}>🏛️ إعدادات الوقف الحالي</h3>
          {waqf ? (
            canEdit ? (
              <WaqfSettingsForm defaultName={waqf.name} defaultShares={Number(waqf.total_shares || 0)} />
            ) : (
              <div style={{ fontSize: "0.88rem", display: "grid", gap: "0.5rem" }}>
                <div>الاسم: <strong>{waqf.name}</strong></div>
                <div>إجمالي الأسهم: <strong>{Number(waqf.total_shares || 0).toLocaleString()}</strong></div>
                <div style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>التعديل متاح للمدير فقط.</div>
              </div>
            )
          ) : (
            <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
              {scope === "all" ? "اختر وقفاً محدداً من مبدّل الأوقاف في القائمة الجانبية لتعديل إعداداته." : "لا يوجد وقف مرتبط بحسابك."}
            </p>
          )}
        </div>

        <div className="glass-card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#8561AD", marginBottom: "1rem" }}>👤 الحساب</h3>
          <div style={{ fontSize: "0.88rem", display: "grid", gap: "0.5rem" }}>
            <div>الاسم: <strong>{profile?.full_name || "—"}</strong></div>
            <div>البريد: <strong style={{ direction: "ltr", display: "inline-block" }}>{user?.email}</strong></div>
            <div>الدور: <strong>{roleAr[profile?.role || ""] || profile?.role}{profile?.is_platform_admin ? " · مدير منصة" : ""}</strong></div>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem", flexWrap: "wrap" }}>
            <Link href="/dashboard/profile" className="btn-outline" style={{ textDecoration: "none", fontSize: "0.82rem" }}>الملف الشخصي وكلمة المرور ←</Link>
            <Link href="/dashboard/compliance" className="btn-outline" style={{ textDecoration: "none", fontSize: "0.82rem" }}>إدارة المستخدمين ←</Link>
          </div>
        </div>

        <div className="glass-card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#8561AD", marginBottom: "1rem" }}>🌐 المنصة</h3>
          <div style={{ fontSize: "0.85rem", display: "grid", gap: "0.6rem", color: "var(--text-main)" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span>العملة الرئيسية</span><strong>ريال سعودي (SAR)</strong></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span>لغة الواجهة</span><strong>العربية</strong></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span>إصدار النظام</span><strong>Masheed ERP v1.0</strong></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span>سجل المراجعة</span><span style={{ color: "#15803D" }}>✓ مفعّل</span></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span>عزل بيانات الأوقاف (RLS)</span><span style={{ color: "#15803D" }}>✓ مفعّل</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
