"use client";

import React, { useState } from "react";
import { distributeYield } from "@/app/actions";

export default function DistributeButton({
  className,
  style,
  availableYield = 0,
}: {
  className?: string;
  style?: React.CSSProperties;
  availableYield?: number;
}) {
  const [loading, setLoading] = useState(false);

  const handleDistribute = async () => {
    if (availableYield <= 0) {
      alert("لا يوجد ريع متاح للتوزيع. سجّل إيرادات (Ri'a) أولاً من صفحة المالية.");
      return;
    }

    const input = prompt(
      `الريع المتاح للتوزيع: ${availableYield.toLocaleString()} ر.س\nأدخل المبلغ المراد توزيعه على المستفيدين حسب أسهمهم:`,
      String(availableYield)
    );
    if (input === null) return;

    const amount = Number(input);
    if (!amount || amount <= 0) {
      alert("مبلغ غير صحيح");
      return;
    }

    if (!confirm(`سيتم إنشاء طلب توزيع ${amount.toLocaleString()} ر.س — لن يُنفَّذ إلا بعد اعتماد شخص آخر من صفحة الاعتمادات. متابعة؟`)) return;

    setLoading(true);
    const res = await distributeYield(amount);
    setLoading(false);

    if (res?.error) {
      alert("حدث خطأ: " + res.error);
    } else {
      alert("تم إنشاء طلب التوزيع ✓\nبانتظار اعتماد شخص آخر (Maker–Checker) من صفحة الاعتمادات.");
    }
  };

  return (
    <button onClick={handleDistribute} disabled={loading} className={className} style={style}>
      {loading ? "جاري الإرسال..." : "طلب توزيع الريع"}
    </button>
  );
}
