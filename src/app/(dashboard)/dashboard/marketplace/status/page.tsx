"use client";

import React, { useState } from "react";

interface TradeItem {
  id: string;
  assetName: string;
  totalVolume: number;
  lastPrice: number;
  dailyChange: number;
}

export default function StatusPage() {
  const [items] = useState<TradeItem[]>([
    { id: "TRD-01", assetName: "صكوك برج الخزامى السكني", totalVolume: 1250000, lastPrice: 104.5, dailyChange: 2.1 },
    { id: "TRD-02", assetName: "صكوك محفظة الإنماء الصحية", totalVolume: 820000, lastPrice: 99.8, dailyChange: -0.4 }
  ]);

  return (
    <div className="fade-in" style={{ padding: "2rem", color: "#1A1A2E", direction: "rtl", fontFamily: "Cairo, sans-serif" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "700", color: "#1A1A2E" }}>حالة سوق تداول الصكوك الوقفية (Marketplace Status)</h1>
        <p style={{ color: "#64748B", marginTop: "0.25rem" }}>استعراض حركة الأسعار، حجم التداولات اليومية، وعمليات العرض والطلب لصكوك أصولك في منصة التداول</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>
        {/* Marketplace Items Table */}
        <div style={{ background: "#ffffff", border: "1px solid #E4E7EF", borderRadius: "16px", padding: "1.5rem", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: "600", marginBottom: "1rem", color: "#8561AD" }}>📈 أسعار التداول والنشاط اليومي</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "right", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #E2E8F0", color: "#64748B" }}>
                <th style={{ padding: "0.75rem" }}>المعرف</th>
                <th style={{ padding: "0.75rem" }}>اسم صكوك الوقف</th>
                <th style={{ padding: "0.75rem" }}>حجم التداول الكلي</th>
                <th style={{ padding: "0.75rem" }}>آخر سعر إغلاق</th>
                <th style={{ padding: "0.75rem" }}>التغيير اليومي</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} style={{ borderBottom: "1px solid #E2E8F0" }}>
                  <td style={{ padding: "0.75rem" }}><code style={{ color: "#8561AD", fontWeight: "bold" }}>{item.id}</code></td>
                  <td style={{ padding: "0.75rem" }}><strong>{item.assetName}</strong></td>
                  <td style={{ padding: "0.75rem" }}>{item.totalVolume.toLocaleString()} ر.س</td>
                  <td style={{ padding: "0.75rem", fontWeight: "bold" }}>{item.lastPrice} ر.س</td>
                  <td style={{ padding: "0.75rem", color: item.dailyChange >= 0 ? "#10b981" : "#ef4444", fontWeight: "bold" }}>
                    {item.dailyChange >= 0 ? "+" : ""}{item.dailyChange}٪
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sidebar Info */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          <div style={{ background: "#ffffff", border: "1px solid #E4E7EF", borderRadius: "16px", padding: "1.5rem", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "1rem", color: "#8561AD" }}>💡 سيولة الصكوك</h3>
            <div style={{ fontSize: "0.85rem", color: "#64748B", lineHeight: "1.6" }}>
              يمكن للمستثمرين بيع وشراء حصص الملكية بسهولة، ويتم تسجيل جميع التحويلات وصكوك الملكية آلياً بمساعدة تقنيات العقود الذكية لضمان سلامة وموثوقية المعاملات.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
