"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./GatewayHeader.module.css";

const MARKET_URL = process.env.NEXT_PUBLIC_WAQF_MARKET_URL || "http://localhost:3001";

export default function GatewayHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
      <div className={styles.headerInner}>
        <Link href="/gateway" className={styles.logoGroup}>
          <div className={styles.logoMark}>م</div>
          <span className={styles.logoText}>منظومة مَشيد</span>
        </Link>

        <nav className={styles.nav}>
          <a href="#erp" className={styles.navLink}>نظام الإدارة</a>
          <a href="#integration" className={styles.navLink}>التكامل</a>
          <a href="#souq" className={styles.navLink}>السوق الوقفي</a>
          <a href="#trust" className={styles.navLink}>الحوكمة</a>
        </nav>

        <div className={styles.actions}>
          <a href={MARKET_URL} className={styles.marketBtn}>
            السوق الوقفي
          </a>
          <Link href="/login" className="btn-primary" style={{ padding: "0.55rem 1.35rem", borderRadius: "var(--radius-full)" }}>
            دخول مَشيد
          </Link>
        </div>
      </div>
    </header>
  );
}
