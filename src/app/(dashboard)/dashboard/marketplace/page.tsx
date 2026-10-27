import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { getWaqfScope, scopeQuery } from "@/lib/waqf-scope";

import styles from "../assets/assets.module.css";

const STATUS_AR: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "بانتظار الاعتماد", color: "#B45309", bg: "#FFFBEB" },
  approved: { label: "معتمد للطرح", color: "#1D4ED8", bg: "#EFF6FF" },
  trading: { label: "متداول", color: "#15803D", bg: "#F0FDF4" },
  rejected: { label: "مرفوض", color: "#DC2626", bg: "#FEF2F2" },
};

export default async function MarketplacePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("role, is_platform_admin").eq("id", user?.id).single();
  const canWrite = ["admin", "supervisor"].includes(profile?.role || "");
  const scope = profile?.is_platform_admin ? await getWaqfScope() : null;

  const { data: requests } = await scopeQuery(supabase.from("listing_requests").select("*, assets(name), waqfs(name)"), scope).order("created_at", { ascending: false });

  const trading = (requests || []).filter(r => r.status === "trading");
  const totalFunding = trading.reduce((s, r) => s + Number(r.target_funding || 0), 0);

  return (
    <div className="fade-in">
      <div className={styles.header}>
        <div className={styles.titleInfo}>
          <h1>منصة وقف مَشيد — طلبات الإدراج</h1>
          <p>اعرض فرص وقفك الاستثمارية على منصة وقف مَشيد. يراجع فريق مَشيد كل طلب ومستنداته قبل نشره للمستثمرين.</p>
        </div>
        <div className={styles.actions}>
          {canWrite && !profile?.is_platform_admin && <Link href="/dashboard/marketplace/apply" className="btn-primary" style={{ textDecoration: "none" }}>طلب إدراج فرصة +</Link>}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", marginTop: "1.5rem" }}>
        {[
          { label: "طلبات بانتظار الاعتماد", value: (requests || []).filter(r => r.status === "pending").length, color: "#F59E0B" },
          { label: "صكوك متداولة", value: trading.length, color: "#10B981" },
          { label: "إجمالي التمويل المتداول", value: `${Math.round(totalFunding).toLocaleString()} ر.س`, color: "#8561AD" },
        ].map(s => (
          <div key={s.label} className="glass-card" style={{ padding: "1rem 1.25rem", borderTop: `3px solid ${s.color}` }}>
            <div style={{ fontSize: "1.2rem", fontWeight: 800 }}>{s.value}</div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem", flexWrap: "wrap" }}>
        <Link href="/dashboard/marketplace" className={styles.secBtn} style={{ textDecoration: "none", fontWeight: 800 }}>📋 طلبات الطرح</Link>
        <Link href="/dashboard/marketplace/readiness" className={styles.secBtn} style={{ textDecoration: "none" }}>✅ جاهزية الطرح</Link>
        <Link href="/dashboard/marketplace/status" className={styles.secBtn} style={{ textDecoration: "none" }}>📈 حالة السوق</Link>
      </div>

      <div className={`${styles.ledgerContainer} glass-card`} style={{ marginTop: "1.5rem" }}>
        <table className={styles.table}>
          <thead>
            <tr><th>الرمز</th><th>الأصل والوقف</th><th>التمويل المستهدف</th><th>سعر السهم</th><th>عدد الأسهم</th><th>الحالة</th><th></th></tr>
          </thead>
          <tbody>
            {requests && requests.length > 0 ? requests.map(r => {
              const st = STATUS_AR[r.status] || STATUS_AR.pending;
              return (
                <tr key={r.id}>
                  <td><code className={styles.code}>{r.id.split("-")[0]}</code></td>
                  <td><strong>{r.title || (r.assets as any)?.name || "—"}</strong>{r.review_note && <div style={{ fontSize: "0.75rem", color: "#B91C1C" }}>{r.review_note}</div>}<div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{(r.waqfs as any)?.name}</div></td>
                  <td style={{ fontWeight: 700 }}>{Number(r.target_funding).toLocaleString()} ر.س</td>
                  <td>{Number(r.price_per_share).toLocaleString()} ر.س</td>
                  <td>{r.shares_count ? Number(r.shares_count).toLocaleString() : "—"}</td>
                  <td><span style={{ background: st.bg, color: st.color, padding: "0.2rem 0.55rem", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 700 }}>{st.label}</span></td>
                  <td>
                    {profile?.is_platform_admin && (
                      <Link href={`/dashboard/marketplace/${r.id}`} style={{ fontWeight: 700 }}>مراجعة</Link>
                    )}
                  </td>
                </tr>
              );
            }) : (
              <tr><td colSpan={7} style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>لا توجد طلبات طرح بعد.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
