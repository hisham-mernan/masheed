"use server";

import { createClient } from "@supabase/supabase-js";
import { getListing, titleOf } from "./listings";

export type InterestField = "name" | "phone" | "email" | "investor_type" | "shares" | "message";

export type InterestState = {
  status: "idle" | "ok" | "error";
  message?: string;
  errors?: Partial<Record<InterestField, string>>;
  values?: Partial<Record<InterestField, string>>;
};

const toAsciiDigits = (s: string) =>
  s.replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660)).replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0));
const TYPES = ["individual", "entity", "waqf"];

// Register interest in a listed opportunity (listing set) or in future ones (no listing).
// Nothing is charged: the row is a lead for the team to follow up.
export async function registerInterest(_prev: InterestState, formData: FormData): Promise<InterestState> {
  const get = (k: string) => String(formData.get(k) ?? "").trim();
  if (get("website")) return { status: "ok" }; // honeypot

  const values = {
    name: get("name"),
    phone: get("phone"),
    email: get("email"),
    investor_type: get("investor_type") || "individual",
    shares: get("shares"),
    message: get("message"),
  };
  const listingId = get("listing");
  const listing = listingId ? await getListing(listingId) : null;
  if (listingId && !listing) return { status: "error", message: "الفرصة غير متاحة حالياً.", values };

  const phone = toAsciiDigits(values.phone).replace(/[\s\-()]/g, "");
  const shares = listing ? Number(toAsciiDigits(values.shares)) : 0;
  const errors: InterestState["errors"] = {};
  if (values.name.length < 2) errors.name = "الرجاء إدخال الاسم.";
  if (!/^\+?[0-9]{9,15}$/.test(phone)) errors.phone = "الرجاء إدخال رقم جوال صحيح.";
  if (values.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(values.email)) errors.email = "صيغة البريد الإلكتروني غير صحيحة.";
  if (!TYPES.includes(values.investor_type)) errors.investor_type = "الرجاء اختيار نوع المستثمر.";
  const maxShares = listing?.shares_count || 100000;
  if (listing && (!Number.isInteger(shares) || shares < 1 || shares > maxShares)) errors.shares = `عدد الحصص بين ١ و${maxShares.toLocaleString("ar-SA")}.`;
  if (Object.keys(errors).length) return { status: "error", errors, values };

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const failed: InterestState = { status: "error", message: "تعذّر إرسال الطلب الآن. حاول مرة أخرى أو راسلنا على info@masheedwaqf.com.", values };
  if (!url || !key) return failed;

  const price = Number(listing?.price_per_share) || 0;
  const { error } = await createClient(url, key, { auth: { persistSession: false } }).from("investment_interests").insert({
    listing_id: listing?.id ?? null,
    listing_title: listing ? titleOf(listing) : null,
    amount: listing && price ? shares * price : null,
    investor_type: values.investor_type,
    name: values.name.slice(0, 120),
    phone,
    email: values.email || null,
    message: values.message.slice(0, 4000) || null,
  });
  if (error) {
    console.error("investment_interests insert failed:", error.message);
    return failed;
  }
  return { status: "ok" };
}
