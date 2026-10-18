import React from "react";
import Link from "next/link";
import { Tv, Send, ShieldCheck, Heart } from "lucide-react";
import { MAIN_CATEGORIES } from "@/lib/matching";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-slate-950 border-t border-white/10 mt-20 pt-16 pb-12 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white font-bold">
                <Tv size={18} />
              </div>
              <span className="text-lg font-black tracking-wider text-white">
                CINEPRIME<span className="text-primary-light">SERIES</span>
              </span>
            </Link>
            <p className="text-slate-400 leading-relaxed text-xs">
              The premier destination for TV series discovery, worldwide season guides,
              episode schedules, and official trailers.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-accent-light font-semibold">
              <ShieldCheck size={13} />
              <span>Strictly TV-Series Only Catalogue</span>
            </div>
          </div>

          {/* Categories Col */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
              10 Main Genres
            </h4>
            <div className="grid grid-cols-2 gap-1.5">
              {MAIN_CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  className="hover:text-primary-light transition-colors py-0.5"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
              Explore
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/trending" className="hover:text-white transition-colors">
                  Trending TV Series
                </Link>
              </li>
              <li>
                <Link href="/new" className="hover:text-white transition-colors">
                  Newly Added Series
                </Link>
              </li>
              <li>
                <Link href="/top-rated" className="hover:text-white transition-colors">
                  Top Rated Series
                </Link>
              </li>
              <li>
                <Link href="/language/tamil" className="hover:text-white transition-colors">
                  Tamil Audio &amp; Dubbed
                </Link>
              </li>
              <li>
                <Link href="/latest-episodes" className="hover:text-white transition-colors">
                  Latest TV Air Schedule
                </Link>
              </li>
            </ul>
          </div>

          {/* Telegram & Legal */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
              Community &amp; Updates
            </h4>
            <p className="text-slate-400 text-xs">
              Subscribe to the CinePrimeSeries Telegram channel for immediate episode upload notifications and direct links.
            </p>
            <a
              href="https://t.me/CinePrimeSeries"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent/20 hover:bg-accent/30 text-accent-light border border-accent/40 font-bold transition-all"
            >
              <Send size={14} />
              <span>Join @CinePrimeSeries</span>
            </a>
          </div>
        </div>

        {/* Third Party Disclosures & Copyright */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <p>
            © {new Date().getFullYear()} CinePrimeSeries. All rights reserved. Video trailers are embedded via the official YouTube Player API. Metadata powered by TVmaze and TMDB APIs.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-slate-200">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-slate-200">
              Terms of Service
            </Link>
            <Link href="/admin" className="hover:text-slate-200">
              Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
