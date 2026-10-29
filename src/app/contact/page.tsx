import type { Metadata } from "next";
import { SysShell, WbPageHead } from "@/components/system-site/parts";
import SysContactForm from "@/components/system-site/SysContactForm";
import Icon, { type IconName } from "@/components/system-site/Icon";

export const metadata: Metadata = {
  title: "تواصل معنا | نظام مَشيد",
  description: "اطلب عرضاً توضيحياً لنظام مَشيد، أو اسأل عن الباقات والخدمات.",
};

const WAYS: [IconName, string, React.ReactNode][] = [
  ["mail", "البريد الإلكتروني", <a key="m" href="mailto:info@masheedwaqf.com">info@masheedwaqf.com</a>],
  ["clock", "ساعات العمل", "الأحد – الخميس، ٩ صباحاً – ٥ مساءً"],
  ["message", "الدعم للمشتركين", "من داخل النظام، بحسب زمن الاستجابة في باقتك"],
];

export default function ContactPage() {
  return (
    <SysShell>
      <WbPageHead crumbs={[[null, "تواصل معنا"]]} title="تحدّث مع فريق مَشيد" lead="عرض توضيحي، سؤال عن الباقات، أو استفسار عن خدمة — نرد خلال يوم عمل." />
      <section className="wb-page">
        <div className="wb-wrap wb-contactgrid">
          <div className="wb-panel wb-panel--form"><SysContactForm /></div>
          <aside>
            {WAYS.map(([i, t, d]) => (
              <div key={t} className="wb-panel wb-way">
                <span className="wb-ico"><Icon n={i} s={20} /></span>
                <div><b>{t}</b><span className="wb-p" style={{ fontSize: 14.5 }}>{d}</span></div>
              </div>
            ))}
          </aside>
        </div>
      </section>
    </SysShell>
  );
}
