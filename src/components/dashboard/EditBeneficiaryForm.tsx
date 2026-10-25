"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateBeneficiary } from "@/app/actions";

export default function EditBeneficiaryForm({ beneficiary }: { beneficiary: any }) {
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
    const res = await updateBeneficiary(new FormData(e.currentTarget));
    setLoading(false);
    if (res?.error) setError(res.error);
    else {
      router.push("/dashboard/beneficiary");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
      <input type="hidden" name="id" value={beneficiary.id} />
      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
        <label style={{ fontWeight: 600 }}>الاسم الكامل</label>
        <input name="full_name" defaultValue={beneficiary.name} required style={inputStyle} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
        <label style={{ fontWeight: 600 }}>رقم الهوية</label>
        <input name="national_id" defaultValue={beneficiary.national_id || ""} style={inputStyle} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
        <label style={{ fontWeight: 600 }}>الأسهم (Tokens)</label>
        <input name="shares_owned" type="number" step="0.01" defaultValue={beneficiary.shares_owned} required style={inputStyle} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
        <label style={{ fontWeight: 600 }}>الحالة</label>
        <select name="status" defaultValue={beneficiary.status} style={inputStyle}>
          <option value="active">نشط</option>
          <option value="suspended">موقوف</option>
          <option value="deceased">متوفى</option>
        </select>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
        <label style={{ fontWeight: 600 }}>بيانات التواصل</label>
        <input name="contact_info" defaultValue={beneficiary.contact_info || ""} style={inputStyle} />
      </div>
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "end" }}>
        <button type="submit" className="btn-primary" disabled={loading}>{loading ? "جاري الحفظ..." : "حفظ"}</button>
        <button type="button" onClick={() => router.back()} className="btn-outline">إلغاء</button>
      </div>
      {error && <div style={{ gridColumn: "1/-1", background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", padding: "0.75rem 1rem", borderRadius: "6px" }}>{error}</div>}
    </form>
  );
}
