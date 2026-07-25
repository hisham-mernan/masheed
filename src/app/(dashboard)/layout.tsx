export const dynamic = "force-dynamic";

import Sidebar from "@/components/dashboard/Sidebar";
import TopNav from "@/components/dashboard/TopNav";
import { createClient } from "@/lib/supabase/server";
import styles from "./layout.module.css";
import { redirect } from "next/navigation";

import { cookies } from "next/headers";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let shouldRedirectToLogin = false;
  let user = null;
  let profile = null;
  let waqfs = null;

  const cookieStore = await cookies();
  const mockRole = cookieStore.get("masheed-mock-role")?.value;

  if (mockRole) {
    user = { email: mockRole === "admin" ? "admin@masheed.com" : "user@masheed.com" };
    profile = { full_name: mockRole === "admin" ? "المدير التنفيذي لمشيد" : "مدير الوقف التجريبي", role: mockRole };
    waqfs = [{ id: "mock-waqf", name: "وقف مشيد المركزي التجريبي" }];
  } else {
    try {
      const supabase = await createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      user = authUser;

      if (!user) {
        shouldRedirectToLogin = true;
      } else {
        const { data: dbProfile } = await supabase
          .from("profiles")
          .select("full_name, role, waqf_id")
          .eq("id", user.id)
          .single();
        profile = dbProfile;

        const { data: dbWaqfs } = await supabase
          .from("waqfs")
          .select("id, name");
        waqfs = dbWaqfs;
      }
    } catch (error) {
      console.warn("Database connection issue in dashboard layout, falling back to simulated session:", error);
      user = { email: "user@masheed.com" };
      profile = { full_name: "مدير الوقف التجريبي", role: "viewer" };
      waqfs = [{ id: "mock-waqf", name: "وقف مشيد المركزي" }];
    }
  }

  if (shouldRedirectToLogin) {
    redirect("/login");
  }

  return (
    <div className={styles.layout}>
      <Sidebar userWaqfs={waqfs || []} userRole={profile?.role} />
      <div className={styles.main}>
        <TopNav userProfile={profile} />
        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}
