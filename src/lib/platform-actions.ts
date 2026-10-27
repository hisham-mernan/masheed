"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAccountContext } from "@/lib/account";

export type FormState = { status: "idle" | "ok" | "error"; message?: string; errors?: Record<string, string>; values?: Record<string, string> };

const toLatin = (s: string) => s.replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d))).replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));
const text = (fd: FormData, k: string, max = 4000) => String(fd.get(k) ?? "").trim().slice(0, max);
const phoneOf = (raw: string) => toLatin(raw).replace(/[\s-]/g, "");
const PHONE = /^\+?[0-9]{9,15}$/;
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

async function requireAccount() {
  const ctx = await getAccountContext();
  if (!ctx) redirect("/login");
  if (!ctx.account) throw new Error("لا يوجد حساب مرتبط بالمستخدم");
  return { ...ctx, account: ctx.account };
}

async function requirePlatformAdmin() {
  const ctx = await getAccountContext();
  if (!ctx?.isPlatformAdmin) throw new Error("هذا الإجراء لمدير المنصة فقط");
  return ctx;
}

// ── Sign-up: organization/waqf name, phone, email, password → account with a 15-day trial ──
export async function registerAccount(_: FormState, fd: FormData): Promise<FormState> {
  const values = { name: text(fd, "name", 160), phone: text(fd, "phone", 20), email: text(fd, "email", 160).toLowerCase() };
  const password = String(fd.get("password") ?? "");
  const errors: Record<string, string> = {};
  if (values.name.length < 2) errors.name = "اكتب اسم الجهة أو الوقف";
  const phone = phoneOf(values.phone);
  if (!PHONE.test(phone)) errors.phone = "رقم الجوال غير صحيح";
  if (!EMAIL.test(values.email)) errors.email = "البريد الإلكتروني غير صحيح";
  if (password.length < 8) errors.password = "كلمة المرور 8 أحرف على الأقل";
  if (Object.keys(errors).length) return { status: "error", errors, values };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: values.email,
    password,
    options: { data: { account_name: values.name, phone } },
  });
  if (error) {
    const taken = /registered|exists/i.test(error.message);
    return { status: "error", message: taken ? "هذا البريد مسجّل مسبقاً، سجّل الدخول بدلاً من ذلك." : "تعذّر إنشاء الحساب، حاول مجدداً.", values };
  }
  if (!data.session) return { status: "ok", message: "أنشأنا حسابك. افتح الرابط المرسل إلى بريدك لتفعيله ثم سجّل الدخول." };
  redirect("/dashboard/onboarding");
}

// ── First login: do you have a waqf? ──
export async function completeOnboarding(_: FormState, fd: FormData): Promise<FormState> {
  const hasWaqf = fd.get("has_waqf") === "yes";
  const values = { name: text(fd, "name", 160), holding_type: text(fd, "holding_type", 60), assets_range: text(fd, "assets_range", 60), registration: text(fd, "registration", 60), description: text(fd, "description", 2000) };
  if (hasWaqf && values.name.length < 2) return { status: "error", errors: { name: "اكتب اسم الوقف" }, values };
  const supabase = await createClient();
  const { error } = await supabase.rpc("complete_onboarding", {
    p_has_waqf: hasWaqf,
    p_name: hasWaqf ? values.name : null,
    p_holding_type: values.holding_type || null,
    p_assets_range: values.assets_range || null,
    p_registration: values.registration || null,
    p_description: values.description || null,
  });
  if (error) return { status: "error", message: error.message.includes("waqf_exists") ? "لديك وقف مسجّل بالفعل." : "تعذّر حفظ البيانات، حاول مجدداً.", values };
  revalidatePath("/dashboard", "layout");
  redirect(hasWaqf ? "/dashboard" : "/dashboard/services");
}

