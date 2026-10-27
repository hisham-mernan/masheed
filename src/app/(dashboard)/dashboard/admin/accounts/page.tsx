import { notFound } from "next/navigation";
import AdminForm from "@/components/platform/AdminForm";
import AdminTabs from "@/components/platform/AdminTabs";
import { PageHead, s } from "@/components/platform/ui";
import { dateAr, getAccountContext, nowMs } from "@/lib/account";
import { grantPackageAdmin } from "@/lib/platform-actions";

export const metadata = { title: "الحسابات والباقات | إدارة مَشيد" };

export default async function AdminAccountsPage() {
  const ctx = await getAccountContext();
  if (!ctx?.isPlatformAdmin) notFound();
  const now = new Date().toISOString();
  const [{ data: accounts }, { data: subs }, { data: packages }] = await Promise.all([
    ctx.supabase.from("accounts").select("id, name, phone, has_waqf, trial_ends_at, created_at").order("created_at", { ascending: false }).limit(300),
    ctx.supabase.from("subscriptions").select("account_id, package_id, ends_at").gt("ends_at", now),
    ctx.supabase.from("packages").select("id, name").order("sort"),
  ]);
  const nameOf = (id: string) => packages?.find((p) => p.id === id)?.name || id;

  return (
    <div className="fade-in">
      <PageHead title="الحسابات والباقات" lead="الحسابات المسجلة وحالة تجربتها واشتراكها. يمكنك تفعيل باقة يدوياً (مثلاً لعميل دفع بتحويل بنكي)." />
      <AdminTabs active="accounts" />
      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead><tr><th>الحساب</th><th>التسجيل</th><th>الحالة</th><th style={{ minWidth: 230 }}>تفعيل باقة</th></tr></thead>
          <tbody>
            {accounts?.length ? accounts.map((a) => {
              const mine = (subs || []).filter((x) => x.account_id === a.id);
              const trial = new Date(a.trial_ends_at).getTime() > nowMs();
              return (
                <tr key={a.id}>
                  <td><b>{a.name}</b><div className={s.muted} dir="ltr" style={{ textAlign: "right" }}>{a.phone || "—"}</div><div className={s.muted}>{a.has_waqf ? "لديه وقف" : a.has_waqf === false ? "بلا وقف" : "لم يكمل الإعداد"}</div></td>
                  <td className={s.num}>{dateAr(a.created_at)}</td>
                  <td>
                    {mine.length ? mine.map((x) => <div key={x.package_id + x.ends_at}><span className={`${s.pill} ${s.pOk}`}>{nameOf(x.package_id)}</span> <span className={s.muted}>حتى {dateAr(x.ends_at)}</span></div>)
                      : trial ? <span className={`${s.pill} ${s.pNew}`}>تجربة حتى {dateAr(a.trial_ends_at)}</span>
                      : <span className={`${s.pill} ${s.pBad}`}>منتهي</span>}
                  </td>
                  <td>
                    <AdminForm compact action={grantPackageAdmin} hidden={{ account: a.id }} submit="فعّل" fields={[
                      { name: "package", label: "الباقة", type: "select", options: (packages || []).map((p) => [p.id, p.name] as [string, string]) },
                      { name: "months", label: "المدة بالأشهر", type: "number", placeholder: "12" },
                    ]} />
                  </td>
                </tr>
              );
            }) : <tr><td colSpan={4} className={s.empty}>لا توجد حسابات.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
