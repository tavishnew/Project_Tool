/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#F5F7FA',
        surface: '#FFFFFF',
        ink: '#141B2D',
        muted: '#6B7A8F',
        line: '#E2E7EE',
        primary: {
          DEFAULT: '#1E3A5F',
          soft: '#EAF0F6',
          dark: '#152B47',
        },
        accent: '#3DDC97',
        todo: '#6B7A8F',
        progress: '#3DDC97',
        done: '#2E86AB',
        overdue: '#E4572E',
      },
      fontFamily: {
        display: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(20,27,45,0.04), 0 1px 0 rgba(20,27,45,0.03)',
        pop: '0 18px 40px -16px rgba(21,43,71,0.35)',
      },
      borderRadius: {
        xl: '14px',
      },
    },
  },
  plugins: [],
};
