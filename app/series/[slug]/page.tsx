import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSeriesBySlug, getAllSeries } from "@/lib/seriesService";
import { Badge } from "@/components/ui/Badge";
import { CastCarousel } from "@/components/cast/CastCarousel";
import { EpisodeList } from "@/components/episodes/EpisodeList";
import { LeechedFileCard } from "@/components/series/LeechedFileCard";
import {
  Star,
  Calendar,
  Globe,
  Share2,
  Tv,
  ChevronLeft,
  ShieldCheck,
} from "lucide-react";
import { SeriesDetailClient } from "./SeriesDetailClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const series = await getSeriesBySlug(slug);
  if (!series) {
    return {
      title: "Series Not Found — CinePrimeSeries",
    };
  }

  const releaseYear = series.firstAirDate?.substring(0, 4) || "";
  const title = `${series.title} (${releaseYear}) — Watch Trailer & Episode Guide | CinePrimeSeries`;
  const description = `${series.overview.substring(0, 160)}... Strictly TV-series metadata on CinePrimeSeries.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: series.backdropUrl || series.posterUrl ? [series.backdropUrl || series.posterUrl!] : [],
      type: "video.tv_show",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: series.backdropUrl || series.posterUrl ? [series.backdropUrl || series.posterUrl!] : [],
    },
  };
}

export default async function SeriesDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const series = await getSeriesBySlug(slug);

  if (!series) {
    notFound();
  }

  const releaseYear = series.firstAirDate ? series.firstAirDate.substring(0, 4) : "TBA";

  // Schema.org Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TVSeries",
    name: series.title,
    description: series.overview,
    image: series.posterUrl,
    genre: series.genres,
    startDate: series.firstAirDate,
    endDate: series.lastAirDate,
    numberOfSeasons: series.numberOfSeasons,
    numberOfEpisodes: series.numberOfEpisodes,
    inLanguage: series.originalLanguage,
    aggregateRating: series.rating
      ? {
          "@type": "AggregateRating",
          ratingValue: series.rating,
          bestRating: 10,
          ratingCount: series.voteCount || 100,
        }
      : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="space-y-8 animate-fade-in">
        {/* Breadcrumb & Back */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link href="/" className="hover:text-white transition-colors flex items-center gap-1">
            <ChevronLeft size={14} />
            <span>Home</span>
          </Link>
          <span>/</span>
          <Link href="/search" className="hover:text-white transition-colors">
            Series
          </Link>
          <span>/</span>
          <span className="text-slate-200 font-semibold truncate">{series.title}</span>
        </div>

        {/* Visual Cinematic Banner */}
        <div className="relative w-full rounded-3xl overflow-hidden bg-slate-950 border border-white/10 shadow-2xl min-h-[380px] md:min-h-[480px] flex items-end">
          {series.backdropUrl || series.posterUrl ? (
            <Image
              src={series.backdropUrl || series.posterUrl!}
              alt={series.title}
              fill
              priority
              sizes="100vw"
              className="object-cover object-top brightness-[0.7] filter saturate-110"
            />
          ) : null}

          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/40 to-transparent" />

          {/* Overlay details */}
          <div className="relative z-10 p-6 md:p-10 flex flex-col md:flex-row gap-6 items-start md:items-end w-full">
            {/* Poster Card */}
            <div className="relative w-32 md:w-48 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 shrink-0 hidden sm:block bg-slate-900">
              {series.posterUrl ? (
                <Image
                  src={series.posterUrl}
                  alt={series.title}
                  fill
                  priority
                  className="object-cover"
                  sizes="192px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500">
                  <Tv size={36} />
                </div>
              )}
            </div>

            {/* Info and Titles */}
            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {series.rating && (
                  <Badge variant="violet" size="md" className="font-bold">
                    <Star size={12} className="fill-current text-primary-light" />
                    {series.rating} ({series.ratingSource || "Verified"})
                  </Badge>
                )}
                {series.status && (
                  <Badge variant="glass" size="md">
                    {series.status}
                  </Badge>
                )}
                {series.tamilAudioStatus === "Confirmed" && (
                  <Badge variant="cyan" size="md">
                    Tamil Audio Confirmed
                  </Badge>
                )}
                <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300 font-medium">
                  {series.numberOfSeasons} {series.numberOfSeasons === 1 ? "Season" : "Seasons"}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                {series.title}
              </h1>

              {series.originalTitle && series.originalTitle !== series.title && (
                <p className="text-sm md:text-base text-slate-300 font-medium">
                  Original Title: {series.originalTitle}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-slate-300 font-medium">
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-slate-400" />
                  {releaseYear}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Globe size={14} className="text-slate-400" />
                  {series.originalLanguage} ({series.originCountry.join(", ")})
                </span>
                <span>•</span>
                <div className="flex gap-1.5">
                  {series.genres.map((g) => (
                    <span key={g} className="text-slate-200">
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Client Interactive Controls (Trailer modal trigger, download button, telegram, share) */}
        <SeriesDetailClient series={series} />

        {/* Overview Box */}
        <div className="p-6 rounded-3xl bg-slate-900/40 border border-white/10 backdrop-blur-xl space-y-3">
          <h2 className="text-sm font-bold text-slate-400 tracking-wider uppercase">
            Series Overview &amp; Synopsis
          </h2>
          <p className="text-sm md:text-base text-slate-200 leading-relaxed">
            {series.overview}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-white/5 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">Creators &amp; Writers</span>
              <span className="text-white font-semibold">
                {series.creators?.join(", ") || "Original Studio Production"}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Production Companies</span>
              <span className="text-white font-semibold">
                {series.productionCompanies?.join(", ") || "Global Distribution"}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Tamil Dubbing Verification</span>
              <span className="text-accent-light font-semibold">
                {series.tamilAudioStatus || "Not checked"}
              </span>
            </div>
          </div>
        </div>

        {/* Cast Carousel */}
        {series.cast && series.cast.length > 0 && (
          <div className="p-6 rounded-3xl bg-slate-900/40 border border-white/10 backdrop-blur-xl">
            <CastCarousel cast={series.cast} />
          </div>
        )}

        {/* Available Files & Telegram Downloads */}
        {series.files && series.files.length > 0 && (
          <div className="p-6 rounded-3xl bg-slate-900/40 border border-white/10 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div>
                <span className="text-[10px] font-bold tracking-[0.25em] text-amber-400 uppercase block mb-1">
                  A V A I L A B L E   D O W N L O A D S
                </span>
                <h2 className="text-lg md:text-xl font-serif font-bold text-white">
                  Available Files ({series.files.length} Episodes &amp; Releases)
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-1">
              {series.files.map((file) => (
                <LeechedFileCard key={file.id} file={file} cast={series.cast} />
              ))}
            </div>
          </div>
        )}

        {/* Seasons & Episodes Guide */}
        <div className="p-6 rounded-3xl bg-slate-900/40 border border-white/10 backdrop-blur-xl">
          <EpisodeList
            seasons={series.seasons}
            episodes={series.episodes}
            seriesTelegramUrl={series.telegramUrl}
          />
        </div>
      </div>
    </>
  );
}
