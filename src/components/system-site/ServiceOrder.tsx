"use client";

import Link from "next/link";
import { useActionState, useCallback, useEffect, useState } from "react";
import Icon from "./Icon";
import type { Service } from "./data";
import { ASSET_RANGES, CONSULT_TYPES, HOLDING_TYPES, ORG_TYPES } from "@/components/platform/options";
import { submitServiceRequest, type ServiceRequestField, type ServiceRequestState } from "@/lib/site-actions";

const initial: ServiceRequestState = { status: "idle" };

function FieldError({ f, msg }: { f: string; msg?: string }) {
  return msg ? <span className="wb-err" id={`wb-o-${f}-err`}>{msg}</span> : null;
}

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", k); document.body.style.overflow = ""; };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="wb-modal" onClick={onClose}>
      <div className="wb-modal__box" role="dialog" aria-modal="true" aria-labelledby="wb-modal-title" onClick={(e) => e.stopPropagation()}>
        <div className="wb-modal__head">
          <h3 id="wb-modal-title">{title}</h3>
          <button type="button" className="wb-x" onClick={onClose} aria-label="إغلاق"><Icon n="x" s={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

// Price box on a service page. Priced-per-case services open the request form («اطلب الخدمة»);
// fixed-price ones are bought or booked inside the platform, with the form as a fallback.
export default function ServiceOrder({ s }: { s: Service }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(submitServiceRequest, initial);
  const close = useCallback(() => setOpen(false), []);
  const request = s.type === "request";

  const err = (f: ServiceRequestField) => state.errors?.[f];
  const field = (f: ServiceRequestField) => ({
    id: `wb-o-${f}`,
    name: f,
    defaultValue: state.values?.[f] ?? "",
    "aria-invalid": err(f) ? true : undefined,
    "aria-describedby": err(f) ? `wb-o-${f}-err` : undefined,
  });
  const select = (f: ServiceRequestField, label: string, opts: [string, string][]) => (
    <div className="wb-field">
      <label className="wb-label" htmlFor={`wb-o-${f}`}>{label}</label>
      <select className="wb-input" {...field(f)}>
        <option value="">— اختر —</option>
        {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  );
  const pairs = (list: string[]) => list.map((x) => [x, x] as [string, string]);

  return (
    <>
      <aside className="wb-box">
        <div className="wb-price"><small>السعر</small><b style={{ fontSize: 24, lineHeight: 1.45 }}>{s.priceLabel.replace(/^السعر:\s*/, "")}</b></div>
        {request ? (
          <>
            <button type="button" className="wb-btn wb-btn--pri wb-btn--lg wb-btn--block" onClick={() => setOpen(true)}><Icon n="send" s={18} />اطلب الخدمة</button>
            <p className="wb-hint" style={{ margin: 0 }}>املأ البيانات وسنتواصل معك بعرض سعر يناسب حالتك. لا يُطلب أي دفع قبل موافقتك على العرض.</p>
          </>
        ) : (
          <>
            <Link className="wb-btn wb-btn--pri wb-btn--lg wb-btn--block" href="/register"><Icon n={s.type === "booking" ? "message" : "cart"} s={18} />{s.type === "booking" ? "احجز جلستك من المنصة" : "اشترك من المنصة"}</Link>
            <p className="wb-hint" style={{ margin: 0 }}>
              {s.type === "booking" ? "اختر المستشار والموعد (الأحد–الخميس، 9 ص–5 م) وادفع إلكترونياً." : "ادفع إلكترونياً وتُفعَّل الباقة المشمولة فوراً."}{" "}
              لديك حساب؟ <Link href="/login">سجّل الدخول</Link>
            </p>
            <button type="button" className="wb-btn wb-btn--ghost wb-btn--block" onClick={() => setOpen(true)}>أو اطلب تواصل الفريق</button>
          </>
        )}
      </aside>

      <Modal open={open} onClose={close} title={state.status === "ok" ? "" : "اطلب الخدمة"}>
        {state.status === "ok" ? (
          <div className="wb-done" role="status">
            <span className="wb-done__seal"><Icon n="check" s={32} w={2.5} /></span>
            <h3 className="wb-h3" style={{ fontSize: 24 }}>وصلنا طلبك.</h3>
            <p className="wb-p">رقم الطلب <b className="wb-num">{state.ref}</b>. سيتواصل معك فريق مَشيد {request ? "بعرض سعر يناسب حالتك." : "بخصوص طلبك."}</p>
            <button type="button" className="wb-btn wb-btn--pri wb-btn--block" onClick={close}>تم</button>
          </div>
        ) : (
          <form className="wb-form" action={action} noValidate>
            <input type="hidden" name="service" value={s.id} />
            {state.status === "error" && state.message && <div className="wb-alert wb-alert--err" role="alert">{state.message}</div>}
            <div className="wb-rows"><div><span>نوع الخدمة</span><b>{s.title}</b></div></div>
            <div className="wb-form2">
              <div className="wb-field">
                <label className="wb-label" htmlFor="wb-o-name">الاسم الكامل</label>
                <input className="wb-input" {...field("name")} type="text" autoComplete="name" maxLength={120} />
                <FieldError f="name" msg={err("name")} />
              </div>
              <div className="wb-field">
                <label className="wb-label" htmlFor="wb-o-organization">اسم الجهة أو الوقف</label>
                <input className="wb-input" {...field("organization")} type="text" autoComplete="organization" maxLength={160} />
                <FieldError f="organization" msg={err("organization")} />
              </div>
            </div>
            <div className="wb-form2">
              <div className="wb-field">
                <label className="wb-label" htmlFor="wb-o-phone">الجوال</label>
                <input className="wb-input" {...field("phone")} type="tel" inputMode="tel" autoComplete="tel" placeholder="05xxxxxxxx" maxLength={20} />
                <FieldError f="phone" msg={err("phone")} />
              </div>
              <div className="wb-field">
                <label className="wb-label" htmlFor="wb-o-email">البريد<small>(اختياري)</small></label>
                <input className="wb-input" {...field("email")} type="email" inputMode="email" autoComplete="email" placeholder="name@company.com" maxLength={160} />
                <FieldError f="email" msg={err("email")} />
              </div>
            </div>
            <div className="wb-form2">
              {select("org_type", "نوع الجهة", pairs(ORG_TYPES))}
              {select("holding_type", "نوع الوقف", pairs(HOLDING_TYPES))}
            </div>
            {s.type === "booking" ? (
              <div className="wb-form2">
                {select("consult_type", "نوع الاستشارة", Object.entries(CONSULT_TYPES))}
                <div className="wb-field">
                  <label className="wb-label" htmlFor="wb-o-preferred_time">موعد مفضّل<small>(اختياري)</small></label>
                  <input className="wb-input" {...field("preferred_time")} type="text" maxLength={120} placeholder="مثال: الثلاثاء صباحاً" />
                </div>
              </div>
            ) : select("size", "عدد الأصول تقريباً", pairs(ASSET_RANGES))}
            <div className="wb-field">
              <label className="wb-label" htmlFor="wb-o-details">اكتب لنا باختصار ما تحتاجه</label>
              <textarea className="wb-input" {...field("details")} maxLength={4000} />
              <FieldError f="details" msg={err("details")} />
            </div>
            <label className="wb-check"><input type="checkbox" name="consent" defaultChecked={!!state.values} /> أوافق على سياسة الخصوصية</label>
            <FieldError f="consent" msg={err("consent")} />
            <div className="wb-hp" aria-hidden="true">
              <label htmlFor="wb-o-website">الموقع</label>
              <input id="wb-o-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
            </div>
            <button type="submit" className="wb-btn wb-btn--pri wb-btn--lg wb-btn--block" disabled={pending}>
              {pending ? "جارٍ الإرسال…" : "أرسل الطلب"}
            </button>
          </form>
        )}
      </Modal>
    </>
  );
}
