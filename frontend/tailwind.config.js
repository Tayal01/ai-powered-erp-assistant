/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#102227",
        "ink-2": "#12323a",
        cream: "#f4efe8",
        surface: "#f8faf9",
        "brand-orange": "#d9773f",
        "brand-green": "#4b8b69",
        "brand-brick": "#b44e46",
        teal: "#0b7ea3",
        grass: "#2f9e6b",
        amber: "#d16f24",
        rose: "#cc4136",
        plum: "#7d54c9",
      },
      fontFamily: {
        sans: ["Manrope", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
