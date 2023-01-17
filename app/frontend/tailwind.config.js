const colors = require("tailwindcss/colors");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: colors.slate,
      },
      fontFamily: {
        sans: ["Neucha", "sans-serif"],
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
