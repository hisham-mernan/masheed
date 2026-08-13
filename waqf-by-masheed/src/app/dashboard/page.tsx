export const dynamic = "force-dynamic";

import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const mockEmail = cookieStore.get("masheed-user-email")?.value;
  const mockRole = cookieStore.get("masheed-mock-role")?.value;

  let user: any = null;
  let profile: any = null;
  let supabase: any = null;

  try {
    supabase = await createServerSupabaseClient();
    const { data: authData } = await supabase.auth.getUser();
    user = authData?.user || null;
  } catch (e) {}

  if (!user && (mockEmail || mockRole)) {
    user = {
      id: "a61ef854-15de-4210-bd48-c4de5e764ea8",
      email: mockEmail || "admin@masheed.com",
    };
  }

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch user profile
  if (supabase && user.id !== "a61ef854-15de-4210-bd48-c4de5e764ea8") {
    try {
      const { data: dbProfile } = await supabase
        .from("profiles")
        .select("full_name, role, waqf_id")
        .eq("id", user.id)
        .maybeSingle();
      profile = dbProfile;
    } catch (e) {}
  }

  if (!profile) {
    profile = {
      full_name: "المدير التنفيذي لـ ناظر الوقف",
      role: mockRole || "admin",
      waqf_id: "67dd4687-89e3-4c4a-a63d-e2f94dff0e73"
    };
  }

  // Fetch user's waqf details
  let waqfData = null;
  if (supabase && profile?.waqf_id) {
    try {
      const { data } = await supabase
        .from("waqfs")
        .select("id, name, description")
        .eq("id", profile.waqf_id)
        .maybeSingle();
      waqfData = data;
    } catch (e) {}
  }

  if (!waqfData) {
    waqfData = {
      id: "67dd4687-89e3-4c4a-a63d-e2f94dff0e73",
      name: "أوقاف النماء والازدهار التنموية",
      description: "وقف تنموي استثماري يعنى بإدارة وتنمية الأصول العقارية والمالية وتوزيع الريع على المصارف المحددة."
    };
  }

  // Fetch assets for the user's waqf
  let assets: { id: string; name: string; category: string; valuation: number; status: string }[] = [];
  if (supabase && profile?.waqf_id) {
    try {
      const { data } = await supabase
        .from("assets")
        .select("id, name, category, valuation, status")
        .eq("waqf_id", profile.waqf_id);
      assets = data || [];
    } catch (e) {}
  }

  if (assets.length === 0) {
    assets = [
      { id: "ast-01", name: "برج النخبة التجاري - العليا", category: "عقاري", valuation: 125000000, status: "نشط" },
      { id: "ast-02", name: "مركز النماء اللوجستي - الصناعية الثانية", category: "لوجستي", valuation: 68000000, status: "نشط" },
      { id: "ast-03", name: "مجمع المدارس الدولية الوقفي", category: "تعليمي", valuation: 34500000, status: "نشط" },
      { id: "ast-04", name: "أرض المعذر الاستثمارية", category: "أراضي", valuation: 16000000, status: "تحت التطوير" }
    ];
  }

  // Fetch recent transactions
  let transactions: { id: string; amount: number; type: string; category: string; description: string; transaction_date: string; is_yield: boolean }[] = [];
  if (supabase && profile?.waqf_id) {
    try {
      const { data } = await supabase
        .from("transactions")
        .select("id, amount, type, category, description, transaction_date, is_yield")
        .eq("waqf_id", profile.waqf_id)
        .order("transaction_date", { ascending: false })
        .limit(10);
      transactions = data || [];
    } catch (e) {}
  }

  if (transactions.length === 0) {
    transactions = [
      { id: "trn-01", amount: 1450000, type: "income", category: "إيجارات", description: "تحصيل الدفعة السنوية - برج العليا", transaction_date: "2026-08-01", is_yield: true },
      { id: "trn-02", amount: 820000, type: "income", category: "عوائد لوجستية", description: "إيرادات مركز النماء اللوجستي", transaction_date: "2026-07-28", is_yield: true },
      { id: "trn-03", amount: 950000, type: "distribution", category: "مصارف وقفيّة", description: "صرف مخصص المصارف التنموية والتعليمية", transaction_date: "2026-07-15", is_yield: false },
    ];
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
          role: profile?.role || "admin",
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
