"use client";

import { use, useActionState } from "react";
import Link from "next/link";
import { registerAccount, type FormState } from "@/lib/platform-actions";
import styles from "../login/login.module.css";

const initial: FormState = { status: "idle" };

// Package picked on the website's packages page (?plan=). The trial always starts on Basic;
// the choice is kept on the account so the billing page can point back to it.
const PLAN_NAMES: Record<string, string> = { basic: "الأساسية", advanced: "المتقدمة", extended: "الموسعة" };

const FIELDS: { name: "name" | "phone" | "email" | "password"; label: string; type: string; placeholder: string; auto: string; inputMode?: "tel" | "email" }[] = [
  { name: "name", label: "اسم الجهة أو الوقف", type: "text", placeholder: "وقف الهداية الخيري", auto: "organization" },
  { name: "phone", label: "رقم الجوال", type: "tel", placeholder: "05xxxxxxxx", auto: "tel", inputMode: "tel" },
  { name: "email", label: "البريد الإلكتروني", type: "email", placeholder: "name@awqaf.sa", auto: "email", inputMode: "email" },
  { name: "password", label: "كلمة المرور", type: "password", placeholder: "8 أحرف على الأقل", auto: "new-password" },
];

export default function RegisterPage({ searchParams }: { searchParams: Promise<{ plan?: string; name?: string }> }) {
  // ?name= comes from the "create your account" dialog on the System website
  const { plan: planParam, name: nameParam } = use(searchParams);
  const plan = planParam && PLAN_NAMES[planParam] ? planParam : null;
  const [state, action, pending] = useActionState(registerAccount, initial);
  const ok = state.status === "ok";
  const notice = state.message;

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
              <span className={styles.decorStatVal}>15 يوماً</span>
              <span className={styles.decorStatLabel}>تجربة مجانية</span>
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
            <p>جرّب النظام مجاناً لمدة 15 يوماً</p>
          </div>

          {ok ? (
            <div className={styles.errorBox} role="status" style={{ background: "#F0FDF4", borderColor: "#BBF7D0", color: "#15803D" }}>{notice}</div>
          ) : (
            <form className={styles.form} action={action} noValidate>
              {plan && (
                <>
                  <input type="hidden" name="plan" value={plan} />
                  <div className={styles.errorBox} role="note" style={{ background: "#F4EEFB", borderColor: "#DCCBF0", color: "#4A2D8A" }}>
                    {plan === "basic"
                      ? "اخترت الباقة الأساسية. تبدأ تجربتك المجانية بمزاياها، ويمكنك الاشتراك فيها في أي وقت من «الباقة والفوترة»."
                      : `اخترت الباقة ${PLAN_NAMES[plan]}. تبدأ تجربتك المجانية بمزايا الباقة الأساسية، ويمكنك الاشتراك في الباقة ${PLAN_NAMES[plan]} في أي وقت من «الباقة والفوترة».`}
                  </div>
                </>
              )}
              {FIELDS.map((f) => (
                <div className={styles.inputGroup} key={f.name}>
                  <label htmlFor={"rg-" + f.name}>{f.label}</label>
                  <div className={styles.inputWrapper}>
                    <input
                      id={"rg-" + f.name}
                      name={f.name}
                      type={f.type}
                      inputMode={f.inputMode}
                      placeholder={f.placeholder}
                      autoComplete={f.auto}
                      defaultValue={f.name === "password" ? undefined : state.values?.[f.name] ?? (f.name === "name" ? nameParam?.slice(0, 120) : undefined)}
                      aria-invalid={!!state.errors?.[f.name]}
                      aria-describedby={state.errors?.[f.name] ? `rg-${f.name}-err` : undefined}
                      className={`input ${styles.input}`}
                      dir={f.name === "name" ? undefined : "ltr"}
                      style={f.name === "name" ? undefined : { textAlign: "right" }}
                    />
                  </div>
                  {state.errors?.[f.name] && <span id={`rg-${f.name}-err`} style={{ color: "#DC2626", fontSize: "0.78rem", fontWeight: 600 }}>{state.errors[f.name]}</span>}
                </div>
              ))}

              {notice && (
                <div className={styles.errorBox} role="alert">{notice}</div>
              )}

              <button type="submit" className={`${styles.loginBtn} btn-primary`} disabled={pending}>
                {pending ? "جارٍ الإنشاء…" : "ابدأ التجربة المجانية"}
              </button>
            </form>
          )}

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
