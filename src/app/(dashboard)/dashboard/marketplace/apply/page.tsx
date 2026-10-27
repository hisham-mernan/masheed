import Link from "next/link";
import ListingForm from "@/components/platform/ListingForm";
import { PageHead, s } from "@/components/platform/ui";
import { getAccountContext } from "@/lib/account";

export const metadata = { title: "طلب الإدراج في منصة الاستثمار | مَشيد" };

export default async function ApplyPage() {
  const ctx = await getAccountContext();
  const waqfId = ctx!.profile?.waqf_id;
  const canWrite = ["admin", "supervisor"].includes(ctx!.profile?.role || "");
  const { data: assets } = waqfId ? await ctx!.supabase.from("assets").select("id, name").eq("waqf_id", waqfId).order("name") : { data: [] };

  return (
    <div className="fade-in" style={{ maxWidth: 820 }}>
      <PageHead
        title="اعرض فرصتك على منصة وقف مَشيد"
        lead="أرسل بيانات الفرصة الاستثمارية ومستنداتها للمراجعة. بعد اعتمادها من فريق مَشيد تُنشر على منصة الاستثمار ويستقبل وقفك اهتمام المستثمرين."
        action={<Link href="/dashboard/marketplace" className={`${s.btn} ${s.btnGhost}`}>طلبات الطرح</Link>}
      />
      {!waqfId ? (
        <div className={`${s.alert} ${s.alertWarn}`}>أضف بيانات وقفك أولاً. <Link href="/dashboard/onboarding">أضف وقفك</Link></div>
      ) : !canWrite ? (
        <div className={`${s.alert} ${s.alertWarn}`}>تقديم الطلب متاح لمدير الوقف أو المشرف.</div>
      ) : (
        <section className={s.panel}>
          <ListingForm waqfId={waqfId} assets={assets || []} defaults={{ contact_name: ctx!.profile?.full_name || "", contact_phone: ctx!.account?.phone || "" }} />
        </section>
      )}
    </div>
  );
}
