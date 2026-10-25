"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveDocument } from "@/app/actions";

export default function DocumentUploadForm({ assets }: { assets: { id: string; name: string }[] }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const router = useRouter();

  const inputStyle: React.CSSProperties = {
    padding: "0.65rem",
    borderRadius: "6px",
    border: "1px solid var(--border-color)",
    background: "var(--bg-main)",
    color: "var(--text-main)",
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await saveDocument(new FormData(e.currentTarget));
    setLoading(false);
    if (res?.error) setError(res.error);
    else {
      (e.target as HTMLFormElement).reset();
      setFileName("");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card" style={{ padding: "1.5rem" }}>
      <h3 style={{ marginTop: 0 }}>أرشفة مستند جديد</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <label style={{ fontWeight: 600, fontSize: "0.9rem" }}>عنوان المستند *</label>
          <input name="title" required placeholder="مثال: صك وقف عمارة الخزامى" style={inputStyle} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <label style={{ fontWeight: 600, fontSize: "0.9rem" }}>نوع المستند</label>
          <select name="doc_type" defaultValue="sukuk" style={inputStyle}>
            <option value="sukuk">صك وقف</option>
            <option value="contract">عقد</option>
            <option value="receipt">إيصال / فاتورة</option>
            <option value="other">أخرى</option>
          </select>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <label style={{ fontWeight: 600, fontSize: "0.9rem" }}>رقم الصك / المرجع</label>
          <input name="reference_no" placeholder="11987453..." style={inputStyle} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <label style={{ fontWeight: 600, fontSize: "0.9rem" }}>تاريخ المستند</label>
          <input name="doc_date" placeholder="١٤٤٧/٠٥/١٠ هـ" style={inputStyle} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <label style={{ fontWeight: 600, fontSize: "0.9rem" }}>الأصل المرتبط</label>
          <select name="asset_id" style={inputStyle}>
            <option value="">— بدون —</option>
            {assets.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <label style={{ fontWeight: 600, fontSize: "0.9rem" }}>ملف المسح (صورة/PDF، حتى 2MB)</label>
          <input
            type="file"
            name="file"
            accept="image/*,application/pdf"
            onChange={(e) => setFileName(e.target.files?.[0]?.name || "")}
            style={inputStyle}
          />
          {fileName && <small style={{ color: "var(--text-muted)" }}>📎 {fileName}</small>}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", gridColumn: "1/-1" }}>
          <label style={{ fontWeight: 600, fontSize: "0.9rem" }}>شروط الواقف / ملاحظات</label>
          <textarea name="conditions_text" rows={2} placeholder="مثال: يصرف ٥٠٪ للفقراء، ٢٥٪ تحبيس، ٢٥٪ صيانة" style={{ ...inputStyle, resize: "vertical" }} />
        </div>
      </div>
      {error && <div style={{ marginTop: "1rem", background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", padding: "0.75rem 1rem", borderRadius: "6px" }}>{error}</div>}
      <div style={{ marginTop: "1rem", display: "flex", justifyContent: "flex-end" }}>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "جاري الحفظ..." : "حفظ المستند في الأرشيف"}
        </button>
      </div>
    </form>
  );
}
