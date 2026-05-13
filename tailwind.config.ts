import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./providers/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#FF9EC5",
        "primary-dark": "#FF85B7",
        "primary-light": "#FFB6D9",
        "primary-lighter": "#FFD6E8",
        secondary: "#1A1A1A",
        "secondary-light": "#2D2D2D",
        "secondary-lighter": "#3F3F3F",
        accent: "#FFFFFF",
      },
      fontFamily: {
        montserrat: ["var(--font-montserrat)"],
      },
      fontWeight: {
        black: "900",
      },
      letterSpacing: {
        tighter: "-0.05em",
      },
    },
  },
  plugins: [],
};
export default config;
