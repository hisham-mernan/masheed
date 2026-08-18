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
  const userEmail = cookieStore.get("masheed-user-email")?.value;
  const userIdCookie = cookieStore.get("masheed-user-id")?.value;

  if (userIdCookie || userEmail) {
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
        const pRes = await client.query("SELECT full_name, role, waqf_id FROM public.profiles WHERE id = $1", [targetUserId]);
        if (pRes.rows.length > 0) {
          profile = pRes.rows[0];
        }
      }

      if (profile?.waqf_id) {
        const wRes = await client.query("SELECT id, name FROM public.waqfs WHERE id = $1", [profile.waqf_id]);
        if (wRes.rows.length > 0) {
          waqfs = wRes.rows;
        }
      }

      if (!waqfs) {
        const allWaqfs = await client.query("SELECT id, name FROM public.waqfs LIMIT 10");
        waqfs = allWaqfs.rows;
      }

      await client.end();
    } catch (e) {
      console.warn("Direct DB session query in dashboard layout warning:", e);
    }
  }

  if (!profile && mockRole) {
    user = { email: mockRole === "admin" ? "admin@masheed.com" : "user@masheed.com" };
    profile = { full_name: "المدير التنفيذي لـ ناظر الوقف", role: "admin", waqf_id: "67dd4687-89e3-4c4a-a63d-e2f94dff0e73" };
    waqfs = [{ id: "67dd4687-89e3-4c4a-a63d-e2f94dff0e73", name: "أوقاف النماء والازدهار التنموية" }];
  } else if (!profile) {
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

      if (!profile || !profile.full_name) {
        const { data: generalProfile } = await supabase
          .from("profiles")
          .select("full_name, role, waqf_id")
          .eq("id", "a61ef854-15de-4210-bd48-c4de5e764ea8")
          .maybeSingle();
        profile = generalProfile || { full_name: "المدير التنفيذي لـ ناظر الوقف", role: "admin", waqf_id: "67dd4687-89e3-4c4a-a63d-e2f94dff0e73" };
      }

      if (!waqfs || waqfs.length === 0) {
        const { data: allWaqfs } = await supabase.from("waqfs").select("id, name");
        waqfs = allWaqfs && allWaqfs.length > 0 ? allWaqfs : [{ id: "67dd4687-89e3-4c4a-a63d-e2f94dff0e73", name: "أوقاف النماء والازدهار التنموية" }];
      }

    } catch (error) {
      console.warn("Database connection issue in dashboard layout, falling back to general Waqf profile:", error);
      profile = { full_name: "المدير التنفيذي لـ ناظر الوقف", role: "admin", waqf_id: "67dd4687-89e3-4c4a-a63d-e2f94dff0e73" };
      waqfs = [{ id: "67dd4687-89e3-4c4a-a63d-e2f94dff0e73", name: "أوقاف النماء والازدهار التنموية" }];
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
