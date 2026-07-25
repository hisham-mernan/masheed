"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./Header.module.css";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll reveal on mount
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('is-visible'); }),
      { threshold: 0.12 }
    );
    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const navLinks = [
    { href: "#solutions", label: "الحلول الرقمية" },
    { href: "#partners", label: "الشركاء" },
    { href: "#features", label: "المميزات" },
    { href: "#contact", label: "تواصل معنا" },
  ];

  return (
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ""}`}>
      <div className="container">
        <div className={`${styles.inner} ${isScrolled ? styles.innerScrolled : ""}`}>
          {/* Logo */}
          <Link href="/" className={styles.logo}>
            <div className={styles.logoIcon}>
              <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 2L34 11V25L18 34L2 25V11L18 2Z" stroke="white" strokeWidth="1.5" strokeOpacity="0.5"/>
                <path d="M18 8L28 14V22L18 28L8 22V14L18 8Z" fill="white" fillOpacity="0.12"/>
                <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="12" fontFamily="Cairo, sans-serif" fontWeight="700">م</text>
              </svg>
            </div>
            <div className={styles.logoTextContainer}>
              <span className={styles.logoAr}>مَشيد</span>
              <span className={styles.logoEn}>MASHEED ERP</span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className={`${styles.nav} ${mobileMenuOpen ? styles.navOpen : ""}`}>
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={styles.navLink}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {/* Mobile-only login link */}
            <Link href="/login" className={`${styles.navLink} ${styles.navLoginMobile}`} onClick={() => setMobileMenuOpen(false)}>
              تسجيل الدخول
            </Link>
          </nav>

          {/* Actions */}
          <div className={styles.actions}>
            <Link href="/login" className={styles.loginBtn}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/>
                <polyline points="10 17 15 12 10 7"/>
                <line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
              <span>الدخول</span>
            </Link>
            <button className="btn-primary">طلب نسخة تجريبية</button>

            {/* Mobile hamburger */}
            <button
              className={styles.hamburger}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <span className={`${styles.bar} ${mobileMenuOpen ? styles.bar1Open : ""}`}></span>
              <span className={`${styles.bar} ${mobileMenuOpen ? styles.bar2Open : ""}`}></span>
              <span className={`${styles.bar} ${mobileMenuOpen ? styles.bar3Open : ""}`}></span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
