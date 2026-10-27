// Account access rules shared by the proxy (every dashboard request) and server pages.
// Pure functions only — no server imports — so the proxy can use them.

export type AccessRow = {
  account_id: string | null;
  has_waqf: boolean | null;
  waqf_id: string | null;
  is_admin: boolean;
  trial_ends_at: string | null;
  tier: number | null;
  package_id: string | null;
  package_ends_at: string | null;
};

export type Access = {
  state: "admin" | "trial" | "active" | "expired";
  tier: number;               // 0 = nothing open
  endsAt: string | null;
  packageId: string | null;
  daysLeft: number;
  hasWaqf: boolean;
  onboarded: boolean;
};

const DAY = 86_400_000;
const daysUntil = (iso: string | null) => (iso ? Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / DAY)) : 0);

// The trial opens the Basic package (tier 1); a paid package opens its own tier.
export function computeAccess(row: AccessRow | null): Access {
  if (!row) return { state: "expired", tier: 0, endsAt: null, packageId: null, daysLeft: 0, hasWaqf: false, onboarded: true };
  const base = { hasWaqf: !!row.waqf_id, onboarded: row.is_admin || row.has_waqf !== null || !!row.waqf_id };
  if (row.is_admin) return { ...base, state: "admin", tier: 9, endsAt: null, packageId: null, daysLeft: 0 };
  if (row.tier) return { ...base, state: "active", tier: row.tier, endsAt: row.package_ends_at, packageId: row.package_id, daysLeft: daysUntil(row.package_ends_at) };
  if (row.trial_ends_at && new Date(row.trial_ends_at).getTime() > Date.now())
    return { ...base, state: "trial", tier: 1, endsAt: row.trial_ends_at, packageId: "basic", daysLeft: daysUntil(row.trial_ends_at) };
  return { ...base, state: "expired", tier: 0, endsAt: row.trial_ends_at, packageId: null, daysLeft: 0 };
}

// Reachable whatever the trial/package state: buying, ordering, booking, onboarding and the profile
const ALWAYS_OPEN = ["/dashboard/onboarding", "/dashboard/services", "/dashboard/orders", "/dashboard/billing", "/dashboard/pay", "/dashboard/bookings", "/dashboard/profile"];
// Modules above the Basic package
const TIER_ROUTES: [string, number][] = [["/dashboard/consultancy/ai", 2], ["/dashboard/ocr", 2]];

const under = (path: string, prefix: string) => path === prefix || path.startsWith(prefix + "/");

export function requiredTier(path: string) {
  return TIER_ROUTES.find(([p]) => under(path, p))?.[1] ?? 1;
}

// Where a dashboard request must go instead, or null to let it through
export function gate(path: string, a: Access): string | null {
  if (a.state === "admin") return null;
  if (!a.onboarded) return under(path, "/dashboard/onboarding") ? null : "/dashboard/onboarding";
  if (ALWAYS_OPEN.some((p) => under(path, p))) return null;
  if (a.state === "expired") return "/dashboard/billing?expired=1";
  // Without a waqf the ERP modules have nothing to show; the overview explains how to add one
  if (!a.hasWaqf && path !== "/dashboard") return "/dashboard";
  const need = requiredTier(path);
  if (need > a.tier) return `/dashboard/billing?upgrade=${need}`;
  return null;
}
