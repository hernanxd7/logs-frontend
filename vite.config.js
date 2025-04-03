import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    minify: 'esbuild',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        }
      }
    }
  },
  server: {
    port: 3030,
    strictPort: true,
    host: true,
    middleware: [
      (req, res, next) => {
        res.setHeader('Cache-Control', 'no-store');
        next();
      }
    ]
  }
})
