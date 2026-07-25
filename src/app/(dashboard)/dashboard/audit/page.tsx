"use client";

import styles from "./audit.module.css";

const auditLogs = [
  { id: "LOG-551", user: "Admin", action: "تعديل صك", target: "عمارة الخزامى", time: "منذ ١٥ دقيقة", hash: "sha256:8f3c...9a21" },
  { id: "LOG-550", user: "PropMgr", action: "إضافة عقد", target: "مزرعة النخيل", time: "منذ ساعة", hash: "sha256:d4e1...f0b3" },
  { id: "LOG-549", user: "Admin", action: "صرف توزيع", target: "أيتام الرياض", time: "منذ ٣ ساعات", hash: "sha256:2b9e...7c14" },
  { id: "LOG-548", user: "System", action: "تكامل ZATCA", target: "الفاتورة الضريبية", time: "منذ ٦ ساعات", hash: "sha256:1a5d...e8f9" },
];

export default function AuditPage() {
  return (
    <div className="fade-in">
      <div className={styles.header}>
        <h1 className={styles.title}>الرقابة والامتثال (Trust Layer)</h1>
        <p className={styles.subtitle}>سجل أحداث غير قابل للتغيير ومراقبة للامتثال الشرعي والنظامي.</p>
      </div>

      <div className={styles.topGrid}>
        <div className={`${styles.complianceCard} glass-card`}>
          <div className={styles.complianceHeader}>
            <h3>مؤشر الامتثال العام</h3>
            <span className={styles.percentage}>٩٨٪</span>
          </div>
          <div className={styles.progressBar}>
            <div className={styles.progress} style={{ width: '98%' }}></div>
          </div>
          <p className={styles.complianceNote}>جميع المصارف متوافقة مع شروط الواقف.</p>
        </div>

        <div className={`${styles.zatcaCard} glass-card`}>
          <div className={styles.zatcaInfo}>
            <h3>الفوترة الإلكترونية (ZATCA)</h3>
            <span className={styles.statusActive}>متصل - المرحلة الثانية</span>
          </div>
          <div className={styles.zatcaIcon}>🛡️</div>
        </div>
      </div>

      <div className={`${styles.logContainer} glass-card`}>
        <div className={styles.logHeader}>
          <h3>سجل الأحداث (Immutable Audit Log)</h3>
          <div className={styles.shieldInfo}>
            <span className={styles.shieldIcon}>🔒</span>
            الحركات مشفرة ومحمية بـ Hash
          </div>
        </div>
        
        <div className={styles.logList}>
          {auditLogs.map((log) => (
            <div key={log.id} className={styles.logItem}>
              <div className={styles.logTime}>{log.time}</div>
              <div className={styles.logUser}>
                <strong>{log.user}</strong>
              </div>
              <div className={styles.logAction}>
                <span>{log.action}</span> - <em>{log.target}</em>
              </div>
              <div className={styles.logId}>#{log.id}</div>
              <div className={styles.logHash} title={log.hash}>
                {log.hash.slice(0, 12)}...
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
