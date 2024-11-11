/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",        // Include the root HTML file
    "./*.{js,ts,jsx,tsx}", // Include all JS, JSX, TS, and TSX files in the root folder
  ],
  theme: {
    extend: {
      colors: {
        darkGreen: '#043927',
        gold: '#c4b581',
        white: '#ffffff',
        darkGray: '#333333',  /* Dark gray color */
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}