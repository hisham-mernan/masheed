import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";

const ibmPlex = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
});

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
    <html lang="ar" dir="rtl" className={ibmPlex.variable}>
      <body className="font-sans">
        {children}
      </body>
    </html>
  );
}
