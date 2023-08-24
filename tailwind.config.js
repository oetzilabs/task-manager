/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [
    // default prefix is "ui"
    require("@kobalte/tailwindcss"),
    // or with a custom prefix:
    require("@kobalte/tailwindcss")({ prefix: "kb" }),
  ],
};
