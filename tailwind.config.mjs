import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Test Bench palette
        void: '#06080b',
        panel: '#0d1117',
        panel2: '#131b23',
        line: '#1d2731',
        'line-bright': '#2c3b47',
        ink: '#e8eae3',
        muted: '#8b97a1',
        dim: '#566069',
        signal: {
          DEFAULT: '#a8e84d',
          dim: '#6f9a33',
          glow: '#c7ff6e',
        },
        scope: '#3ad6e6',
        amber: '#ffb43a',
        magenta: '#ff5d8f',
        // back-compat: any stray `brand` usage stays on-theme
        brand: {
          DEFAULT: '#a8e84d',
          dark: '#6f9a33',
        },
      },
      fontFamily: {
        display: ['Archivo', 'system-ui', 'sans-serif'],
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        widest2: '0.28em',
      },
    },
  },
  plugins: [typography],
};
