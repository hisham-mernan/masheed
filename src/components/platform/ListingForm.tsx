"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { submitListing, type FormState } from "@/lib/platform-actions";
import { LISTING_CATEGORIES } from "./options";
import { FieldError, s } from "./ui";

const initial: FormState = { status: "idle" };
const MAX_FILES = 10;
const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPT = ".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx";

type Doc = { path: string; name: string };

// Application to list an opportunity on وقف مَشيد. Documents go straight to the private
// bucket (one folder per waqf); the form then submits their paths for review.
export default function ListingForm({ waqfId, assets, defaults }: { waqfId: string; assets: { id: string; name: string }[]; defaults: Record<string, string> }) {
  const [state, action, pending] = useActionState(submitListing, initial);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  if (state.status === "ok") {
    return (
      <div className={`${s.alert} ${s.alertOk}`} role="status">
        وصل طلبك. يراجع فريق مَشيد بيانات الفرصة ومستنداتها، وتظهر نتيجة المراجعة في <Link href="/dashboard/marketplace">صفحة طلبات الطرح</Link>. لا تُنشر الفرصة قبل اعتمادها.
      </div>
    );
  }

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setUploadError("");
    const list = Array.from(files).slice(0, MAX_FILES - docs.length);
    if (list.some((f) => f.size > MAX_BYTES)) { setUploadError("حجم الملف الواحد حتى 10 ميجابايت"); return; }
    setUploading(true);
    const supabase = createClient();
    const added: Doc[] = [];
    for (const f of list) {
      const ext = (f.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5);
      const path = `${waqfId}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("listing-docs").upload(path, f, { contentType: f.type || undefined });
      if (error) { setUploadError("تعذّر رفع «" + f.name + "»"); break; }
      added.push({ path, name: f.name });
    }
    setDocs((d) => [...d, ...added]);
    setUploading(false);
  }

  const v = { ...defaults, ...state.values } as Record<string, string>;
  const e = state.errors || {};
  const field = (name: string, label: string, extra: React.InputHTMLAttributes<HTMLInputElement> = {}, opt = false) => (
    <div className={s.field}>
      <label htmlFor={"ls-" + name}>{label}{opt && <small>(اختياري)</small>}</label>
      <input id={"ls-" + name} name={name} className={s.input} defaultValue={v[name]} aria-invalid={!!e[name]} aria-describedby={e[name] ? `ls-${name}-err` : undefined} {...extra} />
      <FieldError id={"ls-" + name} msg={e[name]} />
    </div>
  );
  const numeric = { inputMode: "decimal" as const, dir: "ltr", style: { textAlign: "right" as const } };

  return (
    <form action={action} className={s.form} noValidate>
      {state.status === "error" && state.message && <div className={`${s.alert} ${s.alertErr}`} role="alert">{state.message}</div>}
      {field("title", "عنوان الفرصة", { maxLength: 160, placeholder: "مثال: تطوير عمارة سكنية وقفية في حي النرجس" })}
      <div className={s.row}>
        <div className={s.field}>
          <label htmlFor="ls-category">نوع الفرصة</label>
          <select id="ls-category" name="category" className={s.input} defaultValue={v.category || ""} aria-invalid={!!e.category}>
            <option value="">اختر</option>
            {Object.entries(LISTING_CATEGORIES).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
          <FieldError id="ls-category" msg={e.category} />
        </div>
        {assets.length > 0 ? (
          <div className={s.field}>
            <label htmlFor="ls-asset_id">الأصل المرتبط<small>(اختياري)</small></label>
            <select id="ls-asset_id" name="asset_id" className={s.input} defaultValue={v.asset_id || ""}>
              <option value="">بدون</option>
              {assets.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
        ) : field("city", "المدينة", { maxLength: 80 }, true)}
      </div>
      {assets.length > 0 && field("city", "المدينة", { maxLength: 80 }, true)}
      <div className={s.field}>
        <label htmlFor="ls-description">وصف الفرصة</label>
        <textarea id="ls-description" name="description" className={s.input} defaultValue={v.description} maxLength={6000} aria-invalid={!!e.description}
          placeholder="الأصل، ونموذج العائد، واستخدام التمويل، والجدول الزمني، وأبرز المخاطر" style={{ minHeight: 150 }} />
        <FieldError id="ls-description" msg={e.description} />
      </div>
      <div className={s.row}>
        {field("target_funding", "التمويل المستهدف (ر.س)", numeric)}
        {field("price_per_share", "قيمة الحصة (ر.س)", numeric)}
      </div>
      <div className={s.row}>
        {field("shares_count", "عدد الحصص", { ...numeric, inputMode: "numeric", placeholder: "يُحسب تلقائياً إن تُرك فارغاً" }, true)}
        {field("duration_months", "مدة الاستثمار (بالأشهر)", { ...numeric, inputMode: "numeric" }, true)}
      </div>
      {field("expected_return", "العائد المتوقع", { maxLength: 80, placeholder: "مثال: 7% سنوياً (تقديري)" }, true)}
      <div className={s.row}>
        {field("contact_name", "اسم المسؤول عن الطلب", { maxLength: 120, autoComplete: "name" })}
        {field("contact_phone", "جوال المسؤول", { type: "tel", inputMode: "tel", maxLength: 20, placeholder: "05xxxxxxxx", dir: "ltr", style: { textAlign: "right" } })}
      </div>

      <div className={s.field}>
        <label htmlFor="ls-files">المستندات</label>
        <input id="ls-files" type="file" multiple accept={ACCEPT} className={s.input} disabled={uploading || docs.length >= MAX_FILES} onChange={(ev) => { upload(ev.target.files); ev.target.value = ""; }} />
        <p className={s.hint}>صك الوقف، وصك أو تقييم الأصل، ودراسة الجدوى إن وجدت، والقوائم المالية. حتى 10 ملفات، 10 ميجابايت للملف.</p>
        {uploading && <span className={s.muted}>جارٍ الرفع…</span>}
        {uploadError && <span className={s.err}>{uploadError}</span>}
        <FieldError id="ls-documents" msg={e.documents} />
        {docs.length > 0 && (
          <ul className={s.list} style={{ marginTop: 6 }}>
            {docs.map((d) => (
              <li key={d.path}>
                {d.name}
                <input type="hidden" name="documents" value={d.path} />
                <button type="button" className={`${s.btn} ${s.btnSm} ${s.btnGhost}`} style={{ marginInlineStart: 8, padding: "0.1rem 0.5rem" }} onClick={() => setDocs((x) => x.filter((y) => y.path !== d.path))}>إزالة</button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <button className={s.btn} disabled={pending || uploading}>{pending ? "جارٍ الإرسال…" : "أرسل الطلب للمراجعة"}</button>
    </form>
  );
}
