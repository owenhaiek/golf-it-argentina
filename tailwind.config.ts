
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
          DEFAULT: "#2A4746",
          hover: "#1A2B2B",
          light: "#3A5756",
        },
        secondary: {
          DEFAULT: "#8DA399",
          hover: "#7B918D",
          light: "#9DB3A9",
        },
        accent: {
          DEFAULT: "#E8B87D",
          hover: "#D6A66B",
          light: "#F8C88D",
        },
        muted: {
          DEFAULT: "#F5F5F0",
          foreground: "#6B7280",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["SF Pro Display", "system-ui", "sans-serif"],
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.5s ease-out",
        slideUp: "slideUp 0.5s ease-out",
      },
      typography: (theme: any) => ({
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: theme('colors.foreground'),
            a: {
              color: theme('colors.primary'),
              '&:hover': {
                color: theme('colors.primary.hover'),
              },
            },
            h1: {
              color: theme('colors.foreground'),
              marginTop: '1.5em',
              marginBottom: '0.5em',
            },
            h2: {
              color: theme('colors.foreground'),
              marginTop: '1.5em',
              marginBottom: '0.5em',
            },
            h3: {
              color: theme('colors.foreground'),
              marginTop: '1.5em',
              marginBottom: '0.5em',
            },
          },
        },
      }),
    },
  },
  plugins: [require("tailwindcss-animate"), require('@tailwindcss/typography')],
} satisfies Config;
