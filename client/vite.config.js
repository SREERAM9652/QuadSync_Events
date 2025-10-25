// ⚙️ vite.config.js — Vite + React + Tailwind + Test Proxy Setup
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE_URL || 'https://quad-sync-events-yh13.vercel.app', // ✅ fallback
        changeOrigin: true,
        secure: false,
      },
    },
  },

  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
  },
});
