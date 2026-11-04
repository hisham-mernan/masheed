import styles from "./audit.module.css";
import { createClient } from "@/lib/supabase/server";
import AuditLogList from "@/components/dashboard/AuditLogList";
import { getWaqfScope, scopeQuery } from "@/lib/waqf-scope";

export default async function AuditPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("is_platform_admin").eq("id", user?.id).single();
  const scope = profile?.is_platform_admin ? await getWaqfScope() : null;

  const { data: rawLogs } = await scopeQuery(
    supabase.from("audit_logs").select(`
      id,
      action,
      entity_type,
      entity_id,
      changes,
      created_at,
      profiles ( full_name )
    `), scope
  ).order("created_at", { ascending: false }).limit(50);
  const { count: totalEvents } = await scopeQuery(
    supabase.from("audit_logs").select("id", { count: "exact", head: true }), scope
  );

  const logs = (rawLogs || []).map((log) => ({
    id: log.id,
    action: log.action,
    entity_type: log.entity_type,
    changes: log.changes,
    created_at: log.created_at,
    user_name: (log.profiles as any)?.full_name || null,
  }));

  return (
    <div className="fade-in">
      <div className={styles.header}>
        <h1 className={styles.title}>سجل الأحداث</h1>
        <p className={styles.subtitle}>سجل أحداث حقيقي من قاعدة البيانات — اضغط على أي حدث لعرض من قام به وما الذي تغيّر بالضبط.</p>
      </div>

      <div className={styles.topGrid}>
        <div className={`${styles.complianceCard} glass-card`}>
          <div className={styles.complianceHeader}>
            <h3>إجمالي الأحداث الموثقة</h3>
            <span className={styles.percentage}>{(totalEvents ?? logs.length).toLocaleString("en-US")}</span>
          </div>
          <p className={styles.complianceNote}>كل عملية على الأصول والمعاملات والمستفيدين والتوزيعات والمهام والمستندات تُسجل تلقائياً مع هوية المستخدم.</p>
        </div>

        <div className={`${styles.zatcaCard} glass-card`}>
          <div className={styles.zatcaInfo}>
            <h3>آلية التسجيل</h3>
            <span className={styles.statusActive}>تكتبه قاعدة البيانات تلقائياً عند كل إضافة أو تعديل أو حذف، ويعرض هنا آخر 50 حدثاً</span>
          </div>
          <div className={styles.zatcaIcon}>🛡️</div>
        </div>
      </div>

      <div className={`${styles.logContainer} glass-card`}>
        <div className={styles.logHeader}>
          <h3>سجل الأحداث (Audit Log)</h3>
          <div className={styles.shieldInfo}>
            <span className={styles.shieldIcon}>🔒</span>
            البيانات مباشرة من جدول audit_logs
          </div>
        </div>
        <AuditLogList logs={logs} />
      </div>
    </div>
  );
}
