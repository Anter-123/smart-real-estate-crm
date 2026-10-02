/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f8ff',
          100: '#ebf1fe',
          200: '#deeafe',
          300: '#c5d8fc',
          400: '#9ebdfa',
          500: '#6396f6',
          600: '#3b75eb',
          700: '#255bd8',
          800: '#1b45ab',
          900: '#123078',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        cairo: ['Cairo', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
