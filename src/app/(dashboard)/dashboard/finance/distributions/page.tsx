"use client";

import React, { useState } from "react";

interface Distribution {
  id: string;
  waqfName: string;
  totalAmount: number;
  date: string;
  beneficiariesCount: number;
  status: "Completed" | "Pending";
}

export default function DistributionsPage() {
  const [distributions] = useState<Distribution[]>([
    { id: "DST-301", waqfName: "وقف برج الخزامى الخيرى", totalAmount: 300000, date: "2026-07-01", beneficiariesCount: 2, status: "Completed" },
    { id: "DST-302", waqfName: "وقف العائلة المرموز (الأهلي)", totalAmount: 150000, date: "2026-07-03", beneficiariesCount: 3, status: "Completed" },
    { id: "DST-303", waqfName: "مزرعة النخيل المشتركة", totalAmount: 60000, date: "2026-07-05", beneficiariesCount: 4, status: "Pending" }
  ]);

  return (
    <div className="fade-in" style={{ padding: "2rem", color: "#1A1A2E", direction: "rtl", fontFamily: "Cairo, sans-serif" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "700", color: "#1A1A2E" }}>توزيع الغلة والريع للمستفيدين (Yield Distribution Ledger)</h1>
        <p style={{ color: "#64748B", marginTop: "0.25rem" }}>إثبات وتوثيق حصص التوزيع وصرف ريع الغلال للمستحقين من الأيتام، الجهات الخيرية، والورثة</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>
        {/* Distributions Table */}
        <div style={{ background: "#ffffff", border: "1px solid #E4E7EF", borderRadius: "16px", padding: "1.5rem", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: "600", marginBottom: "1rem", color: "#8561AD" }}>📋 سجل توزيعات الريع الدورية (Distribution Record)</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "right", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #E2E8F0", color: "#64748B" }}>
                <th style={{ padding: "0.75rem" }}>رقم القيد</th>
                <th style={{ padding: "0.75rem" }}>الكيان الوقفي والتاريخ</th>
                <th style={{ padding: "0.75rem" }}>المستفيدين المستحقين</th>
                <th style={{ padding: "0.75rem" }}>إجمالي مبلغ الصرف</th>
                <th style={{ padding: "0.75rem" }}>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {distributions.map(d => (
                <tr key={d.id} style={{ borderBottom: "1px solid #E2E8F0" }}>
                  <td style={{ padding: "0.75rem" }}><code style={{ color: "#8561AD", fontWeight: "bold" }}>{d.id}</code></td>
                  <td style={{ padding: "0.75rem" }}>
                    <div><strong>{d.waqfName}</strong></div>
                    <div style={{ fontSize: "0.75rem", color: "#64748B" }}>التاريخ: {d.date}</div>
                  </td>
                  <td style={{ padding: "0.75rem" }}>{d.beneficiariesCount} جهات مستحقة</td>
                  <td style={{ padding: "0.75rem", fontWeight: "bold", color: "#3B82F6" }}>{d.totalAmount.toLocaleString()} ر.س</td>
                  <td style={{ padding: "0.75rem" }}>
                    <span style={{
                      background: d.status === "Completed" ? "rgba(16, 185, 129, 0.1)" : "rgba(251, 191, 36, 0.1)",
                      color: d.status === "Completed" ? "#10b981" : "#f59e0b",
                      padding: "0.2rem 0.5rem",
                      borderRadius: "4px",
                      fontSize: "0.75rem",
                      fontWeight: "bold"
                    }}>
                      {d.status === "Completed" ? "تم الصرف والمطابقة" : "قيد التجهيز"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sidebar Info */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          <div style={{ background: "#ffffff", border: "1px solid #E4E7EF", borderRadius: "16px", padding: "1.5rem", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "1rem", color: "#8561AD" }}>💡 تحليلات الصرف الرقمي</h3>
            <div style={{ fontSize: "0.85rem", color: "#64748B", lineHeight: "1.6" }}>
              عند إتمام التوزيع، يقوم النظام بترحيل القيود المحاسبية للمحافظ الرقمية للمستفيدين المسجلين، ويتم جدولة التوزيع في فتراته السنوية أو الربعية آلياً.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
