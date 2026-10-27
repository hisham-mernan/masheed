import { PAYMENT_STATUS } from "@/components/platform/options";
import { PageHead, Pill, s } from "@/components/platform/ui";
import { dateAr, getAccountContext, SAR } from "@/lib/account";
import { buyPackage } from "@/lib/platform-actions";

export const metadata = { title: "الباقة والفوترة | مَشيد" };

export default async function BillingPage({ searchParams }: { searchParams: Promise<{ expired?: string; upgrade?: string }> }) {
  const { expired, upgrade } = await searchParams;
  const ctx = await getAccountContext();
  const a = ctx!.access;
  const [{ data: packages }, { data: subs }, { data: payments }] = await Promise.all([
    ctx!.supabase.from("packages").select("*").eq("active", true).order("sort"),
    ctx!.supabase.from("subscriptions").select("id, package_id, source, starts_at, ends_at").eq("account_id", ctx!.account?.id || "").order("ends_at", { ascending: false }).limit(10),
    ctx!.supabase.from("payments").select("id, description, amount_halalas, status, created_at, paid_at").eq("account_id", ctx!.account?.id || "").order("created_at", { ascending: false }).limit(20),
  ]);
  const nameOf = (id: string | null) => packages?.find((p) => p.id === id)?.name || id;

  const status =
    a.state === "trial" ? { tone: s.alertInfo, text: `أنت في الفترة التجريبية (مزايا الباقة الأساسية). تبقّى ${a.daysLeft} ${a.daysLeft === 1 ? "يوم" : "يوماً"}.` }
    : a.state === "active" ? { tone: s.alertOk, text: `باقتك الحالية: ${nameOf(a.packageId)} — سارية حتى ${dateAr(a.endsAt!)}.` }
    : a.state === "admin" ? { tone: s.alertInfo, text: "حساب مدير المنصة: كل المزايا متاحة." }
    : { tone: s.alertWarn, text: "انتهت فترتك التجريبية أو اشتراكك. اختر باقة لمواصلة استخدام النظام؛ الخدمات والحجوزات متاحة دائماً." };

  return (
    <div className="fade-in">
      <PageHead title="الباقة والفوترة" lead="اختر الباقة التي تناسب جهتك. الاشتراك سنوي والأسعار شاملة الضريبة." />
      <div className={`${s.alert} ${status.tone}`} style={{ marginBottom: "1rem" }}>{status.text}</div>
      {expired && a.state === "expired" && <div className={`${s.alert} ${s.alertWarn}`} style={{ marginBottom: "1rem" }}>هذه الصفحة تتطلب باقة فعّالة.</div>}
      {upgrade && Number(upgrade) > a.tier && <div className={`${s.alert} ${s.alertWarn}`} style={{ marginBottom: "1rem" }}>هذه الميزة متاحة في باقة «{packages?.find((p) => p.tier >= Number(upgrade))?.name}» وما فوقها.</div>}

      <div className={s.grid}>
        {(packages || []).map((p) => {
          const current = a.state === "active" && a.packageId === p.id;
          return (
            <article key={p.id} className={`${s.card} ${p.best ? s.cardBest : ""}`}>
              <div className={s.cardTop}>
                <h2>{p.name}{p.best && <span className={`${s.pill} ${s.pOk}`} style={{ marginInlineStart: 8 }}>الأكثر طلباً</span>}</h2>
                <small>{p.users_label}</small>
                <div className={s.price}><span className={s.num}>{SAR(p.price)}</span> ر.س سنوياً</div>
              </div>
              <ul className={s.list}>{(p.features as string[]).map((f) => <li key={f}>{f}</li>)}</ul>
              <form action={buyPackage}>
                <input type="hidden" name="package" value={p.id} />
                <button className={`${s.btn} ${s.btnBlock} ${p.best ? "" : s.btnGhost}`}>{current ? "جدّد الباقة" : "اشترك الآن"}</button>
              </form>
            </article>
          );
        })}
      </div>

      <h2 style={{ fontSize: "1.1rem", fontWeight: 800, margin: "2rem 0 0.75rem" }}>سجل الاشتراكات والمدفوعات</h2>
      <div className={s.grid2}>
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead><tr><th>الباقة</th><th>من</th><th>إلى</th></tr></thead>
            <tbody>
              {subs?.length ? subs.map((x) => (
                <tr key={x.id}><td>{nameOf(x.package_id)}{x.source === "service" && <div className={s.muted}>ضمن المتابعة التنفيذية</div>}</td><td className={s.num}>{dateAr(x.starts_at)}</td><td className={s.num}>{dateAr(x.ends_at)}</td></tr>
              )) : <tr><td colSpan={3} className={s.empty}>لا توجد اشتراكات بعد.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead><tr><th>البيان</th><th>المبلغ</th><th>التاريخ</th><th>الحالة</th></tr></thead>
            <tbody>
              {payments?.length ? payments.map((x) => (
                <tr key={x.id}><td>{x.description}</td><td className={s.num}>{SAR(x.amount_halalas / 100)} ر.س</td><td className={s.num}>{dateAr(x.paid_at || x.created_at)}</td><td><Pill map={PAYMENT_STATUS} value={x.status} /></td></tr>
              )) : <tr><td colSpan={4} className={s.empty}>لا توجد مدفوعات بعد.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
