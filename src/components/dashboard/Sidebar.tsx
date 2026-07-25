"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Sidebar.module.css";

interface SubItem {
  label: string;
  labelEn: string;
  path: string;
}

interface MenuItem {
  id: string;
  label: string;
  labelEn: string;
  path?: string;
  icon: React.ReactNode;
  badge?: string;
  subItems?: SubItem[];
}

const menuGroups = [
  {
    title: "الرئيسية",
    titleEn: "Home",
    items: [
      {
        id: "dashboard",
        label: "لوحة التحكم",
        labelEn: "Dashboard",
        path: "/dashboard",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
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
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
        ),
      },
      {
        id: "tasks",
        label: "مهامي",
        labelEn: "My Tasks",
        path: "/dashboard/tasks",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="9 11 12 14 22 4"/>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
          </svg>
        ),
      },
    ] as MenuItem[]
  },
  {
    title: "الوقف",
    titleEn: "Waqf",
    items: [
      {
        id: "waqf_mgnt",
        label: "إدارة الوقف",
        labelEn: "Waqf Management",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        ),
        subItems: [
          { label: "الأوقاف", labelEn: "Waqfs", path: "/dashboard/waqfs" },
          { label: "الواقفين", labelEn: "Waqifs", path: "/dashboard/waqifs" },
          { label: "المستفيدين", labelEn: "Beneficiaries", path: "/dashboard/beneficiary" },
          { label: "الحوكمة", labelEn: "Governance", path: "/dashboard/governance" },
          { label: "الامتثال", labelEn: "Compliance", path: "/dashboard/compliance" },
        ]
      }
    ] as MenuItem[]
  },
  {
    title: "الأصول",
    titleEn: "Assets",
    items: [
      {
        id: "assets_mgnt",
        label: "إدارة الأصول",
        labelEn: "Assets",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        ),
        subItems: [
          { label: "العقارات والأصول", labelEn: "Properties", path: "/dashboard/assets" },
          { label: "الاستثمارات", labelEn: "Investments", path: "/dashboard/investments" },
          { label: "الصيانة دورية", labelEn: "Maintenance", path: "/dashboard/maintenance" },
          { label: "العقود", labelEn: "Contracts", path: "/dashboard/contracts" },
        ]
      }
    ] as MenuItem[]
  },
  {
    title: "المالية",
    titleEn: "Finance",
    items: [
      {
        id: "finance_mgnt",
        label: "الإدارة المالية",
        labelEn: "Finance",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="12" y1="1" x2="12" y2="23"/>
            <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
          </svg>
        ),
        subItems: [
          { label: "المحاسبة العامة", labelEn: "Accounting", path: "/dashboard/finance" },
          { label: "الإيرادات", labelEn: "Revenues", path: "/dashboard/finance/revenues" },
          { label: "المصروفات", labelEn: "Expenses", path: "/dashboard/finance/expenses" },
          { label: "الميزانيات", labelEn: "Budgets", path: "/dashboard/finance/budgets" },
          { label: "التوزيعات", labelEn: "Distributions", path: "/dashboard/finance/distributions" },
        ]
      }
    ] as MenuItem[]
  },
  {
    title: "العمليات",
    titleEn: "Operations",
    items: [
      {
        id: "ops_mgnt",
        label: "العمليات والتشغيل",
        labelEn: "Operations",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        ),
        subItems: [
          { label: "التقويم", labelEn: "Calendar", path: "/dashboard/calendar" },
          { label: "الوثائق والأرشفة", labelEn: "Documents", path: "/dashboard/ocr" },
          { label: "الاجتماعات", labelEn: "Meetings", path: "/dashboard/meetings" },
          { label: "سير العمل", labelEn: "Workflows", path: "/dashboard/workflows" },
        ]
      }
    ] as MenuItem[]
  },
  {
    title: "الاستشارات",
    titleEn: "Consultancy",
    items: [
      {
        id: "consultancy_mgnt",
        label: "خدمات الاستشارات",
        labelEn: "Consultancy",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        ),
        subItems: [
          { label: "الخبراء", labelEn: "Experts", path: "/dashboard/consultancy/experts" },
          { label: "طلبات الاستشارة", labelEn: "Requests", path: "/dashboard/consultancy/requests" },
          { label: "المساعد الذكي AI", labelEn: "AI Assistant", path: "/dashboard/consultancy/ai" },
        ]
      }
    ] as MenuItem[]
  },
  {
    title: "سوق الاستثمار",
    titleEn: "Marketplace",
    items: [
      {
        id: "marketplace_mgnt",
        label: "سوق أوقاف مشيد",
        labelEn: "Marketplace",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
        ),
        subItems: [
          { label: "جاهزية الطرح", labelEn: "Listing Readiness", path: "/dashboard/marketplace/readiness" },
          { label: "طلبات الطرح", labelEn: "Listing Requests", path: "/dashboard/marketplace/requests" },
          { label: "حالة السوق", labelEn: "Marketplace Status", path: "/dashboard/marketplace/status" },
        ]
      }
    ] as MenuItem[]
  },
  {
    title: "النظام",
    titleEn: "System",
    items: [
      {
        id: "reports",
        label: "التقارير",
        labelEn: "Reports",
        path: "/dashboard/reports",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
        ),
      },
      {
        id: "analytics",
        label: "التحليلات البيانية",
        labelEn: "Analytics",
        path: "/dashboard/analytics",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
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
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        ),
      },
    ] as MenuItem[]
  }
];

