"use client";

import { useState } from "react";
import Icon from "./Icon";
import { ServiceList } from "./parts";
import type { Service } from "./data";

type Kind = "all" | "direct" | "request";
const TABS: [Kind, string][] = [["all", "كل الخدمات"], ["direct", "بسعر ثابت"], ["request", "بطلب عرض سعر"]];
// Consultation sessions have a fixed price too
const kindOf = (s: Service): Kind => (s.type === "request" ? "request" : "direct");
const pick = (list: Service[], k: Kind) => list.filter((s) => k === "all" || kindOf(s) === k);
const asKind = (t?: string): Kind => (t === "direct" || t === "request" ? t : "all");

function TypeTabs({ services, value, onChange }: { services: Service[]; value: Kind; onChange: (k: Kind) => void }) {
  return (
    <div className="wb-tabs" role="group" aria-label="نوع الخدمة">
      {TABS.map(([k, l]) => (
        <button key={k} type="button" aria-pressed={value === k} onClick={() => onChange(k)}>
          {l} <span className="wb-num">({pick(services, k).length})</span>
        </button>
      ))}
    </div>
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
          <Icon n="search" s={20} />
          <input className="wb-input" type="search" value={term} onChange={(e) => setTerm(e.target.value)} placeholder="ابحث عن خدمة" aria-label="ابحث عن خدمة" />
        </label>
      </div>
      {list.length ? (
        <ServiceList services={list} />
      ) : (
        <div className="wb-empty">
          <b>لا توجد خدمات مطابقة.</b>
          <button type="button" className="wb-btn wb-btn--ghost wb-btn--sm" onClick={() => { setTerm(""); setTab("all"); }}>عرض كل الخدمات</button>
        </div>
      )}
    </>
  );
}
