/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        "neon-green": "#39FF14",
        "deep-charcoal": "#121212",
        "soft-gray": "#1E1E1E",
      },
    },
  },
  plugins: [],
};
