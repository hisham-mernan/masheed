"use client";

import React, { useState } from "react";

interface Budget {
  id: string;
  name: string;
  allocatedAmount: number;
  spentAmount: number;
  waqfName: string;
  period: string;
}

export default function BudgetsPage() {
  const [budgets] = useState<Budget[]>([
    { id: "BGT-201", name: "ميزانية الصيانة العامة وتشغيل البرج", allocatedAmount: 200000, spentAmount: 45000, waqfName: "وقف برج الخزامى", period: "الربع الثالث ٢٠٢٦" },
    { id: "BGT-202", name: "ميزانية الرعاية والمنح الصحية والمساعدات", allocatedAmount: 350000, spentAmount: 180000, waqfName: "وقف البر والخيرات", period: "الربع الثالث ٢٠٢٦" },
    { id: "BGT-203", name: "ميزانية تطوير البنية التحتية والزراعية", allocatedAmount: 100000, spentAmount: 12400, waqfName: "مزرعة النخيل المشتركة", period: "الربع الثالث ٢٠٢٦" }
  ]);

  return (
    <div className="fade-in" style={{ padding: "2rem", color: "#1A1A2E", direction: "rtl", fontFamily: "Cairo, sans-serif" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "700", color: "#1A1A2E" }}>الميزانيات والخطط التقديرية (Budget Management)</h1>
        <p style={{ color: "#64748B", marginTop: "0.25rem" }}>تحديد وإقرار الميزانيات التشغيلية للأوقاف وربطها ببنود الصرف والأنشطة المختلفة</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>
        {/* Budgets Table */}
        <div style={{ background: "#ffffff", border: "1px solid #E4E7EF", borderRadius: "16px", padding: "1.5rem", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: "600", marginBottom: "1rem", color: "#8561AD" }}>📋 سجل الميزانيات المعتمدة (Approved Budgets)</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "right", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #E2E8F0", color: "#64748B" }}>
                <th style={{ padding: "0.75rem" }}>رقم البند</th>
                <th style={{ padding: "0.75rem" }}>البند المالي والفترة</th>
                <th style={{ padding: "0.75rem" }}>المبلغ المعتمد</th>
                <th style={{ padding: "0.75rem" }}>المصروف الفعلي</th>
                <th style={{ padding: "0.75rem" }}>النسبة المستهلكة</th>
              </tr>
            </thead>
            <tbody>
              {budgets.map(b => {
                const percent = Math.round((b.spentAmount / b.allocatedAmount) * 100);
                return (
                  <tr key={b.id} style={{ borderBottom: "1px solid #E2E8F0" }}>
                    <td style={{ padding: "0.75rem" }}><code style={{ color: "#8561AD", fontWeight: "bold" }}>{b.id}</code></td>
                    <td style={{ padding: "0.75rem" }}>
                      <div><strong>{b.name}</strong></div>
                      <div style={{ fontSize: "0.75rem", color: "#64748B" }}>الوقف: {b.waqfName} | {b.period}</div>
                    </td>
                    <td style={{ padding: "0.75rem", fontWeight: "bold" }}>{b.allocatedAmount.toLocaleString()} ر.س</td>
                    <td style={{ padding: "0.75rem", color: "#ef4444" }}>{b.spentAmount.toLocaleString()} ر.س</td>
                    <td style={{ padding: "0.75rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <div style={{ width: "80px", height: "6px", background: "#F1F5F9", borderRadius: "3px" }}>
                          <div style={{ width: `${percent}%`, height: "100%", background: percent > 85 ? "#ef4444" : "#8561AD", borderRadius: "3px" }} />
                        </div>
                        <span>{percent}٪</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Sidebar Info */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          <div style={{ background: "#ffffff", border: "1px solid #E4E7EF", borderRadius: "16px", padding: "1.5rem", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "1rem", color: "#8561AD" }}>💡 حوكمة الصرف المالي</h3>
            <div style={{ fontSize: "0.85rem", color: "#64748B", lineHeight: "1.6" }}>
              نظام مشيد يمنع آلياً تجاوز البنود المالية المعتمدة لأي عملية صرف، ويصدر تنبيهات حوكمة فورية في حال اقتراب نسبة استهلاك الميزانية من الحدود المحددة.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
