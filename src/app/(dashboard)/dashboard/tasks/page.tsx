"use client";

import React, { useState } from "react";

interface Task {
  id: string;
  name: string;
  assignee: string;
  priority: string;
  dueDate: string;
  status: string;
}

export default function TasksPage() {
  const [tasks] = useState<Task[]>([
    { id: "1", name: "تدقيق صك ملكية أرض المدينة", assignee: "المستشار القانوني", priority: "عالية (Critical)", dueDate: "2026-07-15", status: "قيد العمل" },
    { id: "2", name: "رفع تقرير فحص التربة الزراعية", assignee: "المهندس الزراعي", priority: "متوسطة", dueDate: "2026-07-20", status: "معلقة" }
  ]);

  return (
    <div className="fade-in" style={{ padding: "2rem", color: "#1A1A2E", direction: "rtl", fontFamily: "Cairo, sans-serif" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "700", color: "#1A1A2E" }}>قائمة المهام التنفيذية (My Tasks)</h1>
        <p style={{ color: "#64748B", marginTop: "0.25rem" }}>تتبع وتحديث المهام والواجبات الموزعة على نظار الوقف والمهندسين وأعضاء الإدارة</p>
      </div>

      <div style={{ background: "#ffffff", border: "1px solid #E4E7EF", borderRadius: "12px", padding: "1.5rem", marginTop: "1rem", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "right", fontSize: "0.9rem" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #E2E8F0", color: "#64748B" }}>
              <th style={{ padding: "0.75rem" }}>اسم المهمة</th>
              <th style={{ padding: "0.75rem" }}>المسؤول عنها</th>
              <th style={{ padding: "0.75rem" }}>الأولوية</th>
              <th style={{ padding: "0.75rem" }}>تاريخ الاستحقاق</th>
              <th style={{ padding: "0.75rem" }}>الحالة</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(t => (
              <tr key={t.id} style={{ borderBottom: "1px solid #E2E8F0" }}>
                <td style={{ padding: "0.75rem" }}><strong>{t.name}</strong></td>
                <td style={{ padding: "0.75rem" }}>{t.assignee}</td>
                <td style={{ padding: "0.75rem", color: t.priority.includes("عالية") ? "#ef4444" : "#3b82f6", fontWeight: "bold" }}>{t.priority}</td>
                <td style={{ padding: "0.75rem" }}>{t.dueDate}</td>
                <td style={{ padding: "0.75rem" }}><span style={{ background: "#fef3c7", color: "#d97706", padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.75rem" }}>{t.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
