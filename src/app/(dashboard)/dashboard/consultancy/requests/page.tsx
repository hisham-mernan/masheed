"use client";

import React, { useState } from "react";

interface Request {
  id: string;
  expertName: string;
  waqfName: string;
  topic: string;
  date: string;
  status: "Under Review" | "Scheduled" | "Resolved";
}

export default function RequestsPage() {
  const [requests] = useState<Request[]>([
    { id: "REQ-01", expertName: "الشيخ د. عبدالرحمن المطلق", waqfName: "وقف برج الخزامى", topic: "صياغة وتفسير بند الصرف التعليمي", date: "2026-07-01", status: "Under Review" },
    { id: "REQ-02", expertName: "المستشار القانوني أحمد السديري", waqfName: "وقف العائلة المرموز", topic: "إضافة نظار جدد وتوزيع الصلاحيات", date: "2026-07-03", status: "Scheduled" }
  ]);

  return (
    <div className="fade-in" style={{ padding: "2rem", color: "#1A1A2E", direction: "rtl", fontFamily: "Cairo, sans-serif" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "700", color: "#1A1A2E" }}>طلبات الاستشارات النشطة (Consultation Requests)</h1>
        <p style={{ color: "#64748B", marginTop: "0.25rem" }}>متابعة طلبات المراجعة الفنية والقانونية والشرعية لأوقافك والاطلاع على التوصيات والتقارير</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>
        {/* Requests Table */}
        <div style={{ background: "#ffffff", border: "1px solid #E4E7EF", borderRadius: "16px", padding: "1.5rem", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: "600", marginBottom: "1rem", color: "#8561AD" }}>📋 سجل الطلبات الجارية</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "right", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #E2E8F0", color: "#64748B" }}>
                <th style={{ padding: "0.75rem" }}>رمز الطلب</th>
                <th style={{ padding: "0.75rem" }}>المستشار المستهدف</th>
                <th style={{ padding: "0.75rem" }}>الموضوع والأصل</th>
                <th style={{ padding: "0.75rem" }}>التاريخ</th>
                <th style={{ padding: "0.75rem" }}>حالة الطلب</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(req => (
                <tr key={req.id} style={{ borderBottom: "1px solid #E2E8F0" }}>
                  <td style={{ padding: "0.75rem" }}><code style={{ color: "#8561AD", fontWeight: "bold" }}>{req.id}</code></td>
                  <td style={{ padding: "0.75rem" }}><strong>{req.expertName}</strong></td>
                  <td style={{ padding: "0.75rem" }}>
                    <div>{req.topic}</div>
                    <div style={{ fontSize: "0.75rem", color: "#64748B" }}>الوقف: {req.waqfName}</div>
                  </td>
                  <td style={{ padding: "0.75rem" }}>{req.date}</td>
                  <td style={{ padding: "0.75rem" }}>
                    <span style={{
                      background: req.status === "Scheduled" ? "rgba(16, 185, 129, 0.1)" : "rgba(251, 191, 36, 0.1)",
                      color: req.status === "Scheduled" ? "#10b981" : "#f59e0b",
                      padding: "0.2rem 0.5rem",
                      borderRadius: "4px",
                      fontSize: "0.75rem",
                      fontWeight: "bold"
                    }}>
                      {req.status === "Scheduled" ? "مجدول للمقابلة" : "قيد الدراسة الفنية"}
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
            <h3 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "1rem", color: "#8561AD" }}>💡 توصيات المستشارين</h3>
            <div style={{ fontSize: "0.85rem", color: "#64748B", lineHeight: "1.6" }}>
              بمجرد اكتمال الجلسة الاستشارية، سيتم رفع التقرير النهائي للوثيقة وتوثيقه في ملف الحوكمة الخاص بالمنظمة للرجوع إليه مستقبلاً.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
