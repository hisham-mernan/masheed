import Link from "next/link";
import { PageHead, s } from "@/components/platform/ui";
import { getAccountContext } from "@/lib/account";

export const metadata = { title: "الخدمات المهنية | مَشيد" };

const CTA: Record<string, string> = { quote: "اطلب الخدمة", fixed: "اشترك في الخدمة", booking: "احجز جلسة" };

export default async function ServicesPage() {
  const ctx = await getAccountContext();
  const { data: services } = await ctx!.supabase.from("services").select("id, title, subtitle, includes, price_label, pricing").eq("active", true).order("sort");

  return (
    <div className="fade-in">
      <PageHead
        title="الخدمات المهنية"
        lead="تُقدَّم بصورة مستقلة عن اشتراك النظام، عدا المتابعة التنفيذية فتشمل باقة، وتُسعَّر بحسب نطاق العمل."
        action={<Link href="/dashboard/orders" className={`${s.btn} ${s.btnGhost}`}>طلباتي</Link>}
      />
      <div className={s.grid}>
        {(services || []).map((v) => (
          <article key={v.id} className={s.card}>
            <div className={s.cardTop}>
              <h2>{v.title}</h2>
              <small>{v.subtitle}</small>
              <div className={s.price}>{v.price_label}</div>
            </div>
            <p className={s.label}>ما تشمله</p>
            <ul className={s.list}>{(v.includes as string[]).map((x) => <li key={x}>{x}</li>)}</ul>
            <Link className={`${s.btn} ${s.btnBlock}`} href={v.pricing === "booking" ? "/dashboard/bookings/new" : `/dashboard/services/${v.id}`}>{CTA[v.pricing]}</Link>
          </article>
        ))}
      </div>
      <div className={`${s.alert} ${s.alertInfo}`} style={{ marginTop: "1.5rem" }}>
        <b>ما الذي يحدد السعر؟</b> تنطبق على التأسيس والتقييم: عدد الأصول وحجمها، ودرجة التعقيد، ونطاق الخدمات، والمتطلبات القانونية والإدارية.
        الاستشارات: 199 ريالًا للجلسة. المتابعة التنفيذية: سعرها ثابت، ولا تشمل إدارة الوقف أو تنفيذ الأعمال نيابة عن الجهة، وتُسعَّر الأعمال الإضافية بصورة مستقلة.
      </div>
    </div>
  );
}
