import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "luxury-black": "#0A0A0F",
        "luxury-dark": "#1A1A2E",
        "luxury-card": "#16213E",
        "luxury-elevated": "#1F2937",
        gold: {
          DEFAULT: "#B8860B",
          light: "#D4AF37",
          dark: "#9B7506",
          muted: "#FFF8E7",
        },
        "text-primary": "#FFFFFF",
        "text-secondary": "#A0A0B0",
        "text-muted": "#6B7280",
        "text-disabled": "#4B5563",
        "border-subtle": "#2A2A4A",
        "border-default": "#374151",
        "border-gold": "#B8860B",
        success: "#10B981",
        error: "#EF4444",
        warning: "#F59E0B",
        info: "#3B82F6",
        primary: { dark: "#0A0A0F", light: "#16213E" },
        accent: { gold: "#B8860B", light: "#FFF8E7" },
        text: { primary: "#FFFFFF", secondary: "#A0A0B0", muted: "#6B7280" },
        status: { success: "#10B981", error: "#EF4444" },
        border: "#2A2A4A",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Playfair Display", "serif"],
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
        "88": "22rem",
        "100": "25rem",
        "112": "28rem",
        "128": "32rem",
      },
      boxShadow: {
        luxury: "0 4px 24px rgba(184, 134, 11, 0.08)",
        "luxury-lg": "0 8px 48px rgba(184, 134, 11, 0.12)",
        "gold-glow": "0 0 20px rgba(184, 134, 11, 0.3)",
        card: "0 2px 8px rgba(0, 0, 0, 0.4)",
      },
      backdropBlur: {
        xs: "2px",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        shimmer: "shimmer 2s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
