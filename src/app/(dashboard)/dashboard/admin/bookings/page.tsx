import { notFound } from "next/navigation";
import StatusButtons from "@/components/dashboard/StatusButtons";
import AdminTabs from "@/components/platform/AdminTabs";
import { BOOKING_STATUS, CONSULT_TYPES } from "@/components/platform/options";
import { PageHead, Pill, s } from "@/components/platform/ui";
import { dateAr, getAccountContext, nowMs } from "@/lib/account";
import { setBookingStatus } from "@/lib/platform-actions";

export const metadata = { title: "الحجوزات | إدارة مَشيد" };

export default async function AdminBookingsPage() {
  const ctx = await getAccountContext();
  if (!ctx?.isPlatformAdmin) notFound();
  const since = new Date(nowMs() - 30 * 86_400_000).toISOString();
  const [{ data: rows }, { data: orphans }] = await Promise.all([
    ctx.supabase.from("bookings").select("id, starts_at, status, hold_until, paid_via, room_code, topic, experts(name, type), accounts(name, phone)")
      .gte("starts_at", since).order("starts_at").limit(300),
    // Paid bookings whose slot was lost after the hold expired: rebook or refund by hand
    ctx.supabase.from("payments").select("ref_id").eq("purpose", "booking").eq("status", "paid"),
  ]);
  const paidIds = new Set((orphans || []).map((p) => p.ref_id));
  const now = nowMs();

  return (
    <div className="fade-in">
      <PageHead title="الحجوزات" lead="جلسات الاستشارة للثلاثين يوماً الماضية والقادمة. رابط الجلسة يُرسل للعميل ويمكن للمستشار الدخول به." />
      <AdminTabs active="bookings" />
      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead><tr><th>الموعد (الرياض)</th><th>المستشار</th><th>العميل</th><th>الحالة</th><th>إجراء</th></tr></thead>
          <tbody>
            {rows?.length ? rows.map((b) => {
              const ex = b.experts as unknown as { name: string; type: string } | null;
              const ac = b.accounts as unknown as { name: string; phone: string | null } | null;
              const expired = b.status === "pending_payment" && (!b.hold_until || new Date(b.hold_until).getTime() <= now);
              const lost = b.status === "cancelled" && paidIds.has(b.id);
              return (
                <tr key={b.id}>
                  <td className={s.num}>{dateAr(b.starts_at, { dateStyle: "medium", timeStyle: "short" })}</td>
                  <td><b>{ex?.name}</b><div className={s.muted}>{CONSULT_TYPES[ex?.type || ""]}</div></td>
                  <td><b>{ac?.name}</b><div className={s.muted} dir="ltr" style={{ textAlign: "right" }}>{ac?.phone}</div>{b.topic && <div className={s.muted}>{b.topic}</div>}</td>
                  <td>
                    <Pill map={BOOKING_STATUS} value={expired ? "cancelled" : b.status} />
                    {b.paid_via && <div className={s.muted}>{b.paid_via === "package" ? "من رصيد الباقة" : "مدفوع"}</div>}
                    {lost && <div className={`${s.pill} ${s.pBad}`} style={{ marginTop: 4 }}>مدفوع والموعد مفقود</div>}
                  </td>
                  <td>
                    {b.status === "confirmed" && (
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                        <a className={`${s.btn} ${s.btnSm}`} href={`/meet/${b.room_code}`} target="_blank" rel="noopener">رابط الجلسة</a>
                        <StatusButtons id={b.id} action={setBookingStatus} options={[{ value: "done", label: "منتهية" }, { value: "cancelled", label: "إلغاء", danger: true }]} />
                      </div>
                    )}
                  </td>
                </tr>
              );
            }) : <tr><td colSpan={5} className={s.empty}>لا توجد حجوزات.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
