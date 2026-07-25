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
    <footer className="bg-foreground text-background mt-24">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="mb-6">
              <span className="text-3xl font-bold text-white">وقف</span>
              <span className="text-3xl font-light text-accent-light mr-1">مشيد</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              منصة سعودية رائدة تمكّنك من المساهمة في الأوقاف عبر صكوك وقفية رقمية. أصلك محفوظ لا يُباع، وثمرته نوجّهها حيث شئت.
            </p>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-white font-semibold mb-5 text-sm">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm cursor-pointer"
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
        <div className="border-t border-gray-700 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-xs">
            © {new Date().getFullYear()} وقف مشيد. جميع الحقوق محفوظة.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-gray-500 text-xs">منتج من</span>
            <span className="text-white font-bold text-sm">Masheed</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
