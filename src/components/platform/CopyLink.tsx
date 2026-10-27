"use client";

import { useState } from "react";
import { s } from "./ui";

export default function CopyLink({ url }: { url: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className={`${s.btn} ${s.btnSm} ${s.btnGhost}`}
      onClick={() => navigator.clipboard.writeText(url).then(() => { setDone(true); setTimeout(() => setDone(false), 2000); })}
    >
      {done ? "نُسخ الرابط" : "انسخ رابط المشاركة"}
    </button>
  );
}
