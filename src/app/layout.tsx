import localFont from 'next/font/local';
import { Cairo, IBM_Plex_Sans_Arabic } from 'next/font/google';
import "./globals.css";

const thmanyahDisplay = localFont({
  src: [
    { path: '../../public/fonts/thmanyah/thmanyah-serif-display-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../../public/fonts/thmanyah/thmanyah-serif-display-Medium.woff2', weight: '500', style: 'normal' },
    { path: '../../public/fonts/thmanyah/thmanyah-serif-display-Bold.woff2', weight: '700', style: 'normal' },
    { path: '../../public/fonts/thmanyah/thmanyah-serif-display-Black.woff2', weight: '900', style: 'normal' }
  ],
  variable: '--font-thmanyah-display',
  display: 'swap'
});

const thmanyahSans = localFont({
  src: [
    { path: '../../public/fonts/thmanyah/thmanyah-sans-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../../public/fonts/thmanyah/thmanyah-sans-Medium.woff2', weight: '500', style: 'normal' },
    { path: '../../public/fonts/thmanyah/thmanyah-sans-Bold.woff2', weight: '700', style: 'normal' },
    { path: '../../public/fonts/thmanyah/thmanyah-sans-Black.woff2', weight: '900', style: 'normal' }
  ],
  variable: '--font-thmanyah-sans',
  display: 'swap'
});

// Fallbacks behind Thmanyah: IBM Plex Sans Arabic first, then Cairo
const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-plex-arabic',
  display: 'swap'
});

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
  display: 'swap'
});

export const metadata = {
  title: "مَشيد | المنظومة الرقمية المتكاملة لتمكين وتطوير الأوقاف",
  description: "منظومة رقمية متكاملة لإدارة الأوقاف وتطويرها: نظام مَشيد لإدارة الجهة الوقفية، ووقف مَشيد لعرض الفرص الاستثمارية.",
  keywords: ["Masheed", "Awqaf", "Saudi Vision 2030", "Endowment ERP", "GAW", "Saudi Arabia"],
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
      <body className={`fade-in ${thmanyahDisplay.variable} ${thmanyahSans.variable} ${plexArabic.variable} ${cairo.variable}`}>
        {children}
      </body>
    </html>
  );
}
