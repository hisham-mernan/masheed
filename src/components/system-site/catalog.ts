import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
import type { IconName } from "./Icon";
import type { Plan, Service } from "./data";

// Services and packages come from the database (edited from the admin dashboard later).
// Public rows only, read with the publishable key — no cookies, so pages can be cached.
const db = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const KIND = { quote: "request", fixed: "direct", booking: "booking" } as const;

export const getServices = cache(async (): Promise<Service[]> => {
  const { data, error } = await db().from("services").select("id, title, subtitle, description, includes, price_label, pricing, price, icon").eq("active", true).order("sort");
  if (error) console.error("services:", error.message);
  return (data || []).map((r) => ({
    id: r.id,
    icon: (r.icon || "layers") as IconName,
    title: r.title,
    subtitle: r.subtitle || "",
    desc: r.description || r.subtitle || "",
    includes: (r.includes as string[]) || [],
    type: KIND[r.pricing as keyof typeof KIND],
    price: r.price == null ? null : Number(r.price),
    priceLabel: r.price_label || "",
  }));
});

export const getPlans = cache(async (): Promise<Plan[]> => {
  const { data, error } = await db().from("packages").select("id, name, users_label, price, best, features").eq("active", true).order("sort");
  if (error) console.error("packages:", error.message);
  return (data || []).map((p) => ({ id: p.id, name: p.name, users: p.users_label || "", price: Number(p.price), best: p.best, feats: (p.features as string[]) || [] }));
});
