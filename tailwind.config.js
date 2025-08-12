/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'montserrat': ['Montserrat', 'sans-serif'],
        'roboto': ['Roboto', 'sans-serif'],
      },
      colors: {
        'bg-primary': '#0d0d0d',
        'bg-secondary': '#1a1a1a',
        'bg-card': '#1f1f1f',
        'accent-pink': '#ff005c',
        'accent-gold': '#ffc107',
        'text-primary': '#e0e0e0',
        'text-muted': '#a0a0a0',
        'border-color': '#333333',
      },
      animation: {
        'glitch': 'glitch 0.3s ease-in-out',
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      boxShadow: {
        'neon-pink': '0 0 20px rgba(255, 0, 92, 0.3), 0 0 40px rgba(255, 0, 92, 0.3), 0 0 60px rgba(255, 0, 92, 0.3)',
        'neon-gold': '0 0 20px rgba(255, 193, 7, 0.3), 0 0 40px rgba(255, 193, 7, 0.3), 0 0 60px rgba(255, 193, 7, 0.3)',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
};