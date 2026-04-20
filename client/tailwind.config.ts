import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'uno-red': '#ff2d4e',
        'uno-green': '#00c96b',
        'uno-blue': '#1a8cff',
        'uno-yellow': '#ffd000',
        'uno-dark': '#0d0d18',
        'surface': '#13131f',
        'surface-2': '#1a1a2e',
        'surface-3': '#22223a',
        'gold': '#d4af37',
        'gold-light': '#f0d060',
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        body: ['"Outfit"', 'sans-serif'],
        mono: ['"Space Mono"', 'monospace'],
      },
      boxShadow: {
        'card-red': '0 0 20px rgba(255,45,78,0.5), 0 4px 15px rgba(0,0,0,0.5)',
        'card-green': '0 0 20px rgba(0,201,107,0.5), 0 4px 15px rgba(0,0,0,0.5)',
        'card-blue': '0 0 20px rgba(26,140,255,0.5), 0 4px 15px rgba(0,0,0,0.5)',
        'card-yellow': '0 0 20px rgba(255,208,0,0.5), 0 4px 15px rgba(0,0,0,0.5)',
        'card-wild': '0 0 20px rgba(150,50,255,0.5), 0 4px 15px rgba(0,0,0,0.5)',
        'neon-gold': '0 0 15px rgba(212,175,55,0.6)',
      },
      backgroundImage: {
        'felt': 'radial-gradient(ellipse at center, #1a2e1a 0%, #0f1a0f 60%, #080f08 100%)',
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E\")",
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 2s infinite',
        'float-slow': 'float 8s ease-in-out 1s infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        'fade-in': 'fade-in 0.3s ease-out',
        'card-deal': 'card-deal 0.4s cubic-bezier(0.34,1.56,0.64,1)',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(5deg)' },
        },
        'glow-pulse': {
          '0%,100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(20px) scale(0.95)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'card-deal': {
          from: { opacity: '0', transform: 'translateY(40px) scale(0.8) rotate(-5deg)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1) rotate(0deg)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
