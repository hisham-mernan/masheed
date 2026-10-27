import Link from "next/link";
import type { Access } from "@/lib/access";
import { s } from "./ui";

// Trial countdown / expiry notice above every dashboard page
export default function AccessBanner({ access }: { access: Access }) {
  if (access.state === "trial") {
    return (
      <div className={`${s.banner} ${s.alertInfo}`}>
        <span>فترتك التجريبية: تبقّى {access.daysLeft} {access.daysLeft === 1 ? "يوم" : "يوماً"}.</span>
        <Link href="/dashboard/billing">اختر باقتك</Link>
      </div>
    );
  }
  if (access.state === "active" && access.daysLeft <= 14) {
    return (
      <div className={`${s.banner} ${s.alertWarn}`}>
        <span>ينتهي اشتراكك خلال {access.daysLeft} {access.daysLeft === 1 ? "يوم" : "يوماً"}.</span>
        <Link href="/dashboard/billing">جدّد الآن</Link>
      </div>
    );
  }
  if (access.state === "expired") {
    return (
      <div className={`${s.banner} ${s.alertWarn}`}>
        <span>انتهت فترتك التجريبية أو اشتراكك. الخدمات والحجوزات ما زالت متاحة.</span>
        <Link href="/dashboard/billing">اشترك في باقة</Link>
      </div>
    );
  }
  return null;
}
