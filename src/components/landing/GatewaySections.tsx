import Link from "next/link";
import styles from "./GatewaySections.module.css";
import ThreadDivider from "./ThreadDivider";

const MARKET_URL = process.env.NEXT_PUBLIC_WAQF_MARKET_URL || "http://localhost:3001";

/* أيقونات رفيعة — stroke واحد، بدون إيموجي */
const ICONS = {
  registry: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="26" height="26">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="26" height="26">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" />
    </svg>
  ),
  chart: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="26" height="26">
      <path d="M3 3v18h18" /><path d="M7 14l4-4 3 3 5-6" />
    </svg>
  ),
  coins: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="26" height="26">
      <circle cx="8" cy="8" r="6" /><path d="M18.09 10.37A6 6 0 1 1 10.34 18" /><path d="M7 6h1v4" /><path d="M16.71 13.88l.7.71-2.82 2.82" />
    </svg>
  ),
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="26" height="26">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  doc: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="26" height="26">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M9 15l2 2 4-4" />
    </svg>
  ),
  building: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="26" height="26">
      <rect x="4" y="2" width="16" height="20" rx="1" /><path d="M9 22v-4h6v4" /><path d="M8 6h.01M16 6h.01M12 6h.01M8 10h.01M16 10h.01M12 10h.01M8 14h.01M16 14h.01M12 14h.01" />
    </svg>
  ),
  leaf: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="26" height="26">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" /><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  ),
  arrow: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" style={{ transform: "rotate(180deg)" }}>
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  ),
};

/* ───────── شريط الأرقام ───────── */
const STATS = [
  { value: "+١٢٠", label: "وقف مُدار على المنظومة" },
  { value: "٥٠ مليون", label: "ريال عوائد موجّهة للخير" },
  { value: "+١٠ آلاف", label: "واقف ومستثمر مساهم" },
  { value: "١٠٠٪", label: "اعتمادات موثقة بسلسلة حوكمة" },
];

