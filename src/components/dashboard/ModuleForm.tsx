"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type FieldDef = {
  name: string;
  label: string;
  type?: "text" | "number" | "date" | "select" | "textarea";
  options?: { value: string; label: string }[];
  required?: boolean;
  placeholder?: string;
  step?: string;
};

const inputStyle: React.CSSProperties = {
  padding: "0.6rem",
  borderRadius: "6px",
  border: "1px solid var(--border-color)",
  background: "var(--bg-main)",
  color: "var(--text-main)",
  width: "100%",
};

/** نموذج إضافة عام لوحدات الـ ERP — يفتح بزر ويستدعي السيرفر أكشن */
export default function ModuleForm({
  action,
  fields,
  triggerLabel,
  submitLabel = "حفظ",
}: {
  action: (formData: FormData) => Promise<{ error?: string; success?: boolean }>;
  fields: FieldDef[];
  triggerLabel: string;
  submitLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await action(new FormData(e.currentTarget));
    setLoading(false);
    if (res?.error) setError(res.error);
    else {
      (e.target as HTMLFormElement).reset();
      setOpen(false);
      router.refresh();
    }
  }

  if (!open) {
    return (
      <button className="btn-primary" onClick={() => setOpen(true)}>
        {triggerLabel}
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card" style={{ padding: "1.5rem", marginTop: "1rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
      {fields.map(f => (
        <label key={f.name} style={{ display: "flex", flexDirection: "column", gap: "0.3rem", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", gridColumn: f.type === "textarea" ? "1/-1" : undefined }}>
          {f.label}{f.required ? " *" : ""}
          {f.type === "select" ? (
            <select name={f.name} required={f.required} style={inputStyle} defaultValue="">
              <option value="" disabled>— اختر —</option>
              {f.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          ) : f.type === "textarea" ? (
            <textarea name={f.name} required={f.required} placeholder={f.placeholder} rows={2} style={{ ...inputStyle, resize: "vertical" }} />
          ) : (
            <input name={f.name} type={f.type || "text"} required={f.required} placeholder={f.placeholder} step={f.step} style={inputStyle} />
          )}
        </label>
      ))}
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "end" }}>
        <button type="submit" className="btn-primary" disabled={loading}>{loading ? "جاري الحفظ..." : submitLabel}</button>
        <button type="button" className="btn-outline" onClick={() => setOpen(false)}>إلغاء</button>
      </div>
      {error && <div style={{ gridColumn: "1/-1", color: "#DC2626", fontSize: "0.85rem" }}>{error}</div>}
    </form>
  );
}
