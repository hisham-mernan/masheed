import Sidebar from "@/components/dashboard/Sidebar";
import TopNav from "@/components/dashboard/TopNav";
import { createClient } from "@/lib/supabase/server";
import styles from "./layout.module.css";
import { redirect } from "next/navigation";
import { getWaqfScope } from "@/lib/waqf-scope";
import { getAccountContext } from "@/lib/account";
import AccessBanner from "@/components/platform/AccessBanner";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, waqf_id, is_platform_admin")
    .eq("id", user.id)
    .single();

  const { data: waqfs } = await supabase
    .from("waqfs")
    .select("id, name");

  const scope = await getWaqfScope();
  const access = (await getAccountContext())?.access;
  const isPlatformAdmin = !!profile?.is_platform_admin;
  const selectedWaqf = scope === "all" ? "all" : scope || (isPlatformAdmin ? "all" : profile?.waqf_id || "");

  // Real notification data
  const { count: openTasks } = await supabase
    .from("maintenance_tasks")
    .select("id", { count: "exact", head: true })
    .eq("status", "open");

  const { data: recentLogs } = await supabase
    .from("audit_logs")
    .select("id, action, entity_type, created_at, profiles(full_name)")
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: pendingApprovalsData } = await supabase
    .from("approval_requests")
    .select("id, type, amount, created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: openTasksData } = await supabase
    .from("maintenance_tasks")
    .select("id, title, due_date")
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(5);

  // حالة القراءة لهذا المستخدم
  const { data: reads } = await supabase
    .from("notification_reads")
    .select("ref_key")
    .eq("user_id", user.id);
  const readSet = new Set((reads || []).map((r) => r.ref_key));

  const notifications = [
    ...(pendingApprovalsData || []).map((a) => ({
      refKey: `approval:${a.id}`,
      icon: "✅",
      text: a.type === "distribute_yield"
        ? `طلب توزيع ريع بمبلغ ${Number(a.amount).toLocaleString()} ر.س بانتظار الاعتماد`
        : "طلب صرف محافظ بانتظار الاعتماد",
      href: "/dashboard/approvals",
      date: a.created_at,
    })),
    ...(openTasksData || []).map((t) => ({
      refKey: `task:${t.id}`,
      icon: "🛠️",
      text: `مهمة مفتوحة: ${t.title}`,
      href: "/dashboard/tasks",
      date: t.due_date,
    })),
    ...(recentLogs || []).map((l) => ({
      refKey: `log:${l.id}`,
      icon: "📋",
      text: `${(l.profiles as any)?.full_name || "النظام"} — ${{ INSERT: "إضافة", UPDATE: "تعديل", DELETE: "حذف" }[l.action as string] || l.action} في ${{ assets: "الأصول", transactions: "المالية", beneficiaries: "المستفيدون", distributions: "التوزيعات", maintenance_tasks: "المهام", documents: "المستندات", approval_requests: "الاعتمادات" }[l.entity_type as string] || l.entity_type}`,
      href: "/dashboard/audit",
      date: l.created_at,
    })),
  ].map((n) => ({ ...n, read: readSet.has(n.refKey) }));

  const recentEvents = (recentLogs || []).map((l) => ({
    id: l.id,
    action: l.action,
    entity_type: l.entity_type,
    created_at: l.created_at,
    user_name: (l.profiles as any)?.full_name || "النظام",
  }));

  return (
    <div className={styles.layout}>
      <Sidebar userWaqfs={waqfs || []} openTasks={openTasks || 0} isPlatformAdmin={isPlatformAdmin} selectedWaqf={selectedWaqf} hasWaqf={!!profile?.waqf_id} />
      <div className={styles.main}>
        <TopNav userProfile={profile} openTasks={openTasks || 0} recentEvents={recentEvents} notifications={notifications} />
        <main className={styles.content}>
          {access && <AccessBanner access={access} />}
          {children}
        </main>
      </div>
    </div>
  );
}
