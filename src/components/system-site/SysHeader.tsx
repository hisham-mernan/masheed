"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Icon from "./Icon";

const NAV: [string, string][] = [
  ["/", "الرئيسية"],
  ["/services", "الخدمات"],
  ["/packages", "الباقات"],
  ["/contact", "تواصل معنا"],
];

// "/services/consult" keeps "الخدمات" highlighted
const isActive = (path: string, href: string) => (href === "/" ? path === "/" : path === href || path.startsWith(href + "/"));

export default function SysHeader() {
  const path = usePathname() || "/";
  const [open, setOpen] = useState(false);

  const links = NAV.map(([href, label]) => (
    <Link key={href} href={href} aria-current={isActive(path, href) ? "page" : undefined}>{label}</Link>
  ));

  return (
    <>
      <div className="wb-ann">
        <div className="wb-wrap wb-ann__in">
          <span>المساعد الذكي لتحليل الوثائق وصياغة التقارير. <Link href="/packages">اعرف المزيد</Link></span>
        </div>
      </div>
      <header className="wb-hdr">
        <div className="wb-wrap wb-hdr__in">
          <Link className="wb-brand" href="/">
            <img src="/brand/masheed-mark.svg" alt="" />
            <span><b>نظام مَشيد</b><small>نظام تشغيل الجهة الوقفية</small></span>
          </Link>
          <nav className="wb-nav" aria-label="القائمة الرئيسية">{links}</nav>
          <div className="wb-hdr__act">
            <Link className="wb-btn wb-btn--ghost wb-btn--sm" href="/login">تسجيل الدخول</Link>
            <Link className="wb-btn wb-btn--pri wb-btn--sm" href="/packages">ابدأ الآن</Link>
            <button type="button" className="wb-menu" aria-expanded={open} aria-controls="wb-mnav"
              aria-label={open ? "إغلاق القائمة" : "فتح القائمة"} onClick={() => setOpen(!open)}>
              <Icon n={open ? "x" : "menu"} s={22} />
            </button>
          </div>
        </div>
        <div className="wb-wrap">
          <nav id="wb-mnav" className="wb-mnav" aria-label="القائمة" hidden={!open}
            onClick={(e) => { if ((e.target as HTMLElement).closest("a")) setOpen(false); }}>
            {links}
            <Link href="/login">تسجيل الدخول</Link>
          </nav>
        </div>
      </header>
    </>
  );
}
