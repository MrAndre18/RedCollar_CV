import plugin from 'tailwindcss/plugin'

const rem = px => `${px / 16}rem`

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      transitionTimingFunction: {
        DEFAULT: 'cubic-bezier(0.33, 1, 0.68, 1)'
      },
      transitionDuration: {
        DEFAULT: '0.4s'
      },
      fontFamily: {
        sans: ['TT_Commons', 'sans-serif'],
        redcolar: ['RedCollar', 'sans-serif']
      },
      screens: {
        desktop: { min: '1201px' },
        devices: { max: '1200px' },
        tablet: { max: '1200px', min: '768px' },
        mobile: { max: '767px' }
      }
    },
    colors: {
      transparent: 'transparent',
      primary: '#000000',
      text: '#ffffff',
      accent: '#F51B1B',
      secondary: '#666666'
    },
  },
  plugins: [
    plugin(function ({ theme, addUtilities }) {
      const screens = theme('screens')

      const newUtilities = {
        '.desktop': {
          [`@media (max-width: ${screens.tablet.max})`]: {
            display: 'none !important'
          }
        },
        '.mobile': {
          [`@media (min-width: ${screens.tablet.min})`]: {
            display: 'none !important'
          }
        },
        '.tablet': {
          [`@media (min-width: ${screens.desktop.min})`]: {
            display: 'none !important'
          },
          [`@media (max-width: ${screens.mobile.max})`]: {
            display: 'none !important'
          }
        },
        '.devices': {
          [`@media (min-width: ${screens.desktop.min})`]: {
            display: 'none !important'
          }
        }
      }

      addUtilities(newUtilities, ['responsive'])
    })
  ]
}
