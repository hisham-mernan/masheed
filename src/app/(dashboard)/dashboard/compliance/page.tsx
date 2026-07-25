"use client";

import React, { useState } from "react";

interface Rule {
  id: string;
  name: string;
  frequency: string;
  appliesTo: string;
  responsible: string;
  deadline: string;
  penalty: string;
  status: "Active" | "Pending" | "Overdue";
}

interface Violation {
  id: string;
  ruleName: string;
  severity: "High" | "Medium" | "Low";
  detectedDate: string;
  status: "Open" | "Resolved";
  description: string;
}

export default function CompliancePage() {
  const [rules] = useState<Rule[]>([
    { id: "R-101", name: "التقييم السنوي للعقارات والأصول", frequency: "١٢ شهر", appliesTo: "العقارات والأصول (Real Estate)", responsible: "مدير الأصول", deadline: "٣٦٥ يوم", penalty: "تخفيض درجة الامتثال", status: "Active" },
    { id: "R-102", name: "تحديث تقارير القوائم المالية المدققة", frequency: "١٢ شهر", appliesTo: "المالية", responsible: "المحاسب المالي", deadline: "٩٠ يوم من نهاية السنة", penalty: "إيقاف ترخيص الطرح بالسوق", status: "Overdue" },
    { id: "R-103", name: "فحص وتحديث بوالص التأمين العقاري", frequency: "سنوي", appliesTo: "العقارات", responsible: "إدارة العقود", deadline: "قبل ٣٠ يوم من الانتهاء", penalty: "تنبيه بالنظام وغرامات مالية", status: "Active" }
  ]);

  const [violations] = useState<Violation[]>([
    { id: "V-201", ruleName: "تحديث تقارير القوائم المالية المدققة", severity: "High", detectedDate: "2026-06-30", status: "Open", description: "تأخر تسليم القوائم المالية المدققة للعام المالي الماضي لـ وقف نماء التنموي." }
  ]);

  return (
    <div className="fade-in" style={{ padding: "2rem", color: "#fff", direction: "rtl", fontFamily: "Cairo, sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "700", color: "#fff" }}>محرك الالتزام والرقابة الشرعية والامتثال (Compliance Engine)</h1>
        <p style={{ opacity: 0.6, marginTop: "0.25rem" }}>تشغيل قواعد الامتثال الآلية، متابعة المخالفات، وتنبيهات اللوائح التنظيمية لـ GAW و ZATCA</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "2rem" }}>
        {/* Left Column: Stats & Violations */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Compliance KPI Card */}
          <div style={{ background: "rgba(20, 10, 35, 0.4)", border: "1px solid rgba(133, 97, 173, 0.2)", borderRadius: "16px", padding: "1.5rem", backdropFilter: "blur(12px)" }}>
            <h3 style={{ fontSize: "1.1rem", color: "#c4a8e0", marginBottom: "1rem" }}>درجة الامتثال التراكمية (Compliance Score)</h3>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: "3rem", fontWeight: "800", color: "#fbbf24" }}>٩١٪</div>
              <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)", width: "65%" }}>
                الامتثال منخفض بنسبة ٩٪ بسبب تأخر إرفاق القوائم المالية المعتمدة لوقف نماء التنموي. بقية الأوقاف والوثائق القانونية ملتزمة بالكامل.
              </div>
            </div>
          </div>

          {/* Active Violations Card */}
          <div style={{ background: "rgba(20, 10, 35, 0.4)", border: "1px solid rgba(133, 97, 173, 0.2)", borderRadius: "16px", padding: "1.5rem", backdropFilter: "blur(12px)" }}>
            <h3 style={{ fontSize: "1.1rem", color: "#ef4444", marginBottom: "1rem" }}>🚨 المخالفات والإنذارات النشطة (Active Violations)</h3>
            {violations.map((v) => (
              <div key={v.id} style={{ padding: "1rem", background: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "8px", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: "700", color: "#f87171", fontSize: "0.9rem" }}>{v.ruleName}</span>
                  <span style={{ background: "#ef4444", color: "#fff", padding: "0.15rem 0.4rem", borderRadius: "4px", fontSize: "0.7rem", fontWeight: "bold" }}>حرج</span>
                </div>
                <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.7)", lineHeight: "1.4" }}>{v.description}</p>
                <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", marginTop: "0.2rem" }}>تاريخ الرصد: {v.detectedDate} | كود المخالفة: {v.id}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Active Rules */}
        <div style={{ background: "rgba(20, 10, 35, 0.4)", border: "1px solid rgba(133, 97, 173, 0.2)", borderRadius: "16px", padding: "1.5rem", backdropFilter: "blur(12px)" }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: "600", marginBottom: "1rem", color: "#c4a8e0" }}>قواعد الالتزام التنظيمية المفعلة (Compliance Rules)</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {rules.map((rule) => (
              <div key={rule.id} style={{ padding: "1rem", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "8px", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong style={{ fontSize: "0.95rem" }}>{rule.name}</strong>
                  <span style={{
                    background: rule.status === "Active" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                    color: rule.status === "Active" ? "#34d399" : "#f87171",
                    padding: "0.2rem 0.5rem",
                    borderRadius: "4px",
                    fontSize: "0.75rem",
                    fontWeight: "bold"
                  }}>
                    {rule.status === "Active" ? "فعالة" : "متأخرة"}
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", fontSize: "0.8rem", color: "rgba(255,255,255,0.5)" }}>
                  <div>التكرار الدوري: <span style={{ color: "#fff" }}>{rule.frequency}</span></div>
                  <div>النطاق المستهدف: <span style={{ color: "#fff" }}>{rule.appliesTo}</span></div>
                  <div>المسؤول: <span style={{ color: "#fff" }}>{rule.responsible}</span></div>
                  <div>عقوبة المخالفة: <span style={{ color: "#fff" }}>{rule.penalty}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
