import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import styles from "../assets/assets.module.css";
import { getWaqfScope, scopeQuery } from "@/lib/waqf-scope";

const catMap: Record<string, string> = {
  real_estate: "عقاري", agricultural: "زراعي", investment: "مالي / أسهم", cash: "نقد",
};
const typeMap: Record<string, string> = { income: "إيراد", expense: "مصروف", distribution: "توزيع" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const query = (q || "").trim();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("is_platform_admin").eq("id", user?.id).single();
  const scope = profile?.is_platform_admin ? await getWaqfScope() : null;

  let assets: any[] = [], bens: any[] = [], txs: any[] = [], docs: any[] = [];
  if (query) {
    const like = `%${query}%`;
    const [a, b, t, d] = await Promise.all([
      scopeQuery(supabase.from("assets").select("id, name, category, valuation, location"), scope).ilike("name", like).limit(10),
      scopeQuery(supabase.from("beneficiaries").select("id, name, national_id, status"), scope).or(`name.ilike.${like},national_id.ilike.${like}`).limit(10),
      scopeQuery(supabase.from("transactions").select("id, description, amount, type, transaction_date"), scope).ilike("description", like).limit(10),
      scopeQuery(supabase.from("documents").select("id, title, doc_type, reference_no"), scope).or(`title.ilike.${like},reference_no.ilike.${like}`).limit(10),
    ]);
    assets = a.data || []; bens = b.data || []; txs = t.data || []; docs = d.data || [];
  }

  const total = assets.length + bens.length + txs.length + docs.length;

  return (
    <div className="fade-in">
      <div className={styles.header}>
        <div className={styles.titleInfo}>
          <h1>نتائج البحث{query ? `: "${query}"` : ""}</h1>
          <p>{query ? `${total.toLocaleString("ar-SA")} نتيجة في الأصول والمستفيدين والمعاملات والمستندات` : "اكتب كلمة البحث في الشريط الجانبي"}</p>
        </div>
      </div>

      {query && total === 0 && (
        <div className="glass-card" style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
          لا توجد نتائج مطابقة.
        </div>
      )}

      {assets.length > 0 && (
        <div className="glass-card" style={{ padding: "1.5rem", marginBottom: "1rem" }}>
          <h3 style={{ marginTop: 0 }}>الأصول ({assets.length})</h3>
          {assets.map(a => (
            <div key={a.id} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid #f0f0f0" }}>
              <span><Link href={`/dashboard/assets/${a.id}`} style={{ color: "inherit", textDecoration: "none" }}><strong>{a.name}</strong></Link> — {catMap[a.category] || a.category} {a.location ? `· 📍${a.location}` : ""}</span>
              <span>{Number(a.valuation).toLocaleString()} ر.س</span>
            </div>
          ))}
          <Link href="/dashboard/assets" style={{ fontSize: "0.85rem", color: "#8561AD" }}>فتح سجل الأصول ←</Link>
        </div>
      )}

      {bens.length > 0 && (
        <div className="glass-card" style={{ padding: "1.5rem", marginBottom: "1rem" }}>
          <h3 style={{ marginTop: 0 }}>المستفيدون ({bens.length})</h3>
          {bens.map(b => (
            <div key={b.id} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid #f0f0f0" }}>
              <span><Link href={`/dashboard/beneficiary/${b.id}`} style={{ color: "inherit", textDecoration: "none" }}><strong>{b.name}</strong></Link> — {b.national_id || "بدون هوية"}</span>
              <span>{b.status === "active" ? "نشط" : b.status === "suspended" ? "موقوف" : "متوفى"}</span>
            </div>
          ))}
          <Link href="/dashboard/beneficiary" style={{ fontSize: "0.85rem", color: "#8561AD" }}>فتح المستفيدين ←</Link>
        </div>
      )}

      {txs.length > 0 && (
        <div className="glass-card" style={{ padding: "1.5rem", marginBottom: "1rem" }}>
          <h3 style={{ marginTop: 0 }}>المعاملات ({txs.length})</h3>
          {txs.map(t => (
            <div key={t.id} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid #f0f0f0" }}>
              <span>{t.description}</span>
              <span style={{ color: t.type === "income" ? "#10B981" : "#EF4444", fontWeight: "bold" }}>
                {typeMap[t.type] || t.type} · {Number(t.amount).toLocaleString()} ر.س
              </span>
            </div>
          ))}
          <Link href="/dashboard/finance" style={{ fontSize: "0.85rem", color: "#8561AD" }}>فتح المالية ←</Link>
        </div>
      )}

      {docs.length > 0 && (
        <div className="glass-card" style={{ padding: "1.5rem", marginBottom: "1rem" }}>
          <h3 style={{ marginTop: 0 }}>المستندات ({docs.length})</h3>
          {docs.map(d => (
            <div key={d.id} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid #f0f0f0" }}>
              <span><strong>{d.title}</strong> — {d.doc_type}</span>
              <span>{d.reference_no || "—"}</span>
            </div>
          ))}
          <Link href="/dashboard/ocr" style={{ fontSize: "0.85rem", color: "#8561AD" }}>فتح الأرشيف ←</Link>
        </div>
      )}
    </div>
  );
}
