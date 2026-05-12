import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Text"',
          '"SF Pro Display"',
          "system-ui",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Helvetica",
          "Arial",
          "sans-serif"
        ]
      },
      colors: {
        brand: {
          400: "#f87171",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c"
        }
      },
      keyframes: {
        welcomeFadeUp: {
          "0%": { opacity: "0", transform: "translateY(22px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        welcomeGradientShift: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" }
        },
        welcomeOrbPulse: {
          "0%, 100%": { opacity: "0.35", transform: "scale(1)" },
          "50%": { opacity: "0.55", transform: "scale(1.06)" }
        },
        welcomeLineGrow: {
          "0%": { transform: "scaleX(0)", opacity: "0" },
          "100%": { transform: "scaleX(1)", opacity: "1" }
        }
      },
      animation: {
        "welcome-fade-up":
          "welcomeFadeUp 0.85s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "welcome-fade-up-delay":
          "welcomeFadeUp 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.14s forwards",
        "welcome-fade-up-delay-2":
          "welcomeFadeUp 0.95s cubic-bezier(0.22, 1, 0.36, 1) 0.32s forwards",
        "welcome-gradient": "welcomeGradientShift 7s ease-in-out infinite",
        "welcome-orb": "welcomeOrbPulse 10s ease-in-out infinite",
        "welcome-line": "welcomeLineGrow 1s cubic-bezier(0.22, 1, 0.36, 1) 0.45s forwards"
      }
    }
  },
  plugins: []
};

export default config;
