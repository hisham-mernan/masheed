import Link from "next/link";
import { getAccountContext } from "@/lib/account";
import { PageHead, s } from "./ui";

// Overview for accounts without a waqf yet: start with a service, or add the waqf later
export default async function NoWaqfHome() {
  const ctx = await getAccountContext();
  const { data: services } = await ctx!.supabase.from("services").select("id, title, subtitle, price_label, pricing").eq("active", true).order("sort");

  return (
    <div className="fade-in">
      <PageHead title={`أهلاً ${ctx?.account?.name || ""}`} lead="ابدأ بخدمة تناسب مرحلتك. وحين يكون وقفك جاهزاً أضف بياناته لتديره من النظام." />
      <div className={s.grid}>
        {(services || []).map((v) => (
          <Link key={v.id} href={v.pricing === "booking" ? "/dashboard/bookings/new" : `/dashboard/services/${v.id}`} className={s.card} style={{ textDecoration: "none", color: "inherit" }}>
            <div className={s.cardTop}><h3>{v.title}</h3><small>{v.subtitle}</small><div className={s.price}>{v.price_label}</div></div>
          </Link>
        ))}
      </div>
      <div className={`${s.panel}`} style={{ marginTop: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
        <div><h2>لديك وقف قائم؟</h2><p className={s.hint}>أضف بياناته لتبدأ إدارة أصوله ومستفيديه وماليته من النظام.</p></div>
        <Link href="/dashboard/onboarding" className={s.btn}>أضف وقفك</Link>
      </div>
    </div>
  );
}
