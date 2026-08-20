import { headers } from "next/headers";
import DualLandingPage from "@/components/landing/DualLandingPage";
import SystemLandingPage from "@/components/landing/SystemLandingPage";

export default async function Home() {
  const headersList = await headers();
  const host = headersList.get("host") || "";

  // Check if host is system subdomain (e.g. system.masheedwaqf.com or system.localhost:3000)
  const isSystemSubdomain = host.startsWith("system.") || host.includes("system.masheedwaqf.com");

  if (isSystemSubdomain) {
    return <SystemLandingPage />;
  }

  return <DualLandingPage />;
}
