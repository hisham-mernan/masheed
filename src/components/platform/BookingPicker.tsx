"use client";

import { useActionState, useState } from "react";
import { bookConsultation, type FormState } from "@/lib/platform-actions";
import type { DaySlots } from "@/lib/slots";
import { s } from "./ui";

const initial: FormState = { status: "idle" };
const TZ = { timeZone: "Asia/Riyadh" } as const;
const dayName = (d: string) => new Date(d + "T12:00:00Z").toLocaleDateString("ar-SA-u-nu-latn", { ...TZ, weekday: "long" });
const dayNum = (d: string) => new Date(d + "T12:00:00Z").toLocaleDateString("ar-SA-u-nu-latn", { ...TZ, day: "numeric", month: "short" });
const time = (iso: string) => new Date(iso).toLocaleTimeString("ar-SA-u-nu-latn", { ...TZ, hour: "numeric", minute: "2-digit" });

// Consultation type → day → 30-minute slot → request details. The Masheed team assigns the consultant.
export default function BookingPicker({ days, types }: { days: DaySlots[]; types: Record<string, string> }) {
  const [state, action, pending] = useActionState(bookConsultation, initial);
  const [type, setType] = useState<string>(Object.keys(types)[0]);
  const open = days.filter((d) => d.slots.length);
  const [date, setDate] = useState<string | undefined>(open[0]?.date);
  const [slot, setSlot] = useState<string>();
  const day = open.find((d) => d.date === date);

  return (
    <form action={action} className={s.form}>
      {state.status === "error" && state.message && <div className={`${s.alert} ${s.alertErr}`} role="alert">{state.message}</div>}

      <div className={s.field}>
        <span>نوع الاستشارة</span>
        <div className={s.days} role="group" aria-label="نوع الاستشارة">
          {Object.keys(types).map((t) => (
            <button key={t} type="button" className={s.day} aria-pressed={t === type} onClick={() => setType(t)}><b>{types[t]}</b></button>
          ))}
        </div>
      </div>

      <div className={s.panel}>
        <div className={s.field}>
          <span>اليوم</span>
          <div className={s.days} role="group" aria-label="اليوم">
            {open.map((d) => (
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

      <div className={s.field}>
        <label htmlFor="bk-topic">تفاصيل الطلب</label>
        <textarea id="bk-topic" name="topic" className={s.input} required minLength={10} maxLength={1000} placeholder="صف وقفك وما تحتاج الاستشارة فيه، ليختار فريق مَشيد المستشار الأنسب لطلبك" />
      </div>
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="starts_at" value={slot || ""} />
      <button className={s.btn} disabled={pending || !slot}>
        {pending ? "جارٍ الإرسال…" : slot ? `أرسل الطلب ${dayName(date!)} ${time(slot)}` : "اختر موعداً"}
      </button>
      <p className={s.hint}>يصل طلبك إلى فريق مَشيد ليعيّن المستشار المناسب، ويظهر اسمه في حجوزاتي. يُحجز الموعد لك 15 دقيقة لإتمام الدفع، وبعد التأكيد يصلك رابط الجلسة ويمكنك مشاركته مع من تريد حضوره.</p>
    </form>
  );
}
