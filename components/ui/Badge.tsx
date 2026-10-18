import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "violet" | "cyan" | "success" | "warning" | "danger" | "glass";
  size?: "sm" | "md";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "glass",
  size = "md",
  className = "",
}) => {
  const variantStyles = {
    default: "bg-surface-800 text-slate-200 border-white/10",
    violet: "bg-primary/15 text-primary-light border-primary/30",
    cyan: "bg-accent/15 text-accent-light border-accent/30",
    success: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    warning: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    danger: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    glass: "bg-white/5 backdrop-blur-md text-slate-200 border-white/10",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs font-medium",
    md: "px-2.5 py-1 text-xs font-semibold tracking-wide",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};
