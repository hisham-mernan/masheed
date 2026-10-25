import styles from "./page.module.css";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import DistributeButton from "@/components/dashboard/DistributeButton";
import SettleButton from "@/components/dashboard/SettleButton";
import { getWaqfScope, scopeQuery } from "@/lib/waqf-scope";

const WRITE_ROLES = ["admin", "supervisor"];

export default async function BeneficiaryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("waqf_id, role, is_platform_admin")
    .eq("id", user?.id)
    .single();

  const canWrite = WRITE_ROLES.includes(profile?.role || "");
  const scope = profile?.is_platform_admin ? await getWaqfScope() : null;
  // الوقف الفعّال: المحدد من المبدّل، أو وقف المستخدم
  const effectiveWaqfId = scope && scope !== "all" ? scope : scope === "all" ? null : profile?.waqf_id;

  const { data: waqf } = effectiveWaqfId
    ? await supabase.from("waqfs").select("*").eq("id", effectiveWaqfId).single()
    : { data: null };

  const { data: allWaqfs } = scope === "all"
    ? await supabase.from("waqfs").select("id, total_shares")
    : { data: null };

  const { data: beneficiaries } = await scopeQuery(
    supabase.from("beneficiaries").select("*"), scope
  ).order("created_at", { ascending: true });

  const { data: transactions } = await scopeQuery(
    supabase.from("transactions").select("amount, type, is_yield"), scope
  );

  const { data: distributions } = await scopeQuery(
    supabase.from("distributions").select("id, total_amount, status, distribution_date"), scope
  ).order("created_at", { ascending: false }).limit(5);

  const totalShares = waqf?.total_shares ?? allWaqfs?.reduce((s, w) => s + Number(w.total_shares || 0), 0) ?? 0;
  const activeBeneficiariesCount = beneficiaries?.filter(b => b.status === 'active').length || 0;
  const totalWalletBalance = beneficiaries?.reduce((sum, b) => sum + Number(b.wallet_balance || 0), 0) || 0;

  const totalIncome = transactions?.filter(t => t.type === 'income' && t.is_yield).reduce((s, t) => s + Number(t.amount), 0) || 0;
  const totalDistributed = transactions?.filter(t => t.type === 'distribution').reduce((s, t) => s + Number(t.amount), 0) || 0;
  const availableYield = totalIncome - totalDistributed;

  return (
    <div className={`${styles.page} fade-in`}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>إدارة المستفيدين والأسهم</h1>
          <p className={styles.subtitle}>
            نظام التوكينيزيشن (Tokenization) لتقسيم وتوزيع الريع بشكل آلي
          </p>
        </div>
        <div className={styles.actions}>
          <Link href="/dashboard/reports/beneficiaries" className="btn-outline" style={{ textDecoration: 'none' }}>📄 تقرير PDF</Link>
          {canWrite && (
            <Link href="/dashboard/beneficiary/add" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              إضافة مستفيد
            </Link>
          )}
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} glass-card`}>
          <div className={styles.statLabel}>إجمالي الأسهم (Tokens)</div>
          <div className={styles.statValue}>{totalShares} <small>سهم</small></div>
          <div className={styles.statDesc}>مقسمة على {activeBeneficiariesCount} مستفيدين</div>
        </div>
        <div className={`${styles.statCard} glass-card`}>
          <div className={styles.statLabel}>الريع المتاح للتوزيع</div>
          <div className={styles.statValue} style={{ color: availableYield > 0 ? "#10B981" : undefined }}>
            {availableYield.toLocaleString()} <small>ر.س</small>
          </div>
          <div className={styles.statDesc}>إيرادات الريع ناقص التوزيعات السابقة</div>
        </div>
        <div className={`${styles.statCard} glass-card`}>
          <div className={styles.statLabel}>إجمالي الأرصدة المعلقة</div>
          <div className={styles.statValue}>{totalWalletBalance.toLocaleString()} <small>ر.س</small></div>
          <div className={styles.statDesc}>جاهزة للتحويل للحسابات البنكية</div>
        </div>
      </div>

      <div className={`${styles.tableCard} glass-card`}>
        <div className={styles.cardHeader}>
          <h3>قائمة المستفيدين (Beneficiaries)</h3>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {canWrite && scope !== "all" && (
              <>
                <DistributeButton
                  className="btn-outline"
                  style={{ padding: "0.4rem 1rem", fontSize: "0.875rem" }}
                  availableYield={availableYield}
                />
                <SettleButton
                  className="btn-outline"
                  style={{ padding: "0.4rem 1rem", fontSize: "0.875rem" }}
                  totalWallet={totalWalletBalance}
                />
              </>
            )}
            {scope === "all" && (
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", alignSelf: "center" }}>
                التوزيع والصرف يتمان من داخل وقف محدد — اختر وقفاً من المبدّل
              </span>
            )}
          </div>
        </div>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>الاسم / رقم الهوية</th>
                <th>الحالة</th>
                <th>الأسهم المملوكة (Tokens)</th>
                <th>نسبة الملكية</th>
                <th>رصيد المحفظة</th>
                {canWrite && <th>إجراءات</th>}
              </tr>
            </thead>
            <tbody>
              {beneficiaries && beneficiaries.length > 0 ? (
                beneficiaries.map((b) => {
                  const percentage = totalShares > 0 ? ((Number(b.shares_owned) / Number(totalShares)) * 100).toFixed(2) : "0.00";
                  return (
                    <tr key={b.id}>
                      <td>
                        <div className={styles.beneficiaryInfo}>
                          <div className={styles.avatar}>
                            {b.name?.substring(0, 1) || "؟"}
                          </div>
                          <div>
                            <div className={styles.name}>
                              <Link href={`/dashboard/beneficiary/${b.id}`} style={{ color: "inherit", textDecoration: "none" }}>{b.name}</Link>
                            </div>
                            <div className={styles.nationalId}>{b.national_id || "غير متوفر"}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`${styles.statusBadge} ${styles[b.status] || ''}`}>
                          {b.status === "active" ? "نشط" : b.status === "suspended" ? "موقوف" : "متوفى"}
                        </span>
                      </td>
                      <td>
                        <span className={styles.sharesCount}>{b.shares_owned}</span>
                      </td>
                      <td>
                        <div className={styles.progressBar}>
                          <div className={styles.progressFill} style={{ width: `${Math.min(Number(percentage), 100)}%` }}></div>
                        </div>
                        <span className={styles.percentageText}>{percentage}٪</span>
                      </td>
                      <td>
                        <strong className={styles.walletBalance}>{Number(b.wallet_balance).toLocaleString()} ر.س</strong>
                      </td>
                      {canWrite && (
                        <td>
                          <Link href={`/dashboard/beneficiary/edit/${b.id}`} className="btn-outline" style={{ padding: "0.3rem 0.8rem", fontSize: "0.8rem", textDecoration: "none" }}>
                            تعديل / المدفوعات
                          </Link>
                        </td>
                      )}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={canWrite ? 6 : 5} style={{ textAlign: "center", padding: "3rem" }}>
                    <p style={{ color: "var(--text-muted)" }}>لم يتم إضافة مستفيدين بعد. قم بإضافة مستفيد وتخصيص أسهمه لتفعيل التوزيع الآلي.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className={`${styles.tableCard} glass-card`} style={{ marginTop: "2rem" }}>
        <div className={styles.cardHeader}>
          <h3>سجل التوزيعات (Distributions)</h3>
        </div>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>رقم التوزيع</th>
                <th>المبلغ الإجمالي</th>
                <th>الحالة</th>
                <th>التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {distributions && distributions.length > 0 ? distributions.map((d) => (
                <tr key={d.id}>
                  <td>
                    <Link href={`/dashboard/beneficiary/distributions/${d.id}`} style={{ color: "inherit", textDecoration: "none" }}>
                      <code>{d.id.split("-")[0]}...</code>
                    </Link>
                  </td>
                  <td><strong>{Number(d.total_amount).toLocaleString()} ر.س</strong></td>
                  <td>
                    <span className={`${styles.statusBadge} ${d.status === 'completed' ? styles.active : ''}`}>
                      {d.status === 'completed' ? 'مكتمل' : 'قيد التنفيذ'}
                    </span>
                  </td>
                  <td>{new Date(d.distribution_date).toLocaleDateString("ar-SA")}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                    لا توجد توزيعات بعد. التوزيع يتم من زر "توزيع الريع" أعلاه.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
