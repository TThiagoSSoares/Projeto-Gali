/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#f1f6ff',
          100: '#dde9ff',
          200: '#b9d2ff',
          300: '#86b1ff',
          400: '#4f86ff',
          500: '#2a5cf5',
          600: '#1a42d1',
          700: '#1733a6',
          800: '#162d83',
          900: '#0f1f5c',
        },
        ink:   '#0b1020',
        paper: '#fbf8f2',
        rust:  '#c4513a',
        moss:  '#3e6b4a',
        amber: '#d99211',
      },
      boxShadow: {
        soft: '0 6px 24px -8px rgba(13,22,46,.18)',
        sharp: '0 2px 0 0 rgba(11,16,32,.9)',
      },
    },
  },
  plugins: [],
};
