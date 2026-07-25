"use client";

import React, { useState } from "react";

export default function WorkspacePage() {
  return (
    <div className="fade-in" style={{ padding: "2rem", color: "#1A1A2E", direction: "rtl", fontFamily: "Cairo, sans-serif" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "700", color: "#1A1A2E" }}>مساحة العمل التعاونية (Collaborative Workspace)</h1>
        <p style={{ color: "#64748B", marginTop: "0.25rem" }}>إدارة مساحة العمل، مراجعة الإشعارات المعلقة، وتنسيق الأنشطة التنظيمية للأوقاف</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginTop: "1rem" }}>
        <div style={{ background: "#ffffff", border: "1px solid #E4E7EF", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
          <h4 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "1rem", color: "#8561AD" }}>📋 المهام النشطة المعلقة</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ padding: "0.75rem", background: "#F8FAFC", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
              <strong>مراجعة الميزانية السنوية لبرج الخزامى</strong>
              <p style={{ fontSize: "0.8rem", color: "#64748B", marginTop: "0.2rem" }}>الحالة: قيد المراجعة | المهندس عمر</p>
            </div>
            <div style={{ padding: "0.75rem", background: "#F8FAFC", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
              <strong>تحديث رصيد ريع الصكوك الصحية</strong>
              <p style={{ fontSize: "0.8rem", color: "#64748B", marginTop: "0.2rem" }}>الحالة: معلق موافقة النظارة | سارة العتيبي</p>
            </div>
          </div>
        </div>
        <div style={{ background: "#ffffff", border: "1px solid #E4E7EF", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
          <h4 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "1rem", color: "#8561AD" }}>📢 أحدث التعليقات والملخصات</h4>
          <p style={{ fontSize: "0.85rem", color: "#64748B", lineHeight: "1.6" }}>
            تم مراجعة تقرير الامتثال الفني المرفوع لفرصة النخيل الزراعية. ننتظر رفع التقرير الهندسي لتعديل نقاط الجاهزية إلى ١٠٠٪.
          </p>
        </div>
      </div>
    </div>
  );
}
