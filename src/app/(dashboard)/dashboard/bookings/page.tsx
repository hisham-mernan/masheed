import Link from "next/link";
import { headers } from "next/headers";
import CopyLink from "@/components/platform/CopyLink";
import { BOOKING_STATUS, CONSULT_TYPES } from "@/components/platform/options";
import { PageHead, Pill, s } from "@/components/platform/ui";
import { dateAr, getAccountContext, nowMs } from "@/lib/account";
import { payBooking } from "@/lib/platform-actions";

export const metadata = { title: "حجوزاتي | مَشيد" };

export default async function BookingsPage({ searchParams }: { searchParams: Promise<{ booked?: string }> }) {
  const { booked } = await searchParams;
  const ctx = await getAccountContext();
  const { data: bookings } = await ctx!.supabase.from("bookings")
    .select("id, starts_at, ends_at, status, hold_until, paid_via, room_code, topic, experts(name, type)")
    .eq("account_id", ctx!.account?.id || "").order("starts_at", { ascending: false });
  const h = await headers();
  const origin = `${h.get("x-forwarded-proto") || "https"}://${h.get("host")}`;
  const now = nowMs();

  return (
    <div className="fade-in">
      <PageHead title="حجوزاتي" lead="جلساتك الاستشارية وروابطها. يمكن مشاركة رابط الجلسة مع أي شخص تريد حضوره." action={<Link href="/dashboard/bookings/new" className={s.btn}>احجز جلسة</Link>} />
      {booked && <div className={`${s.alert} ${s.alertOk}`} style={{ marginBottom: "1rem" }} role="status">تأكد حجزك من رصيد جلسات باقتك.</div>}
      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead><tr><th>الموعد (الرياض)</th><th>المستشار</th><th>الحالة</th><th>رابط الجلسة</th></tr></thead>
          <tbody>
            {bookings?.length ? bookings.map((b) => {
              const ex = b.experts as unknown as { name: string; type: string } | null;
              const held = b.status === "pending_payment" && b.hold_until && new Date(b.hold_until).getTime() > now;
              const status = b.status === "pending_payment" && !held ? "cancelled" : b.status;
              const url = `${origin}/meet/${b.room_code}`;
              return (
                <tr key={b.id}>
                  <td className={s.num}>{dateAr(b.starts_at, { dateStyle: "full" })}<div className={s.muted}>{dateAr(b.starts_at, { timeStyle: "short" })} – {dateAr(b.ends_at, { timeStyle: "short" })}</div></td>
                  <td><b>{ex?.name}</b><div className={s.muted}>استشارة {CONSULT_TYPES[ex?.type || ""] || ""}{b.topic ? ` — ${b.topic}` : ""}</div></td>
                  <td><Pill map={BOOKING_STATUS} value={status} />{b.paid_via === "package" && <div className={s.muted}>من رصيد الباقة</div>}</td>
                  <td>
                    {b.status === "confirmed" && b.room_code ? (
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <a className={`${s.btn} ${s.btnSm}`} href={`/meet/${b.room_code}`} target="_blank" rel="noopener">دخول الجلسة</a>
                        <CopyLink url={url} />
                      </div>
                    ) : held ? (
                      <form action={payBooking}><input type="hidden" name="id" value={b.id} /><button className={`${s.btn} ${s.btnSm}`}>أكمل الدفع</button></form>
                    ) : <span className={s.muted}>—</span>}
                  </td>
                </tr>
              );
            }) : (
              <tr><td colSpan={4} className={s.empty}>لا توجد حجوزات بعد. <Link href="/dashboard/bookings/new">احجز جلستك الأولى</Link></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
