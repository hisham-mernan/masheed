"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, Building2, User } from "lucide-react";

import { registerUserAction } from "@/app/auth/actions";

export default function SignupPage() {
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
      // Execute robust registration Server Action
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
      <main className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          <div className="bg-card rounded-2xl p-10 border border-border shadow-sm">
            <div className="w-16 h-16 rounded-full bg-accent/10 text-accent flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
              ✓
            </div>
            {userType === "WAQF" ? (
              <>
                <h2 className="text-2xl font-bold mb-3">تم إرسال طلب التسجيل!</h2>
                <p className="text-muted text-sm mb-8 leading-relaxed">
                  تم استلام طلب تسجيل الوقف الخاص بكم وهو قيد المراجعة حالياً من قبل الإشراف العام للمنصة. 
                  <br />
                  ستتلقى بريداً إلكترونياً بالتفعيل (مجاني بالكامل) للدخول إلى لوحة التحكم والنظام فور الموافقة.
                </p>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-3">تم التسجيل بنجاح!</h2>
                <p className="text-muted text-sm mb-8">
                  تم تسجيل حسابك الاستثماري بنجاح. يمكنك الآن تسجيل الدخول واستكشاف الأوقاف المتاحة للمساهمة.
                </p>
              </>
            )}
            <Link href="/auth/login">
              <button className="w-full bg-accent text-white py-3 rounded-xl font-semibold hover:bg-accent-dark transition-all cursor-pointer">
                الذهاب لتسجيل الدخول
              </button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-block cursor-pointer">
            <span className="text-4xl font-bold text-foreground">وقف</span>
            <span className="text-4xl font-light text-accent mr-1">مشيد</span>
          </Link>
          <p className="text-muted mt-3">أنشئ حسابك وابدأ رحلتك الوقفية</p>
        </div>

        {/* Tab Toggle */}
        <div className="bg-card p-1 rounded-xl flex border border-border shadow-sm mb-6">
          <button
            type="button"
            onClick={() => { setUserType("INVESTOR"); setError(""); }}
            className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all cursor-pointer flex items-center justify-center gap-2 ${
              userType === "INVESTOR"
                ? "bg-accent text-white shadow-sm"
                : "text-muted hover:text-foreground"
            }`}
          >
            <User size={16} />
            حساب مستثمر (صكوك)
          </button>
          <button
            type="button"
            onClick={() => { setUserType("WAQF"); setError(""); }}
            className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all cursor-pointer flex items-center justify-center gap-2 ${
              userType === "WAQF"
                ? "bg-accent text-white shadow-sm"
                : "text-muted hover:text-foreground"
            }`}
          >
            <Building2 size={16} />
            جهة وقفية (النظام)
          </button>
        </div>

        <form onSubmit={handleSignup} className="bg-card rounded-2xl p-8 border border-border shadow-sm space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100 leading-normal">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">الاسم الكامل للمشرف/الناظر</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:border-accent transition-all"
              placeholder="عبدالله المنصور"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">البريد الإلكتروني للجهة</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:border-accent transition-all"
              placeholder="name@organization.sa"
              dir="ltr"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">كلمة المرور</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:border-accent transition-all"
                placeholder="٨ أحرف على الأقل"
                dir="ltr"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground cursor-pointer"
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Waqf Specific Form Sections */}
          {userType === "WAQF" && (
            <div className="border-t border-border pt-4 mt-4 space-y-4">
              <h3 className="font-bold text-accent text-sm mb-3">📋 معلومات الكيان الوقفي (MPS Data Model)</h3>

              <div>
                <label className="block text-sm font-medium mb-2">اسم الوقف الرسمي</label>
                <input
                  type="text"
                  value={waqfName}
                  onChange={(e) => setWaqfName(e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:border-accent transition-all"
                  placeholder="مثال: وقف البر والخيرات المشترك"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">رقم ترخيص الوقف</label>
                  <input
                    type="text"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:border-accent transition-all"
                    placeholder="WQ-9821"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">تصنيف الوقف</label>
                  <select
                    value={waqfType}
                    onChange={(e) => setWaqfType(e.target.value)}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:border-accent transition-all text-sm font-medium"
                  >
                    <option value="خيري (Khairi)">خيري (Khairi)</option>
                    <option value="أهلي (Ahli)">أهلي (Ahli)</option>
                    <option value="مشترك (Mushtarak)">مشترك (Mushtarak)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">اسم الواقف (المؤسس)</label>
                  <input
                    type="text"
                    value={waqifName}
                    onChange={(e) => setWaqifName(e.target.value)}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:border-accent transition-all"
                    placeholder="صالح الراجحي"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">هوية/إقامة الواقف</label>
                  <input
                    type="text"
                    value={waqifNationalId}
                    onChange={(e) => setWaqifNationalId(e.target.value)}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:border-accent transition-all"
                    placeholder="1098273821"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">المدينة / المقر الرئيسي</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:border-accent transition-all"
                  placeholder="الرياض"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">ملف صك الوقف الموثق <span className="text-muted font-normal">(PDF)</span></label>
                <input
                  type="file"
                  accept=".pdf"
                  className="w-full px-4 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:border-accent transition-all"
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-white py-3 rounded-xl font-semibold hover:bg-accent-dark transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? "جارٍ التسجيل..." : userType === "WAQF" ? "تقديم طلب تسجيل الوقف" : "إنشاء حساب"}
          </button>

          <p className="text-center text-sm text-muted">
            لديك حساب بالفعل؟{" "}
            <Link href="/auth/login" className="text-accent font-semibold hover:underline cursor-pointer">
              سجّل دخولك
            </Link>
          </p>
        </form>

        <div className="text-center mt-6">
          <Link href="/" className="text-muted text-sm hover:text-foreground inline-flex items-center gap-1 cursor-pointer">
            <ArrowRight size={14} />
            العودة للرئيسية
          </Link>
        </div>
      </div>
    </main>
  );
}
