import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
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
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Racing theme colors
        neonGreen: "hsl(var(--neon-green))",
        neonYellow: "hsl(var(--neon-yellow))",
        racingGray: "hsl(var(--racing-gray))",
        trackDark: "hsl(var(--track-dark))",
        winnerGlow: "hsl(var(--winner-gold))",
        // Racing utility colors (mapped for component usage)
        "racing-dark": "hsl(var(--track-dark))",
        "racing-green": "hsl(var(--neon-green))",
        "racing-yellow": "hsl(var(--neon-yellow))",
        "racing-red": "hsl(var(--destructive))",
        "racing-gray": "hsl(var(--racing-gray))",
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "winner-pulse": "winner-pulse 2s ease-in-out infinite",
        "card-enter": "card-enter 0.6s ease-out",
        "neon-glow": "neon-glow 3s ease-in-out infinite",
        "race-countdown": "race-countdown 1s ease-out",
      },
      backgroundImage: {
        "gradient-racing": "var(--gradient-racing)",
        "gradient-winner": "var(--gradient-winner)",
        "gradient-card": "var(--gradient-card)",
      },
      boxShadow: {
        "neon": "var(--shadow-neon)",
        "yellow": "var(--shadow-yellow)",
        "card": "var(--shadow-card)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
