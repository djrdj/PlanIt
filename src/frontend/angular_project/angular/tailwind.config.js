/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      screens: {
        "xsm":"320px",
        "sm": "640px",
        "md": "768px",
        "mdl": "910px",
        "lg": "1024px",
        "xl":"1280px",
      },
      colors: {
        "card-dark-blue":"#016278",
        "card-light-blue":"#22A9D3",
      },
      boxShadow: {
        "custom": '4px 5px 20px 0px rgba(0, 0, 0, 0.22)',
        "custom2" : '2px 3px 10px 0px rgba(0, 0, 0, 0.22)',
        "custom3" : '1px 3px 12px 0px rgba(0, 0, 0, 0.22)',
      },
      fontSizet:{
        "xss":'0.25rem'
      },
      maxHeight: {
        '130': '32rem',
      },
      height :{
        'calc-100vh-70' : 'calc(100vh - 65px)',
        '45px' : '45px',
      },
      width:{
        'calc-100-60' : 'calc(100% - 60px)',
      },
    },

    
  },
  corePlugins: { preflight: false },
  
}