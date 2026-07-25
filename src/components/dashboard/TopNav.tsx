"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import styles from "@/app/(dashboard)/layout.module.css";

export default function TopNav({ userProfile }: { userProfile: any }) {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const initial = userProfile?.full_name ? userProfile.full_name.charAt(0) : "م";

  return (
    <header className={styles.topNav}>
      <div className={styles.breadcrumb}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="14" height="14">
          <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
          <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
        </svg>
        <span>لوحة التحكم</span>
        <span className={styles.breadcrumbSep}>/</span>
        <span className={styles.breadcrumbCurrent}>نظرة عامة</span>
      </div>
      <div className={styles.topActions}>
        <button className={styles.notifBtn} title="الإشعارات">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="18" height="18">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
          </svg>
          <span className={styles.notifBadge}>٠</span>
        </button>
        <div className={styles.avatar}>
          <div className={styles.avatarInner}>{initial}</div>
          <div className={styles.avatarInfo}>
            <span className={styles.avatarName}>{userProfile?.full_name || "مستخدم"}</span>
            <span className={styles.avatarRole}>{userProfile?.role === "admin" ? "مدير الوقف" : "مستفيد"}</span>
          </div>
        </div>
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
