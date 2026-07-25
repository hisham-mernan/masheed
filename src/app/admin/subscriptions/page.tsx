"use client";

import React, { useState } from "react";
import styles from "../admin-page.module.css";

interface Plan {
  id: string;
  name: string;
  price: string;
  usersLimit: string;
  storage: string;
  aiCredits: string;
  access: string;
  activeTenants: string[];
  features: string[];
}

export default function AdminSubscriptionsPage() {
  const [plans] = useState<Plan[]>([
    { 
      id: "PLN-TRIAL", 
      name: "تجريبي (Trial)", 
      price: "مجاني", 
      usersLimit: "٥ مستخدمين", 
      storage: "٥ جيجابايت", 
      aiCredits: "٥٠ ألف رمز/شهر", 
      access: "أساسي",
      activeTenants: ["وقف الهداية التنموي (تجريبي)"],
      features: ["إدخال بيانات الأصول الأساسي", "شروط صك الوقف بصيغة نصية", "لوحة إحصائيات عامة"]
    },
    { 
      id: "PLN-STARTER", 
      name: "الأساسي (Starter)", 
      price: "٤٩٩ ر.س / شهرياً", 
      usersLimit: "١٥ مستخدم", 
      storage: "٥٠ جيجابايت", 
      aiCredits: "٥٠٠ ألف رمز/شهر", 
      access: "محدود",
      activeTenants: ["وقف الهدى والتقى", "مؤسسة التكافل الخيرية"],
      features: ["إدارة أصول ووثائق متكاملة", "الامتثال الأساسي ولوائح الأوقاف", "محاسبة الأوقاف والتقارير العامة"]
    },
    { 
      id: "PLN-PRO", 
      name: "الاحترافي (Professional)", 
      price: "١,٤٩٩ ر.س / شهرياً", 
      usersLimit: "٥٠ مستخدم", 
      storage: "٥٠٠ جيجابايت", 
      aiCredits: "٥ مليون رمز/شهر", 
      access: "كامل",
      activeTenants: ["وقف البر والخيرات", "جمعية نفع للأعمال الإنسانية"],
      features: ["مركز قيادة الأصول الذكي", "توزيع عوائد ريع الوقف (Yield payout calculator)", "مساعد الذكاء الاصطناعي الاستشاري", "الربط مع سوق أوقاف الاستثماري"]
    },
    { 
      id: "PLN-ENTERPRISE", 
      name: "المؤسسي (Enterprise)", 
      price: "اتفاقية خاصة", 
      usersLimit: "غير محدود", 
      storage: "٢ تيرابايت", 
      aiCredits: "٥٠ مليون رمز/شهر", 
      access: "كامل + حماية متقدمة",
      activeTenants: ["مؤسسة الراجحي الخيرية", "وقف نماء التنموي"],
      features: ["محرك تدفقات العمل المخصص (Workflow Engine)", "نظام إدارة لجان الحوكمة والتصويت", "دعم فني خاص على مدار الساعة (SLA)", "مدقق امتثال تلقائي كامل"]
    },
    { 
      id: "PLN-GOV", 
      name: "الحكومي (Government)", 
      price: "اتفاقية مخصصة", 
      usersLimit: "غير محدود", 
      storage: "سحابي حكومي خاص", 
      aiCredits: "مفتوح", 
      access: "تكامل حكومي كامل",
      activeTenants: ["الهيئة العامة للمستودعات الوقوفية"],
      features: ["استضافة سحابية خاصة حكومية معزولة", "بوابة ربط مباشر مع الهيئة العامة للأوقاف", "تقارير تدقيق وامتثال جاهزة للمشرعين", "أمن سيبراني متوافق مع لوائح هيئة الأمن السيبراني"]
    }
  ]);

  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  return (
    <div className={styles.container} style={{ position: "relative" }}>
      <h2 className={styles.title}>الاشتراكات وإدارة التراخيص (Subscriptions & Licensing)</h2>
      <p className={styles.subtitle}>تحديد مستويات الخدمة، تسعير الباقات، ومراقبة استهلاك الموارد المخصصة لكل شريك</p>

      <div className={styles.sectionCard} style={{ marginTop: "1rem" }}>
        <h3>🏷️ باقات خدمة نظام مشيد (Masheed Plan Registry)</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>اسم الباقة</th>
              <th>التسعير والرسوم</th>
              <th>الحد الأقصى للمستخدمين</th>
              <th>السعة التخزينية</th>
              <th>رصيد الـ AI الشهري</th>
              <th>الربط مع السوق</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((plan) => (
              <tr key={plan.id}>
                <td><strong>{plan.name}</strong></td>
                <td>{plan.price}</td>
                <td>{plan.usersLimit}</td>
                <td>{plan.storage}</td>
                <td style={{ color: "#c4a8e0", fontWeight: "bold" }}>{plan.aiCredits}</td>
                <td>{plan.access}</td>
                <td>
                  <button 
                    onClick={() => setSelectedPlan(plan)}
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
                    تفاصيل الخطة 🔍
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.sectionCard} style={{ marginTop: "1.5rem" }}>
        <h3>📈 إجمالي استخدام الموارد للمنصة (Overall Platform Resource Usage)</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginTop: "1rem" }}>
          <div style={{ background: "rgba(255,255,255,0.02)", padding: "1rem", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)" }}>تراخيص مستخدمين فعالة</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "700", marginTop: "0.25rem" }}>٤٨٢ ترخيص نشط</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.02)", padding: "1rem", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)" }}>الاستهلاك الكلي للذاكرة</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "700", marginTop: "0.25rem" }}>1.2 TB / 5 TB</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.02)", padding: "1rem", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)" }}>رموز الذكاء الاصطناعي المستهلكة</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "700", marginTop: "0.25rem" }}>١٢,٤ مليون رمز</div>
          </div>
        </div>
      </div>

      {/* Details Side Drawer */}
      {selectedPlan && (
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
        }} onClick={() => setSelectedPlan(null)}>
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
              <h3 style={{ fontSize: "1.3rem", fontWeight: "bold" }}>خصائص باقة ترخيص مشيد</h3>
              <button onClick={() => setSelectedPlan(null)} style={{ background: "transparent", border: "none", color: "#fff", fontSize: "1.5rem", cursor: "pointer" }}>×</button>
            </div>

            <div>
              <span style={{ fontSize: "0.8rem", color: "#c4a8e0", textTransform: "uppercase" }}>{selectedPlan.id}</span>
              <h2 style={{ fontSize: "1.6rem", fontWeight: "bold", margin: "0.25rem 0" }}>{selectedPlan.name}</h2>
              <p style={{ color: "#34d399", fontSize: "1.2rem", fontWeight: "bold" }}>التكلفة: {selectedPlan.price}</p>
            </div>

            {/* Spec limits */}
            <div style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "10px", padding: "1rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", fontSize: "0.85rem" }}>
              <div>
                <p style={{ opacity: 0.5 }}>الحد الأقصى للمستخدمين</p>
                <p><strong>{selectedPlan.usersLimit}</strong></p>
              </div>
              <div>
                <p style={{ opacity: 0.5 }}>سعة التخزين السحابية</p>
                <p><strong>{selectedPlan.storage}</strong></p>
              </div>
              <div>
                <p style={{ opacity: 0.5 }}>رصيد استدعاء الـ AI الشهري</p>
                <p><strong>{selectedPlan.aiCredits}</strong></p>
              </div>
              <div>
                <p style={{ opacity: 0.5 }}>صلاحية سوق المساهمة</p>
                <p><strong>{selectedPlan.access}</strong></p>
              </div>
            </div>

            {/* Features list */}
            <div>
              <h4 style={{ color: "#c4a8e0", fontSize: "1rem", marginBottom: "0.75rem", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.25rem" }}>🔑 المزايا البرمجية المضمنة</h4>
              <ul style={{ listStyleType: "none", padding: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {selectedPlan.features.map((feat, idx) => (
                  <li key={idx} style={{ fontSize: "0.85rem", display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <span style={{ color: "#34d399" }}>✓</span> {feat}
                  </li>
                ))}
              </ul>
            </div>

            {/* Active subscribers */}
            <div>
              <h4 style={{ color: "#c4a8e0", fontSize: "1rem", marginBottom: "0.75rem", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.25rem" }}>🏢 العملاء المشتركون بالباقة حالياً</h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {selectedPlan.activeTenants.map((tenant, idx) => (
                  <span key={idx} style={{ background: "rgba(133, 97, 173, 0.2)", border: "1px solid rgba(133, 97, 173, 0.4)", borderRadius: "6px", padding: "0.25rem 0.5rem", fontSize: "0.8rem" }}>
                    {tenant}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
