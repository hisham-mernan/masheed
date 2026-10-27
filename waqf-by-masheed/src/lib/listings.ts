import { createClient } from "@supabase/supabase-js";

// Opportunities approved for the market in نظام مَشيد, read from the public_listings view
// (migration 10). Only real listings are shown — there is no sample data.

export type Listing = {
  id: string;
  target_funding: number | null;
  price_per_share: number | null;
  shares_count: number | null;
  status: "approved" | "trading";
  asset_name: string | null;
  asset_category: string | null;
  waqf_name: string | null;
  created_at: string;
};

const COLUMNS = "id, target_funding, price_per_share, shares_count, status, asset_name, asset_category, waqf_name, created_at";

function client() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function getListings(): Promise<Listing[]> {
  const sb = client();
  if (!sb) return [];
  const { data, error } = await sb.from("public_listings").select(COLUMNS).order("created_at", { ascending: false });
  if (error) {
    console.error("public_listings read failed:", error.message);
    return [];
  }
  return (data ?? []) as Listing[];
}

export async function getListing(id: string): Promise<Listing | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const sb = client();
  if (!sb) return null;
  const { data, error } = await sb.from("public_listings").select(COLUMNS).eq("id", id).maybeSingle();
  if (error) console.error("public_listings read failed:", error.message);
  return (data as Listing | null) ?? null;
}

export const CATEGORY: Record<string, { label: string; icon: "home" | "layers" | "trendingUp" | "dollar" }> = {
  real_estate: { label: "عقاري", icon: "home" },
  agricultural: { label: "زراعي", icon: "layers" },
  investment: { label: "استثماري", icon: "trendingUp" },
  cash: { label: "نقدي", icon: "dollar" },
};
export const categoryOf = (l: Listing) => CATEGORY[l.asset_category ?? ""] ?? { label: "أصل وقفي", icon: "home" as const };
export const titleOf = (l: Listing) => l.asset_name || "فرصة وقفية";
export const statusLabel = (l: Listing) => (l.status === "trading" ? "متداولة" : "متاحة للاستثمار");
export const fmt = (n: number | null | undefined) => Math.round(Number(n) || 0).toLocaleString("en-US");
