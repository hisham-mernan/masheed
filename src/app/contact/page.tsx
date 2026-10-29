import { SysShell, WbFaq, WbPageHead } from "@/components/system-site/parts";
import { SYS_FAQ } from "@/components/system-site/data";
import SysContactForm from "@/components/system-site/SysContactForm";
import { sysMeta } from "@/lib/seo";

export const metadata = sysMeta("/contact", "تواصل معنا | نظام مَشيد", "اطلب عرضاً توضيحياً لنظام مَشيد، أو اسأل عن الباقات والخدمات.");

const WAYS: [string, React.ReactNode][] = [
  ["البريد الإلكتروني", <a key="m" href="mailto:info@masheedwaqf.com">info@masheedwaqf.com</a>],
  ["ساعات العمل", "من الأحد إلى الخميس، ٩ صباحاً إلى ٥ مساءً"],
  ["الدعم للمشتركين", "من داخل النظام، بحسب زمن الاستجابة في باقتك"],
];

export default function ContactPage() {
  return (
    <SysShell>
      <WbPageHead crumbs={[[null, "تواصل معنا"]]} title="تحدّث مع فريق مَشيد" lead="عرض توضيحي، سؤال عن الباقات، أو استفسار عن خدمة. نرد خلال يوم عمل." />
      <section className="wb-page">
        <div className="wb-wrap wb-contactgrid">
          <div className="wb-panel wb-panel--form rv"><SysContactForm /></div>
          <ul className="wb-ways">
            {WAYS.map(([t, d], i) => (
              <li key={t} className="rv" style={{ ["--i" as string]: i + 1 }}><b>{t}</b><span>{d}</span></li>
            ))}
          </ul>
        </div>
      </section>
      <section className="wb-sec">
        <div className="wb-wrap wb-split">
          <div className="wb-split__aside"><h2 className="wb-h2 rv">قبل أن تراسلنا.</h2><p className="wb-p rv" style={{ ["--i" as string]: 1 }}>أكثر ما يسأل عنه من يتواصل معنا.</p></div>
          <WbFaq items={SYS_FAQ} />
        </div>
      </section>
    </SysShell>
  );
}
