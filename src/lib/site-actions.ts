"use server";

import { createClient } from "@/lib/supabase/server";
import { SYS_TOPICS } from "@/components/system-site/data";
import { getServices } from "@/components/system-site/catalog";

// Shared by the public sites (masheedwaqf.com gateway and the System website).

export type ContactField = "name" | "phone" | "organization" | "email" | "message" | "topic";

export type ContactState = {
  status: "idle" | "ok" | "error";
  message?: string;
  errors?: Partial<Record<ContactField, string>>;
  values?: Partial<Record<ContactField, string>>;
};

// Arabic-Indic and Persian digits to ASCII, so "٠٥٥..." is accepted as a phone number
const toAsciiDigits = (s: string) =>
  s.replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660)).replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0));
const normalizePhone = (s: string) => toAsciiDigits(s).replace(/[\s\-()]/g, "");
const PHONE_RE = /^\+?[0-9]{9,15}$/;
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const SEND_FAILED = "تعذّر إرسال الرسالة الآن. حاول مرة أخرى أو راسلنا على info@masheedwaqf.com.";

export async function submitContact(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const get = (k: string) => String(formData.get(k) ?? "").trim();
  const values = {
    name: get("name"),
    phone: get("phone"),
    organization: get("organization"),
    email: get("email"),
    message: get("message"),
    topic: get("topic"),
  };
  // Which site the form was on; anything unexpected is filed under the gateway
  const source = get("source") === "system" ? "system" : "gateway";

  // Honeypot: real visitors never see or fill this field
  if (get("website")) return { status: "ok" };

  const phone = normalizePhone(values.phone);
  const errors: ContactState["errors"] = {};
  if (values.name.length < 2) errors.name = "الرجاء إدخال الاسم.";
  if (!PHONE_RE.test(phone)) errors.phone = "الرجاء إدخال رقم جوال صحيح.";
  if (values.organization.length < 2) errors.organization = "الرجاء إدخال اسم الجهة أو الوقف.";
  if (values.email && !EMAIL_RE.test(values.email)) errors.email = "صيغة البريد الإلكتروني غير صحيحة.";
  if (values.topic && !SYS_TOPICS.includes(values.topic)) errors.topic = "الرجاء اختيار موضوع من القائمة.";
  if (values.message.length < 5) errors.message = "الرجاء كتابة رسالتك.";
  if (Object.keys(errors).length) return { status: "error", errors, values };

  const supabase = await createClient();
  const { error } = await supabase.from("contact_requests").insert({
    name: values.name.slice(0, 120),
    phone,
    organization: values.organization.slice(0, 160),
    email: values.email || null,
    message: values.message.slice(0, 4000),
    topic: values.topic || null,
    source,
  });

  if (error) {
    console.error("contact_requests insert failed:", error.message);
    return { status: "error", message: SEND_FAILED, values };
  }
  return { status: "ok" };
}

export type ServiceRequestField = "name" | "phone" | "organization" | "email" | "org_type" | "holding_type" | "size" | "consult_type" | "preferred_time" | "details" | "consent";

export type ServiceRequestState = {
  status: "idle" | "ok" | "error";
  ref?: string;
  message?: string;
  errors?: Partial<Record<ServiceRequestField, string>>;
  values?: Partial<Record<ServiceRequestField, string>>;
};

// Website «اطلب الخدمة» form. Lands in the same service_requests queue as in-platform requests.
export async function submitServiceRequest(_prev: ServiceRequestState, formData: FormData): Promise<ServiceRequestState> {
  const get = (k: string, max = 4000) => String(formData.get(k) ?? "").trim().slice(0, max);
  const service = (await getServices()).find((s) => s.id === get("service", 40));
  if (!service) return { status: "error", message: "الخدمة غير موجودة." };
  if (get("website")) return { status: "ok", ref: "REQ-0000" };

  const values = {
    name: get("name", 120), phone: get("phone", 20), organization: get("organization", 160), email: get("email", 160),
    org_type: get("org_type", 60), holding_type: get("holding_type", 60), size: get("size", 60),
    consult_type: get("consult_type", 20), preferred_time: get("preferred_time", 120), details: get("details"),
  };
  const phone = normalizePhone(values.phone);

  const errors: ServiceRequestState["errors"] = {};
  if (values.name.length < 2) errors.name = "الرجاء إدخال الاسم.";
  if (!PHONE_RE.test(phone)) errors.phone = "الرجاء إدخال رقم جوال صحيح.";
  if (values.organization.length < 2) errors.organization = "الرجاء إدخال اسم الجهة أو الوقف.";
  if (values.email && !EMAIL_RE.test(values.email)) errors.email = "صيغة البريد الإلكتروني غير صحيحة.";
  if (!formData.get("consent")) errors.consent = "يلزم الموافقة على سياسة الخصوصية.";
  if (Object.keys(errors).length) return { status: "error", errors, values };

  // The id is generated here so the visitor gets a reference without reading the row back
  // (visitors may insert into service_requests but never select from it).
  const id = crypto.randomUUID();
  const supabase = await createClient();
  const { error } = await supabase.from("service_requests").insert({
    id,
    service_id: service.id,
    service_title: service.title,
    kind: "request",
    name: values.name,
    phone,
    organization: values.organization,
    email: values.email || null,
    org_type: values.org_type || null,
    holding_type: values.holding_type || null,
    waqf_size: values.size || null,
    consult_type: ({ financial: "مالية", sharia: "شرعية", legal: "قانونية" } as Record<string, string>)[values.consult_type] || null,
    preferred_time: values.preferred_time || null,
    details: values.details || null,
  });

  if (error) {
    console.error("service_requests insert failed:", error.message);
    return { status: "error", message: SEND_FAILED, values };
  }
  return { status: "ok", ref: "REQ-" + id.slice(0, 8).toUpperCase() };
}
