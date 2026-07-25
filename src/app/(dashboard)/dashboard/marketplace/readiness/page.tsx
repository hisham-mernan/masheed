"use client";

import React, { useState } from "react";

interface ChecklistItem {
  id: string;
  task: string;
  checked: boolean;
  score: number;
}

export default function ReadinessPage() {
  const [items, setItems] = useState<ChecklistItem[]>([
    { id: "1", task: "توثيق صك الوقف في وزارة الموارد البشرية والتنمية الاجتماعية", checked: true, score: 25 },
    { id: "2", task: "إعداد القوائم المالية المدققة للسنتين الماضيتين", checked: true, score: 25 },
    { id: "3", task: "تعيين مجلس نظارة سارٍ وغير متداخل المصالح", checked: true, score: 25 },
    { id: "4", task: "فحص وتقييم الحالة العقارية الفنية للأصول المستهدفة", checked: false, score: 25 }
  ]);

  const totalScore = items.reduce((sum, item) => sum + (item.checked ? item.score : 0), 0);

  const toggleCheck = (id: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, checked: !item.checked };
      }
      return item;
    }));
  };

  return (
    <div className="fade-in" style={{ padding: "2rem", color: "#1A1A2E", direction: "rtl", fontFamily: "Cairo, sans-serif" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "700", color: "#1A1A2E" }}>جاهزية طرح صكوك الوقف الاستثمارية (Listing Readiness Score)</h1>
        <p style={{ color: "#64748B", marginTop: "0.25rem" }}>فحص جاهزية أصولك قانونياً وحوكمياً ومالياً لطرحها في سوق أوقاف مشيد كفرص استثمارية للمساهمين</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1.2fr", gap: "2rem" }}>
        {/* Readiness Checklist */}
        <div style={{ background: "#ffffff", border: "1px solid #E4E7EF", borderRadius: "16px", padding: "1.5rem", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: "600", marginBottom: "1rem", color: "#8561AD" }}>📋 قائمة معايير التدقيق المالي والقانوني</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {items.map(item => (
              <div 
                key={item.id} 
                onClick={() => toggleCheck(item.id)}
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "1rem", 
                  padding: "1rem", 
                  background: item.checked ? "#F0E7FF" : "#F8FAFC", 
                  border: item.checked ? "1px solid #8561AD" : "1px solid #E2E8F0", 
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                <div style={{ width: "20px", height: "20px", borderRadius: "4px", border: "2px solid #8561AD", display: "flex", alignItems: "center", justifyContent: "center", background: item.checked ? "#8561AD" : "transparent", color: "#fff", fontWeight: "bold", fontSize: "0.75rem" }}>
                  {item.checked && "✓"}
                </div>
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: "0.95rem", color: "#1A1A2E" }}>{item.task}</strong>
                  <div style={{ fontSize: "0.75rem", color: "#64748B", marginTop: "0.15rem" }}>وزن التقييم: {item.score} نقاط الجاهزية</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Readiness Result */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          <div style={{ background: "#ffffff", border: "1px solid #E4E7EF", borderRadius: "16px", padding: "1.5rem", boxShadow: "0 4px 12px rgba(0,0,0,0.03)", textAlign: "center" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "1rem", color: "#8561AD" }}>مؤشر نقاط الجاهزية الكلية</h3>
            <div style={{ display: "inline-flex", width: "120px", height: "120px", borderRadius: "50%", background: totalScore >= 75 ? "rgba(16, 185, 129, 0.1)" : "rgba(251, 191, 36, 0.1)", border: `3px solid ${totalScore >= 75 ? "#10b981" : "#f59e0b"}`, alignItems: "center", justifyContent: "center", fontSize: "2rem", fontWeight: "bold", color: totalScore >= 75 ? "#10b981" : "#f59e0b", marginBottom: "1rem" }}>
              {totalScore}٪
            </div>
            <p style={{ fontSize: "0.85rem", color: "#64748B", lineHeight: "1.6" }}>
              {totalScore >= 100 
                ? "أصولك جاهزة تماماً للطرح الاستثماري وسحب الصكوك في سوق أوقاف مشيد." 
                : "يرجى استكمال بنود القائمة السابقة لتصل نقاط الجاهزية إلى ١٠٠٪ لبدء الطرح الفعلي."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
