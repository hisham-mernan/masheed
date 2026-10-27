"use client";

import { useEffect, useRef, useState } from "react";
import { SystemScreen, WaqfScreen } from "./ProductScreens";
import ContactForm from "./ContactForm";
import "./masheed-site.css";

const SYSTEM_URL = process.env.NEXT_PUBLIC_SYSTEM_URL || "https://system.masheedwaqf.com";
const INVESTMENT_URL = process.env.NEXT_PUBLIC_INVESTMENT_URL || "https://investment.masheedwaqf.com";
const EMAIL = "info@masheedwaqf.com";
// Every contact CTA scrolls to the form at the bottom of the page
const CONTACT = "#contact";

const LINKS = {
  systemLogin: `${SYSTEM_URL}/login`,
  systemStart: `${SYSTEM_URL}/register`,
  waqfExplore: `${INVESTMENT_URL}/explore`,
};

function Check() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function Checks({ items }: { items: string[] }) {
  return (
    <ul className="mw-checks">
      {items.map((t) => <li key={t}><Check /><span>{t}</span></li>)}
    </ul>
  );
}

// Window frame that scales a 1440×900 screen to its own width.
function FitFrame({ children }: { children: (scale: number) => React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setScale(el.clientWidth / 1440));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return <div className="mw-window__frame" ref={ref}>{children(scale)}</div>;
}

