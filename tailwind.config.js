/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        discord: {
          primary: '#36393f',
          secondary: '#2f3136',
          tertiary: '#202225',
          hover: '#32353b',
          text: {
            primary: '#dcddde',
            secondary: '#8e9297',
            muted: '#72767d',
          },
          link: '#00aff4',
          danger: '#ed4245',
          green: '#3ba55d',
          code: {
            inline: '#2b2d31',
            block: '#2b2d31',
          },
          reaction: {
            DEFAULT: '#2f3136',
            hover: '#393c43',
            active: 'rgba(88, 101, 242, 0.3)',
          },
          streaming: '#9147ff',
        },
      },
    },
  },
  plugins: [],
}