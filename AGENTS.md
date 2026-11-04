## Agent readiness

This Astro site uses Boberbot and Netlify Edge Functions for Markdown negotiation. After changing pages, routes, or response headers, check the deployed site with Boberbot's scan API and keep it at Level 3 or higher:

```sh
curl -s https://boberbot.com/api/scan \
  -H 'content-type: application/json' \
  -d '{"url":"https://records.proffer.dev"}'
```

Markdown negotiation and Link headers are HTTP behavior, so verify them on the deployed site rather than only in the build output.
