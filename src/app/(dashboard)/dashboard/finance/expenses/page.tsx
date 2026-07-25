"use client";

import React, { useState } from "react";

interface Expense {
  id: string;
  category: string;
  vendor: string;
  amount: number;
  waqfName: string;
  assetName: string;
  date: string;
  status: "Approved" | "Pending" | "Rejected";
}

export default function ExpensesPage() {
  const [expenses] = useState<Expense[]>([
    { id: "EXP-801", category: "صيانة وتشغيل", vendor: "شركة المقاولات الوطنية", amount: 45000, waqfName: "وقف برج الخزامى", assetName: "برج الخزامى السكني", date: "2026-07-01", status: "Approved" },
    { id: "EXP-802", category: "مرافق وخدمات (كهرباء)", vendor: "الشركة السعودية الكهربائية", amount: 12400, waqfName: "وقف برج الخزامى", assetName: "برج الخزامى السكني", date: "2026-07-03", status: "Approved" },
    { id: "EXP-803", category: "رسوم تأمين ورخص", vendor: "التعاونية للتأمين", amount: 8500, waqfName: "مزرعة النخيل المشتركة", assetName: "مزرعة النخيل التصديرية", date: "2026-07-05", status: "Pending" }
  ]);

  return (
    <div className="fade-in" style={{ padding: "2rem", color: "#1A1A2E", direction: "rtl", fontFamily: "Cairo, sans-serif" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "700", color: "#1A1A2E" }}>إدارة المصروفات والتكاليف (Expense Management)</h1>
        <p style={{ color: "#64748B", marginTop: "0.25rem" }}>تسجيل وتتبع مصروفات التشغيل، فواتير الصيانة، وضوابط الصرف الشرعية والامتثال</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>
        {/* Expenses List */}
        <div style={{ background: "#ffffff", border: "1px solid #E4E7EF", borderRadius: "16px", padding: "1.5rem", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: "600", marginBottom: "1rem", color: "#8561AD" }}>📋 سجل المصروفات الفعال (Expense Ledger)</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "right", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #E2E8F0", color: "#64748B" }}>
                <th style={{ padding: "0.75rem" }}>المعرف</th>
                <th style={{ padding: "0.75rem" }}>الفئة والبيان</th>
                <th style={{ padding: "0.75rem" }}>المستفيد / المورد</th>
                <th style={{ padding: "0.75rem" }}>الأصل المستهدف</th>
                <th style={{ padding: "0.75rem" }}>المبلغ</th>
                <th style={{ padding: "0.75rem" }}>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map(exp => (
                <tr key={exp.id} style={{ borderBottom: "1px solid #E2E8F0" }}>
                  <td style={{ padding: "0.75rem" }}><code style={{ color: "#8561AD", fontWeight: "bold" }}>{exp.id}</code></td>
                  <td style={{ padding: "0.75rem" }}>
                    <div><strong>{exp.category}</strong></div>
                    <div style={{ fontSize: "0.75rem", color: "#64748B" }}>التاريخ: {exp.date}</div>
                  </td>
                  <td style={{ padding: "0.75rem" }}>{exp.vendor}</td>
                  <td style={{ padding: "0.75rem" }}>{exp.assetName}</td>
                  <td style={{ padding: "0.75rem", fontWeight: "bold", color: "#ef4444" }}>-{exp.amount.toLocaleString()} ر.س</td>
                  <td style={{ padding: "0.75rem" }}>
                    <span style={{
                      background: exp.status === "Approved" ? "rgba(16, 185, 129, 0.1)" : "rgba(251, 191, 36, 0.1)",
                      color: exp.status === "Approved" ? "#10b981" : "#f59e0b",
                      padding: "0.2rem 0.5rem",
                      borderRadius: "4px",
                      fontSize: "0.75rem",
                      fontWeight: "bold"
                    }}>
                      {exp.status === "Approved" ? "معتمد وصرف" : "قيد المراجعة"}
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
            <h3 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "1rem", color: "#8561AD" }}>💡 امتثال المصاريف للشروط</h3>
            <div style={{ fontSize: "0.85rem", color: "#64748B", lineHeight: "1.6" }}>
              يتم فلترة وفحص كل فاتورة ترفع للنظام للتأكد من موافقتها لشروط الصرف المحددة في صك الوقف، ومطابقتها للميزانية التقديرية المعتمدة للربع الحالي.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
