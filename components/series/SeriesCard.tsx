"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Series } from "@/types";
import { Star, Info, Download, Send, Play, Tv } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { SeriesInfoModal } from "./SeriesInfoModal";
import { TrailerModal } from "@/components/trailer/TrailerModal";

interface SeriesCardProps {
  series: Series;
  priority?: boolean;
}

export const SeriesCard: React.FC<SeriesCardProps> = ({ series, priority = false }) => {
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isTrailerModalOpen, setIsTrailerModalOpen] = useState(false);

  const releaseYear = series.firstAirDate
    ? series.firstAirDate.substring(0, 4)
    : "TBA";

  const primaryGenre = series.genres && series.genres.length > 0 ? series.genres[0] : "Drama";

  const isTamilAvailable =
    series.originalLanguage.toLowerCase() === "tamil" ||
    series.tamilAudioStatus === "Confirmed";

  return (
    <>
      <div className="group relative flex flex-col rounded-2xl bg-slate-900/40 border border-white/10 hover:border-primary/40 overflow-hidden transition-all duration-300 hover:shadow-glow-violet/30 hover:-translate-y-1">
        {/* Poster Wrapper */}
        <div className="relative w-full aspect-[2/3] bg-slate-950 overflow-hidden">
          {series.posterUrl ? (
            <Image
              src={series.posterUrl}
              alt={series.title}
              fill
              priority={priority}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 gap-2 p-4 text-center">
              <Tv size={36} />
              <span className="text-xs">{series.title}</span>
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

          {/* Top Badges */}
          <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between gap-1 pointer-events-none">
            {series.rating ? (
              <Badge variant="violet" size="sm" className="font-bold backdrop-blur-md">
                <Star size={10} className="fill-current text-primary-light" />
                {series.rating}
              </Badge>
            ) : <span />}

            <div className="flex items-center gap-1">
              {series.numberOfSeasons && series.numberOfSeasons > 1 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 backdrop-blur-md text-[10px] text-amber-300 border border-amber-500/40 font-bold">
                  S01-S0{series.numberOfSeasons}
                </span>
              )}
              {isTamilAvailable && (
                <Badge variant="cyan" size="sm" className="backdrop-blur-md">
                  Tamil
                </Badge>
              )}
              {series.status && (
                <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] text-slate-300 border border-white/10 font-medium">
                  {series.status === "Returning Series" ? "Ongoing" : series.status}
                </span>
              )}
            </div>
          </div>

          {/* Quick trailer play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={() => setIsTrailerModalOpen(true)}
              aria-label={`Watch trailer for ${series.title}`}
              className="p-3.5 rounded-full bg-primary/90 hover:bg-primary text-white shadow-glow-violet transform scale-75 group-hover:scale-100 transition-all duration-300 hover:scale-110"
            >
              <Play size={22} className="fill-current ml-0.5" />
            </button>
          </div>
        </div>

        {/* Content details */}
        <div className="flex flex-col flex-1 p-3.5 gap-2">
          <div>
            <Link
              href={`/series/${series.slug}`}
              className="text-sm md:text-base font-bold text-white hover:text-primary-light transition-colors line-clamp-1"
              title={series.title}
            >
              {series.title}
            </Link>

            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 font-medium">
              <span>{releaseYear}</span>
              <span>•</span>
              <span className="text-slate-300">{primaryGenre}</span>
              <span>•</span>
              <span className="uppercase text-[11px] text-accent-light font-semibold">
                {series.originalLanguage}
              </span>
            </div>
          </div>

          {/* Action Row */}
          <div className="mt-auto pt-2 grid grid-cols-3 gap-1.5 border-t border-white/5">
            {/* Info button */}
            <button
              onClick={() => setIsInfoModalOpen(true)}
              title="Series Details"
              className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold transition-all border border-white/5 active:scale-95"
            >
              <Info size={13} className="text-primary-light" />
              <span>Info</span>
            </button>

            {/* Download button */}
            {series.downloadUrl ? (
              <a
                href={series.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Download Series"
                className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl bg-primary/20 hover:bg-primary/30 text-primary-light border border-primary/30 text-xs font-semibold transition-all active:scale-95"
              >
                <Download size={13} />
                <span>Get</span>
              </a>
            ) : (
              <button
                disabled
                title="Download not available yet"
                className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl bg-white/[0.02] text-slate-500 text-xs font-medium cursor-not-allowed border border-white/5"
              >
                <Download size={13} />
                <span>N/A</span>
              </button>
            )}

            {/* Telegram button */}
            {series.telegramUrl ? (
              <a
                href={series.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Open in Telegram"
                className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl bg-accent/20 hover:bg-accent/30 text-accent-light border border-accent/30 text-xs font-semibold transition-all active:scale-95"
              >
                <Send size={13} />
                <span>Tele</span>
              </a>
            ) : (
              <button
                disabled
                title="Telegram post TBA"
                className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl bg-white/[0.02] text-slate-500 text-xs font-medium cursor-not-allowed border border-white/5"
              >
                <Send size={13} />
                <span>TBA</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Series Info Glass Modal */}
      <SeriesInfoModal
        series={series}
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
      />

      {/* Official YouTube Trailer Modal */}
      <TrailerModal
        isOpen={isTrailerModalOpen}
        onClose={() => setIsTrailerModalOpen(false)}
        title={series.title}
        videoId={series.trailerVideoId}
      />
    </>
  );
};
