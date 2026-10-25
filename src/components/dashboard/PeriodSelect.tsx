"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function PeriodSelect({ value }: { value: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <select
      value={value}
      onChange={(e) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("months", e.target.value);
        router.push(`/dashboard?${params.toString()}`);
      }}
      style={{
        padding: "0.4rem 0.8rem",
        borderRadius: "8px",
        border: "1px solid var(--border-color, #E4E7EF)",
        background: "var(--bg-main, #fff)",
        color: "inherit",
        fontSize: "0.85rem",
        cursor: "pointer",
      }}
    >
      <option value={6}>آخر ٦ أشهر</option>
      <option value={12}>سنة كاملة</option>
      <option value={36}>٣ سنوات</option>
    </select>
  );
}
