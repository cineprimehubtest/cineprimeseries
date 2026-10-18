import React from "react";
import Link from "next/link";
import Image from "next/image";
import { SearchBar } from "@/components/search/SearchBar";
import { SeriesHero } from "@/components/series/SeriesHero";
import { LeechedFeed } from "@/components/series/LeechedFeed";
import {
  getAllSeries,
  getTrending,
  getNewReleases,
  getTopRated,
} from "@/lib/seriesService";
import { getTVmazeLatestSchedule } from "@/lib/tvmaze";
import { MAIN_CATEGORIES } from "@/lib/matching";
import {
  Star,
  Globe,
  Tv,
  Layers,
  ChevronRight,
  Compass,
} from "lucide-react";

// Popular languages for quick browsing
const POPULAR_LANGUAGES = [
  { name: "Tamil (தமிழ்)", code: "tamil", flag: "🇮🇳", count: "Multi-Audio & Originals" },
  { name: "English", code: "english", flag: "🇺🇸", count: "Worldwide Catalogue" },
  { name: "Hindi (हिंदी)", code: "hindi", flag: "🇮🇳", count: "Web Originals & Dubs" },
  { name: "Telugu (తెలుగు)", code: "telugu", flag: "🇮🇳", count: "Tollywood Series" },
  { name: "Malayalam (മലയാളം)", code: "malayalam", flag: "🇮🇳", count: "Mollywood Series" },
  { name: "Korean (한국어)", code: "korean", flag: "🇰🇷", count: "K-Dramas" },
  { name: "Japanese (日本語)", code: "japanese", flag: "🇯🇵", count: "Anime & J-Dramas" },
];

export const revalidate = 600; // revalidate every 10 mins

export default async function HomePage() {
  const [all, trending, newSeries, topRated] = await Promise.all([
    getAllSeries(),
    getTrending(),
    getNewReleases(),
    getTopRated(),
  ]);

  // Featured hero series: pick Heart Beat or Loki or first available
  const featured =
    all.find((s) => s.slug === "heart-beat") ||
    all.find((s) => s.slug === "loki") ||
    all[0];

  // Extract all leeched files
  const allFiles = all.flatMap((s) => s.files || []);

  const trendingTags = [
    "Heart Beat",
    "Loki",
    "Stranger Things",
    "Tamil Dubbed",
    "Sci-Fi",
    "1080P Web-DL",
  ];

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      {/* Featured Hero Banner matching Screenshot 6 */}
      {featured && <SeriesHero series={featured} />}

      {/* Trending Searches Bar matching Screenshot 6 */}
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

      {/* Curated Picks: Recently Added Posters matching Screenshot 5 */}
      <section className="space-y-4 pt-2">
        <div className="flex items-end justify-between border-b border-white/[0.08] pb-3">
          <div>
            <span className="text-[10px] font-bold tracking-[0.25em] text-amber-400/80 uppercase block mb-0.5">
              C U R A T E D   P I C K S
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Recently Added
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
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
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
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

      {/* The Leeched Files Feed matching Screenshot 1 */}
      <LeechedFeed initialFiles={allFiles} seriesList={all} />

      {/* Ten Main Categories Grid */}
      <section className="space-y-4 pt-6">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2">
            <Layers className="text-amber-400" size={18} />
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-white tracking-tight">
              10 Main Categories
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-medium">Curated TV Genres</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {MAIN_CATEGORIES.map((cat, idx) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="group p-4 rounded-2xl bg-[#0c0e18]/70 hover:bg-[#121626] border border-white/10 hover:border-amber-400/40 backdrop-blur-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 group-hover:text-amber-400 transition-colors">
                  0{idx + 1}
                </span>
                <ChevronRight
                  size={14}
                  className="text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all"
                />
              </div>

              <div className="mt-4">
                <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                  {cat.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Browse by Language */}
      <section className="space-y-4 pt-4">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2">
            <Globe className="text-accent-light" size={18} />
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-white tracking-tight">
              Browse by Language
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-medium">Original &amp; Dubbed Audio</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {POPULAR_LANGUAGES.map((lang) => (
            <Link
              key={lang.code}
              href={`/language/${lang.code}`}
              className="group p-3.5 rounded-2xl bg-[#0c0e18]/70 hover:bg-[#121626] border border-white/10 hover:border-accent/40 backdrop-blur-xl transition-all duration-300 flex flex-col text-center items-center"
            >
              <span className="text-2xl mb-1.5">{lang.flag}</span>
              <h3 className="text-xs font-bold text-white group-hover:text-accent-light transition-colors line-clamp-1">
                {lang.name}
              </h3>
              <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                {lang.count}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
