import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#070b10",
        panel: "#0e151d",
        panel2: "#121c25",
        border: "#263240",
        muted: "#8ea0b2",
        text: "#e7edf4",
        accent: "#4fb3d8",
        amber: "#d6a84f",
        danger: "#d85f5f",
        success: "#64b386"
      },
      boxShadow: {
        panel: "0 12px 32px rgba(0, 0, 0, 0.28)"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "Consolas", "monospace"]
      }
    }
  },
  plugins: []
};

export default config;
