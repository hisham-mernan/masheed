"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** أزرار تغيير حالة عامة — تستدعي أكشن (id, status) */
export default function StatusButtons({
  id,
  options,
  action,
}: {
  id: string;
  options: { value: string; label: string; danger?: boolean }[];
  action: (id: string, status: any) => Promise<{ error?: string; success?: boolean }>;
}) {
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function run(status: string) {
    setLoading(status);
    setError("");
    const res = await action(id, status);
    setLoading("");
    if (res?.error) setError(res.error);
    else router.refresh();
  }

  return (
    <span style={{ display: "inline-flex", gap: "0.35rem", alignItems: "center", flexWrap: "wrap" }}>
      {options.map(o => (
        <button
          key={o.value}
          onClick={() => run(o.value)}
          disabled={!!loading}
          title={o.label}
          style={{
            padding: "0.25rem 0.6rem",
            borderRadius: "6px",
            border: `1px solid ${o.danger ? "#FECACA" : "#BBF7D0"}`,
            background: o.danger ? "#FEF2F2" : "#F0FDF4",
            color: o.danger ? "#DC2626" : "#15803D",
            fontSize: "0.75rem",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {loading === o.value ? "..." : o.label}
        </button>
      ))}
      {error && <span style={{ color: "#DC2626", fontSize: "0.72rem" }}>{error}</span>}
    </span>
  );
}
