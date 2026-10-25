import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import PrintButton from "@/components/dashboard/PrintButton";
import { getWaqfScope, scopeQuery } from "@/lib/waqf-scope";
import styles from "./report.module.css";

const MONTHS_AR = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];

const REPORT_META: Record<string, { title: string; titleEn: string }> = {
  overview: { title: "التقرير العام الشامل", titleEn: "Executive Overview Report" },
  assets: { title: "تقرير الأصول الوقفية", titleEn: "Waqf Assets Report" },
  finance: { title: "التقرير المالي", titleEn: "Financial Statement Report" },
  beneficiaries: { title: "تقرير المستفيدين والتوزيعات", titleEn: "Beneficiaries & Distributions Report" },
  maintenance: { title: "تقرير الصيانة والمهام", titleEn: "Maintenance & Tasks Report" },
  zakat: { title: "تقرير الزكاة الاسترشادي", titleEn: "Zakat Estimation Report" },
};

const PERIOD_DAYS: Record<string, number | null> = { month: 30, quarter: 90, year: 365, all: null };
const PERIOD_LABEL: Record<string, string> = { month: "آخر 30 يوماً", quarter: "آخر 3 أشهر", year: "آخر 12 شهراً", all: "كل الفترات منذ الإنشاء" };

const CAT_MAP: Record<string, string> = { real_estate: "عقاري", investment: "استثماري", cash: "نقد", other: "أخرى" };
const TX_TYPE: Record<string, string> = { income: "إيراد (ريع)", expense: "مصروف", distribution: "توزيع للمستفيدين" };
const TASK_STATUS: Record<string, string> = { open: "مفتوحة", in_progress: "قيد التنفيذ", done: "منجزة", completed: "منجزة" };
const PRIORITY_AR: Record<string, string> = { urgent: "عاجل", in_progress: "جاري", scheduled: "مجدول" };

const fmt = (n: number) => Math.round(n).toLocaleString("en-US");
const fmtDate = (d: string | Date) => new Date(d).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" });

