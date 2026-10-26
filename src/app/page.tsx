import type { Metadata } from "next";
import { headers } from "next/headers";
import DualLandingPage from "@/components/landing/DualLandingPage";
import SystemLandingPage from "@/components/landing/SystemLandingPage";

// system.masheedwaqf.com (or system.localhost:3000) serves the System landing page;
// every other host serves the main gateway to both products.
async function isSystemSubdomain() {
  const host = (await headers()).get("host") || "";
  return host.startsWith("system.") || host.includes("system.masheedwaqf.com");
}

export async function generateMetadata(): Promise<Metadata> {
  if (await isSystemSubdomain()) return {};
  return {
    title: "مَشيد | المنظومة الرقمية المتكاملة لتمكين وتطوير الأوقاف",
    description: "نظام مَشيد لإدارة الأوقاف، ووقف مَشيد للفرص الاستثمارية الوقفية المؤهّلة — منظومة سعودية واحدة.",
    icons: { icon: "/brand/masheed-mark.svg" },
  };
}

export default async function Home() {
  if (await isSystemSubdomain()) {
    return <SystemLandingPage />;
  }

  return <DualLandingPage />;
}
