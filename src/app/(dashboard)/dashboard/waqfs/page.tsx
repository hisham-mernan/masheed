import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

const TYPE_AR: Record<string, string> = { khairi: "خيري", ahli: "أهلي / ذري", mushtarak: "مشترك" };

export default async function WaqfsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("is_platform_admin").eq("id", user.id).single();
  if (!profile?.is_platform_admin) redirect("/dashboard");

  const { data: waqfs } = await supabase.from("waqfs").select("id, name, type, total_shares, created_at").order("created_at");

  // Aggregates per waqf
  const { data: assets } = await supabase.from("assets").select("waqf_id, valuation");
  const { data: txs } = await supabase.from("transactions").select("waqf_id, amount, type");
  const { data: bens } = await supabase.from("beneficiaries").select("waqf_id, status");

  const agg = new Map<string, { assets: number; income: number; dist: number; bens: number }>();
  assets?.forEach(a => {
    const m = agg.get(a.waqf_id) || { assets: 0, income: 0, dist: 0, bens: 0 };
    m.assets += Number(a.valuation || 0);
    agg.set(a.waqf_id, m);
  });
  txs?.forEach(t => {
    const m = agg.get(t.waqf_id) || { assets: 0, income: 0, dist: 0, bens: 0 };
    if (t.type === "income") m.income += Number(t.amount);
    if (t.type === "distribution") m.dist += Number(t.amount);
    agg.set(t.waqf_id, m);
  });
  bens?.forEach(b => {
    const m = agg.get(b.waqf_id) || { assets: 0, income: 0, dist: 0, bens: 0 };
    if (b.status === "active") m.bens++;
    agg.set(b.waqf_id, m);
  });

  return (
    <div className="fade-in">
      <h1 style={{ fontSize: "1.75rem", marginBottom: "0.25rem", color: "var(--text-main)" }}>كل الأوقاف</h1>
      <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>نظرة مجمعة على كل وقف — اضغط أي وقف لتفاصيله أو للعمل داخله.</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
        {waqfs?.map((w) => {
          const a = agg.get(w.id) || { assets: 0, income: 0, dist: 0, bens: 0 };
          return (
            <Link key={w.id} href={`/dashboard/waqfs/${w.id}`} className="glass-card" style={{ padding: "1.25rem", textDecoration: "none", color: "inherit", display: "block" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                <strong style={{ fontSize: "1.05rem" }}>{w.name}</strong>
                <span style={{ fontSize: "0.75rem", background: "#8561AD20", color: "#8561AD", padding: "0.2rem 0.5rem", borderRadius: "4px" }}>{TYPE_AR[w.type] || w.type}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginTop: "1rem", fontSize: "0.85rem" }}>
                <div>الأصول: <strong>{a.assets.toLocaleString()} ر.س</strong></div>
                <div>الريع: <strong style={{ color: "#10B981" }}>{a.income.toLocaleString()}</strong></div>
                <div>الموزَّع: <strong style={{ color: "#3B82F6" }}>{a.dist.toLocaleString()}</strong></div>
                <div>مستفيدون: <strong>{a.bens.toLocaleString("ar-SA")}</strong></div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
