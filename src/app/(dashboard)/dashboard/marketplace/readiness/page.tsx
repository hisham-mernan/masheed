import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { getWaqfScope, scopeQuery } from "@/lib/waqf-scope";
import styles from "../../assets/assets.module.css";

export default async function ReadinessPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("is_platform_admin").eq("id", user?.id).single();
  const scope = profile?.is_platform_admin ? await getWaqfScope() : null;

  const [{ data: docs }, { data: tx }, { data: decisions }, { data: assets }, { data: contracts }, { data: meetings }] = await Promise.all([
    scopeQuery(supabase.from("documents").select("id"), scope),
    scopeQuery(supabase.from("transactions").select("id"), scope),
    scopeQuery(supabase.from("decisions").select("id, status"), scope),
    scopeQuery(supabase.from("assets").select("id, name, valuation, status"), scope),
    scopeQuery(supabase.from("contracts").select("id, status").eq("status", "active"), scope),
    scopeQuery(supabase.from("meetings").select("id, status"), scope),
  ]);

  // معايير الجاهزية محسوبة من البيانات الفعلية
  const checks = [
    { task: "توثيق صك الوقف والمستندات الرسمية في النظام", done: (docs?.length ?? 0) > 0, score: 25, fix: "/dashboard/ocr" },
    { task: "سجل مالي فعّال (قيود دفتر أستاذ موثقة)", done: (tx?.length ?? 0) >= 3, score: 25, fix: "/dashboard/finance" },
    { task: "حوكمة فعّالة: اجتماعات وقرارات موثقة لمجلس النظارة", done: (meetings?.length ?? 0) > 0 && (decisions?.length ?? 0) > 0, score: 25, fix: "/dashboard/governance" },
    { task: "أصول مقيّمة بعقود نشطة (جاهزية فنية وتشغيلية)", done: (assets || []).some(a => Number(a.valuation) > 0) && (contracts?.length ?? 0) > 0, score: 25, fix: "/dashboard/contracts" },
  ];
  const totalScore = checks.reduce((s, c) => s + (c.done ? c.score : 0), 0);
  const verdict = totalScore === 100 ? { text: "جاهز للطرح ✅", color: "#15803D" } : totalScore >= 50 ? { text: "قريب من الجاهزية — أكمل المتطلبات", color: "#B45309" } : { text: "غير جاهز بعد", color: "#DC2626" };

  return (
    <div className="fade-in">
      <div className={styles.header}>
        <div className={styles.titleInfo}>
          <h1>جاهزية طرح الصكوك</h1>
          <p>فحص جاهزية الوقف قانونياً وحوكمياً ومالياً للطرح في سوق وقف باي مشيد — محسوب من بياناتك الفعلية.</p>
        </div>
        <div className={styles.actions}>
          <Link href="/dashboard/marketplace" className={styles.secBtn} style={{ textDecoration: "none" }}>طلبات الطرح ←</Link>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "1.5rem", marginTop: "1.5rem" }}>
        <div className="glass-card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#8561AD", marginBottom: "1rem" }}>📋 معايير التدقيق</h3>
          {checks.map((c, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.9rem 1rem", marginBottom: "0.6rem", borderRadius: "8px", background: c.done ? "#F0E7FF" : "#F8FAFC", border: `1px solid ${c.done ? "#8561AD" : "#E2E8F0"}` }}>
              <div style={{ width: 22, height: 22, borderRadius: "6px", border: "2px solid #8561AD", background: c.done ? "#8561AD" : "transparent", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.8rem", flexShrink: 0 }}>
                {c.done && "✓"}
              </div>
              <span style={{ flex: 1, fontSize: "0.88rem" }}>{c.task}</span>
              <span style={{ fontSize: "0.78rem", fontWeight: 700, color: c.done ? "#8561AD" : "#94A3B8" }}>{c.score} نقطة</span>
              {!c.done && <Link href={c.fix} style={{ fontSize: "0.75rem", color: "#8561AD", fontWeight: 700, textDecoration: "none" }}>أكمل من هنا ←</Link>}
            </div>
          ))}
        </div>

        <div className="glass-card" style={{ padding: "1.5rem", textAlign: "center", alignSelf: "start" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#8561AD" }}>درجة الجاهزية</h3>
          <div style={{ position: "relative", width: 150, height: 150, margin: "1.25rem auto" }}>
            <svg viewBox="0 0 120 120" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="60" cy="60" r="52" fill="none" stroke="#F1F5F9" strokeWidth="12" />
              <circle cx="60" cy="60" r="52" fill="none" stroke={totalScore === 100 ? "#10B981" : "#8561AD"} strokeWidth="12" strokeLinecap="round"
                strokeDasharray={`${(totalScore / 100) * 326.7} 326.7`} />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: "2rem", fontWeight: 800 }}>{totalScore}٪</span>
            </div>
          </div>
          <div style={{ fontWeight: 700, color: verdict.color }}>{verdict.text}</div>
          {totalScore === 100 && (
            <Link href="/dashboard/marketplace" className="btn-primary" style={{ display: "inline-block", marginTop: "1rem", textDecoration: "none" }}>
              ابدأ طلب الطرح ←
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
