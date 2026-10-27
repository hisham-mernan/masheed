import { createClient } from "@supabase/supabase-js";

// Server-only client with the secret key: bypasses RLS. Used solely for writes the user
// must not make themselves — recording verified payments and what they unlock, and
// reading a meeting by its link for guests who have no account.
export function createAdminClient() {
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SECRET_KEY is not set");
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
