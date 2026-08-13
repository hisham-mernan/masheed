import { addUserProfile } from "@/app/actions";

export default async function AddUserPage() {
  return (
    <div className="fade-in" style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", marginBottom: "0.5rem", color: "var(--text-main)" }}>إضافة مستخدم لنظام الوقف</h1>
        <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>إعطاء صلاحية دخول لمستخدم جديد لتمكينه من الدخول للنظام بنفس الوقف الخاص بك.</p>
      </div>

      <div className="glass-card" style={{ padding: "2rem" }}>
        <form action={addUserProfile} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label style={{ fontWeight: 600, color: "var(--text-main)" }}>اسم المستخدم الكامل</label>
            <input type="text" name="full_name" required placeholder="مثال: أحمد خالد" style={{ padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--border-color)", background: "var(--bg-main)", color: "var(--text-main)" }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label style={{ fontWeight: 600, color: "var(--text-main)" }}>الصلاحية (Role)</label>
            <select name="role" required style={{ padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--border-color)", background: "var(--bg-main)", color: "var(--text-main)" }}>
              <option value="viewer">قارئ فقط (للاطلاع على التقارير)</option>
              <option value="auditor">مراقب مالي (مراجعة العمليات)</option>
              <option value="supervisor">مشرف (إضافة وتعديل بيانات)</option>
              <option value="admin">مدير نظام (صلاحيات كاملة)</option>
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label style={{ fontWeight: 600, color: "var(--text-main)" }}>البريد الإلكتروني للمستخدم</label>
            <input type="email" name="email" required placeholder="user@example.com" style={{ padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--border-color)", background: "var(--bg-main)", color: "var(--text-main)" }} />
            <small style={{ color: 'var(--text-muted)', marginTop: '0.5rem', display: 'block' }}>ملاحظة ديمو: حالياً سيتم إنشاء Profile شكلي فقط كعرض (لأن إنشاء كلمة مرور يتطلب الـ Auth API من طرف الواجهة).</small>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1rem" }}>
            <a href="/dashboard/compliance" className="btn-outline" style={{ textDecoration: 'none' }}>إلغاء</a>
            <button type="submit" className="btn-primary">إضافة المستخدم</button>
          </div>
        </form>
      </div>
    </div>
  );
}
