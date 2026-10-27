import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProfileForms from "@/components/dashboard/ProfileForms";
import AccountForm from "@/components/platform/AccountForm";
import { getAccountContext } from "@/lib/account";

const ROLE_AR: Record<string, string> = { admin: "مدير النظام", supervisor: "مشرف", auditor: "مراقب مالي", viewer: "قارئ فقط" };

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ need?: string }> }) {
  const { need } = await searchParams;
  const account = (await getAccountContext())?.account;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, created_at, waqfs(name, type, total_shares)")
    .eq("id", user.id)
    .single();

  return (
    <div className="fade-in" style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.75rem", marginBottom: "2rem", color: "var(--text-main)" }}>الملف الشخصي</h1>

      {account && (
        <div className="glass-card" style={{ padding: "2rem", marginBottom: "1.5rem" }}>
          <h3 style={{ marginTop: 0 }}>بيانات الجهة</h3>
          {need === "phone" && <p style={{ color: "#B45309", fontWeight: 600 }}>أضف رقم الجوال لإتمام الطلب.</p>}
          <AccountForm name={account.name} phone={account.phone || ""} />
        </div>
      )}

      <div className="glass-card" style={{ padding: "2rem", marginBottom: "1.5rem" }}>
        <h3 style={{ marginTop: 0 }}>بيانات الحساب</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
          <div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>البريد الإلكتروني</div>
            <div style={{ fontWeight: 600 }}>{user.email}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>الصلاحية</div>
            <div style={{ fontWeight: 600 }}>{ROLE_AR[profile?.role || ""] || profile?.role}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>الوقف المرتبط</div>
            <div style={{ fontWeight: 600 }}>{(profile?.waqfs as any)?.name || "—"}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>عضو منذ</div>
            <div style={{ fontWeight: 600 }}>{profile?.created_at ? new Date(profile.created_at).toLocaleDateString("ar-SA") : "—"}</div>
          </div>
        </div>
        <ProfileForms currentName={profile?.full_name || ""} />
      </div>
    </div>
  );
}
