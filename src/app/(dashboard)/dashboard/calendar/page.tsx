"use client";

import React, { useState } from "react";

export default function CalendarPage() {
  return (
    <div className="fade-in" style={{ padding: "2rem", color: "#1A1A2E", direction: "rtl", fontFamily: "Cairo, sans-serif" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "700", color: "#1A1A2E" }}>جدول المواعيد التنظيمية (Calendar)</h1>
        <p style={{ color: "#64748B", marginTop: "0.25rem" }}>عرض وجدولة اجتماعات مجلس النظارة، جلسات التدقيق، وزيارات الصيانة الميدانية للأصول</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "1.5rem", marginTop: "1rem" }}>
        <div style={{ background: "#ffffff", border: "1px solid #E4E7EF", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
          <h4 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "1rem", color: "#8561AD" }}>📅 التقويم الأسبوعي للأنشطة</h4>
          <div style={{ height: "300px", display: "flex", alignItems: "center", justifyContent: "center", background: "#F8FAFC", border: "1px dashed #C8CCDB", borderRadius: "8px", color: "#64748B" }}>
             عرض خريطة مواعيد أوقاف هذا الشهر التفاعلية
          </div>
        </div>
        <div style={{ background: "#ffffff", border: "1px solid #E4E7EF", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
          <h4 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "1rem", color: "#8561AD" }}>📆 الاجتماعات القادمة هذا الأسبوع</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.85rem" }}>
            <div style={{ padding: "0.75rem", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "6px" }}>
              <strong>اجتماع مجلس النظارة الطارئ</strong>
              <p style={{ color: "#64748B", marginTop: "0.25rem" }}>الأربعاء القادم - ١٠:٠٠ ص</p>
            </div>
            <div style={{ padding: "0.75rem", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "6px" }}>
              <strong>مراجعة ترخيص وقف النخيل</strong>
              <p style={{ color: "#64748B", marginTop: "0.25rem" }}>الخميس القادم - ٠١:٣٠ م</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
