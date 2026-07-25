"use client";

import React, { useState } from "react";

export default function WorkflowsPage() {
  return (
    <div className="fade-in" style={{ padding: "2rem", color: "#1A1A2E", direction: "rtl", fontFamily: "Cairo, sans-serif" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "700", color: "#1A1A2E" }}>محرك تدفقات العمل والاعتمادات (Workflow Engine)</h1>
        <p style={{ color: "#64748B", marginTop: "0.25rem" }}>تصميم وإدارة تدفقات الموافقات والمهام لكل أصل ووقف، وتحديد معايير الصلاحيات المعتمدة</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "1.5rem", marginTop: "1rem" }}>
        <div style={{ background: "#ffffff", border: "1px solid #E4E7EF", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
          <h4 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "1rem", color: "#8561AD" }}>⚙️ تدفق عمل الموافقة على الميزانية النشط</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", padding: "1rem", background: "#F8FAFC", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.25rem" }}>
                <span>المرحلة الأولى: إعداد مقترح الميزانية</span>
                <span style={{ color: "#10b981", fontWeight: "bold" }}>مكتملة ✓</span>
              </div>
              <p style={{ fontSize: "0.75rem", color: "#64748B" }}>بواسطة: محاسب الوقف الرئيسي</p>
            </div>
            <div style={{ borderLeft: "2px dashed #8561AD", paddingLeft: "1rem", marginLeft: "5px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.25rem" }}>
                <span>المرحلة الثانية: المراجعة المالية والجدوى</span>
                <span style={{ color: "#fbbf24", fontWeight: "bold" }}>قيد العمل...</span>
              </div>
              <p style={{ fontSize: "0.75rem", color: "#64748B" }}>المسؤول: مدير الأصول والاستثمار</p>
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", opacity: 0.5 }}>
                <span>المرحلة الثالثة: الاعتماد والتوثيق القانوني</span>
                <span>معلق</span>
              </div>
              <p style={{ fontSize: "0.75rem", color: "#64748B", opacity: 0.5 }}>الجهة: مجلس النظارة</p>
            </div>
          </div>
        </div>
        <div style={{ background: "#ffffff", border: "1px solid #E4E7EF", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
          <h4 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "1rem", color: "#8561AD" }}>💡 قوالب تدفق العمل الافتراضية (SOP Templates)</h4>
          <p style={{ fontSize: "0.85rem", color: "#64748B", marginBottom: "1rem" }}>يمكنك تفعيل أحد القوالب الجاهزة للتشغيل المباشر:</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <button style={{ padding: "0.75rem", background: "#F0E7FF", color: "#58308F", border: "none", borderRadius: "8px", textAlign: "right", fontSize: "0.85rem", fontWeight: "bold", cursor: "pointer" }}>
              📁 قالب إدراج أصل عقاري جديد
            </button>
            <button style={{ padding: "0.75rem", background: "#F8FAFC", color: "#1A1A2E", border: "1px solid #E2E8F0", borderRadius: "8px", textAlign: "right", fontSize: "0.85rem", cursor: "pointer" }}>
              📁 قالب مراجعة طلب الصرف للمستفيدين
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
