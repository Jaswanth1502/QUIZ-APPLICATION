import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: process.env.VITE_BASE || '/QUIZ-APPLICATION/',
  server: { port: 5173 },
  test: { environment: 'jsdom', setupFiles: './src/test/setup.ts', globals: true }
} as any);
