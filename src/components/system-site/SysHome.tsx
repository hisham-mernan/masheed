import Link from "next/link";
import Icon, { type IconName } from "./Icon";
import { PlanCards, SysFlows, SysShell, WbCta, WbFaq, WbHead } from "./parts";
import { HomeServices } from "./ServicesBrowser";
import { FitScreen } from "./FitScreen";
import { SYS_FAQ, SYS_MODS } from "./data";
import { getPlans, getServices } from "./catalog";

const STATS: [IconName, string, string][] = [
  ["grid", "19", "وحدة تشغيلية مترابطة"],
  ["workflow", "7", "مراحل اعتماد قابلة للتخصيص"],
  ["clock", "4 ساعات", "زمن الاستجابة في الباقات المتقدمة"],
  ["shield", "100%", "من العمليات في سجل التدقيق"],
];

// system.masheedwaqf.com home — ui_kits/system-website SysHome
export default async function SysHome() {
  const [services, plans] = await Promise.all([getServices(), getPlans()]);
  return (
    <SysShell>
      <section className="wb-hero">
        <div className="wb-wrap">
          <div className="wb-hero__panel">
            <div className="wb-hero__copy">
              <span className="wb-eyebrow"><Icon n="zap" s={14} />المساعد الذكي متاح الآن في الباقة المتقدمة</span>
              <h1 className="wb-h1">نظام تشغيلٍ واحد لكل أعمال الجهة الوقفية.</h1>
              <p className="wb-lead" style={{ maxWidth: 680 }}>أصولك، مستفيدوك، ماليتك، عقودك وحوكمتك في بيئةٍ واحدة — بمسارات اعتمادٍ واضحة وسجلٍّ تدقيقيٍّ لكل إجراء.</p>
              <div className="wb-hero__cta">
                <Link className="wb-btn wb-btn--pri wb-btn--lg" href="/packages">اختر باقتك</Link>
                <Link className="wb-btn wb-btn--ghost wb-btn--lg" href="/contact">اطلب عرضاً توضيحياً</Link>
              </div>
              <div className="wb-hero__note">
                {["أسعار شاملة الضريبة", "تدريب طوال مدة الاشتراك", "عزل كامل لبيانات كل وقف"].map((t) => (
                  <span key={t}><Icon n="check" s={15} w={2.5} />{t}</span>
                ))}
              </div>
            </div>
            <div className="wb-hero__stage">
              <div className="wb-float wb-float--a">
                <span className="wb-float__i"><Icon n="checkSquare" /></span>
                <div><b>طلب صرف بانتظار اعتمادك</b><span>توزيع ريع · <span className="wb-num">120,000</span> ر.س</span></div>
              </div>
              <div className="wb-float wb-float--b">
                <span className="wb-float__i wb-float__i--ok"><Icon n="shield" /></span>
                <div><b>سجل المراجعة مفعّل</b><span>كل العمليات موثّقة ومؤرخة</span></div>
              </div>
              <div className="wb-shot"><FitScreen label="معاينة لوحة معلومات نظام مَشيد" /></div>
            </div>
          </div>
          <div className="wb-stats">
            {STATS.map(([i, b, t]) => (
              <div key={t} className="wb-stat">
                <span className="wb-ico"><Icon n={i} s={20} /></span>
                <div><b className="wb-num">{b}</b><span>{t}</span></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="wb-sec"><div className="wb-wrap"><HomeServices services={services} /></div></section>

      <section className="wb-sec wb-sec--canvas">
        <div className="wb-wrap">
          <WbHead center eyebrow="طريقتان للحصول على الخدمة" title="خدمات تطلبها مباشرة، وأخرى نُعدّ لها عرضاً يناسب نطاقك." />
          <SysFlows />
        </div>
      </section>

      <section className="wb-sec wb-band">
        <div className="wb-wrap">
          <WbHead eyebrow="النظام" title="كل ما تحتاجه الجهة الوقفية، مترابطٌ في مكانٍ واحد." lead="لا ترى الإدارة الرقم فقط، بل تربطه بالأصل أو المشروع أو الاستثمار الذي نتج عنه." />
          <div className="wb-mods">
            {SYS_MODS.map(([i, t, d]) => (
              <div key={t} className="wb-mod"><span className="wb-ico"><Icon n={i} s={20} /></span><b>{t}</b><span>{d}</span></div>
            ))}
          </div>
        </div>
      </section>

      <section className="wb-sec">
        <div className="wb-wrap">
          <WbHead eyebrow="الباقات" title="باقات سنوية تناسب حجم جهتك." action={<Link className="wb-link" href="/packages">قارن الباقات بالتفصيل<Icon n="arrow" s={16} /></Link>} />
          <PlanCards plans={plans} />
        </div>
      </section>

      <section className="wb-sec" style={{ paddingTop: 0 }}>
        <div className="wb-wrap wb-split">
          <div className="wb-split__aside">
            <span className="wb-eyebrow">الأسئلة الشائعة</span>
            <h2 className="wb-h2">إجابات واضحة قبل أن تبدأ.</h2>
            <p className="wb-p">لم تجد إجابتك؟ <Link href="/contact">تواصل مع فريقنا</Link>.</p>
          </div>
          <WbFaq items={SYS_FAQ} />
        </div>
      </section>

      <WbCta title="جاهزٌ لتنظيم أعمال وقفك؟" text="اختر الباقة المناسبة وابدأ خلال أيام، أو احجز عرضاً توضيحياً مع فريقنا."
        actions={<><Link className="wb-btn wb-btn--light wb-btn--lg" href="/packages">اختر باقتك</Link><Link className="wb-btn wb-btn--line wb-btn--lg" href="/contact">تواصل معنا</Link></>} />
    </SysShell>
  );
}
