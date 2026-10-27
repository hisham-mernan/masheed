import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import ServiceRequestForm from "@/components/platform/ServiceRequestForm";
import { PageHead, s } from "@/components/platform/ui";
import { getAccountContext, SAR } from "@/lib/account";
import { buyService } from "@/lib/platform-actions";

export default async function ServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await getAccountContext();
  const { data: v } = await ctx!.supabase.from("services").select("*").eq("id", id).eq("active", true).single();
  if (!v) notFound();
  if (v.pricing === "booking") redirect("/dashboard/bookings/new");
  const { data: pkg } = v.package_id ? await ctx!.supabase.from("packages").select("name").eq("id", v.package_id).single() : { data: null };

  return (
    <div className="fade-in">
      <PageHead title={v.title} lead={v.description || v.subtitle} action={<Link href="/dashboard/services" className={`${s.btn} ${s.btnGhost}`}>كل الخدمات</Link>} />
      <div className={s.grid2}>
        <section className={s.card}>
          <div className={s.cardTop}><h3>{v.title}</h3><small>{v.subtitle}</small><div className={s.price}>{v.price_label}</div></div>
          <p className={s.label}>ما تشمله</p>
          <ul className={s.list}>{(v.includes as string[]).map((x) => <li key={x}>{x}</li>)}</ul>
          {pkg && <p className={s.hint}>* تشمل اشتراكاً في باقة «{pkg.name}» لمدة {v.package_months || 12} شهراً، يُفعَّل تلقائياً بعد الدفع.</p>}
        </section>

        {v.pricing === "quote" ? (
          <section className={s.panel}>
            <h2>اطلب الخدمة</h2>
            <p>املأ البيانات وسنتواصل معك بعرض سعر يناسب حالتك، ثم تدفعه من صفحة «طلباتي».</p>
            <ServiceRequestForm
              service={v.id}
              defaults={{ organization: ctx!.account?.name || "", phone: ctx!.account?.phone || "", email: ctx!.user.email || "", name: ctx!.profile?.full_name && ctx!.profile.full_name !== ctx!.account?.name ? ctx!.profile.full_name : "" }}
            />
          </section>
        ) : (
          <section className={s.panel}>
            <h2>ملخص الاشتراك</h2>
            <div className={s.summary} style={{ margin: "1rem 0 1.25rem" }}>
              <div><span>الخدمة</span><span>{v.title}</span></div>
              <div><span>المدة</span><span>سنة كاملة</span></div>
              <div className={s.total}><span>الإجمالي (شامل الضريبة)</span><span className={s.num}>{SAR(v.price)} ر.س</span></div>
            </div>
            <form action={buyService}>
              <input type="hidden" name="service" value={v.id} />
              <button className={`${s.btn} ${s.btnBlock}`}>ادفع واشترك</button>
            </form>
            <p className={s.hint} style={{ marginTop: "0.75rem" }}>الدفع عبر بوابة ميسّر الآمنة (مدى، فيزا، ماستركارد).</p>
          </section>
        )}
      </div>
    </div>
  );
}
