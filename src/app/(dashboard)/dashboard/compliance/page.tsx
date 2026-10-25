import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import styles from "../assets/assets.module.css";
import { getWaqfScope, scopeQuery } from "@/lib/waqf-scope";

export default async function CompliancePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: myProfile } = await supabase
    .from("profiles")
    .select("role, is_platform_admin")
    .eq("id", user?.id)
    .single();
  const isAdmin = myProfile?.role === "admin";
  const scope = myProfile?.is_platform_admin ? await getWaqfScope() : null;

  // Fetch Users (Profiles) in the selected Waqf
  const { data: users } = await scopeQuery(
    supabase.from("profiles").select("*"), scope
  ).order("created_at", { ascending: false });

  // Fetch Audit Logs
  const { data: auditLogs } = await scopeQuery(
    supabase.from("audit_logs").select(`
      id,
      action,
      entity_type,
      created_at,
      profiles ( full_name )
    `), scope
  ).order("created_at", { ascending: false }).limit(20);

  const formatRole = (role: string) => {
    switch(role) {
      case 'admin': return 'مدير نظام';
      case 'supervisor': return 'مشرف';
      case 'auditor': return 'مراقب مالي';
      case 'viewer': return 'قارئ فقط';
      default: return role;
    }
  };

  const formatAction = (action: string) => {
    switch(action) {
      case 'INSERT': return 'إضافة';
      case 'UPDATE': return 'تعديل';
      case 'DELETE': return 'حذف';
      default: return action;
    }
  };

  return (
    <div className="fade-in">
      <div className={styles.header}>
        <div className={styles.titleInfo}>
          <h1>الرقابة والامتثال (Audit & Users)</h1>
          <p>إدارة الصلاحيات وتتبع كافة التغييرات التي تمت داخل النظام (ممتثل لمتطلبات هيئة الأوقاف).</p>
        </div>
        <div className={styles.actions}>
          {isAdmin && (
            <Link href="/dashboard/compliance/add" className="btn-primary" style={{ textDecoration: 'none' }}>إضافة مستخدم (صلاحية) +</Link>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
        
        {/* Users Table */}
        <div className={`${styles.ledgerContainer} glass-card`}>
          <h3 style={{ padding: '1.5rem', margin: 0, borderBottom: '1px solid var(--border)' }}>المستخدمون والصلاحيات</h3>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>الاسم</th>
                <th>الصلاحية</th>
                <th>تاريخ الانضمام</th>
              </tr>
            </thead>
            <tbody>
              {users && users.length > 0 ? users.map((u) => (
                <tr key={u.id}>
                  <td><strong>{u.full_name || 'بدون اسم'}</strong></td>
                  <td>
                    <span className={styles.statusTag} style={{ background: u.role === 'admin' ? '#8561AD20' : '#10B98120', color: u.role === 'admin' ? '#8561AD' : '#10B981', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>
                      {formatRole(u.role)}
                    </span>
                  </td>
                  <td>{new Date(u.created_at).toLocaleDateString("ar-SA")}</td>
                </tr>
              )) : (
                <tr><td colSpan={3} style={{ textAlign: 'center', padding: '1rem' }}>لا يوجد مستخدمين آخرين</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Audit Logs */}
        <div className={`${styles.ledgerContainer} glass-card`}>
          <h3 style={{ padding: '1.5rem', margin: 0, borderBottom: '1px solid var(--border)' }}>سجل العمليات (Audit Trail)</h3>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>المستخدم</th>
                <th>العملية</th>
                <th>القسم</th>
                <th>التاريخ والوقت</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs && auditLogs.length > 0 ? auditLogs.map((log) => (
                <tr key={log.id}>
                  <td>{(log.profiles as any)?.full_name || 'النظام'}</td>
                  <td>
                    <span style={{ fontWeight: 'bold', color: log.action === 'DELETE' ? '#EF4444' : log.action === 'INSERT' ? '#10B981' : '#3B82F6' }}>
                      {formatAction(log.action)}
                    </span>
                  </td>
                  <td>{log.entity_type}</td>
                  <td style={{ direction: 'ltr', textAlign: 'right' }}>{new Date(log.created_at).toLocaleString("ar-SA")}</td>
                </tr>
              )) : (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '1rem' }}>لا توجد عمليات مسجلة (الـ Trigger يعمل عند الإضافة/التعديل)</td></tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
