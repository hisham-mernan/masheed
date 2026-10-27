"use client";

import Link from "next/link";
import { useState } from "react";
import { fmt } from "@/lib/listings";

// The design derived the rate from averages of its sample listings; with real listings only,
// the visitor enters the expected return shown on the opportunity they are looking at.
export default function Calculator() {
  const [amt, setAmt] = useState(50000);
  const [rate, setRate] = useState(8);
  const [dur, setDur] = useState(36);
  const yearly = (amt * rate) / 100;
  const total = (yearly * dur) / 12;
  return (
    <div className="wq-calc">
      <div className="wq-calc__in">
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <span className="wb-eyebrow">حاسبة العائد</span>
          <h2 className="wb-h2">احسب عائدك المتوقع.</h2>
          <p className="wb-p">أدخل المبلغ والعائد السنوي المتوقع المذكور في صفحة الفرصة لتقدير عائدك خلال المدة.</p>
        </div>
        <div className="wb-field">
          <div className="wq-range__val"><span className="wb-label" id="wq-amt">مبلغ الاستثمار</span><b><span className="wb-num">{fmt(amt)}</span> <small>ر.س</small></b></div>
          <input className="wq-range" type="range" min={5000} max={500000} step={5000} value={amt} onChange={(e) => setAmt(+e.target.value)} aria-labelledby="wq-amt" />
        </div>
        <div className="wb-field">
          <div className="wq-range__val"><span className="wb-label" id="wq-rate">العائد السنوي المتوقع</span><b><span className="wb-num">{rate}%</span></b></div>
          <input className="wq-range" type="range" min={1} max={15} step={0.5} value={rate} onChange={(e) => setRate(+e.target.value)} aria-labelledby="wq-rate" />
        </div>
        <div className="wb-field">
          <label className="wb-label" htmlFor="wq-dur">المدة</label>
          <select id="wq-dur" className="wb-input" value={dur} onChange={(e) => setDur(+e.target.value)}>
            {[12, 24, 36, 48, 60].map((m) => <option key={m} value={m}>{m} شهراً</option>)}
          </select>
        </div>
      </div>
      <div className="wq-calc__out">
        <span>العائد التقديري خلال المدة</span>
        <div className="wq-calc__big"><span className="wb-num">{fmt(total)}</span> <em>ر.س</em></div>
        <div className="wq-calc__rows">
          <div><span>العائد السنوي المتوقع</span><b className="wb-num">{rate}%</b></div>
          <div><span>العائد السنوي التقديري</span><b><span className="wb-num">{fmt(yearly)}</span> ر.س</b></div>
          <div><span>المدة</span><b><span className="wb-num">{dur}</span> شهراً</b></div>
        </div>
        <Link className="wb-btn wb-btn--light wb-btn--lg" href="/opportunities">تصفّح الفرص</Link>
        <p className="wq-calc__note">تقدير توضيحي فقط؛ العائد غير مضمون وقد يختلف عن التقدير.</p>
      </div>
    </div>
  );
}
