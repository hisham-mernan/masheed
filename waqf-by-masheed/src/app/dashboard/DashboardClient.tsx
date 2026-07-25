"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Building2,
  Coins,
  LogOut,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from "lucide-react";

interface DashboardProps {
  user: {
    email: string;
    fullName: string;
    role: string;
  };
  waqf: { id: string; name: string; description: string } | null;
  stats: {
    totalAssets: number;
    totalAssetValue: number;
    totalYield: number;
    totalTransactions: number;
  };
  assets: { id: string; name: string; category: string; valuation: number; status: string }[];
  transactions: {
    id: string;
    amount: number;
    type: string;
    category: string;
    description: string;
    transaction_date: string;
    is_yield: boolean;
  }[];
}

const CATEGORY_AR: Record<string, string> = {
  real_estate: "عقاري",
  agricultural: "زراعي",
  investment: "استثماري",
  cash: "نقدي",
};

const TYPE_AR: Record<string, string> = {
  income: "إيراد",
  expense: "مصروف",
  distribution: "توزيع",
};

export default function DashboardClient({
  user,
  waqf,
  stats,
  assets,
  transactions,
}: DashboardProps) {
  const router = useRouter();
  const [showYieldModal, setShowYieldModal] = useState(false);
  const [selectedYield, setSelectedYield] = useState("GENERAL");

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("ar-SA", {
      style: "currency",
      currency: "SAR",
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <main className="min-h-screen bg-background pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-1">
              أهلاً، {user.fullName} 👋
            </h1>
            <p className="text-muted text-sm">
              {waqf ? `${waqf.name} · ${user.role}` : "لم يتم ربط وقف بحسابك بعد"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowYieldModal(true)}
              className="bg-accent text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-accent-dark transition-all flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw size={16} />
              إدارة التوجيه
            </button>
            <button
              onClick={handleLogout}
              className="bg-card border border-border text-muted px-4 py-2.5 rounded-xl text-sm font-medium hover:text-red-500 hover:border-red-200 transition-all flex items-center gap-2 cursor-pointer"
            >
              <LogOut size={16} />
              خروج
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <StatCard
            icon={<Building2 size={20} />}
            label="إجمالي الأصول"
            value={stats.totalAssets.toString()}
            sub="أصل وقفي"
            color="bg-blue-50 text-blue-600"
          />
          <StatCard
            icon={<Coins size={20} />}
            label="قيمة الأصول"
            value={formatCurrency(stats.totalAssetValue)}
            sub="إجمالي التقييم"
            color="bg-emerald-50 text-emerald-600"
          />
          <StatCard
            icon={<TrendingUp size={20} />}
            label="عوائد الريع"
            value={formatCurrency(stats.totalYield)}
            sub="إيرادات محققة"
            color="bg-amber-50 text-amber-700"
          />
          <StatCard
            icon={<BarChart3 size={20} />}
            label="المعاملات"
            value={stats.totalTransactions.toString()}
            sub="آخر ١٠ حركات"
            color="bg-purple-50 text-purple-600"
          />
        </div>

        {/* Portfolio Health Score & Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          {/* Portfolio Health Score */}
          <div className="lg:col-span-1 bg-card rounded-2xl border border-border p-6 text-right" style={{ direction: "rtl" }}>
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2 justify-start">
              <span>🩺</span> صحة محفظة الاستثمار (Portfolio Health)
            </h3>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full border-4 border-accent bg-accent/5 flex items-center justify-center text-xl font-bold text-accent">
                ٩٣٪
              </div>
              <div className="text-right">
                <p className="font-semibold text-sm">أداء المحفظة ممتاز جداً</p>
                <p className="text-muted text-xs mt-0.5">تقييم مبني على الحوكمة والالتزام ومخاطر الأصول</p>
              </div>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between border-b border-border pb-1.5">
                <span className="text-muted">التنويع (Diversification - ٢٠٪)</span>
                <span className="font-semibold text-emerald-600">٩٥٪</span>
              </div>
              <div className="flex justify-between border-b border-border pb-1.5">
                <span className="text-muted">مخاطر المحفظة (Risk - ٢٠٪)</span>
                <span className="font-semibold text-emerald-600">٩٢٪</span>
              </div>
              <div className="flex justify-between border-b border-border pb-1.5">
                <span className="text-muted">جودة الحوكمة (Governance - ١٥٪)</span>
                <span className="font-semibold text-emerald-600">٩٦٪</span>
              </div>
              <div className="flex justify-between border-b border-border pb-1.5">
                <span className="text-muted">نسبة الالتزام (Compliance - ١٥٪)</span>
                <span className="font-semibold text-amber-600">٨٨٪</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">أداء العوائد (Return Performance - ٢٠٪)</span>
                <span className="font-semibold text-emerald-600">٩٤٪</span>
              </div>
            </div>
          </div>

          {/* Returns Timeline */}
          <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-6 text-right" style={{ direction: "rtl" }}>
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2 justify-start">
              <span>📅</span> جدول التوزيعات الزمني (Payout Timeline)
            </h3>
            <div className="relative border-r-2 border-border pr-6 space-y-5 text-sm" style={{ marginRight: "10px" }}>
              <div className="relative">
                <div className="absolute -right-[31px] top-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-4 border-card" />
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">صرف أرباح الربع الثاني لعام ٢٠٢٦</p>
                    <p className="text-muted text-xs mt-0.5">تم التحويل إلى المحفظة بنجاح</p>
                  </div>
                  <span className="text-emerald-600 font-semibold text-left">+٣,٠٠٠ ر.س</span>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -right-[31px] top-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-4 border-card" />
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">صرف أرباح الربع الأول لعام ٢٠٢٦</p>
                    <p className="text-muted text-xs mt-0.5">تم التحويل إلى المحفظة بنجاح</p>
                  </div>
                  <span className="text-emerald-600 font-semibold text-left">+٢,٥٠٠ ر.س</span>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -right-[31px] top-1 w-3.5 h-3.5 rounded-full bg-blue-500 border-4 border-card" />
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">توزيع ريع خريف ٢٠٢٥ المتوقع</p>
                    <p className="text-muted text-xs mt-0.5">مجدول للصرف التلقائي في ١٥ أكتوبر</p>
                  </div>
                  <span className="text-blue-500 font-semibold text-left">٣,٢٠٠ ر.س (متوقع)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Assets List */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-2xl border border-border p-6">
              <h3 className="font-bold text-lg mb-5">أصول الوقف</h3>
              {assets.length === 0 ? (
                <p className="text-muted text-sm">لا توجد أصول مسجلة بعد.</p>
              ) : (
                <div className="space-y-3">
                  {assets.map((asset) => (
                    <div
                      key={asset.id}
                      className="flex items-center justify-between p-4 bg-background rounded-xl hover:bg-secondary transition-colors"
                    >
                      <div>
                        <p className="font-medium text-sm">{asset.name}</p>
                        <p className="text-muted text-xs mt-0.5">
                          {CATEGORY_AR[asset.category] || asset.category}
                        </p>
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-sm">{formatCurrency(Number(asset.valuation))}</p>
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                            asset.status === "active"
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {asset.status === "active" ? "نشط" : asset.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Transactions */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-2xl border border-border p-6">
              <h3 className="font-bold text-lg mb-5">آخر المعاملات</h3>
              {transactions.length === 0 ? (
                <p className="text-muted text-sm">لا توجد معاملات بعد.</p>
              ) : (
                <div className="space-y-2">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-4 bg-background rounded-xl hover:bg-secondary transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                            tx.type === "income"
                              ? "bg-emerald-50 text-emerald-600"
                              : tx.type === "expense"
                              ? "bg-red-50 text-red-500"
                              : "bg-blue-50 text-blue-500"
                          }`}
                        >
                          {tx.type === "income" ? (
                            <ArrowUpRight size={16} />
                          ) : (
                            <ArrowDownRight size={16} />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {tx.description || tx.category || TYPE_AR[tx.type]}
                          </p>
                          <p className="text-muted text-xs mt-0.5">
                            {tx.transaction_date} · {tx.is_yield ? "ريع" : "أصل"}
                          </p>
                        </div>
                      </div>
                      <p
                        className={`font-semibold text-sm ${
                          tx.type === "income" ? "text-emerald-600" : "text-red-500"
                        }`}
                      >
                        {tx.type === "income" ? "+" : "-"}
                        {formatCurrency(Number(tx.amount))}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Yield Redirection Modal */}
      {showYieldModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-6">
          <div className="bg-card rounded-2xl p-8 max-w-md w-full border border-border shadow-xl animate-fade-in-up">
            <h3 className="text-xl font-bold mb-2">إدارة توجيه العوائد</h3>
            <p className="text-muted text-sm mb-6">
              اختر المصرف الذي تريد توجيه ريع (أرباح) صكوكك إليه. يمكنك التغيير في أي وقت.
            </p>

            <div className="space-y-3 mb-8">
              {[
                { value: "EDUCATION", label: "📚 التعليم", desc: "دعم طلاب العلم والمنح الدراسية" },
                { value: "HEALTH", label: "🏥 الصحة", desc: "علاج المرضى المحتاجين" },
                { value: "ORPHANS", label: "🤲 الأيتام", desc: "كفالة ورعاية الأيتام" },
                { value: "MOSQUES", label: "🕌 المساجد", desc: "بناء وصيانة المساجد" },
                { value: "GENERAL", label: "🌍 عام", desc: "يوزّع حسب الأولوية" },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedYield === opt.value
                      ? "border-accent bg-accent/5"
                      : "border-border hover:border-accent/30"
                  }`}
                >
                  <input
                    type="radio"
                    name="yield"
                    value={opt.value}
                    checked={selectedYield === opt.value}
                    onChange={() => setSelectedYield(opt.value)}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedYield === opt.value
                        ? "border-accent"
                        : "border-border"
                    }`}
                  >
                    {selectedYield === opt.value && (
                      <div className="w-2.5 h-2.5 rounded-full bg-accent" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{opt.label}</p>
                    <p className="text-muted text-xs">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowYieldModal(false)}
                className="flex-1 bg-accent text-white py-3 rounded-xl font-semibold hover:bg-accent-dark transition-all cursor-pointer"
              >
                حفظ التوجيه
              </button>
              <button
                onClick={() => setShowYieldModal(false)}
                className="px-6 py-3 rounded-xl border border-border text-muted font-medium hover:bg-secondary transition-all cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

/* ─── Stat Card Component ─── */
function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <div className="bg-card rounded-2xl border border-border p-6 hover:shadow-md transition-shadow">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <p className="text-muted text-xs font-medium mb-1">{label}</p>
      <p className="text-2xl font-bold mb-1">{value}</p>
      <p className="text-muted text-xs">{sub}</p>
    </div>
  );
}
