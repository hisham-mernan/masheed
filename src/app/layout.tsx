import localFont from 'next/font/local';
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

export const metadata = {
  title: "Masheed (مَشيد) | Intelligent Endowment Management",
  description: "Comprehensive ERP and digital ecosystem for the Saudi Awqaf sector. Transforming endowment management through intelligent automation.",
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
      <body className={`fade-in ${thmanyahDisplay.variable} ${thmanyahSans.variable}`}>
        {children}
      </body>
    </html>
  );
}
