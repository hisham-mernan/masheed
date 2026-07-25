"use client";

import React, { useState } from "react";

export default function ReportsPage() {
  return (
    <div className="fade-in" style={{ padding: "2rem", color: "#1A1A2E", direction: "rtl", fontFamily: "Cairo, sans-serif" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "700", color: "#1A1A2E" }}>محرك التقارير التنظيمية والمالية (Reports Center)</h1>
        <p style={{ color: "#64748B", marginTop: "0.25rem" }}>توليد وتصدير التقارير الإدارية والمالية والحوكمية لأوقافك بنقرة زر واحدة</p>
      </div>

      <div style={{ background: "#ffffff", border: "1px solid #E4E7EF", borderRadius: "12px", padding: "1.5rem", marginTop: "1rem", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
        <h4 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "1rem", color: "#8561AD" }}>🛠️ أدوات توليد التقارير المتاحة</h4>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
          <div style={{ padding: "1rem", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "8px" }}>
            <strong>📊 تقرير الغلة السنوي</strong>
            <p style={{ fontSize: "0.8rem", color: "#64748B", marginTop: "0.5rem" }}>ملخص كافة الإيرادات والتوزيعات والمصروفات للعام المالي الحالي.</p>
            <button onClick={() => alert("جاري تصدير تقرير الغلة...")} style={{ marginTop: "1rem", width: "100%", padding: "0.5rem", background: "#8561AD", color: "#fff", border: "none", borderRadius: "6px", fontSize: "0.8rem", cursor: "pointer" }}>تحميل PDF 📥</button>
          </div>
          <div style={{ padding: "1rem", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "8px" }}>
            <strong>📜 تقرير الحالة القانونية والامتثال</strong>
            <p style={{ fontSize: "0.8rem", color: "#64748B", marginTop: "0.5rem" }}>فحص الوثائق ومدى مطابقتها لمتطلبات هيئة الأوقاف.</p>
            <button onClick={() => alert("جاري تصدير تقرير الامتثال...")} style={{ marginTop: "1rem", width: "100%", padding: "0.5rem", background: "#8561AD", color: "#fff", border: "none", borderRadius: "6px", fontSize: "0.8rem", cursor: "pointer" }}>تحميل PDF 📥</button>
          </div>
          <div style={{ padding: "1rem", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "8px" }}>
            <strong>🏢 بيان أصول المحفظة العقارية</strong>
            <p style={{ fontSize: "0.8rem", color: "#64748B", marginTop: "0.5rem" }}>جرد كامل لكافة الأصول العقارية والزراعية والمالية وقيمها.</p>
            <button onClick={() => alert("جاري تصدير بيان الأصول...")} style={{ marginTop: "1rem", width: "100%", padding: "0.5rem", background: "#8561AD", color: "#fff", border: "none", borderRadius: "6px", fontSize: "0.8rem", cursor: "pointer" }}>تحميل PDF 📥</button>
          </div>
        </div>
      </div>
    </div>
  );
}
