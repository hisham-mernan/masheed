import Link from "next/link";
import BookingPicker from "@/components/platform/BookingPicker";
import { CONSULT_TYPES } from "@/components/platform/options";
import { PageHead, s } from "@/components/platform/ui";
import { getAccountContext, SAR, nowMs } from "@/lib/account";
import type { DaySlots } from "@/lib/slots";

export const metadata = { title: "اطلب جلسة استشارية | مَشيد" };
export const dynamic = "force-dynamic";

const dayOf = (iso: string) => new Date(new Date(iso).getTime() + 3 * 3600_000).toISOString().slice(0, 10);

export default async function NewBookingPage() {
  const ctx = await getAccountContext();
  const db = ctx!.supabase;
  const [{ data: open }, { data: svc }] = await Promise.all([
    db.rpc("consult_open_slots", { p_from: new Date().toISOString(), p_to: new Date(nowMs() + 22 * 86_400_000).toISOString() }),
    db.from("services").select("price").eq("id", "consulting").single(),
  ]);
  const days: DaySlots[] = [];
  for (const t of ((open as string[]) || []).map((x) => new Date(x).toISOString())) {
    const d = dayOf(t);
    if (days.at(-1)?.date !== d) days.push({ date: d, slots: [] });
    days.at(-1)!.slots.push(t);
  }

  return (
    <div className="fade-in">
      <PageHead
        title="اطلب جلسة استشارية"
        lead={`جلسة مرئية مدتها 30 دقيقة، من الأحد إلى الخميس بين 9 صباحاً و5 مساءً. اختر نوع الاستشارة والموعد وصف طلبك، ويعيّن فريق مَشيد المستشار المناسب. سعر الجلسة ${SAR(svc?.price)} ر.س، وتُحتسب الجلسات المجانية في باقتك أولاً.`}
        action={<Link href="/dashboard/bookings" className={`${s.btn} ${s.btnGhost}`}>حجوزاتي</Link>}
      />
      {days.length ? <BookingPicker days={days} types={CONSULT_TYPES} /> : <div className={`${s.alert} ${s.alertWarn}`}>لا توجد مواعيد متاحة حالياً.</div>}
    </div>
  );
}
