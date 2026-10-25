import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import styles from "../../assets/assets.module.css";

const STATUS_AR: Record<string, string> = { active: "نشط", suspended: "موقوف", deceased: "متوفى" };
const PAYOUT_AR: Record<string, string> = { unpaid: "لم يُحوّل", transferred: "تم التحويل" };

export default async function BeneficiaryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const canWrite = ["admin", "supervisor"].includes(profile?.role || "");

  const { data: ben } = await supabase
    .from("beneficiaries")
    .select("*, waqfs(id, name, total_shares)")
    .eq("id", id)
    .single();
  if (!ben) notFound();

  const { data: payouts } = await supabase
    .from("distribution_payouts")
    .select("id, amount, shares_at_time, status, created_at, distributions(id, distribution_date, total_amount, status)")
    .eq("beneficiary_id", id)
    .order("created_at", { ascending: false });

  const totalShares = Number((ben.waqfs as any)?.total_shares || 0);
  const pct = totalShares > 0 ? ((Number(ben.shares_owned) / totalShares) * 100).toFixed(2) : "0.00";
  const totalReceived = payouts?.filter(p => p.status === "transferred").reduce((s, p) => s + Number(p.amount), 0) || 0;
  const totalPending = payouts?.filter(p => p.status !== "transferred").reduce((s, p) => s + Number(p.amount), 0) || 0;

  return (
    <div className="fade-in">
      <div className={styles.header}>
        <div className={styles.titleInfo}>
          <h1>{ben.name}</h1>
          <p>
            {STATUS_AR[ben.status] || ben.status} · مستفيد في{" "}
            <Link href={`/dashboard/waqfs/${ben.waqf_id}`} style={{ color: "#8561AD" }}>
              {(ben.waqfs as any)?.name}
            </Link>
            {" "}· أُضيف {new Date(ben.created_at).toLocaleDateString("ar-SA")}
          </p>
        </div>
        <div className={styles.actions}>
          {canWrite && (
            <Link href={`/dashboard/beneficiary/edit/${ben.id}`} className="btn-primary" style={{ textDecoration: "none" }}>
              تعديل / المدفوعات ✏️
            </Link>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        {[
          { label: "الأسهم المملوكة", value: `${Number(ben.shares_owned).toLocaleString()} سهم (${pct}٪)` },
          { label: "رصيد المحفظة", value: Number(ben.wallet_balance).toLocaleString() + " ر.س" },
          { label: "إجمالي ما تم تحويله", value: totalReceived.toLocaleString() + " ر.س" },
          { label: "مستحقات لم تُحوّل", value: totalPending.toLocaleString() + " ر.س" },
          { label: "رقم الهوية", value: ben.national_id || "غير مسجل" },
          { label: "التواصل", value: ben.contact_info || "—" },
        ].map((c) => (
          <div key={c.label} className="glass-card" style={{ padding: "1rem", textAlign: "center" }}>
            <div style={{ fontSize: "1.05rem", fontWeight: 700 }}>{c.value}</div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{c.label}</div>
          </div>
        ))}
      </div>

      {ben.bank_details && (
        <div className="glass-card" style={{ padding: "1rem 1.5rem", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
          <strong>البيانات البنكية:</strong> <span style={{ color: "var(--text-muted)" }}>{ben.bank_details}</span>
        </div>
      )}

      <div className="glass-card" style={{ padding: "1.5rem" }}>
        <h3 style={{ marginTop: 0 }}>سجل التوزيعات والمدفوعات ({payouts?.length || 0})</h3>
        {payouts && payouts.length > 0 ? (
          <table className={styles.table}>
            <thead>
              <tr><th>التوزيع</th><th>تاريخ التوزيع</th><th>الأسهم وقتها</th><th>النصيب</th><th>حالة الصرف</th></tr>
            </thead>
            <tbody>
              {payouts.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link href={`/dashboard/beneficiary/distributions/${(p.distributions as any)?.id}`} style={{ color: "#8561AD" }}>
                      <code className={styles.code}>{(p.distributions as any)?.id?.split("-")[0]}…</code>
                    </Link>
                  </td>
                  <td>{(p.distributions as any)?.distribution_date ? new Date((p.distributions as any).distribution_date).toLocaleDateString("ar-SA") : "—"}</td>
                  <td>{Number(p.shares_at_time).toLocaleString()} سهم</td>
                  <td><strong>{Number(p.amount).toLocaleString()} ر.س</strong></td>
                  <td>
                    <span className={`${styles.status} ${p.status === "transferred" ? styles.active : ""}`}>
                      {PAYOUT_AR[p.status] || p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p style={{ color: "var(--text-muted)" }}>لم يستلم هذا المستفيد أي توزيعات بعد.</p>}
      </div>

      <p style={{ marginTop: "1.5rem" }}>
        <Link href="/dashboard/beneficiary" style={{ color: "#8561AD" }}>← العودة لقائمة المستفيدين</Link>
      </p>
    </div>
  );
}
