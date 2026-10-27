"use client";

import { useActionState, useCallback, useEffect, useState } from "react";
import Icon from "./Icon";
import { fmt, type Service } from "./data";
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

// Price box on a service page. Direct services: quantity + order request; scoped services: quote request.
// No payment is taken here — the team confirms the order and follows up.
export default function ServiceOrder({ s }: { s: Service }) {
  const direct = s.type === "direct";
  const [qty, setQty] = useState(1);
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(submitServiceRequest, initial);
  const close = useCallback(() => setOpen(false), []);

  const total = s.type === "direct" ? s.price * qty : 0;
  const vat = Math.round(total - total / 1.15);
  const err = (f: ServiceRequestField) => state.errors?.[f];
  const field = (f: ServiceRequestField) => ({
    id: `wb-o-${f}`,
    name: f,
    defaultValue: state.values?.[f] ?? "",
    "aria-invalid": err(f) ? true : undefined,
    "aria-describedby": err(f) ? `wb-o-${f}-err` : undefined,
  });

  return (
    <>
      <aside className="wb-box">
        {s.type === "direct" ? (
          <>
            <div className="wb-price"><small>السعر لكل {s.unit}</small><b><span className="wb-num">{fmt(s.price)}</span> <em>ر.س</em></b></div>
            <div className="wb-field">
              <span className="wb-label" id="wb-qty-label">الكمية</span>
              <div className="wb-qty" role="group" aria-labelledby="wb-qty-label">
                <button type="button" onClick={() => setQty(Math.min(20, qty + 1))} aria-label="زيادة"><Icon n="plus" s={16} /></button>
                <output className="wb-num" aria-live="polite">{qty}</output>
                <button type="button" onClick={() => setQty(Math.max(1, qty - 1))} aria-label="إنقاص"><Icon n="minus" s={16} /></button>
              </div>
            </div>
            <div className="wb-rows">
              <div><span>المبلغ قبل الضريبة</span><span><span className="wb-num">{fmt(total - vat)}</span> ر.س</span></div>
              <div><span>ضريبة القيمة المضافة ١٥٪</span><span><span className="wb-num">{fmt(vat)}</span> ر.س</span></div>
              <div className="is-total"><span>الإجمالي</span><b><span className="wb-num">{fmt(total)}</span> ر.س</b></div>
            </div>
            <button type="button" className="wb-btn wb-btn--pri wb-btn--lg wb-btn--block" onClick={() => setOpen(true)}><Icon n="cart" s={18} />اطلب الخدمة</button>
            <p className="wb-hint" style={{ margin: 0 }}>لا يُطلب أي دفع الآن؛ يتواصل معك الفريق لتأكيد الطلب وإتمام الدفع.</p>
          </>
        ) : (
          <>
            <div className="wb-price"><small>يبدأ من</small><b><span className="wb-num">{fmt(s.from)}</span> <em>ر.س</em></b></div>
            <div className="wb-rows">
              <div><span>المدة التقديرية</span><b>{s.dur}</b></div>
              <div><span>الرد على الطلب</span><b>خلال يومي عمل</b></div>
              <div><span>السعر النهائي</span><b>بحسب النطاق</b></div>
            </div>
            <button type="button" className="wb-btn wb-btn--pri wb-btn--lg wb-btn--block" onClick={() => setOpen(true)}><Icon n="send" s={18} />اطلب عرض سعر</button>
            <p className="wb-hint" style={{ margin: 0 }}>لا يُطلب أي دفع قبل موافقتك على العرض.</p>
          </>
        )}
      </aside>

      <Modal open={open} onClose={close} title={state.status === "ok" ? "" : direct ? "طلب الخدمة" : "طلب عرض سعر"}>
        {state.status === "ok" ? (
          <div className="wb-done" role="status">
            <span className="wb-done__seal"><Icon n="check" s={32} w={2.5} /></span>
            <h3 className="wb-h3" style={{ fontSize: 24 }}>وصلنا طلبك.</h3>
            <p className="wb-p">رقم الطلب <b className="wb-num">{state.ref}</b>. سيتواصل معك فريق مَشيد {direct ? "لتأكيد الطلب وإتمام الدفع." : "بعد مراجعة النطاق وإعداد عرض السعر."}</p>
            <button type="button" className="wb-btn wb-btn--pri wb-btn--block" onClick={close}>تم</button>
          </div>
        ) : (
          <form className="wb-form" action={action} noValidate>
            <input type="hidden" name="service" value={s.id} />
            <input type="hidden" name="quantity" value={qty} />
            {state.status === "error" && state.message && <div className="wb-alert wb-alert--err" role="alert">{state.message}</div>}
            {s.type === "direct" && (
              <div className="wb-rows">
                <div><span>الخدمة</span><b>{s.title}</b></div>
                <div><span>الكمية</span><b className="wb-num">{qty}</b></div>
                <div className="is-total"><span>الإجمالي شامل الضريبة</span><b><span className="wb-num">{fmt(total)}</span> ر.س</b></div>
              </div>
            )}
            <div className="wb-form2">
              <div className="wb-field">
                <label className="wb-label" htmlFor="wb-o-name">الاسم</label>
                <input className="wb-input" {...field("name")} type="text" autoComplete="name" maxLength={120} />
                <FieldError f="name" msg={err("name")} />
              </div>
              <div className="wb-field">
                <label className="wb-label" htmlFor="wb-o-phone">رقم الجوال</label>
                <input className="wb-input" {...field("phone")} type="tel" inputMode="tel" autoComplete="tel" placeholder="05xxxxxxxx" maxLength={20} />
                <FieldError f="phone" msg={err("phone")} />
              </div>
            </div>
            <div className="wb-form2">
              <div className="wb-field">
                <label className="wb-label" htmlFor="wb-o-organization">اسم الوقف أو الجهة</label>
                <input className="wb-input" {...field("organization")} type="text" autoComplete="organization" maxLength={160} />
                <FieldError f="organization" msg={err("organization")} />
              </div>
              <div className="wb-field">
                <label className="wb-label" htmlFor="wb-o-email">البريد الإلكتروني<small>(اختياري)</small></label>
                <input className="wb-input" {...field("email")} type="email" inputMode="email" autoComplete="email" maxLength={160} />
                <FieldError f="email" msg={err("email")} />
              </div>
            </div>
            {!direct && (
              <div className="wb-field">
                <label className="wb-label" htmlFor="wb-o-size">حجم الوقف التقريبي</label>
                <select className="wb-input" {...field("size")}>
                  <option value="">— اختر —</option>
                  <option>أقل من ١٠ أصول</option>
                  <option>من ١٠ إلى ٥٠ أصلاً</option>
                  <option>أكثر من ٥٠ أصلاً</option>
                </select>
              </div>
            )}
            <div className="wb-field">
              <label className="wb-label" htmlFor="wb-o-details">{direct ? <>ملاحظات<small>(اختياري)</small></> : "صف النطاق المطلوب"}</label>
              <textarea className="wb-input" {...field("details")} maxLength={4000}
                placeholder={direct ? "مثال: نفضّل موعد الجلسة صباحاً" : "مثال: دراسة جدوى لتطوير أرض وقفية في جدة بمساحة ٣,٠٠٠ م²"} />
              <FieldError f="details" msg={err("details")} />
            </div>
            <div className="wb-hp" aria-hidden="true">
              <label htmlFor="wb-o-website">الموقع</label>
              <input id="wb-o-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
            </div>
            <button type="submit" className="wb-btn wb-btn--pri wb-btn--lg wb-btn--block" disabled={pending}>
              {pending ? "جارٍ الإرسال…" : "إرسال الطلب"}
            </button>
          </form>
        )}
      </Modal>
    </>
  );
}
