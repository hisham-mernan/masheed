import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ServiceCard, Steps, SysShell, TypeTag, WbPageHead } from "@/components/system-site/parts";
import ServiceOrder from "@/components/system-site/ServiceOrder";
import Icon from "@/components/system-site/Icon";
import { getServices } from "@/components/system-site/catalog";

type Props = { params: Promise<{ id: string }> };

export const revalidate = 300;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const s = (await getServices()).find((x) => x.id === id);
  return s ? { title: `${s.title} | نظام مَشيد`, description: s.desc } : {};
}

export default async function ServicePage({ params }: Props) {
  const { id } = await params;
  const all = await getServices();
  const s = all.find((x) => x.id === id);
  if (!s) notFound();

  const how: [string, string][] = s.type === "request"
    ? [["أرسل طلبك", "املأ نموذج «اطلب الخدمة»"], ["مراجعة الطلب", "يراجع الفريق بياناتك ونطاق العمل"], ["عرض السعر", "يصلك عرض يناسب حالتك"], ["الدفع والتنفيذ", "تبدأ الخدمة بعد موافقتك ودفعك"]]
    : s.type === "booking"
    ? [["أنشئ حسابك", "تجربة مجانية للنظام 15 يوماً"], ["اختر المستشار والموعد", "جلسة 30 دقيقة، الأحد–الخميس 9 ص–5 م"], ["ادفع وادخل الجلسة", "رابط جلسة مرئية يمكنك مشاركته"]]
    : [["أنشئ حسابك", "تجربة مجانية للنظام 15 يوماً"], ["اشترك وادفع", "دفع إلكتروني آمن"], ["تبدأ المتابعة", "وتُفعَّل الباقة المشمولة فوراً"]];
  const related = all.filter((x) => x.id !== s.id).slice(0, 2);

  return (
    <SysShell>
      <WbPageHead crumbs={[["/services", "الخدمات"], [null, s.title]]} title={s.title} lead={s.desc}>
        <TypeTag direct={s.type !== "request"} />
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
                <h2 className="wb-h3">خدمات أخرى</h2>
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
