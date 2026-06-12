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
        primary: "#ff9ec5",
        "primary-dark": "#f07db0",
        "primary-light": "#ffb8d4",
        "primary-lighter": "#ffe0ee",
        secondary: "#0a1133",
        "secondary-light": "#0f1844",
        "secondary-lighter": "#4a5c7e",
        cream: "#f7f4dd",
        blue: "#0077ba",
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
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-0.7deg)' },
          '50%': { transform: 'rotate(0.7deg)' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.92', transform: 'scale(1.02)' },
        },
      },
      animation: {
        'wiggle-slow': 'wiggle 3s ease-in-out infinite',
        'pulse-slow': 'pulse-slow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
export default config;
