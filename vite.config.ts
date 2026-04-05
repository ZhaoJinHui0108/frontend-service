import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/services/user/api': {
        target: 'http://backend_service:8000',
        changeOrigin: true
      }
    }
  }
})