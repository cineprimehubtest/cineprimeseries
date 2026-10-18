"use client";

import React, { useState } from "react";
import { Series } from "@/types";
import { Button } from "@/components/ui/Button";
import { TrailerModal } from "@/components/trailer/TrailerModal";
import { useToast } from "@/components/ui/Toast";
import { Play, Download, Send, Bookmark, Share2, Check } from "lucide-react";

interface SeriesDetailClientProps {
  series: Series;
}

export const SeriesDetailClient: React.FC<SeriesDetailClientProps> = ({ series }) => {
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const { showToast } = useToast();

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `CinePrimeSeries - ${series.title}`,
          text: `Check out ${series.title} on CinePrimeSeries!`,
          url,
        });
      } catch {
        // Cancelled
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

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl bg-slate-900/40 border border-white/10 backdrop-blur-xl">
      <Button
        variant="primary"
        size="lg"
        icon={<Play size={18} className="fill-current" />}
        onClick={() => setIsTrailerOpen(true)}
      >
        Watch Trailer
      </Button>

      {series.downloadUrl ? (
        <a href={series.downloadUrl} target="_blank" rel="noopener noreferrer">
          <Button variant="secondary" size="lg" icon={<Download size={18} />}>
            Download Series
          </Button>
        </a>
      ) : (
        <Button variant="glass" size="lg" disabled icon={<Download size={18} />}>
          Download Pending
        </Button>
      )}

      {series.telegramUrl ? (
        <a href={series.telegramUrl} target="_blank" rel="noopener noreferrer">
          <Button variant="glass" size="lg" icon={<Send size={18} className="text-accent-light" />}>
            Telegram Community
          </Button>
        </a>
      ) : null}

      <Button
        variant="outline"
        size="lg"
        icon={isBookmarked ? <Check size={18} className="text-emerald-400" /> : <Bookmark size={18} />}
        onClick={toggleWatchlist}
      >
        {isBookmarked ? "Watchlisted" : "Add to Watchlist"}
      </Button>

      <Button
        variant="outline"
        size="lg"
        icon={<Share2 size={18} />}
        onClick={handleShare}
      >
        Share
      </Button>

      <TrailerModal
        isOpen={isTrailerOpen}
        onClose={() => setIsTrailerOpen(false)}
        title={series.title}
        videoId={series.trailerVideoId}
      />
    </div>
  );
};
