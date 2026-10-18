import React from "react";

interface SkeletonProps {
  className?: string;
  variant?: "rectangular" | "circular" | "card";
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = "",
  variant = "rectangular",
}) => {
  const base = "animate-pulse bg-white/5 border border-white/5";

  if (variant === "circular") {
    return <div className={`${base} rounded-full ${className}`} />;
  }

  if (variant === "card") {
    return (
      <div className={`flex flex-col gap-3 rounded-2xl p-3 bg-white/[0.03] border border-white/10 ${className}`}>
        <div className="w-full aspect-[2/3] rounded-xl bg-white/10" />
        <div className="h-4 w-3/4 rounded bg-white/10 mt-1" />
        <div className="h-3 w-1/2 rounded bg-white/5" />
      </div>
    );
  }

  return <div className={`${base} rounded-xl ${className}`} />;
};
