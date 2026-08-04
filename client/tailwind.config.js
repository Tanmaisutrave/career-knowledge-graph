/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        dark: {
          50:  "#e8eaf0",
          100: "#c5c9d6",
          200: "#9ea5b8",
          300: "#77819a",
          400: "#5a6680",
          500: "#3d4b66",
          600: "#2e3a52",
          700: "#1e2840",
          800: "#131c30",
          900: "#0a1020",
          950: "#060b15",
        },
        primary: {
          50:  "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        accent: {
          purple: "#a855f7",
          pink:   "#ec4899",
          cyan:   "#06b6d4",
          green:  "#10b981",
          orange: "#f59e0b",
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      backgroundImage: {
        "gradient-radial":  "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":   "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "mesh-gradient":    "linear-gradient(135deg, #0a1020 0%, #131c30 50%, #0a1020 100%)",
      },
      animation: {
        "fade-in":   "fadeIn 0.4s ease-in-out",
        "slide-up":  "slideUp 0.4s ease-out",
        "pulse-slow":"pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float":     "float 3s ease-in-out infinite",
        "spin-slow": "spin 8s linear infinite",
      },
      keyframes: {
        fadeIn:  { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: { "0%": { opacity: "0", transform: "translateY(20px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        float:   { "0%, 100%": { transform: "translateY(0px)" }, "50%": { transform: "translateY(-8px)" } },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
