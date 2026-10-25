"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { decideApproval, executeApproval } from "@/app/actions";

export default function ApprovalActions({
  requestId,
  status,
  isMine,
  canWrite,
}: {
  requestId: string;
  status: string;
  isMine: boolean;
  canWrite: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (!canWrite) return <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>—</span>;

  async function decide(decision: "approved" | "rejected") {
    const note = decision === "rejected" ? prompt("سبب الرفض (اختياري):") : null;
    if (decision === "rejected" && note === null) return;
    setLoading(true);
    const res = await decideApproval(requestId, decision, note || undefined);
    setLoading(false);
    if (res?.error) alert("خطأ: " + res.error);
    else router.refresh();
  }

  async function execute() {
    if (!confirm("تنفيذ هذا الطلب المعتمد الآن؟")) return;
    setLoading(true);
    const res = await executeApproval(requestId);
    setLoading(false);
    if (res?.error) alert("خطأ: " + res.error);
    else {
      alert("تم التنفيذ بنجاح ✓");
      router.refresh();
    }
  }

  if (status === "pending") {
    if (isMine) {
      return <span style={{ color: "#F59E0B", fontSize: "0.8rem" }}>بانتظار اعتماد شخص آخر</span>;
    }
    return (
      <div style={{ display: "flex", gap: "0.4rem" }}>
        <button
          onClick={() => decide("approved")}
          disabled={loading}
          className="btn-primary"
          style={{ padding: "0.3rem 0.8rem", fontSize: "0.8rem" }}
        >
          اعتماد ✓
        </button>
        <button
          onClick={() => decide("rejected")}
          disabled={loading}
          className="btn-outline"
          style={{ padding: "0.3rem 0.8rem", fontSize: "0.8rem", color: "#EF4444", borderColor: "#EF4444" }}
        >
          رفض ✗
        </button>
      </div>
    );
  }

  if (status === "approved") {
    return (
      <button
        onClick={execute}
        disabled={loading}
        className="btn-primary"
        style={{ padding: "0.3rem 0.8rem", fontSize: "0.8rem", background: "#10B981" }}
      >
        {loading ? "جاري التنفيذ..." : "تنفيذ ▶"}
      </button>
    );
  }

  return <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>—</span>;
}
