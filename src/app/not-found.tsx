import type { Metadata } from "next";
import Link from "next/link";
import { SysShell } from "@/components/system-site/parts";

export const metadata: Metadata = { title: "الصفحة غير موجودة | نظام مَشيد" };

export default function NotFound() {
  return (
    <SysShell>
      <section className="wb-sec">
        <div className="wb-wrap wb-404"><div className="wb-head" style={{ marginBottom: 0 }}>
          <h1 className="wb-h1"><span className="wb-mline"><span>الصفحة غير موجودة</span></span></h1>
          <p className="wb-lead rv" style={{ ["--i" as string]: 2 }}>ربما تغيّر الرابط أو حُذفت الصفحة. يمكنك العودة إلى الرئيسية أو تصفّح الخدمات.</p>
          <div className="wb-hero__cta" style={{ marginTop: 8 }}>
            <Link className="wb-btn wb-btn--pri wb-btn--lg rv" style={{ ["--i" as string]: 3 }} href="/">الرئيسية</Link>
            <Link className="wb-btn wb-btn--ghost wb-btn--lg rv" style={{ ["--i" as string]: 4 }} href="/services">الخدمات</Link>
            <Link className="wb-btn wb-btn--ghost wb-btn--lg rv" style={{ ["--i" as string]: 5 }} href="/packages">الباقات</Link>
          </div>
        </div>
        <figure className="wb-pic rv" style={{ ["--i" as string]: 3, margin: 0 }}>
          <div><img src="/media/old-jeddah-5.jpg" width={1600} height={1200} alt="بيوت جدة التاريخية برواشينها الخشبية" loading="lazy" decoding="async" /></div>
          <figcaption>جدة التاريخية.</figcaption>
        </figure></div>
      </section>
    </SysShell>
  );
}
