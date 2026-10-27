"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { setSelectedWaqf } from "@/app/actions";
import styles from "./Sidebar.module.css";

const platformItems = [
  {
    id: "services",
    label: "الخدمات المهنية",
    labelEn: "Services",
    path: "/dashboard/services",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
    ),
  },
  {
    id: "bookings",
    label: "حجز استشارة مرئية",
    labelEn: "Video Consultations",
    path: "/dashboard/bookings",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="6" width="14" height="12" rx="2"/><path d="M22 8l-6 4 6 4V8z"/></svg>
    ),
  },
  {
    id: "orders",
    label: "طلباتي",
    labelEn: "My Orders",
    path: "/dashboard/orders",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg>
    ),
  },
  {
    id: "billing",
    label: "الباقة والفوترة",
    labelEn: "Plan & Billing",
    path: "/dashboard/billing",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
    ),
  },
];

const adminItems = [
  {
    id: "admin",
    label: "إدارة المنصة",
    labelEn: "Platform Admin",
    path: "/dashboard/admin/requests",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z"/></svg>
    ),
  },
];

const menuItems = [
  {
    id: "dashboard",
    label: "نظرة عامة",
    labelEn: "Overview",
    path: "/dashboard",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    id: "waqfs",
    label: "كل الأوقاف",
    labelEn: "All Waqfs",
    path: "/dashboard/waqfs",
    platformOnly: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
      </svg>
    ),
  },
  {
    id: "assets",
    label: "سجل الأصول",
    labelEn: "Assets Log",
    path: "/dashboard/assets",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },

  {
    id: "tasks",
    label: "مهام الصيانة",
    labelEn: "Maintenance",
    path: "/dashboard/tasks",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
      </svg>
    ),
  },
  {
    id: "finance",
    label: "المالية والمصارف",
    labelEn: "Finance",
    path: "/dashboard/finance",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <line x1="12" y1="1" x2="12" y2="23"/>
        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
      </svg>
    ),
  },
  {
    id: "audit",
    label: "الرقابة والامتثال",
    labelEn: "Compliance",
    path: "/dashboard/compliance",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <polyline points="9 12 11 14 15 10"/>
      </svg>
    ),
  },
  {
    id: "approvals",
    label: "مركز الاعتمادات",
    labelEn: "Approvals",
    path: "/dashboard/approvals",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M9 11l3 3L22 4"/>
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
      </svg>
    ),
  },
  {
    id: "auditlog",
    label: "سجل الأحداث",
    labelEn: "Audit Log",
    path: "/dashboard/audit",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  },
  {
    id: "beneficiary",
    label: "المستفيدون والتوكينيزيشن",
    labelEn: "Beneficiaries",
    path: "/dashboard/beneficiary",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
  },
  {
    id: "analytics",
    label: "التحليلات",
    labelEn: "Analytics",
    path: "/dashboard/analytics",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
  },
  {
    id: "investments",
    label: "الاستثمارات",
    labelEn: "Investments",
    path: "/dashboard/investments",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
      </svg>
    ),
  },
  {
    id: "contracts",
    label: "العقود",
    labelEn: "Contracts",
    path: "/dashboard/contracts",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
        <polyline points="14 2 14 8 20 8"/><line x1="9" y1="15" x2="15" y2="15"/><line x1="9" y1="11" x2="13" y2="11"/>
      </svg>
    ),
  },
  {
    id: "governance",
    label: "الحوكمة والقرارات",
    labelEn: "Governance",
    path: "/dashboard/governance",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
      </svg>
    ),
  },
  {
    id: "meetings",
    label: "الاجتماعات",
    labelEn: "Meetings",
    path: "/dashboard/meetings",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
  {
    id: "waqifs",
    label: "الواقفون",
    labelEn: "Waqifs",
    path: "/dashboard/waqifs",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
  {
    id: "consultancy",
    label: "سجل الاستشارات",
    labelEn: "Consultancy",
    path: "/dashboard/consultancy",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
      </svg>
    ),
  },
  {
    id: "marketplace",
    label: "منصة الاستثمار",
    labelEn: "Marketplace",
    path: "/dashboard/marketplace",
    badge: "سوق",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 100 4h4a2 2 0 110 4H8"/><line x1="12" y1="6" x2="12" y2="18"/>
      </svg>
    ),
  },
  {
    id: "calendar",
    label: "التقويم",
    labelEn: "Calendar",
    path: "/dashboard/calendar",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><circle cx="12" cy="15" r="2"/>
      </svg>
    ),
  },
  {
    id: "workspace",
    label: "مساحة العمل",
    labelEn: "Workspace",
    path: "/dashboard/workspace",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/>
      </svg>
    ),
  },
  {
    id: "workflows",
    label: "تدفقات العمل",
    labelEn: "Workflows",
    path: "/dashboard/workflows",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="5" cy="6" r="2"/><circle cx="19" cy="6" r="2"/><circle cx="12" cy="18" r="2"/>
        <path d="M7 6h10"/><path d="M5 8v5a5 5 0 005 5h0"/><path d="M19 8v5a5 5 0 01-5 5h0"/>
      </svg>
    ),
  },
  {
    id: "settings",
    label: "الإعدادات",
    labelEn: "Settings",
    path: "/dashboard/settings",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z"/>
      </svg>
    ),
  },
  {
    id: "reports",
    label: "مركز التقارير",
    labelEn: "Reports",
    path: "/dashboard/reports",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="8" y1="17" x2="8" y2="13"/>
        <line x1="12" y1="17" x2="12" y2="9"/>
        <line x1="16" y1="17" x2="16" y2="11"/>
      </svg>
    ),
  },
  {
    id: "ocr",
    label: "الأرشفة الذكية",
    labelEn: "OCR Scanning",
    path: "/dashboard/ocr",
    badge: "جديد",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
  },
];

