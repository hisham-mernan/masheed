"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Building2,
  Coins,
  Landmark,
  TreePine,
  Search,
  SlidersHorizontal,
} from "lucide-react";

const MOCK_AWQAF = [
  {
    id: "1",
    title: "وقف إحسان السكني",
    description: "مجمع سكني يعود ريعه للأيتام والأرامل في الرياض. يضم ١٢ وحدة سكنية مؤجرة بعقود طويلة الأجل.",
    type: "REAL_ESTATE",
    totalTokens: 1000,
    availableTokens: 450,
    tokenPrice: 500,
    yieldDestinations: ["ORPHANS", "GENERAL"],
    yieldRate: 8.5,
  },
  {
    id: "2",
    title: "الصندوق الوقفي الصحي",
    description: "محفظة مالية نقدية تخصص أرباحها لعلاج المرضى المحتاجين في المستشفيات الحكومية.",
    type: "CASH",
    totalTokens: 5000,
    availableTokens: 3200,
    tokenPrice: 100,
    yieldDestinations: ["HEALTH"],
    yieldRate: 6.2,
  },
  {
    id: "3",
    title: "وقف النخيل",
    description: "مزرعة نخيل عضوية في القصيم يعود ريعها لدعم الحلقات القرآنية وبناء المساجد.",
    type: "FARMS",
    totalTokens: 200,
    availableTokens: 15,
    tokenPrice: 2000,
    yieldDestinations: ["MOSQUES", "EDUCATION"],
    yieldRate: 7.8,
  },
  {
    id: "4",
    title: "محفظة سنابل النقدية",
    description: "صندوق استثماري نقدي يعود ريعه لدعم التعليم الجامعي والمنح الدراسية للمتفوقين.",
    type: "CASH",
    totalTokens: 10000,
    availableTokens: 8000,
    tokenPrice: 50,
    yieldDestinations: ["EDUCATION", "GENERAL"],
    yieldRate: 5.9,
  },
  {
    id: "5",
    title: "وقف دار السلام العقاري",
    description: "مجمع تجاري في جدة مخصص لدعم مراكز تأهيل ذوي الاحتياجات الخاصة.",
    type: "REAL_ESTATE",
    totalTokens: 800,
    availableTokens: 320,
    tokenPrice: 750,
    yieldDestinations: ["HEALTH", "GENERAL"],
    yieldRate: 9.1,
  },
  {
    id: "6",
    title: "وقف الأرض البيضاء",
    description: "أرض سكنية في المدينة المنورة مخصصة لبناء مشروع وقفي تعليمي.",
    type: "LANDS",
    totalTokens: 500,
    availableTokens: 500,
    tokenPrice: 1200,
    yieldDestinations: ["EDUCATION"],
    yieldRate: 0,
  },
];

const WAQF_TYPES_AR: Record<string, { label: string; icon: React.ReactNode }> = {
  REAL_ESTATE: { label: "عقاري", icon: <Building2 size={16} /> },
  CASH: { label: "نقدي", icon: <Coins size={16} /> },
  FARMS: { label: "مزارع", icon: <TreePine size={16} /> },
  LANDS: { label: "أراضي", icon: <Landmark size={16} /> },
};

const YIELD_DESTINATIONS_AR: Record<string, string> = {
  HEALTH: "صحة",
  EDUCATION: "تعليم",
  MOSQUES: "مساجد",
  ORPHANS: "أيتام",
  GENERAL: "عام",
};

