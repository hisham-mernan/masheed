"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import styles from "./login.module.css";

const POINTS = [
  "الأصول والريع والمستفيدون في سجل واحد لكل وقف",
  "كل توزيع للريع يمر باعتماد طرف ثانٍ قبل تنفيذه",
  "سجل مراجعة يوثّق كل عملية باسم منفذها ووقتها",
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("البريد الإلكتروني أو كلمة المرور غير صحيحة. تحقق منهما وحاول مجدداً.");
      setIsLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className={styles.container}>
      <div className={styles.formSide}>
        <div className={`${styles.loginCard} fade-in`}>
          <div className={styles.header}>
            <Link href="/" aria-label="مَشيد — الصفحة الرئيسية">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/masheed-lockup.svg" alt="مَشيد" className={styles.logoSmall} />
            </Link>
            <h1>تسجيل الدخول</h1>
            <p>ادخل إلى نظام مَشيد لإدارة أوقافك.</p>
          </div>

          <form className={styles.form} onSubmit={handleLogin}>
            <div className={styles.inputGroup}>
              <label htmlFor="email">البريد الإلكتروني</label>
              <div className={styles.inputWrapper}>
                <svg className={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="M3 7l9 6 9-6" />
                </svg>
                <input
                  id="email"
                  type="email"
                  dir="ltr"
                  placeholder="name@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.input}
                  autoComplete="email"
                  aria-invalid={!!error}
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <div className={styles.labelRow}>
                <label htmlFor="password">كلمة المرور</label>
                <Link href="/forgot-password">نسيت كلمة المرور؟</Link>
              </div>
              <div className={styles.inputWrapper}>
                <svg className={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="4" y="11" width="16" height="10" rx="2" />
                  <path d="M8 11V7a4 4 0 018 0v4" />
                </svg>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  dir="ltr"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={styles.input}
                  autoComplete="current-password"
                  aria-invalid={!!error}
                />
                <button
                  type="button"
                  className={styles.reveal}
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                  aria-pressed={showPassword}
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                    <circle cx="12" cy="12" r="3" />
                    {showPassword && <line x1="3" y1="3" x2="21" y2="21" />}
                  </svg>
                </button>
              </div>
            </div>

            {error && (
              <div className={styles.errorBox} role="alert">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            <button type="submit" className={`${styles.loginBtn} btn-primary`} disabled={isLoading}>
              {isLoading ? (
                <span className={styles.spinner}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={styles.spinnerIcon} aria-hidden="true">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  جارٍ الدخول…
                </span>
              ) : "دخول"}
            </button>
          </form>

          <div className={styles.footer}>
            <p>ليس لديك حساب؟ <Link href="/register" className={styles.supabase}>أنشئ حساباً وجرّب النظام 15 يوماً</Link></p>
            <div className={styles.links}>
              <Link href="/contact">الدعم الفني</Link>
              <Link href="/privacy">سياسة الخصوصية</Link>
              <Link href="/terms">الشروط والأحكام</Link>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.decorPanel} aria-hidden="true">
        <div className={styles.geometryBg}></div>
        <div className={styles.decorContent}>
          <div className={styles.decorLogo}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/masheed-mark-mono-white.svg" alt="" />
          </div>
          <h2 className={styles.decorTitle}>نظام مَشيد لإدارة الأوقاف</h2>
          <p className={styles.decorSubtitle}>إدارة الأصول، تحصيل الريع وتوزيعه، والامتثال لأنظمة الهيئة العامة للأوقاف، في منصة واحدة.</p>
          <ul className={styles.decorPoints}>
            {POINTS.map((p) => (
              <li key={p}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
