/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Teal (тіл) — основний акцент
        teal: {
          50: '#effbf9',
          100: '#c8f3ed',
          200: '#9ce6dd',
          300: '#69d4c8',
          400: '#3fbdb0',
          500: '#1fa69a',
          600: '#16857c',
          700: '#0f3a3a',
          800: '#0c2e2e',
          900: '#082222',
          950: '#041111',
        },
        // Copper (мідь) — додатковий акцент
        copper: {
          50: '#fbf3ed',
          100: '#f4ddc8',
          200: '#e9b893',
          300: '#dc8e5a',
          400: '#cf7438',
          500: '#b85f29',
          600: '#9a4a1c',
          700: '#7c3915',
          800: '#5e2b10',
          900: '#3f1d0a',
          950: '#1f0e05',
        },
        // Нейтральна темна палітра
        ink: {
          50: '#f5f7fa',
          100: '#e7ecf2',
          200: '#c8d1dc',
          300: '#9aa7b8',
          400: '#6c7a8e',
          500: '#4b5a70',
          600: '#34425a',
          700: '#1f2a3d',
          800: '#141c2b',
          900: '#0a0f1a',
          950: '#050811',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
