"use client";

import React, { useState } from "react";

interface Waqif {
  id: string;
  name: string;
  nationality: string;
  nationalId: string;
  birthDate: string;
  relationshipToWaqf: string;
  founderType: "فرد (Individual)" | "منظمة (Organization)";
  biography: string;
  status: "نشط" | "متوفى";
}

export default function WaqifsPage() {
  const [waqifs] = useState<Waqif[]>([
    {
      id: "WQF-0982",
      name: "الشيخ سليمان بن عبد العزيز الراجحي",
      nationality: "سعودي",
      nationalId: "1028392812",
      birthDate: "1929-11-30",
      relationshipToWaqf: "مؤسس رئيسي",
      founderType: "فرد (Individual)",
      biography: "رجل أعمال سعودي ومحسن شهير، أسس عددًا من أكبر الأوقاف الخيرية في العالم الإسلامي.",
      status: "نشط"
    },
    {
      id: "WQF-4192",
      name: "عائلة آل عبد اللطيف",
      nationality: "سعودي",
      nationalId: "7018293819",
      birthDate: "1985-05-12",
      relationshipToWaqf: "مؤسس مشارك",
      founderType: "منظمة (Organization)",
      biography: "مجموعة عائلية تجارية وقفت جزءاً من أصولها العقارية والاستثمارية لصالح تمويل التعليم والصحة.",
      status: "نشط"
    }
  ]);

  return (
    <div className="fade-in" style={{ padding: "2rem", color: "#fff", direction: "rtl", fontFamily: "Cairo, sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "700", color: "#fff" }}>سجل الواقفين ومؤسسي الأوقاف (Waqif Directory)</h1>
        <p style={{ opacity: 0.6, marginTop: "0.25rem" }}>إدارة وتوثيق بيانات مؤسسي الأوقاف وعلاقاتهم القانونية مع المحافظ الوقفية</p>
      </div>

      {/* Grid List */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem" }}>
        {waqifs.map((waqif) => (
          <div key={waqif.id} style={{ background: "rgba(20, 10, 35, 0.4)", border: "1px solid rgba(133, 97, 173, 0.2)", borderRadius: "16px", padding: "1.5rem", backdropFilter: "blur(12px)", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: "700", color: "#e2d8f0" }}>{waqif.name}</h3>
                <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)" }}>معرف الواقف: {waqif.id}</span>
              </div>
              <span style={{
                background: waqif.status === "نشط" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                color: waqif.status === "نشط" ? "#34d399" : "#f87171",
                padding: "0.25rem 0.5rem",
                borderRadius: "4px",
                fontSize: "0.75rem",
                fontWeight: "bold"
              }}>
                {waqif.status}
              </span>
            </div>

            <div style={{ fontSize: "0.85rem", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", padding: "0.75rem", borderRadius: "8px", color: "rgba(255,255,255,0.7)", lineHeight: "1.5" }}>
              <strong>السيرة/التعريف:</strong> {waqif.biography}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", fontSize: "0.85rem" }}>
              <div>
                <span style={{ display: "block", color: "rgba(255,255,255,0.4)", fontSize: "0.75rem" }}>الجنسية</span>
                <strong>{waqif.nationality}</strong>
              </div>
              <div>
                <span style={{ display: "block", color: "rgba(255,255,255,0.4)", fontSize: "0.75rem" }}>الهوية الوطنية / السجل</span>
                <strong>{waqif.nationalId}</strong>
              </div>
              <div>
                <span style={{ display: "block", color: "rgba(255,255,255,0.4)", fontSize: "0.75rem" }}>تاريخ التأسيس / الميلاد</span>
                <strong>{waqif.birthDate}</strong>
              </div>
              <div>
                <span style={{ display: "block", color: "rgba(255,255,255,0.4)", fontSize: "0.75rem" }}>نوع المؤسس</span>
                <strong>{waqif.founderType}</strong>
              </div>
            </div>

            <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "1rem", display: "flex", gap: "0.5rem" }}>
              <button 
                onClick={() => alert(`عرض المستندات القانونية وتوكيل الواقف لـ ${waqif.name}`)}
                style={{ flex: 1, padding: "0.5rem", background: "rgba(133, 97, 173, 0.2)", border: "1px solid rgba(133, 97, 173, 0.4)", borderRadius: "6px", color: "#c4a8e0", cursor: "pointer", fontSize: "0.8rem", fontWeight: "600" }}
              >
                📁 صكوك وتواكيل الواقف
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
