"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateWaqfSettings } from "@/app/actions";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.6rem",
  borderRadius: "6px",
  border: "1px solid var(--border-color)",
  background: "var(--bg-main)",
  color: "var(--text-main)",
};

export default function WaqfSettingsForm({ defaultName, defaultShares }: { defaultName: string; defaultShares: number }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    const res = await updateWaqfSettings(new FormData(e.currentTarget));
    setLoading(false);
    if (res?.error) setMsg({ ok: false, text: res.error });
    else {
      setMsg({ ok: true, text: "تم حفظ إعدادات الوقف بنجاح ✓" });
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "480px" }}>
      <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
        اسم الوقف
        <input name="name" defaultValue={defaultName} required style={inputStyle} />
      </label>
      <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
        إجمالي أسهم الوقف (Tokenization)
        <input name="total_shares" type="number" defaultValue={defaultShares} min={0} style={inputStyle} />
      </label>
      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
        <button type="submit" className="btn-primary" disabled={loading}>{loading ? "جاري الحفظ..." : "حفظ الإعدادات"}</button>
        {msg && <span style={{ fontSize: "0.82rem", color: msg.ok ? "#15803D" : "#DC2626" }}>{msg.text}</span>}
      </div>
    </form>
  );
}
