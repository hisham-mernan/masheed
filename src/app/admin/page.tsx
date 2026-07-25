import React from "react";
import styles from "./admin-page.module.css";

export default function AdminDashboardPage() {
  const stats = [
    { label: "صحة المنصة العامة", value: "99.98%", change: "مستقر", type: "health" },
    { label: "إجمالي المنظمات (الشركاء)", value: "48", change: "+4 جهات هذا الشهر", type: "orgs" },
    { label: "المستخدمين النشطين (يومياً)", value: "1,280", change: "+12%", type: "users" },
    { label: "المستخدمين النشطين (شهرياً)", value: "8,450", change: "+8%", type: "users" },
    { label: "إجمالي الأموال المجموعة بالسوق", value: "12,450,000 ر.س", change: "+18%", type: "money" },
    { label: "الاستثمارات النشطة", value: "312", change: "+15 عملية", type: "investments" },
    { label: "إيرادات المنصة الإجمالية", value: "450,000 ر.س", change: "+24%", type: "revenue" },
    { label: "الإيراد الشهري المتكرر (MRR)", value: "38,000 ر.س", change: "+5% شهرياً", type: "mrr" },
    { label: "الإيراد السنوي المتكرر (ARR)", value: "456,000 ر.س", change: "+10% سنوياً", type: "arr" },
    { label: "معدل الانصراف (Churn Rate)", value: "1.2%", change: "منخفض جداً", type: "churn" },
    { label: "تحويل الحسابات التجريبية", value: "68%", change: "+3% شهرياً", type: "conversion" },
    { label: "تذاكر الدعم المفتوحة", value: "5 تذاكر", change: "2 حرجة", type: "tickets" },
    { label: "الحوادث التقنية الحرجة", value: "0 حادثة", change: "سليم", type: "incidents" },
    { label: "متوسط وقت استجابة الـ API", value: "120ms", change: "سريع جداً", type: "speed" },
    { label: "استهلاك الذكاء الاصطناعي", value: "450,000 رمز / يوم", change: "ضمن المعدل", type: "ai" },
    { label: "السعة التخزينية المستهلكة", value: "1.2 TB", change: "42% من السعة المتاحة", type: "storage" },
    { label: "وظائف الخلفية والمهام", value: "12 عملية جارية", change: "لا توجد مشاكل", type: "jobs" },
    { label: "تنبيهات الأمان الحرجة", value: "0 تنبيه", change: "سليم", type: "security" },
    { label: "محاولات تسجيل دخول فاشلة", value: "12 محاولة اليوم", change: "طبيعي", type: "failed" }
  ];

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>لوحة القيادة التنفيذية والتحليلات (Platform Command Center)</h2>
      <p className={styles.subtitle}>نظرة شمولية حية على أداء البنية التحتية والمنظمات والنشاط المالي والتقني</p>

      {/* Grid of Stats */}
      <div className={styles.grid}>
        {stats.map((stat, i) => (
          <div key={i} className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardLabel}>{stat.label}</span>
              <span className={styles.cardBadge}>{stat.change}</span>
            </div>
            <div className={styles.cardValue}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className={styles.twoColumn}>
        {/* Active Technical Alerts */}
        <div className={styles.sectionCard}>
          <h3>🚨 تنبيهات الأمن وحالة النظام (SOC & System Alerts)</h3>
          <div className={styles.logList}>
            <div className={styles.logItem}>
              <span className={styles.severityHigh}>حرجة</span>
              <span className={styles.logText}>تم رصد محاولة تسجيل دخول فاشلة متكررة من عنوان IP (192.168.1.112)</span>
              <span className={styles.logTime}>منذ 5 دقائق</span>
            </div>
            <div className={styles.logItem}>
              <span className={styles.severityInfo}>تنبيه</span>
              <span className={styles.logText}>اكتمال مهمة النسخ الاحتياطي التلقائي لقاعدة بيانات الأوقاف بنجاح</span>
              <span className={styles.logTime}>منذ ساعة</span>
            </div>
            <div className={styles.logItem}>
              <span className={styles.severityInfo}>تنبيه</span>
              <span className={styles.logText}>ارتفاع طفيف في استهلاك موارد الذكاء الاصطناعي (تحليل وثائق الأوقاف)</span>
              <span className={styles.logTime}>منذ ساعتين</span>
            </div>
          </div>
        </div>

        {/* Top Organizations by Usage */}
        <div className={styles.sectionCard}>
          <h3>🏆 أعلى المنظمات نشاطاً (Top Tenants by Usage)</h3>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>اسم المؤسسة / الوقف</th>
                <th>الأصول النشطة</th>
                <th>صحة الوقف</th>
                <th>نوع الاشتراك</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>مؤسسة الراجحي الخيرية</td>
                <td>١٤ عقاراً</td>
                <td className={styles.healthGood}>٩٨٪</td>
                <td>مؤسسي (Enterprise)</td>
              </tr>
              <tr>
                <td>وقف البر والخيرات</td>
                <td>٨ أصول</td>
                <td className={styles.healthGood}>٩٤٪</td>
                <td>احترافي (Professional)</td>
              </tr>
              <tr>
                <td>وقف نماء التنموي</td>
                <td>٥ أصول</td>
                <td className={styles.healthWarning}>٨٧٪</td>
                <td>مؤسسي (Enterprise)</td>
              </tr>
              <tr>
                <td>وقف الهداية التنموي</td>
                <td>٣ أصول</td>
                <td className={styles.healthGood}>٩٠٪</td>
                <td>أساسي (Starter)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
