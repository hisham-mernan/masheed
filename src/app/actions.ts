"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function addAsset(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "غير مصرح لك" };

  const { data: profile, error: profileErr } = await supabase.from("profiles").select("waqf_id").eq("id", user.id).single();
  
  if (profileErr) {
    return { error: `خطأ في جلب بيانات الحساب: ${profileErr.message}` };
  }

  let waqfId = profile?.waqf_id;

  if (!waqfId) {
    return { error: "لم يتم العثور على وقف مرتبط بحسابك. البيانات: " + JSON.stringify(profile) };
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
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "غير مصرح لك" };

  const { data: profile, error: profileErr } = await supabase.from("profiles").select("waqf_id").eq("id", user.id).single();
  
  if (profileErr) {
    return { error: `خطأ في جلب بيانات الحساب: ${profileErr.message}` };
  }

  let waqfId = profile?.waqf_id;

  if (!waqfId) {
    return { error: "لم يتم العثور على وقف مرتبط بحسابك. البيانات: " + JSON.stringify(profile) };
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

export async function distributeYield(transactionId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "غير مصرح لك" };

  const { data, error } = await supabase.rpc('calculate_distribution', {
    transaction_id_param: transactionId
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard/beneficiary");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function addTransaction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("waqf_id").eq("id", user.id).single();
  let waqfId = profile?.waqf_id;

  if (!waqfId) {
    redirect("/dashboard/finance?error=" + encodeURIComponent("لم يتم العثور على وقف مرتبط بحسابك."));
  }

  const type = formData.get("type") as string;
  const amount = formData.get("amount") as string;
  const description = formData.get("description") as string;
  const assetId = formData.get("asset_id") as string;

  const { error } = await supabase.from("transactions").insert({
    waqf_id: waqfId,
    type,
    amount: Number(amount),
    description,
    asset_id: assetId ? assetId : null,
    is_yield: type === 'income',
    category: type,
  });

  if (error) {
    redirect("/dashboard/finance?error=" + encodeURIComponent(error.message));
  }

  revalidatePath("/dashboard/finance");
  revalidatePath("/dashboard");
  redirect("/dashboard/finance?success=1");
}

export async function addUserProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("waqf_id").eq("id", user.id).single();
  let waqfId = profile?.waqf_id;

  if (!waqfId) {
    redirect("/dashboard/compliance?error=" + encodeURIComponent("لم يتم العثور على وقف مرتبط بحسابك."));
  }

  const fullName = formData.get("full_name") as string;
  const role = formData.get("role") as string;
  
  const { error } = await supabase.from("profiles").insert({
    id: crypto.randomUUID(), // demo user
    waqf_id: waqfId,
    full_name: fullName,
    role: role as any
  });

  if (error) {
    redirect("/dashboard/compliance?error=" + encodeURIComponent(error.message));
  }

  revalidatePath("/dashboard/compliance");
  redirect("/dashboard/compliance?success=1");
}
