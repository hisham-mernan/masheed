"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getAccountContext } from "@/lib/account";
import type { FormState } from "@/lib/platform-actions";

const toLatin = (s: string) => s.replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
const text = (fd: FormData, k: string, max = 4000) => String(fd.get(k) ?? "").trim().slice(0, max);
const opt = (fd: FormData, k: string, max?: number) => text(fd, k, max) || null;
const date = (fd: FormData, k: string) => (/^\d{4}-\d{2}-\d{2}$/.test(text(fd, k, 10)) ? text(fd, k, 10) : null);

// The waqf being edited (a platform admin's selected waqf, else the user's own) — admins only;
// the database checks the same rule again (is_waqf_admin).
async function requireWaqfAdmin() {
  const ctx = await getAccountContext();
  if (!ctx) return { error: "سجّل الدخول أولاً" } as const;
  let waqfId = ctx.profile?.waqf_id as string | null;
  if (ctx.isPlatformAdmin) {
    const sel = (await cookies()).get("masheed_waqf")?.value;
    if (sel && sel !== "all") waqfId = sel;
  }
  if (!waqfId) return { error: "اختر وقفاً محدداً أولاً" } as const;
  if (!ctx.isPlatformAdmin && ctx.profile?.role !== "admin") return { error: "ملف الوقف يعدّله مدير الوقف فقط" } as const;
  return { supabase: ctx.supabase, waqfId } as const;
}

const done = (message: string): FormState => {
  revalidatePath("/dashboard/settings");
  return { status: "ok", message };
};

export async function saveWaqfProfile(_: FormState, fd: FormData): Promise<FormState> {
  const ctx = await requireWaqfAdmin();
  if ("error" in ctx) return { status: "error", message: ctx.error };
  const name = text(fd, "name", 160);
  const shares = Number(toLatin(text(fd, "total_shares", 12)));
  const type = text(fd, "type", 20);
  const tier = text(fd, "size_tier", 20);
  const errors: Record<string, string> = {};
  if (name.length < 2) errors.name = "اكتب اسم الوقف";
  if (!Number.isInteger(shares) || shares < 0) errors.total_shares = "عدد صحيح";
  if (!["khairi", "ahli", "mushtarak"].includes(type)) errors.type = "اختر نوع الوقف";
  if (tier && !["large", "medium", "small", "direct_use"].includes(tier)) errors.size_tier = "اختر فئة الحجم";
  const registered = date(fd, "gaw_registered_at"), expires = date(fd, "gaw_certificate_expires"), deedDate = date(fd, "deed_date");
  if (registered && expires && expires < registered) errors.gaw_certificate_expires = "قبل تاريخ التسجيل";
  if (Object.keys(errors).length) return { status: "error", errors, message: "راجع الحقول المظللة." };

  const { error } = await ctx.supabase.from("waqfs").update({
    name, total_shares: shares, type, size_tier: tier || null,
    registration_number: opt(fd, "registration_number", 60), gaw_registered_at: registered, gaw_certificate_expires: expires,
    deed_number: opt(fd, "deed_number", 60), deed_date: deedDate, deed_court: opt(fd, "deed_court", 120),
    purposes: opt(fd, "purposes", 4000), description: opt(fd, "description", 2000),
  }).eq("id", ctx.waqfId);
  if (error) return { status: "error", message: "تعذّر حفظ ملف الوقف." };
  revalidatePath("/dashboard", "layout");
  return done("حُفظ ملف الوقف");
}

export async function addNazir(_: FormState, fd: FormData): Promise<FormState> {
  const ctx = await requireWaqfAdmin();
  if ("error" in ctx) return { status: "error", message: ctx.error };
  const fullName = text(fd, "full_name", 160);
  const nid = toLatin(text(fd, "national_id", 20));
  if (fullName.length < 2) return { status: "error", message: "اكتب اسم الناظر" };
  if (nid && !/^[0-9]{10}$/.test(nid)) return { status: "error", message: "رقم الهوية أو السجل 10 أرقام" };
  const { error } = await ctx.supabase.from("waqf_nazirs").insert({
    waqf_id: ctx.waqfId, full_name: fullName, kind: text(fd, "kind", 20) === "entity" ? "entity" : "individual",
    national_id: nid || null, nationality: opt(fd, "nationality", 60), saudi_resident: text(fd, "saudi_resident", 5) !== "no",
    appointment_court: opt(fd, "appointment_court", 120), appointment_ref: opt(fd, "appointment_ref", 60),
    appointed_at: date(fd, "appointed_at"), term_ends: date(fd, "term_ends"),
    powers: opt(fd, "powers", 2000), fee_basis: opt(fd, "fee_basis", 500),
  });
  if (error) return { status: "error", message: error.message.includes("check") ? "تحقق من التواريخ ورقم الهوية." : "تعذّر إضافة الناظر." };
  return done("أُضيف الناظر");
}

export async function endNazir(id: string) {
  const ctx = await requireWaqfAdmin();
  if ("error" in ctx) return { error: ctx.error };
  const { error } = await ctx.supabase.from("waqf_nazirs").update({ status: "ended", ended_at: new Date().toISOString().slice(0, 10) })
    .eq("id", id).eq("waqf_id", ctx.waqfId).eq("status", "active");
  if (error) return { error: "تعذّر إنهاء النظارة" };
  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function addBankAccount(_: FormState, fd: FormData): Promise<FormState> {
  const ctx = await requireWaqfAdmin();
  if ("error" in ctx) return { status: "error", message: ctx.error };
  const iban = toLatin(text(fd, "iban", 40)).replace(/\s+/g, "").toUpperCase();
  if (!/^SA[0-9]{22}$/.test(iban)) return { status: "error", message: "الآيبان السعودي يبدأ بـ SA ويتبعه 22 رقماً" };
  const bank = text(fd, "bank_name", 80), holder = text(fd, "account_name", 160);
  if (bank.length < 2 || holder.length < 2) return { status: "error", message: "اكتب اسم البنك واسم صاحب الحساب" };
  const purpose = text(fd, "purpose", 20);
  const { error } = await ctx.supabase.from("waqf_bank_accounts").insert({
    waqf_id: ctx.waqfId, bank_name: bank, account_name: holder, iban,
    purpose: ["main", "fundraising", "other"].includes(purpose) ? purpose : "main", opened_at: date(fd, "opened_at"),
  });
  if (error) return { status: "error", message: error.code === "23505" ? "هذا الحساب مسجّل مسبقاً" : "تعذّر إضافة الحساب." };
  return done("أُضيف الحساب البنكي");
}

export async function closeBankAccount(id: string) {
  const ctx = await requireWaqfAdmin();
  if ("error" in ctx) return { error: ctx.error };
  const { error } = await ctx.supabase.from("waqf_bank_accounts").update({ status: "closed", closed_at: new Date().toISOString().slice(0, 10) })
    .eq("id", id).eq("waqf_id", ctx.waqfId).eq("status", "active");
  if (error) return { error: "تعذّر إغلاق الحساب" };
  revalidatePath("/dashboard/settings");
  return { success: true };
}
