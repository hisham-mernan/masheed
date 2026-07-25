"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addBeneficiary } from "@/app/actions";

export default function AddBeneficiaryPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await addBeneficiary(formData);
    setIsLoading(false);
    
    if (res?.error) {
      alert("خطأ: " + res.error);
    } else {
      router.push("/dashboard/beneficiary");
    }
  }

  return (
    <div className="fade-in" style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.75rem", marginBottom: "0.5rem", color: "var(--text-main)" }}>إضافة مستفيد جديد (إصدار أسهم)</h1>
      <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>تسجيل بيانات المستفيد وتخصيص حصته (Tokens) من الوقف.</p>

      <div className="glass-card" style={{ padding: "2rem" }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label style={{ fontWeight: 600, color: "var(--text-main)" }}>الاسم الكامل (كما في الهوية)</label>
            <input name="full_name" type="text" required placeholder="مثال: عبد الله بن محمد" style={{ padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--border-color)", background: "var(--bg-main)", color: "var(--text-main)" }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label style={{ fontWeight: 600, color: "var(--text-main)" }}>رقم الهوية الوطنية / الإقامة</label>
            <input name="national_id" type="text" required placeholder="10xxxxxxxxx" style={{ padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--border-color)", background: "var(--bg-main)", color: "var(--text-main)" }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label style={{ fontWeight: 600, color: "var(--text-main)" }}>عدد الأسهم المخصصة (Tokens)</label>
            <input name="shares_owned" type="number" step="0.01" required placeholder="12.5" style={{ padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--border-color)", background: "var(--bg-main)", color: "var(--text-main)" }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label style={{ fontWeight: 600, color: "var(--text-main)" }}>بيانات التواصل (رقم جوال أو إيميل)</label>
            <input name="contact_info" type="text" placeholder="05xxxxxxxx" style={{ padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--border-color)", background: "var(--bg-main)", color: "var(--text-main)" }} />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1rem" }}>
            <button type="button" onClick={() => router.back()} className="btn-outline">إلغاء</button>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? "جاري الإضافة..." : "حفظ المستفيد"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
