"use client";

import React, { useState, useEffect } from "react";
import styles from "../admin-page.module.css";
import { createClient } from "@/lib/supabase/client";

interface Org {
  id: string;
  name: string;
  registrationNumber: string;
  plan: string;
  status: "Active" | "Suspended";
  region: string;
  onboardingDate: string;
  healthScore: number;
  industry: string;
  csm: string;
  metrics: {
    userAdoption: number;
    workflowCompletion: number;
    aiUtilization: number;
    supportTickets: number;
    compliancePosture: string;
  };
}

export default function AdminOrganizationsPage() {
  const [organizations, setOrganizations] = useState<Org[]>([
    {
      id: "ORG-001",
      name: "مؤسسة الراجحي الخيرية",
      registrationNumber: "78261827",
      plan: "Enterprise",
      status: "Active",
      region: "الرياض",
      onboardingDate: "2025-01-10",
      healthScore: 98,
      industry: "أوقاف صحية وتنموية",
      csm: "سارة العتيبي",
      metrics: { userAdoption: 96, workflowCompletion: 99, aiUtilization: 88, supportTickets: 2, compliancePosture: "ممتاز" }
    },
    {
      id: "ORG-002",
      name: "وقف البر والخيرات",
      registrationNumber: "91827364",
      plan: "Professional",
      status: "Active",
      region: "مكة المكرمة",
      onboardingDate: "2025-03-15",
      healthScore: 94,
      industry: "بناء مساجد وسقيا",
      csm: "فهد الدوسري",
      metrics: { userAdoption: 91, workflowCompletion: 95, aiUtilization: 75, supportTickets: 5, compliancePosture: "جيد جداً" }
    },
    {
      id: "ORG-003",
      name: "وقف نماء التنموي",
      registrationNumber: "84726382",
      plan: "Enterprise",
      status: "Suspended",
      region: "المنطقة الشرقية",
      onboardingDate: "2025-04-20",
      healthScore: 87,
      industry: "رعاية أيتام وتعليم",
      csm: "عبدالرحمن القحطاني",
      metrics: { userAdoption: 80, workflowCompletion: 88, aiUtilization: 60, supportTickets: 12, compliancePosture: "بحاجة لمراجعة" }
    },
    {
      id: "ORG-004",
      name: "وقف الهداية التنموي",
      registrationNumber: "73628491",
      plan: "Starter",
      status: "Active",
      region: "المدينة المنورة",
      onboardingDate: "2025-06-01",
      healthScore: 90,
      industry: "حلقات تحفيظ ودعوة",
      csm: "سارة العتيبي",
      metrics: { userAdoption: 89, workflowCompletion: 92, aiUtilization: 70, supportTickets: 1, compliancePosture: "ممتاز" }
    }
  ]);

  const [pendingWaqfs, setPendingWaqfs] = useState<any[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Org | null>(null);
  const [selectedPending, setSelectedPending] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  const fetchWaqfs = async () => {
    try {
      const { data, error } = await supabase
        .from("waqfs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        // Filter out pending and active waqfs
        const pending = data.filter(w => w.metadata?.status === "pending_approval");
        const active = data.filter(w => w.metadata?.status !== "pending_approval");

        setPendingWaqfs(pending);

        // Map active db waqfs into Org structure
        const mappedActive: Org[] = active.map(w => ({
          id: w.id,
          name: w.name,
          registrationNumber: w.registration_number || "غير مسجل",
          plan: w.metadata?.plan || "Professional",
          status: w.metadata?.status === "suspended" ? "Suspended" : "Active",
          region: w.metadata?.city || "الرياض",
          onboardingDate: new Date(w.created_at).toISOString().split("T")[0],
          healthScore: w.metadata?.health_score || 92,
          industry: w.metadata?.industry || "خدمات مجتمعية وأوقاف",
          csm: w.metadata?.csm || "سارة العتيبي",
          metrics: w.metadata?.metrics || { userAdoption: 90, workflowCompletion: 92, aiUtilization: 70, supportTickets: 0, compliancePosture: "ممتاز" }
        }));

        setOrganizations(prev => {
          const mockFiltered = prev.filter(m => !mappedActive.some(db => db.name === m.name));
          return [...mappedActive, ...mockFiltered];
        });
      }
    } catch (err) {
      console.warn("Using offline mock data for organizations:", err);
      // Setup mock pending waqf for offline demonstration
      setPendingWaqfs([
        {
          id: "WQ-TEMP-99",
          name: "وقف البركة الزراعي التجريبي",
          registration_number: "WQ-8827-SA",
          created_at: new Date().toISOString(),
          metadata: {
            status: "pending_approval",
            waqif_name: "عبدالرحمن بن سعود",
            waqif_national_id: "1082738211",
            city: "القصيم",
            type: "مشترك (Mushtarak)",
            payment_status: "free"
          }
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWaqfs();
  }, []);

  const handleApproveWaqf = async (id: string, name: string) => {
    try {
      const targetWaqf = pendingWaqfs.find(w => w.id === id);
      const metadata = targetWaqf?.metadata || {};

      const { error } = await supabase
        .from("waqfs")
        .update({
          metadata: {
            ...metadata,
            status: "approved",
            payment_status: "free" // Set to free as requested
          }
        })
        .eq("id", id);

      if (error) throw error;

      alert(`[قبول الوقف]: تم تفعيل حساب الوقف "${name}" بنجاح! تم إرسال رسالة تفعيل مجانية للعميل، ويمكن للمسؤولين الدخول الآن إلى لوحة التحكم.`);
      fetchWaqfs();
    } catch (err) {
      console.warn("Offline simulation: Approving pending Waqf locally");
      setPendingWaqfs(prev => prev.filter(w => w.id !== id));
      alert(`[محاكاة أوفلاين]: تم إعطاء موافقة للوقف "${name}" بنجاح وتفعيل الباقة المجانية.`);
    }
  };

  const toggleStatus = (id: string) => {
    setOrganizations(prev => prev.map(org => {
      if (org.id === id) {
        const nextStatus = org.status === "Active" ? "Suspended" : "Active";
        if (selectedOrg?.id === id) {
          setSelectedOrg(prevSelected => prevSelected ? { ...prevSelected, status: nextStatus } : null);
        }
        return { ...org, status: nextStatus };
      }
      return org;
    }));
  };

  const changePlan = (id: string, newPlan: string) => {
    setOrganizations(prev => prev.map(org => {
      if (org.id === id) {
        if (selectedOrg?.id === id) {
          setSelectedOrg(prevSelected => prevSelected ? { ...prevSelected, plan: newPlan } : null);
        }
        return { ...org, plan: newPlan };
      }
      return org;
    }));
  };

  return (
    <div className={styles.container} style={{ position: "relative" }}>
      <h2 className={styles.title}>إدارة المنظمات والشركاء (Tenant Organization Management)</h2>
      <p className={styles.subtitle}>تتبع المنظمات المشتركة، مستويات الحوكمة، وإدارة حالة تفعيل الحسابات والتراخيص</p>

      {/* Pending Registrations Section */}
      {pendingWaqfs.length > 0 && (
        <div className={styles.sectionCard} style={{ marginTop: "1rem", border: "1px solid rgba(251, 191, 36, 0.4)", background: "rgba(251, 191, 36, 0.02)" }}>
          <h3 style={{ color: "#fbbf24", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>📥</span> طلبات تسجيل الجهات الوقفية المعلقة (Pending Registrations)
          </h3>
          <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", marginBottom: "1rem" }}>طلبات تسجيل أرسلت مباشرة من بوابة سوق أوقاف مشيد وتنتظر الموافقة والتنشيط المجاني</p>
          <table className={styles.table}>
            <thead>
              <tr style={{ color: "#fbbf24" }}>
                <th>اسم الوقف المقترح</th>
                <th>رقم الترخيص</th>
                <th>اسم الواقف (المؤسس)</th>
                <th>المقر الرئيسي</th>
                <th>تاريخ التقديم</th>
                <th>حالة الدفع</th>
                <th>الإجراءات الأمنية</th>
              </tr>
            </thead>
            <tbody>
              {pendingWaqfs.map(pw => (
                <tr key={pw.id}>
                  <td><strong>{pw.name}</strong></td>
                  <td>{pw.registration_number || "تحت الفحص"}</td>
                  <td>{pw.metadata?.waqif_name || "غير محدد"}</td>
                  <td>{pw.metadata?.city || "غير محدد"}</td>
                  <td>{new Date(pw.created_at).toISOString().split("T")[0]}</td>
                  <td>
                    <span style={{ color: "#34d399", fontWeight: "bold" }}>مجاني (Free)</span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button 
                        onClick={() => setSelectedPending(pw)}
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
                        فحص الطلب 🔍
                      </button>
                      <button 
                        onClick={() => handleApproveWaqf(pw.id, pw.name)}
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
                        قبول وتنشيط مجاني
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Active Organizations Section */}
      <div className={styles.sectionCard} style={{ marginTop: "1.5rem" }}>
        <h3>🏢 المنظمات والأوقاف النشطة بالنظام</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>اسم المؤسسة / الوقف</th>
              <th>رقم الترخيص</th>
              <th>المنطقة</th>
              <th>نوع الاشتراك</th>
              <th>تاريخ الانضمام</th>
              <th>صحة الوقف</th>
              <th>الحالة</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {organizations.map(org => (
              <tr key={org.id}>
                <td><strong>{org.name}</strong></td>
                <td>{org.registrationNumber}</td>
                <td>{org.region}</td>
                <td>
                  <select 
                    value={org.plan} 
                    onChange={(e) => changePlan(org.id, e.target.value)}
                    style={{ background: "#1a1030", color: "#fff", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px", padding: "0.25rem" }}
                  >
                    <option value="Starter">Starter</option>
                    <option value="Professional">Professional</option>
                    <option value="Enterprise">Enterprise</option>
                    <option value="Government">Government</option>
                  </select>
                </td>
                <td>{org.onboardingDate}</td>
                <td className={org.healthScore >= 90 ? styles.healthGood : styles.healthWarning}>{org.healthScore}٪</td>
                <td>
                  <span style={{
                    background: org.status === "Active" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                    color: org.status === "Active" ? "#34d399" : "#f87171",
                    padding: "0.25rem 0.5rem",
                    borderRadius: "4px",
                    fontSize: "0.8rem",
                    fontWeight: "bold"
                  }}>
                    {org.status === "Active" ? "نشط" : "موقوف"}
                  </span>
                </td>
                <td>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button 
                      onClick={() => setSelectedOrg(org)}
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
                      عرض التفاصيل 🔍
                    </button>
                    <button 
                      onClick={() => toggleStatus(org.id)}
                      style={{
                        background: org.status === "Active" ? "#ef4444" : "#10b981",
                        color: "#fff",
                        border: "none",
                        padding: "0.35rem 0.75rem",
                        borderRadius: "4px",
                        fontSize: "0.75rem",
                        cursor: "pointer",
                        fontWeight: "600"
                      }}
                    >
                      {org.status === "Active" ? "إيقاف" : "تفعيل"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Active Org Details Side Drawer */}
      {selectedOrg && (
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
        }} onClick={() => setSelectedOrg(null)}>
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
              <h3 style={{ fontSize: "1.3rem", fontWeight: "bold" }}>ملف المنظمة الداخلي</h3>
              <button onClick={() => setSelectedOrg(null)} style={{ background: "transparent", border: "none", color: "#fff", fontSize: "1.5rem", cursor: "pointer" }}>×</button>
            </div>

            <div>
              <span style={{ fontSize: "0.8rem", color: "#c4a8e0", textTransform: "uppercase" }}>{selectedOrg.id}</span>
              <h2 style={{ fontSize: "1.6rem", fontWeight: "bold", margin: "0.25rem 0" }}>{selectedOrg.name}</h2>
              <p style={{ opacity: 0.6, fontSize: "0.85rem" }}>قطاع النشاط: {selectedOrg.industry}</p>
            </div>

            {/* General Info */}
            <div style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "10px", padding: "1rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", fontSize: "0.85rem" }}>
              <div>
                <p style={{ opacity: 0.5 }}>رقم الترخيص</p>
                <p><strong>{selectedOrg.registrationNumber}</strong></p>
              </div>
              <div>
                <p style={{ opacity: 0.5 }}>المنطقة الجغرافية</p>
                <p><strong>{selectedOrg.region}</strong></p>
              </div>
              <div>
                <p style={{ opacity: 0.5 }}>الخطة الحالية</p>
                <p><strong>{selectedOrg.plan}</strong></p>
              </div>
              <div>
                <p style={{ opacity: 0.5 }}>تاريخ الانضمام</p>
                <p><strong>{selectedOrg.onboardingDate}</strong></p>
              </div>
              <div>
                <p style={{ opacity: 0.5 }}>مدير حساب النجاح (CSM)</p>
                <p><strong>{selectedOrg.csm}</strong></p>
              </div>
              <div>
                <p style={{ opacity: 0.5 }}>حالة الحساب</p>
                <span style={{ color: selectedOrg.status === "Active" ? "#34d399" : "#f87171" }}>
                  <strong>{selectedOrg.status === "Active" ? "نشط" : "موقوف"}</strong>
                </span>
              </div>
            </div>

            {/* Health Metrics */}
            <div>
              <h4 style={{ color: "#c4a8e0", fontSize: "1rem", marginBottom: "0.75rem", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.25rem" }}>💡 مؤشرات صحة الوقف الإجمالية</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "0.25rem" }}>
                    <span>تبني المستخدمين للمنصة (User Adoption)</span>
                    <span>{selectedOrg.metrics.userAdoption}٪</span>
                  </div>
                  <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.05)", borderRadius: "3px" }}>
                    <div style={{ width: `${selectedOrg.metrics.userAdoption}%`, height: "100%", background: "#34d399", borderRadius: "3px" }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "0.25rem" }}>
                    <span>معدل اكتمال المهام والتدفقات (Workflows)</span>
                    <span>{selectedOrg.metrics.workflowCompletion}٪</span>
                  </div>
                  <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.05)", borderRadius: "3px" }}>
                    <div style={{ width: `${selectedOrg.metrics.workflowCompletion}%`, height: "100%", background: "#8561ad", borderRadius: "3px" }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "0.25rem" }}>
                    <span>استخدام الذكاء الاصطناعي (AI Utilization)</span>
                    <span>{selectedOrg.metrics.aiUtilization}٪</span>
                  </div>
                  <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.05)", borderRadius: "3px" }}>
                    <div style={{ width: `${selectedOrg.metrics.aiUtilization}%`, height: "100%", background: "#fbbf24", borderRadius: "3px" }} />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", fontSize: "0.85rem", marginTop: "0.25rem" }}>
                  <div>
                    <p style={{ opacity: 0.5 }}>تذاكر الدعم المفتوحة</p>
                    <p><strong>{selectedOrg.metrics.supportTickets} تذاكر</strong></p>
                  </div>
                  <div>
                    <p style={{ opacity: 0.5 }}>موقف الامتثال</p>
                    <p style={{ color: "#34d399" }}><strong>{selectedOrg.metrics.compliancePosture}</strong></p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "auto" }}>
              <button 
                onClick={() => toggleStatus(selectedOrg.id)}
                style={{
                  background: selectedOrg.status === "Active" ? "#ef4444" : "#10b981",
                  color: "#fff",
                  border: "none",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
              >
                {selectedOrg.status === "Active" ? "إيقاف حساب العميل" : "تفعيل حساب العميل"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pending Waqf Details Side Drawer */}
      {selectedPending && (
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
        }} onClick={() => setSelectedPending(null)}>
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
              <h3 style={{ fontSize: "1.3rem", fontWeight: "bold", color: "#fbbf24" }}>مراجعة طلب تسجيل الوقف</h3>
              <button onClick={() => setSelectedPending(null)} style={{ background: "transparent", border: "none", color: "#fff", fontSize: "1.5rem", cursor: "pointer" }}>×</button>
            </div>

            <div>
              <span style={{ fontSize: "0.8rem", color: "#c4a8e0" }}>معرف الطلب: {selectedPending.id}</span>
              <h2 style={{ fontSize: "1.6rem", fontWeight: "bold", margin: "0.25rem 0" }}>{selectedPending.name}</h2>
              <p style={{ opacity: 0.6, fontSize: "0.85rem" }}>رقم الترخيص: {selectedPending.registration_number || "تحت التحقق"}</p>
            </div>

            {/* Registration Details */}
            <div style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "10px", padding: "1rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", fontSize: "0.85rem" }}>
              <div>
                <p style={{ opacity: 0.5 }}>اسم الواقف (المؤسس)</p>
                <p><strong>{selectedPending.metadata?.waqif_name || "غير مسجل"}</strong></p>
              </div>
              <div>
                <p style={{ opacity: 0.5 }}>هوية/إقامة الواقف</p>
                <p><strong>{selectedPending.metadata?.waqif_national_id || "غير مسجل"}</strong></p>
              </div>
              <div>
                <p style={{ opacity: 0.5 }}>المقر والمدينة</p>
                <p><strong>{selectedPending.metadata?.city || "غير مسجل"}</strong></p>
              </div>
              <div>
                <p style={{ opacity: 0.5 }}>نوع الكيان الوعائي</p>
                <p><strong>{selectedPending.metadata?.type || "خيري"}</strong></p>
              </div>
              <div>
                <p style={{ opacity: 0.5 }}>تاريخ التقديم</p>
                <p><strong>{new Date(selectedPending.created_at).toISOString().split("T")[0]}</strong></p>
              </div>
              <div>
                <p style={{ opacity: 0.5 }}>حالة التسعير المعتمدة</p>
                <span style={{ color: "#34d399", fontWeight: "bold" }}>مجاني (Free Trial)</span>
              </div>
            </div>

            {/* Document Verification */}
            <div>
              <h4 style={{ color: "#fbbf24", fontSize: "1rem", marginBottom: "0.75rem" }}>📄 مستندات التحقق المرفقة</h4>
              <div style={{ padding: "0.75rem", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "8px", fontSize: "0.85rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>صك الوقف الموثق والشرعي (Waqf_Deed.pdf)</span>
                <span style={{ color: "#34d399", fontWeight: "bold" }}>تم الرفع ✓</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "auto" }}>
              <button 
                onClick={() => {
                  handleApproveWaqf(selectedPending.id, selectedPending.name);
                  setSelectedPending(null);
                }}
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
                تفعيل الوقف وتنشيط حساب النظام (مجاناً)
              </button>
              <button 
                onClick={() => alert("تم رفض الطلب وإعادة إرساله للتعديل")}
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
                رفض الطلب مع إرسال تنبيه بالبريد
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
