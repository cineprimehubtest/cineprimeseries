import React from "react";
import type { Metadata } from "next";
import { getTopRated } from "@/lib/seriesService";
import { SeriesGrid } from "@/components/series/SeriesGrid";
import Link from "next/link";
import { ChevronLeft, Award } from "lucide-react";

export const metadata: Metadata = {
  title: "Top Rated TV Series — CinePrimeSeries",
  description: "Browse the highest rated TV series of all time ranked by verified reviews.",
};

export const revalidate = 1800;

export default async function TopRatedPage() {
  const topRated = await getTopRated();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Link href="/" className="hover:text-white transition-colors flex items-center gap-1">
          <ChevronLeft size={14} />
          <span>Home</span>
        </Link>
        <span>/</span>
        <span className="text-slate-200 font-semibold">Top Rated Series</span>
      </div>

      <div className="p-6 md:p-8 rounded-3xl bg-slate-900/40 border border-white/10 backdrop-blur-xl shadow-glass space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-semibold">
          <Award size={13} />
          <span>Masterpieces &amp; High Ratings</span>
        </div>
        <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight">
          Top Rated TV Series
        </h1>
        <p className="text-xs md:text-sm text-slate-400 max-w-xl">
          Critically acclaimed television masterpieces ranked according to verified audience ratings.
        </p>
      </div>

      <SeriesGrid series={topRated} />
    </div>
  );
}
