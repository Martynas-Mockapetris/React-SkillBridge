import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react({ jsxRuntime: 'automatic' })],
  server: {
    port: 5174,
    strictPort: false,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/uploads/, '/uploads')
      }
    },
    hmr: {
      host: 'localhost',
      port: 5174,
      protocol: 'ws'
    }
  },
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: true
      }
    },
    chunkSizeWarningLimit: 500,
    sourcemap: false,
    reportCompressedSize: false
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
