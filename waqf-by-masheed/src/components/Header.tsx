"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/explore", label: "استكشف الأوقاف" },
  { href: "/dashboard", label: "محفظتي" },
  { href: "#how-it-works", label: "كيف تعمل" },
  { href: "#impact", label: "أثرنا" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "glass border-b border-border" : "bg-transparent"
      }`}
    >
      <nav className="max-w-6xl mx-auto px-6 md:px-10 flex items-center justify-between h-18 md:h-22">
        {/* Logo */}
        <Link href="/" className="flex items-baseline gap-1.5 cursor-pointer">
          <span className="font-display font-black text-2xl md:text-3xl text-foreground leading-none">
            وقف مشيد
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-accent translate-y-[-2px]" />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted hover:text-foreground transition-colors text-sm font-medium relative after:absolute after:bottom-[-6px] after:right-0 after:w-0 after:h-px after:bg-accent after:transition-all after:duration-300 hover:after:w-full cursor-pointer"
            >
              {link.label}
            </Link>
          ))}
          <Link href="/auth/login">
            <button className="bg-foreground text-background px-7 py-2.5 rounded-full text-sm font-medium hover:bg-accent transition-colors duration-300 cursor-pointer">
              دخول
            </button>
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 cursor-pointer"
          aria-label="القائمة"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden glass border-t border-border animate-fade-in">
          <div className="px-6 py-6 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block font-display font-bold text-foreground text-xl py-3 border-b border-border last:border-0 cursor-pointer"
              >
                {link.label}
              </Link>
            ))}
            <Link href="/auth/login" onClick={() => setMobileOpen(false)}>
              <button className="w-full mt-4 bg-foreground text-background px-6 py-3.5 rounded-full text-sm font-medium hover:bg-accent transition-colors cursor-pointer">
                دخول
              </button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
