"use client";

import { useActionState, useState } from "react";
import { bookConsultation, type FormState } from "@/lib/platform-actions";
import type { DaySlots } from "@/lib/slots";
import { s } from "./ui";

export type ExpertOption = { id: string; name: string; specialty: string | null; type: string; bio: string | null; days: DaySlots[] };

const initial: FormState = { status: "idle" };
const TZ = { timeZone: "Asia/Riyadh" } as const;
const dayName = (d: string) => new Date(d + "T12:00:00Z").toLocaleDateString("ar-SA-u-nu-latn", { ...TZ, weekday: "long" });
const dayNum = (d: string) => new Date(d + "T12:00:00Z").toLocaleDateString("ar-SA-u-nu-latn", { ...TZ, day: "numeric", month: "short" });
const time = (iso: string) => new Date(iso).toLocaleTimeString("ar-SA-u-nu-latn", { ...TZ, hour: "numeric", minute: "2-digit" });

// Consultation type → consultant → day → 30-minute slot → topic
export default function BookingPicker({ experts, types }: { experts: ExpertOption[]; types: Record<string, string> }) {
  const [state, action, pending] = useActionState(bookConsultation, initial);
  const available = Object.keys(types).filter((t) => experts.some((e) => e.type === t));
  const [type, setType] = useState<string | undefined>(available[0]);
  const list = experts.filter((e) => e.type === type);
  const [expertId, setExpertId] = useState<string | undefined>(list[0]?.id);
  const expert = experts.find((e) => e.id === expertId && e.type === type) || list[0];
  const firstOpen = (e?: ExpertOption) => e?.days.find((d) => d.slots.length)?.date;
  const [date, setDate] = useState<string | undefined>(firstOpen(expert));
  const [slot, setSlot] = useState<string>();
  const day = expert?.days.find((d) => d.date === date);

  const pickType = (t: string) => { setType(t); const e = experts.find((x) => x.type === t); setExpertId(e?.id); setDate(firstOpen(e)); setSlot(undefined); };
  const pickExpert = (e: ExpertOption) => { setExpertId(e.id); setDate(firstOpen(e)); setSlot(undefined); };

  return (
    <form action={action} className={s.form}>
      {state.status === "error" && state.message && <div className={`${s.alert} ${s.alertErr}`} role="alert">{state.message}</div>}

      <div className={s.field}>
        <span>نوع الاستشارة</span>
        <div className={s.days} role="group" aria-label="نوع الاستشارة">
          {available.map((t) => (
            <button key={t} type="button" className={s.day} aria-pressed={t === type} onClick={() => pickType(t)}><b>{types[t]}</b></button>
          ))}
        </div>
      </div>

      <div className={s.field}>
        <span>المستشار</span>
        <div className={s.experts}>
          {list.map((e) => (
            <button key={e.id} type="button" className={s.choiceBtn} aria-pressed={e.id === expert?.id} onClick={() => pickExpert(e)}>
              <b>{e.name}</b>
              {e.specialty && <span>{e.specialty}</span>}
            </button>
          ))}
        </div>
      </div>

      {expert && (
        <div className={s.panel}>
          <div className={s.field}>
            <span>اليوم</span>
            <div className={s.days} role="group" aria-label="اليوم">
              {expert.days.filter((d) => d.slots.length).map((d) => (
                <button key={d.date} type="button" className={s.day} aria-pressed={d.date === date} onClick={() => { setDate(d.date); setSlot(undefined); }}>
                  <span>{dayName(d.date)}</span><b>{dayNum(d.date)}</b>
                </button>
              ))}
            </div>
          </div>
          <div className={s.field} style={{ marginTop: "1rem" }}>
            <span>الوقت (بتوقيت الرياض)</span>
            {day?.slots.length ? (
              <div className={s.slots} role="group" aria-label="الوقت">
                {day.slots.map((t) => <button key={t} type="button" className={s.slot} aria-pressed={t === slot} onClick={() => setSlot(t)}>{time(t)}</button>)}
              </div>
            ) : <p className={s.hint}>لا توجد مواعيد متاحة في هذا اليوم.</p>}
          </div>
        </div>
      )}

      <div className={s.field}>
        <label htmlFor="bk-topic">موضوع الاستشارة<small>(اختياري)</small></label>
        <textarea id="bk-topic" name="topic" className={s.input} maxLength={1000} placeholder="اكتب باختصار ما تريد مناقشته ليستعد المستشار" />
      </div>
      <input type="hidden" name="expert" value={expert?.id || ""} />
      <input type="hidden" name="starts_at" value={slot || ""} />
      <button className={s.btn} disabled={pending || !slot}>
        {pending ? "جارٍ الحجز…" : slot ? `احجز ${dayName(date!)} ${time(slot)}` : "اختر موعداً"}
      </button>
      <p className={s.hint}>يُحجز الموعد لك 15 دقيقة لإتمام الدفع. بعد التأكيد يصلك رابط الجلسة ويمكنك مشاركته مع من تريد حضوره.</p>
    </form>
  );
}
