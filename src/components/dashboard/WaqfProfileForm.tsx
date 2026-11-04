"use client";

import { useActionState } from "react";
import { saveWaqfProfile } from "@/lib/waqf-profile-actions";
import type { FormState } from "@/lib/platform-actions";
import { FieldError, s } from "@/components/platform/ui";

export type WaqfProfile = {
  name: string; total_shares: number | null; type: string | null; size_tier: string | null;
  registration_number: string | null; gaw_registered_at: string | null; gaw_certificate_expires: string | null;
  deed_number: string | null; deed_date: string | null; deed_court: string | null; purposes: string | null; description: string | null;
};

const initial: FormState = { status: "idle" };

// The waqf's identity record: what the GAW registration and deed rules are checked against
export default function WaqfProfileForm({ waqf }: { waqf: WaqfProfile }) {
  const [state, action, pending] = useActionState(saveWaqfProfile, initial);
  const err = state.errors || {};
  const field = (name: keyof WaqfProfile, label: string, opts: { type?: string; hint?: string; dir?: "ltr" } = {}) => (
    <div className={s.field}>
      <label htmlFor={`wp-${name}`}>{label}{opts.hint && <small>{opts.hint}</small>}</label>
      <input id={`wp-${name}`} name={name} type={opts.type || "text"} dir={opts.dir} className={s.input}
        defaultValue={(waqf[name] as string | number | null) ?? ""} aria-invalid={!!err[name]} aria-describedby={err[name] ? `wp-${name}-err` : undefined} />
      <FieldError id={`wp-${name}`} msg={err[name]} />
    </div>
  );

  return (
    <form action={action} className={s.form}>
      <div className={s.row}>
        {field("name", "اسم الوقف")}
        <div className={s.field}>
          <label htmlFor="wp-type">نوع الوقف</label>
          <select id="wp-type" name="type" className={s.input} defaultValue={waqf.type || "khairi"}>
            <option value="khairi">خيري</option>
            <option value="ahli">أهلي (ذري)</option>
            <option value="mushtarak">مشترك</option>
          </select>
        </div>
      </div>
      <div className={s.row}>
        <div className={s.field}>
          <label htmlFor="wp-size_tier">فئة الحجم<small>تحدد القواعد المنطبقة</small></label>
          <select id="wp-size_tier" name="size_tier" className={s.input} defaultValue={waqf.size_tier || ""}>
            <option value="">غير محددة</option>
            <option value="large">كبير (200 مليون ريال فأكثر)</option>
            <option value="medium">متوسط (50 إلى 200 مليون)</option>
            <option value="small">صغير (أقل من 50 مليون)</option>
            <option value="direct_use">انتفاع مباشر</option>
          </select>
        </div>
        {field("total_shares", "إجمالي أسهم الوقف", { hint: "لتوزيع الريع بالحصص", dir: "ltr" })}
      </div>

      <p className={s.label}>التسجيل لدى الهيئة العامة للأوقاف</p>
      <div className={s.row}>
        {field("registration_number", "رقم التسجيل", { dir: "ltr" })}
        {field("gaw_registered_at", "تاريخ التسجيل", { type: "date" })}
      </div>
      <div className={s.row}>
        {field("gaw_certificate_expires", "انتهاء شهادة التسجيل", { type: "date" })}
        <div />
      </div>

      <p className={s.label}>صك الوقف</p>
      <div className={s.row}>
        {field("deed_number", "رقم الصك", { dir: "ltr" })}
        {field("deed_date", "تاريخ الصك", { type: "date" })}
      </div>
      <div className={s.row}>
        {field("deed_court", "الجهة المصدرة للصك", { hint: "المحكمة أو كتابة العدل" })}
        <div />
      </div>
      <div className={s.field}>
        <label htmlFor="wp-purposes">مصارف الوقف كما في الصك<small>يُستند إليها في التحقق من التوزيعات</small></label>
        <textarea id="wp-purposes" name="purposes" className={s.input} rows={3} defaultValue={waqf.purposes || ""} maxLength={4000} />
      </div>
      <div className={s.field}>
        <label htmlFor="wp-description">نبذة عن الوقف<small>(اختياري)</small></label>
        <textarea id="wp-description" name="description" className={s.input} rows={2} defaultValue={waqf.description || ""} maxLength={2000} />
      </div>

      {state.message && <div className={`${s.alert} ${state.status === "ok" ? s.alertOk : s.alertErr}`} role={state.status === "ok" ? "status" : "alert"}>{state.message}</div>}
      <button className={s.btn} disabled={pending}>{pending ? "جارٍ الحفظ…" : "حفظ ملف الوقف"}</button>
    </form>
  );
}
