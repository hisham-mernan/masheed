"use client";

import { useEffect, useRef } from "react";
import styles from "./Stats.module.css";

const stats = [
  {
    value: 450,
    suffix: "م+",
    label: "قيمة الأصول المدارة",
    sublabel: "ريال سعودي",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="24" height="24">
        <rect x="2" y="3" width="20" height="14" rx="2"/>
        <path d="M8 21h8M12 17v4"/>
      </svg>
    ),
  },
  {
    value: 100,
    suffix: "٪",
    label: "امتثال نظامي",
    sublabel: "وفق معايير الهيئة العامة للأوقاف",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="24" height="24">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <polyline points="9 12 11 14 15 10"/>
      </svg>
    ),
  },
  {
    value: 18,
    suffix: "٪+",
    label: "نمو العوائد",
    sublabel: "متوسط نمو سنوي للريع الوقفي",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="24" height="24">
        <path d="M3 3v18h18"/><polyline points="18 9 12 15 9 12 3 18"/>
      </svg>
    ),
  },
  {
    value: 10,
    suffix: "+",
    label: "موديول متخصص",
    sublabel: "يغطي كامل دورة حياة الوقف",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="24" height="24">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
  },
];

export default function Stats() {
  const sectionRef = useRef<HTMLElement>(null);
  const counterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const animated = useRef(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animated.current) {
          animated.current = true;
          counterRefs.current.forEach((el, i) => {
            if (!el) return;
            const target = stats[i].value;
            const suffix = stats[i].suffix;
            let count = 0;
            const duration = 1600;
            const steps = 60;
            const increment = target / steps;
            const interval = duration / steps;

            const timer = setInterval(() => {
              count = Math.min(count + increment, target);
              el.textContent = Math.floor(count).toLocaleString("ar-EG") + suffix;
              if (count >= target) clearInterval(timer);
            }, interval);
          });
          obs.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(section);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className={styles.stats}>
      <div className="container">
        <div className={styles.grid}>
          {stats.map((stat, i) => (
            <div key={i} className={`${styles.card} reveal`} style={{ transitionDelay: `${i * 80}ms` }}>
              <div className={styles.iconWrap}>{stat.icon}</div>
              <div className={styles.value}>
                <span
                  className={styles.number}
                  ref={el => { counterRefs.current[i] = el; }}
                >
                  ٠
                </span>
              </div>
              <div className={styles.label}>{stat.label}</div>
              <div className={styles.sublabel}>{stat.sublabel}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
