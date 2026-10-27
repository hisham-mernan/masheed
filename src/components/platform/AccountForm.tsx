"use client";

import { useActionState } from "react";
import { updateAccount, type FormState } from "@/lib/platform-actions";
import { FieldError, s } from "./ui";

const initial: FormState = { status: "idle" };

export default function AccountForm({ name, phone }: { name: string; phone: string }) {
  const [state, action, pending] = useActionState(updateAccount, initial);
  const v = { name, phone, ...state.values };
  return (
    <form action={action} className={s.form} noValidate>
      <div className={s.row}>
        <div className={s.field}>
          <label htmlFor="ac-name">اسم الجهة أو الوقف</label>
          <input id="ac-name" name="name" className={s.input} defaultValue={v.name} maxLength={160} aria-invalid={!!state.errors?.name} />
          <FieldError id="ac-name" msg={state.errors?.name} />
        </div>
        <div className={s.field}>
          <label htmlFor="ac-phone">رقم الجوال</label>
          <input id="ac-phone" name="phone" type="tel" inputMode="tel" className={s.input} defaultValue={v.phone} maxLength={20} dir="ltr" style={{ textAlign: "right" }} aria-invalid={!!state.errors?.phone} />
          <FieldError id="ac-phone" msg={state.errors?.phone} />
        </div>
      </div>
      {state.message && <div className={`${s.alert} ${state.status === "ok" ? s.alertOk : s.alertErr}`}>{state.message}</div>}
      <div><button className={s.btn} disabled={pending}>{pending ? "جارٍ الحفظ…" : "احفظ"}</button></div>
    </form>
  );
}
