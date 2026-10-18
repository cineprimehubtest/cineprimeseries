"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Series } from "@/types";
import { Star, Play, Info, ArrowRight, ChevronLeft, ChevronRight, Tv } from "lucide-react";
import { TrailerModal } from "@/components/trailer/TrailerModal";
import { SeriesInfoModal } from "./SeriesInfoModal";

interface SeriesHeroProps {
  seriesList: Series[];
}

export const SeriesHero: React.FC<SeriesHeroProps> = ({ seriesList = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const router = useRouter();

  if (!seriesList || seriesList.length === 0) return null;

  // Current active series in slideshow
  const series = seriesList[currentIndex] || seriesList[0];
  const releaseYear = series.firstAirDate ? series.firstAirDate.substring(0, 4) : "2026";

  // Auto-advance slideshow every 7 seconds
  useEffect(() => {
    if (seriesList.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % seriesList.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [seriesList.length]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + seriesList.length) % seriesList.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % seriesList.length);
  };

  const handleRedirectToSearch = () => {
    router.push(`/search?q=${encodeURIComponent(series.title)}`);
  };

  return (
    <>
      <div className="relative w-full rounded-3xl overflow-hidden bg-[#070911] border border-white/[0.08] shadow-2xl transition-all duration-500 min-h-[440px] md:min-h-[480px] flex items-center group">
        {/* Cinematic Backdrop Image */}
        {series.backdropUrl || series.posterUrl ? (
          <Image
            key={series.id + "-backdrop"}
            src={series.backdropUrl || series.posterUrl!}
            alt={series.title}
            fill
            priority
            sizes="100vw"
            className="object-cover object-top brightness-[0.7] filter saturate-105 transition-all duration-700 ease-out"
          />
        ) : null}

        {/* Gradient Overlays matching cineplexweb */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#070911] via-[#070911]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#070911] via-[#070911]/60 to-transparent" />

        {/* Content: Both Backdrop + Portrait Poster Image in Slideshow */}
        <div className="relative z-10 p-5 sm:p-8 md:p-10 w-full flex flex-col md:flex-row items-center md:items-end gap-6 justify-between">
          
          {/* Left: Floating Portrait Poster Image */}
          <div
            onClick={handleRedirectToSearch}
            className="relative w-28 sm:w-36 md:w-44 aspect-[2/3] rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl shrink-0 cursor-pointer group/poster hidden sm:block bg-slate-900"
          >
            {series.posterUrl ? (
              <Image
                key={series.id + "-poster"}
                src={series.posterUrl}
                alt={series.title}
                fill
                priority
                className="object-cover group-hover/poster:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 144px, 176px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500">
                <Tv size={36} />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/poster:opacity-100 transition-opacity flex items-end p-2 justify-center">
              <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                Click for Files
              </span>
            </div>
          </div>

          {/* Center/Right: Details matching Image 3 */}
          <div className="flex-1 space-y-3.5 max-w-2xl">
            {/* Top Row: FEATURED TODAY Pill + Trailer */}
            <div className="flex items-center justify-between gap-2">
              <span className="px-3 py-1 rounded-full bg-[#111422]/90 border border-white/15 text-slate-300 text-[11px] font-bold tracking-widest uppercase backdrop-blur-md">
                FEATURED TODAY
              </span>

              {series.trailerVideoId && (
                <button
                  onClick={() => setIsTrailerOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md border border-white/10 transition-colors"
                >
                  <Play size={11} className="fill-current text-amber-400" />
                  <span>Trailer</span>
                </button>
              )}
            </div>

            {/* Big Serif Title */}
            <h1
              onClick={handleRedirectToSearch}
              className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight leading-tight drop-shadow-2xl cursor-pointer hover:text-amber-300 transition-colors"
            >
              {series.title}
            </h1>

            {/* Rating, Year, Status */}
            <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold">
              {series.rating && (
                <span className="flex items-center gap-1 text-amber-400 font-bold">
                  <Star size={13} className="fill-current text-amber-400" />
                  <span>{series.rating}</span>
                </span>
              )}
              <span className="text-slate-300 font-medium">{releaseYear}</span>
              {series.numberOfSeasons && (
                <>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-300">{series.numberOfSeasons} Seasons</span>
                </>
              )}
              {series.originalLanguage && (
                <>
                  <span className="text-slate-500">•</span>
                  <span className="text-accent-light uppercase text-xs tracking-wider font-bold">
                    {series.originalLanguage}
                  </span>
                </>
              )}
            </div>

            {/* Overview Snippet */}
            <p className="text-xs sm:text-sm text-slate-300/90 line-clamp-2 md:line-clamp-3 leading-relaxed">
              {series.overview}
            </p>

            {/* Bottom Row: Genre pills & Action button to search files */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              {/* Category Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {series.genres.slice(0, 3).map((g) => (
                  <span
                    key={g}
                    className="px-3 py-1 rounded-full bg-[#111422]/80 border border-white/10 text-slate-300 text-xs font-medium hover:border-amber-400/40 hover:text-white transition-colors"
                  >
                    {g}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsInfoOpen(true)}
                  aria-label="View Series Details"
                  className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white border border-white/15 backdrop-blur-md transition-colors"
                  title="View Series Info"
                >
                  <Info size={16} className="text-amber-300" />
                </button>

                {/* Main Button: Redirects to Search Bar to show series files */}
                <button
                  onClick={handleRedirectToSearch}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold text-xs sm:text-sm tracking-wide shadow-glow-cyan transition-all active:scale-95"
                >
                  <span>View Files &amp; Downloads</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Slideshow Navigation Arrows */}
        {seriesList.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              aria-label="Previous series"
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white/80 hover:text-white border border-white/10 backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 z-20"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next series"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white/80 hover:text-white border border-white/10 backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 z-20"
            >
              <ChevronRight size={18} />
            </button>

            {/* Slideshow Indicator Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
              {seriesList.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(idx);
                  }}
                  aria-label={`Slide to ${s.title}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentIndex
                      ? "w-6 bg-gradient-to-r from-amber-400 to-orange-500"
                      : "w-2 bg-white/30 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Info Modal matching Image 5 (no scrolling, clean, with redirect button) */}
      <SeriesInfoModal
        series={series}
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
      />

      {/* Official YouTube Trailer Modal */}
      <TrailerModal
        isOpen={isTrailerOpen}
        onClose={() => setIsTrailerOpen(false)}
        title={series.title}
        videoId={series.trailerVideoId}
      />
    </>
  );
};
