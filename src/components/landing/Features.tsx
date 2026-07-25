"use client";

import styles from "./Features.module.css";

const features = [
  {
    title: "التوكينيزيشن وتقسيم الأسهم",
    eng: "Waqf Tokenization",
    description: "تجزئة الوقف إلى أسهم أو حصص ذكية، مما يسهل حساب وتوزيع الأرباح والريع على المستفيدين بشكل مؤتمت بالكامل.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </svg>
    ),
    color: "#8561AD",
  },
  {
    title: "نظام ERP مالي متكامل",
    eng: "Financial ERP System",
    description: "فصل 'الأصل' عن 'الريع' وأتمتة التقارير المحاسبية والمصارف بدقة. يدعم الأوقاف الخيرية، الأهلية، والمشتركة.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
        <line x1="12" y1="1" x2="12" y2="23"/>
        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
      </svg>
    ),
    color: "#10B981",
  },
  {
    title: "الامتثال والفوترة (ZATCA)",
    eng: "Legal Compliance",
    description: "تكامل سلس مع الهيئة العامة للأوقاف (GAW)، وهيئة الزكاة والضريبة (ZATCA Phase 2).",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <polyline points="9 12 11 14 15 10"/>
      </svg>
    ),
    color: "#3B82F6",
  },
  {
    title: "بوابة المستفيدين والمحافظ",
    eng: "Beneficiary Wallets",
    description: "محافظ رقمية للمستفيدين، إشعارات فورية بالإيداعات، ولوحة تحكم خاصة لكل مستفيد لمتابعة الأسهم.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87"/>
        <path d="M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
    color: "#F59E0B",
  },
];

export default function Features() {
  return (
    <section id="features" className={styles.features}>
      <div className="container">
        <div className={styles.header}>
          <div className="section-tag">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            المميزات الأساسية
          </div>
          <h2 className={styles.title}>حلول رقمية متكاملة لقطاع الأوقاف</h2>
          <p className={styles.subtitle}>
            نقدم لك الأدوات اللازمة لإدارة أصولك الوقفية بكفاءة عالية وشفافية مطلقة.
          </p>
        </div>

        <div className={styles.grid}>
          {features.map((feature, index) => (
            <div
              key={index}
              className={`${styles.card} reveal`}
              style={{ transitionDelay: `${index * 80}ms` }}
            >
              <div
                className={styles.iconWrap}
                style={{
                  background: feature.color + "18",
                  color: feature.color,
                }}
              >
                {feature.icon}
              </div>
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>{feature.title}</h3>
                <span className={styles.cardEng}>{feature.eng}</span>
                <p className={styles.description}>{feature.description}</p>
              </div>
              <div
                className={styles.accentBar}
                style={{ background: `linear-gradient(90deg, ${feature.color}, transparent)` }}
              ></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
