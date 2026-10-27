import Link from "next/link";
import { s } from "./ui";

const TABS: [string, string, string][] = [
  ["requests", "/dashboard/admin/requests", "طلبات الخدمات"],
  ["bookings", "/dashboard/admin/bookings", "الحجوزات"],
  ["listings", "/dashboard/marketplace", "طلبات الإدراج"],
  ["accounts", "/dashboard/admin/accounts", "الحسابات والباقات"],
];

export default function AdminTabs({ active }: { active: string }) {
  return (
    <nav className={s.days} style={{ marginBottom: "1rem" }} aria-label="إدارة المنصة">
      {TABS.map(([k, href, label]) => (
        <Link key={k} href={href} className={s.day} aria-current={k === active ? "page" : undefined} aria-pressed={k === active} style={{ textDecoration: "none", color: "inherit" }}><b>{label}</b></Link>
      ))}
    </nav>
  );
}
