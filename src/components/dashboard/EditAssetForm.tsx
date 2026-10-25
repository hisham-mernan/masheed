"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateAsset } from "@/app/actions";

export default function EditAssetForm({ asset }: { asset: any }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const inputStyle: React.CSSProperties = {
    padding: "0.75rem",
    borderRadius: "6px",
    border: "1px solid var(--border-color)",
    background: "var(--bg-main)",
    color: "var(--text-main)",
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await updateAsset(new FormData(e.currentTarget));
    setLoading(false);
    if (res?.error) setError(res.error);
    else {
      router.push("/dashboard/assets");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <input type="hidden" name="id" value={asset.id} />
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <label style={{ fontWeight: 600 }}>اسم الأصل</label>
        <input name="name" defaultValue={asset.name} required style={inputStyle} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <label style={{ fontWeight: 600 }}>التصنيف</label>
        <select name="category" defaultValue={asset.category} style={inputStyle}>
          <option value="real_estate">عقاري</option>
          <option value="agricultural">زراعي</option>
          <option value="investment">مالي / أسهم</option>
          <option value="cash">نقد</option>
        </select>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <label style={{ fontWeight: 600 }}>القيمة (ر.س)</label>
        <input name="valuation" type="number" step="0.01" defaultValue={asset.valuation} required style={inputStyle} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <label style={{ fontWeight: 600 }}>الموقع / الحساب</label>
        <input name="location" defaultValue={asset.location || ""} style={inputStyle} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <label style={{ fontWeight: 600 }}>الحالة</label>
        <select name="status" defaultValue={asset.status} style={inputStyle}>
          <option value="active">نشط</option>
          <option value="maintenance">تحت الصيانة</option>
          <option value="inactive">غير نشط</option>
        </select>
      </div>
      {error && <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", padding: "0.75rem 1rem", borderRadius: "6px" }}>{error}</div>}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
        <button type="button" onClick={() => router.back()} className="btn-outline">إلغاء</button>
        <button type="submit" className="btn-primary" disabled={loading}>{loading ? "جاري الحفظ..." : "حفظ التعديلات"}</button>
      </div>
    </form>
  );
}
