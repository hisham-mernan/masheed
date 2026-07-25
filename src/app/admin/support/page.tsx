"use client";

import React, { useState } from "react";
import styles from "../admin-page.module.css";

interface Case {
  id: string;
  customer: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  module: string;
  engineer: string;
  sla: string;
  status: "Open" | "In Progress" | "Closed";
  description: string;
  history: string[];
  resolvedAt?: string;
}

export default function AdminSupportPage() {
  const [cases, setCases] = useState<Case[]>([
    { 
      id: "CASE-1092", 
      customer: "مؤسسة الراجحي الخيرية", 
      priority: "Critical", 
      module: "التوكينيزيشن والتوزيعات", 
      engineer: "المهندس عمر الفاروق", 
      sla: "10 دقائق متبقية", 
      status: "Open",
      description: "فشل العميل في إتمام عملية حساب أنصبة ريع النظارة التجريبي على حاسبة الريع وتوقف النظام عن المزامنة مع شبكة بلوكشين مشيد.",
      history: ["تلقي التذكرة وتصنيفها كحرجة", "محاولة أولى لفحص عقد الإثبات - فشل الربط", "استدعاء المهندس المناوب"]
    },
    { 
      id: "CASE-1093", 
      customer: "وقف البر والخيرات", 
      priority: "High", 
      module: "أرشفة الوثائق الذكية OCR", 
      engineer: "المهندس طارق منصور", 
      sla: "ساعتان", 
      status: "In Progress",
      description: "الذكاء الاصطناعي لفحص صكوك الواقفين يفشل في تحديد بند شروط الصرف الخاصة بالدعم التعليمي للمستحقين بالمنطقة الغربية.",
      history: ["تم رفع ملف الصك بصيغة PDF", "الـ OCR استخرج النصوص بنسبة ٦٠٪ فقط", "بدء الفحص اليدوي بواسطة المهندس"]
    },
    { 
      id: "CASE-1094", 
      customer: "وقف نماء التنموي", 
      priority: "Medium", 
      module: "إدارة الأصول والصيانة", 
      engineer: "المهندس فهد العتيبي", 
      sla: "١٢ ساعة", 
      status: "Closed",
      description: "طلب إضافة حقول ديناميكية مخصصة لجدولة الصيانة الدورية لمعدات الري والزراعة المتقدمة بمشروع نخلة الهداية.",
      history: ["استلام الطلب", "إضافة الحقول وتجربتها على بيئة التطوير", "نقل الحقول لبيئة الإنتاج وإغلاق الطلب"],
      resolvedAt: "2026-07-06 14:12"
    }
  ]);

  const [selectedCase, setSelectedCase] = useState<Case | null>(null);

  const updateStatus = (id: string, newStatus: "In Progress" | "Closed") => {
    setCases(prev => prev.map(c => {
      if (c.id === id) {
        const updated = { ...c, status: newStatus };
        if (selectedCase?.id === id) {
          setSelectedCase(updated);
        }
        return updated;
      }
      return c;
    }));
  };

  return (
    <div className={styles.container} style={{ position: "relative" }}>
      <h2 className={styles.title}>مركز الدعم الفني وتذاكر الشركاء (Support & Ticketing System)</h2>
      <p className={styles.subtitle}>تتبع مشاكل الشركاء، توزيع التذاكر على المهندسين، ومراقبة أوقات الاستجابة واتفاقية مستوى الخدمة (SLA)</p>

      <div className={styles.sectionCard} style={{ marginTop: "1rem" }}>
        <h3>🛠️ تذاكر الدعم والطلبات المفتوحة (Active Tickets)</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>رقم التذكرة</th>
              <th>الجهة / الشريك</th>
              <th>الأهمية</th>
              <th>الموديل المتأثر</th>
              <th>المهندس المعين</th>
              <th>اتفاقية الـ SLA</th>
              <th>حالة التذكرة</th>
              <th>إجراءات الإدارة</th>
            </tr>
          </thead>
          <tbody>
            {cases.map((c) => (
              <tr key={c.id}>
                <td><strong>{c.id}</strong></td>
                <td>{c.customer}</td>
                <td>
                  <span style={{
                    color: c.priority === "Critical" ? "#ef4444" : c.priority === "High" ? "#fbbf24" : "#60a5fa",
                    fontWeight: "bold"
                  }}>
                    {c.priority}
                  </span>
                </td>
                <td>{c.module}</td>
                <td>{c.engineer}</td>
                <td>{c.sla}</td>
                <td>
                  <span style={{
                    background: c.status === "Open" ? "rgba(239, 68, 68, 0.15)" : c.status === "Closed" ? "rgba(16, 185, 129, 0.15)" : "rgba(251, 191, 36, 0.15)",
                    color: c.status === "Open" ? "#f87171" : c.status === "Closed" ? "#34d399" : "#fbbf24",
                    padding: "0.25rem 0.5rem",
                    borderRadius: "4px",
                    fontSize: "0.8rem",
                    fontWeight: "bold"
                  }}>
                    {c.status}
                  </span>
                </td>
                <td>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button 
                      onClick={() => setSelectedCase(c)}
                      style={{
                        background: "#8561ad",
                        color: "#fff",
                        border: "none",
                        padding: "0.35rem 0.75rem",
                        borderRadius: "4px",
                        fontSize: "0.75rem",
                        cursor: "pointer"
                      }}
                    >
                      مراجعة 🔍
                    </button>
                    {c.status !== "Closed" && (
                      <>
                        {c.status === "Open" && (
                          <button 
                            onClick={() => updateStatus(c.id, "In Progress")}
                            style={{
                              background: "#fbbf24",
                              color: "#000",
                              border: "none",
                              padding: "0.35rem 0.75rem",
                              borderRadius: "4px",
                              fontSize: "0.75rem",
                              cursor: "pointer",
                              fontWeight: "bold"
                            }}
                          >
                            بدء
                          </button>
                        )}
                        <button 
                          onClick={() => updateStatus(c.id, "Closed")}
                          style={{
                            background: "#10b981",
                            color: "#fff",
                            border: "none",
                            padding: "0.35rem 0.75rem",
                            borderRadius: "4px",
                            fontSize: "0.75rem",
                            cursor: "pointer",
                            fontWeight: "bold"
                          }}
                        >
                          إغلاق وحل
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Details Side Drawer */}
      {selectedCase && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0,0,0,0.5)",
          zIndex: 999,
          display: "flex",
          justifyContent: "flex-end"
        }} onClick={() => setSelectedCase(null)}>
          <div style={{
            width: "480px",
            height: "100%",
            background: "#120822",
            borderLeft: "1px solid rgba(133, 97, 173, 0.4)",
            padding: "2rem",
            color: "#fff",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem"
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "1rem" }}>
              <h3 style={{ fontSize: "1.3rem", fontWeight: "bold" }}>تفاصيل طلب الدعم الفني</h3>
              <button onClick={() => setSelectedCase(null)} style={{ background: "transparent", border: "none", color: "#fff", fontSize: "1.5rem", cursor: "pointer" }}>×</button>
            </div>

            <div>
              <span style={{ fontSize: "0.8rem", color: "#c4a8e0", textTransform: "uppercase" }}>تذكرة: {selectedCase.id}</span>
              <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", margin: "0.25rem 0" }}>{selectedCase.module}</h2>
              <p style={{ opacity: 0.6, fontSize: "0.85rem" }}>العميل: {selectedCase.customer}</p>
            </div>

            {/* Case Parameters */}
            <div style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "10px", padding: "1rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", fontSize: "0.85rem" }}>
              <div>
                <p style={{ opacity: 0.5 }}>مستوى الأهمية</p>
                <p style={{ color: selectedCase.priority === "Critical" ? "#ef4444" : "#fbbf24" }}><strong>{selectedCase.priority}</strong></p>
              </div>
              <div>
                <p style={{ opacity: 0.5 }}>المهندس المعين</p>
                <p><strong>{selectedCase.engineer}</strong></p>
              </div>
              <div>
                <p style={{ opacity: 0.5 }}>اتفاقية مستوى الخدمة</p>
                <p><strong>{selectedCase.sla}</strong></p>
              </div>
              <div>
                <p style={{ opacity: 0.5 }}>حالة الطلب</p>
                <p><strong>{selectedCase.status === "Open" ? "مفتوح" : selectedCase.status === "Closed" ? "محلولة ومغلقة" : "قيد المعالجة"}</strong></p>
              </div>
            </div>

            {/* Problem Description */}
            <div>
              <h4 style={{ color: "#c4a8e0", fontSize: "1rem", marginBottom: "0.5rem" }}>📝 شرح المشكلة بالتفصيل</h4>
              <p style={{ fontSize: "0.85rem", lineHeight: "1.6", background: "rgba(255,255,255,0.02)", padding: "1rem", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
                {selectedCase.description}
              </p>
            </div>

            {/* Actions Timeline */}
            <div>
              <h4 style={{ color: "#c4a8e0", fontSize: "1rem", marginBottom: "0.75rem", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.25rem" }}>⌛ خطوات المعالجة والتحقيق</h4>
              <ul style={{ listStyleType: "none", padding: 0, display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.8rem" }}>
                {selectedCase.history.map((step, idx) => (
                  <li key={idx} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <span style={{ color: "#8561ad" }}>✦</span> {step}
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick resolution controls */}
            {selectedCase.status !== "Closed" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "auto" }}>
                {selectedCase.status === "Open" && (
                  <button 
                    onClick={() => updateStatus(selectedCase.id, "In Progress")}
                    style={{
                      background: "#fbbf24",
                      color: "#000",
                      border: "none",
                      padding: "0.75rem",
                      borderRadius: "8px",
                      fontWeight: "bold",
                      cursor: "pointer"
                    }}
                  >
                    إسناد التذكرة لي والبدء في حلها
                  </button>
                )}
                <button 
                  onClick={() => updateStatus(selectedCase.id, "Closed")}
                  style={{
                    background: "#10b981",
                    color: "#fff",
                    border: "none",
                    padding: "0.75rem",
                    borderRadius: "8px",
                    fontWeight: "bold",
                    cursor: "pointer"
                  }}
                >
                  إغلاق التذكرة وتأكيد الحل مع العميل
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
