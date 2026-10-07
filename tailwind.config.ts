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
      fontFamily: {
        display: ['"Clash Display"', 'Satoshi', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        heading: ['"Clash Display"', 'Satoshi', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['Satoshi', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Satoshi', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        // Clash Display is a wide face: sized so the hero H1 stays ≤ 5 lines and the CTAs sit above the fold
        "display-xl": ["clamp(2.15rem, 1.15rem + 2.9vw, 3.9rem)", { lineHeight: "1.02", letterSpacing: "-0.02em" }],
        "display-l": ["clamp(1.9rem, 1.2rem + 2.6vw, 3.25rem)", { lineHeight: "1.02", letterSpacing: "-0.015em" }],
        h2: ["clamp(1.75rem, 1.2rem + 2.2vw, 3rem)", { lineHeight: "1.08", letterSpacing: "-0.01em" }],
        h3: ["clamp(1.25rem, 1.05rem + 0.8vw, 1.625rem)", { lineHeight: "1.2" }],
        "body-l": ["clamp(1.0625rem, 1rem + 0.3vw, 1.25rem)", { lineHeight: "1.55" }],
      },
      maxWidth: {
        content: "1280px",
        bleed: "1440px",
      },
      transitionTimingFunction: {
        paper: "cubic-bezier(0.22, 1, 0.36, 1)",
        fold: "cubic-bezier(0.65, 0, 0.35, 1)",
        exit: "cubic-bezier(0.4, 0, 1, 1)",
      },
      transitionDuration: {
        instant: "100ms",
        quick: "180ms",
        base: "280ms",
        slow: "480ms",
      },
      colors: {
        paper: {
          50: "#FBF8F3",
          100: "#F4EFE6",
          200: "#E9E1D3",
          muted: "#A9B4AC",
        },
        kraft: {
          300: "#D9BB91",
          400: "#C49A6C",
          700: "#8A6440",
        },
        ink: {
          500: "#4A5A50",
          800: "#17231C",
          900: "#0F1A14",
          950: "#0A120D",
        },
        green: {
          400: "#3DBA5A",
          500: "#2E9B47",
          600: "#23803A",
          700: "#1B6A2F",
        },
        cyan: {
          400: "#1FB5E0",
          700: "#066A8D",
        },
        warning: { 700: "#9A5B13" },
        error: { 700: "#B42318" },
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
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(30px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "count-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-up": "fade-up 0.6s ease-out forwards",
        "count-up": "count-up 0.4s ease-out forwards",
        marquee: "marquee 40s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
