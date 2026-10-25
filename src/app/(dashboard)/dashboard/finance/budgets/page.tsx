import { createClient } from "@/lib/supabase/server";
import { getWaqfScope, scopeQuery } from "@/lib/waqf-scope";
import ModuleForm from "@/components/dashboard/ModuleForm";
import { addBudget } from "@/app/actions";
import styles from "../../assets/assets.module.css";

export default async function BudgetsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("role, is_platform_admin").eq("id", user?.id).single();
  const canWrite = ["admin", "supervisor"].includes(profile?.role || "");
  const scope = profile?.is_platform_admin ? await getWaqfScope() : null;

  const [{ data: budgets }, { data: expenses }] = await Promise.all([
    scopeQuery(supabase.from("budgets").select("*, waqfs(name)"), scope).order("created_at", { ascending: false }),
    scopeQuery(supabase.from("transactions").select("amount").eq("type", "expense"), scope),
  ]);

  // المصروف الفعلي موزع بالتساوي كنسبة تقديرية على الميزانيات النشطة (حتى يُربط بند المصروف بالميزانية)
  const totalSpent = (expenses || []).reduce((s, e) => s + Number(e.amount || 0), 0);
  const activeBudgets = (budgets || []).filter(b => b.status === "active");
  const totalAllocated = activeBudgets.reduce((s, b) => s + Number(b.allocated || 0), 0);

  return (
    <div className="fade-in">
      <div className={styles.header}>
        <div className={styles.titleInfo}>
          <h1>الميزانيات التشغيلية</h1>
          <p>تخطيط ومتابعة ميزانيات الصيانة والرعاية والتشغيل مقابل المصروف الفعلي.</p>
        </div>
        <div className={styles.actions}>
          {canWrite && (
            <ModuleForm
              action={addBudget}
              triggerLabel="إنشاء ميزانية +"
              fields={[
                { name: "name", label: "اسم الميزانية", required: true, placeholder: "مثال: ميزانية الصيانة العامة" },
                { name: "allocated", label: "المبلغ المعتمد (ر.س)", type: "number", required: true, step: "any" },
                { name: "period", label: "الفترة", placeholder: "مثال: الربع الثالث 2026" },
              ]}
            />
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", marginTop: "1.5rem" }}>
        {[
          { label: "إجمالي المعتمد", value: `${Math.round(totalAllocated).toLocaleString()} ر.س`, color: "#8561AD" },
          { label: "إجمالي المصروف الفعلي", value: `${Math.round(totalSpent).toLocaleString()} ر.س`, color: "#EF4444" },
          { label: "ميزانيات نشطة", value: activeBudgets.length, color: "#10B981" },
        ].map(s => (
          <div key={s.label} className="glass-card" style={{ padding: "1rem 1.25rem", borderTop: `3px solid ${s.color}` }}>
            <div style={{ fontSize: "1.2rem", fontWeight: 800 }}>{s.value}</div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1.25rem", marginTop: "1.5rem" }}>
        {budgets && budgets.length > 0 ? budgets.map(b => {
          const alloc = Number(b.allocated || 0);
          // تقدير المصروف على هذه الميزانية بنسبة حجمها من إجمالي المعتمد
          const est = totalAllocated > 0 && b.status === "active" ? totalSpent * (alloc / totalAllocated) : 0;
          const pct = alloc > 0 ? Math.min((est / alloc) * 100, 100) : 0;
          const over = est > alloc;
          return (
            <div key={b.id} className="glass-card" style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                <div>
                  <strong>{b.name}</strong>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{b.period || "—"} · {(b.waqfs as any)?.name || ""}</div>
                </div>
                <span style={{ fontSize: "0.72rem", fontWeight: 700, color: b.status === "active" ? "#15803D" : "#64748B", background: b.status === "active" ? "#F0FDF4" : "#F1F5F9", padding: "0.2rem 0.55rem", borderRadius: "6px" }}>
                  {b.status === "active" ? "نشطة" : "مغلقة"}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: "0.35rem" }}>
                <span style={{ color: "var(--text-muted)" }}>المصروف التقديري: <strong style={{ color: over ? "#DC2626" : "#1E293B" }}>{Math.round(est).toLocaleString()}</strong></span>
                <span style={{ color: "var(--text-muted)" }}>المعتمد: <strong style={{ color: "#1E293B" }}>{alloc.toLocaleString()}</strong></span>
              </div>
              <div style={{ background: "#F1F5F9", borderRadius: "8px", height: "10px", overflow: "hidden" }}>
                <div style={{ width: `${pct}%`, height: "100%", background: over ? "#EF4444" : pct > 75 ? "#F59E0B" : "#10B981", borderRadius: "8px", transition: "width 400ms" }} />
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.35rem" }}>{pct.toFixed(0)}٪ مستهلك{over ? " — تجاوز الميزانية!" : ""}</div>
            </div>
          );
        }) : (
          <div className="glass-card" style={{ padding: "2.5rem", textAlign: "center", color: "var(--text-muted)", gridColumn: "1/-1" }}>
            لا توجد ميزانيات بعد. أنشئ أول ميزانية تشغيلية.
          </div>
        )}
      </div>
    </div>
  );
}
