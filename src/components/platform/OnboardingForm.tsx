"use client";

import { useActionState, useState } from "react";
import { completeOnboarding, type FormState } from "@/lib/platform-actions";
import { ASSET_RANGES, HOLDING_TYPES } from "./options";
import { FieldError, s } from "./ui";

const initial: FormState = { status: "idle" };

// "Do you have a waqf?" — Yes shows the waqf form; No goes on to the services
export default function OnboardingForm({ addOnly = false }: { addOnly?: boolean }) {
  const [state, action, pending] = useActionState(completeOnboarding, initial);
  const [hasWaqf, setHasWaqf] = useState<boolean | null>(addOnly ? true : null);
  const v = state.values || {};

  return (
    <div className={s.form}>
      {!addOnly && (
        <div className={s.choice}>
          <button type="button" className={s.choiceBtn} aria-pressed={hasWaqf === true} onClick={() => setHasWaqf(true)}>
            <b>نعم، لدي وقف</b>
            <span>أدخل بيانات وقفك الأساسية وابدأ إدارة أصوله ومستفيديه وماليته من النظام.</span>
          </button>
          <button type="button" className={s.choiceBtn} aria-pressed={hasWaqf === false} onClick={() => setHasWaqf(false)}>
            <b>لا، ليس بعد</b>
            <span>استعرض خدماتنا، ومنها تأسيس وقف جديد بخطوات واضحة. يمكنك إضافة وقفك لاحقاً.</span>
          </button>
        </div>
      )}

      {state.status === "error" && state.message && <div className={`${s.alert} ${s.alertErr}`} role="alert">{state.message}</div>}

      {hasWaqf === false && (
        <form action={action}>
          <input type="hidden" name="has_waqf" value="no" />
          <button className={s.btn} disabled={pending}>{pending ? "جارٍ الحفظ…" : "استعرض الخدمات"}</button>
        </form>
      )}

      {hasWaqf === true && (
        <form action={action} className={`${s.panel} ${s.form}`} noValidate>
          <input type="hidden" name="has_waqf" value="yes" />
          <div><h2>بيانات الوقف</h2><p className={s.hint}>يمكنك تعديلها لاحقاً من إعدادات الوقف.</p></div>
          <div className={s.field}>
            <label htmlFor="ob-name">اسم الوقف</label>
            <input id="ob-name" name="name" className={s.input} defaultValue={v.name} maxLength={160} aria-invalid={!!state.errors?.name} aria-describedby="ob-name-err" />
            <FieldError id="ob-name" msg={state.errors?.name} />
          </div>
          <div className={s.row}>
            <div className={s.field}>
              <label htmlFor="ob-type">نوع الوقف</label>
              <select id="ob-type" name="holding_type" className={s.input} defaultValue={v.holding_type || ""}>
                <option value="">اختر</option>
                {HOLDING_TYPES.filter((t) => !t.startsWith("وقف جديد")).map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className={s.field}>
              <label htmlFor="ob-assets">عدد الأصول تقريباً</label>
              <select id="ob-assets" name="assets_range" className={s.input} defaultValue={v.assets_range || ""}>
                <option value="">اختر</option>
                {ASSET_RANGES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className={s.field}>
            <label htmlFor="ob-reg">رقم صك الوقف أو السجل<small>(اختياري)</small></label>
            <input id="ob-reg" name="registration" className={s.input} defaultValue={v.registration} maxLength={60} />
          </div>
          <div className={s.field}>
            <label htmlFor="ob-desc">نبذة عن الوقف ومصارفه<small>(اختياري)</small></label>
            <textarea id="ob-desc" name="description" className={s.input} defaultValue={v.description} maxLength={2000} />
          </div>
          <button className={s.btn} disabled={pending}>{pending ? "جارٍ الحفظ…" : "احفظ وابدأ"}</button>
        </form>
      )}
    </div>
  );
}
