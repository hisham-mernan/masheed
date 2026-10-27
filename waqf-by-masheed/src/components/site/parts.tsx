import Link from "next/link";
import Icon from "./Icon";
import WqHeader from "./WqHeader";
import { MAIN_URL, SYSTEM_URL } from "./data";
import { categoryOf, fmt, statusLabel, titleOf, type Listing } from "@/lib/listings";
import "./waqf-site.css";

export function WqShell({ openCount, children }: { openCount: number; children: React.ReactNode }) {
  return (
    <div className="wb wb--waqf" dir="rtl" lang="ar">
      <WqHeader openCount={openCount} />
      <main>{children}</main>
      <WqFooter />
    </div>
  );
}

function WqFooter() {
  const cols: [string, [string, string][]][] = [
    ["المنصة", [["/opportunities", "الفرص الاستثمارية"], ["/about", "كيف تعمل المنصة"], ["/auth/signup", "أنشئ حسابك"]]],
    ["حسابك", [["/auth/login", "تسجيل الدخول"], ["/auth/signup", "حساب جديد"], ["/#interest", "سجّل اهتمامك"]]],
    ["الشركة", [[MAIN_URL + "/#about", "عن مَشيد"], [MAIN_URL + "/#contact", "تواصل معنا"], [MAIN_URL, "منظومة مَشيد"]]],
  ];
  return (
    <footer className="wb-foot">
      <div className="wb-wrap">
        <div className="wb-foot__grid">
          <div className="wb-foot__brand">
            <Link className="wb-brand wb-brand--light" href="/">
              <img src="/brand/masheed-mark-waqf.svg" alt="" />
              <span><b>وقف مَشيد</b><small>منصة الاستثمار الوقفي</small></span>
            </Link>
            <p>منصة تتيح للمستثمرين الوصول إلى فرصٍ وقفيةٍ مؤهّلة، بمسار مراجعةٍ منظّم وإفصاحٍ كامل.</p>
            <a className="wb-foot__sister" href={SYSTEM_URL}>
              <img src="/brand/masheed-mark.svg" alt="" />
              <span><small>من منظومة مَشيد</small><b>نظام مَشيد — لإدارة الأوقاف</b></span>
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

export function WbPageHead({ crumbs = [], title, lead }: { crumbs?: [string | null, string][]; title: string; lead?: string }) {
  return (
    <section className="wb-ph">
      <div className="wb-wrap">
        <Crumbs crumbs={crumbs} />
        <div className="wb-ph__row">
          <div className="wb-ph__copy"><h1 className="wb-h2">{title}</h1>{lead && <p className="wb-lead">{lead}</p>}</div>
        </div>
      </div>
    </section>
  );
}

export function Crumbs({ crumbs }: { crumbs: [string | null, string][] }) {
  return (
    <nav className="wb-crumb" aria-label="مسار التنقل">
      <Link href="/">الرئيسية</Link>
      {crumbs.map(([h, l]) => (
        <span key={l} style={{ display: "contents" }}>
          <Icon n="chevL" s={14} />
          {h ? <Link href={h}>{l}</Link> : <span aria-current="page">{l}</span>}
        </span>
      ))}
    </nav>
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

export function Checks({ items }: { items: string[] }) {
  return <ul className="wb-checks">{items.map((x) => <li key={x}><Icon n="check" s={16} w={2.5} />{x}</li>)}</ul>;
}

export function OpChips({ l }: { l: Listing }) {
  const c = categoryOf(l);
  return (
    <div className="wq-chips">
      <span className={"wq-chip" + (l.status === "trading" ? " wq-chip--warn" : "")}><i />{statusLabel(l)}</span>
      <span className="wq-chip"><Icon n={c.icon} s={13} />{c.label}</span>
    </div>
  );
}

// Card for a real listing from public_listings. The listing has no photo, return or
// funding progress yet, so the card shows only what the System published.
export function OpCard({ l }: { l: Listing }) {
  const c = categoryOf(l);
  const href = "/opportunities/" + l.id;
  return (
    <article className="wq-card">
      <div className="wq-media">
        <span className="wq-media__ph"><Icon n={c.icon} s={56} w={1.2} /></span>
        <OpChips l={l} />
      </div>
      <div className="wq-body">
        <div>
          <h3 className="wq-title"><Link href={href}>{titleOf(l)}</Link></h3>
          {l.waqf_name && <div className="wq-meta"><Icon n="home" s={14} />{l.waqf_name}</div>}
        </div>
        <div className="wq-kv">
          <div><span>قيمة الحصة (ر.س)</span><b className="wb-num">{fmt(l.price_per_share)}</b></div>
          <div><span>عدد الحصص</span><b className="wb-num">{fmt(l.shares_count)}</b></div>
          <div><span>المستهدف (ر.س)</span><b className="wb-num">{fmt(l.target_funding)}</b></div>
        </div>
        <Link className="wb-btn wb-btn--pri wb-btn--block" href={href}>استعرض الفرصة</Link>
      </div>
    </article>
  );
}
