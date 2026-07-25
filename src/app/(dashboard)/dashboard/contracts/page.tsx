"use client";

import React, { useState } from "react";

interface Contract {
  id: string;
  renter: string;
  assetName: string;
  startDate: string;
  endDate: string;
  rentAmount: number;
  status: "نشط" | "منتهي" | "معلق";
}

export default function ContractsPage() {
  const [contracts] = useState<Contract[]>([
    { id: "CON-301", renter: "شركة الحلول المبتكرة المحدودة", assetName: "برج الخزامى السكني (مكتب ٤)", startDate: "2025-01-01", endDate: "2026-12-31", rentAmount: 140000, status: "نشط" },
    { id: "CON-302", renter: "مؤسسة الغذاء الصحي للتجارة", assetName: "برج الخزامى السكني (معرض أ)", startDate: "2024-06-01", endDate: "2026-05-31", rentAmount: 220000, status: "نشط" },
    { id: "CON-303", renter: "المستأجر خالد المطيري", assetName: "شقة سكنية (رقم ١٢)", startDate: "2025-03-01", endDate: "2026-02-28", rentAmount: 45000, status: "نشط" }
  ]);

  return (
    <div className="fade-in" style={{ padding: "2rem", color: "#fff", direction: "rtl", fontFamily: "Cairo, sans-serif" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "700" }}>إدارة عقود الإيجار والاستثمار (Contracts Management)</h1>
        <p style={{ opacity: 0.6, marginTop: "0.25rem" }}>تتبع وتوثيق عقود الإيجار للمستأجرين، المواعيد الحيوية للتجديد، وتنبيهات بوالص التأمين والمدفوعات</p>
      </div>

      <div style={{ background: "rgba(20, 10, 35, 0.4)", border: "1px solid rgba(133, 97, 173, 0.2)", borderRadius: "16px", padding: "1.5rem", backdropFilter: "blur(12px)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "right", fontSize: "0.9rem" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}>
              <th style={{ padding: "0.75rem" }}>رمز العقد</th>
              <th style={{ padding: "0.75rem" }}>المستأجر / الطرف الثاني</th>
              <th style={{ padding: "0.75rem" }}>الأصل المستأجر</th>
              <th style={{ padding: "0.75rem" }}>بداية العقد</th>
              <th style={{ padding: "0.75rem" }}>نهاية العقد</th>
              <th style={{ padding: "0.75rem" }}>قيمة الإيجار السنوي</th>
              <th style={{ padding: "0.75rem" }}>الحالة</th>
            </tr>
          </thead>
          <tbody>
            {contracts.map(con => (
              <tr key={con.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <td style={{ padding: "0.75rem" }}><code style={{ color: "#c4a8e0" }}>{con.id}</code></td>
                <td style={{ padding: "0.75rem" }}><strong>{con.renter}</strong></td>
                <td style={{ padding: "0.75rem" }}>{con.assetName}</td>
                <td style={{ padding: "0.75rem" }}>{con.startDate}</td>
                <td style={{ padding: "0.75rem" }}>{con.endDate}</td>
                <td style={{ padding: "0.75rem", fontWeight: "bold" }}>{con.rentAmount.toLocaleString()} ر.س</td>
                <td style={{ padding: "0.75rem" }}>
                  <span style={{ background: "rgba(16, 185, 129, 0.15)", color: "#34d399", padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.75rem", fontWeight: "bold" }}>
                    {con.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