// ── Service request (التأسيس / التقييم): the admin replies with a quotation ──
export async function requestService(_: FormState, fd: FormData): Promise<FormState> {
  const { supabase, account } = await requireAccount();
  const serviceId = text(fd, "service", 40);
  const { data: svc } = await supabase.from("services").select("id, title, pricing").eq("id", serviceId).single();
  if (!svc || svc.pricing !== "quote") return { status: "error", message: "الخدمة غير متاحة للطلب." };
  const values = {
    name: text(fd, "name", 120), organization: text(fd, "organization", 160), phone: text(fd, "phone", 20), email: text(fd, "email", 160),
    org_type: text(fd, "org_type", 60), holding_type: text(fd, "holding_type", 60), waqf_size: text(fd, "waqf_size", 60), details: text(fd, "details"),
  };
  const errors: Record<string, string> = {};
  if (values.name.length < 2) errors.name = "اكتب الاسم الكامل";
  if (values.organization.length < 2) errors.organization = "اكتب اسم الجهة أو الوقف";
  const phone = phoneOf(values.phone);
  if (!PHONE.test(phone)) errors.phone = "رقم الجوال غير صحيح";
  if (values.email && !EMAIL.test(values.email)) errors.email = "البريد الإلكتروني غير صحيح";
  if (!fd.get("consent")) errors.consent = "يلزم الموافقة على سياسة الخصوصية";
  if (Object.keys(errors).length) return { status: "error", errors, values };

  const { error } = await supabase.from("service_requests").insert({
    id: crypto.randomUUID(), account_id: account.id, service_id: svc.id, service_title: svc.title, kind: "request",
    name: values.name, organization: values.organization, phone, email: values.email || null,
    org_type: values.org_type || null, holding_type: values.holding_type || null, waqf_size: values.waqf_size || null, details: values.details || null,
  });
  if (error) return { status: "error", message: "تعذّر إرسال الطلب، حاول مجدداً.", values };
  revalidatePath("/dashboard/orders");
  return { status: "ok" };
}

// ── Payments: the amount always comes from the database, never from the browser ──
async function createPayment(purpose: "service" | "package" | "booking", refId: string, amount: number, description: string) {
  const { user, account } = await requireAccount();
  const halalas = Math.round(amount * 100);
  if (!(halalas >= 100)) throw new Error("مبلغ غير صالح");
  const { data, error } = await createAdminClient().from("payments").insert({
    account_id: account.id, purpose, ref_id: refId, amount_halalas: halalas, description: description.slice(0, 200), created_by: user.id,
  }).select("id").single();
  if (error || !data) throw new Error("تعذّر بدء عملية الدفع");
  return data.id as string;
}

export async function buyService(fd: FormData) {
  const { supabase, account, profile, user } = await requireAccount();
  const { data: svc } = await supabase.from("services").select("id, title, pricing, price").eq("id", text(fd, "service", 40)).single();
  if (!svc || svc.pricing !== "fixed" || !svc.price) throw new Error("الخدمة غير متاحة للشراء المباشر");
  if (!account.phone) redirect("/dashboard/profile?need=phone");
  const id = crypto.randomUUID();
  const { error } = await supabase.from("service_requests").insert({
    id, account_id: account.id, service_id: svc.id, service_title: svc.title, kind: "direct", unit_price: svc.price,
    name: profile?.full_name || account.name, organization: account.name, phone: account.phone, email: user.email || null,
  });
  if (error) throw new Error("تعذّر إنشاء الطلب");
  const pid = await createPayment("service", id, Number(svc.price), svc.title);
  redirect(`/dashboard/pay/${pid}`);
}

export async function payRequest(fd: FormData) {
  const { supabase } = await requireAccount();
  const { data: req } = await supabase.from("service_requests").select("id, service_id, service_title, kind, status, quote_amount").eq("id", text(fd, "id", 40)).single();
  if (!req) throw new Error("الطلب غير موجود");
  let amount = 0;
  if (req.status === "quoted" && req.quote_amount) amount = Number(req.quote_amount);
  else if (req.kind === "direct" && req.status === "new") {
    const { data: svc } = await supabase.from("services").select("price").eq("id", req.service_id).single();
    amount = Number(svc?.price || 0);
  } else throw new Error("لا يوجد مبلغ مستحق على هذا الطلب");
  const pid = await createPayment("service", req.id, amount, req.service_title);
  redirect(`/dashboard/pay/${pid}`);
}

export async function buyPackage(fd: FormData) {
  const { supabase } = await requireAccount();
  const { data: pkg } = await supabase.from("packages").select("id, name, price").eq("id", text(fd, "package", 40)).single();
  if (!pkg) throw new Error("الباقة غير متاحة");
  const pid = await createPayment("package", pkg.id, Number(pkg.price), `باقة ${pkg.name} — سنة`);
  redirect(`/dashboard/pay/${pid}`);
}

