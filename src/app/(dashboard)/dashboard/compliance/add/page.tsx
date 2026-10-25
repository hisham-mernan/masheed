"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addUserProfile } from "@/app/actions";

export default function AddUserPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const res = await addUserProfile(formData);
    setIsLoading(false);

    if (res?.error) {
      setError(res.error);
    } else {
      router.push("/dashboard/compliance?success=1");
      router.refresh();
    }
  }

  const inputStyle: React.CSSProperties = {
    padding: "0.75rem",
    borderRadius: "6px",
    border: "1px solid var(--border-color)",
    background: "var(--bg-main)",
    color: "var(--text-main)",
  };

  return (
    <div className="fade-in" style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", marginBottom: "0.5rem", color: "var(--text-main)" }}>إضافة مستخدم لنظام الوقف</h1>
        <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>إنشاء حساب دخول حقيقي لمستخدم جديد، مرتبط بنفس الوقف الخاص بك وبالصلاحية التي تحددها.</p>
      </div>

      <div className="glass-card" style={{ padding: "2rem" }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label style={{ fontWeight: 600, color: "var(--text-main)" }}>اسم المستخدم الكامل</label>
            <input type="text" name="full_name" required placeholder="مثال: أحمد خالد" style={inputStyle} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label style={{ fontWeight: 600, color: "var(--text-main)" }}>الصلاحية (Role)</label>
            <select name="role" required style={inputStyle}>
              <option value="viewer">قارئ فقط (للاطلاع على التقارير)</option>
              <option value="auditor">مراقب مالي (مراجعة العمليات)</option>
              <option value="supervisor">مشرف (إضافة وتعديل بيانات)</option>
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label style={{ fontWeight: 600, color: "var(--text-main)" }}>البريد الإلكتروني للمستخدم</label>
            <input type="email" name="email" required placeholder="user@example.com" style={inputStyle} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label style={{ fontWeight: 600, color: "var(--text-main)" }}>كلمة مرور مؤقتة</label>
            <input type="password" name="password" required minLength={6} placeholder="٦ أحرف على الأقل" style={inputStyle} />
            <small style={{ color: "var(--text-muted)" }}>يسلّمها للمستخدم ليدخل بها أول مرة — الحساب يُربط بوقفك تلقائياً.</small>
          </div>

          {error && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", padding: "0.75rem 1rem", borderRadius: "6px" }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1rem" }}>
            <button type="button" onClick={() => router.back()} className="btn-outline">إلغاء</button>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? "جاري الإنشاء..." : "إضافة المستخدم"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
