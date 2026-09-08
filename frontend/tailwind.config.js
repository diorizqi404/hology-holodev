/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#fcfcf9',
        primary: {
          DEFAULT: '#1a361f',
          light: '#e6f4d1',
          hover: '#2a4d32'
        },
        surface: '#ffffff',
      }
    },
  },
  plugins: [],
}