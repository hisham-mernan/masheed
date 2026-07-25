import styles from "./page.module.css";
import { createClient } from "@/lib/supabase/server";

const typeColors: Record<string, string> = {
  legal: "#8561AD",
  system: "#3B82F6",
  finance: "#10B981",
  asset: "#F59E0B",
  INSERT: "#10B981",
  UPDATE: "#3B82F6",
  DELETE: "#EF4444",
};

const maintenanceTasks = [
  { priority: "عاجل", label: "إصلاح مصعد - برج الخزامى", color: "#EF4444", bg: "#FEF2F2" },
  { priority: "جاري", label: "تجديد عقود - محلات الروضة", color: "#F59E0B", bg: "#FFFBEB" },
  { priority: "مجدول", label: "صيانة دورية - مزرعة النخيل", color: "#3B82F6", bg: "#EFF6FF" },
];

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch Profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user?.id)
    .single();

  const firstName = profile?.full_name ? profile.full_name.split(" ")[0] : "مستخدم";
  
  const today = new Date().toLocaleDateString("ar-SA", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Fetch Assets Sum
  const { data: assets } = await supabase.from("assets").select("valuation");
  const totalAssets = assets?.reduce((sum, item) => sum + Number(item.valuation || 0), 0) || 0;

  // Fetch Transactions Sum
  const { data: transactions } = await supabase.from("transactions").select("amount, type");
  const totalIncome = transactions?.filter(t => t.type === 'income').reduce((sum, item) => sum + Number(item.amount || 0), 0) || 0;
  const totalDist = transactions?.filter(t => t.type === 'distribution').reduce((sum, item) => sum + Number(item.amount || 0), 0) || 0;

  // Fetch Audit Logs
  const { data: auditLogs } = await supabase
    .from("audit_logs")
    .select(`
      id,
      action,
      entity_type,
      created_at,
      profiles ( full_name )
    `)
    .order("created_at", { ascending: false })
    .limit(4);

  const stats = [
    {
      label: "إجمالي قيمة الأصول",
      value: totalAssets.toLocaleString(),
      suffix: "ر.س",
      change: "+٠٪",
      positive: true,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="20" height="20">
          <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
        </svg>
      ),
      color: "#8561AD",
    },
    {
      label: "ريع الأوقاف (Ri'a)",
      value: totalIncome.toLocaleString(),
      suffix: "ر.س",
      change: "+٠٪",
      positive: true,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="20" height="20">
          <line x1="12" y1="1" x2="12" y2="23"/>
          <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
        </svg>
      ),
      color: "#10B981",
    },
    {
      label: "المصارف الموزعة",
      value: totalDist.toLocaleString(),
      suffix: "ر.س",
      change: "+٠٪",
      positive: true,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="20" height="20">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
        </svg>
      ),
      color: "#3B82F6",
    },
    {
      label: "إجمالي الأصول",
      value: assets?.length.toLocaleString() || "٠",
      suffix: "عقاراً/أصلاً",
      change: "",
      positive: true,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="20" height="20">
          <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
        </svg>
      ),
      color: "#F59E0B",
    },
  ];

  return (
    <div className={`${styles.page} fade-in`}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.greeting}>صباح الخير، {firstName}</h1>
          <p className={styles.date}>إليك ملخص أداء الأوقاف — {today}</p>
        </div>
        <div className={styles.complianceChip}>
          <span className={styles.complianceDot}></span>
          متوافق مع GAW &amp; ZATCA
        </div>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        {stats.map((stat, i) => (
          <div key={i} className={`${styles.statCard} glass-card`} style={{ '--accent': stat.color } as React.CSSProperties}>
            <div className={styles.statHeader}>
              <div className={styles.statIcon} style={{ background: stat.color + "18", color: stat.color }}>
                {stat.icon}
              </div>
              {stat.change && (
                <span
                  className={styles.statChange}
                  style={{ color: stat.positive ? "#10B981" : "#EF4444", background: stat.positive ? "#ECFDF5" : "#FEF2F2" }}
                >
                  {stat.positive ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="11" height="11">
                      <polyline points="18 15 12 9 6 15"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="11" height="11">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  )}
                  {stat.change}
                </span>
              )}
            </div>
            <div className={styles.statValue}>{stat.value} <small>{stat.suffix}</small></div>
            <div className={styles.statLabel}>{stat.label}</div>
            <div className={styles.statAccentLine} style={{ background: `linear-gradient(90deg, ${stat.color}, transparent)` }}></div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className={styles.mainGrid}>
        {/* Chart */}
        <div className={`${styles.chartCard} glass-card`}>
          <div className={styles.cardHeader}>
            <div>
              <h3>أداء الاستثمارات الوقفية</h3>
              <p className={styles.cardSubtitle}>عائد الريع مقارنة بأصل الوقف (Ri'a vs. Asl)</p>
            </div>
            <select className={styles.periodSelect}>
              <option>آخر ٦ أشهر</option>
              <option>سنة كاملة</option>
              <option>٣ سنوات</option>
            </select>
          </div>
          <div className={styles.chartArea}>
            <svg viewBox="0 0 500 160" className={styles.chartSvg} preserveAspectRatio="none">
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8561AD" stopOpacity="0.25"/>
                  <stop offset="100%" stopColor="#8561AD" stopOpacity="0"/>
                </linearGradient>
                <linearGradient id="line2Grad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#8561AD"/>
                  <stop offset="100%" stopColor="#6B46A0"/>
                </linearGradient>
              </defs>
              {/* Grid lines */}
              {[40, 80, 120].map(y => (
                <line key={y} x1="0" y1={y} x2="500" y2={y} stroke="#E4E7EF" strokeWidth="1" strokeDasharray="4 4"/>
              ))}
              {/* Area fill */}
              <path
                d="M0,140 C60,135 90,120 130,100 S200,70 250,60 S340,75 390,55 S460,30 500,20 L500,160 L0,160 Z"
                fill="url(#areaGrad)"
              />
              {/* Main line */}
              <path
                d="M0,140 C60,135 90,120 130,100 S200,70 250,60 S340,75 390,55 S460,30 500,20"
                fill="none" stroke="url(#line2Grad)" strokeWidth="3" strokeLinecap="round"
                strokeDasharray="800" strokeDashoffset="800"
                style={{ animation: 'draw 2s ease-out 0.3s forwards' }}
              />
              {/* Data points */}
              {[[130,100],[250,60],[390,55],[500,20]].map(([x,y], i) => (
                <circle key={i} cx={x} cy={y} r="4" fill="#8561AD" stroke="white" strokeWidth="2"/>
              ))}
            </svg>
          </div>
          <div className={styles.chartLabels}>
            {["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو"].map(m => (
              <span key={m}>{m}</span>
            ))}
          </div>
        </div>

        {/* Maintenance tasks */}
        <div className={`${styles.tasksCard} glass-card`}>
          <div className={styles.cardHeader}>
            <h3>جدول الصيانة والمهام</h3>
            <span className={styles.taskCount}>٣</span>
          </div>
          <div className={styles.taskList}>
            {maintenanceTasks.map((task, i) => (
              <div key={i} className={styles.taskItem}>
                <span
                  className={styles.taskPriority}
                  style={{ color: task.color, background: task.bg }}
                >
                  {task.priority}
                </span>
                <span className={styles.taskLabel}>{task.label}</span>
                <button className={styles.taskAction}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="13" height="13">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
          <button className={`${styles.viewAllBtn} btn-outline`}>
            عرض كافة المهام
          </button>
        </div>
      </div>

      {/* Secondary Grid */}
      <div className={styles.secondaryGrid}>
        {/* Activity Log */}
        <div className={`${styles.activityCard} glass-card`}>
          <div className={styles.cardHeader}>
            <h3>سجل العمليات الأخيرة</h3>
          </div>
          <div className={styles.activityList}>
            {auditLogs && auditLogs.length > 0 ? auditLogs.map((act) => (
              <div key={act.id} className={styles.activityItem}>
                <div
                  className={styles.actDot}
                  style={{ background: typeColors[act.action] || "#8561AD" }}
                ></div>
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

        {/* Compliance Status */}
        <div className={`${styles.complianceCard} glass-card`}>
          <div className={styles.cardHeader}>
            <h3>حالة الرقابة والامتثال</h3>
            <div className={styles.allGood}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" width="12" height="12">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              سليم
            </div>
          </div>
          <div className={styles.complianceList}>
            {[
              { label: "الربط مع الهيئة (GAW)", ok: true },
              { label: "الربط مع الزكاة (ZATCA)", ok: true },
              { label: "سجل المراجعة (Audit Log)", ok: true },
              { label: "نسخ احتياطية يومية", ok: true },
            ].map((item, i) => (
              <div key={i} className={styles.compItem}>
                <span className={styles.compLabel}>{item.label}</span>
                <span className={styles.statusOk}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="11" height="11">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  متصل
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
