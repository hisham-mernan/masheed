"use client";

import React, { useState } from "react";

interface Waqf {
  id: string;
  name: string;
  type: "خيري (Khairi)" | "أهلي (Ahli)" | "مشترك (Mushtarak)";
  registrationNumber: string;
  totalShares: number;
  status: string;
  healthScore: number;
}

export default function WaqfsPage() {
  const [waqfs] = useState<Waqf[]>([
    { id: "WQ-9821-SA", name: "وقف برج الخزامى الخيري", type: "خيري (Khairi)", registrationNumber: "WQ-9821-SA", totalShares: 100000, status: "Active", healthScore: 98 },
    { id: "WQ-4192-SA", name: "وقف العائلة المرموز", type: "أهلي (Ahli)", registrationNumber: "WQ-4192-SA", totalShares: 50000, status: "Active", healthScore: 94 },
    { id: "WQ-7320-SA", name: "مزرعة النخيل المشتركة", type: "مشترك (Mushtarak)", registrationNumber: "WQ-7320-SA", totalShares: 200000, status: "Under Review", healthScore: 82 }
  ]);

  const [selectedWaqf, setSelectedWaqf] = useState<Waqf>(waqfs[0]);
  const [interpreterText, setInterpreterText] = useState("");
  const [interpreterOutput, setInterpreterOutput] = useState<string | null>(null);

  const handleInterpret = (e: React.FormEvent) => {
    e.preventDefault();
    if (!interpreterText.trim()) return;
    setInterpreterOutput("جاري تحليل صك الوقف بالذكاء الاصطناعي...");
    setTimeout(() => {
      setInterpreterOutput(
        "تم استخراج الشروط بنجاح:\n" +
        "١. تخصيص ٣٥٪ من الإيرادات السنوية لأعمال صيانة الوقف.\n" +
        "٢. توزيع ٤٠٪ من الريع على مستفيدي العائلة بالتساوي.\n" +
        "٣. حظر بيع أو رهن أصل الوقف إلا بموافقة وزارة الشؤون الإسلامية والدعوة والإرشاد ومجلس النظارة."
      );
    }, 1500);
  };

  const executeQuickAction = (actionName: string) => {
    alert(`[إجراء سريع للوقف ${selectedWaqf.name}]: جاري تشغيل إجراء ${actionName} كما هو محدد في وثيقة مواصفات مشيد (MPS).`);
  };

  return (
    <div className="fade-in" style={{ padding: "2rem", color: "#1A1A2E", direction: "rtl", fontFamily: "Cairo, sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: "700", color: "#1A1A2E" }}>إدارة الأوقاف والملفات الرقمية (Waqf Registry)</h1>
          <p style={{ color: "#64748B", marginTop: "0.25rem" }}>استعراض التوائم الرقمية للأوقاف المسجلة وتفاصيل شروطها وصحتها الحوكمية والتشغيلية</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1.2fr", gap: "2rem" }}>
        {/* Left Side: Waqf List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          <div style={{ background: "#ffffff", border: "1px solid #E4E7EF", borderRadius: "16px", padding: "1.5rem", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: "600", marginBottom: "1rem", color: "#8561AD" }}> الأوقاف المسجلة (Registered Endowments)</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {waqfs.map((waqf) => (
                <div 
                  key={waqf.id} 
                  onClick={() => setSelectedWaqf(waqf)}
                  style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center", 
                    padding: "1rem", 
                    background: selectedWaqf.id === waqf.id ? "#F0E7FF" : "#F8FAFC", 
                    border: selectedWaqf.id === waqf.id ? "1px solid #8561AD" : "1px solid #E2E8F0", 
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: "1.05rem", fontWeight: "700", color: "#1A1A2E" }}>{waqf.name}</h4>
                    <span style={{ fontSize: "0.8rem", color: "#64748B" }}>النوع: {waqf.type} | ترخيص: {waqf.registrationNumber}</span>
                  </div>
                  <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "0.75rem", color: "#64748B" }}>الأسهم (Tokens)</div>
                      <div style={{ fontSize: "0.9rem", fontWeight: "bold", color: "#1A1A2E" }}>{waqf.totalShares.toLocaleString()}</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "0.75rem", color: "#64748B" }}>صحة الوقف</div>
                      <div style={{ fontSize: "0.9rem", fontWeight: "bold", color: waqf.healthScore >= 90 ? "#10b981" : "#f59e0b" }}>{waqf.healthScore}٪</div>
                    </div>
                    <span style={{
                      background: waqf.status === "Active" ? "rgba(16, 185, 129, 0.1)" : "rgba(245, 158, 11, 0.1)",
                      color: waqf.status === "Active" ? "#10b981" : "#f59e0b",
                      padding: "0.25rem 0.5rem",
                      borderRadius: "4px",
                      fontSize: "0.75rem",
                      fontWeight: "bold"
                    }}>
                      {waqf.status === "Active" ? "نشط" : "قيد المراجعة"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions Panel (MPS 2.5 Compliance) */}
          <div style={{ background: "#ffffff", border: "1px solid #E4E7EF", borderRadius: "16px", padding: "1.5rem", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: "600", marginBottom: "0.5rem", color: "#8561AD" }}>⚡ الإجراءات السريعة للوقف: {selectedWaqf.name}</h3>
            <p style={{ fontSize: "0.8rem", color: "#64748B", marginBottom: "1.5rem" }}>إجراء العمليات الحيوية، إدارة الأصول، وتجهيز الطرح الاستثماري بشكل فوري</p>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1rem" }}>
              <button onClick={() => executeQuickAction("تعديل بيانات الوقف (Edit Profile)")} style={{ padding: "0.75rem", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "8px", fontSize: "0.85rem", fontWeight: "bold", color: "#1A1A2E", cursor: "pointer", textAlign: "center" }}>
                ✏️ تعديل الوقف
              </button>
              <button onClick={() => executeQuickAction("رفع مستند رسمي (Upload Document)")} style={{ padding: "0.75rem", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "8px", fontSize: "0.85rem", fontWeight: "bold", color: "#1A1A2E", cursor: "pointer", textAlign: "center" }}>
                📤 رفع مستند / صك
              </button>
              <button onClick={() => executeQuickAction("إضافة أصل جديد (Add Asset)")} style={{ padding: "0.75rem", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "8px", fontSize: "0.85rem", fontWeight: "bold", color: "#1A1A2E", cursor: "pointer", textAlign: "center" }}>
                🏢 إضافة أصل للوقف
              </button>
              <button onClick={() => executeQuickAction("إضافة مستفيد جديد (Add Beneficiary)")} style={{ padding: "0.75rem", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "8px", fontSize: "0.85rem", fontWeight: "bold", color: "#1A1A2E", cursor: "pointer", textAlign: "center" }}>
                👥 إضافة مستفيد
              </button>
              <button onClick={() => executeQuickAction("طلب استشارة شرعية/قانونية (Create Consultation)")} style={{ padding: "0.75rem", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "8px", fontSize: "0.85rem", fontWeight: "bold", color: "#1A1A2E", cursor: "pointer", textAlign: "center" }}>
                💼 طلب استشارة
              </button>
              <button onClick={() => executeQuickAction("توليد تقرير الوقف الموحد (Generate Report)")} style={{ padding: "0.75rem", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "8px", fontSize: "0.85rem", fontWeight: "bold", color: "#1A1A2E", cursor: "pointer", textAlign: "center" }}>
                📊 توليد تقرير
              </button>
              <button onClick={() => executeQuickAction("طلب طرح الوقف في سوق المساهمة (Request Marketplace Listing)")} style={{ padding: "0.75rem", background: "#F0E7FF", border: "1px solid #D8C3F5", borderRadius: "8px", fontSize: "0.85rem", fontWeight: "bold", color: "#58308F", cursor: "pointer", textAlign: "center" }}>
                🚀 طلب طرح استثماري
              </button>
              <button onClick={() => executeQuickAction("فتح المساعد الذكي لمراجعة الصك (Open AI Assistant)")} style={{ padding: "0.75rem", background: "#e0f2fe", border: "1px solid #bae6fd", borderRadius: "8px", fontSize: "0.85rem", fontWeight: "bold", color: "#0369a1", cursor: "pointer", textAlign: "center" }}>
                🤖 مراجعة ذكية (AI)
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Info & AI */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {/* Health Score Widget */}
          <div style={{ background: "#ffffff", border: "1px solid #E4E7EF", borderRadius: "16px", padding: "1.5rem", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "1.1rem", color: "#8561AD" }}>مؤشر صحة الأوقاف التراكمي</h3>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(16, 185, 129, 0.1)", border: "2px solid #10b981", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", fontWeight: "bold", color: "#10b981" }}>
                ٩٤٪
              </div>
              <div>
                <div style={{ fontWeight: "700", fontSize: "0.95rem", color: "#1A1A2E" }}>صحة الحوكمة والامتثال ممتازة</div>
                <div style={{ fontSize: "0.75rem", color: "#64748B", marginTop: "0.2rem" }}>تمت مراجعة جميع المستندات القانونية وصكوك الوقف وتوزيع رصيد الريع.</div>
              </div>
            </div>
          </div>

          {/* AI Waqif Interpreter Widget */}
          <div style={{ background: "#ffffff", border: "1px solid #E4E7EF", borderRadius: "16px", padding: "1.5rem", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "1rem", color: "#8561AD" }}>🔮 مفسر صك الوقف الذكي</h3>
            <p style={{ fontSize: "0.8rem", color: "#64748B", marginBottom: "1rem" }}>قم بلصق بنود صك الوقف لتفسيرها واستخراج شروط الواقف التنظيمية تلقائياً</p>
            <form onSubmit={handleInterpret} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <textarea
                value={interpreterText}
                onChange={(e) => setInterpreterText(e.target.value)}
                placeholder="أدخل نص بند الصك هنا (مثال: يخصص ثلث الغلة لعمارة الوقف)..."
                style={{ width: "100%", height: "100px", padding: "0.75rem", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "8px", fontSize: "0.85rem", color: "#1A1A2E" }}
              />
              <button type="submit" style={{ width: "100%", padding: "0.75rem", background: "#8561AD", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>
                تحليل شروط الصك ⚡
              </button>
            </form>
            {interpreterOutput && (
              <div style={{ marginTop: "1rem", padding: "0.75rem", background: "#F0E7FF", border: "1px solid #D8C3F5", borderRadius: "8px", fontSize: "0.85rem", color: "#58308F", whiteSpace: "pre-line" }}>
                {interpreterOutput}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
