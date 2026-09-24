import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://bookmark-intelligence.pages.dev',
  output: 'static',
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    worker: {
      format: 'es',
    },
  },
});
