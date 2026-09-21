/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        cinzel: ['Cinzel', 'serif'],
        serif: ['Playfair Display', 'Noto Serif SC', 'Songti SC', 'STSong', 'serif'],
      },
      colors: {
        parchment: {
          50: '#FDFBF7',
          100: '#FAF5EB',
          200: '#F4EBD9',
          300: '#EADBC4',
          400: '#DCC7A7',
          500: '#C7AF8A'
        },
        wax: {
          500: '#A51D38',
          600: '#8C1D35',
          700: '#6B1226',
          800: '#520B1C',
          900: '#3D0613'
        },
        gold: {
          100: '#FBF4DB',
          200: '#F7E7B0',
          300: '#EED485',
          400: '#E2BF5C',
          500: '#D4AF37',
          600: '#C5A059',
          700: '#997D3A'
        },
        oxford: {
          700: '#233348',
          800: '#182435',
          900: '#111A27'
        }
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'pulse-gentle': 'pulse-gentle 4s ease-in-out infinite',
        'shine': 'shine 4s linear infinite',
        'spin-slow': 'spin 30s linear infinite',
        'candle-flicker': 'candle 3s ease-in-out infinite alternate',
      },
      keyframes: {
        shine: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'pulse-gentle': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.03)', opacity: '0.88' },
        },
        candle: {
          '0%': { opacity: '0.85', transform: 'scale(1)' },
          '50%': { opacity: '0.98', transform: 'scale(1.04)' },
          '100%': { opacity: '0.78', transform: 'scale(0.98)' },
        }
      }
    },
  },
  plugins: [],
}
