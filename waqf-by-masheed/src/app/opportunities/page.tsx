import type { Metadata } from "next";
import Icon from "@/components/site/Icon";
import { WbPageHead, WqShell } from "@/components/site/parts";
import Browse from "@/components/site/Browse";
import InterestForm from "@/components/site/InterestForm";
import { getListings } from "@/lib/listings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "الفرص الاستثمارية | وقف مَشيد",
  description: "فرص وقفية راجعتها لجنة المراجعة، بمستنداتها ومؤشراتها المالية.",
};

export default async function OpportunitiesPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type } = await searchParams;
  const listings = await getListings();
  const open = listings.filter((l) => l.status === "approved").length;
  return (
    <WqShell openCount={open}>
      <WbPageHead crumbs={[[null, "الفرص الاستثمارية"]]} title="الفرص الاستثمارية" lead="فرص وقفية راجعتها لجنة المراجعة، بمستنداتها ومؤشراتها المالية كاملة." />
      <section className="wb-page">
        <div className="wb-wrap">
          {listings.length > 0 ? (
            <Browse key={type ?? "all"} listings={listings} initialType={type} />
          ) : (
            <div className="wq-empty" id="interest">
              <div className="wq-empty__copy">
                <span className="wb-ico"><Icon n="calendar" s={26} /></span>
                <h2 className="wb-h2">لا توجد فرص مطروحة حالياً.</h2>
                <p className="wb-p">تُنشر الفرص هنا بعد اكتمال مراجعتها واعتمادها. سجّل اهتمامك وسنتواصل معك عند طرح الفرص القادمة.</p>
              </div>
              <div className="wb-panel"><InterestForm /></div>
            </div>
          )}
        </div>
      </section>
    </WqShell>
  );
}
