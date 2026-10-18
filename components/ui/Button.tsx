import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "glass" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  children?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "glass",
  size = "md",
  icon,
  children,
  fullWidth = false,
  className = "",
  disabled,
  ...props
}) => {
  const variantStyles = {
    primary:
      "bg-gradient-to-r from-primary to-primary-dark text-white hover:brightness-110 shadow-glow-violet active:scale-[0.98]",
    secondary:
      "bg-gradient-to-r from-accent to-accent-dark text-black font-semibold hover:brightness-110 shadow-glow-cyan active:scale-[0.98]",
    glass:
      "bg-white/10 hover:bg-white/15 text-white border border-white/10 backdrop-blur-md active:scale-[0.98]",
    outline:
      "border border-white/20 text-slate-200 hover:bg-white/5 active:scale-[0.98]",
    danger:
      "bg-rose-600/80 hover:bg-rose-600 text-white border border-rose-500/40 active:scale-[0.98]",
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5",
    md: "px-4 py-2 text-sm rounded-xl gap-2",
    lg: "px-6 py-3 text-base rounded-2xl gap-2.5",
  };

  return (
    <button
      className={`inline-flex items-center justify-center font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
        variantStyles[variant]
      } ${sizeStyles[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
};
