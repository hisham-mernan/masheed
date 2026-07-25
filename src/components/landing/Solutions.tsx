"use client";

import styles from "./Solutions.module.css";

const solutions = [
  {
    number: "٠١",
    title: "الأوقاف العقارية",
    subtitle: "Real Estate Endowments",
    desc: "إدارة العقارات السكنية والتجارية، عقود الإيجار، الصيانة الدورية، ومتابعة التحصيل آلياً بسجل صكوك رقمي.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    number: "٠٢",
    title: "الأوقاف الزراعية",
    subtitle: "Agricultural Endowments",
    desc: "إدارة المزارع، متابعة المحاصيل، توريد المنتجات، وتوثيق المصاريف التشغيلية في سجل رقمي متكامل.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
        <path d="M2 22l10-10"/>
        <path d="M16 8c0 4-2.5 6-6 8"/>
        <path d="M17.5 3.5C15 6 14 8 14 10c2-2 4-2.5 6-1.5"/>
        <path d="M10.5 8.5C9 6 6.5 5.5 4 6.5c1.5 2 4 3 6 2"/>
      </svg>
    ),
  },
  {
    number: "٠٣",
    title: "المحافظ الاستثمارية",
    subtitle: "Investment Portfolios",
    desc: "متابعة الأسهم والصكوك الاستثمارية، تحليل العوائد، وتوزيع الأرباح حسب الشروط الوقفية الشرعية.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
        <path d="M3 3v18h18"/>
        <polyline points="18 9 12 15 9 12 3 18"/>
      </svg>
    ),
  },
  {
    number: "٠٤",
    title: "الأوقاف النقدية والمنقولة",
    subtitle: "Cash & Movable Assets",
    desc: "إدارة التبرعات النقدية، الأصول المنقولة، والسيولة المالية مع محاسبة وقفية منضبطة شرعاً.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
        <rect x="2" y="7" width="20" height="14" rx="2"/>
        <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
      </svg>
    ),
  },
];

export default function Solutions() {
  return (
    <section id="solutions" className={styles.solutions}>
      <div className="container">
        <div className={styles.header}>
          <div className="section-tag">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
            حلول متخصصة
          </div>
          <h2 className={styles.title}>حلول تخصصية لكافة أنواع الأوقاف</h2>
          <p className={styles.subtitle}>
            سواء كانت أوقافك عقارية أو زراعية أو محافظ استثمارية،
            مَشيد يوفر لك الأدوات اللازمة لإدارتها بدقة وشفافية.
          </p>
        </div>

        <div className={`${styles.grid} stagger`}>
          {solutions.map((item, i) => (
            <div key={i} className={`${styles.card} reveal`} style={{ transitionDelay: `${i * 80}ms` }}>
              <div className={styles.cardTop}>
                <div className={styles.iconWrap}>{item.icon}</div>
                <span className={styles.number}>{item.number}</span>
              </div>
              <div className={styles.cardBody}>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <span className={styles.cardSub}>{item.subtitle}</span>
                <p className={styles.desc}>{item.desc}</p>
              </div>
              <div className={styles.cardHoverLine}></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
