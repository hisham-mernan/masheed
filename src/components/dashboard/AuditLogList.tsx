"use client";

import { useState } from "react";
import styles from "@/app/(dashboard)/dashboard/audit/audit.module.css";

const ACTION_AR: Record<string, string> = { INSERT: "إضافة", UPDATE: "تعديل", DELETE: "حذف" };
const ENTITY_AR: Record<string, string> = {
  assets: "الأصول",
  transactions: "المعاملات المالية",
  beneficiaries: "المستفيدون",
  distributions: "التوزيعات",
  maintenance_tasks: "مهام الصيانة",
  documents: "المستندات",
};

function summarize(changes: any): { key: string; oldVal: string; newVal: string }[] {
  if (!changes) return [];
  const oldObj = changes.old || {};
  const newObj = changes.new || {};
  const keys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);
  const skip = new Set(["id", "waqf_id", "created_at", "created_by", "uploaded_by", "file_data"]);
  const rows: { key: string; oldVal: string; newVal: string }[] = [];
  keys.forEach((k) => {
    if (skip.has(k)) return;
    const o = oldObj[k] === undefined || oldObj[k] === null ? "—" : String(oldObj[k]);
    const n = newObj[k] === undefined || newObj[k] === null ? "—" : String(newObj[k]);
    if (o !== n) rows.push({ key: k, oldVal: o, newVal: n });
  });
  return rows;
}

export default function AuditLogList({ logs }: { logs: any[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  if (!logs.length) {
    return (
      <p style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
        لا توجد أحداث موثقة بعد — ستظهر هنا تلقائياً عند أي إضافة أو تعديل.
      </p>
    );
  }

  return (
    <div className={styles.logList}>
      {logs.map((log) => {
        const open = openId === log.id;
        const details = summarize(log.changes);
        return (
          <div key={log.id}>
            <div
              className={styles.logItem}
              onClick={() => setOpenId(open ? null : log.id)}
              style={{ cursor: "pointer", background: open ? "rgba(133,97,173,0.06)" : undefined }}
              title="اضغط لعرض التفاصيل"
            >
              <div className={styles.logTime}>{new Date(log.created_at).toLocaleString("ar-SA")}</div>
              <div className={styles.logUser}><strong>{log.user_name || "النظام"}</strong></div>
              <div className={styles.logAction}>
                <span>{ACTION_AR[log.action] || log.action}</span> - <em>{ENTITY_AR[log.entity_type] || log.entity_type || "—"}</em>
              </div>
              <div className={styles.logId}>#{log.id.split("-")[0]}</div>
              <div className={styles.logHash} title={log.hash}>sha256:{log.hash.slice(0, 8)}…{log.hash.slice(-4)}</div>
            </div>
            {open && (
              <div style={{ padding: "1rem 1.5rem", background: "rgba(133,97,173,0.04)", borderRadius: "0 0 8px 8px", fontSize: "0.85rem" }}>
                {details.length > 0 ? (
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ textAlign: "right", color: "var(--text-muted)" }}>
                        <th style={{ padding: "0.25rem" }}>الحقل</th>
                        <th style={{ padding: "0.25rem" }}>قبل</th>
                        <th style={{ padding: "0.25rem" }}>بعد</th>
                      </tr>
                    </thead>
                    <tbody>
                      {details.map((d) => (
                        <tr key={d.key} style={{ borderTop: "1px solid var(--border, #eee)" }}>
                          <td style={{ padding: "0.35rem", fontWeight: 600 }}>{d.key}</td>
                          <td style={{ padding: "0.35rem", color: "#DC2626", maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis" }}>{d.oldVal}</td>
                          <td style={{ padding: "0.35rem", color: "#15803D", maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis" }}>{d.newVal}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <span style={{ color: "var(--text-muted)" }}>لا توجد تفاصيل تغييرات مسجلة لهذا الحدث.</span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
