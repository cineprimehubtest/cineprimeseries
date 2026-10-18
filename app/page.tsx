import React from "react";
import Link from "next/link";
import Image from "next/image";
import { SearchBar } from "@/components/search/SearchBar";
import { SeriesHero } from "@/components/series/SeriesHero";
import { LeechedFeed } from "@/components/series/LeechedFeed";
import { getAllSeries } from "@/lib/seriesService";
import { Star, Tv, ChevronRight } from "lucide-react";

export const revalidate = 600; // revalidate every 10 mins

export default async function HomePage() {
  const all = await getAllSeries();

  // Extract all leeched files
  const allFiles = all.flatMap((s) => s.files || []);

  const trendingTags = [
    "Heart Beat",
    "Loki",
    "Stranger Things",
    "Fallout",
    "Tamil Dubbed",
    "1080P Web-DL",
  ];

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      {/* Featured Hero Slideshow with Backdrop + Portrait */}
      {all.length > 0 && <SeriesHero seriesList={all} />}

      {/* Trending Searches Bar */}
      <div className="space-y-2.5">
        <span className="text-[10px] font-bold tracking-[0.25em] text-slate-400 uppercase block">
          T R E N D I N G   S E A R C H E S
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {trendingTags.map((tag) => (
            <Link
              key={tag}
              href={`/search?q=${encodeURIComponent(tag)}`}
              className="px-4 py-1.5 rounded-full bg-[#111422] hover:bg-[#181d30] border border-white/10 hover:border-amber-400/40 text-slate-300 hover:text-white text-xs font-semibold transition-all shadow-sm"
            >
              {tag}
            </Link>
          ))}
        </div>
      </div>

      {/* Prominent Search Bar */}
      <div className="w-full max-w-3xl mx-auto pt-2">
        <SearchBar />
      </div>

      {/* Curated Picks: Series Posters */}
      <section className="space-y-4 pt-2">
        <div className="flex items-end justify-between border-b border-white/[0.08] pb-3">
          <div>
            <span className="text-[10px] font-bold tracking-[0.25em] text-amber-400/80 uppercase block mb-0.5">
              C U R A T E D   P I C K S
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Featured Series
            </h2>
          </div>
          <Link
            href="/search"
            className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1 uppercase tracking-wider"
          >
            <span>View All</span>
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

      {/* The Leeched Files Feed */}
      <LeechedFeed initialFiles={allFiles} seriesList={all} />
    </div>
  );
}
