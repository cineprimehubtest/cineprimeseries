import React from "react";
import type { Metadata } from "next";
import { getTrending } from "@/lib/seriesService";
import { SeriesGrid } from "@/components/series/SeriesGrid";
import Link from "next/link";
import { ChevronLeft, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "Trending TV Series — CinePrimeSeries",
  description: "Discover currently popular and trending TV series from across the world.",
};

export const revalidate = 1800;

export default async function TrendingPage() {
  const trending = await getTrending();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Link href="/" className="hover:text-white transition-colors flex items-center gap-1">
          <ChevronLeft size={14} />
          <span>Home</span>
        </Link>
        <span>/</span>
        <span className="text-slate-200 font-semibold">Trending Series</span>
      </div>

      <div className="p-6 md:p-8 rounded-3xl bg-slate-900/40 border border-white/10 backdrop-blur-xl shadow-glass space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 text-primary-light border border-primary/30 text-xs font-semibold">
          <TrendingUp size={13} />
          <span>Worldwide Popularity</span>
        </div>
        <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight">
          Trending TV Series
        </h1>
        <p className="text-xs md:text-sm text-slate-400 max-w-xl">
          The most watched and talked-about television and web series across the globe this week.
        </p>
      </div>

      <SeriesGrid series={trending} />
    </div>
  );
}
