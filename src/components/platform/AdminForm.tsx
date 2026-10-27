"use client";

import { useActionState } from "react";
import type { FormState } from "@/lib/platform-actions";
import { s } from "./ui";

type Field = { name: string; label: string; type?: "text" | "number" | "textarea" | "select"; options?: [string, string][]; optional?: boolean; placeholder?: string };

const initial: FormState = { status: "idle" };

// Small form for the admin queues (send quote, review listing, grant package)
export default function AdminForm({ action, fields, hidden = {}, submit, compact }: {
  action: (s: FormState, fd: FormData) => Promise<FormState>;
  fields: Field[];
  hidden?: Record<string, string>;
  submit: string;
  compact?: boolean;
}) {
  const [state, run, pending] = useActionState(action, initial);
  return (
    <form action={run} className={s.form} style={compact ? { gap: "0.5rem" } : undefined}>
      {Object.entries(hidden).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      {fields.map((f) => {
        const id = `af-${hidden.id || hidden.account || ""}-${f.name}`;
        return (
          <div className={s.field} key={f.name}>
            <label htmlFor={id}>{f.label}{f.optional && <small>(اختياري)</small>}</label>
            {f.type === "textarea" ? <textarea id={id} name={f.name} className={s.input} placeholder={f.placeholder} style={compact ? { minHeight: 60 } : undefined} />
              : f.type === "select" ? <select id={id} name={f.name} className={s.input}>{f.options?.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
              : <input id={id} name={f.name} className={s.input} placeholder={f.placeholder} inputMode={f.type === "number" ? "decimal" : undefined} />}
          </div>
        );
      })}
      {state.message && <div className={`${s.alert} ${state.status === "ok" ? s.alertOk : s.alertErr}`} role={state.status === "ok" ? "status" : "alert"}>{state.message}</div>}
      <button className={`${s.btn} ${compact ? s.btnSm : ""}`} disabled={pending}>{pending ? "جارٍ الحفظ…" : submit}</button>
    </form>
  );
}