export default function Sidebar({ userWaqfs = [], openTasks = 0, isPlatformAdmin = false, selectedWaqf = "", hasWaqf = true }: { userWaqfs?: any[]; openTasks?: number; isPlatformAdmin?: boolean; selectedWaqf?: string; hasWaqf?: boolean }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [switching, setSwitching] = useState(false);
  const waqfList = userWaqfs.length > 0 ? userWaqfs : [{ id: 'none', name: 'لا يوجد أوقاف' }];
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""}`}>
      {/* Header */}
      <div className={styles.sidebarHeader}>
        <div className={styles.logo}>
          <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
            <path d="M16 2L30 10V22L16 30L2 22V10L16 2Z" stroke="white" strokeWidth="1.5" strokeOpacity="0.4"/>
            <path d="M16 6L26 12V20L16 26L6 20V12L16 6Z" fill="white" fillOpacity="0.1"/>
            <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="10" fontFamily="Cairo, sans-serif" fontWeight="700">م</text>
          </svg>
        </div>
        {!isCollapsed && (
          <div className={styles.logoText}>
            <span className={styles.logoPrimary}>مَشيد</span>
            <span className={styles.logoSecondary}>نظام إدارة الأوقاف</span>
          </div>
        )}
      </div>

      {/* Waqf Switcher — فعلي: يغيّر نطاق كل الصفحات */}
      {!isCollapsed && (
        <div className={styles.waqfSwitcher} title="نطاق العرض الحالي">
          <div className={styles.waqfIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="16" height="16">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <select
            className={styles.waqfSelect}
            style={{ color: "#fff", background: "transparent", border: "none", flex: 1, fontSize: "0.85rem", fontWeight: 600, cursor: "pointer", outline: "none" }}
            value={selectedWaqf}
            disabled={switching}
            onChange={async (e) => {
              setSwitching(true);
              await setSelectedWaqf(e.target.value);
              setSwitching(false);
              router.refresh();
            }}
          >
            {isPlatformAdmin && <option value="all">كل الأوقاف (All)</option>}
            {waqfList.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </div>
      )}

      {/* Search */}
      <form
        className={styles.searchBox}
        onSubmit={(e) => {
          e.preventDefault();
          if (searchQuery.trim()) router.push(`/dashboard/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
          className={styles.searchIcon} width="15" height="15">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        {!isCollapsed && (
          <input
            type="text"
            placeholder="بحث في النظام..."
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        )}
      </form>

      {/* Nav */}
      <nav className={styles.nav}>
        <div className={styles.navGroup}>
          {!isCollapsed && <span className={styles.navGroupLabel}>الرئيسية</span>}
          {menuItems.slice(0, 1).map(item => (
            <NavItem key={item.id} item={item} isCollapsed={isCollapsed} isActive={pathname === item.path} />
          ))}
        </div>
        <div className={styles.navGroup}>
          {!isCollapsed && <span className={styles.navGroupLabel}>خدمات مَشيد</span>}
          {platformItems.map(item => (
            <NavItem key={item.id} item={item} isCollapsed={isCollapsed} isActive={pathname.startsWith(item.path)} />
          ))}
        </div>
        {isPlatformAdmin && (
          <div className={styles.navGroup}>
            {!isCollapsed && <span className={styles.navGroupLabel}>إدارة المنصة</span>}
            {adminItems.map(item => (
              <NavItem key={item.id} item={item} isCollapsed={isCollapsed} isActive={pathname.startsWith("/dashboard/admin")} />
            ))}
          </div>
        )}
        {(hasWaqf || isPlatformAdmin) && <div className={styles.navGroup}>
          {!isCollapsed && <span className={styles.navGroupLabel}>الوحدات</span>}
          {menuItems.slice(1).filter(item => !(item as any).platformOnly || isPlatformAdmin).map(item => (
            <NavItem key={item.id} item={item} isCollapsed={isCollapsed} isActive={pathname === item.path} />
          ))}
        </div>}
      </nav>

      {/* Footer */}
      <div className={styles.sidebarFooter}>
        {!isCollapsed && (
          <Link href="/dashboard/tasks" className={styles.notifRow} style={{ textDecoration: "none", color: "inherit" }}>
            <div className={styles.notifDot} style={{ opacity: openTasks > 0 ? 1 : 0.3 }}></div>
            <span>{openTasks > 0 ? `${openTasks.toLocaleString("ar-SA")} ${openTasks === 1 ? "مهمة معلقة" : "مهام معلقة"}` : "لا مهام معلقة"}</span>
          </Link>
        )}
        <button
          className={styles.toggleBtn}
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "توسيع" : "طي"}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
            width="16" height="16"
            style={{ transform: isCollapsed ? 'rotate(180deg)' : 'none', transition: 'transform 300ms' }}>
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
      </div>
    </aside>
  );
}

function NavItem({
  item,
  isCollapsed,
  isActive,
}: {
  item: { label: string; labelEn?: string; path: string; icon: React.ReactNode; badge?: string };
  isCollapsed: boolean;
  isActive: boolean;
}) {
  return (
    <Link
      href={item.path}
      className={`${styles.navItem} ${isActive ? styles.active : ""}`}
      title={isCollapsed ? item.label : undefined}
    >
      <span className={styles.navIcon}>{item.icon}</span>
      {!isCollapsed && (
        <div className={styles.navLabels}>
          <span className={styles.navLabelAr}>{item.label}</span>
          <span className={styles.navLabelEn}>{item.labelEn}</span>
        </div>
      )}
      {!isCollapsed && item.badge && (
        <span className={styles.badge}>{item.badge}</span>
      )}
    </Link>
  );
}
