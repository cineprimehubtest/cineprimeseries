import React from "react";
import type { Metadata } from "next";
import { getNewReleases } from "@/lib/seriesService";
import { SeriesGrid } from "@/components/series/SeriesGrid";
import Link from "next/link";
import { ChevronLeft, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "New & Premiered TV Series — CinePrimeSeries",
  description: "Browse the newest TV series releases, new season premieres, and recently added shows.",
};

export const revalidate = 1800;

export default async function NewSeriesPage() {
  const newSeries = await getNewReleases();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Link href="/" className="hover:text-white transition-colors flex items-center gap-1">
          <ChevronLeft size={14} />
          <span>Home</span>
        </Link>
        <span>/</span>
        <span className="text-slate-200 font-semibold">New Series</span>
      </div>

      <div className="p-6 md:p-8 rounded-3xl bg-slate-900/40 border border-white/10 backdrop-blur-xl shadow-glass space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/15 text-accent-light border border-accent/30 text-xs font-semibold">
          <Sparkles size={13} />
          <span>Fresh Airings</span>
        </div>
        <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight">
          Newly Premiered TV Series
        </h1>
        <p className="text-xs md:text-sm text-slate-400 max-w-xl">
          Fresh season premieres, brand-new pilot episodes, and recently indexed television series.
        </p>
      </div>

      <SeriesGrid series={newSeries} />
    </div>
  );
}
