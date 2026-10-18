"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Series } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { TrailerModal } from "@/components/trailer/TrailerModal";
import { useToast } from "@/components/ui/Toast";
import {
  Star,
  Play,
  Send,
  Share2,
  Tv,
  ArrowRight,
  X,
  Search,
} from "lucide-react";

interface SeriesInfoModalProps {
  series: Series;
  isOpen: boolean;
  onClose: () => void;
}

export const SeriesInfoModal: React.FC<SeriesInfoModalProps> = ({
  series,
  isOpen,
  onClose,
}) => {
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  if (!series) return null;

  const releaseYear = series.firstAirDate ? series.firstAirDate.substring(0, 4) : "2026";

  const handleShare = async () => {
    const url = `${window.location.origin}/search?q=${encodeURIComponent(series.title)}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${series.title} - CinePrimeSeries`,
          text: `Check out ${series.title} on CinePrimeSeries!`,
          url,
        });
      } catch {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(url);
      showToast("Series link copied to clipboard!", "success");
    }
  };

  const handleViewFiles = () => {
    onClose();
    router.push(`/search?q=${encodeURIComponent(series.title)}`);
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} maxWidth="xl">
        <div className="space-y-4 -m-4 md:-m-6 pb-2">
          {/* Top Banner with Backdrop, Overlay & Action Controls */}
          <div className="relative h-44 sm:h-52 md:h-56 overflow-hidden bg-slate-950">
            {series.backdropUrl || series.posterUrl ? (
              <Image
                src={series.backdropUrl || series.posterUrl!}
                alt={series.title}
                fill
                priority
                className="object-cover object-center brightness-75"
                sizes="(max-width: 1024px) 100vw, 800px"
              />
            ) : null}

            {/* Gradient Overlays matching Image 5 */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#070911] via-[#070911]/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#070911]/80 via-transparent to-transparent" />

            {/* Top Right Buttons: Share and Close */}
            <div className="absolute top-3 right-3 flex items-center gap-2 z-20">
              <button
                onClick={handleShare}
                aria-label="Share Series"
                className="p-2 rounded-full bg-black/60 hover:bg-black/80 text-white/90 hover:text-white border border-white/10 backdrop-blur-md transition-colors"
              >
                <Share2 size={15} />
              </button>
              <button
                onClick={onClose}
                aria-label="Close"
                className="p-2 rounded-full bg-black/60 hover:bg-black/80 text-white/90 hover:text-white border border-white/10 backdrop-blur-md transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            {/* Bottom Content inside Backdrop: Poster thumbnail + Title + Badges */}
            <div className="absolute bottom-3 inset-x-4 md:inset-x-6 flex items-end gap-3.5 z-10">
              {/* Floating Portrait Poster */}
              <div className="relative w-20 sm:w-24 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border-2 border-white/20 bg-slate-900 shrink-0">
                {series.posterUrl ? (
                  <Image
                    src={series.posterUrl}
                    alt={series.title}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-500">
                    <Tv size={24} />
                  </div>
                )}
              </div>

              {/* Title and Metadata */}
              <div className="flex-1 space-y-1.5 min-w-0">
                <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight truncate drop-shadow-md">
                  {series.title}
                </h2>

                {/* Rating & Specs Row */}
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                  {series.rating && (
                    <span className="flex items-center gap-1 text-amber-400 font-bold">
                      <Star size={12} className="fill-current text-amber-400" />
                      <span>{series.rating}</span>
                    </span>
                  )}
                  <span className="text-slate-300">{releaseYear}</span>
                  {(() => {
                    const isCompleted =
                      series.status === "Ended" ||
                      series.status === "Canceled" ||
                      series.slug === "stranger-things" ||
                      series.slug === "loki";
                    const seasonNum = series.currentSeasonNumber || series.numberOfSeasons || 1;
                    const label = series.seasonStatusText || (isCompleted ? `Season ${seasonNum} (Completed)` : `Season ${seasonNum} (Current Season)`);

                    return (
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          isCompleted
                            ? "bg-purple-950/80 border-purple-500/50 text-purple-300"
                            : "bg-emerald-950/80 border-emerald-500/50 text-emerald-300"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isCompleted ? "bg-purple-400" : "bg-emerald-400 animate-pulse"
                          }`}
                        />
                        <span>{label}</span>
                      </span>
                    );
                  })()}
                  <span className="px-2 py-0.5 rounded-md bg-white/10 border border-white/10 text-[10px] font-bold text-slate-300 uppercase">
                    TV SERIES
                  </span>
                </div>

                {/* Category Pills */}
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  {series.genres.slice(0, 3).map((g) => (
                    <span
                      key={g}
                      className="px-2.5 py-0.5 rounded-full bg-[#111422]/90 border border-white/15 text-slate-300 text-[11px] font-medium"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Lower Content matching Image 5: OVERVIEW & CAST */}
          <div className="px-4 md:px-6 space-y-3.5 pt-1">
            {/* OVERVIEW Section */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase block">
                OVERVIEW
              </span>
              <p className="text-xs sm:text-sm text-slate-300/95 line-clamp-3 leading-relaxed">
                {series.overview || "No overview available for this series."}
              </p>
            </div>

            {/* CAST Section */}
            {series.cast && series.cast.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase block">
                  CAST
                </span>
                <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
                  {series.cast.slice(0, 7).map((c) => (
                    <div
                      key={c.id}
                      className="flex flex-col items-center text-center w-16 sm:w-20 shrink-0"
                    >
                      <div className="relative w-14 sm:w-16 h-18 sm:h-20 rounded-xl overflow-hidden bg-slate-900 border border-white/10 mb-1">
                        {c.profileUrl ? (
                          <Image
                            src={c.profileUrl}
                            alt={c.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">
                            {c.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <span className="text-[11px] font-bold text-white line-clamp-1 w-full">
                        {c.name}
                      </span>
                      <span className="text-[9px] text-slate-400 line-clamp-1 w-full">
                        {c.character}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Actions: View Files Button (redirects to search bar) + Telegram */}
            <div className="flex items-center gap-2.5 pt-2 border-t border-white/[0.08]">
              {/* Primary: Redirect to search bar to show series files */}
              <button
                onClick={handleViewFiles}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold text-xs sm:text-sm tracking-wide shadow-glow-cyan transition-all active:scale-95"
              >
                <Search size={15} />
                <span>View Series Files ({series.files?.length || 0})</span>
                <ArrowRight size={15} />
              </button>

              {/* Telegram Channel Link */}
              <a
                href={series.telegramUrl || "https://t.me/cineprimeseries"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-semibold transition-all active:scale-95"
                title="Open Telegram Channel"
              >
                <Send size={14} className="text-amber-400" />
                <span className="hidden sm:inline">Telegram</span>
              </a>

              {/* Watch Trailer */}
              {series.trailerVideoId && (
                <button
                  onClick={() => setIsTrailerOpen(true)}
                  aria-label="Watch Trailer"
                  className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-colors"
                  title="Watch YouTube Trailer"
                >
                  <Play size={14} className="fill-current text-amber-400" />
                </button>
              )}
            </div>
          </div>
        </div>
      </Modal>

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
