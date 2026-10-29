"use client";

import { useEffect, useRef, useState } from "react";
import { SystemScreen, WaqfScreen } from "./ProductScreens";
import ContactForm from "./ContactForm";
import Reveal from "../system-site/Reveal";
import "./masheed-site.css";

const SYSTEM_URL = process.env.NEXT_PUBLIC_SYSTEM_URL || "https://system.masheedwaqf.com";
const INVESTMENT_URL = process.env.NEXT_PUBLIC_INVESTMENT_URL || "https://investment.masheedwaqf.com";
const EMAIL = "info@masheedwaqf.com";
// Every contact CTA scrolls to the form at the bottom of the page
const CONTACT = "#contact";

const LINKS = {
  systemLogin: `${SYSTEM_URL}/login`,
  systemStart: `${SYSTEM_URL}/register`,
  waqfExplore: `${INVESTMENT_URL}/opportunities`,
};

// Open-licence pictures of the waqf world (public/media/credits.json), credited in the footer.
const PICS = {
  manuscript: "/media/manuscript-leaves-from-an-arabic-manuscript.jpg",
  jeddah: "/media/old-jeddah-5.jpg",
  tower: "/media/old-jeddah-55362437075.jpg",
  masmak: "/media/masmak-castle.jpg",
};
const CREDITS: [string, string, string][] = [
  ["«Old Jeddah (5)»، Radosław Botev، CC BY 3.0", "https://commons.wikimedia.org/wiki/File:Old_Jeddah_(5).jpg", "https://creativecommons.org/licenses/by/3.0/"],
  ["«Old Jeddah - 55362437075»، xiquinhosilva، CC BY 4.0", "https://commons.wikimedia.org/wiki/File:Old_Jeddah_-_55362437075.jpg", "https://creativecommons.org/licenses/by/4.0/"],
  ["«Masmak castle»، Baptiste Marcel، ملكية عامة", "https://commons.wikimedia.org/wiki/File:Masmak_castle.jpg", ""],
  ["«Manuscript Leaves from an Arabic Manuscript»، متحف المتروبوليتان، CC0", "https://commons.wikimedia.org/wiki/File:Manuscript_Leaves_from_an_Arabic_Manuscript_MET_sf21-148-7s3.jpg", ""],
];

const d = (i: number) => ({ ["--i" as string]: i }) as React.CSSProperties;

