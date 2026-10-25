"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addMaintenanceTask } from "@/app/actions";

export default function AddTaskForm({ assets, defaultAsset }: { assets: { id: string; name: string }[]; defaultAsset?: string }) {
  const [open, setOpen] = useState(!!defaultAsset);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const inputStyle: React.CSSProperties = {
    padding: "0.6rem",
    borderRadius: "6px",
    border: "1px solid var(--border-color)",
    background: "var(--bg-main)",
    color: "var(--text-main)",
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await addMaintenanceTask(new FormData(e.currentTarget));
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
      <button className="btn-primary" onClick={() => setOpen(true)} style={{ marginTop: "1rem" }}>
        إضافة مهمة صيانة +
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card" style={{ padding: "1.5rem", marginTop: "1rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
      <input name="title" required placeholder="عنوان المهمة (مثال: إصلاح مصعد)" style={inputStyle} />
      <select name="asset_id" defaultValue={defaultAsset || ""} style={inputStyle}>
        <option value="">— بدون أصل محدد —</option>
        {assets.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
      </select>
      <select name="priority" defaultValue="scheduled" style={inputStyle}>
        <option value="urgent">عاجل</option>
        <option value="in_progress">جاري</option>
        <option value="scheduled">مجدول</option>
      </select>
      <input name="due_date" type="date" style={inputStyle} />
      <input name="notes" placeholder="ملاحظات (اختياري)" style={inputStyle} />
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <button type="submit" className="btn-primary" disabled={loading}>{loading ? "جاري الحفظ..." : "حفظ المهمة"}</button>
        <button type="button" className="btn-outline" onClick={() => setOpen(false)}>إلغاء</button>
      </div>
      {error && <div style={{ gridColumn: "1/-1", color: "#DC2626" }}>{error}</div>}
    </form>
  );
}
