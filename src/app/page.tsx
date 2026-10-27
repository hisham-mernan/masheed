import type { Metadata } from "next";
import { headers } from "next/headers";
import DualLandingPage from "@/components/landing/DualLandingPage";
import SysHome from "@/components/system-site/SysHome";

// system.masheedwaqf.com (or system.localhost:3000) serves the System website;
// every other host serves the main gateway to both products.
async function isSystemSubdomain() {
  const host = (await headers()).get("host") || "";
  return host.startsWith("system.") || host.includes("system.masheedwaqf.com");
}

export async function generateMetadata(): Promise<Metadata> {
  if (await isSystemSubdomain()) {
    return {
      title: "نظام مَشيد | نظام تشغيل الجهة الوقفية",
      description: "نظام تشغيلٍ مؤسسي يجمع أصول الوقف ومستفيديه وماليته وحوكمته في بيئةٍ واحدة، مع خدمات استشارية وباقات سنوية.",
      icons: { icon: "/brand/masheed-mark.svg" },
    };
  }
  return {
    title: "مَشيد | المنظومة الرقمية المتكاملة لتمكين وتطوير الأوقاف",
    description: "نظام مَشيد لإدارة الأوقاف، ووقف مَشيد للفرص الاستثمارية الوقفية المؤهّلة — منظومة سعودية واحدة.",
    icons: { icon: "/brand/masheed-mark.svg" },
  };
}

export default async function Home() {
  if (await isSystemSubdomain()) {
    return <SysHome />;
  }

  return <DualLandingPage />;
}
