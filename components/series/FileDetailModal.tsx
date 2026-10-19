"use client";

import React from "react";
import Image from "next/image";
import { LeechedFileItem, CastMember } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Star, Send, Share2, FileText, Tv, ExternalLink } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface FileDetailModalProps {
  file: LeechedFileItem | null;
  cast?: CastMember[];
  isOpen: boolean;
  onClose: () => void;
}

const CastAvatarItem: React.FC<{ member: CastMember }> = ({ member }) => {
  const [hasError, setHasError] = React.useState(false);

  return (
    <div className="flex flex-col items-center text-center w-20 shrink-0">
      <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gradient-to-tr from-slate-900 to-slate-800 border-2 border-white/15 shadow-md mb-1.5 flex items-center justify-center">
        {member.profileUrl && !hasError ? (
          <Image
            src={member.profileUrl}
            alt={member.name}
            fill
            className="object-cover"
            sizes="64px"
            onError={() => setHasError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-600/30 to-purple-600/30 text-amber-300 font-bold text-base select-none">
            {member.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <span className="text-[11px] font-bold text-white line-clamp-1">
        {member.name}
      </span>
      <span className="text-[10px] text-slate-400 line-clamp-1">
        {member.character}
      </span>
    </div>
  );
};

export const FileDetailModal: React.FC<FileDetailModalProps> = ({
  file,
  cast = [],
  isOpen,
  onClose,
}) => {
  const { showToast } = useToast();
  if (!file) return null;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: file.fileName,
        text: `Get ${file.fileName} on CinePrimeSeries`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(file.telegramUrl || window.location.href);
      showToast("Telegram link copied to clipboard!", "success");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="xl">
      <div className="space-y-6 -mt-2">
        {/* Header Banner & Poster */}
        <div className="relative -mx-4 md:-mx-6 -mt-4 md:-mt-6 h-48 sm:h-60 overflow-hidden bg-slate-950">
          {file.backdropUrl || file.posterUrl ? (
            <Image
              src={file.backdropUrl || file.posterUrl!}
              alt={file.seriesTitle}
              fill
              className="object-cover object-top brightness-75"
              sizes="(max-width: 1024px) 100vw, 800px"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

          {/* Poster and Title overlay */}
          <div className="absolute bottom-4 inset-x-4 md:inset-x-6 flex items-end gap-4">
            <div className="relative w-24 sm:w-28 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 bg-slate-900 shrink-0 hidden sm:block">
              {file.posterUrl ? (
                <Image
                  src={file.posterUrl}
                  alt={file.seriesTitle}
                  fill
                  className="object-cover"
                  sizes="112px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500">
                  <Tv size={28} />
                </div>
              )}
            </div>

            <div className="flex-1 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                {file.rating && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs font-bold flex items-center gap-1">
                    <Star size={11} className="fill-current" />
                    {file.rating}
                  </span>
                )}
                {file.year && (
                  <span className="px-2 py-0.5 rounded-full bg-white/10 text-slate-300 text-xs font-semibold">
                    {file.year}
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary-light border border-primary/30 text-[11px] font-bold uppercase">
                  OTT SERIES
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight line-clamp-2">
                {file.fileName}
              </h2>
            </div>
          </div>
        </div>

        {/* Badges Row (Quality, Codec, Size, Language) */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="px-3 py-1 rounded-xl bg-gradient-to-r from-amber-600/30 to-orange-600/30 border border-amber-500/40 text-amber-300 text-xs font-black uppercase">
            {file.quality}
          </span>
          {file.codec && (
            <span className="px-3 py-1 rounded-xl bg-purple-600/25 border border-purple-500/40 text-purple-300 text-xs font-bold uppercase">
              {file.codec}
            </span>
          )}
          <span className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-xs font-semibold flex items-center gap-1.5">
            <FileText size={13} className="text-slate-400" />
            <span>{file.sizeFormatted}</span>
          </span>
          {file.languages.map((lang) => (
            <span
              key={lang}
              className="px-3 py-1 rounded-xl bg-accent/20 border border-accent/40 text-accent-light text-xs font-bold"
            >
              {lang}
            </span>
          ))}
        </div>

        {/* Overview */}
        {file.overview && (
          <div className="space-y-1.5 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Overview
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {file.overview}
            </p>
          </div>
        )}

        {/* Cast */}
        {cast.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Cast
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
              {cast.slice(0, 8).map((c) => (
                <CastAvatarItem key={c.id} member={c} />
              ))}
            </div>
          </div>
        )}

        {/* Big Action Buttons */}
        <div className="flex items-center gap-3 pt-2 border-t border-white/10">
          <a
            href={
              file.telegramUrl && file.telegramUrl.includes('CinePrimeSeries_bot')
                ? file.telegramUrl
                : `https://t.me/CinePrimeSeries_bot?start=${file.channelMessageId ? 'get_' + file.channelMessageId : 'file_' + file.id}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <button className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-bold text-sm tracking-wide shadow-glow-cyan transition-all active:scale-95">
              <Send size={16} />
              <span>Get File in Telegram Bot</span>
            </button>
          </a>

          <button
            onClick={handleShare}
            aria-label="Share"
            className="p-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white border border-white/10 transition-colors"
          >
            <Share2 size={18} />
          </button>
        </div>
      </div>
    </Modal>
  );
};
