"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Search, X, Loader2, Star, Tv } from "lucide-react";
import { Series } from "@/types";

interface SearchBarProps {
  initialQuery?: string;
  onSearch?: (query: string) => void;
  className?: string;
  autoFocus?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  initialQuery = "",
  onSearch,
  className = "",
  autoFocus = false,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<Series[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced autocomplete suggestions
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}&limit=5`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.results || []);
          setIsOpen(true);
        }
      } catch {
        // Ignore fetch errors
      } finally {
        setIsLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOpen(false);
    if (onSearch) {
      onSearch(query);
    } else {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
    setIsOpen(false);
    if (onSearch) onSearch("");
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="relative flex items-center w-full bg-slate-900/80 border border-white/10 hover:border-primary/50 focus-within:border-primary focus-within:shadow-glow-violet/30 rounded-2xl overflow-hidden backdrop-blur-xl transition-all duration-300">
          <div className="pl-4 text-slate-400">
            {isLoading ? (
              <Loader2 size={18} className="animate-spin text-primary-light" />
            ) : (
              <Search size={18} />
            )}
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => suggestions.length > 0 && setIsOpen(true)}
            placeholder="Search TV series by title, language, country..."
            autoFocus={autoFocus}
            className="w-full bg-transparent py-3.5 pl-3 pr-20 text-sm md:text-base text-white placeholder-slate-400 focus:outline-none"
          />

          {query && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear search"
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 mr-1 transition-colors"
            >
              <X size={16} />
            </button>
          )}

          <button
            type="submit"
            className="m-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white text-xs md:text-sm font-semibold hover:brightness-110 transition-all shadow-glow-violet active:scale-95 shrink-0"
          >
            Search
          </button>
        </div>
      </form>

      {/* Autocomplete Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl bg-slate-950/95 border border-white/10 shadow-glass overflow-hidden z-50 backdrop-blur-2xl animate-fade-in divide-y divide-white/5">
          <div className="px-3 py-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase bg-white/[0.02]">
            Series Suggestions (TV Series Only)
          </div>

          {suggestions.map((item) => (
            <Link
              key={item.id}
              href={`/series/${item.slug}`}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 p-2.5 hover:bg-white/5 transition-colors group"
            >
              <div className="relative w-10 h-14 rounded-lg overflow-hidden bg-slate-900 border border-white/10 shrink-0">
                {item.posterUrl ? (
                  <Image
                    src={item.posterUrl}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-600">
                    <Tv size={16} />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white group-hover:text-primary-light transition-colors truncate">
                  {item.title}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                  <span>{item.firstAirDate?.substring(0, 4) || "Series"}</span>
                  <span>•</span>
                  <span>{item.genres[0] || "Drama"}</span>
                  <span>•</span>
                  <span className="uppercase text-[10px] text-accent-light font-medium">
                    {item.originalLanguage}
                  </span>
                </div>
              </div>

              {item.rating && (
                <div className="flex items-center gap-1 text-xs font-semibold text-primary-light pr-2">
                  <Star size={12} className="fill-current" />
                  {item.rating}
                </div>
              )}
            </Link>
          ))}

          <div className="p-2 bg-white/[0.02] text-center">
            <button
              onClick={handleSubmit}
              className="text-xs font-semibold text-primary-light hover:underline"
            >
              See all results for &quot;{query}&quot; →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
