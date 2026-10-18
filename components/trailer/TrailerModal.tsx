"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Film, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface TrailerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  videoId?: string | null;
}

export const TrailerModal: React.FC<TrailerModalProps> = ({
  isOpen,
  onClose,
  title,
  videoId,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Film className="text-primary-light" size={20} />
          <span>{title} — Official Trailer</span>
        </div>
      }
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {videoId ? (
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
              title={`${title} Official Trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              className="w-full h-full border-0"
            />
          </div>
        ) : (
          <div className="py-16 text-center space-y-4 bg-white/[0.02] border border-white/5 rounded-2xl p-6">
            <Film size={48} className="mx-auto text-slate-500 stroke-[1.5]" />
            <h3 className="text-lg font-semibold text-white">No Official Trailer Found</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              We couldn&apos;t verify an official embedded YouTube trailer for this series at this time.
            </p>
            <a
              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                `${title} official TV series trailer`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <Button variant="primary" icon={<ExternalLink size={16} />}>
                Search on YouTube
              </Button>
            </a>
          </div>
        )}

        {videoId && (
          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/5">
            <span>Official YouTube embedded player</span>
            <a
              href={`https://www.youtube.com/watch?v=${videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <span>Watch directly on YouTube</span>
              <ExternalLink size={12} />
            </a>
          </div>
        )}
      </div>
    </Modal>
  );
};
