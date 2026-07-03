/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Boardly's own palette — a cool paper background with a deep-teal
        // brand color and a warm signal-amber accent for priority/status.
        paper: "#F3F5F4",
        ink: "#14201E",
        line: "#D8E3E0",
        teal: {
          50: "#EAF3F2",
          100: "#CFE4E2",
          400: "#2C8B85",
          600: "#1F6F6B",
          700: "#175652",
        },
        signal: {
          amber: "#E8A33D",
          coral: "#E15B4F",
          slate: "#6B7A83",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};
