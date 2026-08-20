"use client";

import React from "react";
import styles from "./DualLandingPage.module.css";

export default function DualLandingPage() {
  const systemUrl = process.env.NEXT_PUBLIC_SYSTEM_URL || "https://system.masheedwaqf.com";
  const investmentUrl = process.env.NEXT_PUBLIC_INVESTMENT_URL || "https://investment.masheedwaqf.com";

  return (
    <div className={styles.pageWrapper} dir="rtl">
      {/* Navbar Header */}
      <header className={styles.header}>
        <div className={styles.container}>
          <div className={styles.headerInner}>
            <a href="#" className={styles.brandLink}>
              <div className={styles.brandLogo}>م</div>
              <div className={styles.brandText}>
                <span className={styles.brandName}>مَشيد | MASHEED WAQF</span>
                <span className={styles.brandTagline}>منظومة الأوقاف الرقمية</span>
              </div>
            </a>

            <div className={styles.headerRight}>
              <span className={styles.domainPill}>masheedwaqf.com</span>
              <div className={styles.visionBadge}>
                <span className={styles.greenDot} />
                <span>رؤية المملكة 2030</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Hero Header */}
      <main className={styles.container}>
        <section className={styles.heroIntro}>
          <div className={styles.tagline}>
            ⚡ منصتان متخصصتان لحلول الأوقاف والاستثمار الرقمي
          </div>
          <h1 className={styles.mainTitle}>
            اختر الوجهة المناسبة <span className={styles.titleGradient}>لاحتياجاتك الوقفية</span>
          </h1>
          <p className={styles.subtitle}>
            منصة مَشيد تتيح حلولاً متكاملة لنظار ومؤسسات الأوقاف لإدارة الأصول والحوكمة، إلى جانب منصة مخصصة للواقفين والمستثمرين لتنمية الصكوك والفرص الوقفية.
          </p>
        </section>

        {/* Dual Interactive Portals */}
        <section className={styles.stageGrid}>
          {/* System Portal */}
          <div className={`${styles.portalCard} ${styles.systemPortal}`}>
            <div className={styles.portalGlow} />

            <div>
              <div className={styles.portalMeta}>
                <span className={`${styles.categoryTag} ${styles.systemTag}`}>
                  🏢 لإدارة وحوكمة الأوقاف
                </span>
                <span className={styles.urlCode}>system.masheedwaqf.com</span>
              </div>

              <h2 className={styles.portalTitle}>نظام مَشيد (Masheed System)</h2>
              <p className={styles.portalDesc}>
                المنصة السحابية المعتمدة لرقمنة إدارة العقارات الوقفية، القوائم المالية الوقفية، وتوزيع الريع وحوكمة العمليات بالكامل.
              </p>

              <div className={styles.personaCard}>
                <span className={styles.personaIcon}>🎯</span>
                <span className={styles.personaText}>
                  مخصص لـ <strong>النظار، مجالس الإدارة، والجمعيات الوقفية</strong>
                </span>
              </div>

              <div className={styles.pillsGrid}>
                <span className={styles.pillItem}>🏢 إدارة الأصول والعقارات</span>
                <span className={styles.pillItem}>📊 المحاسبة الوقفية والتقارير</span>
                <span className={styles.pillItem}>⚖️ الامتثال والحوكمة الذكية</span>
                <span className={styles.pillItem}>👥 حساب وتوزيع الريع آليًا</span>
              </div>
            </div>

            <div className={styles.ctaWrapper}>
              <a href={systemUrl} className={`${styles.actionButton} ${styles.systemBtn}`}>
                <span>دخول منصة الإدارة</span>
                <span className={styles.arrowSymbol}>←</span>
              </a>
            </div>
          </div>

          {/* Investment Portal */}
          <div className={`${styles.portalCard} ${styles.investmentPortal}`}>
            <div className={styles.portalGlow} />

            <div>
              <div className={styles.portalMeta}>
                <span className={`${styles.categoryTag} ${styles.investmentTag}`}>
                  📈 للواقفين والاستثمار الوقفي
                </span>
                <span className={styles.urlCode}>investment.masheedwaqf.com</span>
              </div>

              <h2 className={styles.portalTitle}>استثمار الأوقاف (Waqf by Masheed)</h2>
              <p className={styles.portalDesc}>
                منصة رقمية موثقة تتيح تملك أسهم وصكوك وقفيّة رقمية، المساهمة في المشاريع التنموية، وتتبع الأثر والعوائد بلمسة زر.
              </p>

              <div className={styles.personaCard}>
                <span className={styles.personaIcon}>🎯</span>
                <span className={styles.personaText}>
                  مخصص لـ <strong>الواقفين، المستثمرين، والمتبرعين</strong>
                </span>
              </div>

              <div className={styles.pillsGrid}>
                <span className={styles.pillItem}>🪙 التوكنة والأسهم الوقفية</span>
                <span className={styles.pillItem}>📜 صكوك وقفيّة إلكترونية</span>
                <span className={styles.pillItem}>📈 فرص استثمارية عالية الأثر</span>
                <span className={styles.pillItem}>🎯 لوحة تتبع الأثر والعوائد</span>
              </div>
            </div>

            <div className={styles.ctaWrapper}>
              <a href={investmentUrl} className={`${styles.actionButton} ${styles.investmentBtn}`}>
                <span>تصفح الفرص الاستثمارية</span>
                <span className={styles.arrowSymbol}>←</span>
              </a>
            </div>
          </div>
        </section>

        {/* Quick Decision Guide */}
        <section className={styles.quickGuide}>
          <h3 className={styles.guideTitle}>كيف تختار المنصة المناسبة؟</h3>

          <div className={styles.guideGrid}>
            <div className={styles.guideBox}>
              <div className={styles.guideBoxHeader}>
                <span className={styles.guideBoxName}>نظام مَشيد (System)</span>
                <span className={styles.guideBoxTarget}>النظار والمؤسسات</span>
              </div>
              <p className={styles.guideBoxDesc}>
                إذا كنت تدير وقفًا قائماً وتحتاج إلى نظام محاسبي وإداري لتنظيم العقارات والمستفيدين والتقارير الرقابية.
              </p>
            </div>

            <div className={styles.guideBox}>
              <div className={styles.guideBoxHeader}>
                <span className={styles.guideBoxName}>استثمار الأوقاف (Investment)</span>
                <span className={styles.guideBoxTarget}>الواقفون والمساهمون</span>
              </div>
              <p className={styles.guideBoxDesc}>
                إذا كنت ترغب في المساهمة بوقف جديد، شراء أسهم أو صكوك وقفيّة، أو متابعة العوائد والأثر الاجتماعي لمساهماتك.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Minimal Footer */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerRow}>
            <p>© 2026 مَشيد للأوقاف | جميع الحقوق محفوظة</p>
            <ul className={styles.footerNav}>
              <li><a href={systemUrl} className={styles.footerNavLink}>نظام الإدارة</a></li>
              <li><a href={investmentUrl} className={styles.footerNavLink}>استثمار الأوقاف</a></li>
              <li><a href="#" className={styles.footerNavLink}>الخصوصية والشروط</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
