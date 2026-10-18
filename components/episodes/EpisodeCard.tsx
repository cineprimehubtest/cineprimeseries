"use client";

import React from "react";
import Image from "next/image";
import { Episode } from "@/types";
import { Clock, Calendar, Download, Send, Film } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface EpisodeCardProps {
  episode: Episode;
  seriesTelegramUrl?: string | null;
}

export const EpisodeCard: React.FC<EpisodeCardProps> = ({
  episode,
  seriesTelegramUrl,
}) => {
  const telegramTarget = episode.telegramUrl || seriesTelegramUrl;

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/15 transition-all duration-200">
      {/* Thumbnail */}
      <div className="relative w-full sm:w-44 aspect-video rounded-xl overflow-hidden bg-slate-900 border border-white/5 shrink-0">
        {episode.stillUrl ? (
          <Image
            src={episode.stillUrl}
            alt={episode.title}
            fill
            className="object-cover hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, 176px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-600">
            <Film size={28} />
          </div>
        )}
        <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-sm text-[10px] font-semibold text-white">
          EP {episode.episodeNumber}
        </div>
      </div>

      {/* Info & Actions */}
      <div className="flex flex-col justify-between flex-1 gap-2">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm md:text-base font-bold text-white line-clamp-1">
              {episode.episodeNumber}. {episode.title}
            </h4>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
            {episode.airDate && (
              <span className="flex items-center gap-1">
                <Calendar size={12} className="text-slate-500" />
                {episode.airDate}
              </span>
            )}
            {episode.runtime && (
              <span className="flex items-center gap-1">
                <Clock size={12} className="text-slate-500" />
                {episode.runtime}m
              </span>
            )}
          </div>

          {episode.synopsis && (
            <p className="text-xs text-slate-300/80 line-clamp-2 mt-1.5 leading-relaxed">
              {episode.synopsis}
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
          {episode.downloadUrl ? (
            <a
              href={episode.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <Button size="sm" variant="primary" icon={<Download size={13} />}>
                Download Episode
              </Button>
            </a>
          ) : (
            <Button size="sm" variant="glass" disabled icon={<Download size={13} />}>
              Download Pending
            </Button>
          )}

          {telegramTarget ? (
            <a
              href={telegramTarget}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <Button size="sm" variant="glass" icon={<Send size={13} className="text-accent" />}>
                Telegram Post
              </Button>
            </a>
          ) : (
            <Button size="sm" variant="glass" disabled icon={<Send size={13} />}>
              Telegram TBA
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
