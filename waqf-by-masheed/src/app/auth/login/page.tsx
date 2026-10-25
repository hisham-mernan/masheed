"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block cursor-pointer">
            <span className="text-4xl font-bold text-foreground">وقف</span>
            <span className="text-4xl font-light text-accent mr-1">مشيد</span>
          </Link>
          <p className="text-muted mt-3">سجّل دخولك للمتابعة</p>
        </div>

        <form onSubmit={handleLogin} className="bg-card rounded-2xl p-8 border border-border shadow-sm space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">
              {error}
            </div>
          )}

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
                placeholder="••••••••"
                dir="ltr"
                required
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-white py-3 rounded-xl font-semibold hover:bg-accent-dark transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? "جارٍ الدخول..." : "دخول"}
          </button>

          <p className="text-center text-sm text-muted">
            ليس لديك حساب؟{" "}
            <Link href="/auth/signup" className="text-accent font-semibold hover:underline cursor-pointer">
              سجّل الآن
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
