/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#F2F1EC",
        ink: "#1C2B2A",
        pine: {
          DEFAULT: "#2F6F62",
          dark: "#1F4A41",
          light: "#E4EEEB",
        },
        ochre: {
          DEFAULT: "#B8860B",
          light: "#F3E8CE",
        },
        rule: "#D8D3C7",
        rust: "#B5453C",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
