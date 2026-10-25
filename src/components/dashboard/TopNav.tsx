"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { markNotificationRead, markAllNotificationsRead } from "@/app/actions";
import styles from "@/app/(dashboard)/layout.module.css";

type Notif = { refKey: string; icon: string; text: string; href: string; date?: string | null; read: boolean };

export default function TopNav({
  userProfile,
  notifications = [],
}: {
  userProfile: any;
  openTasks?: number;
  recentEvents?: any[];
  notifications?: Notif[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const initial = userProfile?.full_name ? userProfile.full_name.charAt(0) : "م";
  const roleLabels: Record<string, string> = { admin: "مدير الوقف", supervisor: "مشرف", auditor: "مراقب مالي", viewer: "قارئ فقط" };
  const roleLabel = roleLabels[userProfile?.role] || "مستخدم";
  const unread = notifications.filter((n) => !n.read);
  const notifCount = unread.length;

  async function openNotification(n: Notif) {
    if (!n.read) await markNotificationRead(n.refKey);
    setNotifOpen(false);
    router.push(n.href);
    router.refresh();
  }

  async function markAll() {
    await markAllNotificationsRead(unread.map((n) => n.refKey));
    router.refresh();
  }

  return (
    <header className={styles.topNav}>
      <div className={styles.breadcrumb}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="14" height="14">
          <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
          <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
        </svg>
        <span>لوحة التحكم</span>
      </div>
      <div className={styles.topActions}>
        <div ref={notifRef} style={{ position: "relative" }}>
          <button className={styles.notifBtn} title="الإشعارات" onClick={() => setNotifOpen(!notifOpen)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="18" height="18">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
            </svg>
            {notifCount > 0 && <span className={styles.notifBadge}>{notifCount.toLocaleString("ar-SA")}</span>}
          </button>
          {notifOpen && (
            <div style={{
              position: "absolute", top: "110%", left: 0, width: "340px", background: "#fff",
              border: "1px solid #E4E7EF", borderRadius: "12px", boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
              zIndex: 1000, overflow: "hidden",
            }}>
              <div style={{ padding: "0.75rem 1rem", borderBottom: "1px solid #E4E7EF", fontWeight: 700, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>الإشعارات {notifCount > 0 && <span style={{ color: "#8561AD" }}>({notifCount.toLocaleString("ar-SA")} جديد)</span>}</span>
                {notifCount > 0 && (
                  <button onClick={markAll} style={{ background: "none", border: "none", color: "#8561AD", fontSize: "0.78rem", cursor: "pointer", fontWeight: 600 }}>
                    تعليم الكل كمقروء
                  </button>
                )}
              </div>
              <div style={{ maxHeight: "340px", overflowY: "auto" }}>
                {notifications.map((n) => (
                  <button
                    key={n.refKey}
                    onClick={() => openNotification(n)}
                    style={{
                      display: "flex", gap: "0.6rem", width: "100%", textAlign: "right", padding: "0.65rem 1rem",
                      background: n.read ? "transparent" : "#8561AD10", border: "none",
                      borderBottom: "1px solid #f5f5f5", cursor: "pointer", fontSize: "0.85rem", color: "inherit",
                      alignItems: "flex-start",
                    }}
                  >
                    <span>{n.icon}</span>
                    <span style={{ flex: 1 }}>
                      <span style={{ fontWeight: n.read ? 400 : 700 }}>{n.text}</span>
                      {n.date && <div style={{ color: "#999", fontSize: "0.72rem" }}>{new Date(n.date).toLocaleString("ar-SA")}</div>}
                    </span>
                    {!n.read && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#8561AD", marginTop: 6, flexShrink: 0 }}></span>}
                  </button>
                ))}
                {notifications.length === 0 && (
                  <div style={{ padding: "1.5rem", textAlign: "center", color: "#999" }}>لا إشعارات — كل شيء تحت السيطرة ✓</div>
                )}
              </div>
              <Link href="/dashboard/notifications" onClick={() => setNotifOpen(false)} style={{ display: "block", padding: "0.6rem 1rem", textAlign: "center", fontSize: "0.85rem", color: "#8561AD", textDecoration: "none", borderTop: "1px solid #E4E7EF", fontWeight: 600 }}>
                فتح مركز الإشعارات ←
              </Link>
            </div>
          )}
        </div>
        <Link href="/dashboard/profile" className={styles.avatar} style={{ textDecoration: "none", color: "inherit" }} title="الملف الشخصي">
          <div className={styles.avatarInner}>{initial}</div>
          <div className={styles.avatarInfo}>
            <span className={styles.avatarName}>{userProfile?.full_name || "مستخدم"}</span>
            <span className={styles.avatarRole}>{roleLabel}</span>
          </div>
        </Link>
        <button className={styles.logoutBtn} onClick={handleSignOut} title="تسجيل الخروج" style={{ background: "transparent", border: "1px solid #ef4444", color: "#ef4444", borderRadius: "8px", padding: "6px 12px", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px", marginRight: "12px" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="14" height="14">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          خروج
        </button>
      </div>
    </header>
  );
}
