"use client";

import React from "react";
import styles from "./DualLandingPage.module.css";

export default function DualLandingPage() {
  const systemUrl = process.env.NEXT_PUBLIC_SYSTEM_URL || "https://system.masheedwaqf.com";
  const investmentUrl = process.env.NEXT_PUBLIC_INVESTMENT_URL || "https://investment.masheedwaqf.com";

  return (
    <div className={styles.pageWrapper} dir="rtl">
      {/* Background ambient lighting */}
      <div className={styles.glowTopLeft} />
      <div className={styles.glowBottomRight} />

      {/* Navigation Header */}
      <header className={styles.header}>
        <div className={styles.container}>
          <div className={styles.headerInner}>
            <div className={styles.brand}>
              <div className={styles.brandIcon}>م</div>
              <div>
                <span className={styles.brandTitle}>مَشيد | MASHEED WAQF</span>
              </div>
              <span className={styles.domainBadge}>masheedwaqf.com</span>
            </div>

            <div className={styles.headerActions}>
              <div className={styles.saudiBadge}>
                <span className={styles.saudiDot} />
                <span>رؤية المملكة 2030</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Hero Header */}
      <main className={styles.container}>
        <section className={styles.heroSection}>
          <div className={styles.heroTagline}>
            ✨ المنظومة المتكاملة للحلول والاستثمارات الوقفية الرقمية
          </div>
          <h1 className={styles.heroTitle}>
            مرحبًا بك في بوابة <span className={styles.heroTitleGradient}>مَشيد للأوقاف</span>
          </h1>
          <p className={styles.heroDescription}>
            اختر المنصة المخصصة لاحتياجاتك: سواء كنت ناظرًا يبحث عن نظام إدارة وحوكمة شامل للأوقاف، أو واقفًا ومستثمرًا يرغب في استكشاف وتملك الأسهم والصكوك الوقفية الرقمية.
          </p>
        </section>

        {/* Dual Split Cards Grid */}
        <section className={styles.splitGrid}>
          {/* Section 1: Masheed System */}
          <div className={`${styles.productCard} ${styles.systemCard}`}>
            <div className={styles.cardGlowOverlay} />

            <div className={styles.cardHeader}>
              <div className={styles.cardTopRow}>
                <span className={`${styles.cardBadge} ${styles.systemBadge}`}>
                  🏢 نظام إدارة وحوكمة الأوقاف
                </span>
                <span className={styles.urlTag}>system.masheedwaqf.com</span>
              </div>

              <h2 className={styles.cardTitle}>نظام مَشيد (Masheed System)</h2>
              <p className={styles.cardSubtitle}>
                منصة سحابية متكاملة لرقمنة وتسهيل إدارة الأصول الوقفية، المحاسبة المالية الوقفية، وتوزيع الريع، مع ضمان الامتثال للجهات الرقابية.
              </p>
            </div>

            <div className={styles.audienceBox}>
              <span className={styles.audienceLabel}>🎯 الفئة المستهدفة:</span>
              <span>النظار، مجلس الإدارة، الجمعيات الأهلية، والمؤسسات الوقفية</span>
            </div>

            <ul className={styles.featuresList}>
              <li className={styles.featureItem}>
                <div className={`${styles.featureIconCircle} ${styles.systemIconCircle}`}>✓</div>
                <div>
                  <strong>إدارة الأصول والعقارات الوقفية:</strong> تتبع شامل لجميع العقارات والأصول وعقود الإيجار والصيانة.
                </div>
              </li>
              <li className={styles.featureItem}>
                <div className={`${styles.featureIconCircle} ${styles.systemIconCircle}`}>✓</div>
                <div>
                  <strong>المحاسبة والتقارير المعتمدة:</strong> شجرة حسابات وقفيّة مخصصة، قوائم مالية آليّة، وتقارير الشفافية.
                </div>
              </li>
              <li className={styles.featureItem}>
                <div className={`${styles.featureIconCircle} ${styles.systemIconCircle}`}>✓</div>
                <div>
                  <strong>حساب وتوزيع الريع الوقفي:</strong> خوارزميات دقيقة لحساب حصص المستفيدين وصرفها آليًا وموثقًا.
                </div>
              </li>
              <li className={styles.featureItem}>
                <div className={`${styles.featureIconCircle} ${styles.systemIconCircle}`}>✓</div>
                <div>
                  <strong>الامتثال والحوكمة الذكية:</strong> متوافق مع متطلبات الهيئة العامة للأوقاف والجهات التنظيمية.
                </div>
              </li>
            </ul>

            <div className={styles.cardFooter}>
              <a href={systemUrl} className={`${styles.ctaButton} ${styles.systemCta}`}>
                <span>الانتقال إلى نظام مشيد</span>
                <span className={styles.arrowIcon}>←</span>
              </a>
            </div>
          </div>

          {/* Section 2: Waqf by Masheed */}
          <div className={`${styles.productCard} ${styles.investmentCard}`}>
            <div className={styles.cardGlowOverlay} />

            <div className={styles.cardHeader}>
              <div className={styles.cardTopRow}>
                <span className={`${styles.cardBadge} ${styles.investmentBadge}`}>
                  📈 منصة الاستثمار والتوكنة الوقفية
                </span>
                <span className={styles.urlTag}>investment.masheedwaqf.com</span>
              </div>

              <h2 className={styles.cardTitle}>استثمار الأوقاف (Waqf by Masheed)</h2>
              <p className={styles.cardSubtitle}>
                منصة رقمية موثقة تتيح تملك أسهم وصكوك وقفيّة، تمويل المشاريع الوقفية، وتتبع العوائد والأثر الاجتماعي بلمسة زر.
              </p>
            </div>

            <div className={styles.audienceBox}>
              <span className={styles.audienceLabel}>🎯 الفئة المستهدفة:</span>
              <span>الواقفون، المستثمرون، المساهمون، والراغبون في الوقف المستدام</span>
            </div>

            <ul className={styles.featuresList}>
              <li className={styles.featureItem}>
                <div className={`${styles.featureIconCircle} ${styles.investmentIconCircle}`}>✓</div>
                <div>
                  <strong>فرص استثمارية وقفيّة متنوعة:</strong> مشاريع وقفيّة عقارية، تنموية، وصحية مدرّة للعوائد.
                </div>
              </li>
              <li className={styles.featureItem}>
                <div className={`${styles.featureIconCircle} ${styles.investmentIconCircle}`}>✓</div>
                <div>
                  <strong>التوكنة والأسهم الوقفية:</strong> إمكانية المساهمة بأسهم وقفيّة رقمية موثقة وسهلة التداول والتخصيص.
                </div>
              </li>
              <li className={styles.featureItem}>
                <div className={`${styles.featureIconCircle} ${styles.investmentIconCircle}`}>✓</div>
                <div>
                  <strong>صكوك وقفيّة إلكترونية:</strong> إصدار صكوك وقفيّة رقمية فورية موثقة بأسماء المساهمين.
                </div>
              </li>
              <li className={styles.featureItem}>
                <div className={`${styles.featureIconCircle} ${styles.investmentIconCircle}`}>✓</div>
                <div>
                  <strong>لوحة أثر وعوائد الاستثمار:</strong> متابعة شفافة ومباشرة للأثر التنموي والعوائد الموزعة على المصارف.
                </div>
              </li>
            </ul>

            <div className={styles.cardFooter}>
              <a href={investmentUrl} className={`${styles.ctaButton} ${styles.investmentCta}`}>
                <span>الانتقال إلى استثمار الأوقاف</span>
                <span className={styles.arrowIcon}>←</span>
              </a>
            </div>
          </div>
        </section>

        {/* Feature Comparison Table */}
        <section className={styles.comparisonSection}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>مقارنة سريعة بين المنتجين</h3>
            <p className={styles.sectionSub}>اختر المنصة المناسبة بناءً على دورك واحتياجك</p>
          </div>

          <div className={styles.comparisonTableWrapper}>
            <table className={styles.comparisonTable}>
              <thead>
                <tr>
                  <th>الميزة / الخاصية</th>
                  <th>نظام مَشيد (System)</th>
                  <th>استثمار الأوقاف (Waqf Investment)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>المستخدم الرئيسي</strong></td>
                  <td>النظار والمؤسسات الوقفية</td>
                  <td>الواقفون والمستثمرون</td>
                </tr>
                <tr>
                  <td><strong>إدارة المحاسبة والأصول الوقفية</strong></td>
                  <td><span className={styles.checkIcon}>✓ متوفر بكامل المميزات</span></td>
                  <td><span className={styles.dashIcon}>—</span></td>
                </tr>
                <tr>
                  <td><strong>المساهمة وشراء أسهم/صكوك وقفيّة</strong></td>
                  <td><span className={styles.dashIcon}>—</span></td>
                  <td><span className={styles.checkIcon}>✓ متوفر آليًا</span></td>
                </tr>
                <tr>
                  <td><strong>توزيع ريع المستفيدين والتقارير الرقابية</strong></td>
                  <td><span className={styles.checkIcon}>✓ شامل وتلقائي</span></td>
                  <td><span className={styles.dashIcon}>—</span></td>
                </tr>
                <tr>
                  <td><strong>لوحة تتبع الأثر والعوائد الاستثمارية</strong></td>
                  <td><span className={styles.checkIcon}>✓ تقارير إدارية</span></td>
                  <td><span className={styles.checkIcon}>✓ لوحة للمستثمرين</span></td>
                </tr>
                <tr>
                  <td><strong>رابط الوصول المباشر</strong></td>
                  <td><code style={{ color: '#D8C4EE' }}>system.masheedwaqf.com</code></td>
                  <td><code style={{ color: '#6EE7B7' }}>investment.masheedwaqf.com</code></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Trust & Metrics Banner */}
        <section className={styles.trustBanner}>
          <div className={styles.trustItem}>
            <div className={styles.trustNumber}>100%</div>
            <div className={styles.trustLabel}>امتثال للشريعة الإسلامية وأنظمة الأوقاف</div>
          </div>
          <div className={styles.trustItem}>
            <div className={styles.trustNumber}>2030</div>
            <div className={styles.trustLabel}>متحالف مع أهداف رؤية المملكة للقطاع غير الربحي</div>
          </div>
          <div className={styles.trustItem}>
            <div className={styles.trustNumber}>256-bit</div>
            <div className={styles.trustLabel}>تشفير عالي الأمان وحماية البيانات</div>
          </div>
          <div className={styles.trustItem}>
            <div className={styles.trustNumber}>24/7</div>
            <div className={styles.trustLabel}>دعم فني واستشارات متخصصة للأوقاف</div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerInner}>
            <div>
              <p>© 2026 مَشيد للأوقاف والاستثمار | جميع الحقوق محفوظة</p>
            </div>
            <ul className={styles.footerLinks}>
              <li><a href={systemUrl} className={styles.footerLink}>نظام مشيد</a></li>
              <li><a href={investmentUrl} className={styles.footerLink}>استثمار الأوقاف</a></li>
              <li><a href="#" className={styles.footerLink}>الشروط والأحكام</a></li>
              <li><a href="#" className={styles.footerLink}>سياسة الخصوصية</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
