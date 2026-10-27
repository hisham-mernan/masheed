"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestService, type FormState } from "@/lib/platform-actions";
import { ASSET_RANGES, HOLDING_TYPES, ORG_TYPES } from "./options";
import { FieldError, s } from "./ui";

const initial: FormState = { status: "idle" };
type Defaults = { name: string; organization: string; phone: string; email: string };

// «اطلب الخدمة» inside the platform — same fields as the website form, prefilled from the account
export default function ServiceRequestForm({ service, defaults }: { service: string; defaults: Defaults }) {
  const [state, action, pending] = useActionState(requestService, initial);
  if (state.status === "ok") {
    return (
      <div className={`${s.alert} ${s.alertOk}`} role="status">
        وصلنا طلبك. سنراجع بياناتك ونرسل لك عرض السعر، وستجده في <Link href="/dashboard/orders">طلباتي</Link> لتدفعه من هناك.
      </div>
    );
  }
  const v = { ...defaults, ...state.values } as Record<string, string>;
  const e = state.errors || {};
  const input = (name: string, extra: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <input id={"sr-" + name} name={name} className={s.input} defaultValue={v[name]} aria-invalid={!!e[name]} aria-describedby={e[name] ? `sr-${name}-err` : undefined} {...extra} />
  );
  const select = (name: string, opts: string[]) => (
    <select id={"sr-" + name} name={name} className={s.input} defaultValue={v[name] || ""}>
      <option value="">اختر</option>
      {opts.map((o) => <option key={o}>{o}</option>)}
    </select>
  );

  return (
    <form action={action} className={s.form} noValidate>
      <input type="hidden" name="service" value={service} />
      {state.status === "error" && state.message && <div className={`${s.alert} ${s.alertErr}`} role="alert">{state.message}</div>}
      <div className={s.row}>
        <div className={s.field}><label htmlFor="sr-name">الاسم الكامل</label>{input("name", { maxLength: 120, autoComplete: "name" })}<FieldError id="sr-name" msg={e.name} /></div>
        <div className={s.field}><label htmlFor="sr-organization">اسم الجهة أو الوقف</label>{input("organization", { maxLength: 160 })}<FieldError id="sr-organization" msg={e.organization} /></div>
      </div>
      <div className={s.row}>
        <div className={s.field}><label htmlFor="sr-phone">الجوال</label>{input("phone", { type: "tel", inputMode: "tel", placeholder: "05xxxxxxxx", maxLength: 20, dir: "ltr", style: { textAlign: "right" } })}<FieldError id="sr-phone" msg={e.phone} /></div>
        <div className={s.field}><label htmlFor="sr-email">البريد<small>(اختياري)</small></label>{input("email", { type: "email", inputMode: "email", placeholder: "name@company.com", maxLength: 160, dir: "ltr", style: { textAlign: "right" } })}<FieldError id="sr-email" msg={e.email} /></div>
      </div>
      <div className={s.row}>
        <div className={s.field}><label htmlFor="sr-org_type">نوع الجهة</label>{select("org_type", ORG_TYPES)}</div>
        <div className={s.field}><label htmlFor="sr-holding_type">نوع الوقف</label>{select("holding_type", HOLDING_TYPES)}</div>
      </div>
      <div className={s.field}><label htmlFor="sr-waqf_size">عدد الأصول تقريباً</label>{select("waqf_size", ASSET_RANGES)}</div>
      <div className={s.field}><label htmlFor="sr-details">اكتب لنا باختصار ما تحتاجه</label><textarea id="sr-details" name="details" className={s.input} defaultValue={v.details} maxLength={4000} /></div>
      <label className={s.check}><input type="checkbox" name="consent" defaultChecked={!!state.values} /> أوافق على سياسة الخصوصية</label>
      <FieldError id="sr-consent" msg={e.consent} />
      <button className={`${s.btn} ${s.btnBlock}`} disabled={pending}>{pending ? "جارٍ الإرسال…" : "أرسل الطلب"}</button>
    </form>
  );
}
