import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { getWaqfScope, scopeQuery } from "@/lib/waqf-scope";
import styles from "../../assets/assets.module.css";

export default async function MarketplaceStatusPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("is_platform_admin").eq("id", user?.id).single();
  const scope = profile?.is_platform_admin ? await getWaqfScope() : null;

  const { data: listings } = await scopeQuery(
    supabase.from("listing_requests").select("*, assets(name), waqfs(name)").in("status", ["approved", "trading"]), scope
  ).order("created_at", { ascending: false });

  const trading = (listings || []).filter(l => l.status === "trading");
  const totalVolume = trading.reduce((s, l) => s + Number(l.target_funding || 0), 0);

  return (
    <div className="fade-in">
      <div className={styles.header}>
        <div className={styles.titleInfo}>
          <h1>حالة السوق والتداول</h1>
          <p>الصكوك المعتمدة والمتداولة في سوق وقف باي مشيد وتقدم التمويل.</p>
        </div>
        <div className={styles.actions}>
          <Link href="/dashboard/marketplace" className={styles.secBtn} style={{ textDecoration: "none" }}>طلبات الطرح ←</Link>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", marginTop: "1.5rem" }}>
        {[
          { label: "صكوك متداولة", value: trading.length, color: "#10B981" },
          { label: "معتمدة بانتظار التداول", value: (listings || []).filter(l => l.status === "approved").length, color: "#3B82F6" },
          { label: "حجم التمويل المتداول", value: `${Math.round(totalVolume).toLocaleString()} ر.س`, color: "#8561AD" },
        ].map(s => (
          <div key={s.label} className="glass-card" style={{ padding: "1rem 1.25rem", borderTop: `3px solid ${s.color}` }}>
            <div style={{ fontSize: "1.2rem", fontWeight: 800 }}>{s.value}</div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className={`${styles.ledgerContainer} glass-card`} style={{ marginTop: "1.5rem" }}>
        <table className={styles.table}>
          <thead><tr><th>الرمز</th><th>الصك</th><th>الوقف</th><th>سعر السهم</th><th>عدد الأسهم</th><th>التمويل المستهدف</th><th>الحالة</th></tr></thead>
          <tbody>
            {listings && listings.length > 0 ? listings.map(l => (
              <tr key={l.id}>
                <td><code className={styles.code}>{l.id.split("-")[0]}</code></td>
                <td><strong>صكوك {(l.assets as any)?.name || "—"}</strong></td>
                <td style={{ fontSize: "0.8rem" }}>{(l.waqfs as any)?.name || "—"}</td>
                <td style={{ fontWeight: 700 }}>{Number(l.price_per_share).toLocaleString()} ر.س</td>
                <td>{l.shares_count ? Number(l.shares_count).toLocaleString() : "—"}</td>
                <td style={{ fontWeight: 700 }}>{Number(l.target_funding).toLocaleString()} ر.س</td>
                <td>
                  <span style={{ padding: "0.2rem 0.55rem", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 700, background: l.status === "trading" ? "#F0FDF4" : "#EFF6FF", color: l.status === "trading" ? "#15803D" : "#1D4ED8" }}>
                    {l.status === "trading" ? "📈 متداول" : "معتمد"}
                  </span>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={7} style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                لا توجد صكوك معتمدة أو متداولة بعد — اعتمد طلب طرح من صفحة وقف باي مشيد أولاً.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
