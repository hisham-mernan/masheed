"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff } from "lucide-react";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [waqfName, setWaqfName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          waqf_name: waqfName || undefined,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          <div className="bg-card rounded-2xl p-10 border border-border shadow-sm">
            <div className="w-16 h-16 rounded-full bg-accent/10 text-accent flex items-center justify-center mx-auto mb-6 text-2xl">
              ✓
            </div>
            <h2 className="text-2xl font-bold mb-3">تم التسجيل بنجاح!</h2>
            <p className="text-muted text-sm mb-8">
              تم إرسال رابط التأكيد إلى بريدك الإلكتروني. يرجى تفعيل حسابك للمتابعة.
            </p>
            <Link href="/auth/login">
              <button className="bg-accent text-white px-8 py-3 rounded-xl font-semibold hover:bg-accent-dark transition-all cursor-pointer">
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
        <div className="text-center mb-10">
          <Link href="/" className="inline-block cursor-pointer">
            <span className="text-4xl font-bold text-foreground">وقف</span>
            <span className="text-4xl font-light text-accent mr-1">مشيد</span>
          </Link>
          <p className="text-muted mt-3">أنشئ حسابك وابدأ رحلتك الوقفية</p>
        </div>

        <form onSubmit={handleSignup} className="bg-card rounded-2xl p-8 border border-border shadow-sm space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">الاسم الكامل</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all"
              placeholder="عبدالله المنصور"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">البريد الإلكتروني</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all"
              placeholder="you@example.com"
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
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all"
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

          <div>
            <label className="block text-sm font-medium mb-2">اسم الوقف <span className="text-muted font-normal">(اختياري)</span></label>
            <input
              type="text"
              value={waqfName}
              onChange={(e) => setWaqfName(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all"
              placeholder="مثال: وقف آل سعود الخيري"
            />
            <p className="text-muted text-xs mt-1.5">إذا كنت ناظر وقف وترغب في تسجيله على المنصة</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-white py-3 rounded-xl font-semibold hover:bg-accent-dark transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? "جارٍ التسجيل..." : "إنشاء حساب"}
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
