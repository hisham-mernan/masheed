"use client";

import styles from "./Partners.module.css";

const partners = [
  { name: "الهيئة العامة للأوقاف", role: "شريك تشريعي" },
  { name: "وزارة العدل", role: "تكامل بيانات" },
  { name: "ZATCA", role: "امتثال وفوترة" },
  { name: "البنك المركزي السعودي", role: "تكامل مالي" },
  { name: "الهيئة السعودية للبيانات", role: "أمن سيبراني" },
];

export default function Partners() {
  return (
    <section id="partners" className={styles.partners}>
      <div className="container">
        <div className={styles.header}>
          <p className={styles.label}>شركاء النجاح والتكامل</p>
          <div className={styles.divider}></div>
        </div>

        <div className={styles.marquee}>
          {/* First Track */}
          <div className={styles.marqueeInner}>
            {partners.map((partner, i) => (
              <div key={`p1-${i}`} className={styles.partnerItem}>
                <div className={styles.partnerIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="24" height="24" style={{ opacity: 0.5 }}>
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <div>
                  <div className={styles.partnerName}>{partner.name}</div>
                  <div className={styles.partnerRole}>{partner.role}</div>
                </div>
              </div>
            ))}
          </div>
          {/* Second Track for seamless loop */}
          <div className={styles.marqueeInner} aria-hidden="true">
            {partners.map((partner, i) => (
              <div key={`p2-${i}`} className={styles.partnerItem}>
                <div className={styles.partnerIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="24" height="24" style={{ opacity: 0.5 }}>
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <div>
                  <div className={styles.partnerName}>{partner.name}</div>
                  <div className={styles.partnerRole}>{partner.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
