import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    minify: 'esbuild',
    sourcemap: true,
  },
  server: {
    port: 3030,
    strictPort: true,
    host: true
  },
  // Add this configuration
  base: '/',
  // Add this for SPA routing
  appType: 'spa'
})
