import { notFound } from "next/navigation";
import StatusButtons from "@/components/dashboard/StatusButtons";
import AdminForm from "@/components/platform/AdminForm";
import AdminTabs from "@/components/platform/AdminTabs";
import { REQUEST_STATUS } from "@/components/platform/options";
import { PageHead, Pill, s } from "@/components/platform/ui";
import { dateAr, getAccountContext, SAR } from "@/lib/account";
import { sendQuote, setRequestStatus } from "@/lib/platform-actions";

export const metadata = { title: "طلبات الخدمات | إدارة مَشيد" };

const NEXT_STEPS: Record<string, { value: string; label: string; danger?: boolean }[]> = {
  new: [{ value: "contacted", label: "تم التواصل" }, { value: "cancelled", label: "إلغاء", danger: true }],
  contacted: [{ value: "cancelled", label: "إلغاء", danger: true }],
  quoted: [{ value: "cancelled", label: "إلغاء", danger: true }],
  paid: [{ value: "in_progress", label: "بدء التنفيذ" }],
  in_progress: [{ value: "done", label: "مكتمل" }],
};

// Every service request — from the website (no account) and from inside the platform
export default async function AdminRequestsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const ctx = await getAccountContext();
  if (!ctx?.isPlatformAdmin) notFound();
  let q = ctx.supabase.from("service_requests").select("*, accounts(name)").order("created_at", { ascending: false }).limit(200);
  if (status && REQUEST_STATUS[status]) q = q.eq("status", status);
  const { data: rows } = await q;

  return (
    <div className="fade-in">
      <PageHead title="طلبات الخدمات" lead="الطلبات الواردة من الموقع ومن داخل المنصة. أرسل عرض السعر ليظهر للعميل ويدفعه من حسابه." />
      <AdminTabs active="requests" />
      <div className={s.days} style={{ margin: "0 0 1rem" }}>
        {[["", "الكل"], ...Object.entries(REQUEST_STATUS).map(([k, [l]]) => [k, l])].map(([k, l]) => (
          <a key={k} href={k ? `?status=${k}` : "?"} className={s.day} aria-pressed={(status || "") === k} style={{ textDecoration: "none", color: "inherit" }}><b style={{ fontSize: "0.82rem" }}>{l}</b></a>
        ))}
      </div>
      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead><tr><th>الطلب</th><th>العميل</th><th>التفاصيل</th><th>المبلغ</th><th>الحالة</th><th style={{ minWidth: 220 }}>إجراء</th></tr></thead>
          <tbody>
            {rows?.length ? rows.map((r) => (
              <tr key={r.id}>
                <td className={s.num}><b>{r.service_title}</b><div className={s.muted}>REQ-{r.id.slice(0, 8).toUpperCase()}</div><div className={s.muted}>{dateAr(r.created_at)}</div><div className={s.muted}>{r.account_id ? "من المنصة" : "من الموقع"}</div></td>
                <td><b>{r.name}</b><div className={s.muted}>{r.organization}</div><div className={s.muted} dir="ltr" style={{ textAlign: "right" }}>{r.phone}{r.email ? ` · ${r.email}` : ""}</div></td>
                <td style={{ maxWidth: 320 }}>
                  <div className={s.muted}>{[r.org_type, r.holding_type, r.waqf_size && `الأصول: ${r.waqf_size}`, r.consult_type, r.preferred_time].filter(Boolean).join(" · ")}</div>
                  {r.details && <div style={{ fontSize: "0.82rem", whiteSpace: "pre-wrap", marginTop: 4 }}>{r.details}</div>}
                </td>
                <td className={s.num}>{r.quote_amount ? `${SAR(r.quote_amount)} ر.س` : r.unit_price ? `${SAR(r.unit_price)} ر.س` : "—"}</td>
                <td><Pill map={REQUEST_STATUS} value={r.status} /></td>
                <td>
                  {["new", "contacted", "quoted"].includes(r.status) && r.kind === "request" && (
                    r.account_id
                      ? <AdminForm compact action={sendQuote} hidden={{ id: r.id }} submit={r.status === "quoted" ? "حدّث العرض" : "أرسل عرض السعر"} fields={[
                          { name: "amount", label: "المبلغ شامل الضريبة (ر.س)", type: "number" },
                          { name: "note", label: "نطاق العمل والملاحظات", type: "textarea", optional: true },
                        ]} />
                      : <p className={s.hint}>طلب من الموقع بلا حساب: تواصل مع العميل، ويمكنه التسجيل ليدفع من المنصة.</p>
                  )}
                  {NEXT_STEPS[r.status] && <div style={{ marginTop: 6 }}><StatusButtons id={r.id} action={setRequestStatus} options={NEXT_STEPS[r.status]} /></div>}
                </td>
              </tr>
            )) : <tr><td colSpan={6} className={s.empty}>لا توجد طلبات.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
