import type { Metadata } from "next";
import { Cairo, IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";

// Fallbacks behind Thmanyah: IBM Plex Sans Arabic first, then Cairo
const plexArabic = IBM_Plex_Sans_Arabic({ subsets: ["arabic", "latin"], weight: ["400", "500", "600", "700"], variable: "--font-plex-arabic", display: "swap" });
const cairo = Cairo({ subsets: ["arabic", "latin"], variable: "--font-cairo", display: "swap" });

export const metadata: Metadata = {
  title: "وقف مَشيد | استثمر في أوقافٍ مؤهّلة",
  description: "منصة وقف مَشيد: فرص استثمارية من جهات وقفية موثوقة، تمر بمراجعة مالية وحوكمية قبل نشرها.",
  icons: { icon: "/brand/masheed-mark-waqf.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        {/* Preload the critical Thmanyah faces used above the fold */}
        <link
          rel="preload"
          href="/fonts/thmanyah/thmanyah-serif-display-Black.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/thmanyah/thmanyah-serif-display-Bold.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/thmanyah/thmanyah-sans-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/thmanyah/thmanyah-sans-Medium.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`font-sans ${plexArabic.variable} ${cairo.variable}`}>
        {children}
      </body>
    </html>
  );
}
