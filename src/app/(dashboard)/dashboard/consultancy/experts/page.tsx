"use client";

import React, { useState } from "react";

interface Expert {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  available: boolean;
}

export default function ExpertsPage() {
  const [experts] = useState<Expert[]>([
    { id: "EXP-1", name: "الشيخ د. عبدالرحمن المطلق", specialty: "صياغة وتوثيق صكوك الأوقاف والوصايا", rating: 4.9, available: true },
    { id: "EXP-2", name: "المستشار القانوني أحمد السديري", specialty: "حوكمة مجالس النظارة واللوائح التشغيلية", rating: 4.8, available: true },
    { id: "EXP-3", name: "المهندس خالد الغامدي", specialty: "التقييم الفني العقاري وإدارة المشاريع الإنشائية", rating: 4.7, available: false }
  ]);

  return (
    <div className="fade-in" style={{ padding: "2rem", color: "#1A1A2E", direction: "rtl", fontFamily: "Cairo, sans-serif" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "700", color: "#1A1A2E" }}>مستشارو حوكمة وإعمار الأوقاف (Waqf Experts)</h1>
        <p style={{ color: "#64748B", marginTop: "0.25rem" }}>تصفح وتواصل مع الخبراء والعلماء المعتمدين في صياغة الشروط وتأسيس الأوقاف وحوكمة مجالس النظارة</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>
        {/* Experts List */}
        <div style={{ background: "#ffffff", border: "1px solid #E4E7EF", borderRadius: "16px", padding: "1.5rem", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: "600", marginBottom: "1rem", color: "#8561AD" }}>🎓 المستشارون والخبراء المتاحون</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {experts.map(exp => (
              <div key={exp.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "8px" }}>
                <div>
                  <h4 style={{ fontSize: "1.05rem", fontWeight: "700", color: "#1A1A2E" }}>{exp.name}</h4>
                  <span style={{ fontSize: "0.8rem", color: "#64748B" }}>التخصص الأساسي: {exp.specialty}</span>
                </div>
                <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "0.75rem", color: "#64748B" }}>تقييم المستفيدين</div>
                    <div style={{ fontSize: "0.9rem", fontWeight: "bold", color: "#fbbf24" }}>⭐ {exp.rating}</div>
                  </div>
                  <span style={{
                    background: exp.available ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                    color: exp.available ? "#10b981" : "#ef4444",
                    padding: "0.25rem 0.5rem",
                    borderRadius: "4px",
                    fontSize: "0.75rem",
                    fontWeight: "bold"
                  }}>
                    {exp.available ? "متاح للاستشارة" : "مشغول حالياً"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Info */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          <div style={{ background: "#ffffff", border: "1px solid #E4E7EF", borderRadius: "16px", padding: "1.5rem", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "1rem", color: "#8561AD" }}>💡 استشارات شرعية وقانونية</h3>
            <div style={{ fontSize: "0.85rem", color: "#64748B", lineHeight: "1.6" }}>
              يمكنك حجز مكالمة فورية أو اجتماع مراجعة صك عبر المنصة ليقوم الخبير بفحص اللوائح التنظيمية والتأكد من مطابقتها لهيئة الأوقاف.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
