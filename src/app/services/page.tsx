import { HowFields, DirectNote, SysShell, WbHead, WbPageHead } from "@/components/system-site/parts";
import { ServicesBrowser } from "@/components/system-site/ServicesBrowser";
import { getServices } from "@/components/system-site/catalog";
import { sysMeta } from "@/lib/seo";

export const revalidate = 300;

export const metadata = sysMeta("/services", "الخدمات | نظام مَشيد",
  "الخدمات المهنية للجهات الوقفية: تأسيس الوقف، وتقييم الأداء المالي والتشغيلي، والاستشارات المرئية، والمتابعة التنفيذية السنوية.");

export default async function ServicesPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const [{ type }, services] = await Promise.all([searchParams, getServices()]);
  return (
    <SysShell>
      <WbPageHead crumbs={[[null, "الخدمات"]]} title="الخدمات المهنية"
        lead="تُقدَّم بصورة مستقلة عن اشتراك النظام، عدا المتابعة التنفيذية فتشمل باقة، وتُسعَّر بحسب نطاق العمل." />
      <section className="wb-page">
        <div className="wb-wrap"><ServicesBrowser key={type ?? "all"} services={services} initialType={type} /></div>
      </section>
      <section className="wb-sec">
        <div className="wb-wrap"><WbHead title="كيف تحصل على الخدمة" /><DirectNote /></div>
        <HowFields />
      </section>
    </SysShell>
  );
}
