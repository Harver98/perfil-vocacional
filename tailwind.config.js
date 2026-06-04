/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      colors: {
        uis: {
          50:  '#f2faeb',
          100: '#e0f3cf',
          200: '#c2e8a1',
          300: '#9dd96a',
          400: '#7ec73e',
          500: '#67B93E',
          600: '#4f9a2b',
          700: '#3d7820',
          800: '#2e5c18',
          900: '#1e3d0e',
        },
        brand: {
          50:  '#f2faeb',
          100: '#e0f3cf',
          200: '#c2e8a1',
          300: '#9dd96a',
          400: '#7ec73e',
          500: '#67B93E',
          600: '#4f9a2b',
          700: '#3d7820',
          800: '#2e5c18',
          900: '#1e3d0e',
        },
      },
      animation: {
        'fade-up':    'fadeUp 0.5s ease-out forwards',
        'fade-in':    'fadeIn 0.4s ease-out forwards',
        'scale-in':   'scaleIn 0.3s ease-out forwards',
        'bounce-soft':'bounceSoft 0.6s ease-out',
      },
      keyframes: {
        fadeUp:    { '0%': { opacity:'0', transform:'translateY(20px)' }, '100%': { opacity:'1', transform:'translateY(0)' } },
        fadeIn:    { '0%': { opacity:'0' }, '100%': { opacity:'1' } },
        scaleIn:   { '0%': { opacity:'0', transform:'scale(0.9)' }, '100%': { opacity:'1', transform:'scale(1)' } },
        bounceSoft:{ '0%,100%': { transform:'translateY(0)' }, '50%': { transform:'translateY(-8px)' } },
      },
    },
  },
  plugins: [],
}
