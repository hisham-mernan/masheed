import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ServiceCard, Steps, SysShell, TypeTag, WbPageHead } from "@/components/system-site/parts";
import ServiceOrder from "@/components/system-site/ServiceOrder";
import Icon from "@/components/system-site/Icon";
import { SYS_SERVICES } from "@/components/system-site/data";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return SYS_SERVICES.map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const s = SYS_SERVICES.find((x) => x.id === id);
  return s ? { title: `${s.title} | نظام مَشيد`, description: s.desc } : {};
}

export default async function ServicePage({ params }: Props) {
  const { id } = await params;
  const s = SYS_SERVICES.find((x) => x.id === id);
  if (!s) notFound();

  const how: [string, string][] = s.type === "direct"
    ? [["أرسل طلبك", "اختر الكمية وأرسل بياناتك"], ["التأكيد والدفع", "يتواصل معك الفريق لتأكيد الطلب وجدولته وإتمام الدفع"], ["التنفيذ", "تُنفَّذ الخدمة ويصلك ملخص بالمخرجات"]]
    : [["أرسل طلبك", "وصف مختصر للوقف والنطاق المطلوب"], ["مراجعة النطاق", "خلال يومي عمل"], ["عرض السعر", "مدة تقديرية " + s.dur], ["الدفع والتنفيذ", "تبدأ الخدمة بعد اعتمادك للعرض"]];
  const related = SYS_SERVICES.filter((x) => x.type === s.type && x.id !== s.id).slice(0, 2);

  return (
    <SysShell>
      <WbPageHead crumbs={[["/services", "الخدمات"], [null, s.title]]} title={s.title} lead={s.desc}>
        <TypeTag direct={s.type === "direct"} />
      </WbPageHead>
      <section className="wb-page">
        <div className="wb-wrap wb-detail">
          <div>
            <div className="wb-panel">
              <h2 className="wb-h3 wb-panel__title">ما تشمله الخدمة</h2>
              <ul className="wb-checks">{s.includes.map((i) => <li key={i}><Icon n="check" s={16} w={2.5} />{i}</li>)}</ul>
            </div>
            <div className="wb-panel">
              <h2 className="wb-h3 wb-panel__title">كيف تتم</h2>
              <Steps list={how} style={{ margin: 0 }} />
            </div>
            {related.length > 0 && (
              <div className="wb-related">
                <h2 className="wb-h3">خدمات مشابهة</h2>
                <div className="wb-grid2">{related.map((r) => <ServiceCard key={r.id} s={r} />)}</div>
              </div>
            )}
          </div>
          <ServiceOrder s={s} />
        </div>
      </section>
      <div className="wb-wrap wb-more"><Link className="wb-btn wb-btn--ghost" href="/services">كل الخدمات<Icon n="arrow" s={16} /></Link></div>
    </SysShell>
  );
}
