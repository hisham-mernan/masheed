import styles from "@/components/dashboard/home/home.module.css";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { getWaqfScope, scopeQuery } from "@/lib/waqf-scope";
import NoWaqfHome from "@/components/platform/NoWaqfHome";
import ColumnChart, { type Column } from "@/components/dashboard/home/ColumnChart";
import { nowMs } from "@/lib/account";

const MONTHS_AR = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];
const PERIODS: [number, string][] = [[6, "6 أشهر"], [12, "12 شهراً"], [36, "3 سنوات"]];
const ACTION_AR: Record<string, string> = { INSERT: "أضاف", UPDATE: "عدّل", DELETE: "حذف" };
const ENTITY_AR: Record<string, string> = { assets: "أصلاً", transactions: "عملية مالية", beneficiaries: "مستفيداً", distributions: "توزيعاً", maintenance_tasks: "مهمة", documents: "مستنداً", approval_requests: "طلب اعتماد" };
const PRIORITY: Record<string, { label: string; tone: string }> = {
  urgent: { label: "عاجل", tone: "toneDanger" },
  in_progress: { label: "جارٍ", tone: "toneWarn" },
  scheduled: { label: "مجدول", tone: "toneInfo" },
};

const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 0 });

// Change vs the previous period of the same length; null when there is nothing to compare with
const delta = (cur: number, prev: number) => (prev > 0 ? ((cur - prev) / prev) * 100 : null);

function Sparkline({ values }: { values: number[] }) {
  const W = 96, H = 32, max = Math.max(...values, 1);
  // RTL: oldest month on the right
  const pts = values.map((v, i) => `${W - (i * W) / Math.max(values.length - 1, 1)},${H - 3 - (v / max) * (H - 6)}`);
  const last = pts[pts.length - 1].split(",");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={styles.spark} aria-hidden="true">
      <polyline points={pts.join(" ")} className={styles.sparkLine} />
      <circle cx={last[0]} cy={last[1]} r="3" className={styles.sparkDot} />
    </svg>
  );
}

