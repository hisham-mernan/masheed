"use client";

import React, { useState } from "react";
import styles from "../admin-page.module.css";

interface Log {
  id: string;
  user: string;
  action: string;
  ip: string;
  status: "Success" | "Failed";
  timestamp: string;
  userId: string;
  device: string;
  os: string;
  organization: string;
  riskScore: number;
}

export default function AdminUsersPage() {
  const [logs] = useState<Log[]>([
    { 
      id: "LOG-302", 
      user: "ahmed.ali@waqf.sa", 
      action: "تسجيل دخول لوحة التحكم", 
      ip: "196.12.82.4", 
      status: "Success", 
      timestamp: "2026-07-06 16:15:32",
      userId: "USR-827-SA",
      device: "Chrome (Desktop)",
      os: "Windows 11",
      organization: "مؤسسة الراجحي الخيرية",
      riskScore: 2
    },
    { 
      id: "LOG-303", 
      user: "unknown_user", 
      action: "تسجيل دخول خاطئ (كلمة مرور خطأ)", 
      ip: "82.45.192.11", 
      status: "Failed", 
      timestamp: "2026-07-06 16:12:01",
      userId: "UNKNOWN",
      device: "Safari (Mobile)",
      os: "iOS 17.4",
      organization: "غير محدد",
      riskScore: 84
    },
    { 
      id: "LOG-304", 
      user: "khaled@waqf.sa", 
      action: "تحديث تقييم أصل #A-102", 
      ip: "196.12.82.9", 
      status: "Success", 
      timestamp: "2026-07-06 15:45:00",
      userId: "USR-941-SA",
      device: "Firefox (Desktop)",
      os: "macOS Sonoma",
      organization: "وقف البر والخيرات",
      riskScore: 5
    },
    { 
      id: "LOG-305", 
      user: "system_cron", 
      action: "دوران النسخ الاحتياطي التلقائي", 
      ip: "localhost", 
      status: "Success", 
      timestamp: "2026-07-06 00:00:05",
      userId: "SYS-CRON-JOB",
      device: "Internal Server",
      os: "Linux Ubuntu 22.04",
      organization: "نظام مشيد الداخلي",
      riskScore: 0
    }
  ]);

  const [selectedLog, setSelectedLog] = useState<Log | null>(null);

  return (
    <div className={styles.container} style={{ position: "relative" }}>
      <h2 className={styles.title}>إدارة المستخدمين وسجل الأمان المركزي (SOC & User Audit Security)</h2>
      <p className={styles.subtitle}>مراقبة عمليات تسجيل الدخول الفاشلة والناجحة، وإدارة الجلسات الحية، وتتبع الإجراءات الأمنية في النظام</p>

      <div className={styles.sectionCard} style={{ marginTop: "1rem" }}>
        <h3>🔒 مراقبة الأحداث الأمنية وسجل العمليات الحية (Security Logs)</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>المستخدم / المعرف</th>
              <th>العملية المنفذة</th>
              <th>عنوان الـ IP</th>
              <th>حالة العملية</th>
              <th>طابع التاريخ والوقت (UTC)</th>
              <th>إجراءات سريعة</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td><strong>{log.user}</strong></td>
                <td>{log.action}</td>
                <td>{log.ip}</td>
                <td>
                  <span style={{
                    background: log.status === "Success" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                    color: log.status === "Success" ? "#34d399" : "#f87171",
                    padding: "0.25rem 0.5rem",
                    borderRadius: "4px",
                    fontSize: "0.8rem",
                    fontWeight: "bold"
                  }}>
                    {log.status === "Success" ? "ناجح" : "فشل"}
                  </span>
                </td>
                <td>{log.timestamp}</td>
                <td>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button 
                      onClick={() => setSelectedLog(log)}
                      style={{
                        background: "#8561ad",
                        color: "#fff",
                        border: "none",
                        padding: "0.35rem 0.75rem",
                        borderRadius: "4px",
                        fontSize: "0.7rem",
                        cursor: "pointer"
                      }}
                    >
                      عرض التفاصيل 🔍
                    </button>
                    <button 
                      onClick={() => alert(`تم إرسال طلب إعادة تعيين المصادقة الثنائية (MFA) للمستخدم ${log.user}`)}
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        color: "#c4a8e0",
                        border: "1px solid rgba(133,97,173,0.3)",
                        padding: "0.25rem 0.5rem",
                        borderRadius: "4px",
                        fontSize: "0.7rem",
                        cursor: "pointer"
                      }}
                    >
                      إعادة تعيين MFA
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Details Side Drawer */}
      {selectedLog && (
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
        }} onClick={() => setSelectedLog(null)}>
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
              <h3 style={{ fontSize: "1.3rem", fontWeight: "bold" }}>تفاصيل الحدث الأمني (Audit Log Details)</h3>
              <button onClick={() => setSelectedLog(null)} style={{ background: "transparent", border: "none", color: "#fff", fontSize: "1.5rem", cursor: "pointer" }}>×</button>
            </div>

            <div>
              <span style={{ fontSize: "0.8rem", color: "#c4a8e0", textTransform: "uppercase" }}>كود التدقيق: {selectedLog.id}</span>
              <h2 style={{ fontSize: "1.4rem", fontWeight: "bold", margin: "0.25rem 0" }}>{selectedLog.action}</h2>
              <p style={{ opacity: 0.6, fontSize: "0.85rem" }}>المستخدم: {selectedLog.user}</p>
            </div>

            {/* Event Info */}
            <div style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "10px", padding: "1rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", fontSize: "0.85rem" }}>
              <div>
                <p style={{ opacity: 0.5 }}>معرف المستخدم</p>
                <p><strong>{selectedLog.userId}</strong></p>
              </div>
              <div>
                <p style={{ opacity: 0.5 }}>عنوان الـ IP</p>
                <p><strong>{selectedLog.ip}</strong></p>
              </div>
              <div>
                <p style={{ opacity: 0.5 }}>نوع الجهاز</p>
                <p><strong>{selectedLog.device}</strong></p>
              </div>
              <div>
                <p style={{ opacity: 0.5 }}>نظام التشغيل</p>
                <p><strong>{selectedLog.os}</strong></p>
              </div>
              <div>
                <p style={{ opacity: 0.5 }}>الجهة المشغلة</p>
                <p><strong>{selectedLog.organization}</strong></p>
              </div>
              <div>
                <p style={{ opacity: 0.5 }}>طابع الوقت (UTC)</p>
                <p><strong>{selectedLog.timestamp}</strong></p>
              </div>
            </div>

            {/* Security evaluation */}
            <div>
              <h4 style={{ color: "#c4a8e0", fontSize: "1rem", marginBottom: "0.75rem", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.25rem" }}>🛡️ تقييم أمان الجلسة والعملية</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.85rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>نتيجة الأمان (Security Result)</span>
                  <span style={{ color: selectedLog.status === "Success" ? "#34d399" : "#f87171", fontWeight: "bold" }}>
                    {selectedLog.status === "Success" ? "ناجح" : "فشل المحاولة"}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>مستوى الخطورة (AI Risk Score)</span>
                  <span style={{
                    color: selectedLog.riskScore >= 70 ? "#ef4444" : selectedLog.riskScore >= 30 ? "#fbbf24" : "#34d399",
                    fontWeight: "bold"
                  }}>
                    {selectedLog.riskScore}٪ ({selectedLog.riskScore >= 70 ? "مرتفع" : selectedLog.riskScore >= 30 ? "متوسط" : "منخفض"})
                  </span>
                </div>
              </div>
            </div>

            {/* Quick security actions */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "auto" }}>
              <button 
                onClick={() => alert(`تم إنهاء الجلسة الأمنية للمستخدم ${selectedLog.user} بنجاح.`)}
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
                إنهاء الجلسة الفعالة (Force Logout)
              </button>
              <button 
                onClick={() => alert("تم حظر عنوان الـ IP من محاولة تسجيل الدخول")}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.1)",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  cursor: "pointer"
                }}
              >
                حظر عنوان IP مؤقتاً
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
