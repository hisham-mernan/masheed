"use client";

import React, { useState } from "react";
import Link from "next/link";

interface Asset {
  id: string;
  name: string;
  category: "real_estate" | "land" | "financial" | "movable" | "intellectual" | "other";
  categoryAr: string;
  city: string;
  valuation: number;
  occupancyRate: number;
  complianceScore: number;
  status: "active" | "maintenance" | "inactive";
  statusAr: string;
  hasInsurance: boolean;
}

export default function AssetsPage() {
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterCity, setFilterCity] = useState("all");

  const [assets, setAssets] = useState<Asset[]>([
    { id: "AST-101", name: "برج الخزامى السكني", category: "real_estate", categoryAr: "عقاري (Towers)", city: "الرياض", valuation: 12000000, occupancyRate: 95, complianceScore: 98, status: "active", statusAr: "نشط", hasInsurance: true },
    { id: "AST-102", name: "مزرعة النخيل التصديرية", category: "land", categoryAr: "زراعي (Land)", city: "القصيم", valuation: 3500000, occupancyRate: 100, complianceScore: 92, status: "active", statusAr: "نشط", hasInsurance: false },
    { id: "AST-103", name: "محفظة صكوك بنك الإنماء", category: "financial", categoryAr: "استثماري مالي (Sukuk)", city: "الرياض", valuation: 8000000, occupancyRate: 0, complianceScore: 100, status: "active", statusAr: "نشط", hasInsurance: false },
    { id: "AST-104", name: "معدات ومولدات الطاقة الاحتياطية", category: "movable", categoryAr: "منقول (Machinery)", city: "مكة المكرمة", valuation: 1200000, occupancyRate: 0, complianceScore: 90, status: "maintenance", statusAr: "صيانة جارية", hasInsurance: true },
    { id: "AST-105", name: "ترخيص التشغيل الزراعي العضوي", category: "intellectual", categoryAr: "حقوق معنوية (License)", city: "القصيم", valuation: 500000, occupancyRate: 0, complianceScore: 95, status: "active", statusAr: "نشط", hasInsurance: false }
  ]);

  const handleLaunchMaintenance = (id: string) => {
    setAssets(prev => prev.map(a => {
      if (a.id === id) {
        return { ...a, status: "maintenance", statusAr: "صيانة جارية" };
      }
      return a;
    }));
    alert("تم تقديم طلب الصيانة وجاري تعيين مقاول صيانة معتمد.");
  };

  const filteredAssets = assets.filter(asset => {
    const matchCategory = filterCategory === "all" || asset.category === filterCategory;
    const matchCity = filterCity === "all" || asset.city === filterCity;
    return matchCategory && matchCity;
  });

  return (
    <div className="fade-in" style={{ padding: "2rem", color: "#1A1A2E", direction: "rtl", fontFamily: "Cairo, sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: "700", color: "#1A1A2E" }}>مركز التحكم بالأصول الوقفية (Asset Command Center)</h1>
          <p style={{ color: "#64748B", marginTop: "0.25rem" }}>إدارة التوائم الرقمية للأصول، جدولة الصيانة، التدقيق الفني المالي، وتقييم الجاهزية لطرح السوق</p>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button onClick={() => alert("تصدير سجل الأصول")} style={{ background: "#ffffff", border: "1px solid #E4E7EF", padding: "0.6rem 1.2rem", borderRadius: "8px", color: "#8561AD", cursor: "pointer", fontSize: "0.9rem", fontWeight: "bold", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>تصدير السجل 📥</button>
          <Link href="/dashboard/assets/add" style={{ textDecoration: 'none', background: "#8561AD", color: "#fff", padding: "0.6rem 1.2rem", borderRadius: "8px", fontWeight: "600", fontSize: "0.9rem", boxShadow: "0 4px 12px rgba(133, 97, 173, 0.2)" }}>إضافة أصل جديد +</Link>
        </div>
      </div>

      {/* Command Center Dashboard */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem", marginBottom: "2rem" }}>
        {/* Real-time AI Alerts panel */}
        <div style={{ background: "#ffffff", border: "1px solid #E4E7EF", borderRadius: "16px", padding: "1.5rem", boxShadow: "0 4px 12px rgba(0,0,0,0.03)", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h3 style={{ fontSize: "1.1rem", color: "#8561AD", fontWeight: "700", margin: 0 }}>🚨 تنبيهات ومقترحات الذكاء الاصطناعي للأصول (AI Insights)</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ display: "flex", gap: "0.75rem", background: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.15)", borderRadius: "8px", padding: "0.75rem", fontSize: "0.85rem", color: "#1A1A2E" }}>
              <span>⚠️</span>
              <div>
                <strong>تنبيه تأمين:</strong> أصل <em>مزرعة النخيل التصديرية</em> يفتقر لتغطية تأمينية سارية. يرجى تجديد بوالص التأمين لتجنب غرامة الالتزام.
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.75rem", background: "rgba(245, 158, 11, 0.05)", border: "1px solid rgba(245, 158, 11, 0.15)", borderRadius: "8px", padding: "0.75rem", fontSize: "0.85rem", color: "#1A1A2E" }}>
              <span>📊</span>
              <div>
                <strong>تحسين العوائد:</strong> العائد الإيجاري لـ <em>برج الخزامى السكني</em> يقل بنسبة ١٨٪ عن العقارات المشابهة بالمنطقة المجاورة. نقترح مراجعة استراتيجية التسعير.
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.75rem", background: "rgba(16, 185, 129, 0.05)", border: "1px solid rgba(16, 185, 129, 0.15)", borderRadius: "8px", padding: "0.75rem", fontSize: "0.85rem", color: "#1A1A2E" }}>
              <span>✅</span>
              <div>
                <strong>جاهزية السوق:</strong> أصل <em>محفظة صكوك بنك الإنماء</em> يحقق نقاط جاهزية طرح بنسبة ١٠٠٪ ومرشح للإدراج في سوق أوقاف مشيد.
              </div>
            </div>
          </div>
        </div>

        {/* Global Asset KPIs */}
        <div style={{ background: "#ffffff", border: "1px solid #E4E7EF", borderRadius: "16px", padding: "1.5rem", boxShadow: "0 4px 12px rgba(0,0,0,0.03)", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <h3 style={{ fontSize: "1.1rem", color: "#8561AD", fontWeight: "700", margin: 0 }}>مؤشرات محفظة الأصول</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", fontSize: "0.85rem", color: "#1A1A2E" }}>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #E2E8F0", paddingBottom: "0.5rem" }}>
              <span style={{ color: "#64748B" }}>إجمالي قيمة المحفظة المقدرة</span>
              <strong style={{ color: "#10B981", fontSize: "1rem" }}>٢٤,٩٠٠,٠٠٠ ر.س</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #E2E8F0", paddingBottom: "0.5rem" }}>
              <span style={{ color: "#64748B" }}>متوسط نسبة الإشغال العقاري</span>
              <strong>٩٧.٥٪</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748B" }}>الأصول المشمولة بالتغطية</span>
              <strong style={{ color: "#3B82F6" }}>٤٠٪ (٢ / ٥)</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "1.5rem", background: "#ffffff", border: "1px solid #E4E7EF", padding: "1rem 1.5rem", borderRadius: "12px", marginBottom: "1.5rem", boxShadow: "0 2px 6px rgba(0,0,0,0.01)" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <label style={{ fontSize: "0.85rem", color: "#64748B", marginLeft: "0.75rem", fontWeight: "bold" }}>تصنيف الأصل:</label>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} style={{ background: "#F8FAFC", color: "#1A1A2E", border: "1px solid #E2E8F0", padding: "0.4rem 0.8rem", borderRadius: "6px", fontSize: "0.85rem" }}>
            <option value="all">الكل</option>
            <option value="real_estate">عقاري (Properties)</option>
            <option value="land">أراضي (Land)</option>
            <option value="financial">محافظ مالية (Financial)</option>
            <option value="movable">أصول منقولة (Movable)</option>
            <option value="intellectual">حقوق معنوية (Intellectual)</option>
          </select>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <label style={{ fontSize: "0.85rem", color: "#64748B", marginLeft: "0.75rem", fontWeight: "bold" }}>المدينة / المنطقة:</label>
          <select value={filterCity} onChange={(e) => setFilterCity(e.target.value)} style={{ background: "#F8FAFC", color: "#1A1A2E", border: "1px solid #E2E8F0", padding: "0.4rem 0.8rem", borderRadius: "6px", fontSize: "0.85rem" }}>
            <option value="all">الكل</option>
            <option value="الرياض">الرياض</option>
            <option value="القصيم">القصيم</option>
            <option value="مكة المكرمة">مكة المكرمة</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div style={{ background: "#ffffff", border: "1px solid #E4E7EF", borderRadius: "16px", padding: "1.5rem", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "right", fontSize: "0.9rem" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #E2E8F0", color: "#64748B" }}>
              <th style={{ padding: "0.75rem" }}>المعرف</th>
              <th style={{ padding: "0.75rem" }}>اسم الأصل / العقار</th>
              <th style={{ padding: "0.75rem" }}>التصنيف</th>
              <th style={{ padding: "0.75rem" }}>الموقع</th>
              <th style={{ padding: "0.75rem" }}>القيمة المقدرة</th>
              <th style={{ padding: "0.75rem" }}>الإشغال</th>
              <th style={{ padding: "0.75rem" }}>صحة الأصل</th>
              <th style={{ padding: "0.75rem" }}>الحالة</th>
              <th style={{ padding: "0.75rem" }}>الإجراءات الإدارية</th>
            </tr>
          </thead>
          <tbody>
            {filteredAssets.map(asset => (
              <tr key={asset.id} style={{ borderBottom: "1px solid #E2E8F0", transition: "background 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = "#F8FAFC"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                <td style={{ padding: "0.75rem" }}><code style={{ color: "#8561AD", fontWeight: "bold" }}>{asset.id}</code></td>
                <td style={{ padding: "0.75rem" }}><strong>{asset.name}</strong></td>
                <td style={{ padding: "0.75rem" }}>{asset.categoryAr}</td>
                <td style={{ padding: "0.75rem" }}>{asset.city}</td>
                <td style={{ padding: "0.75rem", fontWeight: "bold", color: "#1A1A2E" }}>{asset.valuation.toLocaleString()} ر.س</td>
                <td style={{ padding: "0.75rem" }}>{asset.occupancyRate > 0 ? `${asset.occupancyRate}٪` : "N/A"}</td>
                <td style={{ padding: "0.75rem" }}><span style={{ color: asset.complianceScore >= 95 ? "#10b981" : "#fbbf24", fontWeight: "bold" }}>{asset.complianceScore}٪</span></td>
                <td style={{ padding: "0.75rem" }}>
                  <span style={{
                    background: asset.status === "active" ? "rgba(16, 185, 129, 0.1)" : asset.status === "maintenance" ? "rgba(245, 158, 11, 0.1)" : "rgba(239, 68, 68, 0.1)",
                    color: asset.status === "active" ? "#10b981" : asset.status === "maintenance" ? "#f59e0b" : "#ef4444",
                    padding: "0.25rem 0.5rem",
                    borderRadius: "4px",
                    fontSize: "0.75rem",
                    fontWeight: "bold"
                  }}>
                    {asset.statusAr}
                  </span>
                </td>
                <td style={{ padding: "0.75rem" }}>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button onClick={() => handleLaunchMaintenance(asset.id)} style={{ padding: "0.35rem 0.7rem", background: "#F0E7FF", border: "1px solid #D8C3F5", borderRadius: "4px", color: "#58308F", cursor: "pointer", fontSize: "0.75rem", fontWeight: "bold" }}>🛠️ طلب صيانة</button>
                    <button onClick={() => alert(`تنزيل صك الملكية المشفر للأصل: ${asset.name}`)} style={{ padding: "0.35rem 0.7rem", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "4px", color: "#1A1A2E", cursor: "pointer", fontSize: "0.75rem" }}>📄 صك الملكية</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
