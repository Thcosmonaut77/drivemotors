/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff1ed',
          100: '#ffe0d4',
          200: '#ffc5a8',
          300: '#ffa071',
          400: '#ff7138',
          500: '#ff3c00',
          600: '#e63600',
          700: '#bf2b00',
          800: '#992400',
          900: '#7a2000',
        }
      }
    },
  },
  plugins: [],
}