export default function ExplorePage() {
  const [nationality, setNationality] = useState<"SAUDI" | "FOREIGNER">("SAUDI");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [filterYield, setFilterYield] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAwqaf = MOCK_AWQAF.filter((waqf) => {
    if (nationality === "FOREIGNER" && waqf.type !== "CASH") return false;
    if (filterType !== "ALL" && waqf.type !== filterType) return false;
    if (filterYield !== "ALL" && !waqf.yieldDestinations.includes(filterYield)) return false;
    if (searchQuery && !waqf.title.includes(searchQuery) && !waqf.description.includes(searchQuery)) return false;
    return true;
  });

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background pt-24 pb-16">
        {/* Page Header */}
        <section className="max-w-7xl mx-auto px-6 md:px-10 mb-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-3">استكشف الأوقاف</h1>
              <p className="text-muted text-lg max-w-lg">
                اختر الوقف الذي يلامس قلبك، وساهم في استدامته بشراء صكوك وقفية.
              </p>
            </div>

            {/* Nationality Toggle */}
            <div className="bg-card p-1 rounded-xl flex border border-border shadow-sm shrink-0">
              <button
                onClick={() => { setNationality("SAUDI"); setFilterType("ALL"); }}
                className={`px-5 py-2 rounded-lg font-medium text-sm transition-all cursor-pointer ${
                  nationality === "SAUDI"
                    ? "bg-accent text-white shadow-sm"
                    : "text-muted hover:text-foreground"
                }`}
              >
                🇸🇦 مواطن
              </button>
              <button
                onClick={() => { setNationality("FOREIGNER"); setFilterType("ALL"); }}
                className={`px-5 py-2 rounded-lg font-medium text-sm transition-all cursor-pointer ${
                  nationality === "FOREIGNER"
                    ? "bg-accent text-white shadow-sm"
                    : "text-muted hover:text-foreground"
                }`}
              >
                🌍 مقيم
              </button>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-6 md:px-10 flex flex-col lg:flex-row gap-10">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-72 shrink-0">
            <div className="bg-card rounded-2xl border border-border p-6 sticky top-24">
              {/* Search */}
              <div className="relative mb-6">
                <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  placeholder="ابحث عن وقف..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-10 pl-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              {/* Type Filter */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <SlidersHorizontal size={14} className="text-accent" />
                  <h3 className="font-bold text-sm">نوع الوقف</h3>
                </div>
                <div className="space-y-1.5">
                  <FilterButton
                    active={filterType === "ALL"}
                    onClick={() => setFilterType("ALL")}
                    label="الكل"
                  />
                  {Object.entries(WAQF_TYPES_AR).map(([key, { label, icon }]) => {
                    const disabled = nationality === "FOREIGNER" && key !== "CASH";
                    return (
                      <FilterButton
                        key={key}
                        active={filterType === key}
                        onClick={() => !disabled && setFilterType(key)}
                        label={label}
                        icon={icon}
                        disabled={disabled}
                        badge={disabled ? "سعودي فقط" : undefined}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Yield Filter */}
              <div>
                <h3 className="font-bold text-sm mb-3">مجال الأثر</h3>
                <div className="space-y-1.5">
                  <FilterButton
                    active={filterYield === "ALL"}
                    onClick={() => setFilterYield("ALL")}
                    label="الكل"
                  />
                  {Object.entries(YIELD_DESTINATIONS_AR).map(([key, label]) => (
                    <FilterButton
                      key={key}
                      active={filterYield === key}
                      onClick={() => setFilterYield(key)}
                      label={label}
                    />
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Marketplace Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted text-sm">
                عرض <span className="text-foreground font-semibold">{filteredAwqaf.length}</span> وقف
              </p>
            </div>

            {filteredAwqaf.length === 0 ? (
              <div className="text-center py-20 bg-card rounded-2xl border border-border">
                <p className="text-muted text-lg mb-2">لا توجد أوقاف مطابقة</p>
                <p className="text-muted text-sm">جرّب تغيير معايير البحث أو الفلاتر</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredAwqaf.map((waqf) => {
                  const progress = ((waqf.totalTokens - waqf.availableTokens) / waqf.totalTokens) * 100;
                  const typeInfo = WAQF_TYPES_AR[waqf.type];

                  return (
                    <div
                      key={waqf.id}
                      className="bg-card rounded-2xl border border-border p-6 hover:shadow-lg hover:border-accent/20 transition-all duration-300 group flex flex-col"
                    >
                      {/* Badge Row */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="bg-secondary text-accent px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5">
                            {typeInfo?.icon}
                            {typeInfo?.label}
                          </span>
                          {waqf.yieldRate > 0 && (
                            <span className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full text-xs font-semibold">
                              {waqf.yieldRate}%
                            </span>
                          )}
                        </div>
                        <span className="text-muted text-xs">
                          متبقي {waqf.availableTokens} صك
                        </span>
                      </div>

                      <h3 className="text-lg font-bold mb-2 group-hover:text-accent transition-colors">
                        {waqf.title}
                      </h3>
                      <p className="text-muted text-sm mb-5 flex-1 leading-relaxed">
                        {waqf.description}
                      </p>

                      {/* Yield Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {waqf.yieldDestinations.map((dest) => (
                          <span
                            key={dest}
                            className="bg-background text-muted text-[10px] font-medium px-2.5 py-1 rounded-full border border-border"
                          >
                            {YIELD_DESTINATIONS_AR[dest]}
                          </span>
                        ))}
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-5">
                        <div className="flex justify-between text-xs text-muted mb-1.5">
                          <span>تم جمع {Math.round(progress)}%</span>
                          <span>{waqf.totalTokens - waqf.availableTokens} / {waqf.totalTokens} صك</span>
                        </div>
                        <div className="w-full bg-background rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-accent h-full rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Price & CTA */}
                      <div className="flex items-center justify-between pt-5 border-t border-border mt-auto">
                        <div>
                          <p className="text-muted text-xs mb-0.5">قيمة الصك</p>
                          <p className="font-bold text-lg">{waqf.tokenPrice} ريال</p>
                        </div>
                        <button className="bg-foreground text-background hover:bg-accent px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer">
                          ساهم الآن
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

/* ─── Filter Button ─── */
function FilterButton({
  active,
  onClick,
  label,
  icon,
  disabled,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  badge?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-right transition-all cursor-pointer ${
        active
          ? "bg-accent/10 text-accent font-semibold"
          : disabled
          ? "text-muted-light cursor-not-allowed opacity-50"
          : "text-muted hover:bg-secondary hover:text-foreground"
      }`}
    >
      <span className="flex items-center gap-2">
        {icon}
        {label}
      </span>
      {badge && <span className="text-[9px] text-muted-light">{badge}</span>}
    </button>
  );
}
