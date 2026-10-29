"use client";

import { useActionState } from "react";
import Icon from "./Icon";
import { SYS_TOPICS } from "./data";
import { submitContact, type ContactField, type ContactState } from "@/lib/site-actions";

const initial: ContactState = { status: "idle" };

function FieldError({ f, msg }: { f: string; msg?: string }) {
  return msg ? <span className="wb-err" id={`wb-c-${f}-err`}>{msg}</span> : null;
}

export default function SysContactForm() {
  const [state, action, pending] = useActionState(submitContact, initial);

  if (state.status === "ok") {
    return (
      <div className="wb-done" style={{ padding: "40px 0" }} role="status">
        <span className="wb-done__seal"><Icon n="send" s={28} /></span>
        <h3 className="wb-h3" style={{ fontSize: 24 }}>وصلتنا رسالتك.</h3>
        <p className="wb-p">سيتواصل معك أحد أعضاء فريق مَشيد قريباً.</p>
      </div>
    );
  }

  const err = (f: ContactField) => state.errors?.[f];
  const field = (f: ContactField) => ({
    id: `wb-c-${f}`,
    name: f,
    defaultValue: state.values?.[f] ?? "",
    "aria-invalid": err(f) ? true : undefined,
    "aria-describedby": err(f) ? `wb-c-${f}-err` : undefined,
  });

  return (
    <form className="wb-form" action={action} noValidate>
      <input type="hidden" name="source" value="system" />
      {state.status === "error" && state.message && <div className="wb-alert wb-alert--err" role="alert">{state.message}</div>}
      <div className="wb-form2">
        <div className="wb-field">
          <label className="wb-label" htmlFor="wb-c-name">الاسم</label>
          <input className="wb-input" {...field("name")} type="text" autoComplete="name" maxLength={120} />
          <FieldError f="name" msg={err("name")} />
        </div>
        <div className="wb-field">
          <label className="wb-label" htmlFor="wb-c-organization">الجهة الوقفية</label>
          <input className="wb-input" {...field("organization")} type="text" autoComplete="organization" maxLength={160} />
          <FieldError f="organization" msg={err("organization")} />
        </div>
      </div>
      <div className="wb-form2">
        <div className="wb-field">
          <label className="wb-label" htmlFor="wb-c-phone">الجوال</label>
          <input className="wb-input" {...field("phone")} type="tel" inputMode="tel" autoComplete="tel" placeholder="05xxxxxxxx" maxLength={20} />
          <FieldError f="phone" msg={err("phone")} />
        </div>
        <div className="wb-field">
          <label className="wb-label" htmlFor="wb-c-email">البريد الإلكتروني<small>(اختياري)</small></label>
          <input className="wb-input" {...field("email")} type="email" inputMode="email" autoComplete="email" maxLength={160} />
          <FieldError f="email" msg={err("email")} />
        </div>
      </div>
      <div className="wb-field">
        <label className="wb-label" htmlFor="wb-c-topic">موضوع التواصل</label>
        <select className="wb-input" {...field("topic")}>
          <option value="">اختر من القائمة</option>
          {SYS_TOPICS.map((t) => <option key={t}>{t}</option>)}
        </select>
        <FieldError f="topic" msg={err("topic")} />
      </div>
      <div className="wb-field">
        <label className="wb-label" htmlFor="wb-c-message">رسالتك</label>
        <textarea className="wb-input" {...field("message")} maxLength={4000} />
        <FieldError f="message" msg={err("message")} />
      </div>
      <div className="wb-hp" aria-hidden="true">
        <label htmlFor="wb-c-website">الموقع</label>
        <input id="wb-c-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <button type="submit" className="wb-btn wb-btn--pri wb-btn--lg" style={{ alignSelf: "flex-start" }} disabled={pending}>
        <Icon n="send" s={18} />{pending ? "جارٍ الإرسال…" : "إرسال"}
      </button>
    </form>
  );
}
