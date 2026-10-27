import type { Metadata } from "next";
import Link from "next/link";
import { WqShell } from "@/components/site/parts";

export const metadata: Metadata = { title: "الصفحة غير موجودة | وقف مَشيد" };

export default function NotFound() {
  return (
    <WqShell openCount={0}>
      <section className="wb-sec">
        <div className="wb-wrap wb-head wb-head--center">
          <span className="wb-eyebrow">404</span>
          <h1 className="wb-h2">الصفحة غير موجودة</h1>
          <p className="wb-lead">ربما تغيّر الرابط، أو لم تعد الفرصة معروضة. يمكنك العودة إلى الرئيسية أو تصفّح الفرص المتاحة.</p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginTop: 8 }}>
            <Link className="wb-btn wb-btn--pri" href="/">الرئيسية</Link>
            <Link className="wb-btn wb-btn--ghost" href="/opportunities">الفرص الاستثمارية</Link>
          </div>
        </div>
      </section>
    </WqShell>
  );
}
