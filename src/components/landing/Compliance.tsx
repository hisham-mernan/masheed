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
    desc: "استضافة وتشفير البيانات وفق أعلى معايير الأمن السيبراني في المملكة (NCA).",
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
          el.style.width = "100%";
          obs.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el.parentElement!);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="compliance" className={styles.compliance}>
      <div className="container">
        <div className={styles.grid}>
          {/* Content */}
          <div className={styles.content}>
            <div className="section-tag fade-in">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              الحوكمة والامتثال
            </div>
            <h2 className={`${styles.title} fade-in-slow`}>
              حوكمة شاملة وفق{" "}
              <span className="text-gradient" style={{ background: 'linear-gradient(135deg, var(--color-success), #34D399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>المعايير الشرعية والنظامية</span>
            </h2>
            <p className={`${styles.desc} fade-in-slow`}>
              نظام مَشيد مصمم ليكون شريكك الموثوق في تحقيق الامتثال الكامل
              للوائح الهيئة العامة للأوقاف والتكامل الرقمي مع وزارة العدل والجهات الرقابية، لضمان استدامة الأوقاف بلا ثغرات.
            </p>

            <ul className={`${styles.list} stagger`}>
              {checkItems.map((item, i) => (
                <li key={i} className={`${styles.listItem} fade-in`} style={{ transitionDelay: `${i * 100}ms` }}>
                  <div className={styles.check}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <div>
                    <strong className={styles.itemTitle}>{item.title}</strong>
                    <p className={styles.itemDesc}>{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Visual – Minimalist Premium Card */}
          <div className={styles.visual}>
            <div style={{
              width: '100%',
              maxWidth: '420px',
              background: '#ffffff',
              borderRadius: '32px',
              padding: '3rem 2.5rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.02)',
              border: '1px solid rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              gap: '2.5rem',
              position: 'relative',
              zIndex: 2
            }}>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--color-text)', marginBottom: '0.3rem' }}>تقييم الامتثال النظامي</div>
                  <div style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>General Authority for Awqaf</div>
                </div>
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16A34A' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="28" height="28">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <polyline points="9 12 11 14 15 10"/>
                  </svg>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <div style={{ fontSize: '4.5rem', fontWeight: '800', color: '#16A34A', lineHeight: 1, fontFamily: 'var(--font-heading)' }}>١٠٠٪</div>
              </div>

              <div>
                <div style={{ width: '100%', height: '8px', background: '#F3F4F6', borderRadius: '4px', overflow: 'hidden', marginBottom: '1rem' }}>
                  <div ref={barRef} style={{ width: '0%', height: '100%', background: '#16A34A', borderRadius: '4px', transition: 'width 1.5s cubic-bezier(0.2, 0.8, 0.2, 1)' }}></div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#6B7280', fontWeight: '500' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16A34A' }}></div>
                  تحديث لحظي | متوافق مع ZATCA Phase 2
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {["GAW", "ZATCA", "MOJ", "NCA"].map((tag) => (
                  <span key={tag} style={{
                    padding: '0.4rem 1rem',
                    borderRadius: '100px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    color: '#4B5563',
                    background: '#F9FAFB',
                    border: '1px solid #E5E7EB',
                    fontFamily: 'Inter, sans-serif'
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className={styles.glowBehind} style={{ opacity: 0.3 }}></div>
          </div>
        </div>
      </div>
    </section>
  );
}
