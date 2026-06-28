/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        iris: {
          blue: '#1d4ed8',
          light: '#3b82f6',
          dark: '#1e3a8a',
        }
      }
    }
  },
  plugins: []
}
