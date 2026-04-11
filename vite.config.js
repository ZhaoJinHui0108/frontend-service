import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';
export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
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
});
