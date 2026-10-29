import Link from "next/link";
import { DirectNote, HowFields, SysShell, WbClose, WbFaq, WbHead } from "./parts";
import { CommandList, LiveApprovals, PlanIndex, ServiceIndex, StartDialog } from "./Showcase";
import Icon from "./Icon";
import { SYS_FAQ, SYS_MODS } from "./data";
import { getPlans, getServices } from "./catalog";

// Figures set as a ledger; units live in the captions so the numerals form one column.
const LEDGER: [string, string][] = [
  ["19", "وحدة تشغيلية مترابطة"],
  ["7", "مراحل اعتماد قابلة للتخصيص"],
  ["4", "ساعات زمن الاستجابة في الباقات المتقدمة"],
  ["100", "بالمئة من العمليات تُسجَّل في سجل التدقيق"],
];

// system.masheedwaqf.com home. Direction: the product performs (tasteskill v2).
export default async function SysHome() {
  const [services, plans] = await Promise.all([getServices(), getPlans()]);
  return (
    <SysShell>
      <section className="wb-hero">
        <div className="wb-wrap wb-hero__copy">
          <h1 className="wb-h1">
            <span className="wb-mline"><span>نظام تشغيلٍ واحد لكل</span></span>{" "}
            <span className="wb-mline"><span>أعمال الجهة الوقفية.</span></span>
          </h1>
          <div className="wb-hero__row">
            <p className="wb-lead rv" style={{ ["--i" as string]: 3 }}>أصولك، مستفيدوك، ماليتك، عقودك وحوكمتك في بيئةٍ واحدة، بمسارات اعتمادٍ واضحة وسجلٍّ تدقيقيٍّ لكل إجراء.</p>
            <div className="wb-hero__cta rv" style={{ ["--i" as string]: 4 }}>
              <Link className="wb-btn wb-btn--pri wb-btn--lg" href="/packages">اختر باقتك</Link>
              <Link className="wb-btn wb-btn--ghost wb-btn--lg" href="/contact">اطلب عرضاً توضيحياً</Link>
            </div>
          </div>
          <p className="wb-hero__note rv" style={{ ["--i" as string]: 5 }}>أسعار شاملة الضريبة · تدريب طوال مدة الاشتراك · عزل كامل لبيانات كل وقف</p>
        </div>
        <div className="wb-stage">
          <div className="wb-wrap rv" style={{ ["--i" as string]: 6 }}><LiveApprovals /></div>
        </div>
      </section>

      <section className="wb-sec">
        <div className="wb-wrap wb-ledger">
          <h2 className="wb-h2 wb-ledger__h rv"><span>أرقامٌ تصف النظام</span>كما يعمل اليوم.</h2>
          <figure className="wb-pic wb-ledger__pic rv" style={{ ["--i" as string]: 1, margin: 0 }}>
            <div><img src="/media/masmak-castle.jpg" width={1600} height={1200} alt="قصر المصمك في الرياض" loading="lazy" decoding="async" /></div>
            <figcaption>قصر المصمك، الرياض.</figcaption>
          </figure>
          <dl className="wb-ledger__dl">
            {LEDGER.map(([n, t], i) => (
              <div key={t} className="rv" style={{ ["--i" as string]: i }}><dt className="wb-num">{n}</dt><dd>{t}</dd></div>
            ))}
          </dl>
        </div>
      </section>

      <section className="wb-sec">
        <div className="wb-wrap">
          <WbHead title="كل ما تحتاجه الجهة الوقفية، مترابطٌ في مكانٍ واحد." lead="لا ترى الإدارة الرقم فقط، بل تربطه بالأصل أو المشروع أو الاستثمار الذي نتج عنه." />
          <CommandList mods={SYS_MODS} />
        </div>
      </section>

      <section className="wb-sec">
        <div className="wb-wrap">
          <WbHead title="من تأسيس الوقف إلى متابعة تنفيذ خطته طوال العام." />
          <ServiceIndex services={services} />
        </div>
      </section>

      <section className="wb-sec">
        <div className="wb-wrap">
          <WbHead title="خدمات تطلبها مباشرة، وأخرى نُعدّ لها عرضاً يناسب نطاقك." />
          <DirectNote />
        </div>
        <HowFields />
      </section>

      <section className="wb-sec">
        <div className="wb-wrap">
          <WbHead title="باقات سنوية تناسب حجم جهتك." />
          <PlanIndex plans={plans} />
          <div className="wb-more"><Link className="wb-link" href="/packages">قارن الباقات بالتفصيل<Icon n="arrow" s={18} /></Link></div>
        </div>
      </section>

      <section className="wb-sec">
        <div className="wb-wrap wb-split">
          <div className="wb-split__aside">
            <h2 className="wb-h2 rv">إجابات واضحة قبل أن تبدأ.</h2>
            <p className="wb-p rv" style={{ ["--i" as string]: 1 }}>لم تجد إجابتك؟ <Link href="/contact">تواصل مع فريقنا</Link>.</p>
            <figure className="wb-pic rv" style={{ ["--i" as string]: 2, margin: 0 }}>
              <div><img src="/media/old-jeddah-5.jpg" width={1600} height={1200} alt="بيوت جدة التاريخية برواشينها الخشبية" loading="lazy" decoding="async" /></div>
              <figcaption>جدة التاريخية.</figcaption>
            </figure>
          </div>
          <WbFaq items={SYS_FAQ} />
        </div>
      </section>

      <WbClose title="جاهزٌ لتنظيم أعمال وقفك؟"
        text={<>اكتب اسم جهتك واختر الباقة، وتنتقل إلى إنشاء الحساب بهما. تفضّل عرضاً توضيحياً أولاً؟ <Link href="/contact">تواصل معنا</Link>.</>}
        aside={<StartDialog plans={plans} />} />
    </SysShell>
  );
}
