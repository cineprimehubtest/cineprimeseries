"use client";

import React from "react";
import { Season } from "@/types";

interface SeasonTabsProps {
  seasons: Season[];
  activeSeasonNumber: number;
  onSelectSeason: (seasonNumber: number) => void;
}

export const SeasonTabs: React.FC<SeasonTabsProps> = ({
  seasons,
  activeSeasonNumber,
  onSelectSeason,
}) => {
  if (!seasons || seasons.length <= 1) return null;

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
      {seasons.map((s) => {
        const isActive = s.seasonNumber === activeSeasonNumber;
        return (
          <button
            key={s.seasonNumber}
            onClick={() => onSelectSeason(s.seasonNumber)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 border ${
              isActive
                ? "bg-primary text-white border-primary shadow-glow-violet"
                : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white"
            }`}
          >
            {s.title || `Season ${s.seasonNumber}`}
            {s.episodeCount ? ` (${s.episodeCount} eps)` : ""}
          </button>
        );
      })}
    </div>
  );
};
