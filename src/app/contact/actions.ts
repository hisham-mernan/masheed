"use server";

import { createClient } from "@/lib/supabase/server";

export type ContactField = "name" | "phone" | "organization" | "email" | "message";

export type ContactState = {
  status: "idle" | "ok" | "error";
  message?: string;
  errors?: Partial<Record<ContactField, string>>;
  values?: Partial<Record<ContactField, string>>;
};

// Arabic-Indic and Persian digits to ASCII, so "٠٥٥..." is accepted as a phone number
const toAsciiDigits = (s: string) =>
  s.replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660)).replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0));

export async function submitContact(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const get = (k: string) => String(formData.get(k) ?? "").trim();
  const values = {
    name: get("name"),
    phone: get("phone"),
    organization: get("organization"),
    email: get("email"),
    message: get("message"),
  };

  // Honeypot: real visitors never see or fill this field
  if (get("website")) return { status: "ok" };

  const phone = toAsciiDigits(values.phone).replace(/[\s\-()]/g, "");
  const errors: ContactState["errors"] = {};
  if (values.name.length < 2) errors.name = "الرجاء إدخال الاسم.";
  if (!/^\+?[0-9]{9,15}$/.test(phone)) errors.phone = "الرجاء إدخال رقم جوال صحيح.";
  if (values.organization.length < 2) errors.organization = "الرجاء إدخال اسم الجهة أو الوقف.";
  if (values.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(values.email)) errors.email = "صيغة البريد الإلكتروني غير صحيحة.";
  if (values.message.length < 5) errors.message = "الرجاء كتابة رسالتك.";
  if (Object.keys(errors).length) return { status: "error", errors, values };

  const supabase = await createClient();
  const { error } = await supabase.from("contact_requests").insert({
    name: values.name.slice(0, 120),
    phone,
    organization: values.organization.slice(0, 160),
    email: values.email || null,
    message: values.message.slice(0, 4000),
  });

  if (error) {
    console.error("contact_requests insert failed:", error.message);
    return { status: "error", message: "تعذّر إرسال الرسالة الآن. حاول مرة أخرى أو راسلنا على info@masheedwaqf.com.", values };
  }
  return { status: "ok" };
}
