"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "#features", label: "Fitur" },
  { href: "#ai", label: "AI" },
  { href: "#pricing", label: "Harga" },
];

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0A0F1E]/90 backdrop-blur-md border-b border-white/5 shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-sm group-hover:bg-blue-500 transition-colors">
            V
          </div>
          <span className="text-white font-bold text-lg">Voon</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/join"
            className="text-gray-400 hover:text-white text-sm transition-colors px-3 py-1.5"
          >
            Bergabung
          </Link>
          <Link
            href="/sign-in"
            className="text-sm text-white/80 hover:text-white px-4 py-2 rounded-lg border border-white/10 hover:border-white/20 transition-all"
          >
            Masuk
          </Link>
          <Link
            href="/sign-up"
            className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            Daftar Gratis
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          className="md:hidden p-2 text-gray-400 hover:text-white"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#0A0F1E]/95 backdrop-blur-md border-t border-white/5 px-4 pb-4 space-y-2">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block py-2 text-gray-400 hover:text-white text-sm transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/sign-in"
              className="w-full text-center py-2.5 text-sm text-white border border-white/10 rounded-lg"
              onClick={() => setMenuOpen(false)}
            >
              Masuk
            </Link>
            <Link
              href="/sign-up"
              className="w-full text-center py-2.5 text-sm bg-blue-600 text-white rounded-lg font-semibold"
              onClick={() => setMenuOpen(false)}
            >
              Daftar Gratis
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
