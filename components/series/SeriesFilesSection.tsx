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

  // Filter and sort files
  const filteredAndSortedFiles = useMemo(() => {
    let result = files.filter((f) => {
      // Ignore stickers or non-files
      if (f.fileName.includes("File #") || f.fileName === "👇") return false;

      const isComb = f.fileName.toLowerCase().includes("combined") || /ep\s*\(/i.test(f.fileName);
      if (typeFilter === "combined" && !isComb) return false;
      if (typeFilter === "single" && isComb) return false;

      if (qualityFilter !== "all" && f.quality.toUpperCase() !== qualityFilter.toUpperCase()) {
        return false;
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

    // Sort order
    return result.sort((a, b) => {
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
  }, [files, sortOrder, typeFilter, qualityFilter, searchQuery]);

  // Counts for tabs
  const combinedCount = useMemo(
    () => files.filter((f) => f.fileName.toLowerCase().includes("combined") || /ep\s*\(/i.test(f.fileName)).length,
    [files]
  );
  const singleCount = useMemo(
    () => files.filter((f) => !f.fileName.toLowerCase().includes("combined") && !/ep\s*\(/i.test(f.fileName) && !f.fileName.includes("File #")).length,
    [files]
  );

  return (
    <div className="p-5 sm:p-7 rounded-3xl bg-slate-900/40 border border-white/10 backdrop-blur-xl space-y-5">
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
              {files.filter((f) => !f.fileName.includes("File #")).length}
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
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden sm:inline">Quality:</span>
          {["all", "1080P", "720P", "480P"].map((q) => (
            <button
              key={q}
              onClick={() => setQualityFilter(q)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase transition-all cursor-pointer ${
                qualityFilter === q
                  ? "bg-amber-400/20 border border-amber-400 text-amber-300"
                  : "bg-white/5 hover:bg-white/10 text-slate-400 border border-white/5"
              }`}
            >
              {q === "all" ? "All Qualities" : q}
            </button>
          ))}
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
