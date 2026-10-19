"use client";

import React, { useState, useMemo } from "react";
import { LeechedFileItem, CastMember } from "@/types";
import { LeechedFileCard } from "./LeechedFileCard";
import { ArrowDownUp, Layers, Film, Search, X, Check, Filter } from "lucide-react";

interface SeriesFilesSectionProps {
  files: LeechedFileItem[];
  cast?: CastMember[];
}

function getBatchInfo(file: LeechedFileItem) {
  const name = file.fileName;
  // Match combined EP (start-end)
  const combMatch = name.match(/EP\s*\(\s*(\d+)\s*[- ]\s*(\d+)\s*\)/i);
  if (combMatch) {
    const endEp = parseInt(combMatch[2], 10);
    const qRank = file.quality === "1080P" ? 3 : file.quality === "720P" ? 2 : 1;
    return {
      batchNum: endEp,
      isCombined: true,
      epNum: endEp,
      subRank: 10 + qRank,
    };
  }
  // Match single episode S03Exx
  const epMatch = name.match(/S\d+E(\d+)/i);
  if (epMatch) {
    const epNum = parseInt(epMatch[1], 10);
    const batchNum = Math.ceil(epNum / 4) * 4;
    return {
      batchNum,
      isCombined: false,
      epNum,
      subRank: epNum,
    };
  }
  return { batchNum: 0, isCombined: false, epNum: 0, subRank: 0 };
}

