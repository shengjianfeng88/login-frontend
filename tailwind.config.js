/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        openSans: ['Open Sans', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'], 
      },
      boxShadow: {
        card: '0px 0px 8px 0px #66708540',
        patientsDailog: '2px 0px 5px 0px #5C5C5C66',
        patientsDailogDark: '2px 0px 4px 0px #5C5C5C99',
        profileDailog: '-2px 0px 5px 0px #5C5C5C66',
        historyCardDailog: '0px 0px 5px 0px #5C5C5C66',
        selectedCalendarCard: '0px 0px 5px 0px #226FEF',
      },
      colors: {
        orange: 'rgb(255,110,0)', 
        primaryBlack: '#191C1F',
      },
      translate: {
        '-100px': '-100px',
      },
      screens: {
        'xs': '480px', 
        '820': '820px', 
      },
    },
  },
  plugins: [],
}