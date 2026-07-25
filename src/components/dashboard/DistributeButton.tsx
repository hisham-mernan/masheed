"use client";

import React, { useState } from "react";
import { distributeYield } from "@/app/actions";

export default function DistributeButton({ className, style }: { className?: string, style?: React.CSSProperties }) {
  const [loading, setLoading] = useState(false);

  const handleDistribute = async () => {
    if (!confirm("سيتم الآن توزيع الأرباح على المستفيدين حسب حصصهم. هل أنت متأكد؟")) return;
    
    setLoading(true);
    // Passing a dummy transaction ID for demo
    const res = await distributeYield("demo-transaction");
    setLoading(false);

    if (res?.error) {
      alert("حدث خطأ: " + res.error);
    } else {
      alert("تم توزيع العوائد بنجاح على المحافظ!");
    }
  };

  return (
    <button onClick={handleDistribute} disabled={loading} className={className} style={style}>
      {loading ? "جاري التوزيع..." : "توزيع أرباح يدوياً"}
    </button>
  );
}
