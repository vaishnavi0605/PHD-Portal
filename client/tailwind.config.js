/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Outfit', 'sans-serif'],
      },
      colors: {
        primary: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        dark: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          700: '#334155',
          800: '#1e293b',
          850: '#172033',
          900: '#0f172a',
          950: '#080d1a',
        },
        accent: {
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
        },
        success: { 500: '#22c55e', 600: '#16a34a' },
        warning: { 500: '#f59e0b', 600: '#d97706' },
        danger:  { 500: '#ef4444', 600: '#dc2626' },
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #080d1a 0%, #0f172a 50%, #172033 100%)',
        'card-gradient': 'linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
        'primary-gradient': 'linear-gradient(135deg, #4f46e5, #7c3aed)',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.37)',
        'glow': '0 0 20px rgba(99, 102, 241, 0.4)',
        'glow-sm': '0 0 10px rgba(99, 102, 241, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        shimmer: { from: { backgroundPosition: '-200% 0' }, to: { backgroundPosition: '200% 0' } },
      },
    },
  },
  plugins: [],
}