export default function DualLandingPage() {
  const [split, setSplit] = useState<{ s: number; focus: "" | "sys" | "waqf" }>({ s: 50, focus: "" });
  const splitRef = useRef<HTMLElement>(null);

  const wide = () => window.matchMedia("(min-width:1081px)").matches;
  const focus = (side: "sys" | "waqf") => () => { if (wide()) setSplit({ s: side === "sys" ? 60 : 40, focus: side }); };
  const reset = () => setSplit({ s: 50, focus: "" });

  return (
    <div className="mw" dir="rtl" lang="ar">
      <header className="mw-header">
        <div className="mw-wrap mw-header__in">
          <a className="mw-header__logo" href="#top" aria-label="مَشيد — الرئيسية"><img src="/brand/masheed-lockup.svg" alt="مَشيد" /></a>
          <nav className="mw-nav" aria-label="القائمة الرئيسية">
            <a href="#system">نظام مَشيد</a>
            <a href="#invest">وقف مَشيد</a>
            <a href="#offer">الخدمات</a>
            <a href="#about">عن مَشيد</a>
          </nav>
          <div className="mw-header__act">
            <a className="mw-btn mw-btn--ghost mw-btn--sm" href={LINKS.systemLogin}>دخول النظام</a>
            <a className="mw-btn mw-btn--primary mw-btn--sm" href={CONTACT}>تواصل معنا</a>
          </div>
        </div>
      </header>

      <main id="top">
        <section
          className="mw-split"
          id="split"
          aria-label="اختر منتجك"
          ref={splitRef}
          data-focus={split.focus}
          style={{ ["--s" as string]: split.s }}
          onMouseLeave={reset}
          onBlur={(e) => { if (!splitRef.current?.contains(e.relatedTarget as Node)) reset(); }}
        >
          <div className="mw-half mw-half--sys" onMouseEnter={focus("sys")} onFocus={focus("sys")}>
            <div className="mw-half__in">
              <span className="mw-half__who">للجهات الوقفية والنُّظّار</span>
              <p className="mw-half__word" aria-hidden="true">إدارة</p>
              <h2 className="mw-half__name"><img src="/brand/masheed-mark.svg" alt="" />نظام مَشيد</h2>
              <p className="mw-half__desc">أدِر وقفك من مكانٍ واحد: الأصول، المستفيدون، المالية، العقود، والحوكمة — بمسارات اعتمادٍ وسجلٍ تدقيقيٍّ لكل إجراء.</p>
              <div className="mw-half__cta">
                <a className="mw-btn mw-btn--primary mw-btn--lg" href={LINKS.systemStart}>ابدأ مع النظام</a>
              </div>
            </div>
            <div className="mw-half__view"><SystemScreen view="dashboard" /></div>
          </div>

          <div className="mw-half mw-half--waqf" onMouseEnter={focus("waqf")} onFocus={focus("waqf")}>
            <div className="mw-half__in">
              <span className="mw-half__who">للمستثمرين والواقفين</span>
              <p className="mw-half__word" aria-hidden="true">استثمار</p>
              <h2 className="mw-half__name"><img src="/brand/masheed-mark-waqf.svg" alt="" />وقف مَشيد</h2>
              <p className="mw-half__desc">فرصٌ وقفيةٌ مؤهّلة، تمر بمراجعةٍ ماليةٍ وحوكمةٍ قبل الطرح، بإفصاحٍ كامل ومتابعةٍ حتى التوزيع.</p>
              <div className="mw-half__cta">
                <a className="mw-btn mw-btn--gold mw-btn--lg" href={LINKS.waqfExplore}>استكشف الفرص</a>
              </div>
            </div>
            <div className="mw-half__view"><WaqfScreen /></div>
          </div>
          <div className="mw-seam" aria-hidden="true" />
        </section>

        <div className="mw-wrap mw-statsbar">
          <div className="mw-stats">
            <div className="mw-stat"><b>٢</b><span>منتجان متكاملان، منظومة واحدة</span></div>
            <div className="mw-stat"><b>١٩</b><span>وحدة تشغيلية في نظام مَشيد</span></div>
            <div className="mw-stat"><b className="is-waqf">٥</b><span>مراحل لإدراج الفرصة الاستثمارية</span></div>
            <div className="mw-stat"><b>١٠٠٪</b><span>توافق مع متطلبات الهيئة العامة للأوقاف وهيئة الزكاة</span></div>
          </div>
        </div>

        <section className="mw-section" id="offer">
          <div className="mw-wrap">
            <div className="mw-head mw-head--c">
              <span className="mw-eyebrow">ماذا نقدّم</span>
              <h2 className="mw-h2">ثلاثة مسارات مترابطة في بيئةٍ واحدة.</h2>
              <p className="mw-p">لا نقدّم منتجاً تقنياً منفصلاً عن الخبرة، ولا خدمةً استشاريةً منفصلةً عن البيانات.</p>
            </div>
            <div className="mw-offer">
              <div className="mw-tile">
                <span className="mw-tile__i">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
                </span>
                <h3 className="mw-h3">التقنية</h3>
                <p className="mw-p">البنية الرقمية التي تجمع البيانات وتُدير العمليات وتربط الأطراف.</p>
              </div>
              <div className="mw-tile">
                <span className="mw-tile__i">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
                </span>
                <h3 className="mw-h3">الاستشارات</h3>
                <p className="mw-p">خبرات متخصصة في الوقف والاستثمار والحوكمة والمالية والجوانب الشرعية والقانونية.</p>
              </div>
              <div className="mw-tile mw-tile--waqf">
                <span className="mw-tile__i">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
                </span>
                <h3 className="mw-h3">الاستثمار</h3>
                <p className="mw-p">تحويل الفرص المؤهلة إلى فرصٍ قابلةٍ للوصول إلى المستثمرين وفق مسارٍ منظّم.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mw-section mw-section--canvas" id="system">
          <div className="mw-wrap">
            <div className="mw-feature mw-feature--sys">
              <div className="mw-feature__copy">
                <span className="mw-feature__brand"><img src="/brand/masheed-mark.svg" alt="" />نظام مَشيد</span>
                <h2 className="mw-h2">صورةٌ موحّدة وشاملة لوقفك.</h2>
                <p className="mw-p">لا ترى الإدارة الرقم فقط، بل تربطه بالأصل أو المشروع أو الاستثمار الذي نتج عنه.</p>
                <Checks items={["لوحات معلومات بحسب الدور: الناظر، المالي، الأصول، الحوكمة", "محرّك سير أعمال بمراحل ومسؤولين وقواعد تصعيد", "سجل تدقيقي كامل: من قام بماذا ومتى"]} />
                <div><a className="mw-btn mw-btn--primary" href={LINKS.systemLogin}>جرّب النظام</a></div>
              </div>
              <div className="mw-window">
                <div className="mw-window__bar"><i /><i /><i /><span>نظام مَشيد</span></div>
                <FitFrame>{(s) => <SystemScreen view="assets" style={{ transform: `scale(${s})` }} />}</FitFrame>
              </div>
            </div>
          </div>
        </section>

        <section className="mw-section mw-dark-warm" id="invest">
          <div className="mw-wrap">
            <div className="mw-feature mw-feature--waqf">
              <div className="mw-feature__copy">
                <span className="mw-feature__brand"><img src="/brand/masheed-mark-waqf.svg" alt="" />وقف مَشيد</span>
                <h2 className="mw-h2">الثقة تبدأ قبل الاستثمار.</h2>
                <p className="mw-p">لا تُطرح الفرصة بمجرد طلب الإدراج؛ بل تمر بمراجعة البيانات المالية والتقييمات المستقلة والمخاطر والحوكمة.</p>
                <Checks items={["استعراض الفرص ومقارنتها ومحاكاة السيناريوهات", "إفصاح كامل عن الوثائق والمؤشرات المالية", "محفظة شخصية: تقارير دورية وتوزيعات الأرباح"]} />
                <div className="mw-path"><span>طلب إدراج</span><span>تجهيز</span><span>مراجعة</span><span>اعتماد</span><span>نشر</span></div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <a className="mw-btn mw-btn--gold" href={LINKS.waqfExplore}>استكشف الفرص</a>
                  <a className="mw-btn mw-btn--line-gold" href={CONTACT}>اطلب إدراج فرصة</a>
                </div>
              </div>
              <div className="mw-window">
                <div className="mw-window__bar"><i /><i /><i /><span>وقف مَشيد</span></div>
                <FitFrame>{(s) => <WaqfScreen style={{ transform: `scale(${s})` }} />}</FitFrame>
              </div>
            </div>
          </div>
        </section>

        <section className="mw-section" id="about">
          <div className="mw-wrap">
            <div className="mw-ab">
              <div className="mw-ab__media">
                <div className="mw-ab__panel"><img src="/brand/masheed-mark.svg" alt="" /></div>
                <div className="mw-ab__badge"><b>٥</b><span>مؤسسين من خبرات الوقف والمال والتنظيم والتقنية</span></div>
              </div>
              <div className="mw-ab__copy">
                <span className="mw-eyebrow">عن مَشيد</span>
                <h2 className="mw-h2">من إدارة الوقف إلى بناء منظومةٍ متكاملة.</h2>
                <p className="mw-p">منظومة سعودية تجمع بين التقنية والخبرة الوقفية والمالية والاستثمارية، لبناء بنيةٍ مؤسسيةٍ تُهيّئ الأوقاف للنمو والاستدامة.</p>
                <Checks items={["خبرة وقفية وشرعية", "حوكمة ورقابة", "استثمار ومالية", "تقنية مالية وأمن"]} />
                <div><a className="mw-btn mw-btn--ghost" href={CONTACT}>تحدّث مع الفريق</a></div>
              </div>
            </div>
          </div>
        </section>

        <section className="mw-section" style={{ paddingTop: 0 }}>
          <div className="mw-wrap">
            <div className="mw-band">
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <span className="mw-eyebrow mw-eyebrow--light">دورة الأثر الرقمي للأوقاف</span>
                <h2 className="mw-h2">نحو أوقافٍ أكثر كفاءةً واستدامةً وأثراً.</h2>
              </div>
              <ol className="mw-cycle">
                <li><i>١</i><b>البيانات</b></li>
                <li><i>٢</i><b>المعرفة</b></li>
                <li><i>٣</i><b>القرار</b></li>
                <li><i>٤</i><b>الأثر المستدام</b></li>
              </ol>
            </div>
          </div>
        </section>

        <section className="mw-ctas">
          <div className="mw-wrap mw-ctas__in">
            <div>
              <b>لديك وقفٌ تريد تطويره؟</b>
              <span>تحدّث مع فريقنا عن النظام أو عن إدراج فرصتك الاستثمارية.</span>
            </div>
            <div className="mw-ctas__act">
              <a className="mw-btn mw-btn--light mw-btn--lg" href={CONTACT}>طلب عرض توضيحي</a>
              <a className="mw-btn mw-btn--line-light mw-btn--lg" href={CONTACT}>تواصل معنا</a>
            </div>
          </div>
        </section>

        <section className="mw-section mw-section--canvas" id="contact">
          <div className="mw-wrap">
            <div className="mw-contact">
              <div className="mw-contact__copy">
                <span className="mw-eyebrow">تواصل معنا</span>
                <h2 className="mw-h2">لنتحدّث عن وقفك.</h2>
                <p className="mw-p">اترك بياناتك ورسالتك، وسيتواصل معك فريق مَشيد لمناقشة احتياج وقفك: نظام الإدارة، أو إدراج فرصة استثمارية، أو الاستشارات.</p>
                <ul className="mw-contact__ways">
                  <li>
                    <i aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                    </i>
                    <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
                  </li>
                  <li>
                    <i aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                    </i>
                    المملكة العربية السعودية
                  </li>
                </ul>
              </div>
              <div className="mw-contact__card"><ContactForm /></div>
            </div>
          </div>
        </section>
      </main>


      <footer className="mw-footer">
        <div className="mw-wrap">
          <div className="mw-footer__grid">
            <div className="mw-footer__brand">
              <img src="/brand/masheed-lockup.svg" alt="مَشيد" />
              <p>المنظومة الرقمية المتكاملة لتمكين وتطوير الأوقاف.</p>
            </div>
            <div>
              <h4>المنتجات</h4>
              <ul>
                <li><a href={SYSTEM_URL}>نظام مَشيد</a></li>
                <li><a href={INVESTMENT_URL}>وقف مَشيد</a></li>
                <li><a href={LINKS.systemStart}>الباقات</a></li>
              </ul>
            </div>
            <div>
              <h4>الشركة</h4>
              <ul>
                <li><a href="#about">عن مَشيد</a></li>
                <li><a href="#offer">الخدمات</a></li>
              </ul>
            </div>
            <div>
              <h4>تواصل</h4>
              <ul>
                <li><a href={CONTACT}>تواصل معنا</a></li>
                <li><a href={`mailto:${EMAIL}`}>{EMAIL}</a></li>
                <li><a href={LINKS.systemLogin}>دخول النظام</a></li>
              </ul>
            </div>
          </div>
          <div className="mw-footer__base">
            <span>© 2026 مَشيد. جميع الحقوق محفوظة.</span>
            <div><a href="#">سياسة الخصوصية</a><a href="#">الشروط والأحكام</a></div>
          </div>
        </div>
      </footer>
    </div>
  );
}
