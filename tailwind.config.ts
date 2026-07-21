import type { Config } from "tailwindcss";

/**
 * DENGAR.ai design tokens — derived from the two approved prototypes
 * (public/prototypes/*). The Malaysian flag / MADANI palette is the
 * product's visual identity across the citizen experience and the dashboard.
 */
const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: "#1B2A6B", deep: "#121C4A", light: "#24368a" },
        red: { DEFAULT: "#D22030", flag: "#E4002B" },
        gold: "#FFCC00",
        wood: { dark: "#3E2617", mid: "#6E4226", light: "#A9713F" },
        mic: "#5B5FE9",
        // dashboard semantic (sentiment / status)
        positive: "#1E9E52",
        amber: "#E8A400",
        negative: "#D22030",
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
