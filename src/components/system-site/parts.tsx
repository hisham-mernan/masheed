import Link from "next/link";
import Icon from "./Icon";
import SysHeader from "./SysHeader";
import Reveal from "./Reveal";
import { type Service } from "./data";
import "./system-site.css";

export const MAIN_URL = process.env.NEXT_PUBLIC_MAIN_URL || "https://masheedwaqf.com";
export const INVESTMENT_URL = process.env.NEXT_PUBLIC_INVESTMENT_URL || "https://investment.masheedwaqf.com";

export function SysShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="wb" dir="rtl" lang="ar">
      <Reveal />
      <SysHeader />
      <main>{children}</main>
      <SysFooter />
    </div>
  );
}

function SysFooter() {
  const cols: [string, [string, string][]][] = [
    ["النظام", [["/packages", "الباقات"], ["/services", "الخدمات"], ["/dashboard", "الدخول إلى النظام"]]],
    ["الخدمات", [["/services?type=direct", "بسعر ثابت"], ["/services?type=request", "بطلب عرض سعر"], ["/services/consulting", "جلسة استشارية"]]],
    ["الشركة", [[MAIN_URL + "/#about", "عن مَشيد"], ["/contact", "تواصل معنا"], [MAIN_URL, "منظومة مَشيد"]]],
  ];
  return (
    <footer className="wb-foot">
      <div className="wb-wrap">
        <div className="wb-foot__grid">
          <div className="wb-foot__brand">
            <Link className="wb-brand wb-brand--light" href="/">
              <img src="/brand/masheed-mark.svg" alt="" />
              <span><b>نظام مَشيد</b><small>نظام تشغيل الجهة الوقفية</small></span>
            </Link>
            <p>نظام تشغيلٍ مؤسسي يجمع أصول الوقف ومستفيديه وماليته وحوكمته في بيئةٍ واحدة.</p>
            <a className="wb-foot__sister" href={INVESTMENT_URL}>
              <img src="/brand/masheed-mark-waqf.svg" alt="" />
              <span><small>من منظومة مَشيد</small><b>وقف مَشيد، منصة الاستثمار</b></span>
              <Icon n="arrow" s={16} />
            </a>
          </div>
          {cols.map(([h, links]) => (
            <nav key={h} aria-label={h}>
              <h2>{h}</h2>
              <ul>{links.map(([href, l]) => <li key={l}><a href={href}>{l}</a></li>)}</ul>
            </nav>
          ))}
        </div>
        <p className="wb-foot__mark" aria-hidden="true">نظام مَشيد</p>
        <div className="wb-foot__base">
          <span>© 2026 مَشيد. جميع الحقوق محفوظة.</span>
          <div><a href="/privacy">سياسة الخصوصية</a><a href="/terms">الشروط والأحكام</a></div>
        </div>
        <p className="wb-foot__credits">
          حقوق الصور (ويكيميديا كومنز): <a href="https://commons.wikimedia.org/wiki/File:Masmak_castle.jpg" rel="noopener">«Masmak castle»، Baptiste Marcel، ملكية عامة</a>؛{" "}
          <a href="https://commons.wikimedia.org/wiki/File:Old_Jeddah_(5).jpg" rel="noopener">«Old Jeddah (5)»، Radosław Botev</a>، <a href="https://creativecommons.org/licenses/by/3.0/" rel="noopener license">CC BY 3.0</a>.
        </p>
      </div>
    </footer>
  );
}

export function WbHead({ title, lead, center, action }: { title: string; lead?: string; center?: boolean; action?: React.ReactNode }) {
  const copy = <><h2 className="wb-h2 rv">{title}</h2>{lead && <p className="wb-lead rv" style={{ ["--i" as string]: 1 }}>{lead}</p>}</>;
  if (action) return <div className="wb-head wb-head--row"><div>{copy}</div><div className="rv" style={{ ["--i" as string]: 2 }}>{action}</div></div>;
  return <div className={"wb-head" + (center ? " wb-head--center" : "")}>{copy}</div>;
}

export function WbPageHead({ crumbs = [], title, lead, kind, aside }: { crumbs?: [string | null, string][]; title: string; lead?: string; kind?: string; aside?: React.ReactNode }) {
  return (
    <section className={"wb-ph" + (aside ? " wb-ph--legal" : "")}>
      <div className="wb-wrap">
        <nav className="wb-crumb" aria-label="مسار التنقل">
          <Link href="/">الرئيسية</Link>
          {crumbs.map(([h, l]) => (
            <span key={l} style={{ display: "contents" }}>
              <Icon n="chevL" s={14} />
              {h ? <Link href={h}>{l}</Link> : <span aria-current="page">{l}</span>}
            </span>
          ))}
        </nav>
        <div className="wb-ph__row">
          <div className="wb-ph__copy">
            <h1 className="rv">{title}</h1>
            {lead && <p className="wb-lead rv" style={{ ["--i" as string]: 1 }}>{lead}</p>}
            {kind && <p className="wb-ph__kind rv" style={{ ["--i" as string]: 2 }}>{kind}</p>}
          </div>
          {aside && <div className="rv" style={{ ["--i" as string]: 2 }}>{aside}</div>}
        </div>
      </div>
    </section>
  );
}

export function WbFaq({ items }: { items: [string, string][] }) {
  return (
    <div className="wb-faq">
      {items.map(([q, a], i) => (
        <details key={q} name="wb-faq" open={i === 0} className="rv" style={{ ["--i" as string]: i }}>
          <summary>{q}<i className="wb-pm" aria-hidden="true" /></summary>
          <p>{a}</p>
        </details>
      ))}
    </div>
  );
}

