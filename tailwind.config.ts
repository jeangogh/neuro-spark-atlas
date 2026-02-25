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
        display: ['Fraunces', 'Georgia', 'serif'],
        body: ['DM Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
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
        profile: {
          1: "hsl(var(--profile-1))",
          2: "hsl(var(--profile-2))",
          3: "hsl(var(--profile-3))",
          4: "hsl(var(--profile-4))",
          5: "hsl(var(--profile-5))",
          6: "hsl(var(--profile-6))",
          7: "hsl(var(--profile-7))",
        },
        /* ── Gifted Lab design tokens — organic edition ── */
        ember: {
          950: "hsl(28 33% 10%)",
          800: "hsl(28 30% 18%)",
          700: "hsl(31 53% 45%)",
          600: "hsl(31 53% 54%)",
          500: "hsl(31 53% 64%)",
          400: "hsl(31 50% 74%)",
          200: "hsl(41 35% 88%)",
          50:  "hsl(41 35% 96%)",
        },
        /* Keep insight as alias */
        insight: {
          700: "hsl(154 24% 30%)",
          500: "hsl(154 24% 38%)",
          400: "hsl(154 24% 50%)",
          200: "hsl(154 20% 70%)",
          50:  "hsl(41 35% 96%)",
        },
        eco: {
          950: "hsl(28 33% 7%)",
          800: "hsl(28 30% 14%)",
          700: "hsl(28 25% 18%)",
          600: "hsl(28 20% 22%)",
          400: "hsl(79 5% 50%)",
          300: "hsl(31 53% 64%)",
          200: "hsl(41 25% 78%)",
        },
        clarity: "hsl(154 24% 38%)",
        alert:   "hsl(0 70% 58%)",
        info:    "hsl(213 73% 59%)",
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
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
