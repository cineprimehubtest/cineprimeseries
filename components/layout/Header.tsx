"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, Send, Moon, Sun } from "lucide-react";

export const Header: React.FC = () => {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#070911]/90 backdrop-blur-xl border-b border-white/[0.06] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Quick Telegram Community Link */}
        <div className="flex items-center">
          <a
            href="https://t.me/CinePrimeSeries"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold transition-all active:scale-95"
            title="Join Official Telegram"
          >
            <Send size={13} className="text-amber-400" />
            <span className="hidden sm:inline">Telegram</span>
          </a>
        </div>

        {/* Center: Golden Wordmark matching cineplexweb */}
        <Link href="/" className="group flex items-center">
          <span className="font-serif tracking-[0.35em] text-xl sm:text-2xl font-bold bg-gradient-to-r from-amber-200 via-orange-300 to-rose-400 bg-clip-text text-transparent group-hover:brightness-110 transition-all drop-shadow-[0_2px_12px_rgba(251,191,36,0.25)] select-none">
            C I N E P R I M E
          </span>
        </Link>

        {/* Right: Search + Dark/Light Toggle */}
        <div className="flex items-center gap-2">
          {/* Search Button */}
          <Link
            href="/search"
            aria-label="Search Series"
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all active:scale-95"
          >
            <Search size={15} />
          </Link>

          {/* Dark / Light Mode Pill matching cineplexweb */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="flex items-center px-2.5 py-1.5 rounded-full bg-[#111422] hover:bg-[#181d30] border border-white/10 text-amber-300 text-xs shadow-inner cursor-pointer transition-colors active:scale-95"
            title="Toggle Dark/Light Mode"
          >
            {isDark ? (
              <Moon size={13} className="fill-current text-amber-300" />
            ) : (
              <Sun size={13} className="text-amber-400" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
