import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/deepfake/',
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/deepfake/api': {
        target: 'http://127.0.0.1:82',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/deepfake\/api/, '')
      }
    }
  }
})
