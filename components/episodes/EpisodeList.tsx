"use client";

import React, { useState } from "react";
import { Episode, Season } from "@/types";
import { EpisodeCard } from "./EpisodeCard";
import { SeasonTabs } from "./SeasonTabs";
import { Layers } from "lucide-react";

interface EpisodeListProps {
  seasons?: Season[];
  episodes?: Episode[];
  seriesTelegramUrl?: string | null;
}

export const EpisodeList: React.FC<EpisodeListProps> = ({
  seasons = [],
  episodes = [],
  seriesTelegramUrl,
}) => {
  const initialSeason = seasons.length > 0 ? seasons[0].seasonNumber : 1;
  const [activeSeason, setActiveSeason] = useState<number>(initialSeason);

  // Group episodes by season if seasons not structured with episodes
  const seasonEpisodes = episodes.filter((ep) => ep.seasonNumber === activeSeason);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers size={18} className="text-primary-light" />
          <h3 className="text-base font-semibold text-white tracking-wide">
            Seasons &amp; Episodes
          </h3>
        </div>
      </div>

      {seasons.length > 0 && (
        <SeasonTabs
          seasons={seasons}
          activeSeasonNumber={activeSeason}
          onSelectSeason={setActiveSeason}
        />
      )}

      {seasonEpisodes.length > 0 ? (
        <div className="flex flex-col gap-3">
          {seasonEpisodes.map((ep) => (
            <EpisodeCard
              key={`${ep.seasonNumber}-${ep.episodeNumber}`}
              episode={ep}
              seriesTelegramUrl={seriesTelegramUrl}
            />
          ))}
        </div>
      ) : episodes.length > 0 ? (
        <div className="flex flex-col gap-3">
          {episodes.map((ep) => (
            <EpisodeCard
              key={ep.id}
              episode={ep}
              seriesTelegramUrl={seriesTelegramUrl}
            />
          ))}
        </div>
      ) : (
        <div className="p-8 text-center rounded-2xl bg-white/[0.02] border border-white/5 text-slate-400 text-sm">
          Detailed episode guide is currently being indexed for this season.
        </div>
      )}
    </div>
  );
};
