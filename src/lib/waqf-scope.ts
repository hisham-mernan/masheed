import { cookies } from "next/headers";

export type WaqfScope = string | null; // null = default (own waqf via RLS), 'all' = كل الأوقاف, otherwise waqf id

/** Read the waqf selection cookie (only meaningful for platform admins). */
export async function getWaqfScope(): Promise<WaqfScope> {
  const store = await cookies();
  const v = store.get("masheed_waqf")?.value;
  if (!v) return null;
  if (v === "all") return "all";
  return v;
}

/** Apply waqf filter to a supabase query when a specific waqf is selected. */
export function scopeQuery<T>(query: T, scope: WaqfScope): T {
  if (scope && scope !== "all") return (query as any).eq("waqf_id", scope) as T;
  return query;
}

/** Label for the current scope to show in page headers. */
export function scopeLabel(scope: WaqfScope, waqfs: { id: string; name: string }[]): string | null {
  if (!scope) return null;
  if (scope === "all") return "كل الأوقاف";
  return waqfs.find(w => w.id === scope)?.name || null;
}
