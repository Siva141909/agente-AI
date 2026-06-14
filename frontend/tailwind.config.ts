import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1440px" },
    },
    extend: {
      colors: {
        // ── shadcn required tokens ──────────────────────────────────────
        border:     "hsl(var(--border))",
        input:      "hsl(var(--input))",
        ring:       "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT:    "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT:    "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT:    "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT:    "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT:    "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT:    "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT:    "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: {
          DEFAULT:    "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT:    "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        income:  "hsl(var(--income))",
        expense: "hsl(var(--expense))",

        // ── Agente AI design tokens ─────────────────────────────────────
        // Surfaces
        surface:   "hsl(var(--surface))",
        "surface-2": "hsl(var(--surface-2))",

        // Accent palette
        cyan: {
          DEFAULT: "#00D4FF",
          dim:     "rgba(0,212,255,0.15)",
          mid:     "rgba(0,212,255,0.25)",
        },
        violet: {
          DEFAULT: "#7B2FFF",
          dim:     "rgba(123,47,255,0.12)",
          mid:     "rgba(123,47,255,0.20)",
        },
        warm: {
          DEFAULT: "#FF6B35",
        },
        "neon-green": "#00FF88",
        danger:       "#FF3366",

        // Text
        "text-primary":   "#E8F4FF",
        "text-secondary": "#6B8CAE",
        "text-muted-dark": "#334D6E",
      },

      fontFamily: {
        sans:    ["Inter", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "Inter", "system-ui", "sans-serif"],
        mono:    ["JetBrains Mono", "Fira Code", "Consolas", "monospace"],
      },

      // Strict radius system: cards=8px, inputs=4px, tables=0px
      borderRadius: {
        none:  "0px",
        sm:    "4px",
        DEFAULT: "8px",
        md:    "8px",
        lg:    "8px",
        xl:    "8px",
        "2xl": "8px",
        "3xl": "8px",
        full:  "9999px",
      },

      boxShadow: {
        "glow-cyan":    "0 0 20px rgba(0,212,255,0.15)",
        "glow-cyan-md": "0 0 30px rgba(0,212,255,0.30)",
        "glow-cyan-lg": "0 0 50px rgba(0,212,255,0.40)",
        "glow-violet":  "0 0 20px rgba(123,47,255,0.12)",
        "glow-violet-md":"0 0 30px rgba(123,47,255,0.25)",
        "glow-green":   "0 0 20px rgba(0,255,136,0.15)",
        "glow-warm":    "0 0 20px rgba(255,107,53,0.20)",
        none:           "none",
      },

      keyframes: {
        // shadcn accordion
        "accordion-down": {
          from: { height: "0" },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: "0" },
        },
        // Agent status indicator
        "pulse-dot": {
          "0%, 100%": { transform: "scale(1)",   opacity: "1"   },
          "50%":      { transform: "scale(1.35)", opacity: "0.6" },
        },
        // Skeleton shimmer
        shimmer: {
          "0%":   { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0"  },
        },
        // Page enter transition
        "page-in": {
          "0%":   { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)"    },
        },
        // Landing ticker
        ticker: {
          "0%":   { transform: "translateX(0)"    },
          "100%": { transform: "translateX(-50%)" },
        },
        // Subtle card border glow
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 8px rgba(0,212,255,0.08)"  },
          "50%":      { boxShadow: "0 0 20px rgba(0,212,255,0.25)" },
        },
        // Draw-in for charts
        "draw-in": {
          from: { clipPath: "inset(0 100% 0 0)" },
          to:   { clipPath: "inset(0 0% 0 0)"   },
        },
      },

      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
        "pulse-dot":      "pulse-dot 1.5s ease-in-out infinite",
        shimmer:          "shimmer 1.8s linear infinite",
        "page-in":        "page-in 0.3s ease-out forwards",
        ticker:           "ticker 40s linear infinite",
        "glow-pulse":     "glow-pulse 3s ease-in-out infinite",
      },

      backgroundImage: {
        "shimmer-base":
          "linear-gradient(90deg, transparent 25%, hsl(var(--muted)) 50%, transparent 75%)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
