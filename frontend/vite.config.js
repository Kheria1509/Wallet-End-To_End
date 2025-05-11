import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './', // ✅ Important for relative asset resolution on Vercel
  plugins: [react()],
  define: {
    'process.env.VITE_API_URL': JSON.stringify('https://wallet-end-to-end-backend.vercel.app')
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom']
        }
      }
    }
  }
})
