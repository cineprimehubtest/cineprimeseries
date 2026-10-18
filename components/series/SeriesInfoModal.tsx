"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Series } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CastCarousel } from "@/components/cast/CastCarousel";
import { EpisodeList } from "@/components/episodes/EpisodeList";
import { TrailerModal } from "@/components/trailer/TrailerModal";
import { useToast } from "@/components/ui/Toast";
import {
  Star,
  Play,
  Download,
  Send,
  Share2,
  Bookmark,
  Calendar,
  Globe,
  Tv,
  Check,
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
  const [isBookmarked, setIsBookmarked] = useState(false);
  const { showToast } = useToast();

  const handleShare = async () => {
    const url = `${window.location.origin}/series/${series.slug}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `CinePrimeSeries - ${series.title}`,
          text: `Discover ${series.title} on CinePrimeSeries!`,
          url,
        });
      } catch {
        // User cancelled or unsupported
      }
    } else {
      navigator.clipboard.writeText(url);
      showToast("Series link copied to clipboard!", "success");
    }
  };

  const toggleWatchlist = () => {
    setIsBookmarked(!isBookmarked);
    showToast(
      !isBookmarked ? `Added "${series.title}" to Watchlist` : `Removed from Watchlist`,
      "info"
    );
  };

  const releaseYear = series.firstAirDate ? series.firstAirDate.substring(0, 4) : "TBA";

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} maxWidth="2xl">
        <div className="space-y-6">
          {/* Visual Header with Backdrop */}
          <div className="relative -mx-4 md:-mx-6 -mt-4 md:-mt-6 h-56 md:h-80 overflow-hidden bg-slate-950">
            {series.backdropUrl || series.posterUrl ? (
              <Image
                src={series.backdropUrl || series.posterUrl!}
                alt={series.title}
                fill
                priority
                className="object-cover object-center brightness-90"
                sizes="(max-width: 1024px) 100vw, 900px"
              />
            ) : null}

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-transparent" />

            {/* Content overlay inside banner */}
            <div className="absolute bottom-4 inset-x-4 md:inset-x-6 flex gap-4 md:gap-6 items-end">
              {/* Poster card thumbnail */}
              <div className="relative w-24 md:w-36 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 shrink-0 hidden sm:block bg-slate-900">
                {series.posterUrl ? (
                  <Image
                    src={series.posterUrl}
                    alt={series.title}
                    fill
                    className="object-cover"
                    sizes="144px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-500">
                    <Tv size={32} />
                  </div>
                )}
              </div>

              {/* Header Titles */}
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  {series.rating && (
                    <Badge variant="violet" size="sm" className="font-bold">
                      <Star size={11} className="fill-current text-primary-light" />
                      {series.rating} ({series.ratingSource || "IMDb"})
                    </Badge>
                  )}
                  {series.status && (
                    <Badge variant="glass" size="sm">
                      {series.status}
                    </Badge>
                  )}
                  {series.tamilAudioStatus === "Confirmed" && (
                    <Badge variant="cyan" size="sm">
                      Tamil Audio Confirmed
                    </Badge>
                  )}
                </div>

                <h2 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight drop-shadow-md">
                  {series.title}
                </h2>

                <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-slate-300 font-medium">
                  <span className="flex items-center gap-1">
                    <Calendar size={13} className="text-slate-400" />
                    {releaseYear}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Globe size={13} className="text-slate-400" />
                    {series.originalLanguage} ({series.originCountry.join(", ")})
                  </span>
                  <span>•</span>
                  <span>{series.numberOfSeasons} Seasons</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button Bar */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <Button
              variant="primary"
              size="md"
              icon={<Play size={16} className="fill-current" />}
              onClick={() => setIsTrailerOpen(true)}
            >
              Watch Trailer
            </Button>

            {series.downloadUrl ? (
              <a href={series.downloadUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="secondary" size="md" icon={<Download size={16} />}>
                  Download Series
                </Button>
              </a>
            ) : null}

            {series.telegramUrl ? (
              <a href={series.telegramUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="glass" size="md" icon={<Send size={16} className="text-accent-light" />}>
                  Join Telegram
                </Button>
              </a>
            ) : null}

            <Button
              variant="outline"
              size="md"
              icon={isBookmarked ? <Check size={16} className="text-emerald-400" /> : <Bookmark size={16} />}
              onClick={toggleWatchlist}
            >
              {isBookmarked ? "Watchlisted" : "Watchlist"}
            </Button>

            <Button
              variant="outline"
              size="md"
              icon={<Share2 size={16} />}
              onClick={handleShare}
            >
              Share
            </Button>

            <Link href={`/series/${series.slug}`} className="ml-auto">
              <Button variant="glass" size="md">
                Full Series Page
              </Button>
            </Link>
          </div>

          {/* Overview Section */}
          <div className="space-y-2 bg-white/[0.02] p-4 md:p-5 rounded-2xl border border-white/5">
            <h3 className="text-sm font-semibold text-white tracking-wide uppercase">
              Synopsis
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {series.overview || "No overview is currently available for this TV series."}
            </p>

            {/* Genres */}
            <div className="flex flex-wrap gap-1.5 pt-3">
              {series.genres.map((g) => (
                <span
                  key={g}
                  className="px-2.5 py-1 rounded-lg text-xs bg-white/5 border border-white/10 text-slate-300"
                >
                  {g}
                </span>
              ))}
            </div>
          </div>

          {/* Credits info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-white/[0.02] p-4 rounded-2xl border border-white/5">
            <div>
              <span className="text-slate-400 font-medium">Creators &amp; Showrunners:</span>
              <p className="text-slate-200 font-semibold mt-0.5">
                {series.creators && series.creators.length > 0
                  ? series.creators.join(", ")
                  : "Verified Series Production"}
              </p>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Production Network / Studio:</span>
              <p className="text-slate-200 font-semibold mt-0.5">
                {series.productionCompanies && series.productionCompanies.length > 0
                  ? series.productionCompanies.join(", ")
                  : "Original Network"}
              </p>
            </div>
          </div>

          {/* Cast Carousel */}
          {series.cast && series.cast.length > 0 && (
            <CastCarousel cast={series.cast} />
          )}

          {/* Seasons & Episodes */}
          <EpisodeList
            seasons={series.seasons}
            episodes={series.episodes}
            seriesTelegramUrl={series.telegramUrl}
          />
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