// Scales a 1440×900 product screen to its frame's width (sets --k).
function Fit({ className, children }: { className: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => el.style.setProperty("--k", String(el.clientWidth / 1440)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return <div className={className} ref={ref}>{children}</div>;
}

const SHOW: { name: string; view: "dashboard" | "assets" | "audit"; fact: string }[] = [
  { name: "لوحات المعلومات", view: "dashboard", fact: "لوحات بحسب الدور: الناظر، والمالي، والأصول، والحوكمة." },
  { name: "سجل الأصول", view: "assets", fact: "كل أصل بقيمته التقديرية وريعه السنوي وحالته، في سجلٍّ واحد." },
  { name: "سجل التدقيق", view: "audit", fact: "سجل تدقيقي كامل: من قام بماذا ومتى، ومحرّك اعتماد بمراحل ومسؤولين وقواعد تصعيد." },
];

// The System section: three views of the product in front of the hexagon; the view fades to the next
// on its own (the signature move) until the visitor picks one.
function SystemShow() {
  const [i, setI] = useState(0);
  const [held, setHeld] = useState(false);
  useEffect(() => {
    if (held || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => { if (!document.hidden) setI((x) => (x + 1) % SHOW.length); }, 6500);
    return () => window.clearInterval(t);
  }, [held]);
  const pick = (n: number) => { setHeld(true); setI(n); };
  return (
    <div className="mw-show">
      <div className="mw-show__list">
        <h2 className="mw-h2 rv">صورةٌ موحّدة وشاملة لوقفك.</h2>
        <p className="mw-show__brand rv" style={d(1)}><img src="/brand/masheed-mark.svg" alt="" />نظام مَشيد</p>
        <ul className="mw-show__names">
          {SHOW.map((s, n) => (
            <li key={s.name} className="rv" style={d(n + 2)}>
              <button type="button" aria-pressed={n === i} onClick={() => pick(n)} onFocus={() => pick(n)}>{s.name}</button>
            </li>
          ))}
        </ul>
        <p className="mw-show__fact rv" style={d(5)} aria-live="polite">{SHOW[i].fact}</p>
        <p className="mw-p rv" style={d(6)}>لا ترى الإدارة الرقم فقط، بل تربطه بالأصل أو المشروع أو الاستثمار الذي نتج عنه.</p>
        <div className="rv" style={d(7)}><a className="mw-btn mw-btn--primary" href={LINKS.systemLogin}>جرّب النظام</a></div>
      </div>
      <div className="mw-show__stage rv" data-i={i} style={d(2)}>
        <div className="mw-show__hex" aria-hidden="true" />
        <Fit className="mw-show__view">
          <SystemScreen key={SHOW[i].view} view={SHOW[i].view} />
        </Fit>
      </div>
    </div>
  );
}

export default function DualLandingPage() {
  const [split, setSplit] = useState<{ s: number; focus: "" | "sys" | "waqf" }>({ s: 50, focus: "" });
  const splitRef = useRef<HTMLElement>(null);

  const wide = () => window.matchMedia("(min-width:1081px)").matches;
  const focus = (side: "sys" | "waqf") => () => { if (wide()) setSplit({ s: side === "sys" ? 60 : 40, focus: side }); };
  const reset = () => setSplit({ s: 50, focus: "" });

  return (
    <div className="mw" dir="rtl" lang="ar">
      <Reveal />
      <header className="mw-header">
        <div className="mw-wrap mw-header__in">
          <a className="mw-header__logo" href="#top" aria-label="مَشيد، الرئيسية"><img src="/brand/masheed-lockup.svg" alt="مَشيد" /></a>
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
        <div className="mw-title">
          <div className="mw-wrap mw-title__in"><h1>مَشيد: المنظومة الرقمية المتكاملة لتمكين وتطوير الأوقاف.</h1></div>
        </div>

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
            <div className="mw-half__hex" aria-hidden="true" />
            <div className="mw-half__in">
              <p className="mw-half__word" aria-hidden="true">إدارة</p>
              <h2 className="mw-half__name"><img src="/brand/masheed-mark.svg" alt="" />نظام مَشيد</h2>
              <p className="mw-half__who">للجهات الوقفية والنُّظّار</p>
              <p className="mw-half__desc">أدِر وقفك من مكانٍ واحد: الأصول، المستفيدون، المالية، العقود، والحوكمة، بمسارات اعتمادٍ وسجلٍ تدقيقيٍّ لكل إجراء.</p>
              <div className="mw-half__cta">
                <a className="mw-btn mw-btn--primary mw-btn--lg" href={LINKS.systemStart}>ابدأ مع النظام</a>
              </div>
            </div>
            <div className="mw-half__view"><SystemScreen view="dashboard" /></div>
          </div>

          <div className="mw-half mw-half--waqf" onMouseEnter={focus("waqf")} onFocus={focus("waqf")}>
            <div className="mw-half__hex" aria-hidden="true" />
            <div className="mw-half__in">
              <p className="mw-half__word" aria-hidden="true">استثمار</p>
              <h2 className="mw-half__name"><img src="/brand/masheed-mark-waqf.svg" alt="" />وقف مَشيد</h2>
              <p className="mw-half__who">للمستثمرين والواقفين</p>
              <p className="mw-half__desc">فرصٌ وقفيةٌ مؤهّلة، تمر بمراجعةٍ ماليةٍ وحوكمةٍ قبل الطرح، بإفصاحٍ كامل ومتابعةٍ حتى التوزيع.</p>
              <div className="mw-half__cta">
                <a className="mw-btn mw-btn--gold mw-btn--lg" href={LINKS.waqfExplore}>استكشف الفرص</a>
              </div>
            </div>
            <div className="mw-half__view"><WaqfScreen /></div>
          </div>
        </section>

        <div className="mw-figs">
          <dl className="mw-wrap">
            <div className="rv"><dt className="mw-num">٢</dt><dd>منتجان متكاملان، منظومة واحدة</dd></div>
            <div className="rv" style={d(1)}><dt className="mw-num">١٩</dt><dd>وحدة تشغيلية في نظام مَشيد</dd></div>
            <div className="rv" style={d(2)}><dt className="mw-num is-waqf">٥</dt><dd>مراحل لإدراج الفرصة الاستثمارية</dd></div>
            <div className="rv" style={d(3)}><dt className="mw-num">١٠٠٪</dt><dd>توافق مع متطلبات الهيئة العامة للأوقاف وهيئة الزكاة</dd></div>
          </dl>
        </div>

        <section className="mw-section" id="offer">
          <div className="mw-wrap mw-offer">
            <div className="mw-offer__head">
              <h2 className="mw-h2 rv">ثلاثة مسارات مترابطة في بيئةٍ واحدة.</h2>
              <p className="mw-p rv" style={d(1)}>لا نقدّم منتجاً تقنياً منفصلاً عن الخبرة، ولا خدمةً استشاريةً منفصلةً عن البيانات.</p>
            </div>
            <ul className="mw-tiles">
              <li className="rv">
                <div className="mw-tile mw-tile--lav">
                  <Fit className="mw-tile__screen"><SystemScreen view="assets" /></Fit>
                </div>
                <h3>التقنية</h3>
                <p>البنية الرقمية التي تجمع البيانات وتُدير العمليات وتربط الأطراف.</p>
              </li>
              <li className="rv" style={d(1)}>
                <div className="mw-tile mw-tile--sand"><img src={PICS.manuscript} width={1100} height={1509} alt="أوراق من مخطوطة عربية قديمة" loading="lazy" decoding="async" /></div>
                <h3>الاستشارات</h3>
                <p>خبرات متخصصة في الوقف والاستثمار والحوكمة والمالية والجوانب الشرعية والقانونية.</p>
              </li>
              <li className="rv" style={d(2)}>
                <div className="mw-tile mw-tile--olive"><img src={PICS.jeddah} width={1600} height={1200} alt="بيوت جدة التاريخية برواشينها الخشبية" loading="lazy" decoding="async" /></div>
                <h3>الاستثمار</h3>
                <p>تحويل الفرص المؤهلة إلى فرصٍ قابلةٍ للوصول إلى المستثمرين وفق مسارٍ منظّم.</p>
              </li>
            </ul>
          </div>
        </section>

        <section className="mw-section" id="system" style={{ paddingTop: 0 }}>
          <div className="mw-wrap"><SystemShow /></div>
        </section>

        <section className="mw-band" aria-labelledby="mw-cycle-h">
          <div className="mw-wrap mw-band__in">
            <div>
              <h2 className="mw-h2 rv" id="mw-cycle-h">نحو أوقافٍ أكثر كفاءةً واستدامةً وأثراً.</h2>
              <ol className="mw-cycle">
                {["البيانات", "المعرفة", "القرار", "الأثر المستدام"].map((t, n) => <li key={t} className="rv" style={d(n + 1)}>{t}</li>)}
              </ol>
            </div>
            <img className="mw-band__pic rv" src={PICS.masmak} width={1600} height={1200} alt="قصر المصمك في الرياض" loading="lazy" decoding="async" style={d(2)} />
          </div>
        </section>

        <section className="mw-section mw-dark-warm" id="invest">
          <div className="mw-wrap mw-invest">
            <div className="mw-invest__copy">
              <h2 className="mw-h2 rv">الثقة تبدأ قبل الاستثمار.</h2>
              <p className="mw-invest__brand rv" style={d(1)}><img src="/brand/masheed-mark-waqf.svg" alt="" />وقف مَشيد</p>
              <p className="mw-p rv" style={d(2)}>لا تُطرح الفرصة بمجرد طلب الإدراج؛ بل تمر بمراجعة البيانات المالية والتقييمات المستقلة والمخاطر والحوكمة.</p>
              <ol className="mw-path rv" style={d(3)} aria-label="مراحل إدراج الفرصة">
                <li>طلب إدراج</li><li>تجهيز</li><li>مراجعة</li><li>اعتماد</li><li>نشر</li>
              </ol>
              <ul className="mw-hexbul rv" style={d(4)}>
                <li>استعراض الفرص ومقارنتها ومحاكاة السيناريوهات</li>
                <li>إفصاح كامل عن الوثائق والمؤشرات المالية</li>
                <li>محفظة شخصية: تقارير دورية وتوزيعات الأرباح</li>
              </ul>
              <div className="rv" style={{ ...d(5), display: "flex", gap: 10, flexWrap: "wrap" }}>
                <a className="mw-btn mw-btn--gold" href={LINKS.waqfExplore}>استكشف الفرص</a>
                <a className="mw-btn mw-btn--line-gold" href={CONTACT}>اطلب إدراج فرصة</a>
              </div>
            </div>
            <Fit className="mw-invest__view rv"><WaqfScreen /></Fit>
          </div>
        </section>

        <section className="mw-section" id="about">
          <div className="mw-about">
            <div className="mw-about__in">
              <div>
                <h2 className="mw-h2 rv">من إدارة الوقف إلى بناء منظومةٍ متكاملة.</h2>
                <img className="mw-about__pic rv" style={d(1)} src={PICS.tower} width={1100} height={1650} alt="مبنى أبيض في جدة التاريخية" loading="lazy" decoding="async" />
              </div>
              <div className="mw-about__text">
                <div className="rv" style={d(1)}>
                  <h3>منظومة سعودية</h3>
                  <p>تجمع بين التقنية والخبرة الوقفية والمالية والاستثمارية، لبناء بنيةٍ مؤسسيةٍ تُهيّئ الأوقاف للنمو والاستدامة.</p>
                </div>
                <div className="rv" style={d(2)}>
                  <h3>خمسة مؤسسين</h3>
                  <p>من خبرات الوقف والمال والتنظيم والتقنية:</p>
                  <ul className="mw-hexbul">
                    <li>خبرة وقفية وشرعية</li><li>حوكمة ورقابة</li><li>استثمار ومالية</li><li>تقنية مالية وأمن</li>
                  </ul>
                </div>
                <div className="rv" style={d(3)}><a className="mw-btn mw-btn--primary" href={CONTACT}>تحدّث مع الفريق</a></div>
              </div>
            </div>
          </div>
        </section>

        <section className="mw-section" id="contact" style={{ paddingTop: 0 }}>
          <div className="mw-wrap">
            <div className="mw-coupon rv">
              <div className="mw-coupon__copy">
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <h2 className="mw-h2">لنتحدّث عن وقفك.</h2>
                  <p>اترك بياناتك ورسالتك، وسيتواصل معك فريق مَشيد لمناقشة احتياج وقفك: نظام الإدارة، أو إدراج فرصة استثمارية، أو الاستشارات.</p>
                </div>
                <ul className="mw-coupon__ways">
                  <li><a href={`mailto:${EMAIL}`}>{EMAIL}</a></li>
                  <li>المملكة العربية السعودية</li>
                </ul>
              </div>
              <div className="mw-coupon__form"><ContactForm /></div>
            </div>
          </div>
        </section>
      </main>

      <footer className="mw-footer">
        <div className="mw-wrap">
          <div className="mw-footer__mark">
            <img src="/brand/masheed-mark.svg" alt="" />
            <p>المنظومة الرقمية المتكاملة لتمكين وتطوير الأوقاف.</p>
          </div>
          <div className="mw-footer__grid">
            <nav aria-label="المنتجات">
              <h2>المنتجات</h2>
              <ul>
                <li><a href={SYSTEM_URL}>نظام مَشيد</a></li>
                <li><a href={INVESTMENT_URL}>وقف مَشيد</a></li>
                <li><a href={LINKS.systemStart}>الباقات</a></li>
              </ul>
            </nav>
            <nav aria-label="الشركة">
              <h2>الشركة</h2>
              <ul>
                <li><a href="#about">عن مَشيد</a></li>
                <li><a href="#offer">الخدمات</a></li>
              </ul>
            </nav>
            <nav aria-label="تواصل">
              <h2>تواصل</h2>
              <ul>
                <li><a href={CONTACT}>تواصل معنا</a></li>
                <li><a href={`mailto:${EMAIL}`}>{EMAIL}</a></li>
                <li><a href={LINKS.systemLogin}>دخول النظام</a></li>
              </ul>
            </nav>
            <div>
              <h2>مَشيد</h2>
              <p style={{ margin: 0 }}>نظام مَشيد لإدارة الأوقاف، ووقف مَشيد للفرص الاستثمارية الوقفية المؤهّلة.</p>
            </div>
          </div>
          <p className="mw-footer__credits">
            حقوق الصور (ويكيميديا كومنز):{" "}
            {CREDITS.map(([t, page, lic], n) => (
              <span key={page}>{n > 0 && "؛ "}<a href={page} rel="noopener">{t}</a>{lic && <> (<a href={lic} rel="noopener license">الترخيص</a>)</>}</span>
            ))}.
          </p>
          <div className="mw-footer__base">
            <span>© 2026 مَشيد. جميع الحقوق محفوظة.</span>
            <div><a href="/privacy">سياسة الخصوصية</a><a href="/terms">الشروط والأحكام</a><a className="mw-btn mw-btn--primary mw-btn--sm" href={CONTACT}>تواصل معنا</a></div>
          </div>
        </div>
      </footer>
    </div>
  );
}
