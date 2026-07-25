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
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "glass border-b border-border shadow-sm"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1 group cursor-pointer">
          <span className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
            وقف
          </span>
          <span className="text-2xl md:text-3xl font-light text-accent">
            مشيد
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted hover:text-foreground transition-colors text-sm font-medium relative after:absolute after:bottom-[-4px] after:right-0 after:w-0 after:h-[2px] after:bg-accent after:transition-all hover:after:w-full cursor-pointer"
            >
              {link.label}
            </Link>
          ))}
          <Link href="/auth/login">
            <button className="bg-foreground text-background px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-accent transition-all duration-200 cursor-pointer">
              دخول
            </button>
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 cursor-pointer"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden glass border-t border-border animate-fade-in">
          <div className="px-6 py-6 space-y-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block text-foreground text-lg font-medium py-2 cursor-pointer"
              >
                {link.label}
              </Link>
            ))}
            <Link href="/auth/login" onClick={() => setMobileOpen(false)}>
              <button className="w-full bg-foreground text-background px-6 py-3 rounded-full text-sm font-semibold hover:bg-accent transition-all cursor-pointer">
                دخول
              </button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