export default async function ReportPage({ params, searchParams }: { params: Promise<{ type: string }>; searchParams: Promise<{ period?: string }> }) {
  const { type } = await params;
  const sp = await searchParams;
  const meta = REPORT_META[type];
  if (!meta) notFound();
  const period = PERIOD_LABEL[sp?.period || ""] ? sp.period! : "year";
  const days = PERIOD_DAYS[period];
  const fromDate = days ? new Date(Date.now() - days * 86400000) : null;
  const fromIso = fromDate?.toISOString();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("full_name, role, waqf_id, is_platform_admin").eq("id", user?.id).single();
  const scope = profile?.is_platform_admin ? await getWaqfScope() : null;

  const { data: waqfs } = await supabase.from("waqfs").select("id, name, total_shares");
  let waqfName = "كل الأوقاف";
  if (scope && scope !== "all") waqfName = waqfs?.find(w => w.id === scope)?.name || waqfName;
  else if (!scope && profile?.waqf_id) waqfName = waqfs?.find(w => w.id === profile.waqf_id)?.name || "الوقف";
  const issuerName = profile?.full_name || "مستخدم النظام";
  const roleAr: Record<string, string> = { admin: "مدير النظام", supervisor: "مشرف", viewer: "مطالع" };
  const issuerRole = roleAr[profile?.role || ""] || profile?.role || "";
  const issuedAt = new Date();

  // ── Data ──
  const inPeriod = <T,>(q: T, col: string) => (fromIso ? (q as any).gte(col, fromIso) : q);

  const [{ data: assets }, { data: transactions }, { data: beneficiaries }, { data: distributions }, { data: tasks }] = await Promise.all([
    scopeQuery(supabase.from("assets").select("id, name, category, valuation, status, location"), scope),
    inPeriod(scopeQuery(supabase.from("transactions").select("id, amount, type, description, transaction_date, is_yield, assets(name)"), scope), "transaction_date").order("transaction_date", { ascending: false }),
    type === "beneficiaries" || type === "overview" || type === "zakat"
      ? scopeQuery(supabase.from("beneficiaries").select("id, name, national_id, shares_owned, wallet_balance"), scope)
      : Promise.resolve({ data: null as any[] | null }),
    type === "beneficiaries" || type === "overview"
      ? inPeriod(scopeQuery(supabase.from("distributions").select("id, total_amount, status, distribution_date"), scope), "distribution_date").order("distribution_date", { ascending: false })
      : Promise.resolve({ data: null as any[] | null }),
    type === "maintenance" || type === "overview"
      ? scopeQuery(supabase.from("maintenance_tasks").select("id, title, status, priority, due_date, created_at, assets(name)"), scope).order("created_at", { ascending: false })
      : Promise.resolve({ data: null as any[] | null }),
  ]);

  const tx: any[] = transactions || [];
  const totalIncome = tx.filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount || 0), 0);
  const totalExpense = tx.filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount || 0), 0);
  const totalDist = tx.filter(t => t.type === "distribution").reduce((s, t) => s + Number(t.amount || 0), 0);
  const totalValuation = (assets || []).reduce((s, a) => s + Number(a.valuation || 0), 0);
  const totalWallets = (beneficiaries || []).reduce((s, b) => s + Number(b.wallet_balance || 0), 0);
  const totalShares = (waqfs || []).reduce((s, w) => s + Number(w.total_shares || 0), 0);

  // Monthly series (last 12 buckets within period or all)
  const now = new Date();
  const bucketCount = period === "month" ? 4 : period === "quarter" ? 6 : 12;
  const buckets: { key: string; label: string; income: number; expense: number }[] = [];
  for (let i = bucketCount - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: MONTHS_AR[d.getMonth()], income: 0, expense: 0 });
  }
  const idx = new Map(buckets.map((b, i) => [b.key, i]));
  tx.forEach(t => {
    const d = new Date(t.transaction_date);
    const i = idx.get(`${d.getFullYear()}-${d.getMonth()}`);
    if (i === undefined) return;
    if (t.type === "income") buckets[i].income += Number(t.amount);
    else if (t.type === "expense" || t.type === "distribution") buckets[i].expense += Number(t.amount);
  });
  const maxBar = Math.max(...buckets.flatMap(b => [b.income, b.expense]), 1);

  // Category breakdown
  const catTotals = new Map<string, number>();
  (assets || []).forEach(a => catTotals.set(a.category || "other", (catTotals.get(a.category || "other") || 0) + Number(a.valuation || 0)));
  const maxCat = Math.max(...catTotals.values(), 1);

  // Zakat
  const zakatableAssets = (assets || []).filter(a => a.category === "cash" || a.category === "investment");
  const zakatBase = zakatableAssets.reduce((s, a) => s + Number(a.valuation || 0), 0) + totalWallets;
  const zakatDue = zakatBase * 0.025;

  const openTasks = (tasks || []).filter(t => t.status === "open");
  const doneTasks = (tasks || []).filter(t => t.status === "done" || t.status === "completed");
  const overdueTasks = openTasks.filter(t => t.due_date && new Date(t.due_date) < now);

  const dists: any[] = distributions || [];
  const distTotal = dists.reduce((s, d) => s + Number(d.total_amount || 0), 0);

  return (
    <div className="fade-in">
      {/* hide app chrome when printing */}
      <style>{`@media print { aside, header { display: none !important; } main { padding: 0 !important; overflow: visible !important; } body { background: white !important; } }`}</style>

      <div className={styles.toolbar}>
        <Link href="/dashboard/reports" className={styles.backLink}>→ العودة لمركز التقارير</Link>
        <PrintButton />
      </div>

      <div className={styles.report} dir="rtl">
        {/* Brand header */}
        <div className={styles.brandHeader}>
          <div className={styles.brandRight}>
            <div className={styles.brandLogo}>م</div>
            <div>
              <div className={styles.brandName}>مَشيد</div>
              <div className={styles.brandNameEn}>Masheed</div>
              <div className={styles.brandSub}>نظام إدارة الأوقاف — Endowment Management System</div>
            </div>
          </div>
          <div className={styles.reportMeta}>
            <div>رقم المرجع: <strong>{type.toUpperCase()}-{issuedAt.getFullYear()}{String(issuedAt.getMonth() + 1).padStart(2, "0")}{String(issuedAt.getDate()).padStart(2, "0")}</strong></div>
            <div>تاريخ الإصدار: <strong>{fmtDate(issuedAt)}</strong></div>
            <div>الوقت: <strong>{issuedAt.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}</strong></div>
          </div>
        </div>

        {/* Title */}
        <div className={styles.titleBlock}>
          <h1>{meta.title}</h1>
          <div className={styles.titleEn}>{meta.titleEn}</div>
          <div className={styles.waqfLine}>الوقف: {waqfName}</div>
          <div className={styles.periodLine}>الفترة: {PERIOD_LABEL[period]}{fromDate ? ` (من ${fmtDate(fromDate)})` : ""}</div>
        </div>

        {/* ═══ OVERVIEW ═══ */}
        {type === "overview" && (
          <>
            <div className={styles.statsGrid}>
              <Stat label="إجمالي قيمة الأصول" value={fmt(totalValuation)} suffix="ر.س" color="#8561AD" />
              <Stat label="ريع الأوقاف (إيرادات)" value={fmt(totalIncome)} suffix="ر.س" color="#059669" />
              <Stat label="المصروفات" value={fmt(totalExpense)} suffix="ر.س" color="#DC2626" />
              <Stat label="المصارف الموزعة" value={fmt(totalDist)} suffix="ر.س" color="#3B82F6" />
              <Stat label="عدد الأصول" value={String(assets?.length ?? 0)} suffix="أصل" color="#F59E0B" />
              <Stat label="المستفيدون" value={String(beneficiaries?.length ?? 0)} suffix="مستفيد" color="#0D9488" />
              <Stat label="مهام مفتوحة" value={String(openTasks.length)} suffix="مهمة" color="#EF4444" />
              <Stat label="صافي الفترة" value={fmt(totalIncome - totalExpense - totalDist)} suffix="ر.س" color="#4C1D95" />
            </div>
            <ChartSection buckets={buckets} maxBar={maxBar} />
            <div className={styles.section}>
              <div className={styles.sectionTitle}>توزيع الأصول حسب التصنيف <span className="en">Assets by Category</span></div>
              {[...catTotals.entries()].map(([cat, val]) => (
                <div key={cat} className={styles.breakRow}>
                  <span className={styles.breakLabel}>{CAT_MAP[cat] || cat}</span>
                  <div className={styles.breakTrack}><div className={styles.breakFill} style={{ width: `${(val / maxCat) * 100}%`, background: "#8561AD" }} /></div>
                  <span className={styles.breakVal}>{fmt(val)} ر.س</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ═══ ASSETS ═══ */}
        {type === "assets" && (
          <>
            <div className={styles.statsGrid}>
              <Stat label="إجمالي التقييم" value={fmt(totalValuation)} suffix="ر.س" color="#8561AD" />
              <Stat label="عدد الأصول" value={String(assets?.length ?? 0)} suffix="أصل" color="#3B82F6" />
              <Stat label="أصول نشطة" value={String((assets || []).filter(a => a.status === "active").length)} suffix="أصل" color="#059669" />
              <Stat label="التصنيفات" value={String(catTotals.size)} suffix="تصنيف" color="#F59E0B" />
            </div>
            <div className={styles.section}>
              <div className={styles.sectionTitle}>توزيع التقييم حسب التصنيف <span className="en">Valuation by Category</span></div>
              {[...catTotals.entries()].map(([cat, val]) => (
                <div key={cat} className={styles.breakRow}>
                  <span className={styles.breakLabel}>{CAT_MAP[cat] || cat}</span>
                  <div className={styles.breakTrack}><div className={styles.breakFill} style={{ width: `${(val / maxCat) * 100}%`, background: "#3B82F6" }} /></div>
                  <span className={styles.breakVal}>{fmt(val)} ر.س ({totalValuation > 0 ? ((val / totalValuation) * 100).toFixed(1) : 0}%)</span>
                </div>
              ))}
            </div>
            <div className={styles.section}>
              <div className={styles.sectionTitle}>سجل الأصول التفصيلي <span className="en">Detailed Assets Register</span></div>
              <table className={styles.table}>
                <thead><tr><th>#</th><th>اسم الأصل</th><th>التصنيف</th><th>الموقع</th><th>الحالة</th><th>التقييم (ر.س)</th></tr></thead>
                <tbody>
                  {(assets || []).map((a, i) => (
                    <tr key={a.id}>
                      <td>{i + 1}</td>
                      <td><strong>{a.name}</strong></td>
                      <td>{CAT_MAP[a.category] || a.category}</td>
                      <td>{a.location || "—"}</td>
                      <td>{a.status === "active" ? "نشط" : a.status}</td>
                      <td>{fmt(Number(a.valuation || 0))}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot><tr className={styles.tfoot}><td colSpan={5}>الإجمالي</td><td>{fmt(totalValuation)}</td></tr></tfoot>
              </table>
            </div>
          </>
        )}

        {/* ═══ FINANCE ═══ */}
        {type === "finance" && (
          <>
            <div className={styles.statsGrid}>
              <Stat label="إجمالي الإيرادات" value={fmt(totalIncome)} suffix="ر.س" color="#059669" />
              <Stat label="إجمالي المصروفات" value={fmt(totalExpense)} suffix="ر.س" color="#DC2626" />
              <Stat label="التوزيعات" value={fmt(totalDist)} suffix="ر.س" color="#3B82F6" />
              <Stat label="صافي الفترة" value={fmt(totalIncome - totalExpense - totalDist)} suffix="ر.س" color="#4C1D95" />
              <Stat label="عدد المعاملات" value={String(tx.length)} suffix="معاملة" color="#F59E0B" />
            </div>
            <ChartSection buckets={buckets} maxBar={maxBar} />
            <div className={styles.section}>
              <div className={styles.sectionTitle}>كشف حساب الفترة <span className="en">Transactions Ledger</span></div>
              {tx.length > 0 ? (
                <table className={styles.table}>
                  <thead><tr><th>التاريخ</th><th>النوع</th><th>الأصل</th><th>الوصف</th><th>المبلغ (ر.س)</th></tr></thead>
                  <tbody>
                    {tx.slice(0, 60).map(t => (
                      <tr key={t.id}>
                        <td>{fmtDate(t.transaction_date)}</td>
                        <td>{TX_TYPE[t.type] || t.type}</td>
                        <td>{(t.assets as any)?.name || "—"}</td>
                        <td>{t.description || "—"}</td>
                        <td className={t.type === "income" ? styles.pos : styles.neg}>{t.type === "income" ? "+" : "−"}{fmt(Number(t.amount))}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className={styles.tfoot}><td colSpan={4}>إجمالي الإيرادات</td><td className={styles.pos}>+{fmt(totalIncome)}</td></tr>
                    <tr className={styles.tfoot}><td colSpan={4}>إجمالي المصروفات والتوزيعات</td><td className={styles.neg}>−{fmt(totalExpense + totalDist)}</td></tr>
                    <tr className={styles.tfoot}><td colSpan={4}>الصافي</td><td>{fmt(totalIncome - totalExpense - totalDist)}</td></tr>
                  </tfoot>
                </table>
              ) : <div className={styles.empty}>لا توجد معاملات في هذه الفترة</div>}
            </div>
          </>
        )}

        {/* ═══ BENEFICIARIES ═══ */}
        {type === "beneficiaries" && (
          <>
            <div className={styles.statsGrid}>
              <Stat label="عدد المستفيدين" value={String(beneficiaries?.length ?? 0)} suffix="مستفيد" color="#F59E0B" />
              <Stat label="إجمالي الأسهم" value={fmt(totalShares)} suffix="سهم" color="#8561AD" />
              <Stat label="أرصدة المحافظ" value={fmt(totalWallets)} suffix="ر.س" color="#0D9488" />
              <Stat label="موزع خلال الفترة" value={fmt(distTotal)} suffix="ر.س" color="#3B82F6" />
            </div>
            <div className={styles.section}>
              <div className={styles.sectionTitle}>سجل المستفيدين <span className="en">Beneficiaries Register</span></div>
              {(beneficiaries || []).length > 0 ? (
                <table className={styles.table}>
                  <thead><tr><th>#</th><th>الاسم</th><th>رقم الهوية</th><th>الأسهم</th><th>النسبة</th><th>رصيد المحفظة (ر.س)</th></tr></thead>
                  <tbody>
                    {(beneficiaries || []).map((b, i) => (
                      <tr key={b.id}>
                        <td>{i + 1}</td>
                        <td><strong>{b.name}</strong></td>
                        <td>{b.national_id || "—"}</td>
                        <td>{fmt(Number(b.shares_owned || 0))}</td>
                        <td>{totalShares > 0 ? ((Number(b.shares_owned || 0) / totalShares) * 100).toFixed(2) : "0.00"}%</td>
                        <td>{fmt(Number(b.wallet_balance || 0))}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot><tr className={styles.tfoot}><td colSpan={5}>إجمالي الأرصدة</td><td>{fmt(totalWallets)}</td></tr></tfoot>
                </table>
              ) : <div className={styles.empty}>لا يوجد مستفيدون مسجلون</div>}
            </div>
            <div className={styles.section}>
              <div className={styles.sectionTitle}>التوزيعات خلال الفترة <span className="en">Distributions in Period</span></div>
              {dists.length > 0 ? (
                <table className={styles.table}>
                  <thead><tr><th>التاريخ</th><th>المرجع</th><th>الحالة</th><th>المبلغ الإجمالي (ر.س)</th></tr></thead>
                  <tbody>
                    {dists.map(d => (
                      <tr key={d.id}>
                        <td>{fmtDate(d.distribution_date)}</td>
                        <td>{d.id.split("-")[0]}</td>
                        <td>{d.status === "completed" || d.status === "done" ? "منفذة" : d.status === "pending" ? "معلقة" : d.status}</td>
                        <td>{fmt(Number(d.total_amount || 0))}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot><tr className={styles.tfoot}><td colSpan={3}>الإجمالي</td><td>{fmt(distTotal)}</td></tr></tfoot>
                </table>
              ) : <div className={styles.empty}>لا توجد توزيعات في هذه الفترة</div>}
            </div>
          </>
        )}

        {/* ═══ MAINTENANCE ═══ */}
        {type === "maintenance" && (
          <>
            <div className={styles.statsGrid}>
              <Stat label="إجمالي المهام" value={String(tasks?.length ?? 0)} suffix="مهمة" color="#8561AD" />
              <Stat label="مفتوحة" value={String(openTasks.length)} suffix="مهمة" color="#F59E0B" />
              <Stat label="منجزة" value={String(doneTasks.length)} suffix="مهمة" color="#059669" />
              <Stat label="متأخرة" value={String(overdueTasks.length)} suffix="مهمة" color="#DC2626" />
            </div>
            <div className={styles.section}>
              <div className={styles.sectionTitle}>سجل المهام <span className="en">Tasks Register</span></div>
              {(tasks || []).length > 0 ? (
                <table className={styles.table}>
                  <thead><tr><th>#</th><th>المهمة</th><th>الأصل</th><th>الأولوية</th><th>الحالة</th><th>تاريخ الاستحقاق</th></tr></thead>
                  <tbody>
                    {(tasks || []).map((t, i) => (
                      <tr key={t.id}>
                        <td>{i + 1}</td>
                        <td><strong>{t.title}</strong></td>
                        <td>{(t.assets as any)?.name || "—"}</td>
                        <td>{PRIORITY_AR[t.priority] || t.priority}</td>
                        <td>{TASK_STATUS[t.status] || t.status}</td>
                        <td style={{ color: t.due_date && new Date(t.due_date) < now && t.status === "open" ? "#DC2626" : undefined }}>
                          {t.due_date ? fmtDate(t.due_date) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : <div className={styles.empty}>لا توجد مهام مسجلة</div>}
            </div>
          </>
        )}

        {/* ═══ ZAKAT ═══ */}
        {type === "zakat" && (
          <>
            <div className={styles.note}>
              ⚠️ <strong>تنبيه شرعي:</strong> هذه الحسبة استرشادية فقط على أساس 2.5% من الوعاء الزكوي التقديري (الأصول النقدية والاستثمارية وأرصدة المحافظ). زكاة الأوقاف لها أحكام خاصة تختلف حسب طبيعة الوقف ومصارفه — يجب عرض هذا التقرير على الجهة الشرعية المختصة للاعتماد قبل الصرف.
            </div>
            <div className={styles.statsGrid}>
              <Stat label="الوعاء الزكوي التقديري" value={fmt(zakatBase)} suffix="ر.س" color="#0D9488" />
              <Stat label="الزكاة المستحقة (2.5%)" value={fmt(zakatDue)} suffix="ر.س" color="#8561AD" />
              <Stat label="أصول نقدية واستثمارية" value={String(zakatableAssets.length)} suffix="أصل" color="#3B82F6" />
              <Stat label="أرصدة محافظ المستفيدين" value={fmt(totalWallets)} suffix="ر.س" color="#F59E0B" />
            </div>
            <div className={styles.section}>
              <div className={styles.sectionTitle}>مكونات الوعاء الزكوي <span className="en">Zakat Base Components</span></div>
              <table className={styles.table}>
                <thead><tr><th>#</th><th>البند</th><th>التصنيف</th><th>القيمة (ر.س)</th></tr></thead>
                <tbody>
                  {zakatableAssets.map((a, i) => (
                    <tr key={a.id}>
                      <td>{i + 1}</td>
                      <td><strong>{a.name}</strong></td>
                      <td>{CAT_MAP[a.category] || a.category}</td>
                      <td>{fmt(Number(a.valuation || 0))}</td>
                    </tr>
                  ))}
                  <tr>
                    <td>{zakatableAssets.length + 1}</td>
                    <td><strong>أرصدة محافظ المستفيدين</strong></td>
                    <td>نقد</td>
                    <td>{fmt(totalWallets)}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className={styles.tfoot}><td colSpan={3}>إجمالي الوعاء</td><td>{fmt(zakatBase)}</td></tr>
                  <tr className={styles.tfoot}><td colSpan={3}>الزكاة المستحقة (2.5%)</td><td>{fmt(zakatDue)}</td></tr>
                </tfoot>
              </table>
            </div>
          </>
        )}

        {/* Footer */}
        <div className={styles.footer}>
          <div>
            <div>صادر عن نظام مَشيد لإدارة الأوقاف — Issued by Masheed EMS</div>
            <div>أصدره: <strong>{issuerName}</strong> ({issuerRole})</div>
            <div>هذا التقرير مُولّد آلياً من بيانات النظام الفعلية ولا يُعد صحيحاً إلا بمطابقة سجل المراجعة.</div>
          </div>
          <div className={styles.sig}>
            <div className={styles.sigLine}>توقيع المُصدر — Signature</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, suffix, color }: { label: string; value: string; suffix: string; color: string }) {
  return (
    <div className={styles.statCard} style={{ "--accent": color } as React.CSSProperties}>
      <div className={styles.statValue}>{value} <small>{suffix}</small></div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  );
}

function ChartSection({ buckets, maxBar }: { buckets: { label: string; income: number; expense: number }[]; maxBar: number }) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>الإيرادات مقابل المصروفات (شهرياً) <span className="en">Income vs Expenses</span></div>
      <div className={styles.chart}>
        {buckets.map((b, i) => (
          <div key={i} className={styles.chartCol}>
            <div className={styles.bars}>
              <div className={`${styles.bar} ${styles.barIncome}`} style={{ height: `${(b.income / maxBar) * 130}px` }} title={`إيراد: ${fmt(b.income)}`} />
              <div className={`${styles.bar} ${styles.barExpense}`} style={{ height: `${(b.expense / maxBar) * 130}px` }} title={`مصروف: ${fmt(b.expense)}`} />
            </div>
            <span className={styles.chartLabel}>{b.label}</span>
          </div>
        ))}
      </div>
      <div className={styles.legend}>
        <span><span className={styles.legendDot} style={{ background: "#059669" }} />الإيرادات</span>
        <span><span className={styles.legendDot} style={{ background: "#DC2626" }} />المصروفات والتوزيعات</span>
      </div>
    </div>
  );
}
