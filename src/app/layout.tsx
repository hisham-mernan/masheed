import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Masheed (مَشيد) | Intelligent Endowment Management",
  description: "Comprehensive system and digital ecosystem for the Saudi Awqaf sector. Transforming endowment management through intelligent automation.",
  keywords: ["Masheed", "Awqaf", "Saudi Vision 2030", "Endowment System", "GAW", "Saudi Arabia"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // In a real app, this would be determined by a language context or cookie
  const locale = "ar"; 
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir}>
      <body className="fade-in">
        {children}
      </body>
    </html>
  );
}
