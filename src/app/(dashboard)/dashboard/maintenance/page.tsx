"use client";

import React, { useState } from "react";

interface MaintenanceTask {
  id: string;
  assetName: string;
  category: "Preventive" | "Corrective" | "Emergency";
  categoryAr: string;
  description: string;
  cost: number;
  status: "جديد" | "قيد العمل" | "مكتمل";
}

export default function MaintenancePage() {
  const [tasks] = useState<MaintenanceTask[]>([
    { id: "MNT-402", assetName: "برج الخزامى السكني", category: "Emergency", categoryAr: "طارئ (Emergency)", description: "إصلاح عطل مفاجئ بالمصعد الرئيسي الثالث", cost: 12000, status: "قيد العمل" },
    { id: "MNT-403", assetName: "مزرعة النخيل التصديرية", category: "Preventive", categoryAr: "وقائي (Preventive)", description: "صيانة دورية لشبكات الري والتسميد التلقائي", cost: 8500, status: "جديد" },
    { id: "MNT-404", assetName: "مستودعات الخالدية اللوجستية", category: "Corrective", categoryAr: "علاجي (Corrective)", description: "إصلاح وتدعيم البوابة الكهربائية الجنوبية", cost: 4200, status: "مكتمل" }
  ]);

  return (
    <div className="fade-in" style={{ padding: "2rem", color: "#fff", direction: "rtl", fontFamily: "Cairo, sans-serif" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "700" }}>مركز الصيانة الذكي للأصول (Maintenance Center)</h1>
        <p style={{ opacity: 0.6, marginTop: "0.25rem" }}>تتبع طلبات الصيانة الدورية والعلاجية والطارئة للأصول العقارية والزراعية والمنقولة</p>
      </div>

      <div style={{ background: "rgba(20, 10, 35, 0.4)", border: "1px solid rgba(133, 97, 173, 0.2)", borderRadius: "16px", padding: "1.5rem", backdropFilter: "blur(12px)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "right", fontSize: "0.9rem" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}>
              <th style={{ padding: "0.75rem" }}>رقم الطلب</th>
              <th style={{ padding: "0.75rem" }}>الأصل المستهدف</th>
              <th style={{ padding: "0.75rem" }}>فئة الصيانة</th>
              <th style={{ padding: "0.75rem" }}>التفاصيل والإجراء</th>
              <th style={{ padding: "0.75rem" }}>التكلفة (ر.س)</th>
              <th style={{ padding: "0.75rem" }}>الحالة</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => (
              <tr key={task.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <td style={{ padding: "0.75rem" }}><code style={{ color: "#c4a8e0" }}>{task.id}</code></td>
                <td style={{ padding: "0.75rem" }}><strong>{task.assetName}</strong></td>
                <td style={{ padding: "0.75rem" }}>
                  <span style={{
                    color: task.category === "Emergency" ? "#ef4444" : task.category === "Preventive" ? "#3b82f6" : "#fbbf24",
                    fontWeight: "bold"
                  }}>
                    {task.categoryAr}
                  </span>
                </td>
                <td style={{ padding: "0.75rem" }}>{task.description}</td>
                <td style={{ padding: "0.75rem", fontWeight: "bold" }}>{task.cost.toLocaleString()} ر.س</td>
                <td style={{ padding: "0.75rem" }}>
                  <span style={{
                    background: task.status === "مكتمل" ? "rgba(16, 185, 129, 0.15)" : task.status === "قيد العمل" ? "rgba(251, 191, 36, 0.15)" : "rgba(255, 255, 255, 0.05)",
                    color: task.status === "مكتمل" ? "#34d399" : task.status === "قيد العمل" ? "#fbbf24" : "#fff",
                    padding: "0.2rem 0.5rem",
                    borderRadius: "4px",
                    fontSize: "0.75rem",
                    fontWeight: "bold"
                  }}>
                    {task.status}
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
