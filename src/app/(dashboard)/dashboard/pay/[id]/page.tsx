import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import MoyasarForm from "@/components/platform/MoyasarForm";
import { PageHead, s } from "@/components/platform/ui";
import { getAccountContext, SAR, nowMs } from "@/lib/account";

export const metadata = { title: "الدفع | مَشيد" };

const BACK: Record<string, [string, string]> = {
  service: ["/dashboard/orders", "طلباتي"], package: ["/dashboard/billing", "الباقة والفوترة"], booking: ["/dashboard/bookings", "حجوزاتي"],
};

export default async function PayPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ result?: string }> }) {
  const [{ id }, { result }] = await Promise.all([params, searchParams]);
  const ctx = await getAccountContext();
  const { data: pay } = await ctx!.supabase.from("payments").select("id, purpose, ref_id, amount_halalas, description, status, created_at").eq("id", id).single();
  if (!pay) notFound();
  const [backHref, backLabel] = BACK[pay.purpose];

  if (pay.status === "paid") {
    return (
      <div className="fade-in" style={{ maxWidth: 560 }}>
        <PageHead title="تم الدفع بنجاح" />
        <div className={`${s.alert} ${s.alertOk}`} role="status">
          استلمنا {SAR(pay.amount_halalas / 100)} ر.س مقابل «{pay.description}».
          {pay.purpose === "package" && " فُعّلت باقتك."}
          {pay.purpose === "booking" && " تأكد موعدك، وستجد رابط الجلسة في حجوزاتي."}
        </div>
        <p style={{ marginTop: "1rem" }}><Link className={s.btn} href={backHref}>انتقل إلى {backLabel}</Link></p>
      </div>
    );
  }

  const h = await headers();
  const origin = `${h.get("x-forwarded-proto") || "https"}://${h.get("host")}`;
  const publishableKey = process.env.NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY || "";
  const stale = nowMs() - new Date(pay.created_at).getTime() > 2 * 3600_000;

  return (
    <div className="fade-in" style={{ maxWidth: 560 }}>
      <PageHead title="إتمام الدفع" lead="الدفع عبر بوابة ميسّر الآمنة. لا نحفظ بيانات بطاقتك." action={<Link href={backHref} className={`${s.btn} ${s.btnGhost}`}>رجوع</Link>} />
      {result === "failed" && <div className={`${s.alert} ${s.alertErr}`} style={{ marginBottom: "1rem" }} role="alert">لم تكتمل عملية الدفع. تأكد من بيانات البطاقة وحاول مجدداً.</div>}
      {result === "pending" && <div className={`${s.alert} ${s.alertWarn}`} style={{ marginBottom: "1rem" }}>لم نتأكد من الدفع بعد. إن خُصم المبلغ فسيظهر هنا خلال دقائق.</div>}
      <section className={s.panel}>
        <div className={s.summary} style={{ marginBottom: "1.25rem" }}>
          <div><span>البيان</span><span>{pay.description}</span></div>
          <div className={s.total}><span>المبلغ (شامل الضريبة)</span><span className={s.num}>{SAR(pay.amount_halalas / 100)} ر.س</span></div>
        </div>
        {!publishableKey ? (
          <div className={`${s.alert} ${s.alertWarn}`}>بوابة الدفع غير مهيأة بعد. تواصل مع فريق مَشيد.</div>
        ) : stale ? (
          <div className={`${s.alert} ${s.alertWarn}`}>انتهت صلاحية رابط الدفع هذا. ابدأ الدفع من جديد من صفحة {backLabel}.</div>
        ) : (
          <MoyasarForm
            amount={pay.amount_halalas}
            description={pay.description}
            publishableKey={publishableKey}
            callbackUrl={`${origin}/api/payments/callback?pid=${pay.id}`}
            paymentId={pay.id}
          />
        )}
      </section>
    </div>
  );
}
