"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import styles from "./Hero.module.css";

export default function Hero() {
  const counterRefs = useRef<HTMLSpanElement[]>([]);

  useEffect(() => {
    const targets = [450, 99, 10];
    const suffixes = ["+", "٪", "+"];
    counterRefs.current.forEach((el, i) => {
      if (!el) return;
      let count = 0;
      const target = targets[i];
      const step = target / 50;
      const timer = setInterval(() => {
        count = Math.min(count + step, target);
        el.textContent = Math.floor(count).toLocaleString("ar-EG") + suffixes[i];
        if (count >= target) clearInterval(timer);
      }, 30);
    });
  }, []);

  return (
    <section className={styles.hero}>
      {/* Background glow orbs */}
      <div className={styles.orb1}></div>
      <div className={styles.orb2}></div>
      <div className={styles.gridOverlay}></div>

      <div className="container">
        <div className={styles.grid}>
          {/* Content */}
          <div className={styles.content}>
            <div className={`${styles.badge} badge-primary`}>
              <span className="pulse-dot"></span>
              خدمة رؤية المملكة ٢٠٣٠
            </div>

            <h1 className={styles.title}>
              إدارة الأوقاف بذكاء{" "}
              <span className={styles.highlight}>ونظام مالي</span>
              <br />
              متكامل (System & Tokenization)
            </h1>

            <p className={styles.subtitle}>
              منصة <strong>مَشيد</strong> هي أول نظام مبني خصيصاً لقطاع الأوقاف.
              حوّل أوقافك إلى حصص مدمجة (Tokenized Waqf)، قم بأتمتة التوزيعات المالية للمستفيدين،
              وحقق أعلى معايير الحوكمة والامتثال وفق <strong>رؤية ٢٠٣٠</strong>.
            </p>

            <div className={styles.ctaGroup}>
              <Link href="/register" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="17" height="17">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                </svg>
                ابدأ رحلة الرقمنة الآن
              </Link>
              <Link href="/login" className="btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="17" height="17">
                  <circle cx="12" cy="12" r="10"/>
                  <polygon points="10 8 16 12 10 16 10 8"/>
                </svg>
                تسجيل الدخول للنظام
              </Link>
            </div>

            {/* Animated Counters */}
            <div className={styles.counters}>
              <div className={styles.counter}>
                <span
                  className={styles.counterVal}
                  ref={el => { if (el) counterRefs.current[0] = el; }}
                >٠</span>
                <span className={styles.counterLabel}>أصل وقفي مدار</span>
              </div>
              <div className={styles.divider}></div>
              <div className={styles.counter}>
                <span
                  className={styles.counterVal}
                  ref={el => { if (el) counterRefs.current[1] = el; }}
                >٠</span>
                <span className={styles.counterLabel}>امتثال نظامي</span>
              </div>
              <div className={styles.divider}></div>
              <div className={styles.counter}>
                <span
                  className={styles.counterVal}
                  ref={el => { if (el) counterRefs.current[2] = el; }}
                >٠</span>
                <span className={styles.counterLabel}>موديول متخصص</span>
              </div>
            </div>
          </div>

          {/* Visual – Animated Dashboard Mockup */}
          <div className={styles.visual}>
            <div className={styles.mockupWrapper}>
              {/* Floating stats cards */}
              <div className={`${styles.floatCard} ${styles.floatCard1}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <path d="M3 3v18h18"/>
                  <polyline points="18 9 12 15 9 12 3 18"/>
                </svg>
                <div>
                  <div className={styles.floatVal}>+١٨.٥٪</div>
                  <div className={styles.floatLabel}>نمو العوائد</div>
                </div>
              </div>

              <div className={`${styles.floatCard} ${styles.floatCard2}`}>
                <div className={styles.statusDot}></div>
                <div className={styles.floatLabel}>متوافق مع ZATCA</div>
              </div>

              {/* Main dashboard mockup SVG */}
              <div className={styles.dashboardMockup}>
                <div className={styles.mockHeader}>
                  <div className={styles.mockDots}>
                    <span></span><span></span><span></span>
                  </div>
                  <div className={styles.mockTitle}>مَشيد | لوحة التحكم</div>
                  <div className={styles.mockBadge}>
                    <span></span>مباشر
                  </div>
                </div>

                <div className={styles.mockBody}>
                  {/* Mini stat cards */}
                  <div className={styles.mockStats}>
                    {[
                      { label: "إجمالي الأصول", val: "٤٥٠م", color: "#8561AD" },
                      { label: "الريع الشهري", val: "١٢.٤م", color: "#10B981" },
                      { label: "المصارف", val: "٩.٢م", color: "#F59E0B" },
                    ].map((s, i) => (
                      <div key={i} className={styles.mockStat}>
                        <div className={styles.mockStatBar} style={{ background: s.color + "22" }}>
                          <div className={styles.mockStatFill} style={{ background: s.color, width: `${65 + i * 10}%` }}></div>
                        </div>
                        <div className={styles.mockStatVal} style={{ color: s.color }}>{s.val}</div>
                        <div className={styles.mockStatLabel}>{s.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Chart area */}
                  <div className={styles.mockChart}>
                    <svg viewBox="0 0 280 100" className={styles.chartSvg} preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8561AD" stopOpacity="0.35"/>
                          <stop offset="100%" stopColor="#8561AD" stopOpacity="0"/>
                        </linearGradient>
                      </defs>
                      <path
                        d="M0,80 C30,75 50,65 70,55 S110,30 140,25 S190,35 220,28 S260,10 280,5"
                        fill="none" stroke="#8561AD" strokeWidth="2.5" strokeLinecap="round"
                        strokeDasharray="600" strokeDashoffset="600"
                        className={styles.chartLine}
                      />
                      <path
                        d="M0,80 C30,75 50,65 70,55 S110,30 140,25 S190,35 220,28 S260,10 280,5 L280,100 L0,100 Z"
                        fill="url(#heroGrad)"
                        opacity="0"
                        className={styles.chartArea}
                      />
                    </svg>
                  </div>

                  {/* Asset rows */}
                  <div className={styles.mockRows}>
                    {["برج الخزامى", "مزرعة النخيل", "عمارة العليا"].map((name, i) => (
                      <div key={i} className={styles.mockRow}>
                        <div className={styles.mockRowDot} style={{ background: ["#8561AD", "#10B981", "#F59E0B"][i] }}></div>
                        <div className={styles.mockRowName}>{name}</div>
                        <div className={styles.mockRowBar}>
                          <div className={styles.mockRowFill} style={{ width: `${80 - i * 18}%`, background: ["#8561AD", "#10B981", "#F59E0B"][i] }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Glow behind mockup */}
              <div className={styles.mockGlow}></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
