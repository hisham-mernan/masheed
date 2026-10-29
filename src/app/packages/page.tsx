import type { Metadata } from "next";
import Link from "next/link";
import { PlanCards, SysShell, WbCta, WbFaq, WbHead, WbPageHead } from "@/components/system-site/parts";
import Icon from "@/components/system-site/Icon";
import { SYS_CMP, SYS_FAQ } from "@/components/system-site/data";
import { getPlans } from "@/components/system-site/catalog";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "الباقات | نظام مَشيد",
  description: "باقات نظام مَشيد السنوية: الأساسية والمتقدمة والموسعة، شاملة التدريب والدعم وضريبة القيمة المضافة.",
};

export default async function PackagesPage() {
  const plans = await getPlans();
  return (
    <SysShell>
      <WbPageHead crumbs={[[null, "الباقات"]]} title="باقات نظام مَشيد" lead="اشتراك سنوي يشمل التدريب والدعم طوال مدة الاشتراك. جميع الأسعار شاملة ضريبة القيمة المضافة." />
      <section className="wb-page" style={{ paddingTop: 64 }}><div className="wb-wrap"><PlanCards plans={plans} /></div></section>
      <section className="wb-sec" style={{ paddingBottom: 0 }}>
        <div className="wb-wrap">
          <WbHead title="مقارنة تفصيلية" />
          <div className="wb-cmp">
            <table>
              <thead>
                <tr><th scope="col">الميزة</th>{plans.map((p) => <th scope="col" key={p.id} className={p.best ? "is-best" : ""}>{p.name}</th>)}</tr>
              </thead>
              <tbody>
                {SYS_CMP.map((r) => r.length === 1 ? (
                  <tr key={r[0]} className="is-group"><td colSpan={4}>{r[0]}</td></tr>
                ) : (
                  <tr key={r[0]}>
                    <th scope="row" style={{ fontWeight: 500 }}>{r[0]}</th>
                    {r.slice(1).map((v, i) => (
                      <td key={i}>
                        {v === 1 ? <span className="is-yes" aria-label="متاح"><Icon n="check" s={18} w={2.5} /></span>
                          : v === 0 ? <span className="is-no" aria-label="غير متاح"><Icon n="minus" s={18} /></span>
                          : /^[0-9.,–\-\s]+$/.test(String(v)) ? <span className="wb-num">{v}</span> : v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      <section className="wb-sec">
        <div className="wb-wrap wb-split">
          <div className="wb-split__aside"><span className="wb-eyebrow">الأسئلة الشائعة</span><h2 className="wb-h2">عن الباقات والاشتراك.</h2></div>
          <WbFaq items={SYS_FAQ.slice(2)} />
        </div>
      </section>
      <WbCta title="غير متأكد من الباقة المناسبة؟" text="أخبرنا بحجم وقفك وعدد المستخدمين، ونقترح عليك الباقة الأنسب."
        actions={<Link className="wb-btn wb-btn--light wb-btn--lg" href="/contact">تحدّث مع فريقنا</Link>} />
    </SysShell>
  );
}
