// frontend/vite.config.js (MODIFIED TO FORCE CONFIG LOADING)
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// CRITICAL FIX: Import the local configuration file directly
import tailwindConfig from './tailwind.config.js'; 

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    // PASS THE IMPORTED CONFIG OBJECT EXPLICITLY TO THE PLUGIN
    tailwindcss(tailwindConfig), 
  ],
  server: {
    port: 5173, 
  },
})