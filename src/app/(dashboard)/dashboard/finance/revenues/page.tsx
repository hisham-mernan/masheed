"use client";

import React, { useState } from "react";

interface Revenue {
  id: string;
  source: string;
  amount: number;
  waqfName: string;
  assetName: string;
  date: string;
  type: string;
}

export default function RevenuesPage() {
  const [revenues] = useState<Revenue[]>([
    { id: "REV-701", source: "عقود إيجار سنوية", amount: 750000, waqfName: "وقف برج الخزامى", assetName: "برج الخزامى السكني", date: "2026-07-01", type: "إيجار عقاري" },
    { id: "REV-702", source: "عوائد صكوك دورية", amount: 80000, waqfName: "وقف العائلة المرموز", assetName: "محفظة صكوك بنك الإنماء", date: "2026-07-03", type: "عوائد استثمارية" },
    { id: "REV-703", source: "مبيعات تمور موسمية", amount: 45000, waqfName: "مزرعة النخيل المشتركة", assetName: "مزرعة النخيل التصديرية", date: "2026-07-05", type: "إنتاج زراعي" }
  ]);

  return (
    <div className="fade-in" style={{ padding: "2rem", color: "#1A1A2E", direction: "rtl", fontFamily: "Cairo, sans-serif" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "700", color: "#1A1A2E" }}>إدارة الإيرادات والريع (Revenue Management)</h1>
        <p style={{ color: "#64748B", marginTop: "0.25rem" }}>تتبع عوائد ريع الأوقاف العقارية، الزراعية، والمالية وتسجيل مصادر الدخل المعتمدة</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>
        {/* Revenues Table */}
        <div style={{ background: "#ffffff", border: "1px solid #E4E7EF", borderRadius: "16px", padding: "1.5rem", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: "600", marginBottom: "1rem", color: "#8561AD" }}>📋 سجل تحصيل الإيرادات (Revenue Registry)</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "right", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #E2E8F0", color: "#64748B" }}>
                <th style={{ padding: "0.75rem" }}>المعرف</th>
                <th style={{ padding: "0.75rem" }}>مصدر الدخل والنوع</th>
                <th style={{ padding: "0.75rem" }}>الأصل المستهدف</th>
                <th style={{ padding: "0.75rem" }}>التاريخ</th>
                <th style={{ padding: "0.75rem" }}>القيمة المحصلة</th>
              </tr>
            </thead>
            <tbody>
              {revenues.map(rev => (
                <tr key={rev.id} style={{ borderBottom: "1px solid #E2E8F0" }}>
                  <td style={{ padding: "0.75rem" }}><code style={{ color: "#8561AD", fontWeight: "bold" }}>{rev.id}</code></td>
                  <td style={{ padding: "0.75rem" }}>
                    <div><strong>{rev.source}</strong></div>
                    <div style={{ fontSize: "0.75rem", color: "#64748B" }}>التصنيف: {rev.type}</div>
                  </td>
                  <td style={{ padding: "0.75rem" }}>{rev.assetName}</td>
                  <td style={{ padding: "0.75rem" }}>{rev.date}</td>
                  <td style={{ padding: "0.75rem", fontWeight: "bold", color: "#10B981" }}>+{rev.amount.toLocaleString()} ر.س</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sidebar Info */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          <div style={{ background: "#ffffff", border: "1px solid #E4E7EF", borderRadius: "16px", padding: "1.5rem", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "1rem", color: "#8561AD" }}>💡 تحليلات ريع أوقافك</h3>
            <div style={{ fontSize: "0.85rem", color: "#64748B", lineHeight: "1.6" }}>
              يتم تقسيم الإيرادات المحصلة تلقائياً بناءً على شروط الواقف إلى حصة الصيانة والتطوير (الريع المحتجز) وحصة المستفيدين الجاهزة للصرف (الغلّة الموزعة).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
