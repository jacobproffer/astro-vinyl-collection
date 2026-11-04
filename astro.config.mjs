// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";

import boberbot from "boberbot";

// https://astro.build/config
export default defineConfig({
  site: "https://records.proffer.dev/",
  integrations: [sitemap(), boberbot()],
  // Image optimization configuration
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp'
    },
  },
  // Security and performance optimizations
  security: {
    checkOrigin: true,
  },
  vite: {
    plugins: [tailwindcss()],
  },
});