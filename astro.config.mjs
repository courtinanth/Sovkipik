// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import netlify from '@astrojs/netlify';

// https://astro.build/config
export default defineConfig({
  site: 'http://localhost:4344', // Temporary dev URL, should be Netlify URL in prod
  output: 'server',
  adapter: netlify(),
  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [react()]
});