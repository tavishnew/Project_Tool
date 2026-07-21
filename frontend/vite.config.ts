import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // ponytail: proxy /api to the Express backend so cookies stay same-origin.
    proxy: { '/api': 'http://localhost:3001' },
  },
});
