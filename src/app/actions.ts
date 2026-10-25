"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getWaqfScope, scopeQuery } from "@/lib/waqf-scope";

const WRITE_ROLES = ["admin", "supervisor"];

async function getProfile(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, profile: null };
  const { data: profile } = await supabase
    .from("profiles")
    .select("waqf_id, role, full_name, is_platform_admin")
    .eq("id", user.id)
    .single();
  return { user, profile };
}

/**
 * Effective waqf for WRITE operations:
 * platform admin with a specific waqf selected in the switcher → that waqf;
 * otherwise the user's own waqf. 'all' never writes.
 */
async function getWriteWaqfId(profile: any): Promise<string | null> {
  if (profile?.is_platform_admin) {
    const { cookies } = await import("next/headers");
    const sel = (await cookies()).get("masheed_waqf")?.value;
    if (sel && sel !== "all") return sel;
  }
  return profile?.waqf_id || null;
}

export async function addAsset(formData: FormData) {
  const supabase = await createClient();
  const { user, profile } = await getProfile(supabase);

  if (!user || !profile) return { error: "غير مصرح لك" };
  const waqfId = await getWriteWaqfId(profile);
  if (!waqfId) return { error: "لم يتم العثور على وقف مرتبط بحسابك (أو اختر وقفاً محدداً من المبدّل)" };
  if (!WRITE_ROLES.includes(profile.role)) {
    return { error: "غير مصرح: إضافة الأصول متاحة للمدير والمشرف فقط" };
  }

  const name = formData.get("name") as string;
  const category = formData.get("category") as string;
  const valuation = formData.get("valuation") as string;
  const location = formData.get("location") as string;

  const { error } = await supabase.from("assets").insert({
    waqf_id: waqfId,
    name,
    category,
    valuation: Number(valuation),
    location,
    status: "active"
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard/assets");
  return { success: true };
}

export async function addBeneficiary(formData: FormData) {
  const supabase = await createClient();
  const { user, profile } = await getProfile(supabase);

  if (!user || !profile) return { error: "غير مصرح لك" };
  const waqfId = await getWriteWaqfId(profile);
  if (!waqfId) return { error: "لم يتم العثور على وقف مرتبط بحسابك (أو اختر وقفاً محدداً من المبدّل)" };
  if (!WRITE_ROLES.includes(profile.role)) {
    return { error: "غير مصرح: إضافة المستفيدين متاحة للمدير والمشرف فقط" };
  }

  const fullName = formData.get("full_name") as string;
  const nationalId = formData.get("national_id") as string;
  const sharesOwned = formData.get("shares_owned") as string;
  const contactInfo = formData.get("contact_info") as string;

  const { error } = await supabase.from("beneficiaries").insert({
    waqf_id: waqfId,
    name: fullName,
    national_id: nationalId,
    shares_owned: Number(sharesOwned),
    contact_info: contactInfo,
    status: "active",
    wallet_balance: 0
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard/beneficiary");
  return { success: true };
}

/**
 * Maker–Checker: إنشاء طلب توزيع ريع.
 * لا يوزّع فوراً — ينشئ طلب اعتماد يمر على شخص آخر (Checker) ثم يُنفَّذ.
 */
export async function distributeYield(amount: number) {
  const supabase = await createClient();
  const { user, profile } = await getProfile(supabase);

  if (!user || !profile) return { error: "غير مصرح لك" };
  const waqfId = await getWriteWaqfId(profile);
  if (!waqfId) return { error: "اختر وقفاً محدداً من المبدّل أولاً" };
  if (!WRITE_ROLES.includes(profile.role)) return { error: "غير مصرح: التوزيع متاح للمدير والمشرف فقط" };

  const { data, error } = await supabase.from("approval_requests").insert({
    waqf_id: waqfId,
    type: "distribute_yield",
    amount: Number(amount),
    created_by: user.id,
  }).select("id").single();

  if (error) return { error: error.message };

  revalidatePath("/dashboard/approvals");
  revalidatePath("/dashboard/beneficiary");
  return { success: true, requestId: data.id, pending: true };
}

/** قرار الاعتماد (Checker) — لا يمكن لمنشئ الطلب اعتماده بنفسه */
export async function decideApproval(requestId: string, decision: "approved" | "rejected", note?: string) {
  const supabase = await createClient();
  const { user, profile } = await getProfile(supabase);
  if (!user || !profile) return { error: "غير مصرح لك" };

  const { error } = await supabase.rpc("decide_approval", {
    p_id: requestId,
    p_decision: decision,
    p_note: note || null,
  });
  if (error) return { error: error.message };

  revalidatePath("/dashboard/approvals");
  revalidatePath("/dashboard");
  return { success: true };
}

/** تنفيذ طلب معتمد (توزيع أو تسوية) */
export async function executeApproval(requestId: string) {
  const supabase = await createClient();
  const { user, profile } = await getProfile(supabase);
  if (!user || !profile) return { error: "غير مصرح لك" };

  const { data, error } = await supabase.rpc("execute_approval", { p_id: requestId });
  if (error) return { error: error.message };

  revalidatePath("/dashboard/approvals");
  revalidatePath("/dashboard/beneficiary");
  revalidatePath("/dashboard/finance");
  revalidatePath("/dashboard");
  return { success: true, result: data };
}

export async function addTransaction(formData: FormData) {
  const supabase = await createClient();
  const { user, profile } = await getProfile(supabase);

  if (!user || !profile) redirect("/login");

  const txWaqfId = await getWriteWaqfId(profile);
  if (!txWaqfId) {
    redirect("/dashboard/finance?error=" + encodeURIComponent("لم يتم العثور على وقف مرتبط بحسابك (أو اختر وقفاً محدداً من المبدّل)."));
  }

  if (!WRITE_ROLES.includes(profile.role)) {
    redirect("/dashboard/finance?error=" + encodeURIComponent("غير مصرح: تسجيل المعاملات متاح للمدير والمشرف فقط"));
  }

  const type = formData.get("type") as string;
  const amount = formData.get("amount") as string;
  const description = formData.get("description") as string;
  const assetId = formData.get("asset_id") as string;

  const { error } = await supabase.from("transactions").insert({
    waqf_id: txWaqfId,
    type,
    amount: Number(amount),
    description,
    asset_id: assetId ? assetId : null,
    is_yield: type === "income",
    category: type,
  });

  if (error) {
    redirect("/dashboard/finance?error=" + encodeURIComponent(error.message));
  }

  revalidatePath("/dashboard/finance");
  revalidatePath("/dashboard");
  redirect("/dashboard/finance?success=1");
}

/**
 * Add a user to the SAME waqf with a chosen role.
 * Uses the public signup endpoint directly (no session hijack), and the
 * handle_new_user trigger links the new account to this waqf via
 * invite_waqf_id metadata. Only admins can do this.
 */
export async function addUserProfile(formData: FormData) {
  const supabase = await createClient();
  const { user, profile } = await getProfile(supabase);

  if (!user || !profile) return { error: "غير مصرح لك" };
  if (profile?.role !== "admin") {
    return { error: "غير مصرح: إدارة المستخدمين متاحة لمدير النظام فقط" };
  }
  const inviteWaqfId = await getWriteWaqfId(profile);
  if (!inviteWaqfId) return { error: "اختر وقفاً محدداً من المبدّل أولاً" };

  const fullName = formData.get("full_name") as string;
  const role = formData.get("role") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password || password.length < 6) {
    return { error: "البريد الإلكتروني وكلمة مرور (٦ أحرف على الأقل) مطلوبان" };
  }

  // Direct call to the Auth API so the current admin session is untouched
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/signup`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      },
      body: JSON.stringify({
        email,
        password,
        data: {
          full_name: fullName,
          invite_waqf_id: inviteWaqfId,
          role,
        },
      }),
    }
  );

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { error: body.msg || body.message || body.error_description || "فشل إنشاء المستخدم" };
  }

  revalidatePath("/dashboard/compliance");
  return { success: true };
}

/* ============ V4: full human workflows ============ */

async function requireWrite(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { user, profile } = await getProfile(supabase);
  if (!user || !profile) return { error: "غير مصرح لك" } as const;
  const writeWaqfId = await getWriteWaqfId(profile);
  if (!writeWaqfId) return { error: "لم يتم العثور على وقف مرتبط بحسابك (أو اختر وقفاً محدداً من المبدّل)" } as const;
  if (!WRITE_ROLES.includes(profile.role)) return { error: "غير مصرح: هذه العملية متاحة للمدير والمشرف فقط" } as const;
  return { user, profile, writeWaqfId } as const;
}

export async function updateAsset(formData: FormData) {
  const supabase = await createClient();
  const ctx = await requireWrite(supabase);
  if ("error" in ctx) return { error: ctx.error };

  const id = formData.get("id") as string;
  const { error } = await supabase.from("assets").update({
    name: formData.get("name") as string,
    category: formData.get("category") as string,
    valuation: Number(formData.get("valuation")),
    location: formData.get("location") as string,
    status: formData.get("status") as string,
  }).eq("id", id).eq("waqf_id", ctx.writeWaqfId);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/assets");
  return { success: true };
}

export async function deleteAsset(id: string) {
  const supabase = await createClient();
  const { user, profile } = await getProfile(supabase);
  if (!user || !profile) return { error: "غير مصرح لك" };
  if (profile?.role !== "admin") return { error: "الحذف متاح لمدير النظام فقط" };

  let q = supabase.from("assets").delete().eq("id", id);
  if (!profile.is_platform_admin) q = q.eq("waqf_id", profile.waqf_id);
  const { error } = await q;
  if (error) return { error: error.message };
  revalidatePath("/dashboard/assets");
  return { success: true };
}

export async function updateBeneficiary(formData: FormData) {
  const supabase = await createClient();
  const ctx = await requireWrite(supabase);
  if ("error" in ctx) return { error: ctx.error };

  const id = formData.get("id") as string;
  const { error } = await supabase.from("beneficiaries").update({
    name: formData.get("full_name") as string,
    national_id: formData.get("national_id") as string,
    shares_owned: Number(formData.get("shares_owned")),
    contact_info: formData.get("contact_info") as string,
    status: formData.get("status") as string,
  }).eq("id", id).eq("waqf_id", ctx.writeWaqfId);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/beneficiary");
  return { success: true };
}

export async function addMaintenanceTask(formData: FormData) {
  const supabase = await createClient();
  const ctx = await requireWrite(supabase);
  if ("error" in ctx) return { error: ctx.error };

  const assetId = (formData.get("asset_id") as string) || null;
  const { error } = await supabase.from("maintenance_tasks").insert({
    waqf_id: ctx.writeWaqfId,
    asset_id: assetId,
    title: formData.get("title") as string,
    priority: formData.get("priority") as string,
    due_date: (formData.get("due_date") as string) || null,
    notes: formData.get("notes") as string,
    created_by: ctx.user.id,
  });

  if (error) return { error: error.message };

  // مزامنة: الأصل المرتبط بمهمة مفتوحة يصبح "تحت الصيانة"
  if (assetId) {
    await supabase.from("assets").update({ status: "maintenance" }).eq("id", assetId);
    revalidatePath("/dashboard/assets");
  }
  revalidatePath("/dashboard/tasks");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function setTaskStatus(taskId: string, status: "done" | "open" | "cancelled") {
  const supabase = await createClient();
  const ctx = await requireWrite(supabase);
  if ("error" in ctx) return { error: ctx.error };

  const { data: task } = await supabase
    .from("maintenance_tasks")
    .select("asset_id")
    .eq("id", taskId)
    .single();

  const { error } = await supabase.from("maintenance_tasks").update({
    status,
    completed_at: status === "done" ? new Date().toISOString() : null,
  }).eq("id", taskId).eq("waqf_id", ctx.writeWaqfId);

  if (error) return { error: error.message };

  // مزامنة: لو مفيش مهام مفتوحة تانية على الأصل يرجع "نشط"
  if (task?.asset_id && status !== "open") {
    const { count } = await supabase
      .from("maintenance_tasks")
      .select("id", { count: "exact", head: true })
      .eq("asset_id", task.asset_id)
      .eq("status", "open");
    if (!count) {
      await supabase.from("assets").update({ status: "active" }).eq("id", task.asset_id);
    }
  } else if (task?.asset_id && status === "open") {
    await supabase.from("assets").update({ status: "maintenance" }).eq("id", task.asset_id);
  }
  revalidatePath("/dashboard/assets");
  revalidatePath("/dashboard/tasks");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function saveDocument(formData: FormData) {
  const supabase = await createClient();
  const ctx = await requireWrite(supabase);
  if ("error" in ctx) return { error: ctx.error };

  const file = formData.get("file") as File | null;
  let fileName: string | null = null;
  let fileData: string | null = null;
  if (file && file.size > 0) {
    if (file.size > 2 * 1024 * 1024) return { error: "حجم الملف يتجاوز 2MB" };
    fileName = file.name;
    const buf = Buffer.from(await file.arrayBuffer());
    fileData = `data:${file.type || "application/octet-stream"};base64,` + buf.toString("base64");
  }

  const { error } = await supabase.from("documents").insert({
    waqf_id: ctx.writeWaqfId,
    asset_id: (formData.get("asset_id") as string) || null,
    doc_type: formData.get("doc_type") as string,
    title: formData.get("title") as string,
    reference_no: formData.get("reference_no") as string,
    doc_date: formData.get("doc_date") as string,
    conditions_text: formData.get("conditions_text") as string,
    file_name: fileName,
    file_data: fileData,
    uploaded_by: ctx.user.id,
  });

  if (error) return { error: error.message };
  revalidatePath("/dashboard/ocr");
  return { success: true };
}

export async function deleteDocument(id: string) {
  const supabase = await createClient();
  const { user, profile } = await getProfile(supabase);
  if (!user || !profile) return { error: "غير مصرح لك" };
  if (profile?.role !== "admin") return { error: "الحذف متاح لمدير النظام فقط" };
  let q = supabase.from("documents").delete().eq("id", id);
  if (!profile.is_platform_admin) q = q.eq("waqf_id", profile.waqf_id);
  const { error } = await q;
  if (error) return { error: error.message };
  revalidatePath("/dashboard/ocr");
  return { success: true };
}

export async function updateMyProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "غير مصرح لك" };

  const fullName = formData.get("full_name") as string;
  if (!fullName?.trim()) return { error: "الاسم مطلوب" };

  const { error } = await supabase.from("profiles").update({ full_name: fullName.trim() }).eq("id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  return { success: true };
}

export async function changeMyPassword(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "غير مصرح لك" };

  const password = formData.get("password") as string;
  if (!password || password.length < 6) return { error: "كلمة المرور ٦ أحرف على الأقل" };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };
  return { success: true };
}

export async function searchAll(query: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "غير مصرح لك" };
  const q = `%${query}%`;

  const [assets, bens, txs] = await Promise.all([
    supabase.from("assets").select("id, name, category").ilike("name", q).limit(5),
    supabase.from("beneficiaries").select("id, name, national_id").ilike("name", q).limit(5),
    supabase.from("transactions").select("id, description, amount, type").ilike("description", q).limit(5),
  ]);

  return {
    assets: assets.data || [],
    beneficiaries: bens.data || [],
    transactions: txs.data || [],
  };
}

/* ============ V5: waqf switching + settlement ============ */

/** تعليم إشعار واحد كمقروء */
export async function markNotificationRead(refKey: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "غير مصرح لك" };
  await supabase.from("notification_reads").upsert({ user_id: user.id, ref_key: refKey });
  return { success: true };
}

/** تعليم مجموعة إشعارات كمقروءة دفعة واحدة */
export async function markAllNotificationsRead(refKeys: string[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "غير مصرح لك" };
  if (refKeys.length > 0) {
    await supabase.from("notification_reads").upsert(
      refKeys.map((k) => ({ user_id: user.id, ref_key: k }))
    );
  }
  revalidatePath("/dashboard", "layout");
  return { success: true };
}

export async function setSelectedWaqf(waqfId: string) {
  const { cookies } = await import("next/headers");
  const store = await cookies();
  store.set("masheed_waqf", waqfId, { path: "/", maxAge: 60 * 60 * 24 * 365 });
  revalidatePath("/dashboard", "layout");
  return { success: true };
}

/** Maker–Checker: إنشاء طلب تسوية محافظ (لا يصفّي فوراً). */
export async function settleWallets() {
  const supabase = await createClient();
  const { user, profile } = await getProfile(supabase);
  if (!user || !profile) return { error: "غير مصرح لك" };
  const waqfId = await getWriteWaqfId(profile);
  if (!waqfId) return { error: "اختر وقفاً محدداً من المبدّل أولاً" };
  if (!WRITE_ROLES.includes(profile.role)) return { error: "غير مصرح: التسوية متاحة للمدير والمشرف فقط" };

  const { data, error } = await supabase.from("approval_requests").insert({
    waqf_id: waqfId,
    type: "settle_wallets",
    created_by: user.id,
  }).select("id").single();

  if (error) return { error: error.message };

  revalidatePath("/dashboard/approvals");
  revalidatePath("/dashboard/beneficiary");
  return { success: true, requestId: data.id, pending: true };
}


// ============================================================
// MIGRATION V8 — ERP modules actions
// حوكمة / اجتماعات / قرارات / استثمارات / عقود / ميزانيات / استشارات / طرح صكوك
// (تستخدم requireWrite المعرّفة أعلاه — ترجع writeWaqfId)
// ============================================================

const num = (v: FormDataEntryValue | null) => Number(v || 0);
const str = (v: FormDataEntryValue | null) => (v as string) || null;

// ── الواقفون ──
export async function addWaqif(formData: FormData) {
  const supabase = await createClient();
  const ctx = await requireWrite(supabase);
  if ("error" in ctx) return { error: ctx.error };
  const { error } = await supabase.from("waqifs").insert({
    waqf_id: ctx.writeWaqfId,
    name: formData.get("name") as string,
    nationality: str(formData.get("nationality")),
    national_id: str(formData.get("national_id")),
    birth_date: str(formData.get("birth_date")),
    relationship: str(formData.get("relationship")),
    founder_type: (formData.get("founder_type") as string) || "individual",
    biography: str(formData.get("biography")),
    status: "active",
  });
  if (error) return { error: error.message };
  revalidatePath("/dashboard/waqifs");
  return { success: true };
}

// ── الاجتماعات ──
export async function addMeeting(formData: FormData) {
  const supabase = await createClient();
  const ctx = await requireWrite(supabase);
  if ("error" in ctx) return { error: ctx.error };
  const { error } = await supabase.from("meetings").insert({
    waqf_id: ctx.writeWaqfId,
    title: formData.get("title") as string,
    committee: str(formData.get("committee")),
    meeting_date: formData.get("meeting_date") as string,
    quorum_pct: num(formData.get("quorum_pct")) || null,
    notes: str(formData.get("notes")),
    status: "scheduled",
    created_by: ctx.user.id,
  });
  if (error) return { error: error.message };
  revalidatePath("/dashboard/meetings");
  revalidatePath("/dashboard/governance");
  return { success: true };
}

export async function setMeetingStatus(id: string, status: "scheduled" | "in_voting" | "documented") {
  const supabase = await createClient();
  const ctx = await requireWrite(supabase);
  if ("error" in ctx) return { error: ctx.error };
  const { error } = await supabase.from("meetings").update({ status }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/meetings");
  revalidatePath("/dashboard/governance");
  return { success: true };
}

// ── القرارات (Maker–Checker: المعتمد ≠ المنشئ) ──
export async function addDecision(formData: FormData) {
  const supabase = await createClient();
  const ctx = await requireWrite(supabase);
  if ("error" in ctx) return { error: ctx.error };
  const { error } = await supabase.from("decisions").insert({
    waqf_id: ctx.writeWaqfId,
    meeting_id: str(formData.get("meeting_id")),
    title: formData.get("title") as string,
    type: (formData.get("type") as string) || "other",
    description: str(formData.get("description")),
    reason: str(formData.get("reason")),
    impact_analysis: str(formData.get("impact_analysis")),
    status: "pending",
    created_by: ctx.user.id,
  });
  if (error) return { error: error.message };
  revalidatePath("/dashboard/governance");
  return { success: true };
}

export async function decideDecision(id: string, decision: "approved" | "rejected") {
  const supabase = await createClient();
  const ctx = await requireWrite(supabase);
  if ("error" in ctx) return { error: ctx.error };
  const { data: dec } = await supabase.from("decisions").select("created_by, status").eq("id", id).single();
  if (!dec) return { error: "القرار غير موجود" };
  if (dec.status !== "pending") return { error: "تم البت في هذا القرار مسبقاً" };
  if (dec.created_by === ctx.user.id) return { error: "لا يمكنك اعتماد قرار أنشأته بنفسك (Maker–Checker)" };
  const { error } = await supabase.from("decisions").update({
    status: decision,
    decided_by: ctx.user.id,
    decided_at: new Date().toISOString(),
  }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/governance");
  return { success: true };
}

// ── الاستثمارات ──
export async function addInvestment(formData: FormData) {
  const supabase = await createClient();
  const ctx = await requireWrite(supabase);
  if ("error" in ctx) return { error: ctx.error };
  const { error } = await supabase.from("investments").insert({
    waqf_id: ctx.writeWaqfId,
    name: formData.get("name") as string,
    type: (formData.get("type") as string) || "fund",
    valuation: num(formData.get("valuation")),
    expected_return: num(formData.get("expected_return")) || null,
    risk_level: (formData.get("risk_level") as string) || "low",
    status: "active",
  });
  if (error) return { error: error.message };
  revalidatePath("/dashboard/investments");
  return { success: true };
}

export async function setInvestmentStatus(id: string, status: "active" | "exited" | "suspended") {
  const supabase = await createClient();
  const ctx = await requireWrite(supabase);
  if ("error" in ctx) return { error: ctx.error };
  const { error } = await supabase.from("investments").update({ status }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/investments");
  return { success: true };
}

// ── العقود ──
export async function addContract(formData: FormData) {
  const supabase = await createClient();
  const ctx = await requireWrite(supabase);
  if ("error" in ctx) return { error: ctx.error };
  const { error } = await supabase.from("contracts").insert({
    waqf_id: ctx.writeWaqfId,
    counterparty: formData.get("counterparty") as string,
    asset_id: str(formData.get("asset_id")),
    start_date: str(formData.get("start_date")),
    end_date: str(formData.get("end_date")),
    annual_rent: num(formData.get("annual_rent")),
    status: "active",
  });
  if (error) return { error: error.message };
  revalidatePath("/dashboard/contracts");
  return { success: true };
}

export async function setContractStatus(id: string, status: "active" | "expired" | "suspended") {
  const supabase = await createClient();
  const ctx = await requireWrite(supabase);
  if ("error" in ctx) return { error: ctx.error };
  const { error } = await supabase.from("contracts").update({ status }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/contracts");
  return { success: true };
}

// ── الميزانيات ──
export async function addBudget(formData: FormData) {
  const supabase = await createClient();
  const ctx = await requireWrite(supabase);
  if ("error" in ctx) return { error: ctx.error };
  const { error } = await supabase.from("budgets").insert({
    waqf_id: ctx.writeWaqfId,
    name: formData.get("name") as string,
    allocated: num(formData.get("allocated")),
    period: str(formData.get("period")),
    status: "active",
  });
  if (error) return { error: error.message };
  revalidatePath("/dashboard/finance/budgets");
  return { success: true };
}

// ── الاستشارات ──
export async function addConsultation(formData: FormData) {
  const supabase = await createClient();
  const ctx = await requireWrite(supabase);
  if ("error" in ctx) return { error: ctx.error };
  const { error } = await supabase.from("consultations").insert({
    waqf_id: ctx.writeWaqfId,
    expert_name: str(formData.get("expert_name")),
    topic: formData.get("topic") as string,
    type: (formData.get("type") as string) || "sharia",
    notes: str(formData.get("notes")),
    status: "under_review",
    created_by: ctx.user.id,
  });
  if (error) return { error: error.message };
  revalidatePath("/dashboard/consultancy");
  return { success: true };
}

export async function setConsultationStatus(id: string, status: "under_review" | "scheduled" | "resolved") {
  const supabase = await createClient();
  const ctx = await requireWrite(supabase);
  if ("error" in ctx) return { error: ctx.error };
  const { error } = await supabase.from("consultations").update({ status }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/consultancy");
  return { success: true };
}

// ── طلبات طرح الصكوك (وقف باي مشيد) ──
export async function addListingRequest(formData: FormData) {
  const supabase = await createClient();
  const ctx = await requireWrite(supabase);
  if ("error" in ctx) return { error: ctx.error };
  const { error } = await supabase.from("listing_requests").insert({
    waqf_id: ctx.writeWaqfId,
    asset_id: str(formData.get("asset_id")),
    target_funding: num(formData.get("target_funding")),
    price_per_share: num(formData.get("price_per_share")),
    shares_count: num(formData.get("shares_count")) || null,
    status: "pending",
    created_by: ctx.user.id,
  });
  if (error) return { error: error.message };
  revalidatePath("/dashboard/marketplace");
  return { success: true };
}

export async function setListingStatus(id: string, status: "pending" | "approved" | "trading" | "rejected") {
  const supabase = await createClient();
  const ctx = await requireWrite(supabase);
  if ("error" in ctx) return { error: ctx.error };
  const { data: req } = await supabase.from("listing_requests").select("created_by, status").eq("id", id).single();
  if (!req) return { error: "الطلب غير موجود" };
  if (req.created_by === ctx.user.id && (status === "approved" || status === "rejected"))
    return { error: "لا يمكنك اعتماد طلب طرح أنشأته بنفسك (Maker–Checker)" };
  const { error } = await supabase.from("listing_requests").update({ status }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/marketplace");
  return { success: true };
}


// ============================================================
// MIGRATION V9 — Experts + Waqf settings + AI assistant
// ============================================================

// ── دليل الخبراء (مدير المنصة فقط) ──
export async function addExpert(formData: FormData) {
  const supabase = await createClient();
  const { user, profile } = await getProfile(supabase);
  if (!user || !profile?.is_platform_admin) return { error: "إدارة الخبراء متاحة لمدير المنصة فقط" };
  const { error } = await supabase.from("experts").insert({
    name: formData.get("name") as string,
    specialty: str(formData.get("specialty")),
    type: (formData.get("type") as string) || "sharia",
    rating: num(formData.get("rating")) || 5,
    bio: str(formData.get("bio")),
    available: true,
  });
  if (error) return { error: error.message };
  revalidatePath("/dashboard/consultancy/experts");
  return { success: true };
}

export async function toggleExpertAvailability(id: string, available: boolean | string) {
  const supabase = await createClient();
  const { user, profile } = await getProfile(supabase);
  if (!user || !profile?.is_platform_admin) return { error: "غير مصرح" };
  const val = available === true || available === "true";
  const { error } = await supabase.from("experts").update({ available: val }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/consultancy/experts");
  return { success: true };
}

// ── إعدادات الوقف (اسم + إجمالي الأسهم) ──
export async function updateWaqfSettings(formData: FormData) {
  const supabase = await createClient();
  const ctx = await requireWrite(supabase);
  if ("error" in ctx) return { error: ctx.error };
  if (ctx.profile.role !== "admin" && !ctx.profile.is_platform_admin)
    return { error: "إعدادات الوقف متاحة للمدير فقط" };
  const name = formData.get("name") as string;
  const totalShares = num(formData.get("total_shares"));
  if (!name?.trim()) return { error: "اسم الوقف مطلوب" };
  const { error } = await supabase.from("waqfs").update({ name: name.trim(), total_shares: totalShares }).eq("id", ctx.writeWaqfId);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard", "layout");
  return { success: true };
}

// ── المساعد الذكي: إجابات محسوبة من بيانات النظام الفعلية ──
export async function askAssistant(query: string): Promise<{ reply: string }> {
  const supabase = await createClient();
  const { user, profile } = await getProfile(supabase);
  if (!user || !profile) return { reply: "غير مصرح لك باستخدام المساعد." };

  const scope = profile.is_platform_admin ? await getWaqfScope() : null;
  const q = query || "";

  const [{ data: assets }, { data: tx }, { data: tasks }, { data: bens }, { data: listings }, { data: decisions }] = await Promise.all([
    scopeQuery(supabase.from("assets").select("name, category, valuation, status"), scope),
    scopeQuery(supabase.from("transactions").select("amount, type, is_yield"), scope),
    scopeQuery(supabase.from("maintenance_tasks").select("status, priority"), scope),
    scopeQuery(supabase.from("beneficiaries").select("wallet_balance, shares_owned"), scope),
    scopeQuery(supabase.from("listing_requests").select("status, target_funding, assets(name)"), scope),
    scopeQuery(supabase.from("decisions").select("status"), scope),
  ]);

  const totalVal = (assets || []).reduce((s, a) => s + Number(a.valuation || 0), 0);
  const income = (tx || []).filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
  const yieldSum = (tx || []).filter(t => t.type === "income" && t.is_yield).reduce((s, t) => s + Number(t.amount), 0);
  const expense = (tx || []).filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
  const openTasks = (tasks || []).filter(t => t.status === "open").length;
  const urgentTasks = (tasks || []).filter(t => t.status === "open" && t.priority === "urgent").length;
  const wallets = (bens || []).reduce((s, b) => s + Number(b.wallet_balance || 0), 0);
  const pendingDecisions = (decisions || []).filter(d => d.status === "pending").length;
  const fmtN = (n: number) => Math.round(n).toLocaleString("en-US");

  let reply = "";
  if (/زكاة|زكاه/.test(q)) {
    const zakatable = (assets || []).filter(a => a.category === "cash" || a.category === "investment").reduce((s, a) => s + Number(a.valuation || 0), 0) + wallets;
    reply = `حسبة استرشادية من بياناتك الفعلية: الوعاء الزكوي التقديري (نقد + استثماري + أرصدة محافظ) = ${fmtN(zakatable)} ر.س، والزكاة بواقع 2.5٪ ≈ ${fmtN(zakatable * 0.025)} ر.س. تنبيه: زكاة الأوقاف لها أحكام خاصة — أنصحك بإصدار "تقرير الزكاة" من مركز التقارير وعرضه على مستشار شرعي من صفحة الاستشارات للاعتماد.`;
  } else if (/ريع|توزيع|مستفيد/.test(q)) {
    reply = `وضع الريع الحالي: إجمالي الإيرادات المسجلة ${fmtN(income)} ر.س، منها ريع قابل للتوزيع ${fmtN(yieldSum)} ر.س، وأرصدة محافظ المستفيدين الحالية ${fmtN(wallets)} ر.س. تقدر تبدأ توزيعة جديدة من صفحة المستفيدين — وهتمر على مركز الاعتمادات (Maker–Checker) قبل التنفيذ.`;
  } else if (/صيانة|مهام|مهمه/.test(q)) {
    reply = `لديك ${openTasks} مهمة صيانة مفتوحة${urgentTasks > 0 ? ` منها ${urgentTasks} عاجلة ⚠️` : ""}. راجع صفحة مهام الصيانة، ولو حابب ملخصاً رسمياً أصدر "تقرير الصيانة" من مركز التقارير.`;
  } else if (/طرح|سوق|صكوك|تداول|استثمار/.test(q)) {
    const pend = (listings || []).filter(l => l.status === "pending").length;
    const trading = (listings || []).filter(l => l.status === "trading").length;
    reply = `حالة السوق: ${trading} صك متداول و${pend} طلب طرح بانتظار الاعتماد. قيمة الأصول المرشحة ${fmtN(totalVal)} ر.س. افحص "جاهزية الطرح" من صفحة وقف باي مشيد — المعايير: توثيق الصك، قوائم مالية، مجلس نظارة فعّال، وتقييم فني للأصل.`;
  } else if (/حوكمة|قرار|مجلس|نظارة/.test(q)) {
    reply = `لديك ${pendingDecisions} قرار بانتظار الاعتماد في سجل الحوكمة. تذكّر: نظام مَشيد يفرض مبدأ Maker–Checker — لا يمكن لمنشئ القرار اعتماده بنفسه، لازم عضو آخر من مجلس النظارة يعتمد.`;
  } else if (/تقرير|طباعة|pdf/i.test(q)) {
    reply = `مركز التقارير فيه 6 تقارير رسمية بهوية مَشيد: نظرة عامة، أصول، مالية، مستفيدون، صيانة، وزكاة — كلها باسم الوقف واسمك كمُصدر، وجاهزة للطباعة PDF. افتح /dashboard/reports واختر الفترة.`;
  } else {
    reply = `ملخص وقفك الآن: ${assets?.length ?? 0} أصل بقيمة ${fmtN(totalVal)} ر.س، إيرادات ${fmtN(income)} ر.س، مصروفات ${fmtN(expense)} ر.س، ${openTasks} مهمة مفتوحة، و${pendingDecisions} قرار معلق. اسألني عن: الزكاة، الريع والتوزيعات، الصيانة، طرح الصكوك، الحوكمة، أو التقارير.`;
  }
  return { reply };
}
