import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { computeAccess, type AccessRow } from "@/lib/access";

export type Account = { id: string; name: string; phone: string | null; has_waqf: boolean | null; trial_ends_at: string };

// The signed-in user's account, waqf and access, once per request
export const getAccountContext = cache(async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const [{ data: rows }, { data: profile }] = await Promise.all([
    supabase.rpc("my_access"),
    supabase.from("profiles").select("full_name, role, waqf_id, account_id, is_platform_admin").eq("id", user.id).single(),
  ]);
  const row = ((Array.isArray(rows) ? rows[0] : rows) ?? null) as AccessRow | null;
  const { data: account } = profile?.account_id
    ? await supabase.from("accounts").select("id, name, phone, has_waqf, trial_ends_at").eq("id", profile.account_id).single()
    : { data: null };
  return {
    supabase,
    user,
    profile,
    account: account as Account | null,
    access: computeAccess(row),
    isPlatformAdmin: !!profile?.is_platform_admin,
  };
});

export const SAR = (n: number | string | null | undefined) => Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 2 });

export const dateAr = (iso: string, opts: Intl.DateTimeFormatOptions = { dateStyle: "medium" }) =>
  new Date(iso).toLocaleString("ar-SA-u-nu-latn", { timeZone: "Asia/Riyadh", ...opts });

// Request time for server components (kept out of render bodies for the purity lint)
export const nowMs = () => Date.now();
