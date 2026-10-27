"use client";

import { useActionState } from "react";
import { submitContact, type ContactField, type ContactState } from "@/lib/site-actions";

const initial: ContactState = { status: "idle" };

function FieldError({ f, msg }: { f: ContactField; msg?: string }) {
  return msg ? <span className="mw-field__err" id={`mw-c-${f}-err`}>{msg}</span> : null;
}

export default function ContactForm() {
  const [state, action, pending] = useActionState(submitContact, initial);

  if (state.status === "ok") {
    return (
      <div className="mw-form__status mw-form__status--ok" role="status">
        <b>شكراً لتواصلك معنا.</b> وصلتنا رسالتك، وسيتواصل معك فريق مَشيد قريباً.
      </div>
    );
  }

  const err = (f: ContactField) => state.errors?.[f];
  const field = (f: ContactField) => ({
    id: `mw-c-${f}`,
    name: f,
    defaultValue: state.values?.[f] ?? "",
    "aria-invalid": err(f) ? true : undefined,
    "aria-describedby": err(f) ? `mw-c-${f}-err` : undefined,
  });

  return (
    <form className="mw-form" action={action} noValidate>
      {state.status === "error" && state.message && (
        <div className="mw-form__status mw-form__status--err" role="alert">{state.message}</div>
      )}
      <div className="mw-form__row">
        <div className="mw-field">
          <label htmlFor="mw-c-name">الاسم</label>
          <input {...field("name")} type="text" autoComplete="name" required maxLength={120} />
          <FieldError f="name" msg={err("name")} />
        </div>
        <div className="mw-field">
          <label htmlFor="mw-c-phone">رقم الجوال</label>
          <input {...field("phone")} type="tel" inputMode="tel" autoComplete="tel" placeholder="05xxxxxxxx" required maxLength={20} />
          <FieldError f="phone" msg={err("phone")} />
        </div>
      </div>
      <div className="mw-form__row">
        <div className="mw-field">
          <label htmlFor="mw-c-organization">اسم الجهة أو الوقف</label>
          <input {...field("organization")} type="text" autoComplete="organization" required maxLength={160} />
          <FieldError f="organization" msg={err("organization")} />
        </div>
        <div className="mw-field">
          <label htmlFor="mw-c-email">البريد الإلكتروني<small>(اختياري)</small></label>
          <input {...field("email")} type="email" inputMode="email" autoComplete="email" maxLength={160} />
          <FieldError f="email" msg={err("email")} />
        </div>
      </div>
      <div className="mw-field">
        <label htmlFor="mw-c-message">رسالتك</label>
        <textarea {...field("message")} required maxLength={4000} placeholder="كيف يمكننا مساعدتك؟ نظام مَشيد، إدراج فرصة استثمارية، أو استشارة." />
        <FieldError f="message" msg={err("message")} />
      </div>
      <div className="mw-hp" aria-hidden="true">
        <label htmlFor="mw-c-website">الموقع</label>
        <input id="mw-c-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="mw-form__foot">
        <button type="submit" className="mw-btn mw-btn--primary mw-btn--lg" disabled={pending}>
          {pending ? "جارٍ الإرسال…" : "إرسال"}
        </button>
      </div>
    </form>
  );
}
