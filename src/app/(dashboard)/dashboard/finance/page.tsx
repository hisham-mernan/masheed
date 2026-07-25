"use client";

import React, { useState } from "react";
import Link from "next/link";

interface Transaction {
  id: string;
  type: "income" | "expense" | "distribution";
  typeAr: string;
  amount: number;
  waqfName: string;
  assetName: string;
  costCenter: string;
  fundingSource: string;
  description: string;
  date: string;
}

interface BeneficiaryShare {
  name: string;
  sharesOwned: number;
  walletBalance: number;
}

export default function FinancePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: "TX-901", type: "income", typeAr: "إيراد (Ri'a)", amount: 750000, waqfName: "وقف برج الخزامى", assetName: "برج الخزامى السكني", costCenter: "الإيجارات العامة", fundingSource: "عوائد إيجارية", description: "دفعة الإيجارات السنوية للمحلات والمكاتب", date: "2026-07-01" },
    { id: "TX-902", type: "expense", typeAr: "مصروف صيانة", amount: 150000, waqfName: "وقف برج الخزامى", assetName: "برج الخزامى السكني", costCenter: "صيانة وتشغيل", fundingSource: "الريع المحتجز", description: "أعمال تجديد وصيانة المصاعد الكهربائية", date: "2026-07-03" },
    { id: "TX-903", type: "distribution", typeAr: "توزيع للمستفيدين", amount: 300000, waqfName: "وقف العائلة المرموز", assetName: "محفظة صكوك بنك الإنماء", costCenter: "حساب المستفيدين", fundingSource: "توزيعات الصكوك", description: "توزيع ريع الأرباح الدورية للربع الثاني", date: "2026-07-05" }
  ]);

  const [distributionAmount, setDistributionAmount] = useState(100000);
  const [selectedWaqf, setSelectedWaqf] = useState("خزامي");
  const [calculatedPayouts, setCalculatedPayouts] = useState<any[]>([]);

  const beneficiaries: Record<string, BeneficiaryShare[]> = {
    خزامي: [
      { name: "جمعية رعاية الأيتام بالرياض", sharesOwned: 60, walletBalance: 125000 },
      { name: "مركز الأبحاث الطبية والخيرية", sharesOwned: 40, walletBalance: 82000 }
    ],
    عائلة: [
      { name: "ابن الواقف الأول (أحمد)", sharesOwned: 50, walletBalance: 31000 },
      { name: "ابنة الواقف الثانية (سارة)", sharesOwned: 30, walletBalance: 18500 },
      { name: "ابن الواقف الثالث (خالد)", sharesOwned: 20, walletBalance: 12200 }
    ]
  };

  const handleCalculateDistribution = (e: React.FormEvent) => {
    e.preventDefault();
    const targetBeneficiaries = selectedWaqf === "خزامي" ? beneficiaries.خزامي : beneficiaries.عائلة;
    const totalShares = targetBeneficiaries.reduce((sum, b) => sum + b.sharesOwned, 0);

    const payouts = targetBeneficiaries.map(b => {
      const payoutAmount = (b.sharesOwned / totalShares) * distributionAmount;
      return {
        name: b.name,
        sharesOwned: b.sharesOwned,
        payout: payoutAmount,
        newBalance: b.walletBalance + payoutAmount
      };
    });

    setCalculatedPayouts(payouts);
  };

  const handleConfirmDistribution = () => {
    if (calculatedPayouts.length === 0) return;
    
    // Add transaction
    const newTx: Transaction = {
      id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      type: "distribution",
      typeAr: "توزيع ريع",
      amount: distributionAmount,
      waqfName: selectedWaqf === "خزامي" ? "وقف برج الخزامى" : "وقف العائلة المرموز",
      assetName: selectedWaqf === "خزامي" ? "برج الخزامى السكني" : "محفظة صكوك بنك الإنماء",
      costCenter: "حساب المستفيدين",
      fundingSource: "عائد ريع الأصول",
      description: `توزيع غلة الوقف المعتمد بقيمة ${distributionAmount.toLocaleString()} ر.س`,
      date: new Date().toISOString().split("T")[0]
    };

    setTransactions(prev => [newTx, ...prev]);
    setCalculatedPayouts([]);
    alert("تم اعتماد التوزيع المالي بنجاح وقيد المبالغ في محافظ المستفيدين الرقمية.");
  };

  return (
    <div className="fade-in" style={{ padding: "2rem", color: "#1A1A2E", direction: "rtl", fontFamily: "Cairo, sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: "700", color: "#1A1A2E" }}>الإدارة المالية والتوزيعات (Finance Ledger)</h1>
          <p style={{ color: "#64748B", marginTop: "0.25rem" }}>تتبع الحسابات العامة، الأبعاد المالية، وقيد الإيرادات والمصروفات وصرف الريع للمستفيدين</p>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button onClick={() => alert("تصدير الدفاتر المالية")} style={{ background: "#ffffff", border: "1px solid #E4E7EF", padding: "0.6rem 1.2rem", borderRadius: "8px", color: "#8561AD", cursor: "pointer", fontSize: "0.9rem", fontWeight: "bold", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>تصدير الدفاتر 📥</button>
          <Link href="/dashboard/finance/add" style={{ textDecoration: 'none', background: "#8561AD", color: "#fff", padding: "0.6rem 1.2rem", borderRadius: "8px", fontWeight: "600", fontSize: "0.9rem", boxShadow: "0 4px 12px rgba(133, 97, 173, 0.2)" }}>تسجيل عملية مالية +</Link>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1.2fr", gap: "2rem" }}>
        {/* General Ledger Table with Dimensions */}
        <div style={{ background: "#ffffff", border: "1px solid #E4E7EF", borderRadius: "16px", padding: "1.5rem", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: "600", marginBottom: "1rem", color: "#8561AD" }}> دفتر الأستاذ متعدد الأبعاد (Multi-Dimensional Ledger)</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "right", fontSize: "0.85rem" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #E2E8F0", color: "#64748B" }}>
                <th style={{ padding: "0.75rem" }}>الرمز</th>
                <th style={{ padding: "0.75rem" }}>النوع</th>
                <th style={{ padding: "0.75rem" }}>المبلغ</th>
                <th style={{ padding: "0.75rem" }}>الوقف والأصل</th>
                <th style={{ padding: "0.75rem" }}>مركز التكلفة ومصدر التمويل</th>
                <th style={{ padding: "0.75rem" }}>الوصف والتاريخ</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(t => (
                <tr key={t.id} style={{ borderBottom: "1px solid #E2E8F0", transition: "background 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = "#F8FAFC"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "0.75rem" }}><code style={{ color: "#8561AD", fontWeight: "bold" }}>{t.id}</code></td>
                  <td style={{ padding: "0.75rem" }}>
                    <span style={{
                      background: t.type === "income" ? "rgba(16, 185, 129, 0.1)" : t.type === "expense" ? "rgba(239, 68, 68, 0.1)" : "rgba(59, 130, 246, 0.1)",
                      color: t.type === "income" ? "#10b981" : t.type === "expense" ? "#ef4444" : "#3b82f6",
                      padding: "0.2rem 0.5rem",
                      borderRadius: "4px",
                      fontSize: "0.75rem",
                      fontWeight: "bold"
                    }}>
                      {t.typeAr}
                    </span>
                  </td>
                  <td style={{ padding: "0.75rem", fontWeight: "bold", fontSize: "0.95rem", color: t.type === "income" ? "#10b981" : "#ef4444" }}>
                    {t.type === "income" ? "+" : "-"}{t.amount.toLocaleString()} ر.س
                  </td>
                  <td style={{ padding: "0.75rem", color: "#1A1A2E" }}>
                    <div><strong>{t.waqfName}</strong></div>
                    <div style={{ fontSize: "0.75rem", color: "#64748B" }}>{t.assetName}</div>
                  </td>
                  <td style={{ padding: "0.75rem", color: "#1A1A2E" }}>
                    <div>مركز: {t.costCenter}</div>
                    <div style={{ fontSize: "0.75rem", color: "#64748B" }}>مصدر: {t.fundingSource}</div>
                  </td>
                  <td style={{ padding: "0.75rem", color: "#1A1A2E" }}>
                    <div>{t.description}</div>
                    <div style={{ fontSize: "0.75rem", color: "#64748B" }}>{t.date}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Yield Distribution proposal section */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          <div style={{ background: "#ffffff", border: "1px solid #E4E7EF", borderRadius: "16px", padding: "1.5rem", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "0.5rem", color: "#8561AD" }}>💰 مقترح توزيع الريع الدوري (Yield Payout Calculator)</h3>
            <p style={{ fontSize: "0.75rem", color: "#64748B", marginBottom: "1.5rem" }}>حساب مبالغ التوزيع آلياً بناءً على عدد الأسهم وحصص الملكية للمستفيدين المسجلين</p>
            
            <form onSubmit={handleCalculateDistribution} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", color: "#1A1A2E", marginBottom: "0.25rem", fontWeight: "bold" }}>الوقف المستهدف:</label>
                <select value={selectedWaqf} onChange={(e) => setSelectedWaqf(e.target.value)} style={{ width: "100%", padding: "0.6rem", background: "#F8FAFC", color: "#1A1A2E", border: "1px solid #E2E8F0", borderRadius: "6px", fontSize: "0.85rem" }}>
                  <option value="خزامي">وقف برج الخزامى الخيري</option>
                  <option value="عائلة">وقف العائلة المرموز (الأهلي)</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", color: "#1A1A2E", marginBottom: "0.25rem", fontWeight: "bold" }}>المبلغ الإجمالي للتوزيع (ر.س):</label>
                <input
                  type="number"
                  value={distributionAmount}
                  onChange={(e) => setDistributionAmount(Number(e.target.value))}
                  style={{ width: "100%", padding: "0.6rem", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "6px", color: "#1A1A2E", fontSize: "0.85rem" }}
                />
              </div>

              <button type="submit" style={{ width: "100%", padding: "0.7rem", background: "#8561AD", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", boxShadow: "0 4px 12px rgba(133, 97, 173, 0.2)" }}>
                احتساب حصص التوزيع
              </button>
            </form>

            {calculatedPayouts.length > 0 && (
              <div style={{ marginTop: "1.5rem" }}>
                <h4 style={{ fontSize: "0.9rem", color: "#8561AD", marginBottom: "0.75rem", fontWeight: "bold" }}>الحصص المحتسبة للمستفيدين:</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.8rem", background: "#F8FAFC", padding: "0.75rem", borderRadius: "8px", border: "1px solid #E2E8F0", color: "#1A1A2E" }}>
                  {calculatedPayouts.map((p, idx) => (
                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "0.25rem 0", borderBottom: idx < calculatedPayouts.length - 1 ? "1px dashed #E2E8F0" : "none" }}>
                      <span>{p.name} ({p.sharesOwned}%)</span>
                      <strong>{p.payout.toLocaleString(undefined, { maximumFractionDigits: 2 })} ر.س</strong>
                    </div>
                  ))}
                </div>
                <button onClick={handleConfirmDistribution} style={{ width: "100%", padding: "0.7rem", background: "#10b981", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", marginTop: "1rem", boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)" }}>
                  اعتماد وصرف المبالغ الموزعة ✔️
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
