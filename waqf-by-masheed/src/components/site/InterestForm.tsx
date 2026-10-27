"use client";

import { useActionState, useState } from "react";
import Icon from "./Icon";
import { registerInterest, type InterestField, type InterestState } from "@/lib/interest-actions";
import { fmt } from "@/lib/listings";

const initial: InterestState = { status: "idle" };

function FieldError({ f, msg }: { f: string; msg?: string }) {
  return msg ? <span className="wb-err" id={`wq-i-${f}-err`}>{msg}</span> : null;
}

// Register interest in one listing (shares + amount) or, with no listing, in future opportunities.
// Nothing is paid here — the team follows up with the documents and next steps.
export default function InterestForm({ listing }: { listing?: { id: string; price: number; maxShares: number } }) {
  const [state, action, pending] = useActionState(registerInterest, initial);
  const [shares, setShares] = useState(1);

  if (state.status === "ok") {
    return (
      <div className="wb-done" role="status">
        <span className="wb-done__seal"><Icon n="check" s={32} w={2.5} /></span>
        <h3 className="wb-h3" style={{ fontSize: 22 }}>سجّلنا اهتمامك.</h3>
        <p className="wb-p">{listing ? "سيتواصل معك فريق وقف مَشيد بتفاصيل الفرصة وخطوات الاستثمار." : "سنتواصل معك عند طرح الفرص الوقفية القادمة."}</p>
      </div>
    );
  }

  const err = (f: InterestField) => state.errors?.[f];
  const field = (f: InterestField) => ({
    id: `wq-i-${f}`,
    name: f,
    defaultValue: state.values?.[f] ?? "",
    "aria-invalid": err(f) ? true : undefined,
    "aria-describedby": err(f) ? `wq-i-${f}-err` : undefined,
  });
  const max = listing?.maxShares || 1;
  const step = (d: number) => setShares((n) => Math.max(1, Math.min(max, n + d)));

  return (
    <form className="wb-form" action={action} noValidate>
      {listing && <input type="hidden" name="listing" value={listing.id} />}
      {state.status === "error" && state.message && <div className="wb-alert wb-alert--err" role="alert">{state.message}</div>}
      {listing && (
        <>
          <input type="hidden" name="shares" value={shares} />
          <div className="wb-field">
            <span className="wb-label" id="wq-shares-label">عدد الحصص</span>
            <div className="wb-qty" role="group" aria-labelledby="wq-shares-label">
              <button type="button" onClick={() => step(1)} aria-label="زيادة"><Icon n="plus" s={16} /></button>
              <output className="wb-num" aria-live="polite">{shares}</output>
              <button type="button" onClick={() => step(-1)} aria-label="إنقاص"><Icon n="minus" s={16} /></button>
            </div>
            <FieldError f="shares" msg={err("shares")} />
          </div>
          {listing.price > 0 && (
            <div className="wb-rows">
              <div><span>قيمة الحصة</span><span><span className="wb-num">{fmt(listing.price)}</span> ر.س</span></div>
              <div className="is-total"><span>المبلغ التقريبي</span><b><span className="wb-num">{fmt(shares * listing.price)}</span> ر.س</b></div>
            </div>
          )}
        </>
      )}
      <div className="wb-form2">
        <div className="wb-field">
          <label className="wb-label" htmlFor="wq-i-name">الاسم</label>
          <input className="wb-input" {...field("name")} type="text" autoComplete="name" maxLength={120} />
          <FieldError f="name" msg={err("name")} />
        </div>
        <div className="wb-field">
          <label className="wb-label" htmlFor="wq-i-phone">رقم الجوال</label>
          <input className="wb-input" {...field("phone")} type="tel" inputMode="tel" autoComplete="tel" placeholder="05xxxxxxxx" maxLength={20} />
          <FieldError f="phone" msg={err("phone")} />
        </div>
      </div>
      <div className="wb-form2">
        <div className="wb-field">
          <label className="wb-label" htmlFor="wq-i-email">البريد الإلكتروني<small>(اختياري)</small></label>
          <input className="wb-input" {...field("email")} type="email" inputMode="email" autoComplete="email" maxLength={160} />
          <FieldError f="email" msg={err("email")} />
        </div>
        <div className="wb-field">
          <label className="wb-label" htmlFor="wq-i-investor_type">نوع المستثمر</label>
          <select className="wb-input" {...field("investor_type")} defaultValue={state.values?.investor_type ?? "individual"}>
            <option value="individual">فرد</option>
            <option value="entity">جهة / منشأة</option>
            <option value="waqf">جهة وقفية</option>
          </select>
          <FieldError f="investor_type" msg={err("investor_type")} />
        </div>
      </div>
      {!listing && (
        <div className="wb-field">
          <label className="wb-label" htmlFor="wq-i-message">ما نوع الفرص التي تهمك؟<small>(اختياري)</small></label>
          <textarea className="wb-input" {...field("message")} maxLength={4000} placeholder="مثال: فرص عقارية في الرياض بحد أدنى ١٠,٠٠٠ ر.س" />
        </div>
      )}
      <div className="wb-hp" aria-hidden="true">
        <label htmlFor="wq-i-website">الموقع</label>
        <input id="wq-i-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <button type="submit" className="wb-btn wb-btn--pri wb-btn--lg wb-btn--block" disabled={pending}>
        {pending ? "جارٍ الإرسال…" : "سجّل اهتمامك"}
      </button>
      <p className="wb-hint" style={{ margin: 0 }}>تسجيل الاهتمام ليس استثماراً ولا يتطلب أي دفع؛ يتواصل معك الفريق بالتفاصيل.</p>
    </form>
  );
}
