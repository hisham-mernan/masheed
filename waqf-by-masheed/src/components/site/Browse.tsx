"use client";

import { useState } from "react";
import Icon from "./Icon";
import { OpCard } from "./parts";
import { CATEGORY, type Listing } from "@/lib/listings";

type Status = "all" | "approved" | "trading";
type Sort = "new" | "target" | "price";

// Filters for the real listings: the design also filtered by city, return and minimum ticket,
// which public_listings does not carry yet.
export default function Browse({ listings, initialType }: { listings: Listing[]; initialType?: string }) {
  const [status, setStatus] = useState<Status>("all");
  const [types, setTypes] = useState<string[]>(initialType && CATEGORY[initialType] ? [initialType] : []);
  const [sort, setSort] = useState<Sort>("new");
  const present = Object.keys(CATEGORY).filter((k) => listings.some((l) => l.asset_category === k));
  const reset = () => { setStatus("all"); setTypes([]); };
  const toggle = (k: string) => setTypes(types.includes(k) ? types.filter((x) => x !== k) : [...types, k]);

  const list = listings
    .filter((l) => (status === "all" || l.status === status) && (!types.length || types.includes(l.asset_category ?? "")))
    .sort((a, b) => sort === "target" ? (Number(b.target_funding) || 0) - (Number(a.target_funding) || 0)
      : sort === "price" ? (Number(a.price_per_share) || 0) - (Number(b.price_per_share) || 0)
      : b.created_at.localeCompare(a.created_at));

  return (
    <div className="wq-browse">
      <aside className="wq-filters" aria-label="تصفية الفرص">
        <div className="wq-filters__head"><b><Icon n="filter" s={18} />التصفية</b><button type="button" onClick={reset}>إعادة الضبط</button></div>
        <div className="wq-fg">
          <b>الحالة</b>
          <div className="wq-pills">
            {([["all", "الكل"], ["approved", "متاحة"], ["trading", "متداولة"]] as [Status, string][]).map(([k, l]) => (
              <button key={k} type="button" aria-pressed={status === k} onClick={() => setStatus(k)}>{l}</button>
            ))}
          </div>
        </div>
        {present.length > 0 && (
          <div className="wq-fg">
            <b>نوع الأصل</b>
            <div className="wq-pills">
              {present.map((k) => <button key={k} type="button" aria-pressed={types.includes(k)} onClick={() => toggle(k)}>{CATEGORY[k].label}</button>)}
            </div>
          </div>
        )}
      </aside>
      <div>
        <div className="wq-toolbar">
          <span className="wb-p"><b className="wb-num" style={{ color: "var(--color-ink)" }}>{list.length}</b> فرصة مطابقة</span>
          <label>ترتيب حسب
            <select className="wb-input" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
              <option value="new">الأحدث</option>
              <option value="target">الأعلى مبلغاً مستهدفاً</option>
              <option value="price">الأقل قيمةً للحصة</option>
            </select>
          </label>
        </div>
        {list.length ? (
          <div className="wq-grid">{list.map((l) => <OpCard key={l.id} l={l} />)}</div>
        ) : (
          <div className="wb-empty wb-panel">
            <Icon n="search" s={28} />
            <b>لا توجد فرص مطابقة لاختياراتك.</b>
            <button type="button" className="wb-btn wb-btn--ghost wb-btn--sm" onClick={reset}>إعادة ضبط التصفية</button>
          </div>
        )}
      </div>
    </div>
  );
}
