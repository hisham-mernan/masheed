import { randomBytes } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchMoyasarPayment } from "@/lib/moyasar";

type Admin = ReturnType<typeof createAdminClient>;
export type SettleResult = { paymentId: string | null; status: "paid" | "failed" | "pending" | "unknown" };

const addMonths = (d: Date, m: number) => { const x = new Date(d); x.setMonth(x.getMonth() + m); return x; };

// Opens a package for `months`, continuing after any running subscription of the same package
async function grantPackage(db: Admin, accountId: string, packageId: string, months: number, source: "purchase" | "service", paymentId: string) {
  const now = new Date();
  const { data: running } = await db.from("subscriptions").select("ends_at")
    .eq("account_id", accountId).eq("package_id", packageId).gt("ends_at", now.toISOString())
    .order("ends_at", { ascending: false }).limit(1);
  const start = running?.[0] ? new Date(running[0].ends_at) : now;
  const { error } = await db.from("subscriptions").insert({
    account_id: accountId, package_id: packageId, source, payment_id: paymentId,
    starts_at: start.toISOString(), ends_at: addMonths(start, months).toISOString(),
  });
  if (error) throw error;
}

// Verifies a Moyasar payment with Moyasar itself, then records it and unlocks what was bought.
// Safe to call more than once (callback and webhook both do): only the first call fulfils.
export async function settleMoyasarPayment(moyasarId: string, expectedPaymentId?: string | null): Promise<SettleResult> {
  const mp = await fetchMoyasarPayment(moyasarId);
  if (!mp) return { paymentId: null, status: "unknown" };
  const pid = mp.metadata?.payment_id || expectedPaymentId || null;
  if (!pid || (expectedPaymentId && mp.metadata?.payment_id && mp.metadata.payment_id !== expectedPaymentId))
    return { paymentId: expectedPaymentId ?? null, status: "unknown" };

  const db = createAdminClient();
  const { data: pay } = await db.from("payments").select("*").eq("id", pid).single();
  if (!pay) return { paymentId: null, status: "unknown" };
  if (pay.status === "paid") return { paymentId: pay.id, status: pay.moyasar_id === mp.id ? "paid" : "unknown" };

  if (mp.status !== "paid") {
    if (mp.status === "failed") await db.from("payments").update({ status: "failed", moyasar_id: mp.id }).eq("id", pay.id).eq("status", "initiated");
    return { paymentId: pay.id, status: mp.status === "failed" ? "failed" : "pending" };
  }
  if (mp.amount !== pay.amount_halalas || mp.currency !== "SAR") return { paymentId: pay.id, status: "unknown" };

  // Claim the row; a concurrent call (webhook + callback) gets nothing back and stops here.
  // moyasar_id is unique, so one Moyasar payment can never settle two rows.
  const { data: claimed, error } = await db.from("payments")
    .update({ status: "paid", moyasar_id: mp.id, paid_at: new Date().toISOString() })
    .eq("id", pay.id).neq("status", "paid").select("id");
  if (error || !claimed?.length) return { paymentId: pay.id, status: error ? "unknown" : "paid" };

  if (pay.purpose === "service") {
    const { data: req } = await db.from("service_requests").update({ status: "paid", paid_at: new Date().toISOString() })
      .eq("id", pay.ref_id).select("service_id").single();
    const { data: svc } = req ? await db.from("services").select("package_id, package_months").eq("id", req.service_id).single() : { data: null };
    if (svc?.package_id) await grantPackage(db, pay.account_id, svc.package_id, svc.package_months || 12, "service", pay.id);
  } else if (pay.purpose === "package") {
    await grantPackage(db, pay.account_id, pay.ref_id, 12, "purchase", pay.id);
  } else if (pay.purpose === "booking") {
    // Confirm the slot. If the 15-minute hold lapsed and someone else took it, the booking
    // stays cancelled and the paid payment shows up for the admin to rebook or refund.
    await db.from("bookings").update({ status: "confirmed", paid_via: "payment", room_code: randomBytes(16).toString("hex"), hold_until: null })
      .eq("id", pay.ref_id).eq("status", "pending_payment");
  }
  return { paymentId: pay.id, status: "paid" };
}
