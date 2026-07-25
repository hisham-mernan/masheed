export const dynamic = "force-dynamic";

import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, waqf_id")
    .eq("id", user.id)
    .single();

  // Fetch user's waqf details
  let waqfData = null;
  if (profile?.waqf_id) {
    const { data } = await supabase
      .from("waqfs")
      .select("id, name, description")
      .eq("id", profile.waqf_id)
      .single();
    waqfData = data;
  }

  // Fetch assets for the user's waqf
  let assets: { id: string; name: string; category: string; valuation: number; status: string }[] = [];
  if (profile?.waqf_id) {
    const { data } = await supabase
      .from("assets")
      .select("id, name, category, valuation, status")
      .eq("waqf_id", profile.waqf_id);
    assets = data || [];
  }

  // Fetch recent transactions
  let transactions: { id: string; amount: number; type: string; category: string; description: string; transaction_date: string; is_yield: boolean }[] = [];
  if (profile?.waqf_id) {
    const { data } = await supabase
      .from("transactions")
      .select("id, amount, type, category, description, transaction_date, is_yield")
      .eq("waqf_id", profile.waqf_id)
      .order("transaction_date", { ascending: false })
      .limit(10);
    transactions = data || [];
  }

  // Calculate totals
  const totalAssetValue = assets.reduce((sum, a) => sum + Number(a.valuation || 0), 0);
  const totalYield = transactions
    .filter((t) => t.is_yield && t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <>
      <Header />
      <DashboardClient
        user={{
          email: user.email || "",
          fullName: profile?.full_name || "مستخدم",
          role: profile?.role || "viewer",
        }}
        waqf={waqfData}
        stats={{
          totalAssets: assets.length,
          totalAssetValue,
          totalYield,
          totalTransactions: transactions.length,
        }}
        assets={assets}
        transactions={transactions}
      />
      <Footer />
    </>
  );
}
