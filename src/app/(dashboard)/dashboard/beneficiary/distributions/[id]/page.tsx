import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import styles from "../../../assets/assets.module.css";

const PAYOUT_AR: Record<string, string> = { unpaid: "لم يُحوّل", transferred: "تم التحويل" };

export default async function DistributionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: dist } = await supabase
    .from("distributions")
    .select("*, waqfs(id, name)")
    .eq("id", id)
    .single();
  if (!dist) notFound();

  const { data: payouts } = await supabase
    .from("distribution_payouts")
    .select("id, amount, shares_at_time, status, beneficiaries(id, name, status)")
    .eq("distribution_id", id)
    .order("amount", { ascending: false });

  const totalPaid = payouts?.reduce((s, p) => s + Number(p.amount), 0) || 0;
  const transferred = payouts?.filter(p => p.status === "transferred").length || 0;

  return (
    <div className="fade-in">
      <div className={styles.header}>
        <div className={styles.titleInfo}>
          <h1>توزيع ريع <code className={styles.code}>{dist.id.split("-")[0]}…</code></h1>
          <p>
            <Link href={`/dashboard/waqfs/${dist.waqf_id}`} style={{ color: "#8561AD" }}>
              {(dist.waqfs as any)?.name}
            </Link>
            {" "}· {new Date(dist.distribution_date).toLocaleDateString("ar-SA")} ·{" "}
            {dist.status === "completed" ? "مكتمل ✅" : "قيد التنفيذ ⏳"}
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        {[
          { label: "المبلغ الإجمالي", value: Number(dist.total_amount).toLocaleString() + " ر.س" },
          { label: "عدد المستفيدين", value: (payouts?.length || 0).toLocaleString("ar-SA") },
          { label: "تم تحويله لمحافظ", value: transferred.toLocaleString("ar-SA") },
          { label: "مجموع الأنصبة", value: totalPaid.toLocaleString() + " ر.س" },
        ].map((c) => (
          <div key={c.label} className="glass-card" style={{ padding: "1rem", textAlign: "center" }}>
            <div style={{ fontSize: "1.1rem", fontWeight: 700 }}>{c.value}</div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{c.label}</div>
          </div>
        ))}
      </div>

      <div className="glass-card" style={{ padding: "1.5rem" }}>
        <h3 style={{ marginTop: 0 }}>أنصبة المستفيدين في هذا التوزيع</h3>
        {payouts && payouts.length > 0 ? (
          <table className={styles.table}>
            <thead>
              <tr><th>المستفيد</th><th>الأسهم وقت التوزيع</th><th>النصيب</th><th>حالة الصرف</th></tr>
            </thead>
            <tbody>
              {payouts.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link href={`/dashboard/beneficiary/${(p.beneficiaries as any)?.id}`} style={{ color: "#8561AD", fontWeight: 600 }}>
                      {(p.beneficiaries as any)?.name || "—"}
                    </Link>
                  </td>
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
        ) : <p style={{ color: "var(--text-muted)" }}>لا أنصبة مسجلة.</p>}
      </div>

      <p style={{ marginTop: "1.5rem" }}>
        <Link href="/dashboard/beneficiary" style={{ color: "#8561AD" }}>← العودة للمستفيدين والتوزيعات</Link>
      </p>
    </div>
  );
}
