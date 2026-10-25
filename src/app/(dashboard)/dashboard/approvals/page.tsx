import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import ApprovalActions from "@/components/dashboard/ApprovalActions";
import { getWaqfScope, scopeQuery } from "@/lib/waqf-scope";
import styles from "../assets/assets.module.css";

const TYPE_AR: Record<string, string> = {
  distribute_yield: "توزيع ريع على المستفيدين",
  settle_wallets: "صرف المحافظ (تحويل بنكي)",
};
const STATUS_AR: Record<string, { label: string; color: string }> = {
  pending: { label: "بانتظار الاعتماد", color: "#F59E0B" },
  approved: { label: "معتمد — بانتظار التنفيذ", color: "#3B82F6" },
  rejected: { label: "مرفوض", color: "#EF4444" },
  executed: { label: "تم التنفيذ ✓", color: "#10B981" },
  cancelled: { label: "ملغي", color: "#999" },
};

export default async function ApprovalsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_platform_admin")
    .eq("id", user?.id)
    .single();
  const canWrite = ["admin", "supervisor"].includes(profile?.role || "");
  const scope = profile?.is_platform_admin ? await getWaqfScope() : null;

  const { data: requests } = await scopeQuery(
    supabase
      .from("approval_requests")
      .select("*, waqfs(name), creator:profiles!approval_requests_created_by_fkey(full_name), decider:profiles!approval_requests_decided_by_fkey(full_name), executor:profiles!approval_requests_executed_by_fkey(full_name)"),
    scope
  ).order("created_at", { ascending: false });

  const pending = requests?.filter(r => r.status === "pending") || [];
  const approved = requests?.filter(r => r.status === "approved") || [];
  const done = requests?.filter(r => ["executed", "rejected", "cancelled"].includes(r.status)) || [];

  function Row({ r }: { r: any }) {
    const st = STATUS_AR[r.status] || { label: r.status, color: "#999" };
    return (
      <tr>
        <td>
          <strong>{TYPE_AR[r.type] || r.type}</strong>
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{(r.waqfs as any)?.name}</div>
        </td>
        <td><strong>{r.amount ? Number(r.amount).toLocaleString() + " ر.س" : "—"}</strong></td>
        <td>{(r.creator as any)?.full_name || "—"}</td>
        <td>
          <span style={{ color: st.color, fontWeight: 700, fontSize: "0.85rem" }}>{st.label}</span>
          {r.decider && (
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              بواسطة {(r.decider as any)?.full_name}
              {r.decision_note ? ` — ${r.decision_note}` : ""}
            </div>
          )}
          {r.executor && (
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              نفّذه {(r.executor as any)?.full_name}
            </div>
          )}
        </td>
        <td style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
          {new Date(r.created_at).toLocaleString("ar-SA")}
        </td>
        <td>
          <ApprovalActions
            requestId={r.id}
            status={r.status}
            isMine={r.created_by === user?.id}
            canWrite={canWrite}
          />
        </td>
      </tr>
    );
  }

  function Section({ title, items, empty }: { title: string; items: any[]; empty: string }) {
    return (
      <div className="glass-card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
        <h3 style={{ marginTop: 0 }}>{title} ({items.length})</h3>
        {items.length > 0 ? (
          <table className={styles.table}>
            <thead>
              <tr><th>الطلب</th><th>المبلغ</th><th>أنشأه</th><th>الحالة</th><th>التاريخ</th><th>إجراء</th></tr>
            </thead>
            <tbody>
              {items.map((r) => <Row key={r.id} r={r} />)}
            </tbody>
          </table>
        ) : <p style={{ color: "var(--text-muted)" }}>{empty}</p>}
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className={styles.header}>
        <div className={styles.titleInfo}>
          <h1>مركز الاعتمادات (Maker–Checker)</h1>
          <p>لا عملية مالية تُنفَّذ بضغطة واحدة: من ينشئ الطلب لا يعتمدُه، ومن يعتمد ينفّذ أو يترك التنفيذ لغيره.</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
        {[
          { label: "بانتظار الاعتماد", value: pending.length, color: "#F59E0B" },
          { label: "معتمد بانتظار التنفيذ", value: approved.length, color: "#3B82F6" },
          { label: "مكتمل / مرفوض", value: done.length, color: "#10B981" },
        ].map((c) => (
          <div key={c.label} className="glass-card" style={{ padding: "1rem", textAlign: "center" }}>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: c.color }}>{c.value.toLocaleString("ar-SA")}</div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{c.label}</div>
          </div>
        ))}
      </div>

      <Section title="⏳ طلبات بانتظار الاعتماد" items={pending} empty="لا طلبات معلقة — كل شيء معتمد ✓" />
      <Section title="✅ معتمدة بانتظار التنفيذ" items={approved} empty="لا طلبات معتمدة بانتظار التنفيذ." />
      <Section title="📁 السجل (منفَّذ / مرفوض)" items={done} empty="لا سجل بعد." />

      <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
        الطلبات تُنشأ من صفحة <Link href="/dashboard/beneficiary" style={{ color: "#8561AD" }}>المستفيدين</Link> عبر زرّي "طلب توزيع الريع" و"طلب صرف المحافظ".
      </p>
    </div>
  );
}
