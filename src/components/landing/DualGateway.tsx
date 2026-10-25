"use client";

import Link from "next/link";
import styles from "./DualGateway.module.css";
import { motion } from "framer-motion";

const MARKET_URL = process.env.NEXT_PUBLIC_WAQF_MARKET_URL || "http://localhost:3001";

export default function DualGateway() {
  return (
    <section className={styles.hero}>
      {/* Decorative SVG Calligraphy — نفس توقيع المنصتين */}
      <svg
        aria-hidden
        style={{
          position: "absolute",
          top: 0, right: 0, bottom: 0, left: 0,
          width: "100%", height: "100%",
          pointerEvents: "none",
          userSelect: "none",
          zIndex: 0,
        }}
      >
        <motion.text
          x="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          style={{
            fontFamily: "var(--font-heading), 'Cairo', sans-serif",
            fontWeight: 900,
            fontSize: "32vw",
          }}
          fill="transparent"
          strokeDasharray="4000"
          initial={{
            strokeDashoffset: 4000,
            strokeWidth: 4,
            stroke: "rgba(133, 97, 173, 0.45)",
            y: "70%",
            opacity: 1,
          }}
          animate={{
            strokeDashoffset: 0,
            strokeWidth: 1,
            stroke: "rgba(23, 87, 63, 0.14)",
            y: "105%",
            opacity: 0.6,
          }}
          transition={{
            strokeDashoffset: { duration: 1.8, ease: "easeInOut" },
            strokeWidth: { duration: 1.2, delay: 1.8, ease: "easeInOut" },
            stroke: { duration: 1.4, delay: 1.8, ease: "easeInOut" },
            y: { duration: 1.2, delay: 1.8, ease: [0.22, 1, 0.36, 1] },
            opacity: { duration: 1.2, delay: 1.8, ease: "easeInOut" },
          }}
        >
          أثر
        </motion.text>
      </svg>

      <div className={styles.orbPurple}></div>
      <div className={styles.orbGreen}></div>

      <div className="container relative z-10">
        <div className={styles.content}>
          <p className={`${styles.eyebrow} fade-in`} style={{ animationDelay: "2000ms" }}>
            منظومة موثوقة · متوافقة مع أحكام الشريعة · تخدم رؤية ٢٠٣٠
          </p>

          <h1 className={`${styles.title} fade-in-slow`} style={{ animationDelay: "2200ms" }}>
            إدارةٌ تحفظ الأصل،
            <br />
            <span className={styles.gradientText}>وسوقٌ يُنمّي الأثر.</span>
          </h1>

          <p className={`${styles.subtitle} fade-in`} style={{ animationDelay: "2400ms" }}>
            منظومة «مَشيد» تجمع نظام إدارة الأوقاف المؤسسي وسوق الاستثمار الوقفي الرقمي
            في مكان واحد — أصول محوكمة، صكوك موثوقة، وعوائد تصل لمستحقيها.
          </p>

          <div className={`${styles.actions} fade-in`} style={{ animationDelay: "2600ms" }}>
            <Link href="/login" className="btn-primary" style={{ padding: "1rem 2.1rem", fontSize: "1.05rem", borderRadius: "var(--radius-full)" }}>
              دخول نظام مَشيد
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20" style={{ transform: "rotate(180deg)" }}>
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <a href={MARKET_URL} className={styles.marketCta}>
              استكشف السوق الوقفي
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20" style={{ transform: "rotate(180deg)" }}>
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom hairline — زي شريط السوق */}
      <div className={styles.hairline}>
        <div className={styles.hairlineInner}>
          <span>الرياض، المملكة العربية السعودية</span>
          <span className={styles.hairlineMid}>نظام إدارة · سوق استثمار وقفي رقمي</span>
          <span>© ٢٠٢٦</span>
        </div>
      </div>
    </section>
  );
}
