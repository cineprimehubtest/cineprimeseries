import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#060913",
        "background-secondary": "#0c1222",
        "card-bg": "rgba(15, 23, 42, 0.65)",
        "card-border": "rgba(255, 255, 255, 0.08)",
        primary: {
          DEFAULT: "#8b5cf6", // Electric violet
          dark: "#7c3aed",
          light: "#a78bfa",
        },
        accent: {
          DEFAULT: "#06b6d4", // Soft cyan
          dark: "#0891b2",
          light: "#22d3ee",
        },
        surface: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          800: "#1e293b",
          900: "#0f172a",
          950: "#060913",
        },
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "Inter", "system-ui", "-apple-system", "sans-serif"],
        serif: ["'Playfair Display'", "Georgia", "serif"],
        display: ["Cinzel", "'Playfair Display'", "serif"],
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        "glass-sm": "0 4px 16px 0 rgba(0, 0, 0, 0.25)",
        "glow-violet": "0 0 25px -5px rgba(139, 92, 246, 0.5)",
        "glow-cyan": "0 0 25px -5px rgba(6, 182, 212, 0.5)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "scale-up": "scaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleUp: {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
