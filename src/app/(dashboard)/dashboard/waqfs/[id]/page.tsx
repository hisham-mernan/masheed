import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import SetWaqfScopeButton from "@/components/dashboard/SetWaqfScopeButton";

const TYPE_AR: Record<string, string> = { khairi: "خيري", ahli: "أهلي / ذري", mushtarak: "مشترك" };
const CAT_AR: Record<string, string> = { real_estate: "عقاري", agricultural: "زراعي", investment: "مالي / أسهم", cash: "نقد" };

export default async function WaqfDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: waqf } = await supabase.from("waqfs").select("*").eq("id", id).single();
  if (!waqf) notFound();

  const [assets, bens, txs, dists, docs, tasks] = await Promise.all([
    supabase.from("assets").select("id, name, category, valuation, status, location").eq("waqf_id", id),
    supabase.from("beneficiaries").select("id, name, shares_owned, status, wallet_balance").eq("waqf_id", id),
    supabase.from("transactions").select("amount, type, is_yield").eq("waqf_id", id),
    supabase.from("distributions").select("id, total_amount, status, distribution_date").eq("waqf_id", id).order("created_at", { ascending: false }).limit(10),
    supabase.from("documents").select("id").eq("waqf_id", id),
    supabase.from("maintenance_tasks").select("id, status").eq("waqf_id", id),
  ]);

  const totalAssets = assets.data?.reduce((s, a) => s + Number(a.valuation || 0), 0) || 0;
  const income = txs.data?.filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0) || 0;
  const distributed = txs.data?.filter(t => t.type === "distribution").reduce((s, t) => s + Number(t.amount), 0) || 0;
  const openTasks = tasks.data?.filter(t => t.status === "open").length || 0;
  const activeBens = bens.data?.filter(b => b.status === "active") || [];

  const cards = [
    { label: "قيمة الأصول", value: totalAssets.toLocaleString() + " ر.س" },
    { label: "إجمالي الريع", value: income.toLocaleString() + " ر.س" },
    { label: "الموزَّع", value: distributed.toLocaleString() + " ر.س" },
    { label: "الأسهم", value: Number(waqf.total_shares).toLocaleString() + " سهم" },
    { label: "مستفيدون نشطون", value: activeBens.length.toLocaleString("ar-SA") },
    { label: "مهام مفتوحة", value: openTasks.toLocaleString("ar-SA") },
    { label: "مستندات", value: (docs.data?.length || 0).toLocaleString("ar-SA") },
  ];

  return (
    <div className="fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", marginBottom: "0.25rem", color: "var(--text-main)" }}>{waqf.name}</h1>
          <p style={{ color: "var(--text-muted)", margin: 0 }}>
            وقف {TYPE_AR[waqf.type] || waqf.type} · {waqf.registration_number ? `سجل ${waqf.registration_number} · ` : ""}أُنشئ {new Date(waqf.created_at).toLocaleDateString("ar-SA")}
          </p>
        </div>
        <SetWaqfScopeButton waqfId={id} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "1rem", margin: "1.5rem 0" }}>
        {cards.map((c) => (
          <div key={c.label} className="glass-card" style={{ padding: "1rem", textAlign: "center" }}>
            <div style={{ fontSize: "1.25rem", fontWeight: 700 }}>{c.value}</div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{c.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        <div className="glass-card" style={{ padding: "1.5rem" }}>
          <h3 style={{ marginTop: 0 }}>الأصول ({assets.data?.length || 0})</h3>
          {assets.data && assets.data.length > 0 ? assets.data.map((a) => (
            <div key={a.id} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid #f0f0f0" }}>
              <span><Link href={`/dashboard/assets/${a.id}`} style={{ color: "inherit", textDecoration: "none" }}><strong>{a.name}</strong></Link> — {CAT_AR[a.category] || a.category}</span>
              <span>{Number(a.valuation).toLocaleString()} ر.س</span>
            </div>
          )) : <p style={{ color: "var(--text-muted)" }}>لا أصول بعد.</p>}
        </div>

        <div className="glass-card" style={{ padding: "1.5rem" }}>
          <h3 style={{ marginTop: 0 }}>المستفيدون ({bens.data?.length || 0})</h3>
          {bens.data && bens.data.length > 0 ? bens.data.map((b) => (
            <div key={b.id} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid #f0f0f0" }}>
              <span><Link href={`/dashboard/beneficiary/${b.id}`} style={{ color: "inherit", textDecoration: "none" }}><strong>{b.name}</strong></Link> — {b.shares_owned} سهم</span>
              <span style={{ color: b.status === "active" ? "#10B981" : "#999" }}>{b.status === "active" ? "نشط" : b.status === "suspended" ? "موقوف" : "متوفى"}</span>
            </div>
          )) : <p style={{ color: "var(--text-muted)" }}>لا مستفيدون بعد.</p>}
        </div>
      </div>

      <div className="glass-card" style={{ padding: "1.5rem", marginTop: "1.5rem" }}>
        <h3 style={{ marginTop: 0 }}>آخر التوزيعات</h3>
        {dists.data && dists.data.length > 0 ? dists.data.map((d) => (
          <div key={d.id} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid #f0f0f0" }}>
            <span><Link href={`/dashboard/beneficiary/distributions/${d.id}`} style={{ color: "inherit", textDecoration: "none" }}><code>{d.id.split("-")[0]}…</code></Link> — {d.status === "completed" ? "مكتمل" : "قيد التنفيذ"}</span>
            <span><strong>{Number(d.total_amount).toLocaleString()} ر.س</strong> · {new Date(d.distribution_date).toLocaleDateString("ar-SA")}</span>
          </div>
        )) : <p style={{ color: "var(--text-muted)" }}>لا توزيعات بعد.</p>}
      </div>

      <p style={{ marginTop: "1.5rem" }}>
        <Link href="/dashboard" style={{ color: "#8561AD" }}>← العودة للوحة التحكم</Link>
      </p>
    </div>
  );
}
