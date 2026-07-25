"use client";

import React, { useState } from "react";

interface Decision {
  id: string;
  meeting: string;
  type: string;
  description: string;
  reason: string;
  impactAnalysis: string;
  status: "Approved" | "Pending" | "Rejected";
}

export default function GovernancePage() {
  const [decisions] = useState<Decision[]>([
    {
      id: "DEC-872",
      meeting: "اجتماع مجلس النظارة الثاني لعام ٢٠٢٦",
      type: "بيع أصل (Asset Sale)",
      description: "بيع المبنى القديم في حي الروضة بالرياض وتسييل حصة العقار.",
      reason: "تراجع العائد الإيجاري للمبنى بنسبة ١٨٪ وارتفاع تكاليف صيانته الدورية.",
      impactAnalysis: "⚠️ سيؤثر هذا القرار على الإيرادات السنوية مؤقتاً بتراجع ١٢٪، وريادة التوزيع الإجمالية لمستفيدي الفئة ب (الطلاب) بنسبة ٨٪. متوافق مع شرط الواقف رقم ٤.",
      status: "Approved"
    },
    {
      id: "DEC-873",
      meeting: "اجتماع مجلس النظارة الثالث لعام ٢٠٢٦",
      type: "توزيع ريع (Yield Distribution)",
      description: "توزيع مبالغ الربع الثاني على الفئات المستحقة بقيمة ٤٥٠ ألف ريال.",
      reason: "توفر فوائض نقدية ناتجة عن عوائد محلات الخزامى الاستثمارية.",
      impactAnalysis: "✅ يغطي التوزيع ٨٥٪ من الاحتياجات التعليمية والطبية المستهدفة للمستفيدين هذا الربع. لا توجد مخاطر مالية أو قانونية.",
      status: "Approved"
    }
  ]);

  return (
    <div className="fade-in" style={{ padding: "2rem", color: "#1A1A2E", direction: "rtl", fontFamily: "Cairo, sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "700", color: "#1A1A2E" }}>محرك الحوكمة والقرارات المركزية (Governance & Decisions)</h1>
        <p style={{ color: "#64748B", marginTop: "0.25rem" }}>إدارة مجالس النظارة، جدول اللجان، وتوثيق سجل القرارات المعزز بالتحليل الذكي</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginBottom: "2rem" }}>
        {/* Governance Health KPI card */}
        <div style={{ background: "#ffffff", border: "1px solid #E4E7EF", borderRadius: "16px", padding: "1.5rem", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
          <h3 style={{ fontSize: "1.1rem", color: "#8561AD", fontWeight: "700", marginBottom: "1rem" }}>صحة الحوكمة العامة (Governance Health)</h3>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: "3rem", fontWeight: "800", color: "#10b981" }}>٩٥٪</div>
            <div style={{ fontSize: "0.85rem", color: "#64748B", width: "65%" }}>
              معدل حضور اجتماعات مجلس النظارة مكتمل بنسبة ٩٨٪. جميع القرارات موثقة ومربوطة بأصول وأوقاف نشطة. لا توجد تعارضات مصالح معلقة.
            </div>
          </div>
        </div>

        {/* Board & Committees card */}
        <div style={{ background: "#ffffff", border: "1px solid #E4E7EF", borderRadius: "16px", padding: "1.5rem", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
          <h3 style={{ fontSize: "1.1rem", color: "#8561AD", fontWeight: "700", marginBottom: "1rem" }}>لجان مجلس النظارة والاجتماعات المجدولة</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.85rem", color: "#1A1A2E" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid #E2E8F0" }}>
              <span>اللجنة الاستثمارية (Investment Committee)</span>
              <strong style={{ color: "#3b82f6" }}>٥ أعضاء</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid #E2E8F0" }}>
              <span>لجنة التدقيق الداخلي والالتزام</span>
              <strong style={{ color: "#10b981" }}>٣ أعضاء</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0" }}>
              <span>الاجتماع الدوري القادم لمجلس النظارة</span>
              <strong style={{ color: "#fbbf24" }}>الأسبوع القادم (١٤ يوليو)</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Decision Register */}
      <div style={{ background: "#ffffff", border: "1px solid #E4E7EF", borderRadius: "16px", padding: "1.5rem", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
        <h3 style={{ fontSize: "1.2rem", fontWeight: "600", marginBottom: "1rem", color: "#8561AD" }}>سجل القرارات المعتمدة والأثر التشغيلي (Decision Register & AI Impact)</h3>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem", textAlign: "right" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #E2E8F0", color: "#64748B" }}>
              <th style={{ padding: "0.75rem" }}>رمز القرار</th>
              <th style={{ padding: "0.75rem" }}>الاجتماع المرتبط</th>
              <th style={{ padding: "0.75rem" }}>النوع</th>
              <th style={{ padding: "0.75rem" }}>تفاصيل القرار والسبب</th>
              <th style={{ padding: "0.75rem" }}>التحليل الذكي للأثر (AI Analysis)</th>
              <th style={{ padding: "0.75rem" }}>الحالة</th>
            </tr>
          </thead>
          <tbody>
            {decisions.map((dec) => (
              <tr key={dec.id} style={{ borderBottom: "1px solid #E2E8F0", transition: "background 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = "#F8FAFC"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                <td style={{ padding: "0.75rem" }}><code style={{ color: "#8561AD", fontWeight: "bold" }}>{dec.id}</code></td>
                <td style={{ padding: "0.75rem", fontSize: "0.8rem", color: "#64748B" }}>{dec.meeting}</td>
                <td style={{ padding: "0.75rem" }}><span style={{ background: "#F0E7FF", color: "#58308F", padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.75rem", fontWeight: "bold" }}>{dec.type}</span></td>
                <td style={{ padding: "0.75rem", maxWidth: "250px", color: "#1A1A2E" }}>
                  <div>{dec.description}</div>
                  <div style={{ fontSize: "0.75rem", color: "#64748B", marginTop: "0.2rem" }}>السبب: {dec.reason}</div>
                </td>
                <td style={{ padding: "0.75rem", maxWidth: "300px" }}>
                  <div style={{ fontSize: "0.8rem", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "6px", padding: "0.5rem", color: "#1A1A2E", lineHeight: "1.4" }}>
                    {dec.impactAnalysis}
                  </div>
                </td>
                <td style={{ padding: "0.75rem" }}>
                  <span style={{
                    background: "rgba(16, 185, 129, 0.1)",
                    color: "#10b981",
                    padding: "0.25rem 0.5rem",
                    borderRadius: "4px",
                    fontSize: "0.75rem",
                    fontWeight: "bold"
                  }}>
                    معتمد
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
