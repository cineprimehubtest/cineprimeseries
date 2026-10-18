"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl";
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "2xl",
  className = "",
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    "2xl": "max-w-5xl",
    "4xl": "max-w-6xl",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`relative w-full ${maxWidthStyles[maxWidth]} max-h-[92vh] flex flex-col rounded-3xl bg-slate-950/85 border border-white/10 shadow-glass overflow-hidden text-slate-100 ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - only show if title is provided */}
        {title ? (
          <div className="flex items-center justify-between p-4 md:p-5 border-b border-white/10 shrink-0 bg-white/[0.02]">
            <div className="text-base md:text-lg font-bold tracking-tight text-white flex-1 pr-4">
              {title}
            </div>
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        ) : null}

        {/* Content body */}
        <div className={`overflow-y-auto custom-scrollbar flex-1 ${title ? "p-4 md:p-6" : "p-4 md:p-5"}`}>
          {children}
        </div>
      </div>
    </div>
  );
};
