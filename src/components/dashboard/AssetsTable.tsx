"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { deleteAsset } from "@/app/actions";
import styles from "@/app/(dashboard)/dashboard/assets/assets.module.css";

const catMap: Record<string, string> = {
  real_estate: "عقاري",
  agricultural: "زراعي",
  investment: "مالي / أسهم",
  cash: "نقد",
};

export default function AssetsTable({ assets, canWrite, isAdmin }: { assets: any[]; canWrite: boolean; isAdmin: boolean }) {
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"list" | "cards">("list");
  const [qr, setQr] = useState<{ name: string; url: string } | null>(null);
  const router = useRouter();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return assets;
    return assets.filter(a =>
      a.name?.toLowerCase().includes(q) ||
      a.location?.toLowerCase().includes(q) ||
      a.id.toLowerCase().startsWith(q)
    );
  }, [assets, search]);

  async function showQr(asset: any) {
    const payload = JSON.stringify({ id: asset.id, name: asset.name, waqf: asset.waqf_id });
    const url = await QRCode.toDataURL(payload, { width: 240, margin: 1 });
    setQr({ name: asset.name, url });
  }

  async function handleDelete(asset: any) {
    if (!confirm(`حذف الأصل "${asset.name}" نهائياً؟ لا يمكن التراجع.`)) return;
    const res = await deleteAsset(asset.id);
    if (res?.error) alert("خطأ: " + res.error);
    else router.refresh();
  }

  return (
    <>
      <div className={`${styles.filters} glass-card`}>
        <div className={styles.search}>
          <span>🔍</span>
          <input
            type="text"
            placeholder="بحث برقم المعرف أو اسم الأصل أو الموقع..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className={styles.viewToggle}>
          <button className={view === "list" ? styles.active : ""} onClick={() => setView("list")}>قائمة</button>
          <button className={view === "cards" ? styles.active : ""} onClick={() => setView("cards")}>بطاقات المواقع</button>
        </div>
      </div>

      {view === "list" ? (
        <div className={`${styles.ledgerContainer} glass-card`}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>المعرف</th>
                <th>اسم الأصل / العقار</th>
                <th>التصنيف</th>
                <th>الموقع / الحساب</th>
                <th>القيمة (التقييم)</th>
                <th>الحالة</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? filtered.map((asset) => (
                <tr key={asset.id}>
                  <td><code className={styles.code}>{asset.id.split("-")[0]}...</code></td>
                  <td><div className={styles.assetName}><Link href={`/dashboard/assets/${asset.id}`} style={{ color: "inherit", textDecoration: "none" }}><strong>{asset.name}</strong></Link></div></td>
                  <td><div className={styles.typeCol}><span className={styles.typeTag}>{catMap[asset.category] || asset.category}</span></div></td>
                  <td>{asset.location || "غير متوفر"}</td>
                  <td className={styles.price}>{Number(asset.valuation).toLocaleString()} ر.س</td>
                  <td>
                    <span className={`${styles.status} ${styles[asset.status] || ''}`}>
                      {asset.status === "active" ? "نشط" : asset.status}
                    </span>
                  </td>
                  <td className={styles.tableActions}>
                    <button title="QR Code" onClick={() => showQr(asset)}>📱</button>
                    {canWrite && (
                      <Link href={`/dashboard/assets/edit/${asset.id}`} title="تعديل" style={{ textDecoration: "none" }}>✏️</Link>
                    )}
                    <Link href={`/dashboard/tasks?asset=${asset.id}`} title="سجل الصيانة" style={{ textDecoration: "none" }}>🛠️</Link>
                    {isAdmin && (
                      <button title="حذف" onClick={() => handleDelete(asset)}>🗑️</button>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    {search ? "لا نتائج مطابقة للبحث." : "لا توجد أصول مضافة بعد."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1rem" }}>
          {filtered.map((asset) => (
            <div key={asset.id} className="glass-card" style={{ padding: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                <Link href={`/dashboard/assets/${asset.id}`} style={{ color: "inherit", textDecoration: "none" }}><strong>{asset.name}</strong></Link>
                <span className={styles.typeTag}>{catMap[asset.category] || asset.category}</span>
              </div>
              <div style={{ margin: "0.5rem 0", color: "var(--text-muted)", fontSize: "0.9rem" }}>📍 {asset.location || "غير محدد"}</div>
              <div style={{ fontWeight: "bold", color: "#8561AD" }}>{Number(asset.valuation).toLocaleString()} ر.س</div>
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
                <Link href={`/dashboard/tasks?asset=${asset.id}`} className="btn-outline" style={{ fontSize: "0.8rem", padding: "0.3rem 0.7rem", textDecoration: "none" }}>الصيانة</Link>
                {canWrite && <Link href={`/dashboard/assets/edit/${asset.id}`} className="btn-outline" style={{ fontSize: "0.8rem", padding: "0.3rem 0.7rem", textDecoration: "none" }}>تعديل</Link>}
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p style={{ color: "var(--text-muted)" }}>لا توجد أصول.</p>}
        </div>
      )}

      {qr && (
        <div
          onClick={() => setQr(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
        >
          <div className="glass-card" style={{ padding: "2rem", textAlign: "center", background: "#fff" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>{qr.name}</h3>
            <img src={qr.url} alt="QR" style={{ width: 240, height: 240 }} />
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>امسح للتحقق من هوية الأصل</p>
            <button className="btn-outline" onClick={() => setQr(null)}>إغلاق</button>
          </div>
        </div>
      )}
    </>
  );
}
