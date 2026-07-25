"use client";

import React, { useState } from "react";

interface Meeting {
  id: string;
  name: string;
  boardName: string;
  date: string;
  payoutStatus: string;
  status: string;
}

export default function MeetingsPage() {
  const [meetings] = useState<Meeting[]>([
    { id: "1", name: "الجمعية العمومية السنوية للشركاء", boardName: "مجلس النظارة الموحد", date: "2025-06-01", payoutStatus: "مكتملة (١٠٠٪)", status: "تم التوثيق" },
    { id: "2", name: "جلسة اعتماد ميزانية الصيانة الربعية", boardName: "لجنة الأصول والاستثمار", date: "2025-06-25", payoutStatus: "نشط (٧٥٪)", status: "قيد التصويت" }
  ]);

  return (
    <div className="fade-in" style={{ padding: "2rem", color: "#1A1A2E", direction: "rtl", fontFamily: "Cairo, sans-serif" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "700", color: "#1A1A2E" }}>إدارة اجتماعات لجان الحوكمة (Meetings Center)</h1>
        <p style={{ color: "#64748B", marginTop: "0.25rem" }}>توثيق محاضر الاجتماعات، التصويت على القرارات الاستراتيجية، وإصدار مسودات الاجتماع التلقائية بمساعدة الـ AI</p>
      </div>

      <div style={{ background: "#ffffff", border: "1px solid #E4E7EF", borderRadius: "12px", padding: "1.5rem", marginTop: "1rem", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
        <h4 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "1rem", color: "#8561AD" }}>📋 سجل اجتماعات مجلس النظارة</h4>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "right", fontSize: "0.9rem" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #E2E8F0", color: "#64748B" }}>
              <th style={{ padding: "0.75rem" }}>اسم الاجتماع</th>
              <th style={{ padding: "0.75rem" }}>اللجنة / المجلس</th>
              <th style={{ padding: "0.75rem" }}>تاريخ الانعقاد</th>
              <th style={{ padding: "0.75rem" }}>معدل التصويت</th>
              <th style={{ padding: "0.75rem" }}>الحالة</th>
            </tr>
          </thead>
          <tbody>
            {meetings.map(meeting => (
              <tr key={meeting.id} style={{ borderBottom: "1px solid #E2E8F0" }}>
                <td style={{ padding: "0.75rem" }}><strong>{meeting.name}</strong></td>
                <td style={{ padding: "0.75rem" }}>{meeting.boardName}</td>
                <td style={{ padding: "0.75rem" }}>{meeting.date}</td>
                <td style={{ padding: "0.75rem", color: "#10b981", fontWeight: "bold" }}>{meeting.payoutStatus}</td>
                <td style={{ padding: "0.75rem" }}><span style={{ background: "#d1fae5", color: "#065f46", padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.75rem" }}>{meeting.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
