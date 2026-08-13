"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import styles from "../login/login.module.css";

import { registerMainUserAction } from "./actions";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [waqfName, setWaqfName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await registerMainUserAction({
        fullName,
        waqfName,
        email,
      });

      if (!res.success) {
        throw new Error(res.error || "حدث خطأ أثناء التسجيل.");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      console.error("Detailed Registration error:", err);
      setError(err.message || "حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة مجدداً.");
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Left – decorative panel */}
      <div className={styles.decorPanel}>
        <div className={styles.geometryBg}></div>
        <div className={styles.decorContent}>
          <div className={styles.decorLogo}>
            <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M30 4L56 18V42L30 56L4 42V18L30 4Z" stroke="white" strokeWidth="1.5" strokeOpacity="0.4"/>
              <path d="M30 12L48 22V38L30 48L12 38V22L30 12Z" fill="white" fillOpacity="0.08"/>
              <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="20" fontFamily="Cairo, sans-serif" fontWeight="700">م</text>
            </svg>
          </div>
          <h2 className={styles.decorTitle}>انضم إلى مَشيد</h2>
          <p className={styles.decorSubtitle}>ابدأ رحلة التحول الرقمي لوقفك<br/>وفق أحدث المعايير العالمية</p>
          <div className={styles.decorStats}>
            <div className={styles.decorStat}>
              <span className={styles.decorStatVal}>مجاناً</span>
              <span className={styles.decorStatLabel}>للفترة التجريبية</span>
            </div>
            <div className={styles.decorDivider}></div>
            <div className={styles.decorStat}>
              <span className={styles.decorStatVal}>سريع</span>
              <span className={styles.decorStatLabel}>إعداد خلال دقائق</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right – registration form */}
      <div className={styles.formSide}>
        <div className={`${styles.loginCard} glass-card fade-in`}>
          <div className={styles.header}>
            <div className={styles.logoSmall}>م</div>
            <h1>إنشاء حساب جديد</h1>
            <p>سجل بياناتك وبيانات الوقف للبدء</p>
          </div>

          <form className={styles.form} onSubmit={handleRegister}>
            <div className={styles.inputGroup}>
              <label htmlFor="fullName">الاسم الكامل</label>
              <div className={styles.inputWrapper}>
                <input
                  id="fullName"
                  type="text"
                  placeholder="محمد بن عبد الله"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={`input ${styles.input}`}
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="waqfName">اسم الوقف / المؤسسة</label>
              <div className={styles.inputWrapper}>
                <input
                  id="waqfName"
                  type="text"
                  placeholder="وقف الهداية الخيري"
                  required
                  value={waqfName}
                  onChange={(e) => setWaqfName(e.target.value)}
                  className={`input ${styles.input}`}
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="email">البريد الإلكتروني</label>
              <div className={styles.inputWrapper}>
                <input
                  id="email"
                  type="email"
                  placeholder="name@awqaf.sa"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`input ${styles.input}`}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password">كلمة المرور</label>
              <div className={styles.inputWrapper}>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`input ${styles.input}`}
                  autoComplete="new-password"
                />
              </div>
            </div>

            {error && (
              <div className={styles.errorBox} style={{ 
                background: error.includes("تم إنشاء الحساب") ? "#F0FDF4" : "#FEF2F2",
                borderColor: error.includes("تم إنشاء الحساب") ? "#BBF7D0" : "#FECACA",
                color: error.includes("تم إنشاء الحساب") ? "#15803D" : "#DC2626"
              }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <circle cx="12" cy="12" r="10"/>
                  {error.includes("تم إنشاء الحساب") ? <polyline points="9 11 12 14 22 4" /> : [<line key="1" x1="12" y1="8" x2="12" y2="12"/>, <line key="2" x1="12" y1="16" x2="12.01" y2="16"/>]}
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              className={`${styles.loginBtn} btn-primary`}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className={styles.spinner}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={styles.spinnerIcon}>
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                  </svg>
                  جاري الإنشاء...
                </span>
              ) : "إنشاء الحساب والبدء"}
            </button>
          </form>

          <div className={styles.footer}>
            <p>لديك حساب بالفعل؟ <Link href="/login" className={styles.supabase}>تسجيل الدخول</Link></p>
            <div className={styles.links} style={{ marginTop: '1.5rem' }}>
              <Link href="/">العودة للرئيسية</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