// ── Consultation booking ──
export async function bookConsultation(_: FormState, fd: FormData): Promise<FormState> {
  const { supabase } = await requireAccount();
  const expert = text(fd, "expert", 40);
  const startsAt = text(fd, "starts_at", 40);
  const topic = text(fd, "topic", 1000);
  if (!expert || !startsAt) return { status: "error", message: "اختر المستشار والموعد." };
  const { data: bookingId, error } = await supabase.rpc("book_consultation", { p_expert: expert, p_starts: startsAt, p_topic: topic || null });
  if (error || !bookingId) {
    const msg = error?.message || "";
    return { status: "error", message: msg.includes("slot_taken") ? "حُجز هذا الموعد للتو، اختر موعداً آخر." : msg.includes("slot_out_of_range") ? "الموعد يجب أن يكون بعد ساعة على الأقل وخلال 60 يوماً." : "تعذّر حجز الموعد، اختر موعداً آخر." };
  }
  const { data: b } = await supabase.from("bookings").select("id, status").eq("id", bookingId).single();
  revalidatePath("/dashboard/bookings");
  if (b?.status === "confirmed") redirect(`/dashboard/bookings?booked=${bookingId}`);
  const { data: svc } = await supabase.from("services").select("title, price").eq("id", "consulting").single();
  const pid = await createPayment("booking", String(bookingId), Number(svc?.price || 0), "جلسة استشارية — 30 دقيقة");
  redirect(`/dashboard/pay/${pid}`);
}

export async function payBooking(fd: FormData) {
  const { supabase } = await requireAccount();
  const { data: b } = await supabase.from("bookings").select("id, status, hold_until").eq("id", text(fd, "id", 40)).single();
  if (!b || b.status !== "pending_payment" || !b.hold_until || new Date(b.hold_until) <= new Date())
    throw new Error("انتهت مهلة حجز الموعد، احجز موعداً جديداً");
  const { data: svc } = await supabase.from("services").select("price").eq("id", "consulting").single();
  const pid = await createPayment("booking", b.id, Number(svc?.price || 0), "جلسة استشارية — 30 دقيقة");
  redirect(`/dashboard/pay/${pid}`);
}

// ── Investment platform application (documents are uploaded from the browser first) ──
export async function submitListing(_: FormState, fd: FormData): Promise<FormState> {
  const { supabase, profile, user } = await requireAccount();
  const waqfId = profile?.waqf_id;
  if (!waqfId) return { status: "error", message: "أضف بيانات وقفك أولاً." };
  const values = {
    title: text(fd, "title", 160), category: text(fd, "category", 20), description: text(fd, "description", 6000), city: text(fd, "city", 80),
    target_funding: text(fd, "target_funding", 20), price_per_share: text(fd, "price_per_share", 20), shares_count: text(fd, "shares_count", 12),
    expected_return: text(fd, "expected_return", 80), duration_months: text(fd, "duration_months", 4),
    contact_name: text(fd, "contact_name", 120), contact_phone: text(fd, "contact_phone", 20), asset_id: text(fd, "asset_id", 40),
  };
  const num = (s: string) => (s ? Number(toLatin(s).replace(/,/g, "")) : NaN);
  const errors: Record<string, string> = {};
  if (values.title.length < 3) errors.title = "اكتب عنوان الفرصة";
  if (!["real_estate", "agricultural", "education", "health", "investment", "other"].includes(values.category)) errors.category = "اختر نوع الفرصة";
  if (values.description.length < 30) errors.description = "صف الفرصة في 30 حرفاً على الأقل";
  if (!(num(values.target_funding) > 0)) errors.target_funding = "اكتب التمويل المستهدف";
  if (!(num(values.price_per_share) > 0)) errors.price_per_share = "اكتب قيمة الحصة";
  if (values.shares_count && !(Number.isInteger(num(values.shares_count)) && num(values.shares_count) > 0)) errors.shares_count = "عدد صحيح";
  if (values.duration_months && !(Number.isInteger(num(values.duration_months)) && num(values.duration_months) > 0)) errors.duration_months = "عدد الأشهر";
  if (values.contact_name.length < 2) errors.contact_name = "اكتب اسم المسؤول";
  const phone = phoneOf(values.contact_phone);
  if (!PHONE.test(phone)) errors.contact_phone = "رقم الجوال غير صحيح";
  const docs = fd.getAll("documents").map(String).filter(Boolean);
  if (docs.some((d) => !d.startsWith(waqfId + "/") || d.includes(".."))) errors.documents = "مستندات غير صالحة";
  if (!docs.length) errors.documents = "أرفق مستنداً واحداً على الأقل (صك الوقف أو تقييم الأصل)";
  if (Object.keys(errors).length) return { status: "error", errors, values };

  const { error } = await supabase.from("listing_requests").insert({
    waqf_id: waqfId, asset_id: values.asset_id || null, status: "pending", created_by: user.id,
    title: values.title, category: values.category, description: values.description, city: values.city || null,
    target_funding: num(values.target_funding), price_per_share: num(values.price_per_share),
    shares_count: values.shares_count ? num(values.shares_count) : Math.floor(num(values.target_funding) / num(values.price_per_share)) || null,
    expected_return: values.expected_return || null, duration_months: values.duration_months ? num(values.duration_months) : null,
    contact_name: values.contact_name, contact_phone: phone, documents: docs.slice(0, 10),
  });
  if (error) return { status: "error", message: "تعذّر إرسال الطلب. تأكد من صلاحيتك (مدير أو مشرف الوقف).", values };
  revalidatePath("/dashboard/marketplace");
  return { status: "ok" };
}