export const kindLabel = (s: Service) => (s.type === "request" ? "بطلب عرض سعر" : "بسعر ثابت");
const CTA = { request: "اطلب الخدمة", direct: "اشترك في الخدمة", booking: "احجز جلسة" };
const priceText = (s: Service) => s.priceLabel.replace(/^السعر:\s*/, "");

// One service as a row of the services list: name and scope, the price, the action.
export function ServiceRow({ s, i = 0 }: { s: Service; i?: number }) {
  return (
    <li className="wb-svc rv" style={{ ["--i" as string]: i }}>
      <div className="wb-svc__body">
        <h3><Link href={"/services/" + s.id}>{s.title}</Link></h3>
        <p className="wb-p">{s.subtitle}</p>
        <p className="wb-svc__inc">{s.includes.join("، ")}</p>
      </div>
      <div className="wb-svc__price"><b>{priceText(s)}</b><span>{kindLabel(s)}</span></div>
      <Link className="wb-btn wb-btn--ghost" href={"/services/" + s.id}>{CTA[s.type]}</Link>
    </li>
  );
}

export function ServiceList({ services }: { services: Service[] }) {
  return <ul className="wb-svcs">{services.map((s, i) => <ServiceRow key={s.id} s={s} i={i} />)}</ul>;
}

// Fixed-price services are booked and paid inside the platform; quoted ones run through the four fields.
export function DirectNote() {
  return (
    <div className="wb-direct rv">
      <p className="wb-p">الاستشارات (جلسة مرئية 30 دقيقة) والمتابعة التنفيذية السنوية سعرها ثابت وشامل الضريبة، فتحجزها وتدفع من المنصة مباشرة بعد إنشاء حسابك.</p>
      <div className="wb-hero__cta">
        <Link className="wb-btn wb-btn--pri" href="/services?type=direct">الخدمات بسعر ثابت</Link>
        <Link className="wb-btn wb-btn--ghost" href="/services?type=request">خدمات بطلب عرض سعر</Link>
      </div>
    </div>
  );
}

export function Steps({ list }: { list: [string, string][] }) {
  return (
    <ol className="wb-steps">
      {list.map(([b, s]) => <li key={b}><b>{b}</b><span>{s}</span></li>)}
    </ol>
  );
}

export function Checks({ items }: { items: string[] }) {
  return <ul className="wb-checks">{items.map((i) => <li key={i}>{i}</li>)}</ul>;
}

// The page close: the closing line, and the first step of sign-up already open beside it.
export function WbClose({ title, text, aside }: { title: string; text: React.ReactNode; aside: React.ReactNode }) {
  return (
    <section className="wb-close">
      <div className="wb-wrap wb-close__in">
        <div className="wb-close__copy">
          <h2 className="rv">{title}</h2>
          <p className="rv" style={{ ["--i" as string]: 1 }}>{text}</p>
        </div>
        <div className="rv" style={{ ["--i" as string]: 2, justifySelf: "end", width: "100%", display: "flex", justifyContent: "flex-end" }}>{aside}</div>
      </div>
    </section>
  );
}

// How a quoted service runs: the same request card in four fields, a step further along in each.
export function HowFields() {
  const checks: [string, boolean][] = [["القوائم المالية لثلاث سنوات", true], ["سجل الأصول", true], ["محاضر مجلس النظارة", false]];
  return (
    <ol className="wb-fields" aria-label="مراحل الخدمة بطلب عرض سعر">
      <li className="rv">
        <Ticket state="جديد"><dl><dt>الجهة</dt><dd>وقف الهداية الخيري</dd><dt>المسؤول</dt><dd>لم يُسنَد بعد</dd></dl></Ticket>
        <p>أولاً يصل طلبك، من الموقع أو من داخل المنصة.</p>
      </li>
      <li className="rv" style={{ ["--i" as string]: 1 }}>
        <Ticket state="قيد المراجعة">
          <dl><dt>المسؤول</dt><dd>فريق التقييم</dd><dt>الموعد</dt><dd>خلال يومي عمل</dd></dl>
          <ul>{checks.map(([t, on]) => <li key={t} className={on ? "is-on" : undefined}><i aria-hidden="true" />{t}</li>)}</ul>
        </Ticket>
        <p>ثم يراجع الفريق بياناتك ونطاق العمل.</p>
      </li>
      <li className="rv" style={{ ["--i" as string]: 2 }}>
        <Ticket state="عرض السعر">
          <dl><dt>نطاق العمل</dt><dd>تقييم مالي وتشغيلي</dd><dt>المدة</dt><dd>4 أسابيع</dd></dl>
          <div className="wb-ticket__sum"><span>قيمة العرض</span><b className="wb-num">38,000</b></div>
        </Ticket>
        <p>بعدها يصلك عرض السعر في حسابك على المنصة.</p>
      </li>
      <li className="rv" style={{ ["--i" as string]: 3 }}>
        <Ticket state="قيد التنفيذ">
          <dl><dt>الدفع</dt><dd>مكتمل</dd><dt>التسليم</dt><dd>تقرير التقييم</dd></dl>
          <div className="wb-ticket__sum"><span>المدفوع (ر.س)</span><b className="wb-num">38,000</b></div>
        </Ticket>
        <p>وبعد موافقتك تدفع، ويبدأ التنفيذ.</p>
      </li>
    </ol>
  );
}

function Ticket({ state, children }: { state: string; children: React.ReactNode }) {
  return (
    <div className="wb-ticket" data-ui>
      <div className="wb-ticket__top"><b>تقييم الأداء المالي</b><span>{state}</span></div>
      {children}
    </div>
  );
}
