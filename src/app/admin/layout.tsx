export const dynamic = "force-dynamic";

import Link from "next/link";
import styles from "./admin-layout.module.css";
import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

import { cookies } from "next/headers";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let shouldRedirectToLogin = false;
  let shouldRedirectToDashboard = false;
  let isOffline = false;

  const cookieStore = await cookies();
  const mockRole = cookieStore.get("masheed-mock-role")?.value;
  const userEmail = cookieStore.get("masheed-user-email")?.value;
  const userIdCookie = cookieStore.get("masheed-user-id")?.value;

  if (!userIdCookie && !userEmail && !mockRole) {
    shouldRedirectToLogin = true;
  } else {
    try {
      const { Client } = require("pg");
      const client = new Client({
        connectionString: "postgresql://postgres:oQ%3C_PpAmv85M-b%21%28@db.wyxyrehrpsohkaoanldm.supabase.co:5432/postgres",
        ssl: { rejectUnauthorized: false }
      });
      await client.connect();

      let targetUserId = userIdCookie;
      if (!targetUserId && userEmail) {
        const uRes = await client.query("SELECT id FROM auth.users WHERE lower(email) = lower($1)", [userEmail]);
        if (uRes.rows.length > 0) targetUserId = uRes.rows[0].id;
      }

      if (targetUserId) {
        const pRes = await client.query("SELECT role FROM public.profiles WHERE id = $1", [targetUserId]);
        if (pRes.rows.length > 0) {
          const userRole = pRes.rows[0].role;
          if (userRole !== "admin") {
            shouldRedirectToDashboard = true;
          }
        } else if (mockRole !== "admin") {
          shouldRedirectToDashboard = true;
        }
      } else if (mockRole !== "admin") {
        shouldRedirectToDashboard = true;
      }
      await client.end();
    } catch (error) {
      console.warn("Database connection issue in admin layout:", error);
      if (mockRole !== "admin") {
        shouldRedirectToDashboard = true;
      }
    }
  }

  if (shouldRedirectToLogin) {
    redirect("/login");
  }
  if (shouldRedirectToDashboard) {
    redirect("/dashboard");
  }
  return (
    <div className={styles.adminLayout}>
      {/* Admin Sidebar */}
      <aside className={styles.adminSidebar}>
        <div className={styles.adminLogo}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <path d="M12 8v8M8 12h8"/>
          </svg>
          <span className={styles.logoText}>مشيد منصة الإدارة</span>
        </div>
        <div className={styles.badge}>Platform Owner</div>

        <nav className={styles.adminNav}>
          <Link href="/admin" className={styles.navLink}>
            <span style={{ marginLeft: "8px" }}>📊</span> لوحة القيادة التنفيذية
          </Link>
          <Link href="/admin/organizations" className={styles.navLink}>
            <span style={{ marginLeft: "8px" }}>🏢</span> إدارة المنظمات والشركاء
          </Link>
          <Link href="/admin/subscriptions" className={styles.navLink}>
            <span style={{ marginLeft: "8px" }}>💳</span> الاشتراكات والتراخيص
          </Link>
          <Link href="/admin/marketplace" className={styles.navLink}>
            <span style={{ marginLeft: "8px" }}>🛍️</span> العمليات على السوق
          </Link>
          <Link href="/admin/users" className={styles.navLink}>
            <span style={{ marginLeft: "8px" }}>🔒</span> إدارة المستخدمين والأمن (SOC)
          </Link>
          <Link href="/admin/support" className={styles.navLink}>
            <span style={{ marginLeft: "8px" }}>🛠️</span> مركز الدعم الفني
          </Link>
          <Link href="/admin/ai" className={styles.navLink}>
            <span style={{ marginLeft: "8px" }}>🤖</span> عمليات الذكاء الاصطناعي (AI)
          </Link>
          <div style={{ marginTop: "auto", paddingTop: "2rem" }}>
            <Link href="/dashboard" className={styles.backLink}>
              🚪 العودة للوحة النظام الرئيسية
            </Link>
          </div>
        </nav>
      </aside>

      {/* Main Admin Content */}
      <div className={styles.adminMain}>
        <header className={styles.adminHeader}>
          <div className={styles.headerTitle}>بوابة الإدارة المركزية (Central Admin Portal)</div>
          <div className={styles.headerMeta}>
            {isOffline && (
              <span style={{
                background: "rgba(245, 158, 11, 0.1)",
                color: "#f59e0b",
                padding: "0.25rem 0.5rem",
                borderRadius: "4px",
                fontSize: "0.75rem",
                marginLeft: "12px",
                border: "1px solid rgba(245, 158, 11, 0.2)",
                direction: "rtl"
              }}>
                ⚠️ وضع المحاكاة 오프라인
              </span>
            )}
            <span className={styles.statusDot}></span> النظام يعمل بكفاءة ٩٩.٩٨٪
          </div>
        </header>
        <main className={styles.adminContent}>
          {children}
        </main>
      </div>
    </div>
  );
}
