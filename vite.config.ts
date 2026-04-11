import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
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
