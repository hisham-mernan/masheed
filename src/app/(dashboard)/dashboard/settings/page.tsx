import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getWaqfScope } from "@/lib/waqf-scope";
import { nowMs } from "@/lib/account";
import WaqfProfileForm, { type WaqfProfile } from "@/components/dashboard/WaqfProfileForm";
import AdminForm from "@/components/platform/AdminForm";
import StatusButtons from "@/components/dashboard/StatusButtons";
import { PageHead, Pill, s } from "@/components/platform/ui";
import { addBankAccount, addNazir, closeBankAccount, endNazir } from "@/lib/waqf-profile-actions";

const ROLE_AR: Record<string, string> = { admin: "مدير الوقف", supervisor: "مشرف", auditor: "مراقب مالي", viewer: "قارئ فقط" };
const TYPE_AR: Record<string, string> = { khairi: "خيري", ahli: "أهلي (ذري)", mushtarak: "مشترك" };
const TIER_AR: Record<string, string> = { large: "كبير", medium: "متوسط", small: "صغير", direct_use: "انتفاع مباشر" };
const PURPOSE_AR: Record<string, string> = { main: "الحساب الرئيسي", fundraising: "حساب جمع التبرعات", other: "آخر" };
const CHECK: Record<string, [string, string]> = { ok: ["مكتمل", "pOk"], warn: ["يحتاج متابعة", "pWait"], bad: ["مخالفة محتملة", "pBad"], missing: ["بيانات ناقصة", "pOff"] };
const ACTIVE: Record<string, [string, string]> = { active: ["قائم", "pOk"], ended: ["منتهية", "pOff"], closed: ["مغلق", "pOff"] };