function StatsBand() {
  return (
    <section className={styles.statsBand}>
      <div className={styles.statsGrid}>
        {STATS.map((s) => (
          <div key={s.label} className={styles.statItem}>
            <p className={styles.statValue}>{s.value}</p>
            <p className={styles.statLabel}>{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ───────── قسم نظام الإدارة ───────── */
const ERP_FEATURES = [
  { icon: ICONS.registry, title: "سجل الأصول والصكوك", desc: "أصول، وحدات، عقود، ووثائق رسمية بسجل واحد موثق لكل وقف." },
  { icon: ICONS.coins, title: "العناية والزكاة", desc: "دورة العناية الوقفية، حساب الزكاة، والتقارير الشرعية بضغطة." },
  { icon: ICONS.shield, title: "حوكمة Maker–Checker", desc: "لا عملية تُنفَّذ وحدها — طلب، اعتماد، وتوقيع موثق في كل خطوة." },
  { icon: ICONS.chart, title: "الاستثمارات والتوزيعات", desc: "محافظ الوقف، توزيع الريع على المستحقين، وموازنات سنوية." },
  { icon: ICONS.users, title: "الاستشارات والخبراء", desc: "مجلس خبراء شرعيين وماليين، ومساعد ذكي يجيب عن لوائح وقفك." },
  { icon: ICONS.doc, title: "تقارير PDF بالهوية", desc: "تقرير مصمم بهوية مَشيد والوقف لكل قسم — نظرة عامة، صيانة، زكاة، وأكثر." },
];

function ErpSection() {
  return (
    <section id="erp" className={styles.section}>
      <div className="container">
        <div className={`${styles.sectionHead} reveal`}>
          <span className="section-tag">مَشيد — نظام إدارة الأوقاف</span>
          <h2 className={styles.sectionTitle}>
            كل شؤون وقفك،
            <br />
            في نظامٍ واحد
          </h2>
          <p className={styles.sectionDesc}>
            من تأسيس الوقف وسجله الرسمي، إلى العناية والزكاة والتوزيعات —
            دورة كاملة يديرها فريقك بصلاحيات واضحة واعتمادات موثقة.
          </p>
        </div>

        <div className={`${styles.erpGrid} reveal`}>
          {ERP_FEATURES.map((f, i) => (
            <div key={f.title} className={styles.erpCard}>
              <span className={styles.cardNum}>{["٠١", "٠٢", "٠٣", "٠٤", "٠٥", "٠٦"][i]}</span>
              <span className={styles.cardIcon}>{f.icon}</span>
              <h3 className={styles.cardTitle}>{f.title}</h3>
              <p className={styles.cardDesc}>{f.desc}</p>
            </div>
          ))}
        </div>

        <div className={`${styles.sectionCta} reveal`}>
          <Link href="/login" className="btn-outline" style={{ borderRadius: "var(--radius-full)", padding: "0.85rem 2rem" }}>
            دخول نظام الإدارة {ICONS.arrow}
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ───────── قسم التكامل ───────── */
const FLOW = [
  { title: "جهّز وقفك في النظام", desc: "سجل الأصول، أنشئ الحوكمة، واطلب تقييم الجاهزية للطرح." },
  { title: "اعتماد موثق", desc: "طلب الطرح يمر بسلسلة اعتمادات Maker–Checker داخل مَشيد." },
  { title: "يظهر في السوق", desc: "فور الاعتماد يُدرج الوقف في السوق الوقفي أمام الواقفين والمستثمرين." },
];

function IntegrationSection() {
  return (
    <section id="integration" className={styles.integration}>
      <div className="container">
        <div className={`${styles.sectionHead} reveal`}>
          <span className="section-tag" style={{ background: "linear-gradient(120deg, var(--color-primary-light), #E4EFE9)", color: "#4A3B63" }}>
            التكامل بين المنظومة والسوق
          </span>
          <h2 className={styles.sectionTitle}>
            من الإدارة إلى الطرح،
            <br />
            بلا وسيط ولا إعادة إدخال
          </h2>
        </div>

        <div className={`${styles.flowGrid} reveal`}>
          {FLOW.map((step, i) => (
            <div key={step.title} className={styles.flowStep}>
              <span className={styles.flowNum}>{["٠١", "٠٢", "٠٣"][i]}</span>
              <h3 className={styles.flowTitle}>{step.title}</h3>
              <p className={styles.flowDesc}>{step.desc}</p>
              {i < FLOW.length - 1 && <span className={styles.flowArrow}>{ICONS.arrow}</span>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────── قسم السوق الوقفي ───────── */
const SOUQ_TYPES = [
  { icon: ICONS.building, title: "أوقاف عقارية", desc: "مجمعات سكنية وتجارية بعوائد ثابتة من الإيجارات.", badge: "للسعوديين" },
  { icon: ICONS.coins, title: "أوقاف نقدية", desc: "محافظ مالية استثمارية بعوائد تشغيلية — متاحة للمواطن والمقيم.", badge: "للجميع" },
  { icon: ICONS.leaf, title: "أوقاف زراعية", desc: "مزارع نخيل وحبوب بعوائد موسمية من المحاصيل.", badge: "للسعوديين" },
];

function SouqSection() {
  return (
    <section id="souq" className={styles.souq}>
      <div className="container">
        <div className={`${styles.sectionHead} reveal`}>
          <span className={styles.souqTag}>وقف باي مَشيد — السوق الوقفي</span>
          <h2 className={styles.sectionTitle}>
            صكوك وقفية رقمية،
            <br />
            <span style={{ color: "#17573F" }}>أصل محفوظ وريع موجّه</span>
          </h2>
          <p className={styles.sectionDesc}>
            المنصة تتيح شراء صكوك وقفية في أوقاف متنوعة — عادية أو موّكنة —
            للمواطن والمقيم. أصلك لا يُباع، وريعه توجّهه لمن تشاء من مستحقي الخير.
          </p>
        </div>

        <div className={`${styles.souqGrid} reveal`}>
          {SOUQ_TYPES.map((t) => (
            <div key={t.title} className={styles.souqCard}>
              <span className={styles.souqBadge}>{t.badge}</span>
              <span className={styles.souqIcon}>{t.icon}</span>
              <h3 className={styles.souqCardTitle}>{t.title}</h3>
              <p className={styles.souqCardDesc}>{t.desc}</p>
              <span className={styles.souqExplore}>استكشف {ICONS.arrow}</span>
            </div>
          ))}
        </div>

        <div className={`${styles.sectionCta} reveal`}>
          <a href={MARKET_URL} className={styles.souqCta}>
            دخول السوق الوقفي {ICONS.arrow}
          </a>
        </div>
      </div>
    </section>
  );
}

/* ───────── قسم الحوكمة ───────── */
const TRUST = [
  { icon: ICONS.shield, title: "توافق شرعي", desc: "ضوابط الوقف وفق أحكام الشريعة معتمدة في كل عملية." },
  { icon: ICONS.users, title: "فصل الصلاحيات", desc: "أدوار واضحة: ناظر، مدير، معتمد — لا أحد يتحكم وحده." },
  { icon: ICONS.doc, title: "سجل تدقيق", desc: "كل إجراء موثق بمن قام به ومتى — قابل للمراجعة دائماً." },
  { icon: ICONS.registry, title: "بيانات في المملكة", desc: "استضافة محلية وامتثال كامل للأنظمة السعودية." },
];

function TrustSection() {
  return (
    <section id="trust" className={styles.section}>
      <div className="container">
        <div className={`${styles.sectionHead} reveal`}>
          <span className="section-tag">الأمان والحوكمة</span>
          <h2 className={styles.sectionTitle}>ثقة مبنية على ضوابط</h2>
        </div>

        <div className={`${styles.trustGrid} reveal`}>
          {TRUST.map((t) => (
            <div key={t.title} className={styles.trustItem}>
              <span className={styles.trustIcon}>{t.icon}</span>
              <h3 className={styles.trustTitle}>{t.title}</h3>
              <p className={styles.trustDesc}>{t.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────── الدعوة الأخيرة ───────── */
function FinalCta() {
  return (
    <section className={styles.finalCta}>
      <div className="container reveal" style={{ textAlign: "center" }}>
        <p className={styles.finalEyebrow}>ابدأ اليوم</p>
        <h2 className={styles.finalTitle}>
          جاهز تبني <span className={styles.finalAccent}>أثرك؟</span>
        </h2>
        <p className={styles.finalDesc}>
          سواء كنت ناظراً يدير أوقافاً قائمة، أو واقفاً يبحث عن أثرٍ يبقى —
          منظومة مَشيد معك من أول خطوة.
        </p>
        <div className={styles.finalActions}>
          <Link href="/register" className={styles.finalBtnLight}>أنشئ وقفك الآن</Link>
          <a href={MARKET_URL} className={styles.finalBtnSand}>تصفّح الصكوك الوقفية</a>
        </div>
      </div>
    </section>
  );
}

export default function GatewaySections() {
  return (
    <>
      <StatsBand />
      <ErpSection />
      <IntegrationSection />
      <ThreadDivider />
      <SouqSection />
      <TrustSection />
      <FinalCta />
    </>
  );
}
