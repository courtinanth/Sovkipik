import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import netlify from '@astrojs/netlify';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://sovkipik.com',
  output: 'server',
  adapter: netlify(),
  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [react(), sitemap()]
});