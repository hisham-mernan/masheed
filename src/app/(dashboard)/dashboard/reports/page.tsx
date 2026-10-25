import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { getWaqfScope, scopeLabel } from "@/lib/waqf-scope";
import styles from "./reports.module.css";

const PERIODS = [
  { id: "month", label: "آخر شهر", labelEn: "Last Month" },
  { id: "quarter", label: "آخر 3 أشهر", labelEn: "Last Quarter" },
  { id: "year", label: "آخر سنة", labelEn: "Last Year" },
  { id: "all", label: "كل الفترات", labelEn: "All Time" },
];

const REPORTS = [
  {
    type: "overview",
    title: "التقرير العام الشامل",
    titleEn: "Executive Overview",
    desc: "ملخص أداء الوقف: الأصول، الريع، المصروفات، التوزيعات، المستفيدون، والمهام — مع رسم بياني شهري.",
    icon: "📊",
    color: "#8561AD",
  },
  {
    type: "assets",
    title: "تقرير الأصول الوقفية",
    titleEn: "Assets Report",
    desc: "سجل كامل بالأصول: التصنيف، التقييم، الحالة، والموقع — مع إجمالي التقييم وتوزيع التصنيفات.",
    icon: "🏛️",
    color: "#3B82F6",
  },
  {
    type: "finance",
    title: "التقرير المالي",
    titleEn: "Financial Statement",
    desc: "كشف حساب الفترة: إيرادات الريع، المصروفات، التوزيعات — مع الرسم الشهري للإيرادات مقابل المصروفات.",
    icon: "💰",
    color: "#10B981",
  },
  {
    type: "beneficiaries",
    title: "تقرير المستفيدين والتوزيعات",
    titleEn: "Beneficiaries & Distributions",
    desc: "المستفيدون وأسهمهم وأرصدة محافظهم، وسجل التوزيعات المنفذة خلال الفترة.",
    icon: "👥",
    color: "#F59E0B",
  },
  {
    type: "maintenance",
    title: "تقرير الصيانة والمهام",
    titleEn: "Maintenance Report",
    desc: "حالة مهام الصيانة: المفتوحة، المنجزة، والمتأخرة — موزعة على الأصول.",
    icon: "🛠️",
    color: "#EF4444",
  },
  {
    type: "zakat",
    title: "تقرير الزكاة الاسترشادي",
    titleEn: "Zakat Estimation",
    desc: "حسبة استرشادية للوعاء الزكوي (النقد والأصول الاستثمارية) والزكاة المستحقة 2.5% — تحتاج اعتماداً شرعياً.",
    icon: "🕌",
    color: "#0D9488",
  },
];

export default async function ReportsHubPage({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  const params = await searchParams;
  const period = PERIODS.some(p => p.id === params?.period) ? params.period! : "year";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("full_name, is_platform_admin").eq("id", user?.id).single();
  const scope = profile?.is_platform_admin ? await getWaqfScope() : null;
  const { data: waqfs } = await supabase.from("waqfs").select("id, name");
  const scopeName = scopeLabel(scope, waqfs || []) || (waqfs && waqfs.length === 1 ? waqfs[0].name : "نطاقك الحالي");

  return (
    <div className="fade-in">
      <div className={styles.header}>
        <div>
          <h1>مركز التقارير</h1>
          <p>تقارير رسمية مصممة بهوية مَشيد — جاهزة للطباعة والحفظ PDF باسم الوقف واسم مُصدر التقرير.</p>
        </div>
      </div>

      <div className={styles.scopeBar}>
        <div className={styles.scopeInfo}>
          <span className={styles.scopeLabel}>نطاق التقرير:</span>
          <strong>{scopeName}</strong>
          <span className={styles.scopeHint}>(غيّر النطاق من مبدّل الأوقاف في القائمة الجانبية)</span>
        </div>
        <div className={styles.periodTabs}>
          {PERIODS.map(p => (
            <Link
              key={p.id}
              href={`/dashboard/reports?period=${p.id}`}
              className={`${styles.periodTab} ${period === p.id ? styles.periodActive : ""}`}
            >
              {p.label}
            </Link>
          ))}
        </div>
      </div>

      <div className={styles.grid}>
        {REPORTS.map(r => (
          <Link key={r.type} href={`/dashboard/reports/${r.type}?period=${period}`} className={`${styles.card} glass-card`} style={{ textDecoration: "none", color: "inherit" }}>
            <div className={styles.cardIcon} style={{ background: `${r.color}18`, color: r.color }}>{r.icon}</div>
            <div className={styles.cardBody}>
              <h3>{r.title}</h3>
              <span className={styles.cardEn}>{r.titleEn}</span>
              <p>{r.desc}</p>
            </div>
            <div className={styles.cardFooter} style={{ color: r.color }}>
              إصدار التقرير ←
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
