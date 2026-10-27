"use client";

import { useEffect, useRef, useState } from "react";
import { SystemScreen } from "../landing/ProductScreens";

// Hero preview: the 1440×900 dashboard screen scaled to the frame's width
// (the design embeds the live kit at the same size).
export function FitScreen({ label }: { label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.7);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setScale(el.clientWidth / 1440));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div className="wb-shot__frame" ref={ref} role="img" aria-label={label}>
      <SystemScreen view="dashboard" style={{ transform: `scale(${scale})` }} />
    </div>
  );
}