// ── Platform admin ──
export async function sendQuote(_: FormState, fd: FormData): Promise<FormState> {
  const { supabase } = await requirePlatformAdmin();
  const amount = Number(toLatin(text(fd, "amount", 20)).replace(/,/g, ""));
  if (!(amount >= 1)) return { status: "error", message: "اكتب مبلغ عرض السعر" };
  const { error } = await supabase.from("service_requests").update({
    quote_amount: amount, quote_note: text(fd, "note") || null, quoted_at: new Date().toISOString(), status: "quoted",
  }).eq("id", text(fd, "id", 40)).is("paid_at", null);
  if (error) return { status: "error", message: error.message };
  revalidatePath("/dashboard/admin/requests");
  return { status: "ok", message: "أُرسل عرض السعر" };
}

const REQUEST_STATUSES = ["new", "contacted", "quoted", "paid", "in_progress", "done", "cancelled"];
export async function setRequestStatus(id: string, status: string) {
  const { supabase } = await requirePlatformAdmin();
  if (!REQUEST_STATUSES.includes(status) || status === "paid") return { error: "حالة غير صالحة" };
  const { error } = await supabase.from("service_requests").update({ status }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/admin/requests");
  return { success: true };
}

export async function setBookingStatus(id: string, status: string) {
  const { supabase } = await requirePlatformAdmin();
  if (!["cancelled", "done"].includes(status)) return { error: "حالة غير صالحة" };
  const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/admin/bookings");
  return { success: true };
}

export async function reviewListing(_: FormState, fd: FormData): Promise<FormState> {
  const { supabase } = await requirePlatformAdmin();
  const decision = text(fd, "decision", 20);
  if (!["approved", "rejected", "trading"].includes(decision)) return { status: "error", message: "قرار غير صالح" };
  const note = text(fd, "note");
  if (decision === "rejected" && note.length < 5) return { status: "error", message: "اكتب سبب الرفض ليصل إلى الجهة" };
  const { error } = await supabase.from("listing_requests").update({ status: decision, review_note: note || null, reviewed_at: new Date().toISOString() }).eq("id", text(fd, "id", 40));
  if (error) return { status: "error", message: error.message };
  revalidatePath("/dashboard/marketplace", "layout");
  return { status: "ok", message: decision === "rejected" ? "رُفض الطلب" : "اعتُمد الطلب ويظهر الآن على منصة الاستثمار" };
}

export async function grantPackageAdmin(_: FormState, fd: FormData): Promise<FormState> {
  const { supabase } = await requirePlatformAdmin();
  const months = Number(text(fd, "months", 3)) || 12;
  const start = new Date();
  const end = new Date(start); end.setMonth(end.getMonth() + Math.min(Math.max(months, 1), 36));
  const { error } = await supabase.from("subscriptions").insert({
    account_id: text(fd, "account", 40), package_id: text(fd, "package", 40), source: "admin", starts_at: start.toISOString(), ends_at: end.toISOString(),
  });
  if (error) return { status: "error", message: error.message };
  revalidatePath("/dashboard/admin/accounts");
  return { status: "ok", message: "فُعّلت الباقة" };
}

// ── Account details (organization name and phone) ──
export async function updateAccount(_: FormState, fd: FormData): Promise<FormState> {
  const { supabase, account } = await requireAccount();
  const values = { name: text(fd, "name", 160), phone: text(fd, "phone", 20) };
  const phone = phoneOf(values.phone);
  const errors: Record<string, string> = {};
  if (values.name.length < 2) errors.name = "اكتب اسم الجهة أو الوقف";
  if (!PHONE.test(phone)) errors.phone = "رقم الجوال غير صحيح";
  if (Object.keys(errors).length) return { status: "error", errors, values };
  const { error } = await supabase.from("accounts").update({ name: values.name, phone }).eq("id", account.id);
  if (error) return { status: "error", message: "تعذّر الحفظ", values };
  revalidatePath("/dashboard", "layout");
  return { status: "ok", message: "حُفظت بيانات الحساب", values: { name: values.name, phone } };
}
