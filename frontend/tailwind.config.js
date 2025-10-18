/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        inter: ['Inter', 'sans-serif']
      },
      colors: {
        'brand-forest-green': '#226A2E', // Primary
        'brand-dark-green': '#0E2F23',   // Secondary
        'brand-teal-blue': '#54A0B3',    // Accent
        'brand-sky-blue': '#8FC9DC',     // Section backgrounds
        'brand-light-aqua': '#C7E4EB',   // Footer / subtle
        // Keep some friendly utility shades
        'muted-forest': '#EAF5EA'
      },
    },
  },
  plugins: [],
} 