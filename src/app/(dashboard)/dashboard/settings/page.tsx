"use client";

import React, { useState } from "react";

export default function SettingsPage() {
  return (
    <div className="fade-in" style={{ padding: "2rem", color: "#1A1A2E", direction: "rtl", fontFamily: "Cairo, sans-serif" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "700", color: "#1A1A2E" }}>إعدادات المنصة (System Settings)</h1>
        <p style={{ color: "#64748B", marginTop: "0.25rem" }}>تعديل الإعدادات العامة لجهة الوقف، الصلاحيات الممنوحة للأعضاء، وإعدادات الربط التقني</p>
      </div>

      <div style={{ background: "#ffffff", border: "1px solid #E4E7EF", borderRadius: "12px", padding: "1.5rem", marginTop: "1rem", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
        <h4 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "1.5rem", color: "#8561AD" }}>⚙️ تهيئة إعدادات النظام التشغيلية</h4>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "500px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", color: "#1A1A2E", marginBottom: "0.25rem", fontWeight: "bold" }}>العملة الرئيسية للتعاملات المالية:</label>
            <select style={{ width: "100%", padding: "0.6rem", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "6px", fontSize: "0.85rem", color: "#1A1A2E" }}>
              <option value="SAR">ريال سعودي (SAR)</option>
              <option value="USD">دولار أمريكي (USD)</option>
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", color: "#1A1A2E", marginBottom: "0.25rem", fontWeight: "bold" }}>لغة واجهة النظام الافتراضية:</label>
            <select style={{ width: "100%", padding: "0.6rem", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "6px", fontSize: "0.85rem", color: "#1A1A2E" }}>
              <option value="ar">العربية</option>
              <option value="en">English</option>
            </select>
          </div>
          <button onClick={() => alert("تم حفظ الإعدادات بنجاح")} style={{ padding: "0.7rem", background: "#8561AD", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", marginTop: "1rem" }}>حفظ الإعدادات</button>
        </div>
      </div>
    </div>
  );
}
