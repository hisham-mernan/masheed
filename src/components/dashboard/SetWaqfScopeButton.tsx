"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setSelectedWaqf } from "@/app/actions";

export default function SetWaqfScopeButton({ waqfId }: { waqfId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  return (
    <button
      className="btn-primary"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        await setSelectedWaqf(waqfId);
        setLoading(false);
        router.push("/dashboard");
        router.refresh();
      }}
    >
      {loading ? "جاري التحويل..." : "العمل داخل هذا الوقف ←"}
    </button>
  );
}
