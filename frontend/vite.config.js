import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/deepfake-detection/',
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/deepfake-detection/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/deepfake-detection\/api/, '/api')
      }
    }
  }
})
