"use client";

import React, { useState } from "react";
import styles from "../admin-page.module.css";

export default function AdminAIPage() {
  const [provider, setProvider] = useState("gemini");
  const [model, setModel] = useState("gemini-1.5-pro");

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>عمليات وحوكمة الذكاء الاصطناعي (AI Operations Center)</h2>
      <p className={styles.subtitle}>التحكم في مزودي الخدمة، تعديل نماذج المعالجة، ومراقبة استهلاك الرموز (Tokens) والتكاليف التشغيلية</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginTop: "1rem" }}>
        {/* Provider Settings */}
        <div className={styles.sectionCard}>
          <h3>⚙️ إعدادات مزود الخدمة ونموذج المعالجة (AI Engine Configuration)</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
            <label style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.7)" }}>
              مزوّد الخدمة الرئيسي:
              <select 
                value={provider} 
                onChange={(e) => setProvider(e.target.value)}
                style={{ width: "100%", marginTop: "0.5rem", padding: "0.75rem", background: "#1a1030", color: "#fff", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px" }}
              >
                <option value="gemini">Google Cloud Gemini Platform (افتراضي)</option>
                <option value="openai">OpenAI Enterprise API</option>
                <option value="anthropic">Anthropic Claude Vertex</option>
              </select>
            </label>

            <label style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.7)" }}>
              نموذج التوليد الفعال:
              <select 
                value={model} 
                onChange={(e) => setModel(e.target.value)}
                style={{ width: "100%", marginTop: "0.5rem", padding: "0.75rem", background: "#1a1030", color: "#fff", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px" }}
              >
                <option value="gemini-1.5-pro">Gemini 1.5 Pro (الأكثر دقة للوثائق المعقدة)</option>
                <option value="gemini-1.5-flash">Gemini 1.5 Flash (عالي السرعة للاستجابات السريعة)</option>
                <option value="gemini-1.0-ultra">Gemini 1.0 Ultra</option>
              </select>
            </label>

            <button 
              onClick={() => alert(`تم حفظ الإعدادات وتحويل محرك المنصة إلى ${model} عبر ${provider} بنجاح`)}
              style={{
                background: "#8561AD",
                color: "#white",
                border: "none",
                padding: "0.75rem",
                borderRadius: "6px",
                fontSize: "0.9rem",
                cursor: "pointer",
                fontWeight: "bold",
                marginTop: "1rem"
              }}
            >
              حفظ وتطبيق التغييرات
            </button>
          </div>
        </div>

        {/* AI Metrics & Analytics */}
        <div className={styles.sectionCard}>
          <h3>📊 تحليلات واستهلاك موارد الـ AI (Usage & Cost Metrics)</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.5rem" }}>
              <span>إجمالي الرموز المستهلكة (اليوم)</span>
              <span style={{ color: "#34d399", fontWeight: "bold" }}>٤٥٠,١٢٠ رمز</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.5rem" }}>
              <span>التكلفة المقدرة للاستهلاك (الشهر الحالي)</span>
              <span style={{ color: "#fbbf24", fontWeight: "bold" }}>٣٢٠.٥٠ دولار أمريكي</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.5rem" }}>
              <span>متوسط زمن المعالجة للطلب</span>
              <span>٨5٠ms</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "0.5rem" }}>
              <span>معدل نجاح ودقة الاستجابات</span>
              <span style={{ color: "#34d399", fontWeight: "bold" }}>٩٩.٦٪</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
