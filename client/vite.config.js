import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    // Forward API calls to the Express server during `npm run dev`.
    proxy: {
      '/api': process.env.VITE_API_PROXY || 'http://localhost:3000',
    },
  },
  build: {
    outDir: path.resolve(__dirname, '../server/public'),
    emptyOutDir: true,
  },
});
