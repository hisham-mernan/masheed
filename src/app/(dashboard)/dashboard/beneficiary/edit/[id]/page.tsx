import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import EditBeneficiaryForm from "@/components/dashboard/EditBeneficiaryForm";

export default async function EditBeneficiaryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!["admin", "supervisor"].includes(profile?.role || "")) redirect("/dashboard/beneficiary");

  const { data: beneficiary } = await supabase.from("beneficiaries").select("*").eq("id", id).single();
  if (!beneficiary) notFound();

  const { data: payouts } = await supabase
    .from("distribution_payouts")
    .select("id, amount, shares_at_time, status, created_at, distributions(distribution_date)")
    .eq("beneficiary_id", id)
    .order("created_at", { ascending: false });

  return (
    <div className="fade-in" style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.75rem", marginBottom: "0.5rem", color: "var(--text-main)" }}>المستفيد: {beneficiary.name}</h1>
      <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>تعديل البيانات والحالة + سجل المدفوعات المستلمة.</p>

      <div className="glass-card" style={{ padding: "2rem", marginBottom: "2rem" }}>
        <EditBeneficiaryForm beneficiary={beneficiary} />
      </div>

      <div className="glass-card" style={{ padding: "2rem" }}>
        <h3 style={{ marginTop: 0 }}>سجل المدفوعات (Payouts)</h3>
        {payouts && payouts.length > 0 ? (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "right", borderBottom: "1px solid var(--border)" }}>
                <th style={{ padding: "0.5rem" }}>المبلغ</th>
                <th style={{ padding: "0.5rem" }}>الأسهم وقت التوزيع</th>
                <th style={{ padding: "0.5rem" }}>الحالة</th>
                <th style={{ padding: "0.5rem" }}>التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map((p) => (
                <tr key={p.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "0.5rem", fontWeight: "bold" }}>{Number(p.amount).toLocaleString()} ر.س</td>
                  <td style={{ padding: "0.5rem" }}>{p.shares_at_time}</td>
                  <td style={{ padding: "0.5rem" }}>{p.status === "transferred" ? "محوّل" : "في المحفظة"}</td>
                  <td style={{ padding: "0.5rem" }}>{new Date(p.created_at).toLocaleDateString("ar-SA")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ color: "var(--text-muted)" }}>لم يستلم هذا المستفيد أي توزيعات بعد.</p>
        )}
      </div>
    </div>
  );
}
