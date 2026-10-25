"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setTaskStatus } from "@/app/actions";

export default function TaskActions({ taskId, status }: { taskId: string; status: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function setStatus(s: "done" | "open" | "cancelled") {
    setLoading(true);
    const res = await setTaskStatus(taskId, s);
    setLoading(false);
    if (res?.error) alert("خطأ: " + res.error);
    else router.refresh();
  }

  if (loading) return <span>...</span>;

  return (
    <div style={{ display: "flex", gap: "0.4rem" }}>
      {status === "open" && (
        <>
          <button className="btn-outline" style={{ padding: "0.25rem 0.6rem", fontSize: "0.8rem" }} onClick={() => setStatus("done")}>✓ إنجاز</button>
          <button className="btn-outline" style={{ padding: "0.25rem 0.6rem", fontSize: "0.8rem", color: "#DC2626" }} onClick={() => setStatus("cancelled")}>إلغاء</button>
        </>
      )}
      {status !== "open" && (
        <button className="btn-outline" style={{ padding: "0.25rem 0.6rem", fontSize: "0.8rem" }} onClick={() => setStatus("open")}>إعادة فتح</button>
      )}
    </div>
  );
}
