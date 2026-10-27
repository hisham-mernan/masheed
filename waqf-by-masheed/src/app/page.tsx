import type { Metadata } from "next";
import Link from "next/link";
import Icon, { type IconName } from "@/components/site/Icon";
import { OpCard, WbCta, WbFaq, WbHead, WqShell } from "@/components/site/parts";
import Calculator from "@/components/site/Calculator";
import InterestForm from "@/components/site/InterestForm";
import { WQ_FAQ } from "@/components/site/data";
import { getListings } from "@/lib/listings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "وقف مَشيد | استثمر في أوقافٍ مؤهّلة",
  description: "فرص استثمارية من جهات وقفية موثوقة، تمر بمراجعة مالية وحوكمية قبل نشرها، بمستنداتها وتقييماتها.",
};

const REVIEW = ["طلب إدراج", "تجهيز الفرصة", "مراجعة مالية وقانونية وحوكمية", "اعتماد لجنة المراجعة", "النشر للمستثمرين"];

// investment.masheedwaqf.com home — ui_kits/waqf-website WqHome, with real listings only
export default async function Home() {
  const listings = await getListings();
  const open = listings.filter((l) => l.status === "approved");
  const stats: [IconName, string, string][] = [
    open.length ? ["briefcase", String(open.length), "فرص متاحة للاستثمار الآن"] : ["briefcase", "قريباً", "الفرص الأولى قيد المراجعة"],
    ["layers", "5", "مراحل مراجعة قبل نشر أي فرصة"],
    ["fileText", "100%", "من وثائق الفرص متاحة للاطلاع"],
    ["calendar", "ربع سنوي", "تقارير الأداء والتوزيعات"],
  ];

  return (
    <WqShell openCount={open.length}>
      <section className="wb-hero">
        <div className="wb-wrap">
          <div className="wb-hero__panel wb-hero__panel--split">
            <div className="wb-hero__copy">
              <span className="wb-eyebrow"><Icon n="shield" s={14} />كل فرصة تمر بمراجعة مالية وحوكمية قبل نشرها</span>
              <h1 className="wb-h1">استثمر في أوقافٍ مؤهّلة، بشفافيةٍ كاملة.</h1>
              <p className="wb-lead">فرص استثمارية من جهات وقفية موثوقة: عقارية وزراعية وتعليمية وصحية — بمستنداتها وتقييماتها وتقاريرها الدورية أمامك.</p>
              <div className="wb-hero__cta">
                <Link className="wb-btn wb-btn--pri wb-btn--lg" href="/opportunities">تصفّح الفرص المتاحة</Link>
                <Link className="wb-btn wb-btn--ghost wb-btn--lg" href="/about">كيف تعمل المنصة</Link>
              </div>
              <div className="wb-hero__note">
                {["إفصاح كامل للوثائق", "مراجعة قبل النشر", "تقارير دورية"].map((t) => <span key={t}><Icon n="check" s={15} w={2.5} />{t}</span>)}
              </div>
            </div>
            <div className="wq-hv" aria-hidden="true">
              <span className="wq-hv__ring" />
              <div className="wq-hv__chip">
                <span className="wb-float__i wb-float__i--ok" style={{ width: 36, height: 36 }}><Icon n="shield" s={18} /></span>
                <div><b>لا تُعرض فرصةٌ قبل أن تُراجَع</b><span>مراجعة مالية وقانونية وحوكمية</span></div>
              </div>
              <div className="wq-hv__card">
                <h3>مسار إدراج الفرصة</h3>
                <ol className="wq-steps">
                  {REVIEW.map((t, i) => <li key={t}><i className="wb-num">{i + 1}</i>{t}{i === REVIEW.length - 1 && <small>تُعرض هنا</small>}</li>)}
                </ol>
              </div>
              <div className="wq-hv__band">
                <img src="/brand/masheed-mark.svg" alt="" />
                <small>من منظومة مَشيد</small>
                <b>مرتبطة مباشرةً بنظام مَشيد لإدارة الأوقاف</b>
              </div>
            </div>
          </div>
          <div className="wb-stats">
            {stats.map(([i, b, t]) => (
              <div key={t} className="wb-stat"><span className="wb-ico"><Icon n={i} s={20} /></span><div><b className="wb-num">{b}</b><span>{t}</span></div></div>
            ))}
          </div>
        </div>
      </section>

      <section className="wb-sec" id="interest">
        <div className="wb-wrap">
          {open.length > 0 ? (
            <>
              <WbHead eyebrow="الفرص الاستثمارية" title="فرص متاحة الآن" action={<Link className="wb-link" href="/opportunities">كل الفرص<Icon n="arrow" s={16} /></Link>} />
              <div className="wb-grid3">{open.slice(0, 3).map((l) => <OpCard key={l.id} l={l} />)}</div>
            </>
          ) : (
            <div className="wq-empty">
              <div className="wq-empty__copy">
                <span className="wb-ico"><Icon n="calendar" s={26} /></span>
                <span className="wb-eyebrow">الفرص الاستثمارية</span>
                <h2 className="wb-h2">الفرص الأولى قيد المراجعة.</h2>
                <p className="wb-p">لا توجد فرص مطروحة حالياً؛ كل فرصة تمر بالمراجعة كاملةً قبل نشرها. سجّل اهتمامك وسنتواصل معك عند طرح الفرص القادمة.</p>
              </div>
              <div className="wb-panel"><InterestForm /></div>
            </div>
          )}
        </div>
      </section>

      <section className="wb-sec wb-sec--canvas">
        <div className="wb-wrap">
          <WbHead center eyebrow="كيف تعمل المنصة" title="أربع خطوات من التسجيل إلى أول توزيع." />
          <div className="wq-how">
            {([["user", "أنشئ حسابك", "سجّل ووثّق هويتك خلال دقائق."], ["search", "اختر الفرصة", "قارن الفرص واطّلع على تفاصيلها ومستنداتها."], ["send", "سجّل اهتمامك", "حدّد عدد الحصص، ويتواصل معك الفريق لإتمام الاستثمار."], ["trendingUp", "تابع واستلم العوائد", "تقارير دورية وتوزيعات بحسب شروط كل فرصة."]] as [IconName, string, string][]).map(([i, t, d], n) => (
              <div key={t} className="wq-how__s"><span className="wq-how__n wb-num">{n + 1}</span><span className="wb-ico"><Icon n={i} s={22} /></span><h3 className="wb-h3">{t}</h3><p className="wb-p">{d}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="wb-sec"><div className="wb-wrap"><Calculator /></div></section>

      <section className="wb-sec wb-band">
        <div className="wb-wrap wq-trust">
          <div className="wq-trust__copy">
            <span className="wb-eyebrow">الثقة تبدأ قبل الاستثمار</span>
            <h2 className="wb-h2">لا تُعرض فرصةٌ قبل أن تُراجَع.</h2>
            <p className="wb-lead">كل فرصة تمر بمراجعةٍ للبيانات المالية والتقييمات المستقلة والمخاطر والحوكمة، ثم تُعتمد قبل النشر.</p>
            <Link className="wb-btn wb-btn--light" href="/about">تعرّف على مسار المراجعة</Link>
          </div>
          <div className="wq-indic">
            {[["100%", "إفصاح الوثائق", "كل مستند مرتبط بالفرصة متاح للاطلاع"], ["دوري", "التقارير المالية", "تحديثات ربعية عن الأداء والتوزيعات"], ["مستمر", "مؤشرات الحوكمة", "حالة اللجان والقرارات وسجل التدقيق"], ["فوري", "تحديثات المشروع", "حالة التمويل والتنفيذ في كل مرحلة"]].map(([b, t, d]) => (
              <div key={t}><b className="wb-num">{b}</b><span>{t}</span><small>{d}</small></div>
            ))}
          </div>
        </div>
      </section>

      <section className="wb-sec">
        <div className="wb-wrap wb-split">
          <div className="wb-split__aside"><span className="wb-eyebrow">الأسئلة الشائعة</span><h2 className="wb-h2">قبل أن تستثمر.</h2></div>
          <WbFaq items={WQ_FAQ} />
        </div>
      </section>

      <WbCta title="ابدأ استثمارك الوقفي الأول." text="أنشئ حسابك، وتصفّح الفرص، وسجّل اهتمامك بالفرصة التي تناسبك."
        actions={<><Link className="wb-btn wb-btn--light wb-btn--lg" href="/auth/signup">أنشئ حسابك</Link><Link className="wb-btn wb-btn--line wb-btn--lg" href="/opportunities">تصفّح الفرص</Link></>} />
    </WqShell>
  );
}
