"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import styles from "../login/login.module.css";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // الجلسة تصل من /auth/callback بعد استبدال الكود
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setReady(true);
      else setError("رابط الاستعادة غير صالح أو منتهي. اطلب رابطاً جديداً.");
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("كلمة المرور يجب أن تكون 8 أحرف على الأقل.");
      return;
    }
    if (password !== confirm) {
      setError("كلمتا المرور غير متطابقتين.");
      return;
    }
    setIsLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setIsLoading(false);
    if (err) {
      setError("تعذّر تحديث كلمة المرور: " + err.message);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className={styles.container} style={{ justifyContent: "center", alignItems: "center", display: "flex", minHeight: "100vh" }}>
      <div className={`${styles.loginCard} glass-card fade-in`} style={{ maxWidth: 420, width: "100%" }}>
        <div className={styles.header}>
          <div className={styles.logoSmall}>م</div>
          <h1>تعيين كلمة مرور جديدة</h1>
          <p>اختر كلمة مرور قوية لحسابك</p>
        </div>

        {ready ? (
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <label htmlFor="password">كلمة المرور الجديدة</label>
              <div className={styles.inputWrapper}>
                <input
                  id="password"
                  type="password"
                  placeholder="8 أحرف على الأقل"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`input ${styles.input}`}
                  autoComplete="new-password"
                />
              </div>
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="confirm">تأكيد كلمة المرور</label>
              <div className={styles.inputWrapper}>
                <input
                  id="confirm"
                  type="password"
                  placeholder="أعد كتابة كلمة المرور"
                  required
                  minLength={8}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className={`input ${styles.input}`}
                  autoComplete="new-password"
                />
              </div>
            </div>

            {error && <div className={styles.errorBox}>{error}</div>}

            <button type="submit" className={`${styles.loginBtn} btn-primary`} disabled={isLoading}>
              {isLoading ? "جاري الحفظ..." : "حفظ كلمة المرور الجديدة"}
            </button>
          </form>
        ) : (
          <div style={{ textAlign: "center", padding: "1rem 0" }}>
            {error ? (
              <>
                <div className={styles.errorBox} style={{ marginBottom: "1rem" }}>{error}</div>
                <a href="/forgot-password" className="btn-outline" style={{ display: "inline-block", textDecoration: "none", padding: "0.6rem 1.5rem" }}>
                  طلب رابط جديد
                </a>
              </>
            ) : (
              <p style={{ color: "var(--text-muted)" }}>جاري التحقق من الرابط...</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
