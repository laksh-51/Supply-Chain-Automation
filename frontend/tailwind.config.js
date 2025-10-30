// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'v-bg-dark': '#0f172a',    
        'v-bg-mid': '#1e293b',     
        'v-bg-card': '#334155',    
        'v-accent': '#818cf8',     
        'v-action': '#4f46e5',     
        'v-text': '#e2e8f0',       
        'v-text-muted': '#94a3b8', 
      },
    },
  },
  plugins: [],
}