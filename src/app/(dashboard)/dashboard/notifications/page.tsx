import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { getWaqfScope, scopeQuery } from "@/lib/waqf-scope";
import styles from "../assets/assets.module.css";

const ACTION_AR: Record<string, string> = { INSERT: "إضافة", UPDATE: "تعديل", DELETE: "حذف" };
const ENTITY_AR: Record<string, { label: string; href: string }> = {
  assets: { label: "الأصول", href: "/dashboard/assets" },
  transactions: { label: "المالية", href: "/dashboard/finance" },
  beneficiaries: { label: "المستفيدون", href: "/dashboard/beneficiary" },
  distributions: { label: "التوزيعات", href: "/dashboard/beneficiary" },
  maintenance_tasks: { label: "المهام", href: "/dashboard/tasks" },
  documents: { label: "المستندات", href: "/dashboard/ocr" },
};

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("role, is_platform_admin").eq("id", user?.id).single();
  const scope = profile?.is_platform_admin ? await getWaqfScope() : null;

  const [{ data: logs }, { data: openTasks }, { data: overdueTasks }, { data: pendingDists }] = await Promise.all([
    scopeQuery(
      supabase.from("audit_logs").select("id, action, entity_type, entity_id, created_at, profiles(full_name)"), scope
    ).order("created_at", { ascending: false }).limit(50),
    scopeQuery(
      supabase.from("maintenance_tasks").select("id, title, due_date, priority, assets(name)"), scope
    ).eq("status", "open").order("due_date", { ascending: true, nullsFirst: false }).limit(20),
    scopeQuery(
      supabase.from("maintenance_tasks").select("id", { count: "exact" }), scope
    ).eq("status", "open").lt("due_date", new Date().toISOString().slice(0, 10)),
    scopeQuery(
      supabase.from("distributions").select("id, total_amount, distribution_date, waqfs(name)"), scope
    ).eq("status", "pending").limit(10),
  ]);

  return (
    <div className="fade-in">
      <div className={styles.header}>
        <div className={styles.titleInfo}>
          <h1>مركز الإشعارات</h1>
          <p>كل ما يحتاج انتباهك: مهام مفتوحة ومتأخرة، توزيعات معلقة، وآخر الأحداث على النظام.</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
        <div className="glass-card" style={{ padding: "1.5rem" }}>
          <h3 style={{ marginTop: 0 }}>🛠️ مهام تحتاج متابعة ({openTasks?.length || 0})</h3>
          {openTasks && openTasks.length > 0 ? openTasks.map((t) => {
            const overdue = t.due_date && t.due_date < new Date().toISOString().slice(0, 10);
            return (
              <div key={t.id} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid #f0f0f0" }}>
                <span>
                  {t.title} <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>— {(t.assets as any)?.name || "عام"}</span>
                </span>
                <span style={{ fontSize: "0.8rem", color: overdue ? "#EF4444" : "var(--text-muted)", fontWeight: overdue ? 700 : 400 }}>
                  {overdue ? "متأخرة ⚠️ " : ""}{t.due_date ? new Date(t.due_date).toLocaleDateString("ar-SA") : "بدون موعد"}
                </span>
              </div>
            );
          }) : <p style={{ color: "var(--text-muted)" }}>لا مهام مفتوحة ✓</p>}
          {(openTasks?.length || 0) > 0 && (
            <Link href="/dashboard/tasks" style={{ fontSize: "0.85rem", color: "#8561AD" }}>فتح سجل المهام ←</Link>
          )}
        </div>

        <div className="glass-card" style={{ padding: "1.5rem" }}>
          <h3 style={{ marginTop: 0 }}>💰 توزيعات معلقة ({pendingDists?.length || 0})</h3>
          {pendingDists && pendingDists.length > 0 ? pendingDists.map((d) => (
            <div key={d.id} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid #f0f0f0" }}>
              <Link href={`/dashboard/beneficiary/distributions/${d.id}`} style={{ color: "#8561AD", textDecoration: "none" }}>
                {(d.waqfs as any)?.name} — {Number(d.total_amount).toLocaleString()} ر.س
              </Link>
              <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{new Date(d.distribution_date).toLocaleDateString("ar-SA")}</span>
            </div>
          )) : <p style={{ color: "var(--text-muted)" }}>لا توزيعات معلقة ✓</p>}
          <div style={{ marginTop: "0.75rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
            مهام متأخرة عن موعدها: <strong style={{ color: "#EF4444" }}>{(overdueTasks as any)?.length || 0}</strong>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: "1.5rem" }}>
        <h3 style={{ marginTop: 0 }}>📋 آخر الأحداث (50)</h3>
        {logs && logs.length > 0 ? logs.map((l) => {
          const ent = ENTITY_AR[l.entity_type || ""];
          return (
            <div key={l.id} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid #f7f7f7", fontSize: "0.9rem" }}>
              <span>
                <strong>{(l.profiles as any)?.full_name || "النظام"}</strong> — {ACTION_AR[l.action] || l.action}
                {ent ? <> في <Link href={ent.href} style={{ color: "#8561AD", textDecoration: "none" }}>{ent.label}</Link></> : ` (${l.entity_type})`}
              </span>
              <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{new Date(l.created_at).toLocaleString("ar-SA")}</span>
            </div>
          );
        }) : <p style={{ color: "var(--text-muted)" }}>لا أحداث مسجلة.</p>}
        <Link href="/dashboard/audit" style={{ fontSize: "0.85rem", color: "#8561AD" }}>فتح سجل الأحداث الكامل ←</Link>
      </div>
    </div>
  );
}
