import type { Metadata } from "next";
import { SysFlows, SysShell, WbHead, WbPageHead } from "@/components/system-site/parts";
import { ServicesBrowser } from "@/components/system-site/ServicesBrowser";

export const metadata: Metadata = {
  title: "الخدمات | نظام مَشيد",
  description: "خدمات تشغيلية واستشارية للجهات الوقفية: جلسات استشارية، تدريب، إدخال بيانات، دراسات جدوى، حوكمة ومراجعة قانونية.",
};

export default async function ServicesPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type } = await searchParams;
  return (
    <SysShell>
      <WbPageHead crumbs={[[null, "الخدمات"]]} title="خدمات مَشيد"
        lead="خدمات تشغيلية واستشارية للجهات الوقفية. بعضها تطلبه مباشرة بسعرٍ ثابت، وبعضها نُعدّ له عرض سعرٍ بحسب نطاق وقفك." />
      <section className="wb-page">
        <div className="wb-wrap"><ServicesBrowser key={type ?? "all"} initialType={type} /></div>
      </section>
      <section className="wb-sec" style={{ paddingBottom: 0 }}>
        <div className="wb-wrap"><WbHead center title="كيف تحصل على الخدمة" /><SysFlows /></div>
      </section>
    </SysShell>
  );
}
