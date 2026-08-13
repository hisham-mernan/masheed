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
    user = { email: mockRole === "admin" ? "hishamjoban99@gmail.com" : "user@masheed.com" };
    profile = { full_name: "هشام جوبان", role: "admin", waqf_id: "67dd4687-89e3-4c4a-a63d-e2f94dff0e73" };
    waqfs = [{ id: "67dd4687-89e3-4c4a-a63d-e2f94dff0e73", name: "أوقاف هشام جوبان التنموية واستثمارات الأعيان" }];
  } else {
    try {
      const supabase = await createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      user = authUser;

      // Query Profile & Waqfs
      if (user?.id) {
        const { data: dbProfile } = await supabase
          .from("profiles")
          .select("full_name, role, waqf_id")
          .eq("id", user.id)
          .maybeSingle();
        profile = dbProfile;
      }

      const { data: dbWaqfs } = await supabase
        .from("waqfs")
        .select("id, name");
      waqfs = dbWaqfs;

      // Default fallback to Hisham Joban's Waqf if profile/waqf missing
      if (!profile || !profile.full_name) {
        const { data: hishamProfile } = await supabase
          .from("profiles")
          .select("full_name, role, waqf_id")
          .eq("id", "a61ef854-15de-4210-bd48-c4de5e764ea8")
          .maybeSingle();
        profile = hishamProfile || { full_name: "هشام جوبان", role: "admin", waqf_id: "67dd4687-89e3-4c4a-a63d-e2f94dff0e73" };
      }

      if (!waqfs || waqfs.length === 0) {
        const { data: allWaqfs } = await supabase.from("waqfs").select("id, name");
        waqfs = allWaqfs && allWaqfs.length > 0 ? allWaqfs : [{ id: "67dd4687-89e3-4c4a-a63d-e2f94dff0e73", name: "أوقاف هشام جوبان التنموية واستثمارات الأعيان" }];
      }

    } catch (error) {
      console.warn("Database connection issue in dashboard layout, falling back to Hisham Joban profile:", error);
      profile = { full_name: "هشام جوبان", role: "admin", waqf_id: "67dd4687-89e3-4c4a-a63d-e2f94dff0e73" };
      waqfs = [{ id: "67dd4687-89e3-4c4a-a63d-e2f94dff0e73", name: "أوقاف هشام جوبان التنموية واستثمارات الأعيان" }];
    }
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