export default function Sidebar({ userWaqfs = [], userRole }: { userWaqfs?: any[], userRole?: string }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const waqfList = userWaqfs.length > 0 ? userWaqfs : [{ id: 'none', name: 'لا يوجد أوقاف' }];
  const [currentWaqf, setCurrentWaqf] = useState(waqfList[0]?.id);
  const pathname = usePathname();
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    waqf_mgnt: true,
    assets_mgnt: false,
    finance_mgnt: false,
    ops_mgnt: false,
    consultancy_mgnt: false,
    marketplace_mgnt: false
  });

  const toggleExpand = (menuId: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

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

      {/* Waqf Switcher */}
      {!isCollapsed && (
        <div className={styles.waqfSwitcher}>
          <div className={styles.waqfIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="16" height="16">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <select
            className={styles.waqfSelect}
            value={currentWaqf}
            onChange={(e) => setCurrentWaqf(e.target.value)}
          >
            {waqfList.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" style={{ flexShrink: 0, opacity: 0.5 }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      )}

      {/* Nav */}
      <nav className={styles.nav} style={{ direction: "rtl" }}>
        {menuGroups.map((group) => (
          <div key={group.title} className={styles.navGroup} style={{ marginBottom: "0.75rem" }}>
            {!isCollapsed && <span className={styles.navGroupLabel} style={{ textAlign: "right", display: "block" }}>{group.title}</span>}
            {group.items.map((item) => {
              const hasSubItems = item.subItems && item.subItems.length > 0;
              const isExpanded = expandedMenus[item.id];
              const isPathActive = item.path ? pathname === item.path : false;
              const isSubActive = hasSubItems && item.subItems?.some(sub => pathname === sub.path);

              return (
                <div key={item.id} style={{ display: "flex", flexDirection: "column" }}>
                  {item.path ? (
                    <Link
                      href={item.path}
                      className={`${styles.navItem} ${isPathActive ? styles.active : ""}`}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <span className={styles.navIcon}>{item.icon}</span>
                      {!isCollapsed && (
                        <div className={styles.navLabels} style={{ textAlign: "right" }}>
                          <span className={styles.navLabelAr}>{item.label}</span>
                          <span className={styles.navLabelEn}>{item.labelEn}</span>
                        </div>
                      )}
                    </Link>
                  ) : (
                    <div>
                      <div
                        onClick={() => !isCollapsed && toggleExpand(item.id)}
                        className={`${styles.navItem} ${isSubActive ? styles.active : ""}`}
                        title={isCollapsed ? item.label : undefined}
                        style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <span className={styles.navIcon}>{item.icon}</span>
                          {!isCollapsed && (
                            <div className={styles.navLabels} style={{ textAlign: "right" }}>
                              <span className={styles.navLabelAr}>{item.label}</span>
                              <span className={styles.navLabelEn}>{item.labelEn}</span>
                            </div>
                          )}
                        </div>
                        {!isCollapsed && hasSubItems && (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12" style={{ transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform 200ms" }}>
                            <polyline points="6 9 12 15 18 9"/>
                          </svg>
                        )}
                      </div>
                      
                      {!isCollapsed && hasSubItems && isExpanded && (
                        <div style={{ paddingRight: "2.5rem", marginTop: "0.2rem", display: "flex", flexDirection: "column", gap: "0.2rem", borderRight: "1px solid rgba(133,97,173,0.15)", marginRight: "1rem" }}>
                          {item.subItems?.map((sub) => {
                            const isSubItemActive = pathname === sub.path;
                            return (
                              <Link
                                key={sub.path}
                                href={sub.path}
                                style={{
                                  fontSize: "0.8rem",
                                  padding: "0.4rem 0.5rem",
                                  color: isSubItemActive ? "#C4A8E0" : "rgba(255,255,255,0.5)",
                                  textDecoration: "none",
                                  fontWeight: isSubItemActive ? "600" : "normal",
                                  fontFamily: "Cairo, sans-serif",
                                  transition: "color 200ms"
                                }}
                              >
                                {sub.label}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
        {userRole === 'admin' && (
          <div style={{ padding: isCollapsed ? "0.25rem" : "0.5rem 1rem", marginTop: "0.5rem" }}>
            <Link
              href="/admin"
              className={styles.navItem}
              style={{
                background: "rgba(133, 97, 173, 0.12)",
                border: "1px dashed rgba(133, 97, 173, 0.3)",
                borderRadius: "8px",
                color: "#c4a8e0",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: isCollapsed ? "0.5rem" : "0.75rem 1rem",
                textDecoration: "none",
                justifyContent: isCollapsed ? "center" : "flex-start",
                transition: "all 0.2s"
              }}
              title={isCollapsed ? "بوابة الإشراف" : undefined}
            >
              <span className={styles.navIcon} style={{ fontSize: "1.1rem" }}>👑</span>
              {!isCollapsed && (
                <div style={{ textAlign: "right" }}>
                  <span style={{ display: "block", fontSize: "0.85rem", fontWeight: "600" }}>بوابة الإشراف العام</span>
                  <span style={{ display: "block", fontSize: "0.7rem", opacity: 0.6 }}>Platform Admin Portal</span>
                </div>
              )}
            </Link>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className={styles.sidebarFooter}>
        {!isCollapsed && (
          <div className={styles.notifRow}>
            <div className={styles.notifDot}></div>
            <span>٣ طلبات معلقة</span>
          </div>
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
