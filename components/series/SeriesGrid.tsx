import React from "react";
import { Series } from "@/types";
import { SeriesCard } from "./SeriesCard";
import { Skeleton } from "@/components/ui/Skeleton";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface SeriesGridProps {
  title?: string;
  subtitle?: string;
  series: Series[];
  viewAllLink?: string;
  isLoading?: boolean;
  emptyMessage?: string;
}

export const SeriesGrid: React.FC<SeriesGridProps> = ({
  title,
  subtitle,
  series,
  viewAllLink,
  isLoading = false,
  emptyMessage = "No TV series found matching this category.",
}) => {
  return (
    <section className="space-y-4 my-8">
      {/* Section Header */}
      {(title || viewAllLink) && (
        <div className="flex items-end justify-between border-b border-white/10 pb-3">
          <div>
            {title && (
              <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>{title}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/20 text-primary-light border border-primary/30">
                  {isLoading ? "..." : series.length}
                </span>
              </h2>
            )}
            {subtitle && (
              <p className="text-xs md:text-sm text-slate-400 mt-0.5">{subtitle}</p>
            )}
          </div>

          {viewAllLink && (
            <Link
              href={viewAllLink}
              className="group flex items-center gap-1 text-xs md:text-sm font-semibold text-primary-light hover:text-white transition-colors"
            >
              <span>View All</span>
              <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          )}
        </div>
      )}

      {/* Grid container */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} variant="card" />
          ))}
        </div>
      ) : series.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
          {series.map((item, index) => (
            <SeriesCard key={item.id} series={item} priority={index < 4} />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center rounded-2xl bg-white/[0.02] border border-white/5 text-slate-400 text-sm">
          {emptyMessage}
        </div>
      )}
    </section>
  );
};
