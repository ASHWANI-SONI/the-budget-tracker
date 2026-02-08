import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  preview: {
    allowedHosts: [
      'overflowing-transformation-production.up.railway.app',
      'the-budget-tracker-production.up.railway.app',
      '.up.railway.app' // Allow all Railway subdomains
    ],
  },
})
