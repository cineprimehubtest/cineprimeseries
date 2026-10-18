import React from "react";
import type { Metadata } from "next";
import { getTVmazeLatestSchedule } from "@/lib/tvmaze";
import { EpisodeCard } from "@/components/episodes/EpisodeCard";
import Link from "next/link";
import { ChevronLeft, Tv, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Latest TV Episode Airings & Schedule — CinePrimeSeries",
  description: "Live broadcast schedule and newly aired TV episodes from around the world.",
};

export const revalidate = 900; // 15 mins

export default async function LatestEpisodesPage() {
  const schedule = await getTVmazeLatestSchedule("US");

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Link href="/" className="hover:text-white transition-colors flex items-center gap-1">
          <ChevronLeft size={14} />
          <span>Home</span>
        </Link>
        <span>/</span>
        <span className="text-slate-200 font-semibold">Latest Episodes</span>
      </div>

      <div className="p-6 md:p-8 rounded-3xl bg-slate-900/40 border border-white/10 backdrop-blur-xl shadow-glass space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/15 text-accent-light border border-accent/30 text-xs font-semibold">
          <Clock size={13} />
          <span>Live Broadcast Guide</span>
        </div>
        <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight">
          Latest TV Episodes Broadcast Schedule
        </h1>
        <p className="text-xs md:text-sm text-slate-400 max-w-xl">
          Real-time episode air dates, episode titles, and summaries powered by the TVmaze television schedule.
        </p>
      </div>

      {schedule.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {schedule.map((ep) => (
            <EpisodeCard key={ep.id} episode={ep} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center text-slate-400 rounded-2xl bg-white/[0.02] border border-white/5">
          Schedule data is currently refreshing.
        </div>
      )}
    </div>
  );
}
