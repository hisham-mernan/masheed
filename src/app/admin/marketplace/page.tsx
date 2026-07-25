"use client";

import React, { useState } from "react";
import styles from "../admin-page.module.css";

interface Listing {
  id: string;
  waqfName: string;
  projectName: string;
  fundingGoal: string;
  readinessScore: number;
  status: "Awaiting Review" | "Approved" | "Rejected";
  submissionDate: string;
  code: string;
  type: string;
  minInvestment: string;
  targetReturn: string;
  ddStatus: {
    financial: string;
    legal: string;
    technical: string;
    governance: string;
    compliance: string;
  };
}

export default function AdminMarketplacePage() {
  const [listings, setListings] = useState<Listing[]>([
    { 
      id: "LIST-101", 
      waqfName: "مؤسسة الراجحي الخيرية", 
      projectName: "برج الخزامى الاستثماري", 
      fundingGoal: "٥,٠٠٠,٠٠٠ ر.س", 
      readinessScore: 98, 
      status: "Awaiting Review", 
      submissionDate: "2025-06-12",
      code: "OPP-KHZ-01",
      type: "عقاري (Real Estate)",
      minInvestment: "١٠,٠٠٠ ر.س",
      targetReturn: "٨.٥٪ سنوي",
      ddStatus: { financial: "مكتملة ومراجعة", legal: "صك وقف موثق", technical: "مخططات هندسية معتمدة", governance: "موافقة مجلس النظارة متوفرة", compliance: "سليم تنظيماً" }
    },
    { 
      id: "LIST-102", 
      waqfName: "وقف البر والخيرات", 
      projectName: "مجمع الروضة السكني المرموز", 
      fundingGoal: "٣,٢٠٠,٠٠٠ ر.س", 
      readinessScore: 94, 
      status: "Approved", 
      submissionDate: "2025-05-20",
      code: "OPP-RWD-02",
      type: "عقاري (Real Estate)",
      minInvestment: "٥,٠٠٠ ر.س",
      targetReturn: "٩.٢٪ سنوي",
      ddStatus: { financial: "مكتملة ومراجعة", legal: "صك وقف موثق", technical: "مخططات هندسية معتمدة", governance: "موافقة مجلس النظارة متوفرة", compliance: "سليم تنظيماً" }
    },
    { 
      id: "LIST-103", 
      waqfName: "وقف نماء التنموي", 
      projectName: "مزرعة النخيل التصديرية", 
      fundingGoal: "١,٨٠٠,٠٠٠ ر.س", 
      readinessScore: 82, 
      status: "Awaiting Review", 
      submissionDate: "2025-06-14",
      code: "OPP-NKL-03",
      type: "زراعي (Agriculture)",
      minInvestment: "٢٠,٠٠٠ ر.س",
      targetReturn: "٧.٨٪ سنوي",
      ddStatus: { financial: "قيد المراجعة المالية", legal: "صك مكتمل", technical: "تقرير فحص التربة متأخر", governance: "مكتمل", compliance: "سليم" }
    },
    { 
      id: "LIST-104", 
      waqfName: "وقف الهداية التنموي", 
      projectName: "تطوير مستودعات ومخازن لوجستية", 
      fundingGoal: "٨,٥٠٠,٠٠٠ ر.س", 
      readinessScore: 78, 
      status: "Rejected", 
      submissionDate: "2025-04-10",
      code: "OPP-WHS-04",
      type: "مخازن لوجستية (Logistic)",
      minInvestment: "٥٠,٠٠٠ ر.س",
      targetReturn: "١٠.٥٪ سنوي",
      ddStatus: { financial: "مرفوض - نقص قوائم مالية", legal: "صك معلق", technical: "غير متوفر", governance: "غير مكتمل", compliance: "مخالفة تنظيمية نشطة" }
    }
  ]);

  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  const updateStatus = (id: string, newStatus: "Approved" | "Rejected") => {
    setListings(prev => prev.map(listing => {
      if (listing.id === id) {
        if (selectedListing?.id === id) {
          setSelectedListing(prevSelected => prevSelected ? { ...prevSelected, status: newStatus } : null);
        }
        return { ...listing, status: newStatus };
      }
      return listing;
    }));
  };

  return (
    <div className={styles.container} style={{ position: "relative" }}>
      <h2 className={styles.title}>عمليات سوق الاستثمار الوقفي (Marketplace Operations)</h2>
      <p className={styles.subtitle}>إدارة طلبات طرح الفرص الاستثمارية الوقفية، التدقيق القانوني، التحقق من دراسات الجدوى والامتثال</p>

      <div className={styles.sectionCard} style={{ marginTop: "1rem" }}>
        <h3>📁 طلبات إدراج الفرص الاستثمارية (Investment Opportunities Review)</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>الوقف صاحب الطلب</th>
              <th>المشروع الاستثماري</th>
              <th>المبلغ المستهدف</th>
              <th>معدل الجاهزية للطرح</th>
              <th>تاريخ التقديم</th>
              <th>الحالة</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((list) => (
              <tr key={list.id}>
                <td><strong>{list.waqfName}</strong></td>
                <td>{list.projectName}</td>
                <td>{list.fundingGoal}</td>
                <td className={list.readinessScore >= 90 ? styles.healthGood : styles.healthWarning}>{list.readinessScore}٪</td>
                <td>{list.submissionDate}</td>
                <td>
                  <span style={{
                    background: list.status === "Approved" ? "rgba(16, 185, 129, 0.15)" : list.status === "Rejected" ? "rgba(239, 68, 68, 0.15)" : "rgba(251, 191, 36, 0.15)",
                    color: list.status === "Approved" ? "#34d399" : list.status === "Rejected" ? "#f87171" : "#fbbf24",
                    padding: "0.25rem 0.5rem",
                    borderRadius: "4px",
                    fontSize: "0.8rem",
                    fontWeight: "bold"
                  }}>
                    {list.status === "Awaiting Review" ? "قيد المراجعة" : list.status === "Approved" ? "تمت الموافقة" : "مرفوض"}
                  </span>
                </td>
                <td>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button 
                      onClick={() => setSelectedListing(list)}
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
                      مراجعة الطلب 🔍
                    </button>
                    {list.status === "Awaiting Review" && (
                      <>
                        <button 
                          onClick={() => updateStatus(list.id, "Approved")}
                          style={{
                            background: "#10b981",
                            color: "#fff",
                            border: "none",
                            padding: "0.35rem 0.75rem",
                            borderRadius: "4px",
                            fontSize: "0.75rem",
                            cursor: "pointer",
                            fontWeight: "600"
                          }}
                        >
                          قبول
                        </button>
                        <button 
                          onClick={() => updateStatus(list.id, "Rejected")}
                          style={{
                            background: "#ef4444",
                            color: "#fff",
                            border: "none",
                            padding: "0.35rem 0.75rem",
                            borderRadius: "4px",
                            fontSize: "0.75rem",
                            cursor: "pointer",
                            fontWeight: "600"
                          }}
                        >
                          رفض
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
      {selectedListing && (
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
        }} onClick={() => setSelectedListing(null)}>
          <div style={{
            width: "500px",
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
              <h3 style={{ fontSize: "1.3rem", fontWeight: "bold" }}>دراسة جاهزية طلب طرح صك الوقف</h3>
              <button onClick={() => setSelectedListing(null)} style={{ background: "transparent", border: "none", color: "#fff", fontSize: "1.5rem", cursor: "pointer" }}>×</button>
            </div>

            <div>
              <span style={{ fontSize: "0.8rem", color: "#c4a8e0", textTransform: "uppercase" }}>{selectedListing.code} ({selectedListing.id})</span>
              <h2 style={{ fontSize: "1.6rem", fontWeight: "bold", margin: "0.25rem 0" }}>{selectedListing.projectName}</h2>
              <p style={{ opacity: 0.6, fontSize: "0.85rem" }}>الجهة المالكة: {selectedListing.waqfName}</p>
            </div>

            {/* Financial Parameters */}
            <div style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "10px", padding: "1rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", fontSize: "0.85rem" }}>
              <div>
                <p style={{ opacity: 0.5 }}>التمويل المستهدف</p>
                <p><strong>{selectedListing.fundingGoal}</strong></p>
              </div>
              <div>
                <p style={{ opacity: 0.5 }}>الحد الأدنى للمساهمة</p>
                <p><strong>{selectedListing.minInvestment}</strong></p>
              </div>
              <div>
                <p style={{ opacity: 0.5 }}>العائد الاستثماري المستهدف</p>
                <p style={{ color: "#34d399" }}><strong>{selectedListing.targetReturn}</strong></p>
              </div>
              <div>
                <p style={{ opacity: 0.5 }}>فئة الفرصة الاستثمارية</p>
                <p><strong>{selectedListing.type}</strong></p>
              </div>
              <div>
                <p style={{ opacity: 0.5 }}>معدل الجاهزية الإجمالي</p>
                <p style={{ color: selectedListing.readinessScore >= 90 ? "#34d399" : "#fbbf24", fontWeight: "bold" }}>{selectedListing.readinessScore}٪</p>
              </div>
              <div>
                <p style={{ opacity: 0.5 }}>تاريخ التقديم</p>
                <p><strong>{selectedListing.submissionDate}</strong></p>
              </div>
            </div>

            {/* Due Diligence Tracks (MPS 2.9) */}
            <div>
              <h4 style={{ color: "#c4a8e0", fontSize: "1rem", marginBottom: "0.75rem", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.25rem" }}>⚖️ تدقيق الامتثال والجاهزية الفنية</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.85rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.02)", paddingBottom: "0.5rem" }}>
                  <span style={{ opacity: 0.7 }}>التحليل المالي والجدوى (Financial)</span>
                  <span style={{ color: "#34d399", fontWeight: "bold" }}>{selectedListing.ddStatus.financial}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.02)", paddingBottom: "0.5rem" }}>
                  <span style={{ opacity: 0.7 }}>صكوك الملكية والحصر القانوني (Legal)</span>
                  <span style={{ color: "#34d399", fontWeight: "bold" }}>{selectedListing.ddStatus.legal}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.02)", paddingBottom: "0.5rem" }}>
                  <span style={{ opacity: 0.7 }}>الفحص الفني والهندسي (Technical)</span>
                  <span style={{ color: selectedListing.ddStatus.technical.includes("متأخر") || selectedListing.ddStatus.technical.includes("غير") ? "#fbbf24" : "#34d399", fontWeight: "bold" }}>{selectedListing.ddStatus.technical}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.02)", paddingBottom: "0.5rem" }}>
                  <span style={{ opacity: 0.7 }}>موافقة مجلس النظارة والحوكمة (Governance)</span>
                  <span style={{ color: selectedListing.ddStatus.governance.includes("غير") ? "#ef4444" : "#34d399", fontWeight: "bold" }}>{selectedListing.ddStatus.governance}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.02)", paddingBottom: "0.5rem" }}>
                  <span style={{ opacity: 0.7 }}>فحص الضوابط التنظيمية والشرعية (Compliance)</span>
                  <span style={{ color: selectedListing.ddStatus.compliance.includes("مخالفة") ? "#ef4444" : "#34d399", fontWeight: "bold" }}>{selectedListing.ddStatus.compliance}</span>
                </div>
              </div>
            </div>

            {/* Admin Action Control */}
            {selectedListing.status === "Awaiting Review" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "auto" }}>
                <button 
                  onClick={() => updateStatus(selectedListing.id, "Approved")}
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
                  نشر وطرح الفرصة
                </button>
                <button 
                  onClick={() => updateStatus(selectedListing.id, "Rejected")}
                  style={{
                    background: "#ef4444",
                    color: "#fff",
                    border: "none",
                    padding: "0.75rem",
                    borderRadius: "8px",
                    fontWeight: "bold",
                    cursor: "pointer"
                  }}
                >
                  رفض مع الملاحظات
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
