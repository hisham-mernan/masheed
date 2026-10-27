import s from "./platform.module.css";

export { s };

export function PageHead({ title, lead, action }: { title: string; lead?: string; action?: React.ReactNode }) {
  return (
    <div className={s.head}>
      <div><h1>{title}</h1>{lead && <p>{lead}</p>}</div>
      {action}
    </div>
  );
}

export function Pill({ map, value }: { map: Record<string, [string, string]>; value: string }) {
  const [label, tone] = map[value] || [value, "pOff"];
  return <span className={`${s.pill} ${s[tone]}`}>{label}</span>;
}

export function FieldError({ id, msg }: { id: string; msg?: string }) {
  return msg ? <span className={s.err} id={id + "-err"}>{msg}</span> : null;
}