function Delta({ value, upIsGood = true }: { value: number | null; upIsGood?: boolean }) {
  if (value === null) return <span className={`${styles.delta} ${styles.deltaFlat}`}>لا مقارنة</span>;
  const up = value >= 0;
  const tone = Math.abs(value) < 0.5 ? styles.deltaFlat : up === upIsGood ? styles.deltaUp : styles.deltaDown;
  return (
    <span className={`${styles.delta} ${tone}`}>
      <span aria-hidden="true">{up ? "▲" : "▼"}</span>
      <span className={styles.num}>{Math.abs(value).toFixed(1)}%</span>
    </span>
  );
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ months?: string }> }) {
  const params = await searchParams;
  const months = [6, 12, 36].includes(Number(params?.months)) ? Number(params?.months) : 12;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, is_platform_admin, waqf_id")
    .eq("id", user?.id)
    .single();

  if (!profile?.is_platform_admin && !profile?.waqf_id) return <NoWaqfHome />;
  const scope = profile?.is_platform_admin ? await getWaqfScope() : null;

  const firstName = profile?.full_name ? profile.full_name.split(" ")[0] : "";
  const today = new Date().toLocaleDateString("ar-SA-u-nu-latn", { weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "Asia/Riyadh" });

  const [{ data: assets }, { data: transactions }, { data: auditLogs }, { data: tasks }, { count: pendingApprovals }] = await Promise.all([
    scopeQuery(supabase.from("assets").select("valuation"), scope),
    scopeQuery(supabase.from("transactions").select("amount, type, is_yield, transaction_date"), scope),
    scopeQuery(supabase.from("audit_logs").select(`id, action, entity_type, created_at, profiles ( full_name )`), scope).order("created_at", { ascending: false }).limit(5),
    scopeQuery(supabase.from("maintenance_tasks").select("id, title, priority, due_date, assets(name)"), scope).eq("status", "open").order("created_at", { ascending: false }).limit(4),
    scopeQuery(supabase.from("approval_requests").select("id", { count: "exact", head: true }), scope).eq("status", "pending"),
  ]);

  const tx = (transactions || []).map((t) => ({ ...t, amount: Number(t.amount || 0) }));
  const totalAssets = (assets || []).reduce((sum, a) => sum + Number(a.valuation || 0), 0);
  // Same rule as the distribution engine: yield income minus everything already distributed
  const available = tx.filter((t) => t.type === "income" && t.is_yield).reduce((s, t) => s + t.amount, 0)
    - tx.filter((t) => t.type === "distribution").reduce((s, t) => s + t.amount, 0);

  // Monthly buckets for this period and the one before it (Riyadh calendar months)
  const nowR = new Date(nowMs() + 3 * 3600_000);
  const monthIndex = (y: number, m: number) => y * 12 + m;
  const thisMonth = monthIndex(nowR.getUTCFullYear(), nowR.getUTCMonth());
  const first = thisMonth - months + 1;
  const sums = (type: string) => {
    const cur = new Array(months).fill(0);
    let prev = 0;
    for (const t of tx) {
      if (t.type !== type || !t.transaction_date) continue;
      const [y, m] = String(t.transaction_date).split("-").map(Number);
      const k = monthIndex(y, m - 1) - first;
      if (k >= 0 && k < months) cur[k] += t.amount;
      else if (k < 0 && k >= -months) prev += t.amount;
    }
    return { cur, total: cur.reduce((s, v) => s + v, 0), prev };
  };
  const income = sums("income"), dist = sums("distribution"), expense = sums("expense");

  const columns: Column[] = income.cur.map((value, k) => {
    const mi = first + k, y = Math.floor(mi / 12), m = mi % 12;
    return { label: MONTHS_AR[m], fullLabel: `${MONTHS_AR[m]} ${y}`, value };
  });
  const periodName = PERIODS.find(([m]) => m === months)?.[1];

  // Where this period's income went: distributed, spent, and what is left
  const flowBase = Math.max(income.total, dist.total + expense.total, 1);
  const kept = Math.max(income.total - dist.total - expense.total, 0);
  const pct = (v: number) => (v / flowBase) * 100;

  return (
    <div className={`${styles.page} fade-in`}>
      <header className={styles.head}>
        <div>
          <h2 className={styles.greeting}>{firstName ? `مرحباً، ${firstName}` : "مرحباً"}</h2>
          <p className={styles.date}>{today}</p>
        </div>
        <nav className={styles.periods} aria-label="الفترة">
          {PERIODS.map(([m, label]) => (
            <Link key={m} href={`/dashboard?months=${m}`} className={styles.period} aria-current={m === months ? "true" : undefined} scroll={false}>{label}</Link>
          ))}
        </nav>
      </header>

      <section className={styles.kpis} aria-label="المؤشرات الرئيسية">
        <article className={styles.kpi}>
          <span className={styles.kpiLabel}>قيمة الأصول</span>
          <b className={`${styles.kpiValue} ${styles.num}`}>{fmt(totalAssets)} <small>ر.س</small></b>
          <span className={styles.kpiFoot}><span className={styles.num}>{fmt(assets?.length || 0)}</span> أصل مسجّل</span>
        </article>
        <article className={styles.kpi}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>الريع المحصّل</span>
            <Sparkline values={income.cur} />
          </div>
          <b className={`${styles.kpiValue} ${styles.num}`}>{fmt(income.total)} <small>ر.س</small></b>
          <span className={styles.kpiFoot}><Delta value={delta(income.total, income.prev)} /> عن الفترة السابقة</span>
        </article>
        <article className={styles.kpi}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>الريع الموزّع</span>
            <Sparkline values={dist.cur} />
          </div>
          <b className={`${styles.kpiValue} ${styles.num}`}>{fmt(dist.total)} <small>ر.س</small></b>
          <span className={styles.kpiFoot}><Delta value={delta(dist.total, dist.prev)} /> عن الفترة السابقة</span>
        </article>
        <article className={`${styles.kpi} ${styles.kpiGold}`}>
          <span className={styles.kpiLabel}>الريع المتاح للتوزيع</span>
          <b className={`${styles.kpiValue} ${styles.num}`}>{fmt(available)} <small>ر.س</small></b>
          <span className={styles.kpiFoot}>
            {pendingApprovals ? <Link href="/dashboard/approvals"><span className={styles.num}>{pendingApprovals}</span> طلب بانتظار الاعتماد</Link> : "لا طلبات توزيع معلّقة"}
          </span>
        </article>
      </section>

      <section className={styles.mainGrid}>
        <article className={`${styles.card} ${styles.chartCard}`}>
          <div className={styles.cardHead}>
            <div>
              <h3 className={styles.cardTitle}>الريع الشهري</h3>
              <p className={styles.cardSub}>إيرادات الوقف المسجّلة في المالية، آخر {periodName}</p>
            </div>
            <div className={styles.headFigure}>
              <span className={styles.kpiLabel}>متوسط الشهر</span>
              <b className={styles.num}>{fmt(income.total / months)} <small>ر.س</small></b>
            </div>
          </div>
          <ColumnChart data={columns} unit="ر.س" caption={`الريع الشهري، آخر ${periodName}`} />
        </article>

        <article className={styles.card}>
          <div className={styles.cardHead}>
            <div>
              <h3 className={styles.cardTitle}>أين ذهب ريع الفترة</h3>
              <p className={styles.cardSub}>من إجمالي <span className={styles.num}>{fmt(income.total)}</span> ر.س محصّلة</p>
            </div>
          </div>
          <div className={styles.flowBar} role="img" aria-label={`موزّع ${fmt(dist.total)}، مصروفات ${fmt(expense.total)}، متبقٍ ${fmt(kept)} ريال`}>
            {dist.total > 0 && <span className={styles.flowDist} style={{ width: `${pct(dist.total)}%` }} />}
            {expense.total > 0 && <span className={styles.flowExp} style={{ width: `${pct(expense.total)}%` }} />}
          </div>
          <ul className={styles.flowLegend}>
            <li>
              <span className={`${styles.swatch} ${styles.flowDist}`} aria-hidden="true" />
              <span>وُزّع على المستفيدين</span>
              <b className={styles.num}>{fmt(dist.total)}</b>
              <span className={`${styles.flowPct} ${styles.num}`}>{pct(dist.total).toFixed(0)}%</span>
            </li>
            <li>
              <span className={`${styles.swatch} ${styles.flowExp}`} aria-hidden="true" />
              <span>مصروفات التشغيل والصيانة</span>
              <b className={styles.num}>{fmt(expense.total)}</b>
              <span className={`${styles.flowPct} ${styles.num}`}>{pct(expense.total).toFixed(0)}%</span>
            </li>
            <li>
              <span className={`${styles.swatch} ${styles.flowKept}`} aria-hidden="true" />
              <span>متبقٍ لم يُصرف</span>
              <b className={styles.num}>{fmt(kept)}</b>
              <span className={`${styles.flowPct} ${styles.num}`}>{pct(kept).toFixed(0)}%</span>
            </li>
          </ul>
          <Link href="/dashboard/finance" className={styles.cardLink}>تفاصيل المالية</Link>
        </article>
      </section>

      <section className={styles.lowerGrid}>
        <article className={styles.card}>
          <div className={styles.cardHead}>
            <h3 className={styles.cardTitle}>مهام الصيانة المفتوحة</h3>
            <Link href="/dashboard/tasks" className={styles.cardLink}>كل المهام</Link>
          </div>
          {tasks && tasks.length > 0 ? (
            <ul className={styles.rows}>
              {tasks.map((task) => {
                const p = PRIORITY[task.priority] || PRIORITY.scheduled;
                const asset = (task.assets as unknown as { name: string } | null)?.name;
                return (
                  <li key={task.id}>
                    <Link href="/dashboard/tasks" className={styles.row}>
                      <span className={styles.rowMain}>
                        <b>{task.title}</b>
                        {asset && <small>{asset}</small>}
                      </span>
                      <span className={`${styles.pill} ${styles[p.tone]}`}>{p.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : <p className={styles.empty}>لا توجد مهام مفتوحة.</p>}
        </article>

        <article className={styles.card}>
          <div className={styles.cardHead}>
            <h3 className={styles.cardTitle}>آخر العمليات</h3>
            <Link href="/dashboard/audit" className={styles.cardLink}>السجل الكامل</Link>
          </div>
          {auditLogs && auditLogs.length > 0 ? (
            <ul className={styles.rows}>
              {auditLogs.map((act) => (
                <li key={act.id} className={styles.row}>
                  <span className={`${styles.actDot} ${styles["act" + act.action] || ""}`} aria-hidden="true" />
                  <span className={styles.rowMain}>
                    <b>{(act.profiles as unknown as { full_name: string } | null)?.full_name || "النظام"} {ACTION_AR[act.action] || act.action} {ENTITY_AR[act.entity_type] || act.entity_type}</b>
                    <small>{new Date(act.created_at).toLocaleString("ar-SA-u-nu-latn", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Riyadh" })}</small>
                  </span>
                </li>
              ))}
            </ul>
          ) : <p className={styles.empty}>لا توجد عمليات مسجّلة بعد.</p>}
        </article>

        <article className={styles.card}>
          <div className={styles.cardHead}>
            <h3 className={styles.cardTitle}>الرقابة والامتثال</h3>
            <Link href="/dashboard/compliance" className={styles.cardLink}>التفاصيل</Link>
          </div>
          <ul className={styles.rows}>
            {[
              ["سجل المراجعة", "كل عملية موثّقة باسم منفذها"],
              ["صلاحيات المستخدمين", "حسب الدور في الوقف"],
              ["عزل بيانات الأوقاف", "كل وقف يرى بياناته فقط"],
              ["الاعتماد المزدوج", "التوزيع لا يُنفَّذ قبل اعتماد طرف ثانٍ"],
            ].map(([t, d]) => (
              <li key={t} className={styles.row}>
                <span className={styles.check} aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                </span>
                <span className={styles.rowMain}><b>{t}</b><small>{d}</small></span>
                <span className={`${styles.pill} ${styles.toneOk}`}>مفعّل</span>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  );
}
