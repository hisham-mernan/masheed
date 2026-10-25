"use client";

import { useRouter } from "next/navigation";
import { deleteDocument } from "@/app/actions";

const TYPE_AR: Record<string, string> = { sukuk: "صك وقف", contract: "عقد", receipt: "إيصال", other: "أخرى" };

export default function DocumentList({ documents, isAdmin }: { documents: any[]; isAdmin: boolean }) {
  const router = useRouter();

  async function handleDelete(doc: any) {
    if (!confirm(`حذف المستند "${doc.title}" نهائياً؟`)) return;
    const res = await deleteDocument(doc.id);
    if (res?.error) alert("خطأ: " + res.error);
    else router.refresh();
  }

  function openFile(doc: any) {
    if (!doc.file_data) return;
    const win = window.open();
    if (win) {
      if (doc.file_data.startsWith("data:image")) {
        win.document.write(`<img src="${doc.file_data}" style="max-width:100%"/>`);
      } else {
        win.location.href = doc.file_data;
      }
    }
  }

  if (!documents.length) {
    return (
      <div className="glass-card" style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
        الأرشيف فارغ — ارفع أول صك أو مستند من النموذج أعلاه.
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
      {documents.map((doc) => (
        <div key={doc.id} className="glass-card" style={{ padding: "1.25rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "0.5rem" }}>
            <strong>{doc.title}</strong>
            <span style={{ fontSize: "0.75rem", background: "#8561AD20", color: "#8561AD", padding: "0.2rem 0.5rem", borderRadius: "4px" }}>
              {TYPE_AR[doc.doc_type] || doc.doc_type}
            </span>
          </div>
          {doc.reference_no && <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>رقم المرجع: {doc.reference_no}</div>}
          {doc.doc_date && <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>التاريخ: {doc.doc_date}</div>}
          {doc.asset_name && <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>الأصل: {doc.asset_name}</div>}
          {doc.conditions_text && (
            <div style={{ fontSize: "0.85rem", marginTop: "0.5rem", padding: "0.5rem", background: "rgba(133,97,173,0.06)", borderRadius: "6px" }}>
              {doc.conditions_text}
            </div>
          )}
          <div style={{ fontSize: "0.75rem", color: "#999", marginTop: "0.75rem" }}>
            رفعه {doc.uploaded_by} · {new Date(doc.created_at).toLocaleDateString("ar-SA")}
          </div>
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
            {doc.has_file && (
              <button className="btn-outline" style={{ fontSize: "0.8rem", padding: "0.3rem 0.7rem" }} onClick={() => openFile(doc)}>
                👁️ عرض الملف ({doc.file_name})
              </button>
            )}
            {isAdmin && (
              <button className="btn-outline" style={{ fontSize: "0.8rem", padding: "0.3rem 0.7rem", color: "#DC2626" }} onClick={() => handleDelete(doc)}>
                حذف
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
