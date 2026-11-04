# Vinyl Collection

Made with Astro and Tailwind.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## Agent readiness

Boberbot writes `robots.txt` and `llms.txt` at build time and checks page titles and descriptions. Its strict mode makes those checks fail the build when a page is missing required metadata.

The collection's Markdown version is generated at `/index.md`. A Netlify Edge Function serves it for homepage requests that accept `text/markdown` and adds an alternate `Link` header to HTML responses. Keep `netlify.toml` and `netlify/edge-functions/` in the deployment so that content negotiation is enabled.

After deploying, verify the live site with Boberbot's [scan API](https://boberbot.com/docs/api/). Markdown negotiation and response headers cannot be confirmed by checking the static build output alone.
