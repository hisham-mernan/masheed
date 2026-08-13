"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUserAction } from "../actions";

export default function SignupPageClient() {
  const [userType, setUserType] = useState<"INVESTOR" | "WAQF">("INVESTOR");
  
  // Shared fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  
  // Waqf-specific fields
  const [waqfName, setWaqfName] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [waqfType, setWaqfType] = useState("خيري (Khairi)");
  const [waqifName, setWaqifName] = useState("");
  const [waqifNationalId, setWaqifNationalId] = useState("");
  const [city, setCity] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await registerUserAction({
        email,
        fullName,
        userType,
        waqfName: userType === "WAQF" ? waqfName : undefined,
        registrationNumber: userType === "WAQF" ? registrationNumber : undefined,
        waqfType: userType === "WAQF" ? waqfType : undefined,
        waqifName: userType === "WAQF" ? waqifName : undefined,
        waqifNationalId: userType === "WAQF" ? waqifNationalId : undefined,
        city: userType === "WAQF" ? city : undefined,
      });

      if (!res.success) {
        throw new Error(res.error || "فشل التسجيل. يرجى المحاولة مجدداً.");
      }

      setSuccess(true);
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.message || "حدث خطأ أثناء التسجيل. يرجى المحاولة مجدداً.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main style={{ minHeight: "100vh", background: "#F7F8FA", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem", fontFamily: "Cairo, sans-serif" }}>
        <div style={{ width: "100%", maxWidth: "420px", textAlign: "center" }}>
          <div style={{ background: "#ffffff", borderRadius: "1rem", padding: "2.5rem", border: "1px solid #E4E7EF", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(133,97,173,0.1)", color: "#8561AD", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem", fontSize: "1.5rem", fontWeight: "bold" }}>
              ✓
            </div>
            {userType === "WAQF" ? (
              <>
                <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.75rem", color: "#1A1A2E" }}>تم إرسال طلب التسجيل!</h2>
                <p style={{ color: "#64748B", fontSize: "0.875rem", marginBottom: "2rem", lineHeight: "1.6" }}>
                  تم استلام طلب تسجيل الوقف الخاص بكم وهو قيد المراجعة حالياً من قبل الإشراف العام للمنصة. 
                  <br />
                  ستتلقى بريداً إلكترونياً بالتفعيل (مجاني بالكامل) للدخول إلى لوحة التحكم والنظام فور الموافقة.
                </p>
              </>
            ) : (
              <>
                <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.75rem", color: "#1A1A2E" }}>تم التسجيل بنجاح!</h2>
                <p style={{ color: "#64748B", fontSize: "0.875rem", marginBottom: "2rem" }}>
                  تم تسجيل حسابك الاستثماري بنجاح. يمكنك الآن تسجيل الدخول واستكشاف الأوقاف المتاحة للمساهمة.
                </p>
              </>
            )}
            <Link href="/dashboard" style={{ textDecoration: "none" }}>
              <button style={{ width: "100%", background: "#8561AD", color: "#ffffff", padding: "0.75rem", borderRadius: "0.75rem", fontWeight: "bold", border: "none", cursor: "pointer" }}>
                الذهاب للوحة التحكم
              </button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "#F7F8FA", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 1.5rem", fontFamily: "Cairo, sans-serif", direction: "rtl" }}>
      <div style={{ width: "100%", maxWidth: "440px" }}>
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <span style={{ fontSize: "2.25rem", fontWeight: "bold", color: "#1A1A2E" }}>وقف</span>
            <span style={{ fontSize: "2.25rem", fontWeight: "300", color: "#8561AD", marginRight: "0.25rem" }}>مشيد</span>
          </Link>
          <p style={{ color: "#64748B", marginTop: "0.5rem" }}>أنشئ حسابك وابدأ رحلتك الوقفية</p>
        </div>

        <div style={{ background: "#ffffff", padding: "0.25rem", borderRadius: "0.75rem", display: "flex", border: "1px solid #E4E7EF", marginBottom: "1.5rem" }}>
          <button
            type="button"
            onClick={() => { setUserType("INVESTOR"); setError(""); }}
            style={{ flex: 1, padding: "0.6rem", borderRadius: "0.5rem", fontWeight: "bold", fontSize: "0.875rem", border: "none", cursor: "pointer", background: userType === "INVESTOR" ? "#8561AD" : "transparent", color: userType === "INVESTOR" ? "#fff" : "#64748B" }}
          >
            👤 حساب مستثمر (صكوك)
          </button>
          <button
            type="button"
            onClick={() => { setUserType("WAQF"); setError(""); }}
            style={{ flex: 1, padding: "0.6rem", borderRadius: "0.5rem", fontWeight: "bold", fontSize: "0.875rem", border: "none", cursor: "pointer", background: userType === "WAQF" ? "#8561AD" : "transparent", color: userType === "WAQF" ? "#fff" : "#64748B" }}
          >
            🏛️ جهة وقفية (النظام)
          </button>
        </div>

        <form onSubmit={handleSignup} style={{ background: "#ffffff", borderRadius: "1rem", padding: "2rem", border: "1px solid #E4E7EF", boxShadow: "0 4px 12px rgba(0,0,0,0.03)", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {error && (
            <div style={{ background: "#FEF2F2", color: "#DC2626", fontSize: "0.875rem", padding: "0.75rem 1rem", borderRadius: "0.75rem", border: "1px solid #FECACA" }}>
              {error}
            </div>
          )}

          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", marginBottom: "0.5rem", color: "#1A1A2E" }}>الاسم الكامل للمشرف/الناظر</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={{ width: "100%", padding: "0.75rem 1rem", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "0.75rem", color: "#1A1A2E", outline: "none" }}
              placeholder="عبدالله المنصور"
              required
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", marginBottom: "0.5rem", color: "#1A1A2E" }}>البريد الإلكتروني للجهة</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: "100%", padding: "0.75rem 1rem", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "0.75rem", color: "#1A1A2E", outline: "none" }}
              placeholder="name@organization.sa"
              dir="ltr"
              required
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", marginBottom: "0.5rem", color: "#1A1A2E" }}>كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: "100%", padding: "0.75rem 1rem", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "0.75rem", color: "#1A1A2E", outline: "none" }}
              placeholder="••••••••"
              dir="ltr"
              required
              minLength={8}
            />
          </div>

          {userType === "WAQF" && (
            <div style={{ borderTop: "1px solid #E2E8F0", paddingTop: "1rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <h3 style={{ fontWeight: "bold", color: "#8561AD", fontSize: "0.875rem", margin: 0 }}>📋 معلومات الكيان الوقفي</h3>

              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", marginBottom: "0.5rem", color: "#1A1A2E" }}>اسم الوقف الرسمي</label>
                <input
                  type="text"
                  value={waqfName}
                  onChange={(e) => setWaqfName(e.target.value)}
                  style={{ width: "100%", padding: "0.75rem 1rem", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "0.75rem", color: "#1A1A2E", outline: "none" }}
                  placeholder="مثال: وقف البر والخيرات المشترك"
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", marginBottom: "0.5rem", color: "#1A1A2E" }}>رقم ترخيص الوقف</label>
                  <input
                    type="text"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    style={{ width: "100%", padding: "0.75rem 1rem", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "0.75rem", color: "#1A1A2E", outline: "none" }}
                    placeholder="WQ-9821"
                    required
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", marginBottom: "0.5rem", color: "#1A1A2E" }}>تصنيف الوقف</label>
                  <select
                    value={waqfType}
                    onChange={(e) => setWaqfType(e.target.value)}
                    style={{ width: "100%", padding: "0.75rem 1rem", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "0.75rem", color: "#1A1A2E", outline: "none", fontSize: "0.875rem" }}
                  >
                    <option value="خيري (Khairi)">خيري (Khairi)</option>
                    <option value="أهلي (Ahli)">أهلي (Ahli)</option>
                    <option value="مشترك (Mushtarak)">مشترك (Mushtarak)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ width: "100%", background: "#8561AD", color: "#ffffff", padding: "0.75rem", borderRadius: "0.75rem", fontWeight: "bold", border: "none", cursor: "pointer", opacity: loading ? 0.6 : 1 }}
          >
            {loading ? "جارٍ التسجيل..." : userType === "WAQF" ? "تقديم طلب تسجيل الوقف" : "إنشاء حساب"}
          </button>

          <p style={{ textAlign: "center", fontSize: "0.875rem", color: "#64748B", margin: 0 }}>
            لديك حساب بالفعل؟{" "}
            <Link href="/login" style={{ color: "#8561AD", fontWeight: "bold", textDecoration: "none" }}>
              سجّل دخولك
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