const day = (iso: string) => new Date(iso + "T00:00:00Z");
// Working days (Sunday–Thursday) after one date up to and including another
function workingDaysBetween(from: string, to: string) {
  let n = 0;
  for (let d = day(from); d < day(to);) {
    d = new Date(d.getTime() + 86_400_000);
    if (d.getUTCDay() <= 4) n++;
  }
  return n;
}
const fmtDate = (iso: string | null) => iso ? day(iso).toLocaleDateString("ar-SA-u-nu-latn", { dateStyle: "medium", timeZone: "UTC" }) : "—";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("full_name, role, waqf_id, is_platform_admin").eq("id", user?.id).single();
  const scope = profile?.is_platform_admin ? await getWaqfScope() : null;
  const waqfId = scope && scope !== "all" ? scope : profile?.waqf_id;
  const canEdit = profile?.role === "admin" || !!profile?.is_platform_admin;

  const [{ data: waqf }, { data: nazirs }, { data: accounts }] = waqfId
    ? await Promise.all([
        supabase.from("waqfs").select("name, total_shares, type, size_tier, registration_number, gaw_registered_at, gaw_certificate_expires, deed_number, deed_date, deed_court, purposes, description").eq("id", waqfId).single(),
        supabase.from("waqf_nazirs").select("*").eq("waqf_id", waqfId).order("status").order("created_at"),
        supabase.from("waqf_bank_accounts").select("*").eq("waqf_id", waqfId).order("status").order("created_at"),
      ])
    : [{ data: null }, { data: null }, { data: null }];

  // Which profile-based GAW rules have the data they need (not a compliance verdict)
  const today = new Date(nowMs() + 3 * 3600_000).toISOString().slice(0, 10);
  const activeNazirs = (nazirs || []).filter((n) => n.status === "active");
  const checks: { rule: string; title: string; state: string; note: string }[] = waqf ? [
    (() => {
      if (!waqf.deed_date || !waqf.gaw_registered_at) return { rule: "R01", title: "التسجيل خلال 30 يوم عمل من الصك", state: "missing", note: "أدخل تاريخ الصك وتاريخ التسجيل." };
      const days = workingDaysBetween(waqf.deed_date, waqf.gaw_registered_at);
      return { rule: "R01", title: "التسجيل خلال 30 يوم عمل من الصك", state: days <= 30 ? "ok" : "bad", note: `سُجّل بعد ${days} يوم عمل من تاريخ الصك.` };
    })(),
    (() => {
      if (!waqf.gaw_certificate_expires) return { rule: "R02", title: "شهادة التسجيل سارية", state: "missing", note: "أدخل تاريخ انتهاء الشهادة." };
      const left = Math.round((day(waqf.gaw_certificate_expires).getTime() - day(today).getTime()) / 86_400_000);
      return { rule: "R02", title: "شهادة التسجيل سارية", state: left < 0 ? "bad" : left <= 60 ? "warn" : "ok", note: left < 0 ? `انتهت منذ ${-left} يوماً.` : `تنتهي بعد ${left} يوماً.` };
    })(),
    { rule: "R04", title: "حساب بنكي باسم الوقف", ...((accounts || []).some((a) => a.status === "active") ? { state: "ok", note: "يوجد حساب قائم." } : { state: "missing", note: "أضف حساب الوقف البنكي." }) },
    activeNazirs.length === 0
      ? { rule: "R14", title: "الناظر مستوفٍ للشروط ومقيم في المملكة", state: "missing", note: "أضف الناظر." }
      : activeNazirs.some((n) => !n.saudi_resident)
        ? { rule: "R14", title: "الناظر مستوفٍ للشروط ومقيم في المملكة", state: "bad", note: "ناظر غير مقيم في المملكة." }
        : { rule: "R14", title: "الناظر مستوفٍ للشروط ومقيم في المملكة", ...(activeNazirs.every((n) => n.national_id) ? { state: "ok", note: "الهوية والإقامة مسجلتان." } : { state: "missing", note: "أكمل رقم الهوية لكل ناظر." }) },
    { rule: "R15", title: "صك النظارة موثق لدى المحكمة", ...(activeNazirs.length && activeNazirs.every((n) => n.appointment_ref && n.appointment_court) ? { state: "ok", note: "رقم الصك والمحكمة مسجلان." } : { state: "missing", note: "أدخل رقم صك النظارة والمحكمة لكل ناظر." }) },
  ] : [];

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <PageHead title="ملف الوقف والإعدادات" lead="بيانات الوقف التي تُبنى عليها قواعد الهيئة العامة للأوقاف: التسجيل، الصك، النظّار، والحسابات البنكية." />

      {!waqf ? (
        <div className={`${s.alert} ${s.alertInfo}`}>
          {scope === "all" ? "اختر وقفاً محدداً من مبدّل الأوقاف في القائمة الجانبية لعرض ملفه." : "لا يوجد وقف مرتبط بحسابك."}
        </div>
      ) : (
        <>
          <section className={s.panel}>
            <h2>اكتمال بيانات الملف</h2>
            <p>يفحص ما إذا كانت البيانات المطلوبة لهذه القواعد مُدخلة، وما تقوله التواريخ. ليس حكماً نهائياً بالامتثال.</p>
            <div className={s.tableWrap}>
              <table className={s.table}>
                <thead><tr><th>القاعدة</th><th>المتطلب</th><th>الحالة</th><th>التفاصيل</th></tr></thead>
                <tbody>
                  {checks.map((c) => (
                    <tr key={c.rule}><td className={s.num}>{c.rule}</td><td>{c.title}</td><td><Pill map={CHECK} value={c.state} /></td><td className={s.muted}>{c.note}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className={s.panel}>
            <h2>بيانات الوقف</h2>
            <p>{canEdit ? "يعدّلها مدير الوقف. كل تعديل يُسجَّل في سجل الأحداث." : "التعديل متاح لمدير الوقف فقط."}</p>
            {canEdit ? <WaqfProfileForm waqf={waqf as WaqfProfile} /> : (
              <div className={s.summary}>
                <div><span>الاسم</span><b>{waqf.name}</b></div>
                <div><span>النوع</span><b>{TYPE_AR[waqf.type || ""] || "—"}</b></div>
                <div><span>فئة الحجم</span><b>{TIER_AR[waqf.size_tier || ""] || "غير محددة"}</b></div>
                <div><span>رقم التسجيل</span><b className={s.num}>{waqf.registration_number || "—"}</b></div>
                <div><span>تاريخ التسجيل</span><b>{fmtDate(waqf.gaw_registered_at)}</b></div>
                <div><span>انتهاء الشهادة</span><b>{fmtDate(waqf.gaw_certificate_expires)}</b></div>
                <div><span>رقم الصك وتاريخه</span><b>{waqf.deed_number || "—"} · {fmtDate(waqf.deed_date)}</b></div>
                <div><span>إجمالي الأسهم</span><b className={s.num}>{Number(waqf.total_shares || 0).toLocaleString("en-US")}</b></div>
              </div>
            )}
          </section>

          <section className={s.panel}>
            <h2>النظّار</h2>
            <p>الناظر أو أعضاء مجلس النظارة، وصك تعيينهم وصلاحياتهم وأجرهم. لا يُحذف السجل؛ تُنهى النظارة بتاريخها.</p>
            <div className={s.tableWrap}>
              <table className={s.table}>
                <thead><tr><th>الناظر</th><th>الهوية والإقامة</th><th>صك النظارة</th><th>المدة</th><th>الحالة</th>{canEdit && <th></th>}</tr></thead>
                <tbody>
                  {nazirs?.length ? nazirs.map((n) => (
                    <tr key={n.id}>
                      <td><b>{n.full_name}</b><div className={s.muted}>{n.kind === "entity" ? "جهة اعتبارية" : "فرد"}{n.nationality ? ` · ${n.nationality}` : ""}</div></td>
                      <td><span className={s.num}>{n.national_id || "—"}</span><div className={s.muted}>{n.saudi_resident ? "مقيم في المملكة" : "غير مقيم"}</div></td>
                      <td><span className={s.num}>{n.appointment_ref || "—"}</span><div className={s.muted}>{n.appointment_court || ""}</div></td>
                      <td className={s.muted}>{fmtDate(n.appointed_at)} – {n.term_ends ? fmtDate(n.term_ends) : "مفتوحة"}</td>
                      <td><Pill map={ACTIVE} value={n.status} /></td>
                      {canEdit && <td>{n.status === "active" && <StatusButtons id={n.id} action={endNazir} options={[{ value: "ended", label: "إنهاء النظارة", danger: true }]} />}</td>}
                    </tr>
                  )) : <tr><td colSpan={canEdit ? 6 : 5} className={s.empty}>لم يُسجّل ناظر بعد.</td></tr>}
                </tbody>
              </table>
            </div>
            {canEdit && (
              <details style={{ marginTop: "1rem" }}>
                <summary className={s.label} style={{ cursor: "pointer" }}>إضافة ناظر</summary>
                <div style={{ marginTop: "1rem", maxWidth: 640 }}>
                  <AdminForm action={addNazir} submit="إضافة الناظر" fields={[
                    { name: "full_name", label: "الاسم الكامل أو اسم الجهة" },
                    { name: "kind", label: "النوع", type: "select", options: [["individual", "فرد"], ["entity", "جهة اعتبارية"]] },
                    { name: "national_id", label: "رقم الهوية أو السجل التجاري", optional: true, placeholder: "10 أرقام" },
                    { name: "nationality", label: "الجنسية", optional: true },
                    { name: "saudi_resident", label: "مقيم في المملكة", type: "select", options: [["yes", "نعم"], ["no", "لا"]] },
                    { name: "appointment_court", label: "المحكمة التي أصدرت صك النظارة", optional: true },
                    { name: "appointment_ref", label: "رقم صك النظارة", optional: true },
                    { name: "appointed_at", label: "تاريخ التعيين", type: "date", optional: true },
                    { name: "term_ends", label: "نهاية مدة النظارة", type: "date", optional: true },
                    { name: "powers", label: "الصلاحيات", type: "textarea", optional: true },
                    { name: "fee_basis", label: "أجرة الناظر وأساسها", optional: true },
                  ]} />
                </div>
              </details>
            )}
          </section>

          <section className={s.panel}>
            <h2>الحسابات البنكية</h2>
            <p>حسابات باسم الوقف تمر عبرها كل إيراداته ومصروفاته. لا يُحذف الحساب؛ يُغلق بتاريخه.</p>
            <div className={s.tableWrap}>
              <table className={s.table}>
                <thead><tr><th>البنك</th><th>الآيبان</th><th>الغرض</th><th>الحالة</th>{canEdit && <th></th>}</tr></thead>
                <tbody>
                  {accounts?.length ? accounts.map((a) => (
                    <tr key={a.id}>
                      <td><b>{a.bank_name}</b><div className={s.muted}>{a.account_name}</div></td>
                      <td className={s.num} dir="ltr" style={{ textAlign: "right" }}>{a.iban}</td>
                      <td>{PURPOSE_AR[a.purpose] || a.purpose}</td>
                      <td><Pill map={ACTIVE} value={a.status} /></td>
                      {canEdit && <td>{a.status === "active" && <StatusButtons id={a.id} action={closeBankAccount} options={[{ value: "closed", label: "إغلاق الحساب", danger: true }]} />}</td>}
                    </tr>
                  )) : <tr><td colSpan={canEdit ? 5 : 4} className={s.empty}>لم يُسجّل حساب بنكي بعد.</td></tr>}
                </tbody>
              </table>
            </div>
            {canEdit && (
              <details style={{ marginTop: "1rem" }}>
                <summary className={s.label} style={{ cursor: "pointer" }}>إضافة حساب بنكي</summary>
                <div style={{ marginTop: "1rem", maxWidth: 640 }}>
                  <AdminForm action={addBankAccount} submit="إضافة الحساب" fields={[
                    { name: "bank_name", label: "البنك" },
                    { name: "account_name", label: "اسم صاحب الحساب كما في البنك" },
                    { name: "iban", label: "الآيبان", placeholder: "SA0000000000000000000000" },
                    { name: "purpose", label: "الغرض", type: "select", options: [["main", "الحساب الرئيسي"], ["fundraising", "حساب جمع التبرعات"], ["other", "آخر"]] },
                    { name: "opened_at", label: "تاريخ الفتح", type: "date", optional: true },
                  ]} />
                </div>
              </details>
            )}
          </section>
        </>
      )}

      <section className={s.panel}>
        <h2>حسابك</h2>
        <div className={s.summary}>
          <div><span>الاسم</span><b>{profile?.full_name || "—"}</b></div>
          <div><span>البريد</span><b dir="ltr">{user?.email}</b></div>
          <div><span>الدور</span><b>{ROLE_AR[profile?.role || ""] || profile?.role}{profile?.is_platform_admin ? " · مدير منصة" : ""}</b></div>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem", flexWrap: "wrap" }}>
          <Link href="/dashboard/profile" className={`${s.btn} ${s.btnGhost} ${s.btnSm}`}>الملف الشخصي وكلمة المرور</Link>
          <Link href="/dashboard/compliance" className={`${s.btn} ${s.btnGhost} ${s.btnSm}`}>إدارة المستخدمين</Link>
        </div>
      </section>
    </div>
  );
}
