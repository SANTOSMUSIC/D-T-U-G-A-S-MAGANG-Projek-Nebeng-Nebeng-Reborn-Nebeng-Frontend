/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F4EFF9',
          100: '#E4D5F2',
          500: '#6B2C91',
          600: '#4B2172', // Warna Utama Nebeng
          700: '#381757',
          900: '#1D0A2E',
        },
        slate: {
          canvas: '#F8F9FB',
          card: '#FFFFFF',
          subtle: '#F1F3F5',
          border: '#E2E8F0',
        },
        status: {
          success: { bg: '#ECFDF5', text: '#047857', border: '#A7F3D0' },
          warning: { bg: '#FFFBEB', text: '#B45309', border: '#FDE68A' },
          danger: { bg: '#FEF2F2', text: '#B91C1C', border: '#FECACA' },
          info: { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' },
        }
      },
      boxShadow: {
        'enterprise': '0 1px 2px 0 rgba(0, 0, 0, 0.05), 0 4px 6px -1px rgba(0, 0, 0, 0.02)',
        'enterprise-hover': '0 10px 25px -5px rgba(75, 33, 114, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
        'modal': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      }
    },
  },
  plugins: [],
};