/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Clean White UI Palette (Zepto Clone)
        "ui-background": "#ffffff",
        "ui-surface": "#f8f9fa",
        "text-primary": "#1f2937",
        "text-secondary": "#4b5563",
        "brand-primary": "#5A189A", // Zepto Purple

        // Map old variables so previous components don't violently crash immediately
        "oxford-blue": "#ffffff",
        "racing-green": "#f8f9fa",
        "champagne-gold": "#D4AF37",
        "cream-bone": "#1f2937",
        "neon-green": "#5A189A",
        "deep-charcoal": "#ffffff",
        "soft-gray": "#f8f9fa",
      },
    },
  },
  plugins: [],
};
