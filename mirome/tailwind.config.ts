import type { Config } from "tailwindcss";

/**
 * MIROME Team Intelligence design tokens.
 *
 * Same UI/UX system as DENGAR.ai (card grid, navy gradient header, KPI tiles
 * with an accent rail, flow tags, drawer + modals, phone-framed digital-human
 * experience) with a MIROME identity: deep indigo brand, violet for the AI /
 * digital-human layer, teal for evidence-confirmed outcomes, and a five-step
 * construct scale replacing DENGAR's sentiment scale.
 */
const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        indigo: { DEFAULT: "#22306E", deep: "#161F4C", light: "#2F3F8F" },
        violet: { DEFAULT: "#6B4EE6", soft: "#8A73F0" },
        teal: "#0E9F8F",
        gold: "#F2B705",
        // construct scale (Established Strength → Priority Attention)
        strength: "#1E9E52",
        functional: "#7FB13B",
        developing: "#E8A400",
        priority: "#C6222F",
        insufficient: "#A9B0BF",
        ink: "#17181C",
        grey: "#6B7180",
        line: "#E3E6EC",
        canvas: "#EEF0F4",
      },
      fontFamily: {
        sans: [
          "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto",
          "Helvetica Neue", "Arial", "sans-serif",
        ],
      },
      maxWidth: {
        dashboard: "1540px",
      },
    },
  },
  plugins: [],
};

export default config;
