/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Gold Colors
        gold: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        // Custom Gold
        'gold-light': '#ffd875',
        'gold-dark': '#ffb347',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(to right, rgb(255, 216, 117), rgb(255, 179, 71))',
        'gold-gradient-vertical': 'linear-gradient(to bottom, rgb(255, 216, 117), rgb(255, 179, 71))',
        'dark-gold-gradient': 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #ffd875 100%)',
      },
      boxShadow: {
        'gold': '0 4px 14px 0 rgba(255, 216, 117, 0.39)',
        'gold-lg': '0 10px 25px -3px rgba(255, 216, 117, 0.3), 0 4px 6px -2px rgba(255, 179, 71, 0.05)',
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' }
        }
      },
      animation: {
        'shimmer': 'shimmer 2s infinite'
      },
      screens: {
        'xs': { 'max': '480px' },
      }
    },
  },
  plugins: [],
}
