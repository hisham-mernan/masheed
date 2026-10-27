import Link from "next/link";
import { notFound } from "next/navigation";
import AdminForm from "@/components/platform/AdminForm";
import { LISTING_CATEGORIES, LISTING_STATUS } from "@/components/platform/options";
import { PageHead, Pill, s } from "@/components/platform/ui";
import { dateAr, getAccountContext, SAR } from "@/lib/account";
import { reviewListing } from "@/lib/platform-actions";

export default async function ListingReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await getAccountContext();
  const { data: l } = await ctx!.supabase.from("listing_requests").select("*, waqfs(name), assets(name)").eq("id", id).single();
  if (!l) notFound();
  const docs = (l.documents as string[]) || [];
  const { data: signed } = docs.length ? await ctx!.supabase.storage.from("listing-docs").createSignedUrls(docs, 600) : { data: [] };
  const rows: [string, React.ReactNode][] = [
    ["الوقف", (l.waqfs as { name: string } | null)?.name],
    ["النوع", LISTING_CATEGORIES[l.category] || "—"],
    ["الأصل", (l.assets as { name: string } | null)?.name || "—"],
    ["المدينة", l.city || "—"],
    ["التمويل المستهدف", `${SAR(l.target_funding)} ر.س`],
    ["قيمة الحصة", `${SAR(l.price_per_share)} ر.س`],
    ["عدد الحصص", l.shares_count ? SAR(l.shares_count) : "—"],
    ["العائد المتوقع", l.expected_return || "—"],
    ["المدة", l.duration_months ? `${l.duration_months} شهراً` : "—"],
    ["المسؤول", `${l.contact_name || "—"} · ${l.contact_phone || ""}`],
    ["تاريخ الطلب", dateAr(l.created_at)],
  ];

  return (
    <div className="fade-in">
      <PageHead title={l.title || "طلب إدراج"} lead="مراجعة بيانات الفرصة ومستنداتها قبل نشرها على منصة وقف مَشيد." action={<Link href="/dashboard/marketplace" className={`${s.btn} ${s.btnGhost}`}>كل الطلبات</Link>} />
      <div className={s.grid2}>
        <section className={s.panel}>
          <div style={{ marginBottom: "1rem" }}><Pill map={LISTING_STATUS} value={l.status} /></div>
          <div className={s.summary}>{rows.map(([k, v]) => <div key={k}><span>{k}</span><span className={s.num} style={{ whiteSpace: "normal", textAlign: "end" }}>{v}</span></div>)}</div>
          {l.description && <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.8, fontSize: "0.9rem", marginTop: "1.25rem" }}>{l.description}</p>}
          <p className={s.label} style={{ marginTop: "1rem" }}>المستندات</p>
          {signed?.length ? (
            <ul className={s.list}>{signed.map((d, i) => <li key={docs[i]}>{d.signedUrl ? <a href={d.signedUrl} target="_blank" rel="noopener">مستند {i + 1} ({docs[i].split(".").pop()})</a> : `مستند ${i + 1} غير متاح`}</li>)}</ul>
          ) : <p className={s.hint}>لا توجد مستندات.</p>}
          {l.review_note && <div className={`${s.alert} ${s.alertInfo}`} style={{ marginTop: "1rem" }}>ملاحظة المراجعة: {l.review_note}</div>}
        </section>
        {ctx!.isPlatformAdmin && (
          <section className={s.panel}>
            <h2>قرار المراجعة</h2>
            <p>الاعتماد ينشر الفرصة على investment.masheedwaqf.com فوراً. عند الرفض اكتب السبب ليصل إلى الجهة.</p>
            <AdminForm action={reviewListing} submit="احفظ القرار" hidden={{ id: l.id }} fields={[
              { name: "decision", label: "القرار", type: "select", options: l.status === "approved" ? [["trading", "متاح للاستثمار"], ["rejected", "إيقاف ورفض"]] : [["approved", "اعتماد ونشر"], ["rejected", "رفض"]] },
              { name: "note", label: "ملاحظة للجهة", type: "textarea", optional: true },
            ]} />
          </section>
        )}
      </div>
    </div>
  );
}
