import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    minify: 'esbuild', // Using esbuild for faster builds
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'], // Separate vendor chunks for better caching
        }
      }
    }
  },
  server: {
    port: 3030, // Keeping your original port
    strictPort: true,
    host: true, // Needed for external access in development
    proxy: {
      '/api': {
        target: 'http://localhost:10000', // Your backend server
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
