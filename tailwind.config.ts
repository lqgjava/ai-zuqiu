import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['class'],
  theme: {
    extend: {
      colors: {
        // SofaScore-inspired dark theme palette
        primary: '#00b9ff',
        'primary-light': '#33ccff',
        'primary-dark': '#0099dd',
        secondary: '#1a7af2',
        accent: '#00e5ff',
        // Background hierarchy
        background: '#0a0e17',
        surface: '#111827',
        'surface-dark': '#0d1321',
        'surface-light': '#1a2332',
        // Neutral tones
        neutral: '#141929',
        'neutral-dark': '#0f1520',
        // Text hierarchy
        muted: '#8b95a5',
        'text-dim': '#5a6577',
        // Borders
        border: 'rgba(255,255,255,0.08)',
        'border-light': 'rgba(255,255,255,0.12)',
        // Semantic colors
        danger: '#ff1744',
        success: '#00c853',
        warning: '#ffab00',
        live: '#00e676',
        // Legacy compatibility (map to new tokens)
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)',
        'card-hover': '0 4px 16px rgba(0,185,255,0.12), 0 2px 8px rgba(0,0,0,0.4)',
        'data-block': '0 2px 8px rgba(0,185,255,0.08)',
        glow: '0 0 32px rgba(0,185,255,0.16)',
      },
      backgroundImage: {
        'pitch-stripes':
          'repeating-linear-gradient(90deg, rgba(0,185,255,0.02) 0px, rgba(0,185,255,0.02) 1px, transparent 1px, transparent 40px)',
        'stadium-glow':
          'radial-gradient(ellipse at 50% 0%, rgba(0,185,255,0.06) 0%, transparent 70%)',
        'hero-gradient':
          'linear-gradient(180deg, rgba(0,185,255,0.08) 0%, rgba(10,14,23,0) 50%)',
        'card-gradient':
          'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
        'grass-gradient':
          'linear-gradient(180deg, rgba(0,200,83,0.04) 0%, rgba(0,200,83,0) 30%)',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'San Francisco', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        sofascore: '2rem',
      },
    },
  },
  plugins: [typography],
};

export default config;
