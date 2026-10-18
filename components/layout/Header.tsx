"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Tv,
  TrendingUp,
  Sparkles,
  Award,
  Grid,
  Globe,
  Search,
  Send,
  Menu,
  X,
  Bookmark,
  Shield,
  Moon,
} from "lucide-react";
import { MAIN_CATEGORIES } from "@/lib/matching";

export const Header: React.FC = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  const navLinks = [
    { label: "Home", href: "/", icon: <Tv size={15} /> },
    { label: "Trending", href: "/trending", icon: <TrendingUp size={15} /> },
    { label: "New Series", href: "/new", icon: <Sparkles size={15} /> },
    { label: "Top Rated", href: "/top-rated", icon: <Award size={15} /> },
    { label: "Latest Episodes", href: "/latest-episodes", icon: <Tv size={15} /> },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#070911]/85 backdrop-blur-xl border-b border-white/[0.08] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Left: Quick Navigation / Brand Pill */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 group-hover:scale-105 transition-transform shadow-glow-cyan/20">
              <Tv size={18} />
            </div>
            <span className="hidden sm:inline-block text-[11px] font-bold tracking-widest text-slate-400 uppercase bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
              TV SERIES ONLY
            </span>
          </Link>
        </div>

        {/* Centered: Golden Wordmark (C I N E P R I M E) */}
        <Link href="/" className="flex flex-col items-center group -ml-4 sm:ml-0">
          <span className="font-serif tracking-[0.35em] text-lg sm:text-2xl font-black bg-gradient-to-r from-amber-200 via-orange-300 to-rose-400 bg-clip-text text-transparent group-hover:brightness-110 transition-all drop-shadow-[0_2px_10px_rgba(251,191,36,0.2)]">
            C I N E P R I M E
          </span>
          <span className="text-[9px] uppercase font-bold tracking-[0.25em] text-amber-400/80 -mt-0.5">
            LEECHED SERIES REGISTRY
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-primary/15 text-primary-light border border-primary/30"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            );
          })}

          {/* Categories Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
              onMouseEnter={() => setIsCategoryDropdownOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-all"
            >
              <Grid size={15} />
              <span>Categories</span>
            </button>

            {isCategoryDropdownOpen && (
              <div
                onMouseLeave={() => setIsCategoryDropdownOpen(false)}
                className="absolute top-full left-0 mt-1 w-64 p-2 rounded-2xl bg-slate-950/95 border border-white/10 shadow-glass backdrop-blur-2xl grid grid-cols-2 gap-1 z-50 animate-fade-in"
              >
                {MAIN_CATEGORIES.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/category/${cat.slug}`}
                    onClick={() => setIsCategoryDropdownOpen(false)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Languages link */}
          <Link
            href="/language/tamil"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-all"
          >
            <Globe size={15} className="text-accent-light" />
            <span>Tamil Series</span>
          </Link>
        </nav>

        {/* Right Action Buttons */}
        <div className="hidden sm:flex items-center gap-2.5">
          {/* Theme Pill matching cineplexweb */}
          <div
            title="Dark Cinematic Theme Active"
            className="flex items-center px-3 py-1.5 rounded-full bg-[#111422] border border-white/10 text-amber-300 text-xs shadow-inner cursor-pointer hover:border-amber-400/40 transition-colors"
          >
            <Moon size={13} className="fill-current text-amber-300" />
          </div>

          <Link
            href="/search"
            aria-label="Search series"
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all active:scale-95"
          >
            <Search size={16} />
          </Link>

          <Link
            href="https://t.me/CinePrimeSeries"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all shadow-glow-cyan active:scale-95"
          >
            <Send size={14} />
            <span>Telegram Channel</span>
          </Link>

          <Link
            href="/admin"
            title="Admin Dashboard (Publish Leeched Series)"
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-all active:scale-95"
          >
            <Shield size={16} />
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex sm:hidden items-center gap-2">
          <Link
            href="/search"
            aria-label="Search"
            className="p-2 rounded-xl bg-white/5 text-slate-300"
          >
            <Search size={18} />
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="p-2 rounded-xl bg-white/5 text-slate-300 hover:text-white transition-colors"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-slate-950/95 backdrop-blur-2xl p-4 space-y-3 animate-fade-in">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:bg-white/10"
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            ))}

            <Link
              href="/language/tamil"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-accent-light hover:bg-white/10"
            >
              <Globe size={16} />
              <span>Tamil Series &amp; Dubbed</span>
            </Link>

            <Link
              href="/admin"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:bg-white/10"
            >
              <Shield size={16} />
              <span>Admin Dashboard</span>
            </Link>
          </div>

          {/* Categories grid in mobile menu */}
          <div className="pt-2 border-t border-white/10">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Categories
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {MAIN_CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-2.5 py-1.5 rounded-lg text-xs bg-white/5 text-slate-300 hover:text-white"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-white/10">
            <a
              href="https://t.me/CinePrimeSeries"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-accent text-slate-950 text-xs font-bold shadow-glow-cyan"
            >
              <Send size={14} />
              <span>Join Official Telegram Channel</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
