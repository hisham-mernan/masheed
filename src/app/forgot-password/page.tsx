"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import styles from "../login/login.module.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });
    setIsLoading(false);
    if (err) {
      setError("تعذّر إرسال رابط الاستعادة. تأكد من البريد وحاول مجدداً.");
      return;
    }
    setSent(true);
  };

  return (
    <div className={styles.container} style={{ justifyContent: "center", alignItems: "center", display: "flex", minHeight: "100vh" }}>
      <div className={`${styles.loginCard} glass-card fade-in`} style={{ maxWidth: 420, width: "100%" }}>
        <div className={styles.header}>
          <div className={styles.logoSmall}>م</div>
          <h1>استعادة كلمة المرور</h1>
          <p>أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين</p>
        </div>

        {sent ? (
          <div style={{ textAlign: "center", padding: "1rem 0" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>📧</div>
            <p style={{ color: "#15803D", fontWeight: 600 }}>تم الإرسال بنجاح</p>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
              لو البريد مسجل لدينا، ستصلك رسالة فيها رابط تعيين كلمة مرور جديدة. تحقق من صندوق الوارد والرسائل غير المرغوبة.
            </p>
            <Link href="/login" className="btn-outline" style={{ display: "inline-block", marginTop: "1rem", textDecoration: "none", padding: "0.6rem 1.5rem" }}>
              العودة لتسجيل الدخول
            </Link>
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <label htmlFor="email">البريد الإلكتروني</label>
              <div className={styles.inputWrapper}>
                <input
                  id="email"
                  type="email"
                  placeholder="name@awqaf.gov.sa"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`input ${styles.input}`}
                  autoComplete="email"
                />
              </div>
            </div>

            {error && <div className={styles.errorBox}>{error}</div>}

            <button type="submit" className={`${styles.loginBtn} btn-primary`} disabled={isLoading}>
              {isLoading ? "جاري الإرسال..." : "إرسال رابط الاستعادة"}
            </button>
          </form>
        )}

        {!sent && (
          <div className={styles.footer}>
            <p>تذكرت كلمة المرور؟ <Link href="/login" className={styles.supabase}>تسجيل الدخول</Link></p>
          </div>
        )}
      </div>
    </div>
  );
}
