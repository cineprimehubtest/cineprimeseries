"use client";

import React from "react";
import { MAIN_CATEGORIES } from "@/lib/matching";
import { RotateCcw } from "lucide-react";

interface SearchFiltersProps {
  genre: string;
  language: string;
  status: string;
  year: string;
  onFilterChange: (filters: {
    genre?: string;
    language?: string;
    status?: string;
    year?: string;
  }) => void;
  onReset: () => void;
}

const LANGUAGES = [
  { label: "All Languages", value: "all" },
  { label: "Tamil (தமிழ்)", value: "tamil" },
  { label: "English", value: "english" },
  { label: "Hindi (हिंदी)", value: "hindi" },
  { label: "Telugu (తెలుగు)", value: "telugu" },
  { label: "Malayalam (മലയാളം)", value: "malayalam" },
  { label: "Korean (한국어)", value: "korean" },
  { label: "Japanese (日本語)", value: "japanese" },
  { label: "Spanish", value: "spanish" },
  { label: "German", value: "german" },
];

const STATUSES = [
  { label: "All Statuses", value: "all" },
  { label: "Ongoing / Returning", value: "running" },
  { label: "Ended / Completed", value: "ended" },
];

const YEARS = ["all", "2026", "2025", "2024", "2023", "2022", "2021", "2020", "2019", "2018"];

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  genre,
  language,
  status,
  year,
  onFilterChange,
  onReset,
}) => {
  const hasActiveFilters =
    genre !== "all" || language !== "all" || status !== "all" || year !== "all";

  return (
    <div className="space-y-4 p-4 md:p-6 rounded-2xl bg-slate-900/40 border border-white/10 backdrop-blur-xl">
      {/* Category Pills */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">
            Browse by Genre (10 Main Categories)
          </span>
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 font-semibold transition-colors"
            >
              <RotateCcw size={12} />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => onFilterChange({ genre: "all" })}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
              genre === "all"
                ? "bg-primary text-white border-primary shadow-glow-violet"
                : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
            }`}
          >
            All Genres
          </button>
          {MAIN_CATEGORIES.map((cat) => {
            const isActive = genre.toLowerCase() === cat.slug;
            return (
              <button
                key={cat.slug}
                onClick={() => onFilterChange({ genre: cat.slug })}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                  isActive
                    ? "bg-primary text-white border-primary shadow-glow-violet"
                    : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dropdown Filters Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/5">
        {/* Language */}
        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Audio / Original Language
          </label>
          <select
            value={language}
            onChange={(e) => onFilterChange({ language: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs font-medium focus:outline-none focus:border-primary"
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Series Status
          </label>
          <select
            value={status}
            onChange={(e) => onFilterChange({ status: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs font-medium focus:outline-none focus:border-primary"
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Release Year */}
        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Release Year
          </label>
          <select
            value={year}
            onChange={(e) => onFilterChange({ year: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs font-medium focus:outline-none focus:border-primary"
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y === "all" ? "All Years" : y}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
