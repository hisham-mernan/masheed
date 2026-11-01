"use client";

import { useState } from "react";
import styles from "./home.module.css";

export type Column = { label: string; fullLabel: string; value: number };

const W = 900, H = 300, TOP = 28, BOTTOM = 30, START = 44;
const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 0 });
const compact = (n: number) => n >= 1e6 ? `${+(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${+(n / 1e3).toFixed(1)}K` : `${n}`;

// Clean axis maximum: 1, 2, 2.5 or 5 × 10ⁿ above the largest value
function niceMax(v: number) {
  if (v <= 0) return 1000;
  const p = 10 ** Math.floor(Math.log10(v));
  return ([1, 2, 2.5, 5, 10].find((m) => m * p >= v) || 10) * p;
}

// Monthly columns, one series. Hover or keyboard focus shows the month's value; the
// latest month is highlighted until then. A hidden table carries the same numbers.
export default function ColumnChart({ data, unit, caption }: { data: Column[]; unit: string; caption: string }) {
  const [active, setActive] = useState<number | null>(null);
  const n = data.length;
  const max = niceMax(Math.max(...data.map((d) => d.value)));
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * max);
  const avg = data.reduce((s, d) => s + d.value, 0) / Math.max(n, 1);
  const plotW = W - START - 8, plotH = H - TOP - BOTTOM;
  const slot = plotW / n;
  const barW = Math.min(24, slot * 0.6);
  const y = (v: number) => TOP + plotH - (v / max) * plotH;
  // RTL: the first (oldest) month sits on the right
  const x = (i: number) => START + plotW - (i + 0.5) * slot;
  const labelEvery = n > 12 ? 6 : n > 6 ? 2 : 1;
  const shown = active ?? n - 1;
  const hasData = data.some((d) => d.value > 0);

  return (
    <figure className={styles.chartFigure}>
      <div className={styles.chartWrap} onMouseLeave={() => setActive(null)}>
        <svg viewBox={`0 0 ${W} ${H}`} className={styles.chartSvg} role="img" aria-label={caption}>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={START} x2={W - 8} y1={y(t)} y2={y(t)} className={styles.grid} />
              <text x={START - 8} y={y(t)} className={styles.tick} textAnchor="end" dominantBaseline="middle">{compact(t)}</text>
            </g>
          ))}
          {hasData && (
            <g>
              <line x1={START} x2={W - 8} y1={y(avg)} y2={y(avg)} className={styles.avgLine} />
              <text x={W - 10} y={y(avg) - 6} className={styles.avgLabel} textAnchor="start">المتوسط {compact(Math.round(avg))}</text>
            </g>
          )}
          {data.map((d, i) => {
            const top = y(d.value), h = TOP + plotH - top;
            const r = Math.min(4, h, barW / 2);
            const bx = x(i) - barW / 2;
            const on = i === shown;
            return (
              <g key={i}>
                {/* Rounded data-end, square at the baseline */}
                {h > 0 && (
                  <path
                    d={`M${bx},${TOP + plotH} V${top + r} Q${bx},${top} ${bx + r},${top} H${bx + barW - r} Q${bx + barW},${top} ${bx + barW},${top + r} V${TOP + plotH} Z`}
                    className={on ? styles.barOn : styles.bar}
                  />
                )}
                {i % labelEvery === (n - 1) % labelEvery && (
                  <text x={x(i)} y={H - 10} className={on ? styles.xLabelOn : styles.xLabel} textAnchor="middle">{d.label}</text>
                )}
                {/* Hit target: the whole column slot */}
                <rect
                  x={x(i) - slot / 2} y={TOP} width={slot} height={plotH} fill="transparent"
                  tabIndex={0} role="button" aria-label={`${d.fullLabel}: ${fmt(d.value)} ${unit}`}
                  onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)} onBlur={() => setActive(null)}
                  className={styles.hit}
                />
              </g>
            );
          })}
        </svg>
        {hasData && (
          <div
            className={styles.tooltip}
            style={{
              left: `${(x(shown) / W) * 100}%`,
              top: `${(y(data[shown].value) / H) * 100}%`,
              // Near either edge, anchor the tooltip to its side so it stays inside the card
              transform: `translate(${x(shown) / W < 0.15 ? "-15%" : x(shown) / W > 0.85 ? "-85%" : "-50%"}, calc(-100% - 10px))`,
            }}
            aria-hidden="true"
          >
            <span className={styles.tooltipLabel}>{data[shown].fullLabel}</span>
            <b className={styles.num}>{fmt(data[shown].value)} <small>{unit}</small></b>
          </div>
        )}
        {!hasData && <p className={styles.chartEmpty}>لا يوجد ريع مسجّل في هذه الفترة. سجّل الإيرادات من صفحة المالية لتظهر هنا.</p>}
      </div>
      <table className={styles.srOnly}>
        <caption>{caption}</caption>
        <thead><tr><th>الشهر</th><th>المبلغ ({unit})</th></tr></thead>
        <tbody>{data.map((d, i) => <tr key={i}><td>{d.fullLabel}</td><td>{fmt(d.value)}</td></tr>)}</tbody>
      </table>
    </figure>
  );
}
