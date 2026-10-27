import type { Metadata } from "next";
import Link from "next/link";
import { SysShell } from "@/components/system-site/parts";

export const metadata: Metadata = { title: "الصفحة غير موجودة | نظام مَشيد" };

export default function NotFound() {
  return (
    <SysShell>
      <section className="wb-sec">
        <div className="wb-wrap wb-head wb-head--center">
          <span className="wb-eyebrow">404</span>
          <h1 className="wb-h2">الصفحة غير موجودة</h1>
          <p className="wb-lead">ربما تغيّر الرابط أو حُذفت الصفحة. يمكنك العودة إلى الرئيسية أو تصفّح الخدمات.</p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginTop: 8 }}>
            <Link className="wb-btn wb-btn--pri" href="/">الرئيسية</Link>
            <Link className="wb-btn wb-btn--ghost" href="/services">الخدمات</Link>
          </div>
        </div>
      </section>
    </SysShell>
  );
}
