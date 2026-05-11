import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['class'],
  theme: {
    extend: {
      colors: {
        // SofaScore inspired color palette
        primary: '#1F4FA1',      // Deep blue (nav/primary actions)
        'primary-light': '#2563EB', // Lighter blue for hover states
        'primary-dark': '#1a3f81',  // Darker blue
        secondary: '#0EA5E9',    // Sky blue (accent data blocks)
        accent: '#06B6D4',       // Cyan (highlights)
        neutral: '#F0F2F5',      // Light background
        'neutral-dark': '#E5E7EB', // Light gray
        border: '#D1D5DB',       // Border color
        background: '#FFFFFF',   // White background
        surface: '#F9FAFB',      // Off-white surface
        'surface-dark': '#F3F4F6', // Slightly darker surface
        muted: '#6B7280',        // Muted text
        danger: '#EF4444',       // Red/danger
        success: '#10B981',      // Green/success
        warning: '#F59E0B',      // Amber/warning
      },
      boxShadow: {
        card: '0 4px 6px rgba(0, 0, 0, 0.07)',
        'card-hover': '0 10px 15px rgba(0, 0, 0, 0.1)',
        'data-block': '0 2px 8px rgba(31, 79, 161, 0.12)',
      },
      backgroundColor: {
        'data-highlight': 'rgba(14, 165, 233, 0.1)',
        'success-light': 'rgba(16, 185, 129, 0.1)',
        'danger-light': 'rgba(239, 68, 68, 0.1)',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'San Francisco', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [typography],
};

export default config;
