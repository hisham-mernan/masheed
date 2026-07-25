"use client";

import React, { useState } from "react";

interface ListingRequest {
  id: string;
  waqfName: string;
  assetName: string;
  targetFunding: number;
  pricePerShare: number;
  sharesCount: number;
  status: "Pending" | "Approved" | "Trading";
}

export default function RequestsPage() {
  const [requests] = useState<ListingRequest[]>([
    { id: "MKT-101", waqfName: "وقف برج الخزامى", assetName: "برج الخزامى السكني", targetFunding: 12000000, pricePerShare: 100, sharesCount: 120000, status: "Approved" },
    { id: "MKT-102", waqfName: "مزرعة النخيل المشتركة", assetName: "مزرعة النخيل التصديرية", targetFunding: 3500000, pricePerShare: 50, sharesCount: 70000, status: "Pending" }
  ]);

  return (
    <div className="fade-in" style={{ padding: "2rem", color: "#1A1A2E", direction: "rtl", fontFamily: "Cairo, sans-serif" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "700", color: "#1A1A2E" }}>طلبات طرح الصكوك الاستثمارية (Listing Requests)</h1>
        <p style={{ color: "#64748B", marginTop: "0.25rem" }}>تتبع واعتماد طلبات التمويل الجماعي والطرح العام الاستثماري للأصول الوقفية بالمنصة</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>
        {/* Requests Table */}
        <div style={{ background: "#ffffff", border: "1px solid #E4E7EF", borderRadius: "16px", padding: "1.5rem", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: "600", marginBottom: "1rem", color: "#8561AD" }}>📋 طلبات الطرح المقدمة</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "right", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #E2E8F0", color: "#64748B" }}>
                <th style={{ padding: "0.75rem" }}>رمز الطرح</th>
                <th style={{ padding: "0.75rem" }}>اسم الأصل والوقف</th>
                <th style={{ padding: "0.75rem" }}>المبلغ المستهدف</th>
                <th style={{ padding: "0.75rem" }}>سعر السهم وقيمته</th>
                <th style={{ padding: "0.75rem" }}>الحالة التشغيلية</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(req => (
                <tr key={req.id} style={{ borderBottom: "1px solid #E2E8F0" }}>
                  <td style={{ padding: "0.75rem" }}><code style={{ color: "#8561AD", fontWeight: "bold" }}>{req.id}</code></td>
                  <td style={{ padding: "0.75rem" }}>
                    <div><strong>{req.assetName}</strong></div>
                    <div style={{ fontSize: "0.75rem", color: "#64748B" }}>الوقف: {req.waqfName}</div>
                  </td>
                  <td style={{ padding: "0.75rem", fontWeight: "bold" }}>{req.targetFunding.toLocaleString()} ر.س</td>
                  <td style={{ padding: "0.75rem" }}>
                    <div>{req.sharesCount.toLocaleString()} سهم</div>
                    <div style={{ fontSize: "0.75rem", color: "#64748B" }}>سعر السهم: {req.pricePerShare} ر.س</div>
                  </td>
                  <td style={{ padding: "0.75rem" }}>
                    <span style={{
                      background: req.status === "Approved" ? "rgba(16, 185, 129, 0.1)" : "rgba(251, 191, 36, 0.1)",
                      color: req.status === "Approved" ? "#10b981" : "#f59e0b",
                      padding: "0.2rem 0.5rem",
                      borderRadius: "4px",
                      fontSize: "0.75rem",
                      fontWeight: "bold"
                    }}>
                      {req.status === "Approved" ? "تم قبول مستندات الطرح" : "تحت تدقيق اللجان"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sidebar Info */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          <div style={{ background: "#ffffff", border: "1px solid #E4E7EF", borderRadius: "16px", padding: "1.5rem", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "1rem", color: "#8561AD" }}>💡 عملية الطرح الاستثماري</h3>
            <div style={{ fontSize: "0.85rem", color: "#64748B", lineHeight: "1.6" }}>
              بعد موافقة لجان التدقيق بالمنصة، يتم إدراج الأصل تلقائياً في بوابة سوق أوقاف مشيد الإلكترونية ليتمكن المستثمرون من شراء صكوك الملكية وبدء الاكتتاب.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
