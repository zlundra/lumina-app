/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        malux: {
          bg:       '#0a0a0f',
          surface:  '#12121a',
          surface2: '#1a1a26',
          surface3: '#222235',
          border:   '#2a2a3f',
          purple:   '#7c5cfc',
          purplelight: '#9d84fd',
          pink:     '#fc5c7d',
          mint:     '#5cfcb8',
          amber:    '#fcb85c',
          text:     '#e8e8f4',
          muted:    '#6a6a8a',
          faint:    '#3a3a55',
        }
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        mono:    ['DM Mono', 'monospace'],
        body:    ['DM Sans', 'sans-serif'],
      },
      backgroundImage: {
        'malux-grid': `
          repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(124,92,252,0.06) 40px),
          repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(124,92,252,0.06) 40px)
        `,
      },
      animation: {
        'fade-in':    'fadeIn 0.4s ease forwards',
        'slide-up':   'slideUp 0.4s ease forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'glow':       'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        glow:    { from: { boxShadow: '0 0 8px rgba(124,92,252,0.3)' }, to: { boxShadow: '0 0 24px rgba(124,92,252,0.6)' } },
      },
      boxShadow: {
        'malux': '0 4px 24px rgba(124,92,252,0.15)',
        'malux-lg': '0 8px 48px rgba(124,92,252,0.25)',
        'inner-purple': 'inset 0 1px 0 rgba(124,92,252,0.2)',
      }
    },
  },
  plugins: [],
}
