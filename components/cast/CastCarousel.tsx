"use client";

import React, { useState } from "react";
import Image from "next/image";
import { CastMember } from "@/types";
import { PersonModal } from "./PersonModal";
import { User, ChevronRight, ChevronLeft } from "lucide-react";

interface CastCarouselProps {
  cast: CastMember[];
}

export const CastCarousel: React.FC<CastCarouselProps> = ({ cast }) => {
  const [selectedPerson, setSelectedPerson] = useState<CastMember | null>(null);

  if (!cast || cast.length === 0) {
    return (
      <p className="text-sm text-slate-400 italic">Cast information not yet recorded.</p>
    );
  }

  const scrollLeft = () => {
    const el = document.getElementById("cast-scroll-container");
    if (el) el.scrollBy({ left: -260, behavior: "smooth" });
  };

  const scrollRight = () => {
    const el = document.getElementById("cast-scroll-container");
    if (el) el.scrollBy({ left: 260, behavior: "smooth" });
  };

  return (
    <div className="relative group">
      {/* Scroll controls */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-white tracking-wide">
          Series Cast ({cast.length})
        </h3>
        <div className="flex gap-1.5">
          <button
            onClick={scrollLeft}
            aria-label="Scroll cast left"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors border border-white/5"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={scrollRight}
            aria-label="Scroll cast right"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors border border-white/5"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel */}
      <div
        id="cast-scroll-container"
        className="flex gap-3.5 overflow-x-auto pb-3 pt-1 scroll-smooth custom-scrollbar no-scrollbar"
      >
        {cast.map((member) => (
          <button
            key={member.id}
            onClick={() => setSelectedPerson(member)}
            className="flex flex-col items-center text-center w-28 shrink-0 group/card text-left focus:outline-none"
          >
            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-slate-900 border-2 border-white/10 group-hover/card:border-primary transition-all duration-300 shadow-md group-hover/card:scale-105">
              {member.profileUrl ? (
                <Image
                  src={member.profileUrl}
                  alt={member.name}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500">
                  <User size={32} />
                </div>
              )}
            </div>
            <span className="text-xs font-semibold text-slate-100 group-hover/card:text-primary-light transition-colors line-clamp-1 mt-2">
              {member.name}
            </span>
            <span className="text-[11px] text-slate-400 line-clamp-1">
              {member.character}
            </span>
          </button>
        ))}
      </div>

      <PersonModal
        person={selectedPerson}
        onClose={() => setSelectedPerson(null)}
      />
    </div>
  );
};
