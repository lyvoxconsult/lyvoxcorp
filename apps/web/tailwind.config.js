/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    screens: { sm: "640px", md: "768px", lg: "1024px", xl: "1280px", "2xl": "1536px" },
    extend: {
      colors: {
        border: { DEFAULT: "#bdd1de", subtle: "#334155" },
        brand: { DEFAULT: "#4180ab", accessible: "#35698d", 100: "#8ab3cf", 50: "#bdd1de", subtle: "#e4ebf0" },
        surface: { base: "#0b0f19", raised: "#111827", muted: "#1f2937" },
        status: { success: "#10b981", warning: "#f59e0b", error: "#ef4444", info: "#4180ab" },
      },
      fontFamily: {
        display: ['"Cormorant SC"', "Georgia", "serif"],
        heading: ['"Alegreya SC"', "Georgia", "serif"],
        sans: ["Rasa", "Georgia", "serif"],
        mono: ['"JetBrains Mono"', "Consolas", "monospace"],
      },
      fontSize: {
        display: ["32px", { lineHeight: "1.2", fontWeight: "700" }],
        h1: ["24px", { lineHeight: "1.3", fontWeight: "600" }],
        h2: ["20px", { lineHeight: "1.4", fontWeight: "600" }],
        h3: ["16px", { lineHeight: "1.4", fontWeight: "500" }],
        body: ["15px", { lineHeight: "1.5", fontWeight: "400" }],
        caption: ["13px", { lineHeight: "1.4", fontWeight: "400" }],
      },
      spacing: { 1: "4px", 2: "8px", 4: "16px", 6: "24px", 8: "32px", 12: "48px" },
    },
  },
  plugins: [],
};
