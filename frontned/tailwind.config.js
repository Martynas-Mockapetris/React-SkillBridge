/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class', 
  theme: {
    extend: {
      colors: {
        primary: '#222831', // Dark charcoal
        secondary: '#393E46', // Medium grey
        accent: '#00ADB5', // Teal
        light: '#EEEEEE', // Light grey
        text: {
          primary: '#222831', // Pagrindinis tekstas
          secondary: '#393E46', // Antrinis tekstas
          light: '#EEEEEE', // Tamsiems fonams tekstas
          accent: '#00ADB5' // Akcentinis tekstas
        }
      },
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif']
      }
    }
  },
  plugins: []
};
