import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "وقف مشيد | أثر يبقى",
  description: "منصة وقف مشيد تتيح لك المساهمة في الأوقاف عبر شراء صكوك وقفية. أصلك محفوظ وثمرته نوجهها حيث شئت.",
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
      <body className="font-sans">
        {children}
      </body>
    </html>
  );
}
