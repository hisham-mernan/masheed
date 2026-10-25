import { createClient } from "@/lib/supabase/server";
import DocumentUploadForm from "@/components/dashboard/DocumentUploadForm";
import DocumentList from "@/components/dashboard/DocumentList";
import { getWaqfScope, scopeQuery } from "@/lib/waqf-scope";

export default async function DocumentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("role, is_platform_admin").eq("id", user?.id).single();
  const canWrite = ["admin", "supervisor"].includes(profile?.role || "");
  const isAdmin = profile?.role === "admin";
  const scope = profile?.is_platform_admin ? await getWaqfScope() : null;

  const [{ data: documents }, { data: assets }] = await Promise.all([
    scopeQuery(
      supabase
        .from("documents")
        .select("id, doc_type, title, reference_no, doc_date, conditions_text, file_name, file_data, created_at, profiles!documents_uploaded_by_fkey(full_name), assets(name)"),
      scope
    ).order("created_at", { ascending: false }),
    scopeQuery(supabase.from("assets").select("id, name"), scope),
  ]);

  const serialized = (documents || []).map((d) => ({
    id: d.id,
    doc_type: d.doc_type,
    title: d.title,
    reference_no: d.reference_no,
    doc_date: d.doc_date,
    conditions_text: d.conditions_text,
    file_name: d.file_name,
    has_file: !!d.file_data,
    file_data: d.file_data,
    created_at: d.created_at,
    uploaded_by: (d.profiles as any)?.full_name || "—",
    asset_name: (d.assets as any)?.name || null,
  }));

  return (
    <div className="fade-in">
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", marginBottom: "0.5rem", color: "var(--text-main)" }}>المؤرشف الرقمي للصكوك والمستندات</h1>
        <p style={{ color: "var(--text-muted)" }}>رفع الصكوك الورقية وتوثيق بياناتها — يتم الحفظ الفعلي في قاعدة البيانات مع توثيق من قام بالرفع.</p>
      </div>

      {canWrite && <DocumentUploadForm assets={assets || []} />}

      <div style={{ marginTop: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem", color: "var(--text-main)" }}>الأرشيف ({serialized.length.toLocaleString("ar-SA")})</h2>
        <DocumentList documents={serialized} isAdmin={isAdmin} />
      </div>
    </div>
  );
}
