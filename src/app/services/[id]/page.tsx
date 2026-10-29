import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Checks, kindLabel, ServiceList, Steps, SysShell, WbPageHead } from "@/components/system-site/parts";
import ServiceOrder from "@/components/system-site/ServiceOrder";
import Icon from "@/components/system-site/Icon";
import { getServices } from "@/components/system-site/catalog";
import { sysMeta } from "@/lib/seo";

type Props = { params: Promise<{ id: string }> };

export const revalidate = 300;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const s = (await getServices()).find((x) => x.id === id);
  return s ? sysMeta("/services/" + s.id, `${s.title} | نظام مَشيد`, s.desc) : {};
}

export default async function ServicePage({ params }: Props) {
  const { id } = await params;
  const all = await getServices();
  const s = all.find((x) => x.id === id);
  if (!s) notFound();

  const how: [string, string][] = s.type === "request"
    ? [["أرسل طلبك", "املأ نموذج «اطلب الخدمة»"], ["مراجعة الطلب", "يراجع الفريق بياناتك ونطاق العمل"], ["عرض السعر", "يصلك عرض يناسب حالتك"], ["الدفع والتنفيذ", "تبدأ الخدمة بعد موافقتك ودفعك"]]
    : s.type === "booking"
    ? [["أنشئ حسابك", "تجربة مجانية للنظام 15 يوماً"], ["اختر المستشار والموعد", "جلسة 30 دقيقة، من الأحد إلى الخميس، 9 ص إلى 5 م"], ["ادفع وادخل الجلسة", "رابط جلسة مرئية يمكنك مشاركته"]]
    : [["أنشئ حسابك", "تجربة مجانية للنظام 15 يوماً"], ["اشترك وادفع", "دفع إلكتروني آمن"], ["تبدأ المتابعة", "وتُفعَّل الباقة المشمولة فوراً"]];
  const related = all.filter((x) => x.id !== s.id).slice(0, 2);

  return (
    <SysShell>
      <WbPageHead crumbs={[["/services", "الخدمات"], [null, s.title]]} title={s.title} lead={s.desc} kind={kindLabel(s)} />
      <section className="wb-page">
        <div className="wb-wrap wb-detail">
          <div>
            <div className="wb-panel rv">
              <h2 className="wb-h3 wb-panel__title">ما تشمله الخدمة</h2>
              <Checks items={s.includes} />
            </div>
            <div className="wb-panel rv" style={{ ["--i" as string]: 1 }}>
              <h2 className="wb-h3 wb-panel__title">كيف تتم</h2>
              <Steps list={how} />
            </div>
          </div>
          <ServiceOrder s={s} />
        </div>
      </section>
      {related.length > 0 && (
        <section className="wb-wrap wb-related">
          <h2 className="wb-h2 rv">خدمات أخرى</h2>
          <ServiceList services={related} />
          <div className="wb-more"><Link className="wb-link" href="/services">كل الخدمات<Icon n="arrow" s={18} /></Link></div>
        </section>
      )}
    </SysShell>
  );
}
