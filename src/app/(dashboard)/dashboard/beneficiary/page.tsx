import styles from "./page.module.css";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import DistributeButton from "@/components/dashboard/DistributeButton";

export default async function BeneficiaryPage() {
  const supabase = await createClient();

  // Fetch waqfs to show in a selector or just get the first one for demo
  const { data: waqfs } = await supabase.from("waqfs").select("*");
  const selectedWaqf = waqfs?.[0]; // Assume first waqf for simplicity

  // Fetch beneficiaries
  const { data: beneficiaries } = await supabase
    .from("beneficiaries")
    .select("*")
    .order("created_at", { ascending: true });

  const totalShares = selectedWaqf?.total_shares || 0;
  const activeBeneficiariesCount = beneficiaries?.filter(b => b.status === 'active').length || 0;
  const totalWalletBalance = beneficiaries?.reduce((sum, b) => sum + Number(b.wallet_balance || 0), 0) || 0;

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
          <Link href="/dashboard/beneficiary/add" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            إضافة مستفيد
          </Link>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} glass-card`}>
          <div className={styles.statLabel}>إجمالي الأسهم (Tokens)</div>
          <div className={styles.statValue}>{totalShares} <small>سهم</small></div>
          <div className={styles.statDesc}>مقسمة على {activeBeneficiariesCount} مستفيدين</div>
        </div>
        <div className={`${styles.statCard} glass-card`}>
          <div className={styles.statLabel}>إجمالي الأرصدة المعلقة</div>
          <div className={styles.statValue}>{totalWalletBalance.toLocaleString()} <small>ر.س</small></div>
          <div className={styles.statDesc}>جاهزة للتحويل للحسابات البنكية</div>
        </div>
        <div className={`${styles.statCard} glass-card`}>
          <div className={styles.statLabel}>حالة التوزيع الآلي</div>
          <div className={styles.statValue} style={{ color: "#10B981" }}>مفعل</div>
          <div className={styles.statDesc}>يتم التوزيع فور تسجيل الإيرادات</div>
        </div>
      </div>

      <div className={`${styles.tableCard} glass-card`}>
        <div className={styles.cardHeader}>
          <h3>قائمة المستفيدين (Beneficiaries)</h3>
          <DistributeButton className="btn-outline" style={{ padding: "0.4rem 1rem", fontSize: "0.875rem" }} />
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
                <th>إجراءات</th>
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
                            {b.full_name?.substring(0, 1)}
                          </div>
                          <div>
                            <div className={styles.name}>{b.full_name}</div>
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
                          <div className={styles.progressFill} style={{ width: `${percentage}%` }}></div>
                        </div>
                        <span className={styles.percentageText}>{percentage}٪</span>
                      </td>
                      <td>
                        <strong className={styles.walletBalance}>{Number(b.wallet_balance).toLocaleString()} ر.س</strong>
                      </td>
                      <td>
                        <button className={styles.actionBtn}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                            <circle cx="12" cy="12" r="1"></circle>
                            <circle cx="19" cy="12" r="1"></circle>
                            <circle cx="5" cy="12" r="1"></circle>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "3rem" }}>
                    <p style={{ color: "var(--text-muted)" }}>لم يتم إضافة مستفيدين بعد. الداتا بيز جاهزة لاستقبال البيانات.</p>
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
