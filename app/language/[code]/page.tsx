import React from "react";
import type { Metadata } from "next";
import { getSeriesByLanguage } from "@/lib/seriesService";
import { SeriesGrid } from "@/components/series/SeriesGrid";
import Link from "next/link";
import { ChevronLeft, Globe, ShieldCheck } from "lucide-react";
import { normalizeLanguage } from "@/lib/matching";

interface PageProps {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { code } = await params;
  const langName = normalizeLanguage(code);

  return {
    title: `${langName} TV Series & Audio Dubs — CinePrimeSeries`,
    description: `Browse verified ${langName} TV series, original audio releases, multi-audio dubs, and official trailers on CinePrimeSeries.`,
  };
}

export default async function LanguagePage({ params }: PageProps) {
  const { code } = await params;
  const langName = normalizeLanguage(code);
  const series = await getSeriesByLanguage(code);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Link href="/" className="hover:text-white transition-colors flex items-center gap-1">
          <ChevronLeft size={14} />
          <span>Home</span>
        </Link>
        <span>/</span>
        <span className="text-slate-200 font-semibold">{langName} TV Series</span>
      </div>

      {/* Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-slate-900/40 border border-white/10 backdrop-blur-xl shadow-glass space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/15 text-accent-light border border-accent/30 text-xs font-semibold">
          <Globe size={13} />
          <span>Language Registry</span>
        </div>

        <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight">
          {langName} TV Series &amp; Dubbed Audio
        </h1>

        <p className="text-xs md:text-sm text-slate-400 max-w-2xl leading-relaxed">
          Explore TV series featuring authentic {langName} audio or verified Tamil dubbed tracks.
          Every audio status is verified with provenance and multi-audio stream checks.
        </p>

        {code.toLowerCase() === "tamil" && (
          <div className="pt-2 flex items-center gap-2 text-xs text-emerald-400 font-medium">
            <ShieldCheck size={16} />
            <span>Tamil audio tracks verified against genuine broadcast &amp; OTT releases.</span>
          </div>
        )}
      </div>

      {/* Series Grid */}
      <SeriesGrid
        series={series}
        emptyMessage={`No TV series currently catalogued for ${langName}. Please check back as new episodes and audio dubs are verified.`}
      />
    </div>
  );
}
