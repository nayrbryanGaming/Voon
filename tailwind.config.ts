import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "voon-primary": "#2563EB",
        "voon-primary-light": "#3B82F6",
        "voon-primary-dark": "#1D4ED8",
        "voon-accent": "#10B981",
        "voon-accent-warm": "#F59E0B",
        "voon-danger": "#EF4444",
        "voon-bg": "#0A0F1E",
        "voon-bg-card": "#111827",
        "voon-bg-elevated": "#1F2937",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        serif: ["Instrument Serif", "Georgia", "serif"],
        mono: ["IBM Plex Mono", "Consolas", "monospace"],
        sans: ["Geist", "system-ui", "sans-serif"],
      },
      keyframes: {
        "pulse-ring": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
        "slide-in-right": {
          from: { transform: "translateX(100%)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
        waveform: {
          "0%, 100%": { transform: "scaleY(1)" },
          "50%": { transform: "scaleY(2)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pop": {
          "0%": { transform: "scale(0.95)" },
          "40%": { transform: "scale(1.02)" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        "pulse-ring": "pulse-ring 2s ease-in-out infinite",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        waveform: "waveform 1s ease-in-out infinite",
        "fade-in-up": "fade-in-up 0.5s ease-out forwards",
        "pop": "pop 0.3s ease-out forwards",
      },
      backgroundImage: {
        "hero-gradient": "linear-gradient(135deg, #0A0F1E 0%, #0F172A 40%, #0D1B4B 100%)",
        "card-gradient": "linear-gradient(145deg, rgba(37,99,235,0.1), rgba(16,185,129,0.05))",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
