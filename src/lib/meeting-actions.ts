"use server";

import { randomBytes } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { zegoToken } from "@/lib/zego";

export type JoinResult = { ok: true; appId: number; token: string; roomId: string; userId: string; userName: string } | { ok: false; message: string };

// Joining opens 15 minutes before the session and closes 30 minutes after it ends
const JOIN_EARLY_MS = 15 * 60_000;
const JOIN_LATE_MS = 30 * 60_000;

export async function getMeeting(code: string) {
  if (!/^[a-f0-9]{32}$/.test(code)) return null;
  const { data } = await createAdminClient().from("bookings")
    .select("starts_at, ends_at, status, experts(name), accounts(name)").eq("room_code", code).single();
  if (!data || data.status !== "confirmed") return null;
  return {
    startsAt: data.starts_at as string,
    endsAt: data.ends_at as string,
    expert: (data.experts as unknown as { name: string } | null)?.name || "",
    account: (data.accounts as unknown as { name: string } | null)?.name || "",
  };
}

// Anyone with the link may join (the link is the invitation); the token is scoped to this room's time
export async function joinMeeting(code: string, rawName: string): Promise<JoinResult> {
  const userName = rawName.trim().replace(/\s+/g, " ").slice(0, 40);
  if (userName.length < 2) return { ok: false, message: "اكتب اسمك ليظهر للحاضرين" };
  const m = await getMeeting(code);
  if (!m) return { ok: false, message: "رابط الجلسة غير صالح أو أُلغيت الجلسة" };
  const now = Date.now();
  const opens = new Date(m.startsAt).getTime() - JOIN_EARLY_MS;
  const closes = new Date(m.endsAt).getTime() + JOIN_LATE_MS;
  if (now < opens) return { ok: false, message: "لم يحن موعد الجلسة بعد؛ يفتح الدخول قبلها بربع ساعة" };
  if (now > closes) return { ok: false, message: "انتهت هذه الجلسة" };
  const userId = "u" + randomBytes(8).toString("hex");
  try {
    const { appId, token } = zegoToken(userId, Math.ceil((closes - now) / 1000));
    return { ok: true, appId, token, roomId: code, userId, userName };
  } catch {
    return { ok: false, message: "خدمة الاجتماعات غير مهيأة بعد" };
  }
}
