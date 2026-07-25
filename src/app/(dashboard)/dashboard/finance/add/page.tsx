import { createClient } from "@/lib/supabase/server";
import { addTransaction } from "@/app/actions";

export default async function AddTransactionPage() {
  const supabase = await createClient();
  const { data: assets } = await supabase.from("assets").select("id, name");

  return (
    <div className="fade-in" style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", marginBottom: "0.5rem", color: "var(--text-main)" }}>تسجيل معاملة مالية جديدة</h1>
        <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>إضافة إيرادات (إيجارات، عوائد) أو مصروفات (صيانة، إدارة) للأصول الوقفية.</p>
      </div>

      <div className="glass-card" style={{ padding: "2rem" }}>
        <form action={addTransaction} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label style={{ fontWeight: 600, color: "var(--text-main)" }}>نوع المعاملة</label>
            <select name="type" required style={{ padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--border-color)", background: "var(--bg-main)", color: "var(--text-main)" }}>
              <option value="income">إيراد (Ri'a) - إيجار، أرباح أسهم</option>
              <option value="expense">مصروف (Asl) - صيانة، تشغيل</option>
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label style={{ fontWeight: 600, color: "var(--text-main)" }}>المبلغ (ر.س)</label>
            <input type="number" name="amount" required min="1" style={{ padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--border-color)", background: "var(--bg-main)", color: "var(--text-main)" }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label style={{ fontWeight: 600, color: "var(--text-main)" }}>الأصل المرتبط (اختياري)</label>
            <select name="asset_id" style={{ padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--border-color)", background: "var(--bg-main)", color: "var(--text-main)" }}>
              <option value="">-- عام (بدون أصل محدد) --</option>
              {assets?.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label style={{ fontWeight: 600, color: "var(--text-main)" }}>وصف المعاملة</label>
            <input type="text" name="description" required placeholder="مثال: إيجار محلات شهر مايو" style={{ padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--border-color)", background: "var(--bg-main)", color: "var(--text-main)" }} />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1rem" }}>
            <a href="/dashboard/finance" className="btn-outline" style={{ textDecoration: 'none' }}>إلغاء</a>
            <button type="submit" className="btn-primary">تسجيل المعاملة</button>
          </div>
        </form>
      </div>
    </div>
  );
}
