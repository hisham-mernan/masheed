"use client";

import styles from "./Features.module.css";

const features = [
  {
    title: "التوكينيزيشن وتقسيم الحصص",
    eng: "Waqf Tokenization",
    description: "تجزئة الوقف إلى حصص رقمية ذكية، مما يسهل حساب وتوزيع الأرباح على المستفيدين بشكل مؤتمت بالكامل وبشفافية تامة.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </svg>
    ),
    color: "#8561AD", // primary
    colSpan: 2,
  },
  {
    title: "بوابة المستفيدين والمحافظ",
    eng: "Beneficiary Wallets",
    description: "محافظ رقمية متطورة لكل مستفيد، مع إشعارات فورية بالإيداعات ومتابعة دقيقة للعوائد المستحقة.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87"/>
        <path d="M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
    color: "#F59E0B", // gold
    colSpan: 1,
  },
  {
    title: "نظام مالي متكامل",
    eng: "Financial ERP System",
    description: "فصل 'الأصل' عن 'الريع' وأتمتة التقارير المحاسبية والمصارف بدقة فائقة توافق المعايير المالية العالمية والمحلية.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
        <line x1="12" y1="1" x2="12" y2="23"/>
        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
      </svg>
    ),
    color: "#10B981", // green
    colSpan: 1,
  },
  {
    title: "الامتثال والفوترة الإلكترونية (ZATCA)",
    eng: "Legal Compliance",
    description: "تكامل سلس ولحظي مع الهيئة العامة للأوقاف (GAW)، وهيئة الزكاة والضريبة (ZATCA Phase 2) لتجنب الغرامات.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <polyline points="9 12 11 14 15 10"/>
      </svg>
    ),
    color: "#3B82F6", // blue
    colSpan: 2,
  },
];

export default function Features() {
  return (
    <section id="features" className={styles.features}>
      <div className="container">
        <div className={styles.header}>
          <div className="section-tag fade-in">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            المميزات الأساسية
          </div>
          <h2 className={`${styles.title} fade-in-slow`}>
            حلول رقمية متكاملة <span className="text-gradient" style={{ background: 'linear-gradient(135deg, var(--color-primary), #B28DFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>لقطاع الأوقاف</span>
          </h2>
          <p className={`${styles.subtitle} fade-in-slow`}>
            نقدم لك بنية تحتية تقنية متطورة لإدارة أصولك الوقفية بكفاءة عالية وشفافية مطلقة، مع ضمان التوافق التام مع اللوائح والأنظمة.
          </p>
        </div>

        <div className={styles.bentoGrid}>
          {features.map((feature, index) => (
            <div
              key={index}
              className={`${styles.card} glass-card reveal`}
              style={{
                transitionDelay: `${index * 100}ms`,
                gridColumn: `span ${feature.colSpan}`
              }}
            >
              <div
                className={styles.iconWrap}
                style={{
                  background: `${feature.color}15`,
                  color: feature.color,
                  border: `1px solid ${feature.color}30`
                }}
              >
                {feature.icon}
              </div>
              <div className={styles.cardContent}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>{feature.title}</h3>
                  <span className={styles.cardEng}>{feature.eng}</span>
                </div>
                <p className={styles.description}>{feature.description}</p>
              </div>
              <div
                className={styles.cardGlow}
                style={{ background: `radial-gradient(circle at top right, ${feature.color}10, transparent 70%)` }}
              ></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
