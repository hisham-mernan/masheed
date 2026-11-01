import { notFound } from "next/navigation";
import StatusButtons from "@/components/dashboard/StatusButtons";
import AdminForm from "@/components/platform/AdminForm";
import AdminTabs from "@/components/platform/AdminTabs";
import { BOOKING_STATUS, CONSULT_TYPES } from "@/components/platform/options";
import { PageHead, Pill, s } from "@/components/platform/ui";
import { dateAr, getAccountContext, nowMs } from "@/lib/account";
import { assignConsultant, setBookingStatus } from "@/lib/platform-actions";

export const metadata = { title: "الحجوزات | إدارة مَشيد" };

export default async function AdminBookingsPage() {
  const ctx = await getAccountContext();
  if (!ctx?.isPlatformAdmin) notFound();
  const since = new Date(nowMs() - 30 * 86_400_000).toISOString();
  const [{ data: rows }, { data: orphans }, { data: experts }, { data: rules }] = await Promise.all([
    ctx.supabase.from("bookings").select("id, starts_at, ends_at, status, hold_until, paid_via, room_code, topic, consult_type, expert_id, experts(name, type), accounts(name, phone)")
      .gte("starts_at", since).order("starts_at").limit(300),
    // Paid bookings whose slot was lost after the hold expired: rebook or refund by hand
    ctx.supabase.from("payments").select("ref_id").eq("purpose", "booking").eq("status", "paid"),
    ctx.supabase.from("experts").select("id, name, type").eq("available", true).order("name"),
    ctx.supabase.from("expert_availability").select("expert_id, weekday, start_time, end_time"),
  ]);
  const paidIds = new Set((orphans || []).map((p) => p.ref_id));
  const now = nowMs();
  const active = (b: { status: string; hold_until: string | null }) =>
    b.status === "confirmed" || (b.status === "pending_payment" && !!b.hold_until && new Date(b.hold_until).getTime() > now);
  // Consultants working at that time and not in another session then
  const freeFor = (b: { id: string; starts_at: string; ends_at: string }) => {
    const st = new Date(b.starts_at).getTime(), en = new Date(b.ends_at).getTime();
    const loc = new Date(st + 3 * 3600_000), mins = loc.getUTCHours() * 60 + loc.getUTCMinutes(), len = (en - st) / 60_000;
    const hm = (x: string) => { const [h, m] = x.split(":").map(Number); return h * 60 + m; };
    return (experts || []).filter((e) =>
      (rules || []).some((r) => r.expert_id === e.id && r.weekday === loc.getUTCDay() && mins >= hm(r.start_time) && mins + len <= hm(r.end_time))
      && !(rows || []).some((o) => o.id !== b.id && o.expert_id === e.id && active(o) && new Date(o.starts_at).getTime() < en && new Date(o.ends_at).getTime() > st));
  };
  const waiting = (rows || []).filter((b) => !b.expert_id && active(b)).length;

  return (
    <div className="fade-in">
      <PageHead title="الحجوزات" lead="طلبات الاستشارة تصل هنا: اقرأ تفاصيل الطلب وعيّن المستشار المناسب له. رابط الجلسة يُرسل للعميل، وأرسله للمستشار ليدخل به." />
      <AdminTabs active="bookings" />
      {waiting > 0 && <div className={`${s.alert} ${s.alertWarn}`} style={{ marginBottom: "1rem" }} role="status">{waiting} {waiting === 1 ? "طلب ينتظر" : "طلبات تنتظر"} تعيين مستشار.</div>}
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
                  <td>
                    {ex ? <b>{ex.name}</b> : <span className={`${s.pill} ${s.pWait}`}>بانتظار التعيين</span>}
                    <div className={s.muted}>استشارة {CONSULT_TYPES[b.consult_type || ex?.type || ""] || ""}</div>
                    {active(b) && (() => {
                      const free = freeFor(b);
                      const form = free.length
                        ? <AdminForm compact action={assignConsultant} hidden={{ id: b.id }} submit={ex ? "غيّر المستشار" : "عيّن المستشار"} fields={[
                            { name: "expert", label: "المستشار", type: "select", options: free.map((e) => [e.id, `${e.name} — ${CONSULT_TYPES[e.type] || e.type}`] as [string, string]) },
                          ]} />
                        : <div className={s.muted}>لا يوجد مستشار متاح في هذا الموعد</div>;
                      return ex ? <details style={{ marginTop: 6 }}><summary className={s.muted}>تغيير المستشار</summary>{form}</details> : <div style={{ marginTop: 6 }}>{form}</div>;
                    })()}
                  </td>
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
