import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MAIN_CATEGORIES } from "@/lib/matching";
import { getSeriesByCategory } from "@/lib/seriesService";
import { SeriesGrid } from "@/components/series/SeriesGrid";
import Link from "next/link";
import { ChevronLeft, Layers } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = MAIN_CATEGORIES.find((c) => c.slug === slug.toLowerCase());
  if (!category) {
    return { title: "Category Not Found — CinePrimeSeries" };
  }

  return {
    title: `${category.name} TV Series — CinePrimeSeries`,
    description: `Discover top-rated ${category.name} TV series, official trailers, and complete season guides on CinePrimeSeries.`,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = MAIN_CATEGORIES.find((c) => c.slug === slug.toLowerCase());

  if (!category) {
    notFound();
  }

  const series = await getSeriesByCategory(category.name);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Link href="/" className="hover:text-white transition-colors flex items-center gap-1">
          <ChevronLeft size={14} />
          <span>Home</span>
        </Link>
        <span>/</span>
        <span className="text-slate-200 font-semibold">{category.name} Series</span>
      </div>

      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-slate-900/40 border border-white/10 backdrop-blur-xl shadow-glass flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 text-primary-light border border-primary/30 text-xs font-semibold mb-2">
            <Layers size={13} />
            <span>TV Series Category</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight">
            {category.name} TV Series
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-xl">
            {category.description} Strictly television and streaming web series.
          </p>
        </div>

        {/* Other categories quick switcher */}
        <div className="flex flex-wrap gap-1.5 max-w-md">
          {MAIN_CATEGORIES.filter((c) => c.slug !== category.slug).slice(0, 5).map((c) => (
            <Link
              key={c.slug}
              href={`/category/${c.slug}`}
              className="px-2.5 py-1 rounded-lg text-xs bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 hover:text-white transition-colors"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Series Grid */}
      <SeriesGrid
        series={series}
        emptyMessage={`No TV series currently catalogued in the ${category.name} genre. Check back as new shows are synchronized.`}
      />
    </div>
  );
}
