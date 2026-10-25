import styles from "./assets.module.css";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import ExportButton from "@/components/dashboard/ExportButton";
import AssetsTable from "@/components/dashboard/AssetsTable";
import { getWaqfScope, scopeQuery } from "@/lib/waqf-scope";

export default async function AssetsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("role, is_platform_admin").eq("id", user?.id).single();
  const canWrite = ["admin", "supervisor"].includes(profile?.role || "");
  const isAdmin = profile?.role === "admin";
  const scope = profile?.is_platform_admin ? await getWaqfScope() : null;
  const { data: assets } = await scopeQuery(
    supabase.from("assets").select("*"), scope
  ).order("created_at", { ascending: false });

  return (
    <div className="fade-in">
      <div className={styles.header}>
        <div className={styles.titleInfo}>
          <h1>سجل الأصول الوقفية</h1>
          <p>إدارة وتوثيق صكوك الأوقاف العقارية، المحافظ المالية، والأصول النقدية.</p>
        </div>
        <div className={styles.actions}>
          <Link href="/dashboard/reports/assets" className={styles.secBtn} style={{ textDecoration: 'none' }}>📄 تقرير PDF</Link>
          <ExportButton data={assets || []} filename="سجل_الأصول" className={styles.secBtn} />
          {canWrite && (
            <Link href="/dashboard/assets/add" className="btn-primary" style={{ textDecoration: 'none' }}>إضافة أصل وقفي +</Link>
          )}
        </div>
      </div>

      <AssetsTable assets={assets || []} canWrite={canWrite} isAdmin={isAdmin} />
    </div>
  );
}