export const SeriesFilesSection: React.FC<SeriesFilesSectionProps> = ({ files = [], cast = [] }) => {
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest");
  const [typeFilter, setTypeFilter] = useState<"all" | "combined" | "single">("all");
  const [qualityFilter, setQualityFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Extract all available seasons in these files
  const availableSeasons = useMemo(() => {
    const sSet = new Set<number>();
    files.forEach((f) => {
      const match = f.fileName.match(/S0?(\d+)/i);
      if (match) sSet.add(parseInt(match[1], 10));
    });
    return Array.from(sSet).sort((a, b) => b - a);
  }, [files]);

  // Selected season: defaults to latest season if multiple seasons exist
  const [selectedSeason, setSelectedSeason] = useState<number | "all">(() => {
    const sSet = new Set<number>();
    files.forEach((f) => {
      const match = f.fileName.match(/S0?(\d+)/i);
      if (match) sSet.add(parseInt(match[1], 10));
    });
    const sorted = Array.from(sSet).sort((a, b) => b - a);
    return sorted.length > 1 ? sorted[0] : "all";
  });

  // Files for currently active season (deduplicated)
  const seasonFiles = useMemo(() => {
    const raw = selectedSeason === "all" ? files : files.filter((f) => {
      const m = f.fileName.match(/S0?(\d+)/i);
      return m && parseInt(m[1], 10) === selectedSeason;
    });

    const seen = new Set<string>();
    const unique: LeechedFileItem[] = [];
    for (const f of raw) {
      const key = `${f.fileName}___${f.sizeFormatted || ""}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(f);
      }
    }
    return unique;
  }, [files, selectedSeason]);

  // Extract all available qualities present in this season (ordered from UHD to SD)
  const availableQualities = useMemo(() => {
    const qOrder = ["4K", "1080P", "720P", "480P"];
    const found = new Set<string>();
    seasonFiles.forEach((f) => {
      const fq = (f.quality || "").toUpperCase();
      const fn = (f.fileName || "").toUpperCase();
      if (fq.includes("4K") || fq.includes("2160") || fn.includes("4K") || fn.includes("2160")) {
        found.add("4K");
      } else if (fq.includes("1080") || fn.includes("1080")) {
        found.add("1080P");
      } else if (fq.includes("720") || fn.includes("720")) {
        found.add("720P");
      } else if (fq.includes("480") || fn.includes("480")) {
        found.add("480P");
      }
    });
    return qOrder.filter((q) => found.has(q));
  }, [seasonFiles]);

  // Filter, deduplicate, and sort files
  const filteredAndSortedFiles = useMemo(() => {
    let result = files.filter((f) => {
      // Ignore stickers or non-files
      if (f.fileName.includes("File #") || f.fileName === "👇") return false;

      // Filter by season
      if (selectedSeason !== "all") {
        const match = f.fileName.match(/S0?(\d+)/i);
        const sNum = match ? parseInt(match[1], 10) : 1;
        if (sNum !== selectedSeason) return false;
      }

      const isComb = f.fileName.toLowerCase().includes("combined") || /ep\s*\(/i.test(f.fileName);
      if (typeFilter === "combined" && !isComb) return false;
      if (typeFilter === "single" && isComb) return false;

      if (qualityFilter !== "all") {
        const qf = qualityFilter.toUpperCase();
        const fq = (f.quality || "").toUpperCase();
        const fn = (f.fileName || "").toUpperCase();
        if (qf === "4K") {
          const is4K = fq.includes("4K") || fq.includes("2160") || fn.includes("4K") || fn.includes("2160");
          if (!is4K) return false;
        } else if (qf === "1080P") {
          const is1080 = fq.includes("1080") || fn.includes("1080");
          if (!is1080) return false;
        } else if (qf === "720P") {
          const is720 = fq.includes("720") || fn.includes("720");
          if (!is720) return false;
        } else if (qf === "480P") {
          const is480 = fq.includes("480") || fn.includes("480");
          if (!is480) return false;
        } else if (!fq.includes(qf) && !fn.includes(qf)) {
          return false;
        }
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = f.fileName.toLowerCase().includes(q);
        const matchesQuality = f.quality.toLowerCase().includes(q);
        const matchesCodec = (f.codec || "").toLowerCase().includes(q);
        return matchesName || matchesQuality || matchesCodec;
      }

      return true;
    });

    // Deduplicate by fileName + sizeFormatted
    const seen = new Set<string>();
    const uniqueResult: LeechedFileItem[] = [];
    for (const item of result) {
      const key = `${item.fileName}___${item.sizeFormatted || ""}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueResult.push(item);
      }
    }

    // Sort order
    return uniqueResult.sort((a, b) => {
      const infoA = getBatchInfo(a);
      const infoB = getBatchInfo(b);

      if (sortOrder === "latest") {
        // Highest batch first (e.g. 48 down to 04)
        if (infoA.batchNum !== infoB.batchNum) {
          return infoB.batchNum - infoA.batchNum;
        }
        // Within batch: Combined first (1080P > 720P > 480P), then Single Episodes (48 > 47 > 46 > 45)
        if (infoA.isCombined && !infoB.isCombined) return -1;
        if (!infoA.isCombined && infoB.isCombined) return 1;
        return infoB.subRank - infoA.subRank;
      } else {
        // Lowest batch first (e.g. 04 up to 48)
        if (infoA.batchNum !== infoB.batchNum) {
          return infoA.batchNum - infoB.batchNum;
        }
        // Within batch: Single Episodes first (01 > 02 > 03 > 04), then Combined (1080P > 720P > 480P)
        if (infoA.isCombined && !infoB.isCombined) return 1;
        if (!infoA.isCombined && infoB.isCombined) return -1;
        return infoA.subRank - infoB.subRank;
      }
    });
  }, [files, selectedSeason, sortOrder, typeFilter, qualityFilter, searchQuery]);

  const combinedCount = useMemo(
    () => seasonFiles.filter((f) => f.fileName.toLowerCase().includes("combined") || /ep\s*\(/i.test(f.fileName)).length,
    [seasonFiles]
  );
  const singleCount = useMemo(
    () => seasonFiles.filter((f) => !f.fileName.toLowerCase().includes("combined") && !/ep\s*\(/i.test(f.fileName) && !f.fileName.includes("File #")).length,
    [seasonFiles]
  );

  return (
    <div id="downloads-section" className="p-5 sm:p-7 rounded-3xl bg-slate-900/40 border border-white/10 backdrop-blur-xl space-y-5 scroll-mt-24">
      {/* Top Header & Sort Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <span className="text-[10px] font-bold tracking-[0.25em] text-amber-400 uppercase block mb-1">
            A V A I L A B L E   D O W N L O A D S
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight flex items-center gap-2">
            <span>Available Files</span>
            <span className="text-sm font-sans font-semibold text-amber-400/90 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
              {filteredAndSortedFiles.length} Releases
            </span>
          </h2>
        </div>

        {/* Shortlist / Order Toggle Button (Latest → 1st vs 1st → Latest) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSortOrder(sortOrder === "latest" ? "oldest" : "latest")}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-bold tracking-wide transition-all shadow-sm active:scale-95 cursor-pointer"
            title="Toggle between Latest-to-1st and 1st-to-Latest"
          >
            <ArrowDownUp size={14} className="text-amber-400" />
            <span>
              {sortOrder === "latest" ? "Order: Latest → 1st (Newest First)" : "Order: 1st → Latest (Oldest First)"}
            </span>
          </button>
        </div>
      </div>

      {/* Season Selector Tabs (Prominently separates Season 1 and Season 2) */}
      {availableSeasons.length > 1 && (
        <div className="flex flex-wrap items-center gap-2 p-2 rounded-2xl bg-white/[0.03] border border-white/10">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 pl-2 pr-1 flex items-center gap-1.5">
            <Layers size={14} className="text-amber-400" />
            <span>Season:</span>
          </span>

          {availableSeasons.map((sNum) => {
            const count = files.filter((f) => {
              const m = f.fileName.match(/S0?(\d+)/i);
              return m && parseInt(m[1], 10) === sNum;
            }).length;

            const isSelected = selectedSeason === sNum;

            return (
              <button
                key={sNum}
                onClick={() => setSelectedSeason(sNum)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black shadow-md scale-[1.02]"
                    : "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
                }`}
              >
                <span>Season {sNum}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isSelected ? "bg-black/25 text-slate-950 font-bold" : "bg-white/10 text-amber-300"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}

          <button
            onClick={() => setSelectedSeason("all")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedSeason === "all"
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black shadow-md"
                : "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
            }`}
          >
            <span>All Seasons</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                selectedSeason === "all" ? "bg-black/25 text-slate-950 font-bold" : "bg-white/10 text-slate-400"
              }`}
            >
              {files.length}
            </span>
          </button>
        </div>
      )}

      {/* Filter Toolbar: Type Pills + Quality Pills + Quick Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0c1220]/60 p-3 rounded-2xl border border-white/5">
        {/* Release Type Filter (All, Combined, Single) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setTypeFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              typeFilter === "all"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5"
            }`}
          >
            <span>All Releases</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${typeFilter === "all" ? "bg-black/20 text-slate-950 font-black" : "bg-white/10 text-slate-400"}`}>
              {seasonFiles.filter((f) => !f.fileName.includes("File #")).length}
            </span>
          </button>

          <button
            onClick={() => setTypeFilter("combined")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              typeFilter === "combined"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5"
            }`}
          >
            <Layers size={12} />
            <span>Combined Batches</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${typeFilter === "combined" ? "bg-black/20 text-slate-950 font-black" : "bg-white/10 text-slate-400"}`}>
              {combinedCount}
            </span>
          </button>

          <button
            onClick={() => setTypeFilter("single")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              typeFilter === "single"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5"
            }`}
          >
            <Film size={12} />
            <span>Single Episodes</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${typeFilter === "single" ? "bg-black/20 text-slate-950 font-black" : "bg-white/10 text-slate-400"}`}>
              {singleCount}
            </span>
          </button>
        </div>

        {/* Quality Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">Quality:</span>
          <button
            onClick={() => setQualityFilter("all")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase transition-all cursor-pointer ${
              qualityFilter === "all"
                ? "bg-amber-400/20 border border-amber-400 text-amber-300 shadow-sm"
                : "bg-white/5 hover:bg-white/10 text-slate-400 border border-white/5"
            }`}
          >
            All Qualities
          </button>
          {availableQualities.map((q) => {
            const count = seasonFiles.filter((f) => {
              const fq = (f.quality || "").toUpperCase();
              const fn = (f.fileName || "").toUpperCase();
              if (q === "4K") return fq.includes("4K") || fq.includes("2160") || fn.includes("4K") || fn.includes("2160");
              if (q === "1080P") return fq.includes("1080") || fn.includes("1080");
              if (q === "720P") return fq.includes("720") || fn.includes("720");
              if (q === "480P") return fq.includes("480") || fn.includes("480");
              return fq === q;
            }).length;

            return (
              <button
                key={q}
                onClick={() => setQualityFilter(q)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase transition-all cursor-pointer ${
                  qualityFilter === q
                    ? "bg-amber-400/20 border border-amber-400 text-amber-300 shadow-sm"
                    : "bg-white/5 hover:bg-white/10 text-slate-400 border border-white/5"
                }`}
              >
                <span>{q}</span>
                <span className="text-[9px] px-1 py-0.2 rounded-full bg-black/30 text-amber-200">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search input inside file section */}
        <div className="relative w-full sm:w-56">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search within files..."
            className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-slate-950/70 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/60"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Files Grid (Responsive 2-column on desktop, max-height with smooth scrolling) */}
      {filteredAndSortedFiles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[680px] overflow-y-auto pr-1">
          {filteredAndSortedFiles.map((file) => (
            <LeechedFileCard key={file.id} file={file} cast={cast} />
          ))}
        </div>
      ) : (
        <div className="p-8 text-center rounded-2xl bg-white/5 border border-white/10 space-y-2">
          <p className="text-sm text-slate-300">No episodes match your current filters.</p>
          <button
            onClick={() => {
              setTypeFilter("all");
              setQualityFilter("all");
              setSearchQuery("");
            }}
            className="px-4 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
