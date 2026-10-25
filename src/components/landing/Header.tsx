"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./Header.module.css";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
      <div className={styles.headerInner}>
        <Link href="/" className={styles.logoGroup}>
          <div className={styles.logoMark}>م</div>
          <span className={styles.logoText}>مَشيد | MASHEED</span>
        </Link>
        
        <nav className={styles.nav}>
          <a href="#solutions" className={styles.navLink}>الحلول</a>
          <a href="#features" className={styles.navLink}>المميزات</a>
          <a href="#partners" className={styles.navLink}>الشركاء</a>
          <Link href="/dashboard" className="btn-primary" style={{ padding: '0.5rem 1.25rem', borderRadius: 'var(--radius-full)' }}>
            دخول للمنصة
          </Link>
        </nav>
      </div>
    </header>
  );
}
