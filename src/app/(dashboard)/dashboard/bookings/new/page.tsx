import Link from "next/link";
import BookingPicker, { type ExpertOption } from "@/components/platform/BookingPicker";
import { CONSULT_TYPES } from "@/components/platform/options";
import { PageHead, s } from "@/components/platform/ui";
import { getAccountContext, SAR, nowMs } from "@/lib/account";
import { freeSlots, type Rule } from "@/lib/slots";

export const metadata = { title: "احجز جلسة استشارية | مَشيد" };
export const dynamic = "force-dynamic";

export default async function NewBookingPage() {
  const ctx = await getAccountContext();
  const db = ctx!.supabase;
  const [{ data: experts }, { data: rules }, { data: svc }] = await Promise.all([
    db.from("experts").select("id, name, specialty, type, bio, slot_minutes").eq("available", true).in("type", Object.keys(CONSULT_TYPES)).order("name"),
    db.from("expert_availability").select("expert_id, weekday, start_time, end_time"),
    db.from("services").select("price").eq("id", "consulting").single(),
  ]);
  const from = new Date().toISOString();
  const to = new Date(nowMs() + 22 * 86_400_000).toISOString();
  const options: ExpertOption[] = await Promise.all((experts || []).map(async (e) => {
    const { data: busy } = await db.rpc("expert_busy_slots", { p_expert: e.id, p_from: from, p_to: to });
    const mine = (rules || []).filter((r) => r.expert_id === e.id) as Rule[];
    return { id: e.id, name: e.name, specialty: e.specialty, type: e.type, bio: e.bio, days: freeSlots(mine, (busy as string[]) || [], e.slot_minutes || 30) };
  }));

  return (
    <div className="fade-in">
      <PageHead
        title="احجز جلسة استشارية"
        lead={`جلسة مرئية مدتها 30 دقيقة مع مستشار متخصص، من الأحد إلى الخميس بين 9 صباحاً و5 مساءً. سعر الجلسة ${SAR(svc?.price)} ر.س، وتُحتسب الجلسات المجانية في باقتك أولاً.`}
        action={<Link href="/dashboard/bookings" className={`${s.btn} ${s.btnGhost}`}>حجوزاتي</Link>}
      />
      {options.length ? <BookingPicker experts={options} types={CONSULT_TYPES} /> : <div className={`${s.alert} ${s.alertWarn}`}>لا يوجد مستشارون متاحون حالياً.</div>}
    </div>
  );
}
