import type { Metadata } from "next";

// Canonical origins of the two public sites served by this app (www is canonical for the main domain).
export const MAIN_ORIGIN = "https://www.masheedwaqf.com";
export const SYSTEM_ORIGIN = "https://system.masheedwaqf.com";

// Title, description, canonical URL and Open Graph tags for one public page.
export function pageMeta(origin: string, path: string, title: string, description: string): Metadata {
  const url = origin + path;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: "مَشيد", locale: "ar_SA", type: "website" },
  };
}

export const sysMeta = (path: string, title: string, description: string) => pageMeta(SYSTEM_ORIGIN, path, title, description);
