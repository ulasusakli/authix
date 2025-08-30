/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: { center: true, padding: "2rem" },
    extend: {
      borderRadius: { xl: "1rem", "2xl": "1.5rem" },
    },
  },
  plugins: [require("tailwindcss-animate")],
};