"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Series } from "@/types";
import { Star, Play, Info, ArrowRight, Calendar, Globe } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { TrailerModal } from "@/components/trailer/TrailerModal";
import { SeriesInfoModal } from "./SeriesInfoModal";

interface SeriesHeroProps {
  series: Series;
}

export const SeriesHero: React.FC<SeriesHeroProps> = ({ series }) => {
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const releaseYear = series.firstAirDate ? series.firstAirDate.substring(0, 4) : "TBA";

  return (
    <div className="relative w-full rounded-3xl overflow-hidden bg-slate-950 border border-white/10 shadow-2xl mb-12 min-h-[460px] md:min-h-[540px] flex items-end">
      {/* Background Image */}
      {series.backdropUrl || series.posterUrl ? (
        <Image
          src={series.backdropUrl || series.posterUrl!}
          alt={series.title}
          fill
          priority
          sizes="100vw"
          className="object-cover object-top brightness-[0.75] filter saturate-110"
        />
      ) : null}

      {/* Cinematic Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent" />

      {/* Hero Content */}
      <div className="relative z-10 p-6 md:p-10 w-full flex flex-col justify-between min-h-[420px] md:min-h-[480px]">
        {/* Top-left: FEATURED TODAY Pill */}
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 rounded-full bg-[#111422]/90 border border-white/15 text-slate-300 text-[11px] font-bold tracking-widest uppercase backdrop-blur-md">
            FEATURED TODAY
          </span>

          {series.trailerVideoId && (
            <button
              onClick={() => setIsTrailerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md border border-white/10 transition-colors"
            >
              <Play size={12} className="fill-current text-amber-400" />
              <span>Watch Trailer</span>
            </button>
          )}
        </div>

        {/* Main Info */}
        <div className="max-w-2xl space-y-3 my-auto pt-6">
          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight leading-tight drop-shadow-2xl">
            {series.title}
          </h1>

          {/* Rating and Year */}
          <div className="flex items-center gap-2.5 text-sm font-semibold">
            {series.rating && (
              <span className="flex items-center gap-1 text-amber-400 font-bold">
                <Star size={14} className="fill-current text-amber-400" />
                <span>{series.rating}</span>
              </span>
            )}
            <span className="text-slate-300 font-medium">{releaseYear}</span>
            {series.originalLanguage && (
              <>
                <span className="text-slate-500">•</span>
                <span className="text-accent-light uppercase text-xs tracking-wider font-bold">
                  {series.originalLanguage}
                </span>
              </>
            )}
          </div>

          {/* Overview */}
          <p className="text-xs sm:text-sm md:text-base text-slate-300/90 line-clamp-3 leading-relaxed">
            {series.overview}
          </p>
        </div>

        {/* Bottom row: Genre pills on left, Actions on right */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
          {/* Genre Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {series.genres.map((g) => (
              <span
                key={g}
                className="px-3 py-1 rounded-full bg-[#111422]/80 border border-white/10 text-slate-300 text-xs font-medium hover:border-amber-400/40 hover:text-white transition-colors"
              >
                {g}
              </span>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsInfoOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/15 text-xs font-semibold backdrop-blur-md transition-all active:scale-95"
            >
              <Info size={14} className="text-amber-300" />
              <span>Details</span>
            </button>

            {series.downloadUrl && (
              <a
                href={series.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold text-xs shadow-glow-cyan transition-all active:scale-95"
              >
                <ArrowRight size={14} />
                <span>Get Files</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Trailer Modal */}
      <TrailerModal
        isOpen={isTrailerOpen}
        onClose={() => setIsTrailerOpen(false)}
        title={series.title}
        videoId={series.trailerVideoId}
      />

      {/* Info Modal */}
      <SeriesInfoModal
        series={series}
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
      />
    </div>
  );
};
