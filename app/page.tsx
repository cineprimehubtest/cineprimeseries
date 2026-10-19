import React from "react";
import Link from "next/link";
import Image from "next/image";
import { SearchBar } from "@/components/search/SearchBar";
import { SeriesHero } from "@/components/series/SeriesHero";
import { getAllSeries } from "@/lib/seriesService";
import { Star, Tv, ChevronRight, Radio } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;


export default async function HomePage() {
  const all = await getAllSeries();

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      {/* Featured Hero Slideshow: Displays strictly the series in your database */}
      {all.length > 0 ? (
        <SeriesHero seriesList={all} />
      ) : (
        <div className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-br from-[#0c1222] via-[#070911] to-[#111827] border border-amber-500/20 p-8 sm:p-12 text-center shadow-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-widest">
            <Radio size={14} className="animate-pulse text-amber-400" />
            <span>Database Channel Connected</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-white tracking-tight">
            CinePrimeSeries Database Ready
          </h2>

          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Forward any TV series file into your Telegram Database Channel (<code className="text-amber-300 font-bold bg-white/5 px-2 py-0.5 rounded">-1004461514415</code>).
            The bot will immediately auto-index the metadata, fetch official studio posters, and display it here!
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://t.me/cineprimeseries"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95"
            >
              Open Database Channel
            </a>
            <a
              href="https://t.me/CinePrimeSeries_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider border border-white/15 transition-all"
            >
              Open @CinePrimeSeries_bot
            </a>
          </div>
        </div>
      )}

      {/* Prominent Search Bar */}
      <div className="w-full max-w-3xl mx-auto pt-2">
        <SearchBar />
      </div>

      {/* Indexed Series in Database */}
      {all.length > 0 && (
        <section className="space-y-4 pt-2">
          <div className="flex items-end justify-between border-b border-white/[0.08] pb-3">
            <div>
              <span className="text-[10px] font-bold tracking-[0.25em] text-amber-400/80 uppercase block mb-0.5">
                I N   Y O U R   D A T A B A S E
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Indexed Series ({all.length})
              </h2>
            </div>
            <Link
              href="/search"
              className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1 uppercase tracking-wider"
            >
              <span>View All Files</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          {/* Series Poster Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
            {all.map((s) => (
              <Link
                key={s.id}
                href={`/series/${s.slug}`}
                className="group flex flex-col space-y-2"
              >
                <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-slate-900 border border-white/10 group-hover:border-amber-400/50 transition-all duration-300 group-hover:shadow-glow-cyan/20">
                  {s.posterUrl ? (
                    <Image
                      src={s.posterUrl}
                      alt={s.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                      <Tv size={28} />
                    </div>
                  )}
                  {/* Gradient vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                    {s.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                    <span>{s.firstAirDate?.substring(0, 4) || "2026"}</span>
                    {s.rating && (
                      <span className="flex items-center gap-0.5 text-amber-400 font-bold">
                        <Star size={11} className="fill-current text-amber-400" />
                        {s.rating}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
