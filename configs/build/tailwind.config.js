/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["../../index.html", "../../src/**/*.{js,ts,jsx,tsx}"],
  safelist: [
    "text-purple-900",
    "text-purple-700",
    "text-purple-600",
    "text-purple-500",
    "bg-purple-50",
    "bg-purple-100",
    "border-purple-200",
    "ring-purple-300",
    "hover:border-fuchsia-500",
    "hover:border-cyan-500",
  ],
  darkMode: false,
  theme: {
    extend: {
      fontFamily: {
        inter: [
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
      colors: {
        // Violet Vault Design System Colors - Budget & Finance Focus
        violet: {
          50: "#faf5ff",
          100: "#f3e8ff",
          200: "#e9d5ff",
          300: "#d8b4fe",
          400: "#c084fc",
          500: "#a855f7",
          600: "#9333ea",
          700: "#7e22ce",
          800: "#6b21a8",
          900: "#581c87",
        },
      },
    },
  },
  plugins: [],
};
