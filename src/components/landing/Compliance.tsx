"use client";

import styles from "./Compliance.module.css";
import { useEffect, useRef } from "react";

const checkItems = [
  {
    title: "التدقيق الشرعي الآلي",
    desc: "التأكد من صرف الريع في مصارفه المحددة شرعاً وفق شروط الواقف.",
  },
  {
    title: "تقارير GAW الجاهزة",
    desc: "استخراج التقارير المالية والتشغيلية المطلوبة للهيئة بضغطة زر.",
  },
  {
    title: "أمن البيانات السيادي",
    desc: "استضافة وتشفير البيانات وفق أعلى معايير الأمن السيبراني في المملكة.",
  },
];

export default function Compliance() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.width = "99.9%";
          obs.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el.parentElement!);
    return () => obs.disconnect();
  }, []);

  return (
    <section className={styles.compliance}>
      <div className="container">
        <div className={styles.grid}>
          {/* Content */}
          <div className={styles.content}>
            <div className="section-tag">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              الحوكمة والامتثال
            </div>
            <h2 className={styles.title}>
              حوكمة شاملة وفق{" "}
              <span className={styles.highlight}>المعايير الشرعية والنظامية</span>
            </h2>
            <p className={styles.desc}>
              نظام مَشيد مصمم ليكون شريكك الموثوق في تحقيق الامتثال الكامل
              للوائح الهيئة العامة للأوقاف والتكامل الرقمي مع وزارة العدل والجهات الرقابية.
            </p>

            <ul className={styles.list}>
              {checkItems.map((item, i) => (
                <li key={i} className={styles.listItem}>
                  <div className={styles.check}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="13" height="13">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <div>
                    <strong className={styles.itemTitle}>{item.title}:</strong>
                    <span className={styles.itemDesc}> {item.desc}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Visual – score card */}
          <div className={styles.visual}>
            <div className={`${styles.scoreCard} glass-card`}>
              <div className={styles.scoreHeader}>
                <div className={styles.scoreIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <polyline points="9 12 11 14 15 10"/>
                  </svg>
                </div>
                <div>
                  <div className={styles.scoreLabel}>تقييم الامتثال النظامي</div>
                  <div className={styles.scoreSublabel}>General Authority for Awqaf</div>
                </div>
              </div>

              <div className={styles.scoreValue}>٩٩.٩٪</div>

              <div className={styles.scoreBarTrack}>
                <div className={styles.scoreBarFill} ref={barRef}></div>
              </div>

              <div className={styles.scoreMeta}>تحديث لحظي | ZATCA Phase 2</div>

              <div className={styles.integrations}>
                {["GAW", "ZATCA", "MOJ", "NCA"].map((tag) => (
                  <span key={tag} className={styles.integrationTag}>{tag}</span>
                ))}
              </div>
            </div>
            <div className={styles.glowBehind}></div>
          </div>
        </div>
      </div>
    </section>
  );
}
