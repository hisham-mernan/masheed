"use client";

import styles from "./Partners.module.css";

const partners = [
  {
    abbr: "GAW",
    nameAr: "الهيئة العامة للأوقاف",
    nameEn: "General Authority for Awqaf",
    color: "#1B5E20",
  },
  {
    abbr: "MOJ",
    nameAr: "وزارة العدل",
    nameEn: "Ministry of Justice",
    color: "#0D47A1",
  },
  {
    abbr: "ZATCA",
    nameAr: "هيئة الزكاة والضريبة والجمارك",
    nameEn: "ZATCA Phase 2",
    color: "#7B1FA2",
  },
  {
    abbr: "NCA",
    nameAr: "الهيئة الوطنية للأمن السيبراني",
    nameEn: "Nat. Cybersecurity Authority",
    color: "#E65100",
  },
  {
    abbr: "2030",
    nameAr: "رؤية المملكة",
    nameEn: "Saudi Vision 2030",
    color: "#006064",
  },
];

function PartnerCard({ p }: { p: typeof partners[0] }) {
  return (
    <div className={styles.partnerCard}>
      <div className={styles.partnerLogo} style={{ background: p.color + "15", borderColor: p.color + "30" }}>
        <span className={styles.partnerAbbr} style={{ color: p.color }}>{p.abbr}</span>
      </div>
      <div className={styles.partnerInfo}>
        <span className={styles.partnerNameAr}>{p.nameAr}</span>
        <span className={styles.partnerNameEn}>{p.nameEn}</span>
      </div>
    </div>
  );
}

export default function Partners() {
  return (
    <section id="partners" className={styles.partners}>
      <div className="container">
        <p className={styles.label}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          توافق تنظيمي وشراكة استراتيجية مع
        </p>
      </div>

      {/* Marquee track */}
      <div className={styles.marqueeWrapper}>
        <div className={styles.fadeLeft}></div>
        <div className={styles.fadeRight}></div>
        <div className={styles.marqueeTrack}>
          {[...partners, ...partners].map((p, i) => (
            <PartnerCard key={i} p={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
