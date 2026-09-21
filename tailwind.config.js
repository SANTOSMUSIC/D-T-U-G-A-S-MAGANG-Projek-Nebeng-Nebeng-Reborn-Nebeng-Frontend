/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        /* Palet: Royal Blue #10367D · Light Grey #EBEBEB · Sky Blue #74B4D9 */
        brand: {
          50:  '#F4F7FA',
          100: '#EBEBEB',  // Light Grey
          200: '#D3E4F0',
          300: '#A8CDE5',
          400: '#74B4D9',  // Sky Blue
          500: '#4A8CC0',
          600: '#2E6AAA',
          700: '#1D4F94',
          800: '#164289',
          900: '#10367D',  // Royal Blue
          950: '#0B2757',
        },
      },
      fontFamily: {
        /* fallback sans-serif, biar kalau font gagal load tidak jatuh ke serif */
        display: ['"Baloo 2"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};