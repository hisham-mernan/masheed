"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addAsset } from "@/app/actions";

export default function AddAssetPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await addAsset(formData);
    setIsLoading(false);
    
    if (res?.error) {
      alert("خطأ: " + res.error);
    } else {
      router.push("/dashboard/assets");
    }
  }

  return (
    <div className="fade-in" style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.75rem", marginBottom: "0.5rem", color: "var(--text-main)" }}>إضافة أصل وقفي جديد</h1>
      <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>أدخل بيانات الأصل (عقاري، مالي، أو زراعي) لتوثيقه في النظام.</p>

      <div className="glass-card" style={{ padding: "2rem" }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label style={{ fontWeight: 600, color: "var(--text-main)" }}>اسم الأصل / العقار / المحفظة</label>
            <input name="name" type="text" required placeholder="مثال: برج الخزامى المكتبي" style={{ padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--border-color)", background: "var(--bg-main)", color: "var(--text-main)" }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label style={{ fontWeight: 600, color: "var(--text-main)" }}>تصنيف الأصل (Asset Category)</label>
            <select name="category" required style={{ padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--border-color)", background: "var(--bg-main)", color: "var(--text-main)" }}>
              <option value="real_estate">عقاري (أبراج، أراضي، مباني)</option>
              <option value="investment">استثمار مالي / أسهم</option>
              <option value="cash">نقد / ودائع</option>
              <option value="agricultural">زراعي (مزارع، تمور)</option>
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label style={{ fontWeight: 600, color: "var(--text-main)" }}>القيمة التقديرية أو التاريخية (ر.س)</label>
            <input name="valuation" type="number" required placeholder="85000000" style={{ padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--border-color)", background: "var(--bg-main)", color: "var(--text-main)" }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label style={{ fontWeight: 600, color: "var(--text-main)" }}>الموقع الجغرافي أو رقم الحساب</label>
            <input name="location" type="text" placeholder="الرياض، حي العليا" style={{ padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--border-color)", background: "var(--bg-main)", color: "var(--text-main)" }} />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1rem" }}>
            <button type="button" onClick={() => router.back()} className="btn-outline">إلغاء</button>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? "جاري الحفظ..." : "توثيق الأصل"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
