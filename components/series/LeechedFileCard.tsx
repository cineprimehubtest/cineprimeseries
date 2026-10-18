"use client";

import React, { useState } from "react";
import Image from "next/image";
import { LeechedFileItem, CastMember } from "@/types";
import { Star, Info, FileText, Tv } from "lucide-react";
import { FileDetailModal } from "./FileDetailModal";

interface LeechedFileCardProps {
  file: LeechedFileItem;
  cast?: CastMember[];
}

export const LeechedFileCard: React.FC<LeechedFileCardProps> = ({ file, cast = [] }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => setIsOpen(true)}
        className="group relative flex items-center justify-between gap-4 p-3 sm:p-4 rounded-2xl bg-[#0e1424]/70 hover:bg-[#131b31] border border-white/10 hover:border-amber-500/40 backdrop-blur-xl transition-all duration-300 shadow-glass-sm hover:shadow-glow-cyan/20 cursor-pointer"
      >
        {/* Left: Poster Artwork */}
        <div className="relative w-16 sm:w-20 aspect-[2/3] rounded-xl overflow-hidden bg-slate-900 border border-white/10 shrink-0">
          {file.posterUrl ? (
            <Image
              src={file.posterUrl}
              alt={file.seriesTitle}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 64px, 80px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-600">
              <Tv size={20} />
            </div>
          )}
        </div>

        {/* Center: File Name & Badges */}
        <div className="flex-1 min-w-0 space-y-1.5">
          {/* File Name */}
          <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
            {file.fileName}
          </h3>

          {/* Badges Row */}
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Quality (e.g. 720P, 1080P) */}
            <span className="px-2 py-0.5 rounded-lg bg-amber-600/25 border border-amber-500/40 text-amber-300 text-[10px] sm:text-xs font-black uppercase">
              {file.quality}
            </span>

            {/* Codec / Release Group (e.g. FENiX, AVC, x264) */}
            {file.codec && (
              <span className="px-2 py-0.5 rounded-lg bg-purple-600/25 border border-purple-500/40 text-purple-300 text-[10px] sm:text-xs font-bold uppercase">
                {file.codec}
              </span>
            )}

            {/* Year */}
            {file.year && (
              <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-[10px] sm:text-xs font-medium">
                {file.year}
              </span>
            )}

            {/* Languages (Tamil, Multi-Audio) */}
            {file.languages.map((lang) => (
              <span
                key={lang}
                className="px-2 py-0.5 rounded-lg bg-accent/20 border border-accent/30 text-accent-light text-[10px] sm:text-xs font-bold"
              >
                {lang}
              </span>
            ))}
          </div>

          {/* Size */}
          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-400 font-medium">
            <FileText size={12} className="text-slate-500 shrink-0" />
            <span>{file.sizeFormatted}</span>
          </div>
        </div>

        {/* Right: Rating & Info Button */}
        <div className="flex flex-col items-end justify-between self-stretch shrink-0 py-0.5">
          {file.rating ? (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1">
              <Star size={11} className="fill-current text-amber-400" />
              <span>{file.rating}</span>
            </span>
          ) : (
            <span />
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(true);
            }}
            className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 group-hover:text-white transition-colors"
          >
            <Info size={13} className="text-slate-500 group-hover:text-primary-light" />
            <span>Info</span>
          </button>
        </div>
      </div>

      <FileDetailModal
        file={file}
        cast={cast}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
};
