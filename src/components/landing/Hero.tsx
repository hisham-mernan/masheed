"use client";

import Link from "next/link";
import styles from "./Hero.module.css";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className={styles.hero}>
      {/* Decorative SVG Calligraphy Animation */}
      <svg
        aria-hidden
        style={{
          position: "absolute",
          top: 0, right: 0, bottom: 0, left: 0,
          width: "100%", height: "100%",
          pointerEvents: "none",
          userSelect: "none",
          zIndex: 0
        }}
      >
        <motion.text
          x="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          style={{
            fontFamily: "var(--font-heading), 'Cairo', sans-serif",
            fontWeight: 900,
            fontSize: "35vw"
          }}
          fill="transparent"
          strokeDasharray="4000"
          initial={{ 
            strokeDashoffset: 4000, 
            strokeWidth: 4, 
            stroke: "rgba(133, 97, 173, 0.4)", // Primary color with opacity
            y: "70%", 
            opacity: 1 
          }}
          animate={{ 
            strokeDashoffset: 0, 
            strokeWidth: 1, 
            stroke: "rgba(133, 97, 173, 0.15)", // Faint background color
            y: "105%", 
            opacity: 0.6
          }}
          transition={{
            strokeDashoffset: { duration: 1.8, ease: "easeInOut" },
            strokeWidth: { duration: 1.2, delay: 1.8, ease: "easeInOut" },
            stroke: { duration: 1.2, delay: 1.8, ease: "easeInOut" },
            y: { duration: 1.2, delay: 1.8, ease: [0.22, 1, 0.36, 1] },
            opacity: { duration: 1.2, delay: 1.8, ease: "easeInOut" }
          }}
        >
          وقف
        </motion.text>
      </svg>

      <div className={styles.orb1}></div>
      <div className={styles.orb2}></div>

      <div className="container relative z-10">
        <div className={styles.content}>


          <h1 className={`${styles.title} fade-in-slow`} style={{ animationDelay: '2000ms' }}>
            أثر يبقى،
            <br />
            <span className="text-gradient" style={{ background: 'linear-gradient(135deg, var(--color-primary), #B28DFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>وقطاف لا ينقطع.</span>
          </h1>

          <p className={`${styles.subtitle} fade-in`} style={{ animationDelay: '2200ms' }}>
            منصة &quot;مَشيد&quot; تتيح لك إدارة وبناء أوقافك بذكاء. 
            أصلك محفوظ ومحوكم، وريعه نوجهه آلياً لمن تشاء بكل شفافية ويسر.
          </p>

          <div className={`${styles.actions} fade-in`} style={{ animationDelay: '2400ms' }}>
            <Link href="/dashboard" className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.05rem', borderRadius: 'var(--radius-full)' }}>
              ابدأ أثرك الآن
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20" style={{ transform: 'rotate(180deg)' }}>
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <a href="#how-it-works" className="btn-outline" style={{ padding: '1rem 2rem', fontSize: '1.05rem', borderRadius: 'var(--radius-full)' }}>
              كيف نعمل؟
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
