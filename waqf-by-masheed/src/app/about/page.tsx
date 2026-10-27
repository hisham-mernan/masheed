import type { Metadata } from "next";
import Icon, { type IconName } from "@/components/site/Icon";
import { Checks, WbCta, WbFaq, WbHead, WbPageHead, WqShell } from "@/components/site/parts";
import { SYSTEM_URL, WQ_FAQ } from "@/components/site/data";
import { getListings } from "@/lib/listings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "عن المنصة | وقف مَشيد",
  description: "منصة استثمارٍ للفرص الوقفية المؤهّلة، مرتبطة بنظام مَشيد لإدارة الأوقاف، بمسار مراجعة قبل النشر.",
};

export default async function AboutPage() {
  const open = (await getListings()).filter((l) => l.status === "approved").length;
  return (
    <WqShell openCount={open}>
      <WbPageHead crumbs={[[null, "عن المنصة"]]} title="منصة استثمارٍ للفرص الوقفية المؤهّلة"
        lead="إذا كان نظام مَشيد هو البيئة التي تُدار فيها الجهة الوقفية من الداخل، فإن وقف مَشيد هو البيئة التي تصل من خلالها الفرص إلى المستثمرين." />
      <section className="wb-sec" style={{ paddingTop: 72 }}>
        <div className="wb-wrap wb-grid3">
          {([["eye", "نافذة استثمارية موحّدة", "استعراض تفاصيل الفرصة، وفهم طبيعتها، ودراسة العائد المتوقع في مكانٍ واحد."], ["shield", "الثقة تبدأ قبل الاستثمار", "مراجعة للبيانات المالية والتقييمات المستقلة والمخاطر والحوكمة قبل النشر."], ["layers", "ربط مباشر مع نظام مَشيد", "تُستفاد بيانات الوقف الموجودة في النظام، فيصبح الإدراج ملفاً استثمارياً متكاملاً."]] as [IconName, string, string][]).map(([i, t, d]) => (
            <div key={t} className="wb-card"><span className="wb-ico"><Icon n={i} s={22} /></span><h3 className="wb-h3">{t}</h3><p className="wb-p">{d}</p></div>
          ))}
        </div>
      </section>
      <section className="wb-sec wb-sec--canvas">
        <div className="wb-wrap">
          <WbHead center eyebrow="مسار الإدراج" title="كيف تتحول الفرصة الوقفية إلى فرصةٍ استثمارية." />
          <div className="wq-how wq-how--5">
            {([["send", "طلب إدراج", "تتقدم الجهة الوقفية بطلبها"], ["fileText", "تجهيز الفرصة", "البيانات والتقييمات والمستندات"], ["search", "مراجعة ودراسة", "مالية وقانونية وحوكمية"], ["checkSquare", "اعتماد", "من لجنة المراجعة"], ["eye", "نشر", "تُعرض على المستثمرين"]] as [IconName, string, string][]).map(([i, t, d], n) => (
              <div key={t} className="wq-how__s"><span className="wq-how__n wb-num">{n + 1}</span><span className="wb-ico"><Icon n={i} s={22} /></span><h3 className="wb-h3">{t}</h3><p className="wb-p">{d}</p></div>
            ))}
          </div>
        </div>
      </section>
      <section className="wb-sec">
        <div className="wb-wrap wb-grid2">
          {([["قبل الاستثمار", ["استعراض الفرص ومقارنتها", "قراءة تفاصيل الأصل والمؤشرات المالية", "مراجعة المستندات والإفصاحات", "حاسبة العائد ومحاكاة السيناريوهات"]], ["بعد الاستثمار", ["متابعة أداء استثمارك", "التحديثات والتقارير الدورية", "مراحل التنفيذ لكل مشروع", "توزيعات الأرباح بحسب شروط الفرصة"]]] as [string, string[]][]).map(([t, l]) => (
            <div key={t} className="wb-card"><h3 className="wb-h3" style={{ fontSize: 24 }}>{t}</h3><Checks items={l} /></div>
          ))}
        </div>
      </section>
      <section className="wb-sec" style={{ paddingTop: 0 }}>
        <div className="wb-wrap wb-split">
          <div className="wb-split__aside"><span className="wb-eyebrow">الأسئلة الشائعة</span><h2 className="wb-h2">عن المنصة.</h2></div>
          <WbFaq items={WQ_FAQ} />
        </div>
      </section>
      <WbCta title="جهة وقفية لديها فرصة مؤهّلة؟" text="قدّم طلب إدراج، وسيتواصل معك فريق المراجعة لتجهيز ملفك الاستثماري."
        actions={<a className="wb-btn wb-btn--light wb-btn--lg" href={SYSTEM_URL + "/contact"}>اطلب إدراج فرصة</a>} />
    </WqShell>
  );
}
