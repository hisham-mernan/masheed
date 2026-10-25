import Link from "next/link";

const FOOTER_LINKS = {
  "المنصة": [
    { label: "استكشف الأوقاف", href: "/explore" },
    { label: "كيف تعمل", href: "#how-it-works" },
    { label: "الأسئلة الشائعة", href: "#faq" },
  ],
  "الشركة": [
    { label: "عن مشيد", href: "#" },
    { label: "تواصل معنا", href: "#" },
    { label: "الشروط والأحكام", href: "#" },
  ],
  "الدعم": [
    { label: "مركز المساعدة", href: "#" },
    { label: "سياسة الخصوصية", href: "#" },
    { label: "الأمان", href: "#" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-foreground text-background border-t border-background/10">
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-16 md:py-24">
        {/* Wordmark */}
        <p className="font-display font-black text-5xl md:text-7xl leading-none mb-16 text-background/95">
          وقف مشيد<span className="text-sand">.</span>
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 border-t border-background/15 pt-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <p className="text-background/50 text-sm leading-loose max-w-xs">
              منصة سعودية تمكّنك من المساهمة في الأوقاف عبر صكوك وقفية رقمية. أصلك محفوظ لا يُباع، وثمرته نوجّهها حيث شئت.
            </p>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sand font-medium mb-6 text-xs tracking-wider">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-background/50 hover:text-background transition-colors text-sm cursor-pointer"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-background/15 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-background/40 text-xs">
            © {new Date().getFullYear()} وقف مشيد. جميع الحقوق محفوظة.
          </p>
          <div className="flex items-center gap-3">
            <span className="text-background/40 text-xs">منتج من</span>
            <span className="font-display font-bold text-background text-sm">Masheed</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
