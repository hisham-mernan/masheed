"use client";

import React, { useState } from "react";
import { settleWallets } from "@/app/actions";

export default function SettleButton({
  className,
  style,
  totalWallet = 0,
}: {
  className?: string;
  style?: React.CSSProperties;
  totalWallet?: number;
}) {
  const [loading, setLoading] = useState(false);

  const handleSettle = async () => {
    if (totalWallet <= 0) {
      alert("لا توجد أرصدة معلقة في المحافظ.");
      return;
    }
    if (!confirm(`سيتم إنشاء طلب صرف ${totalWallet.toLocaleString()} ر.س من المحافظ — لن يُنفَّذ إلا بعد اعتماد شخص آخر من صفحة الاعتمادات. متابعة؟`)) return;

    setLoading(true);
    const res = await settleWallets();
    setLoading(false);

    if (res?.error) {
      alert("حدث خطأ: " + res.error);
    } else {
      alert("تم إنشاء طلب الصرف ✓\nبانتظار اعتماد شخص آخر (Maker–Checker) من صفحة الاعتمادات.");
    }
  };

  return (
    <button onClick={handleSettle} disabled={loading} className={className} style={style}>
      {loading ? "جاري الإرسال..." : "طلب صرف المحافظ"}
    </button>
  );
}
