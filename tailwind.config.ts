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
        primary: "#FC90B6",
        "primary-dark": "#F870A0",
        "primary-light": "#FFAECB",
        "primary-lighter": "#FFD0E5",
        secondary: "#1A1A1A",
        "secondary-light": "#2D2D2D",
        "secondary-lighter": "#4A4A4A",
        accent: "#FFFFFF",
      },
      fontFamily: {
        montserrat: ["var(--font-montserrat)"],
        talina: ["var(--font-talina)", "sans-serif"],
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
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-8px)' },
          '40%': { transform: 'translateX(8px)' },
          '60%': { transform: 'translateX(-5px)' },
          '80%': { transform: 'translateX(5px)' },
        },
        'pop-in': {
          '0%': { opacity: '0', transform: 'translateY(6px) scale(0.96)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
      animation: {
        'wiggle-slow': 'wiggle 3s ease-in-out infinite',
        'pulse-slow': 'pulse-slow 2s ease-in-out infinite',
        shake: 'shake 0.45s ease-in-out 1',
        'pop-in': 'pop-in 0.35s ease-out',
      },
    },
  },
  plugins: [],
};
export default config;
