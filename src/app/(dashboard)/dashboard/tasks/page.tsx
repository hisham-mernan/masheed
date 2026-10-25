import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import AddTaskForm from "@/components/dashboard/AddTaskForm";
import TaskActions from "@/components/dashboard/TaskActions";
import styles from "../assets/assets.module.css";
import { getWaqfScope, scopeQuery } from "@/lib/waqf-scope";

const priorityMap: Record<string, { label: string; color: string }> = {
  urgent: { label: "عاجل", color: "#EF4444" },
  in_progress: { label: "جاري", color: "#F59E0B" },
  scheduled: { label: "مجدول", color: "#3B82F6" },
};

const statusMap: Record<string, string> = {
  open: "مفتوحة",
  done: "مكتملة",
  cancelled: "ملغاة",
};

export default async function TasksPage({ searchParams }: { searchParams: Promise<{ asset?: string }> }) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("role, is_platform_admin").eq("id", user?.id).single();
  const canWrite = ["admin", "supervisor"].includes(profile?.role || "");
  const scope = profile?.is_platform_admin ? await getWaqfScope() : null;

  let query = scopeQuery(supabase
    .from("maintenance_tasks")
    .select("id, asset_id, title, priority, status, due_date, notes, created_at, completed_at, assets(name), profiles!maintenance_tasks_created_by_fkey(full_name)"), scope)
    .order("created_at", { ascending: false });

  if (params?.asset) query = query.eq("asset_id", params.asset);

  const [{ data: tasks }, { data: assets }] = await Promise.all([
    query,
    scopeQuery(supabase.from("assets").select("id, name"), scope),
  ]);

  return (
    <div className="fade-in">
      <div className={styles.header}>
        <div className={styles.titleInfo}>
          <h1>مهام الصيانة والتشغيل</h1>
          <p>متابعة طلبات الصيانة والعقود لكل أصل — من الفتح حتى الإنجاز.</p>
        </div>
        <div className={styles.actions}>
          <Link href="/dashboard/reports/maintenance" className="btn-outline" style={{ textDecoration: 'none' }}>📄 تقرير PDF</Link>
        </div>
      </div>

      {canWrite && <AddTaskForm assets={assets || []} defaultAsset={params?.asset} />}

      <div className={`${styles.ledgerContainer} glass-card`} style={{ marginTop: "2rem" }}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>المهمة</th>
              <th>الأصل</th>
              <th>الأولوية</th>
              <th>الحالة</th>
              <th>الاستحقاق</th>
              <th>أنشأها</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {tasks && tasks.length > 0 ? tasks.map((t) => (
              <tr key={t.id} style={{ opacity: t.status === "done" ? 0.6 : 1 }}>
                <td>
                  <strong>{t.title}</strong>
                  {t.notes && <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{t.notes}</div>}
                </td>
                <td>{t.asset_id ? <Link href={`/dashboard/assets/${t.asset_id}`} style={{ color: "#8561AD", textDecoration: "none" }}>{(t.assets as any)?.name}</Link> : "عام"}</td>
                <td><span style={{ color: priorityMap[t.priority]?.color, fontWeight: "bold" }}>{priorityMap[t.priority]?.label || t.priority}</span></td>
                <td>{statusMap[t.status] || t.status}{t.completed_at ? ` (${new Date(t.completed_at).toLocaleDateString("ar-SA")})` : ""}</td>
                <td>{t.due_date ? new Date(t.due_date).toLocaleDateString("ar-SA") : "—"}</td>
                <td>{(t.profiles as any)?.full_name || "—"}</td>
                <td>{canWrite && <TaskActions taskId={t.id} status={t.status} />}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                  لا توجد مهام. {canWrite ? "أضف أول مهمة من النموذج أعلاه." : ""}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
