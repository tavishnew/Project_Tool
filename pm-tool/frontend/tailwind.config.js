/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F6F3EC",
        surface: "#FCFBF7",
        ink: "#1B1A17",
        muted: "#6B6862",
        line: "#E4E1DA",
        grid: "rgba(47,93,80,0.05)",
        pine: {
          DEFAULT: "#2F5D50",
          soft: "#D9E6DE",
          dark: "#20423A",
        },
        brick: {
          DEFAULT: "#B3402F",
          soft: "#F3DDD7",
        },
        gold: {
          DEFAULT: "#B8862E",
          soft: "#F1E4C8",
        },
      },
      boxShadow: {
        card: "0 1px 2px rgba(27,26,23,0.04), 0 1px 0 rgba(27,26,23,0.02)",
        pop: "0 12px 32px -8px rgba(32,66,58,0.28)",
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        sans: ["'Inter'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};
