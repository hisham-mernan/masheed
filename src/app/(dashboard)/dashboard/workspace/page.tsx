import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { getWaqfScope, scopeQuery } from "@/lib/waqf-scope";
import styles from "../assets/assets.module.css";

export default async function WorkspacePage() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;
  const { data: profile } = await supabase.from("profiles").select("full_name, is_platform_admin").eq("id", user?.id).single();
  const scope = profile?.is_platform_admin ? await getWaqfScope() : null;

  const [{ data: pendingApprovals }, { data: openTasks }, { data: pendingDecisions }, { data: recentLogs }] = await Promise.all([
    scopeQuery(supabase.from("approval_requests").select("id, type, amount, created_at").eq("status", "pending"), scope).order("created_at", { ascending: false }).limit(5),
    scopeQuery(supabase.from("maintenance_tasks").select("id, title, priority, due_date").eq("status", "open"), scope).order("due_date", { ascending: true }).limit(5),
    scopeQuery(supabase.from("decisions").select("id, title, type, created_at").eq("status", "pending"), scope).order("created_at", { ascending: false }).limit(5),
    scopeQuery(supabase.from("audit_logs").select("id, action, entity_type, created_at, profiles(full_name)"), scope).order("created_at", { ascending: false }).limit(5),
  ]);

  const firstName = profile?.full_name ? profile.full_name.split(" ")[0] : "مستخدم";
  const totalPending = (pendingApprovals?.length ?? 0) + (openTasks?.length ?? 0) + (pendingDecisions?.length ?? 0);

  const Card = ({ title, icon, count, href, children }: any) => (
    <div className="glass-card" style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h3 style={{ fontSize: "0.95rem", fontWeight: 700 }}>{icon} {title}</h3>
        <span style={{ background: count > 0 ? "#F0E7FF" : "#F1F5F9", color: count > 0 ? "#8561AD" : "#94A3B8", borderRadius: "12px", padding: "0.1rem 0.6rem", fontSize: "0.78rem", fontWeight: 700 }}>{count}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>{children}</div>
      <Link href={href} style={{ display: "block", marginTop: "1rem", fontSize: "0.8rem", color: "#8561AD", fontWeight: 700, textDecoration: "none" }}>فتح الصفحة ←</Link>
    </div>
  );

  const Row = ({ text, sub }: { text: string; sub?: string }) => (
    <div style={{ padding: "0.6rem 0.75rem", background: "#F8FAFC", borderRadius: "8px", border: "1px solid #E2E8F0", fontSize: "0.83rem" }}>
      <strong>{text}</strong>
      {sub && <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>{sub}</div>}
    </div>
  );

  return (
    <div className="fade-in">
      <div className={styles.header}>
        <div className={styles.titleInfo}>
          <h1>مساحة العمل — مرحباً {firstName}</h1>
          <p>كل ما يحتاج تدخلك الآن في مكان واحد: {totalPending > 0 ? `${totalPending} عنصر معلق` : "لا عناصر معلقة ✓"}.</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.25rem", marginTop: "1.5rem" }}>
        <Card title="اعتمادات بانتظارك" icon="✅" count={pendingApprovals?.length ?? 0} href="/dashboard/approvals">
          {(pendingApprovals || []).map(a => (
            <Row key={a.id} text={a.type === "distribute_yield" ? `توزيع ريع ${Number(a.amount).toLocaleString()} ر.س` : "تسوية محافظ"} sub={new Date(a.created_at).toLocaleDateString("ar-SA")} />
          ))}
          {(pendingApprovals || []).length === 0 && <Row text="لا اعتمادات معلقة ✓" />}
        </Card>

        <Card title="مهام الصيانة المفتوحة" icon="🛠️" count={openTasks?.length ?? 0} href="/dashboard/tasks">
          {(openTasks || []).map(t => (
            <Row key={t.id} text={t.title} sub={t.due_date ? `الاستحقاق: ${new Date(t.due_date).toLocaleDateString("ar-SA")}` : "بدون استحقاق"} />
          ))}
          {(openTasks || []).length === 0 && <Row text="لا مهام مفتوحة ✓" />}
        </Card>

        <Card title="قرارات بانتظار الاعتماد" icon="⚖️" count={pendingDecisions?.length ?? 0} href="/dashboard/governance">
          {(pendingDecisions || []).map(d => (
            <Row key={d.id} text={d.title} sub={new Date(d.created_at).toLocaleDateString("ar-SA")} />
          ))}
          {(pendingDecisions || []).length === 0 && <Row text="لا قرارات معلقة ✓" />}
        </Card>

        <Card title="آخر النشاطات" icon="📋" count={recentLogs?.length ?? 0} href="/dashboard/audit">
          {(recentLogs || []).map(l => (
            <Row key={l.id} text={`${(l.profiles as any)?.full_name || "النظام"} — ${{ INSERT: "إضافة", UPDATE: "تعديل", DELETE: "حذف" }[l.action as string] || l.action} في ${l.entity_type}`} sub={new Date(l.created_at).toLocaleString("ar-SA")} />
          ))}
          {(recentLogs || []).length === 0 && <Row text="لا نشاطات بعد" />}
        </Card>
      </div>
    </div>
  );
}
