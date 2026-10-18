"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Search, Send, Moon, Sun, Home } from "lucide-react";

export const Header: React.FC = () => {
  const [isDark, setIsDark] = useState(true);
  const pathname = usePathname();

  // Initialize theme from localStorage
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("cineprime_theme");
      if (savedTheme === "light") {
        setIsDark(false);
        document.documentElement.classList.remove("dark");
        document.documentElement.classList.add("light");
      } else {
        setIsDark(true);
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("light");
      }
    } catch {
      // Ignore in SSR
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = !isDark;
    setIsDark(nextTheme);
    try {
      if (nextTheme) {
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("light");
        localStorage.setItem("cineprime_theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        document.documentElement.classList.add("light");
        localStorage.setItem("cineprime_theme", "light");
      }
    } catch {
      // Ignore
    }
  };

  return (
    <header className={`sticky top-0 z-40 w-full backdrop-blur-xl border-b transition-all duration-300 ${
      isDark
        ? "bg-[#070911]/90 border-white/[0.06]"
        : "bg-white/95 border-slate-200/80 shadow-sm"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Left: Home Button (Shown ONLY when not on Home page) + Telegram */}
        <div className="flex items-center gap-2 shrink-0">
          {pathname !== "/" && (
            <Link
              href="/"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all active:scale-95 animate-fade-in ${
                isDark
                  ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border-amber-500/40 shadow-sm"
                  : "bg-amber-100/80 hover:bg-amber-200/90 text-amber-900 border-amber-300 shadow-sm"
              }`}
              title="Return to Home"
            >
              <Home size={13} className={isDark ? "text-amber-400" : "text-amber-700"} />
              <span>Home</span>
            </Link>
          )}

          <a
            href="https://t.me/CinePrimeSeries"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all active:scale-95 ${
              isDark
                ? "bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border-white/10"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border-slate-200"
            }`}
            title="Join Official Telegram"
          >
            <Send size={13} className="text-amber-400" />
            <span className="hidden sm:inline">Telegram</span>
          </a>
        </div>

        {/* Center: Official Logo + Golden Wordmark */}
        <Link href="/" className="group flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border transition-all duration-300 shrink-0 ${
            isDark
              ? "border-amber-400/60 shadow-[0_0_14px_rgba(251,191,36,0.35)]"
              : "border-amber-600/50 shadow-md ring-1 ring-amber-400/30"
          }`}>
            <Image
              src="/logo.jpg"
              alt="CinePrimeSeries Logo"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="36px"
              priority
            />
          </div>
          <span className={`font-serif tracking-[0.18em] sm:tracking-[0.28em] text-xs sm:text-base md:text-xl font-bold transition-all select-none truncate ${
            isDark
              ? "bg-gradient-to-r from-amber-200 via-orange-300 to-rose-400 bg-clip-text text-transparent group-hover:brightness-110 drop-shadow-[0_2px_12px_rgba(251,191,36,0.25)]"
              : "bg-gradient-to-r from-amber-700 via-orange-700 to-rose-800 bg-clip-text text-transparent font-extrabold drop-shadow-[0_1px_2px_rgba(0,0,0,0.1)]"
          }`}>
            C I N E P R I M E S E R I E S
          </span>
        </Link>

        {/* Right: Search + Dark/Light Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Search Button */}
          <Link
            href="/search"
            aria-label="Search Series"
            className={`p-2 rounded-full border transition-all active:scale-95 ${
              isDark
                ? "bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border-white/10"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border-slate-200"
            }`}
          >
            <Search size={15} />
          </Link>

          {/* Dark / Light Mode Pill */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className={`flex items-center px-2.5 py-1.5 rounded-full border text-xs shadow-inner cursor-pointer transition-colors active:scale-95 ${
              isDark
                ? "bg-[#111422] hover:bg-[#181d30] border-white/10 text-amber-300"
                : "bg-amber-50 hover:bg-amber-100 border-amber-300/70 text-amber-700"
            }`}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? (
              <Moon size={13} className="fill-current text-amber-300" />
            ) : (
              <Sun size={13} className="text-amber-500 fill-amber-400" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
