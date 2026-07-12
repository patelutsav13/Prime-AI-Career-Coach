/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#030014',
        neonBlue: '#00d2ff',
        neonPurple: '#d200ff',
        neonCyan: '#00f6ff',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        glowBlue: '0 0 20px rgba(0, 210, 255, 0.25)',
        glowPurple: '0 0 20px rgba(210, 0, 255, 0.25)',
        glowCyan: '0 0 20px rgba(0, 246, 255, 0.25)',
      }
    },
  },
  plugins: [],
}
