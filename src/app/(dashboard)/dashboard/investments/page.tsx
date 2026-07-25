"use client";

import React, { useState } from "react";

interface Investment {
  id: string;
  name: string;
  type: string;
  valuation: number;
  expectedReturn: number;
  riskLevel: "منخفض" | "متوسط" | "مرتفع";
  status: string;
}

export default function InvestmentsPage() {
  const [investments] = useState<Investment[]>([
    { id: "INV-201", name: "صندوق الإنماء العقاري المرموز", type: "صناديق استثمارية", valuation: 5000000, expectedReturn: 8.2, riskLevel: "منخفض", status: "نشط" },
    { id: "INV-202", name: "صكوك الشركة السعودية للكهرباء", type: "صكوك دين", valuation: 3000000, expectedReturn: 6.8, riskLevel: "منخفض", status: "نشط" },
    { id: "INV-203", name: "محفظة الأسهم المحلية المتوافقة مع الشريعة", type: "أسهم عامة", valuation: 4500000, expectedReturn: 11.5, riskLevel: "متوسط", status: "نشط" }
  ]);

  return (
    <div className="fade-in" style={{ padding: "2rem", color: "#fff", direction: "rtl", fontFamily: "Cairo, sans-serif" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "700" }}>إدارة محافظ الاستثمار الوقفية (Investment Portfolio)</h1>
        <p style={{ opacity: 0.6, marginTop: "0.25rem" }}>استعراض وإدارة المحافظ والصكوك والأدوات المالية المستثمرة لتعظيم ريع الأوقاف</p>
      </div>

      <div style={{ background: "rgba(20, 10, 35, 0.4)", border: "1px solid rgba(133, 97, 173, 0.2)", borderRadius: "16px", padding: "1.5rem", backdropFilter: "blur(12px)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "right", fontSize: "0.9rem" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}>
              <th style={{ padding: "0.75rem" }}>رمز الاستثمار</th>
              <th style={{ padding: "0.75rem" }}>اسم المحفظة / الأداة</th>
              <th style={{ padding: "0.75rem" }}>التصنيف</th>
              <th style={{ padding: "0.75rem" }}>القيمة الحالية</th>
              <th style={{ padding: "0.75rem" }}>العائد المتوقع</th>
              <th style={{ padding: "0.75rem" }}>مستوى المخاطر</th>
              <th style={{ padding: "0.75rem" }}>الحالة</th>
            </tr>
          </thead>
          <tbody>
            {investments.map(inv => (
              <tr key={inv.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <td style={{ padding: "0.75rem" }}><code style={{ color: "#c4a8e0" }}>{inv.id}</code></td>
                <td style={{ padding: "0.75rem" }}><strong>{inv.name}</strong></td>
                <td style={{ padding: "0.75rem" }}>{inv.type}</td>
                <td style={{ padding: "0.75rem", fontWeight: "bold" }}>{inv.valuation.toLocaleString()} ر.س</td>
                <td style={{ padding: "0.75rem", color: "#10b981", fontWeight: "bold" }}>{inv.expectedReturn}٪ سنوي</td>
                <td style={{ padding: "0.75rem" }}>
                  <span style={{
                    color: inv.riskLevel === "منخفض" ? "#10b981" : "#fbbf24",
                    fontWeight: "bold"
                  }}>
                    {inv.riskLevel}
                  </span>
                </td>
                <td style={{ padding: "0.75rem" }}>
                  <span style={{ background: "rgba(16, 185, 129, 0.15)", color: "#34d399", padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.75rem", fontWeight: "bold" }}>
                    {inv.status}
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
