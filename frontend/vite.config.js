import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';  // ถ้าใช้ Tailwind v4

export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    include: ['jwt-decode'],  // Force include jwt-decode ใน deps
  },
  server: {
    proxy: {
      '/api': {
        // target: 'http://localhost:5000', // Proxy no longer strictly needed since we use full URL in axios
        changeOrigin: true,
      },
    },
  },
});