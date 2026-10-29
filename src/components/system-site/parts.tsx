import Link from "next/link";
import Icon from "./Icon";
import SysHeader from "./SysHeader";
import { fmt, type Plan, type Service } from "./data";
import "../landing/masheed-site.css"; // product-screen previews (.mw-screen)
import "./system-site.css";

export const MAIN_URL = process.env.NEXT_PUBLIC_MAIN_URL || "https://masheedwaqf.com";
export const INVESTMENT_URL = process.env.NEXT_PUBLIC_INVESTMENT_URL || "https://investment.masheedwaqf.com";

export function SysShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="wb" dir="rtl" lang="ar">
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
              <span><small>من منظومة مَشيد</small><b>وقف مَشيد — منصة الاستثمار</b></span>
              <Icon n="arrow" s={16} />
            </a>
          </div>
          {cols.map(([h, links]) => (
            <div key={h}>
              <h4>{h}</h4>
              <ul>{links.map(([href, l]) => <li key={l}><a href={href}>{l}</a></li>)}</ul>
            </div>
          ))}
        </div>
        <div className="wb-foot__base">
          <span>© 2026 مَشيد. جميع الحقوق محفوظة.</span>
          <div><a href="/privacy">سياسة الخصوصية</a><a href="/terms">الشروط والأحكام</a></div>
        </div>
      </div>
    </footer>
  );
}

export function WbHead({ eyebrow, title, lead, center, action }: { eyebrow?: string; title: string; lead?: string; center?: boolean; action?: React.ReactNode }) {
  const copy = <>{eyebrow && <span className="wb-eyebrow">{eyebrow}</span>}<h2 className="wb-h2">{title}</h2>{lead && <p className="wb-lead">{lead}</p>}</>;
  if (action) return <div className="wb-head wb-head--row"><div>{copy}</div>{action}</div>;
  return <div className={"wb-head" + (center ? " wb-head--center" : "")}>{copy}</div>;
}

export function WbPageHead({ crumbs = [], title, lead, children }: { crumbs?: [string | null, string][]; title: string; lead?: string; children?: React.ReactNode }) {
  return (
    <section className="wb-ph">
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
          <div className="wb-ph__copy"><h1 className="wb-h2">{title}</h1>{lead && <p className="wb-lead">{lead}</p>}</div>
          {children}
        </div>
      </div>
    </section>
  );
}

export function WbCta({ title, text, actions }: { title: string; text: string; actions: React.ReactNode }) {
  return (
    <section className="wb-wrap">
      <div className="wb-cta">
        <img className="wb-cta__mark" src="/brand/masheed-mark-mono-white.svg" alt="" />
        <div><h2>{title}</h2><p>{text}</p></div>
        <div className="wb-cta__act">{actions}</div>
      </div>
    </section>
  );
}

export function WbFaq({ items }: { items: [string, string][] }) {
  return (
    <div className="wb-faq">
      {items.map(([q, a], i) => (
        <details key={q} open={i === 0}>
          <summary>{q}<i><Icon n="plus" s={16} /></i></summary>
          <p>{a}</p>
        </details>
      ))}
    </div>
  );
}

export function TypeTag({ direct }: { direct: boolean }) {
  return (
    <span className={"wb-tag " + (direct ? "wb-tag--direct" : "wb-tag--request")}>
      <Icon n={direct ? "cart" : "send"} s={13} />{direct ? "بسعر ثابت" : "بطلب عرض سعر"}
    </span>
  );
}

const CTA = { request: "اطلب الخدمة", direct: "اشترك في الخدمة", booking: "احجز جلسة" };

export function ServiceCard({ s }: { s: Service }) {
  return (
    <article className="wb-card wb-card--hover">
      <div className="wb-card__top"><span className="wb-ico"><Icon n={s.icon} s={22} /></span><TypeTag direct={s.type !== "request"} /></div>
      <h3 className="wb-h3"><Link href={"/services/" + s.id}>{s.title}</Link></h3>
      <p className="wb-p">{s.subtitle}</p>
      <ul className="wb-checks">{s.includes.map((i) => <li key={i}><Icon n="check" s={16} w={2.5} />{i}</li>)}</ul>
      <div className="wb-card__foot">
        <div className="wb-price"><small>السعر</small><b>{s.priceLabel.replace(/^السعر:s*/, "")}</b></div>
        <Link className="wb-link" href={"/services/" + s.id}>{CTA[s.type]}<Icon n="arrow" s={16} /></Link>
      </div>
    </article>
  );
}

export function PlanCards({ plans }: { plans: Plan[] }) {
  return (
    <div className="wb-plans">
      {plans.map((p) => (
        <div key={p.id} className={"wb-plan" + (p.best ? " wb-plan--best" : "")}>
          {p.best && <span className="wb-plan__badge">الأكثر اختياراً</span>}
          <h3 className="wb-plan__name">{p.name}</h3>
          <p className="wb-plan__users">{p.users}</p>
          <div className="wb-plan__price"><b className="wb-num">{fmt(p.price)}</b><span>ر.س / سنوياً</span></div>
          <ul className="wb-checks">{p.feats.map((f) => <li key={f}><Icon n="check" s={16} w={2.5} />{f}</li>)}</ul>
          <Link className={"wb-btn wb-btn--block " + (p.best ? "wb-btn--pri" : "wb-btn--ghost")} href={"/register?plan=" + p.id}>ابدأ تجربة مجانية</Link>
        </div>
      ))}
    </div>
  );
}

// Fixed-price services are booked and paid inside the platform; the others start with a request and a quotation.
export function SysFlows() {
  const d: [string, string][] = [["اختر الخدمة", "السعر ظاهر وشامل الضريبة"], ["أنشئ حسابك", "تجربة مجانية للنظام 15 يوماً"], ["احجز وادفع من المنصة", "دفع إلكتروني آمن"]];
  const r: [string, string][] = [["أرسل طلبك", "من الموقع أو من داخل المنصة"], ["مراجعة الطلب", "يراجع الفريق بياناتك ونطاق العمل"], ["عرض السعر", "يصلك في حسابك على المنصة"], ["الدفع والتنفيذ", "بعد موافقتك على العرض"]];
  return (
    <div className="wb-flows">
      <div className="wb-flow">
        <TypeTag direct />
        <h3 className="wb-h3">خدمات بسعرٍ ثابت</h3>
        <p className="wb-p">الاستشارات (جلسة مرئية 30 دقيقة) والمتابعة التنفيذية السنوية.</p>
        <Steps list={d} />
        <Link className="wb-btn wb-btn--ghost" href="/services?type=direct">الخدمات بسعر ثابت</Link>
      </div>
      <div className="wb-flow wb-flow--alt">
        <TypeTag direct={false} />
        <h3 className="wb-h3">خدمات تُسعَّر بحسب حالتك</h3>
        <p className="wb-p">تأسيس الوقف، وتقييم الأداء المالي والتشغيلي.</p>
        <Steps list={r} />
        <Link className="wb-btn wb-btn--light" href="/services?type=request">خدمات بطلب عرض سعر</Link>
      </div>
    </div>
  );
}

export function Steps({ list, style }: { list: [string, string][]; style?: React.CSSProperties }) {
  return (
    <ol className="wb-flow__steps" style={style}>
      {list.map(([b, s], i) => <li key={b}><span className="wb-flow__n wb-num">{i + 1}</span><b>{b}</b><span>{s}</span></li>)}
    </ol>
  );
}
