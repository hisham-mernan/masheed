"use client";

import { motion } from "framer-motion";
import styles from "./ThreadDivider.module.css";

/**
 * خيط بسنارة — فاصل أنيميشن بين عالم النظام (بنفسجي) وعالم السوق (أخضر).
 * الخيط بيرسم نفسه بالسكرول، يكتب كلمة «السوق الوقفي»، ويخلص بسنارة.
 */
export default function ThreadDivider() {
  return (
    <section className={styles.divider} aria-hidden>
      <div className={styles.inner}>
        <svg viewBox="0 0 1200 240" className={styles.svg} fill="none">
          <defs>
            <linearGradient id="threadGrad" x1="1200" y1="0" x2="0" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#8561AD" />
              <stop offset="1" stopColor="#17573F" />
            </linearGradient>
          </defs>

          {/* الخيط المتعرج — يبدأ يمين (بنفسجي) ويخلص شمال (أخضر) */}
          <motion.path
            d="M1180 118 C 1075 38, 1005 205, 885 122 C 790 56, 745 188, 640 124 C 560 74, 520 178, 425 128 C 350 90, 295 168, 205 132 C 140 106, 85 148, 34 130"
            stroke="url(#threadGrad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true, margin: "-15%" }}
            transition={{ duration: 2.6, ease: "easeInOut" }}
          />

          {/* الكلمة اللي الخيط «بيكتبها» في المنتصف */}
          <motion.text
            x="600"
            y="118"
            textAnchor="middle"
            dominantBaseline="middle"
            className={styles.word}
            fill="transparent"
            strokeDasharray="3000"
            initial={{ strokeDashoffset: 3000, strokeWidth: 2.5, stroke: "#5B4A75" }}
            whileInView={{ strokeDashoffset: 0, strokeWidth: 1, stroke: "#17573F" }}
            viewport={{ once: true, margin: "-15%" }}
            transition={{
              strokeDashoffset: { duration: 2.2, delay: 0.7, ease: "easeInOut" },
              strokeWidth: { duration: 1, delay: 2.9, ease: "easeInOut" },
              stroke: { duration: 1, delay: 2.2, ease: "easeInOut" },
            }}
          >
            السوق الوقفي
          </motion.text>

          {/* السنارة — خط وابرة في طرف الخيط */}
          <motion.g
            initial={{ opacity: 0, y: -6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15%" }}
            transition={{ delay: 2.7, duration: 0.6, ease: "easeOut" }}
          >
            <path d="M34 130 L14 158" stroke="#17573F" strokeWidth="2.5" strokeLinecap="round" />
            <ellipse cx="11" cy="163" rx="5" ry="8" transform="rotate(-30 11 163)" stroke="#17573F" strokeWidth="2" />
          </motion.g>

          {/* غرزة صغيرة في بداية الخيط */}
          <motion.circle
            cx="1180"
            cy="118"
            r="4"
            fill="#8561AD"
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true, margin: "-15%" }}
            transition={{ delay: 0.1, duration: 0.4 }}
          />
        </svg>

        <motion.p
          className={styles.caption}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ delay: 3, duration: 0.8 }}
        >
          من الإدارة… إلى الاستثمار
        </motion.p>
      </div>
    </section>
  );
}
