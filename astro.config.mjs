// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";

import boberbot from "boberbot";

// https://astro.build/config
export default defineConfig({
  site: "https://records.proffer.dev/",
  integrations: [
    sitemap(),
    boberbot({
      name: "Vinyl Collection",
      description:
        "A personal archive of vinyl records, soundtracks, and pressings.",
      strict: true,
    }),
  ],
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