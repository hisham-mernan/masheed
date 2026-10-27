import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Icon from "@/components/site/Icon";
import { Checks, Crumbs, OpCard, OpChips, WbHead, WqShell } from "@/components/site/parts";
import InterestForm from "@/components/site/InterestForm";
import { categoryOf, fmt, getListing, getListings, statusLabel, titleOf } from "@/lib/listings";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const l = await getListing((await params).id);
  return l ? { title: `${titleOf(l)} | وقف مَشيد`, description: `فرصة وقفية${l.waqf_name ? " تابعة لـ" + l.waqf_name : ""} — سجّل اهتمامك بالاستثمار.` } : {};
}

// One real listing (ui_kits/waqf-website WqOpportunity). The design's tabs for documents,
// governance and updates have no data behind them yet, so the page shows the published
// figures and a register-interest box instead of the simulated invest flow.
export default async function OpportunityPage({ params }: Props) {
  const { id } = await params;
  const [l, all] = await Promise.all([getListing(id), getListings()]);
  if (!l) notFound();
  const c = categoryOf(l);
  const price = Number(l.price_per_share) || 0;
  const others = all.filter((x) => x.id !== l.id && x.status === "approved").slice(0, 3);

  return (
    <WqShell openCount={all.filter((x) => x.status === "approved").length}>
      <section className="wb-page" style={{ paddingTop: 28 }}>
        <div className="wb-wrap">
          <Crumbs crumbs={[["/opportunities", "الفرص الاستثمارية"], [null, titleOf(l)]]} />
          <div className="wq-dhead">
            <OpChips l={l} />
            <h1 className="wb-h2">{titleOf(l)}</h1>
            {l.waqf_name && <div className="wq-meta" style={{ fontSize: 15 }}><Icon n="home" s={16} />{l.waqf_name}</div>}
          </div>
          <div className="wq-detail">
            <div>
              <div className="wq-hero-media"><span className="wq-media__ph"><Icon n={c.icon} s={88} w={1.1} /></span></div>
              <div className="wq-metrics">
                <div><span>المبلغ المستهدف</span><b><span className="wb-num">{fmt(l.target_funding)}</span> <small>ر.س</small></b></div>
                <div><span>قيمة الحصة</span><b><span className="wb-num">{fmt(l.price_per_share)}</span> <small>ر.س</small></b></div>
                <div><span>عدد الحصص</span><b className="wb-num">{fmt(l.shares_count)}</b></div>
                <div><span>نوع الأصل</span><b>{c.label}</b></div>
              </div>
              <div className="wb-panel">
                <h2 className="wb-h3 wb-panel__title">بيانات الفرصة</h2>
                <div className="wb-rows">
                  {l.waqf_name && <div><span>الجهة الوقفية</span><b>{l.waqf_name}</b></div>}
                  <div><span>الأصل</span><b>{titleOf(l)}</b></div>
                  <div><span>نوع الأصل</span><b>{c.label}</b></div>
                  <div><span>الحالة</span><b>{statusLabel(l)}</b></div>
                </div>
              </div>
              <div className="wb-panel">
                <h2 className="wb-h3 wb-panel__title">قبل أن تستثمر</h2>
                <Checks items={["العائد تقديري وغير مضمون، وقد يختلف العائد الفعلي", "الاستثمار غير قابل للاسترداد قبل نهاية مدته", "اطّلع على مستندات الفرصة ودراسة الجدوى قبل اتخاذ قرارك"]} />
              </div>
            </div>
            <aside className="wb-box" id="interest">
              <b style={{ fontFamily: "var(--font-heading)", fontSize: 20 }}>سجّل اهتمامك بهذه الفرصة</b>
              <InterestForm listing={{ id: l.id, price, maxShares: Number(l.shares_count) || 100000 }} />
            </aside>
          </div>
        </div>
      </section>
      {others.length > 0 && (
        <section className="wb-sec" style={{ paddingBottom: 0 }}>
          <div className="wb-wrap">
            <WbHead title="فرص أخرى قد تهمك" action={<Link className="wb-link" href="/opportunities">كل الفرص<Icon n="arrow" s={16} /></Link>} />
            <div className="wb-grid3">{others.map((x) => <OpCard key={x.id} l={x} />)}</div>
          </div>
        </section>
      )}
    </WqShell>
  );
}
