"use client";

import React, { useState, useEffect, Suspense, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SearchBar } from "@/components/search/SearchBar";
import { SearchFilters } from "@/components/search/SearchFilters";
import { SeriesGrid } from "@/components/series/SeriesGrid";
import { LeechedFileCard } from "@/components/series/LeechedFileCard";
import { Series, LeechedFileItem } from "@/types";
import { Search as SearchIcon, FileText, LayoutGrid } from "lucide-react";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialQuery = searchParams.get("q") || "";
  const initialGenre = searchParams.get("genre") || "all";
  const initialLanguage = searchParams.get("language") || "all";
  const initialCountry = searchParams.get("country") || "all";
  const initialStatus = searchParams.get("status") || "all";
  const initialYear = searchParams.get("year") || "all";

  const [query, setQuery] = useState(initialQuery);
  const [genre, setGenre] = useState(initialGenre);
  const [language, setLanguage] = useState(initialLanguage);
  const [status, setStatus] = useState(initialStatus);
  const [year, setYear] = useState(initialYear);
  const [viewMode, setViewMode] = useState<"files" | "series">("files");

  const [results, setResults] = useState<Series[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Sync state with URL query parameters
  const updateUrl = (newParams: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([k, v]) => {
      if (!v || v === "all") {
        params.delete(k);
      } else {
        params.set(k, v);
      }
    });
    router.push(`/search?${params.toString()}`);
  };

  const handleFilterChange = (filters: {
    genre?: string;
    language?: string;
    status?: string;
    year?: string;
  }) => {
    if (filters.genre !== undefined) setGenre(filters.genre);
    if (filters.language !== undefined) setLanguage(filters.language);
    if (filters.status !== undefined) setStatus(filters.status);
    if (filters.year !== undefined) setYear(filters.year);

    updateUrl({
      q: query,
      genre: filters.genre !== undefined ? filters.genre : genre,
      language: filters.language !== undefined ? filters.language : language,
      status: filters.status !== undefined ? filters.status : status,
      year: filters.year !== undefined ? filters.year : year,
    });
  };

  const handleReset = () => {
    setQuery("");
    setGenre("all");
    setLanguage("all");
    setStatus("all");
    setYear("all");
    router.push("/search");
  };

  const handleSearchSubmit = (newQuery: string) => {
    setQuery(newQuery);
    updateUrl({ q: newQuery, genre, language, status, year });
  };

  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);

    const fetchResults = async () => {
      try {
        const params = new URLSearchParams();
        if (query) params.set("q", query);
        if (genre !== "all") params.set("genre", genre);
        if (language !== "all") params.set("language", language);
        if (initialCountry !== "all") params.set("country", initialCountry);
        if (status !== "all") params.set("status", status);
        if (year !== "all") params.set("year", year);

        const res = await fetch(`/api/search?${params.toString()}`);
        if (res.ok && !isCancelled) {
          const data = await res.json();
          setResults(data.results || []);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    };

    fetchResults();

    return () => {
      isCancelled = true;
    };
  }, [query, genre, language, initialCountry, status, year]);

  // Extract all matching leeched files
  const matchingFiles: LeechedFileItem[] = useMemo(() => {
    const q = query.toLowerCase().trim();
    const files: LeechedFileItem[] = [];

    results.forEach((s) => {
      (s.files || []).forEach((f) => {
        if (!q) {
          files.push(f);
        } else {
          const matches =
            f.fileName.toLowerCase().includes(q) ||
            f.seriesTitle.toLowerCase().includes(q) ||
            f.quality.toLowerCase().includes(q) ||
            (f.codec && f.codec.toLowerCase().includes(q)) ||
            f.languages.some((l) => l.toLowerCase().includes(q)) ||
            (f.year && f.year.includes(q));
          if (matches) {
            files.push(f);
          } else {
            // Include file if the series itself matched
            files.push(f);
          }
        }
      });
    });

    return files;
  }, [results, query]);

  // Map of series cast
  const seriesCastMap = useMemo(() => {
    const map = new Map();
    results.forEach((s) => {
      map.set(s.id, s.cast || []);
      map.set(s.slug, s.cast || []);
    });
    return map;
  }, [results]);

  return (
    <div className="space-y-6 pb-12">
      {/* Search Header */}
      <div className="flex flex-col gap-4">
        <div>
          <span className="text-[10px] font-bold tracking-[0.25em] text-amber-400 uppercase block mb-1">
            S E A R C H   R E G I S T R Y
          </span>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <SearchIcon className="text-amber-400" size={26} />
            <span>Search TV Series &amp; Files</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Explore strictly leeched TV series files, confirmed multi-audio tracks, and direct Telegram links.
          </p>
        </div>

        <SearchBar
          initialQuery={query}
          onSearch={handleSearchSubmit}
          autoFocus={!query}
          showSuggestions={false}
        />

        {/* Filter Controls */}
        <SearchFilters
          genre={genre}
          language={language}
          status={status}
          year={year}
          onFilterChange={handleFilterChange}
          onReset={handleReset}
        />
      </div>

      {/* Results Controls & View Toggle matching Screenshot 1 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-b border-white/[0.08] pb-3">
        <span className="text-xs md:text-sm font-semibold text-slate-300">
          {isLoading
            ? "Searching catalogue..."
            : `Found ${matchingFiles.length} files across ${results.length} series`}
        </span>

        {/* Toggle between Files list and Series Grid */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-[#111422] p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setViewMode("files")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === "files"
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <FileText size={13} />
            <span>Files Feed ({matchingFiles.length})</span>
          </button>
          <button
            onClick={() => setViewMode("series")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === "series"
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <LayoutGrid size={13} />
            <span>Series Posters ({results.length})</span>
          </button>
        </div>
      </div>

      {/* Content View */}
      {viewMode === "files" ? (
        <div className="space-y-3">
          {matchingFiles.length > 0 ? (
            <>
              {matchingFiles.map((file) => (
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
            </>
          ) : (
            <div className="py-16 text-center rounded-2xl bg-white/[0.02] border border-white/5 p-6">
              <p className="text-sm font-semibold text-slate-300">
                No leeched files matched your query.
              </p>
              <button
                onClick={handleReset}
                className="mt-3 text-xs text-amber-400 hover:underline font-bold"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Grid of Series Posters */
        <SeriesGrid
          series={results}
          isLoading={isLoading}
          emptyMessage={`No TV series matched your current query or filters. Try adjusting the genre, year, or spelling.`}
        />
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-slate-400 text-sm">
          Loading series search...
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
