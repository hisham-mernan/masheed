"use client";

import React, { useState } from "react";

export default function AnalyticsPage() {
  return (
    <div className="fade-in" style={{ padding: "2rem", color: "#1A1A2E", direction: "rtl", fontFamily: "Cairo, sans-serif" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "700", color: "#1A1A2E" }}>لوحة التحليلات والإحصائيات الكلية (Analytics Dashboard)</h1>
        <p style={{ color: "#64748B", marginTop: "0.25rem" }}>عرض مؤشرات الأداء المالي، تطور قيم الأصول، ومستويات كفاءة التشغيل بنظام مشيد</p>
      </div>

      <div style={{ background: "#ffffff", border: "1px solid #E4E7EF", borderRadius: "12px", padding: "1.5rem", marginTop: "1rem", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
        <h4 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "1rem", color: "#8561AD" }}>📊 لوحة البيانات التشغيلية والمالية</h4>
        <div style={{ height: "250px", display: "flex", alignItems: "center", justifyContent: "center", background: "#F8FAFC", border: "1px dashed #C8CCDB", borderRadius: "8px", color: "#64748B", marginTop: "1rem" }}>
          رسم بياني يوضح تطور العوائد ونمو الأصول الوقفية للربع الحالي
        </div>
      </div>
    </div>
  );
}
