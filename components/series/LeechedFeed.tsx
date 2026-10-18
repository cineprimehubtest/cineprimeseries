"use client";

import React, { useState, useMemo } from "react";
import { LeechedFileItem, Series } from "@/types";
import { LeechedFileCard } from "./LeechedFileCard";
import { Sparkles, Layers, CheckCircle2 } from "lucide-react";

interface LeechedFeedProps {
  initialFiles: LeechedFileItem[];
  seriesList: Series[];
}

export const LeechedFeed: React.FC<LeechedFeedProps> = ({
  initialFiles,
  seriesList,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [selectedQuality, setSelectedQuality] = useState<string>("all");

  // Map series slug/id to cast list
  const seriesCastMap = useMemo(() => {
    const map = new Map();
    seriesList.forEach((s) => {
      map.set(s.id, s.cast || []);
      map.set(s.slug, s.cast || []);
    });
    return map;
  }, [seriesList]);

  // Unique series titles for filter buttons
  const uniqueSeriesTitles = useMemo(() => {
    const set = new Set<string>();
    initialFiles.forEach((f) => set.add(f.seriesTitle));
    return Array.from(set);
  }, [initialFiles]);

  // Filtered files
  const filteredFiles = useMemo(() => {
    return initialFiles.filter((file) => {
      if (selectedFilter !== "all" && file.seriesTitle !== selectedFilter) {
        return false;
      }
      if (selectedQuality !== "all" && file.quality.toUpperCase() !== selectedQuality.toUpperCase()) {
        return false;
      }
      return true;
    });
  }, [initialFiles, selectedFilter, selectedQuality]);

  return (
    <section className="space-y-6 pt-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div>
          <span className="text-[11px] font-bold tracking-[0.25em] text-amber-400/90 uppercase block mb-1">
            L E E C H E D   F I L E S
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Direct Telegram Downloads
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Showing only verified OTT seasonal series files with confirmed multi-audio tracks.
          </p>
        </div>

        {/* Quick count pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs font-semibold">
            {filteredFiles.length} {filteredFiles.length === 1 ? "File" : "Files"} Ready
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => {
            setSelectedFilter("all");
            setSelectedQuality("all");
          }}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${
            selectedFilter === "all" && selectedQuality === "all"
              ? "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-glow-cyan"
              : "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
          }`}
        >
          All Files ({initialFiles.length})
        </button>

        {uniqueSeriesTitles.map((title) => (
          <button
            key={title}
            onClick={() => setSelectedFilter(selectedFilter === title ? "all" : title)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${
              selectedFilter === title
                ? "bg-amber-400 text-slate-950 shadow-glow-cyan"
                : "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
            }`}
          >
            {title}
          </button>
        ))}

        {/* Quality shortcuts */}
        <div className="h-4 w-[1px] bg-white/10 mx-1 hidden sm:block" />

        {["1080P", "720P", "480P"].map((q) => (
          <button
            key={q}
            onClick={() => setSelectedQuality(selectedQuality === q ? "all" : q)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${
              selectedQuality === q
                ? "bg-orange-500 text-white"
                : "bg-white/5 hover:bg-white/10 text-slate-400 border border-white/10"
            }`}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Files Feed matching Screenshot 1 */}
      {filteredFiles.length > 0 ? (
        <div className="space-y-3">
          {filteredFiles.map((file) => (
            <LeechedFileCard
              key={file.id}
              file={file}
              cast={seriesCastMap.get(file.seriesId) || seriesCastMap.get(file.seriesSlug) || []}
            />
          ))}

          {/* End of Feed Footer matching Screenshot 1 */}
          <div className="pt-8 pb-4 text-center">
            <p className="text-xs text-slate-500 tracking-wider">
              You&apos;ve reached the end of the feed.
            </p>
          </div>
        </div>
      ) : (
        <div className="py-16 text-center rounded-2xl bg-white/[0.02] border border-white/5 p-6">
          <p className="text-sm font-semibold text-slate-300">
            No files found matching the selected filter.
          </p>
          <button
            onClick={() => {
              setSelectedFilter("all");
              setSelectedQuality("all");
            }}
            className="mt-3 text-xs text-amber-400 hover:underline font-bold"
          >
            Reset Filters
          </button>
        </div>
      )}
    </section>
  );
};
