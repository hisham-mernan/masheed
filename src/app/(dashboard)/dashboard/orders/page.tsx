import Link from "next/link";
import { REQUEST_STATUS } from "@/components/platform/options";
import { PageHead, Pill, s } from "@/components/platform/ui";
import { dateAr, getAccountContext, SAR } from "@/lib/account";
import { payRequest } from "@/lib/platform-actions";

export const metadata = { title: "طلباتي | مَشيد" };

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ paid?: string }> }) {
  const { paid } = await searchParams;
  const ctx = await getAccountContext();
  const [{ data: requests }, { data: services }] = await Promise.all([
    ctx!.supabase.from("service_requests").select("id, service_id, service_title, kind, status, quote_amount, quote_note, quoted_at, paid_at, created_at")
      .eq("account_id", ctx!.account?.id || "").order("created_at", { ascending: false }),
    ctx!.supabase.from("services").select("id, price"),
  ]);
  const priceOf = (id: string) => Number(services?.find((x) => x.id === id)?.price || 0);

  return (
    <div className="fade-in">
      <PageHead title="طلباتي" lead="طلبات الخدمات وعروض الأسعار وحالة الدفع." action={<Link href="/dashboard/services" className={s.btn}>طلب خدمة جديدة</Link>} />
      {paid && <div className={`${s.alert} ${s.alertOk}`} style={{ marginBottom: "1rem" }} role="status">تم الدفع بنجاح، وسيتواصل معك فريق مَشيد لبدء العمل.</div>}
      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead><tr><th>الطلب</th><th>الخدمة</th><th>التاريخ</th><th>المبلغ</th><th>الحالة</th><th></th></tr></thead>
          <tbody>
            {requests?.length ? requests.map((r) => {
              const due = r.status === "quoted" ? Number(r.quote_amount) : r.kind === "direct" && r.status === "new" ? priceOf(r.service_id) : null;
              const shown = r.quote_amount ?? (r.kind === "direct" ? priceOf(r.service_id) : null);
              return (
                <tr key={r.id}>
                  <td className={s.num}>REQ-{r.id.slice(0, 8).toUpperCase()}</td>
                  <td><b>{r.service_title}</b>{r.quote_note && <div className={s.muted} style={{ maxWidth: 380, marginTop: 4 }}>{r.quote_note}</div>}</td>
                  <td className={s.num}>{dateAr(r.created_at)}</td>
                  <td className={s.num}>{shown ? `${SAR(shown)} ر.س` : <span className={s.muted}>بانتظار عرض السعر</span>}</td>
                  <td><Pill map={REQUEST_STATUS} value={r.status} /></td>
                  <td>
                    {due ? (
                      <form action={payRequest}><input type="hidden" name="id" value={r.id} /><button className={`${s.btn} ${s.btnSm}`}>ادفع الآن</button></form>
                    ) : null}
                  </td>
                </tr>
              );
            }) : (
              <tr><td colSpan={6} className={s.empty}>لا توجد طلبات بعد. <Link href="/dashboard/services">استعرض الخدمات</Link></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
