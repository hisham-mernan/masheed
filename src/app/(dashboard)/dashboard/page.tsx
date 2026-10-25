import styles from "./page.module.css";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import PeriodSelect from "@/components/dashboard/PeriodSelect";
import { getWaqfScope, scopeQuery } from "@/lib/waqf-scope";

const MONTHS_AR = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];

const typeColors: Record<string, string> = {
  INSERT: "#10B981",
  UPDATE: "#3B82F6",
  DELETE: "#EF4444",
};

const priorityStyle: Record<string, { label: string; color: string; bg: string }> = {
  urgent: { label: "عاجل", color: "#EF4444", bg: "#FEF2F2" },
  in_progress: { label: "جاري", color: "#F59E0B", bg: "#FFFBEB" },
  scheduled: { label: "مجدول", color: "#3B82F6", bg: "#EFF6FF" },
};

function buildChart(series: number[]) {
  const W = 500, H = 160, PAD = 10;
  const max = Math.max(...series, 1);
  const n = series.length;
  const pts = series.map((v, i) => [
    PAD + (i * (W - 2 * PAD)) / Math.max(n - 1, 1),
    H - PAD - (v / max) * (H - 2 * PAD),
  ]);
  const path = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(" ");
  const area = `${path} L${pts[pts.length - 1][0]},${H} L${pts[0][0]},${H} Z`;
  return { path, area, pts };
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ months?: string }> }) {
  const params = await searchParams;
  const months = [6, 12, 36].includes(Number(params?.months)) ? Number(params?.months) : 6;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, is_platform_admin")
    .eq("id", user?.id)
    .single();

  const scope = profile?.is_platform_admin ? await getWaqfScope() : null;

  const firstName = profile?.full_name ? profile.full_name.split(" ")[0] : "مستخدم";

  const today = new Date().toLocaleDateString("ar-SA", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const [{ data: assets }, { data: transactions }, { data: auditLogs }, { data: tasks }] = await Promise.all([
    scopeQuery(supabase.from("assets").select("valuation"), scope),
    scopeQuery(supabase.from("transactions").select("amount, type, transaction_date"), scope),
    scopeQuery(supabase.from("audit_logs").select(`id, action, entity_type, created_at, profiles ( full_name )`), scope).order("created_at", { ascending: false }).limit(4),
    scopeQuery(supabase.from("maintenance_tasks").select("id, title, priority, due_date, assets(name)"), scope).eq("status", "open").order("created_at", { ascending: false }).limit(3),
  ]);

  const totalAssets = assets?.reduce((sum, item) => sum + Number(item.valuation || 0), 0) || 0;
  const totalIncome = transactions?.filter(t => t.type === 'income').reduce((sum, item) => sum + Number(item.amount || 0), 0) || 0;
  const totalDist = transactions?.filter(t => t.type === 'distribution').reduce((sum, item) => sum + Number(item.amount || 0), 0) || 0;

  // Real monthly series (income per month, oldest -> newest)
  const now = new Date();
  const buckets: { key: string; label: string; total: number }[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: MONTHS_AR[d.getMonth()], total: 0 });
  }
  const idx = new Map(buckets.map((b, i) => [b.key, i]));
  transactions?.filter(t => t.type === "income").forEach(t => {
    const d = new Date(t.transaction_date);
    const i = idx.get(`${d.getFullYear()}-${d.getMonth()}`);
    if (i !== undefined) buckets[i].total += Number(t.amount);
  });
  const chart = buildChart(buckets.map(b => b.total));
  // Sparse labels (max 6)
  const step = Math.ceil(buckets.length / 6);
  const labels = buckets.filter((_, i) => i % step === 0 || i === buckets.length - 1).map(b => b.label);

  const stats = [
    { label: "إجمالي قيمة الأصول", value: totalAssets.toLocaleString(), suffix: "ر.س", color: "#8561AD" },
    { label: "ريع الأوقاف (Ri'a)", value: totalIncome.toLocaleString(), suffix: "ر.س", color: "#10B981" },
    { label: "المصارف الموزعة", value: totalDist.toLocaleString(), suffix: "ر.س", color: "#3B82F6" },
    { label: "إجمالي الأصول", value: assets?.length.toLocaleString() || "٠", suffix: "عقاراً/أصلاً", color: "#F59E0B" },
  ];

  return (
    <div className={`${styles.page} fade-in`}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.greeting}>صباح الخير، {firstName}</h1>
          <p className={styles.date}>إليك ملخص أداء الأوقاف — {today}</p>
        </div>
      </div>

      <div className={styles.statsGrid}>
        {stats.map((stat, i) => (
          <div key={i} className={`${styles.statCard} glass-card`} style={{ '--accent': stat.color } as React.CSSProperties}>
            <div className={styles.statValue}>{stat.value} <small>{stat.suffix}</small></div>
            <div className={styles.statLabel}>{stat.label}</div>
            <div className={styles.statAccentLine} style={{ background: `linear-gradient(90deg, ${stat.color}, transparent)` }}></div>
          </div>
        ))}
      </div>

      <div className={styles.mainGrid}>
        <div className={`${styles.chartCard} glass-card`}>
          <div className={styles.cardHeader}>
            <div>
              <h3>أداء الاستثمارات الوقفية</h3>
              <p className={styles.cardSubtitle}>إيرادات الريع الشهرية الفعلية من دفتر الأستاذ</p>
            </div>
            <PeriodSelect value={months} />
          </div>
          <div className={styles.chartArea}>
            <svg viewBox="0 0 500 160" className={styles.chartSvg} preserveAspectRatio="none">
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8561AD" stopOpacity="0.25"/>
                  <stop offset="100%" stopColor="#8561AD" stopOpacity="0"/>
                </linearGradient>
              </defs>
              {[40, 80, 120].map(y => (
                <line key={y} x1="0" y1={y} x2="500" y2={y} stroke="#E4E7EF" strokeWidth="1" strokeDasharray="4 4"/>
              ))}
              <path d={chart.area} fill="url(#areaGrad)"/>
              <path d={chart.path} fill="none" stroke="#8561AD" strokeWidth="3" strokeLinecap="round"/>
              {chart.pts.map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r="4" fill="#8561AD" stroke="white" strokeWidth="2">
                  <title>{`${buckets[i].label}: ${buckets[i].total.toLocaleString()} ر.س`}</title>
                </circle>
              ))}
            </svg>
          </div>
          <div className={styles.chartLabels}>
            {labels.map(m => (<span key={m}>{m}</span>))}
          </div>
        </div>

        <div className={`${styles.tasksCard} glass-card`}>
          <div className={styles.cardHeader}>
            <h3>جدول الصيانة والمهام</h3>
            <span className={styles.taskCount}>{tasks?.length ?? 0}</span>
          </div>
          <div className={styles.taskList}>
            {tasks && tasks.length > 0 ? tasks.map((task) => {
              const p = priorityStyle[task.priority] || priorityStyle.scheduled;
              return (
                <Link key={task.id} href="/dashboard/tasks" className={styles.taskItem} style={{ textDecoration: "none", color: "inherit" }}>
                  <span className={styles.taskPriority} style={{ color: p.color, background: p.bg }}>{p.label}</span>
                  <span className={styles.taskLabel}>{task.title}{(task.assets as any)?.name ? ` — ${(task.assets as any).name}` : ""}</span>
                </Link>
              );
            }) : (
              <p style={{ textAlign: "center", color: "#888", fontSize: "0.875rem" }}>لا توجد مهام مفتوحة</p>
            )}
          </div>
          <Link href="/dashboard/tasks" className={`${styles.viewAllBtn} btn-outline`} style={{ textAlign: "center", textDecoration: "none" }}>
            عرض كافة المهام
          </Link>
        </div>
      </div>

      <div className={styles.secondaryGrid}>
        <div className={`${styles.activityCard} glass-card`}>
          <div className={styles.cardHeader}>
            <h3>سجل العمليات الأخيرة</h3>
            <Link href="/dashboard/audit" style={{ fontSize: "0.8rem", color: "#8561AD", textDecoration: "none" }}>السجل الكامل ←</Link>
          </div>
          <div className={styles.activityList}>
            {auditLogs && auditLogs.length > 0 ? auditLogs.map((act) => (
              <div key={act.id} className={styles.activityItem}>
                <div className={styles.actDot} style={{ background: typeColors[act.action] || "#8561AD" }}></div>
                <div className={styles.actContent}>
                  <p className={styles.actText}>
                    <strong>{(act.profiles as any)?.full_name || "النظام"}</strong> — {act.action} في <em>{act.entity_type}</em>
                  </p>
                  <span className={styles.actTime}>{new Date(act.created_at).toLocaleString("ar-SA")}</span>
                </div>
              </div>
            )) : (
              <p style={{ textAlign: 'center', color: '#888', fontSize: '0.875rem' }}>لا توجد عمليات مسجلة بعد</p>
            )}
          </div>
        </div>

        <div className={`${styles.complianceCard} glass-card`}>
          <div className={styles.cardHeader}>
            <h3>حالة الرقابة والامتثال</h3>
          </div>
          <div className={styles.complianceList}>
            <div className={styles.compItem}>
              <span className={styles.compLabel}>سجل المراجعة (Audit Log)</span>
              <span className={styles.statusOk}>✓ مفعّل — كل العمليات موثقة</span>
            </div>
            <div className={styles.compItem}>
              <span className={styles.compLabel}>صلاحيات المستخدمين (RLS)</span>
              <span className={styles.statusOk}>✓ مفعّلة حسب الدور</span>
            </div>
            <div className={styles.compItem}>
              <span className={styles.compLabel}>عزل بيانات الأوقاف</span>
              <span className={styles.statusOk}>✓ كل وقف يرى بياناته فقط</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
