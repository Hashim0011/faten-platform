/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#8B7355',
          light: '#D2B48C',
          dark: '#654321',
        }
      },
    },
  },
  plugins: [],
};