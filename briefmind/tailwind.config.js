const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0F172A',
        accent: '#22D3EE',
      },
      fontFamily: {
        inter: ['"Inter Tight"', ...defaultTheme.fontFamily.sans],
      },
      keyframes: {
        backgroundPulse: {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
        bounceSmooth: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10%)' },
        },
      },
      animation: {
        backgroundPulse: 'backgroundPulse 10s ease infinite',
        bounceSmooth: 'bounceSmooth 2.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
