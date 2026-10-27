"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Icon from "./Icon";

const NAV: [string, string][] = [
  ["/", "الرئيسية"],
  ["/opportunities", "الفرص الاستثمارية"],
  ["/about", "عن المنصة"],
];

const isActive = (path: string, href: string) => (href === "/" ? path === "/" : path === href || path.startsWith(href + "/"));

export default function WqHeader({ openCount }: { openCount: number }) {
  const path = usePathname() || "/";
  const [open, setOpen] = useState(false);
  const links = NAV.map(([href, label]) => (
    <Link key={href} href={href} aria-current={isActive(path, href) ? "page" : undefined}>{label}</Link>
  ));

  return (
    <>
      {openCount > 0 && (
        <div className="wb-ann">
          <div className="wb-wrap wb-ann__in">
            <span className="wb-ann__dot" />
            <span>
              <span className="wb-num">{openCount}</span> {openCount === 1 ? "فرصة وقفية متاحة" : "فرص وقفية متاحة"} الآن. <Link href="/opportunities">استعرض الفرص</Link>
            </span>
          </div>
        </div>
      )}
      <header className="wb-hdr">
        <div className="wb-wrap wb-hdr__in">
          <Link className="wb-brand" href="/">
            <img src="/brand/masheed-mark-waqf.svg" alt="" />
            <span><b>وقف مَشيد</b><small>منصة الاستثمار الوقفي</small></span>
          </Link>
          <nav className="wb-nav" aria-label="القائمة الرئيسية">{links}</nav>
          <div className="wb-hdr__act">
            <Link className="wb-btn wb-btn--ghost wb-btn--sm" href="/auth/login">تسجيل الدخول</Link>
            <Link className="wb-btn wb-btn--pri wb-btn--sm" href="/opportunities">تصفّح الفرص</Link>
            <button type="button" className="wb-menu" aria-expanded={open} aria-controls="wb-mnav"
              aria-label={open ? "إغلاق القائمة" : "فتح القائمة"} onClick={() => setOpen(!open)}>
              <Icon n={open ? "x" : "menu"} s={20} />
            </button>
          </div>
        </div>
        <div className="wb-wrap">
          <nav id="wb-mnav" className="wb-mnav" aria-label="القائمة" hidden={!open}
            onClick={(e) => { if ((e.target as HTMLElement).closest("a")) setOpen(false); }}>
            {links}
            <Link href="/auth/login">تسجيل الدخول</Link>
            <Link href="/auth/signup">أنشئ حسابك</Link>
          </nav>
        </div>
      </header>
    </>
  );
}
