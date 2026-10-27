"use client";

import Link from "next/link";
import { useState } from "react";
import Icon from "./Icon";
import { ServiceCard } from "./parts";
import { SYS_SERVICES } from "./data";

type Kind = "all" | "direct" | "request";
const TABS: [Kind, string][] = [["all", "كل الخدمات"], ["direct", "شراء مباشر"], ["request", "بطلب عرض سعر"]];
const count = (k: Kind) => SYS_SERVICES.filter((s) => k === "all" || s.type === k).length;

export function TypeTabs({ value, onChange }: { value: Kind; onChange: (k: Kind) => void }) {
  return (
    <div className="wb-tabs" role="group" aria-label="نوع الخدمة">
      {TABS.map(([k, l]) => (
        <button key={k} type="button" aria-pressed={value === k} onClick={() => onChange(k)}>
          {l}<small className="wb-num">{count(k)}</small>
        </button>
      ))}
    </div>
  );
}

const asKind = (t?: string): Kind => (t === "direct" || t === "request" ? t : "all");

// Home: tabs in the section head, first six services, link to the full list.
export function HomeServices() {
  const [tab, setTab] = useState<Kind>("all");
  const list = SYS_SERVICES.filter((s) => tab === "all" || s.type === tab).slice(0, 6);
  return (
    <>
      <div className="wb-head wb-head--row">
        <div>
          <span className="wb-eyebrow">الخدمات</span>
          <h2 className="wb-h2">خدمات تكمّل النظام، من الجلسة الاستشارية إلى دراسة الجدوى.</h2>
        </div>
        <TypeTabs value={tab} onChange={setTab} />
      </div>
      <div className="wb-grid3">{list.map((s) => <ServiceCard key={s.id} s={s} />)}</div>
      <div className="wb-more">
        <Link className="wb-btn wb-btn--ghost" href={"/services" + (tab === "all" ? "" : "?type=" + tab)}>عرض كل الخدمات<Icon n="arrow" s={16} /></Link>
      </div>
    </>
  );
}

// Services page: tabs + search over the full list.
export function ServicesBrowser({ initialType }: { initialType?: string }) {
  const [tab, setTab] = useState<Kind>(asKind(initialType));
  const [term, setTerm] = useState("");
  const q = term.trim();
  const list = SYS_SERVICES.filter((s) => (tab === "all" || s.type === tab) && (!q || s.title.includes(q) || s.desc.includes(q)));
  return (
    <>
      <div className="wb-toolbar">
        <TypeTabs value={tab} onChange={setTab} />
        <label className="wb-search">
          <Icon n="search" s={18} />
          <input className="wb-input" type="search" value={term} onChange={(e) => setTerm(e.target.value)} placeholder="ابحث عن خدمة" aria-label="ابحث عن خدمة" />
        </label>
      </div>
      {list.length ? (
        <div className="wb-grid3">{list.map((s) => <ServiceCard key={s.id} s={s} />)}</div>
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
