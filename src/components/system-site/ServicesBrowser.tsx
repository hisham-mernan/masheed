"use client";

import Link from "next/link";
import { useState } from "react";
import Icon from "./Icon";
import { ServiceCard } from "./parts";
import type { Service } from "./data";

type Kind = "all" | "direct" | "request";
const TABS: [Kind, string][] = [["all", "كل الخدمات"], ["direct", "بسعر ثابت"], ["request", "بطلب عرض سعر"]];
// Consultation sessions have a fixed price too
const kindOf = (s: Service): Kind => (s.type === "request" ? "request" : "direct");
const pick = (list: Service[], k: Kind) => list.filter((s) => k === "all" || kindOf(s) === k);
// Two or four cards sit better in two columns than as a row of three plus an orphan
const gridFor = (n: number) => (n === 2 || n === 4 ? "wb-grid2" : "wb-grid3");

export function TypeTabs({ services, value, onChange }: { services: Service[]; value: Kind; onChange: (k: Kind) => void }) {
  return (
    <div className="wb-tabs" role="group" aria-label="نوع الخدمة">
      {TABS.map(([k, l]) => (
        <button key={k} type="button" aria-pressed={value === k} onClick={() => onChange(k)}>
          {l}<small className="wb-num">{pick(services, k).length}</small>
        </button>
      ))}
    </div>
  );
}

const asKind = (t?: string): Kind => (t === "direct" || t === "request" ? t : "all");

// Home: tabs in the section head, the services, link to the full list.
export function HomeServices({ services }: { services: Service[] }) {
  const [tab, setTab] = useState<Kind>("all");
  const list = pick(services, tab).slice(0, 6);
  return (
    <>
      <div className="wb-head wb-head--row">
        <div>
          <span className="wb-eyebrow">الخدمات المهنية</span>
          <h2 className="wb-h2">من تأسيس الوقف إلى متابعة تنفيذ خطته طوال العام.</h2>
        </div>
        <TypeTabs services={services} value={tab} onChange={setTab} />
      </div>
      <div className={gridFor(list.length)}>{list.map((s) => <ServiceCard key={s.id} s={s} />)}</div>
      <div className="wb-more">
        <Link className="wb-btn wb-btn--ghost" href={"/services" + (tab === "all" ? "" : "?type=" + tab)}>عرض كل الخدمات<Icon n="arrow" s={16} /></Link>
      </div>
    </>
  );
}

// Services page: tabs + search over the full list.
export function ServicesBrowser({ services, initialType }: { services: Service[]; initialType?: string }) {
  const [tab, setTab] = useState<Kind>(asKind(initialType));
  const [term, setTerm] = useState("");
  const q = term.trim();
  const list = pick(services, tab).filter((s) => !q || s.title.includes(q) || s.desc.includes(q));
  return (
    <>
      <div className="wb-toolbar">
        <TypeTabs services={services} value={tab} onChange={setTab} />
        <label className="wb-search">
          <Icon n="search" s={18} />
          <input className="wb-input" type="search" value={term} onChange={(e) => setTerm(e.target.value)} placeholder="ابحث عن خدمة" aria-label="ابحث عن خدمة" />
        </label>
      </div>
      {list.length ? (
        <div className={gridFor(list.length)}>{list.map((s) => <ServiceCard key={s.id} s={s} />)}</div>
      ) : (
        <div className="wb-empty">
          <Icon n="search" s={28} />
          <b>لا توجد خدمات مطابقة.</b>
          <button type="button" className="wb-btn wb-btn--ghost wb-btn--sm" onClick={() => { setTerm(""); setTab("all"); }}>عرض كل الخدمات</button>
        </div>
      )}
    </>
  );
}
