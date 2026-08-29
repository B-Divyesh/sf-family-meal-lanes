# Family Meal Lanes — polish 4 handoff

## What was done

Closed every cumulative review finding from rounds 1–4. The repair adds
response-header framing protection with `frame-ancestors 'self'` and supplies
the product social card through `twitter:image` on the SPA shell, every client
route, and the static HTTP 404. The hosting and route-metadata regressions now
prove both changes.

The existing product-specific risograph meal-board identity, local-first PWA,
isolated `?demo=1` sample flow, reset/start-for-real behavior, direct routes,
legal pages, service worker, and paid license boundary were preserved. The
catalog line is now verb-first and 77 characters.

Repair commit: `53d9512bcc06b91454fcb104f49d1034367b4a34`.
Deployment: `df9b0e50-8051-41b1-934b-eb089fac10af`.
Live URL: `https://family-meal-lanes.sociobot.in`.

## How verified

- Fresh remote clone `/tmp/family-meal-lanes-polish-4-D2f1Ju` at the repair
  commit: `npm ci`, all 20 literal claim commands independently, `npm test`
  (51/51), and final `npm run build` all passed.
- The full claim run covered demo isolation, six sample meals, create/edit,
  export/import safety, offline reload, local-only requests, scope boundaries,
  shared lanes, prep, print, free tools, named lanes, licensing, and hosting.
- The deployed static PWA passed a cold five-route audit. Every route has its
  expected status/title/h1/Twitter image and CSP framing directive; mobile
  width has no overflow; demo reset/exit data remains isolated; the offline
  sample reload works; normal meal flows make same-origin requests only; and
  light/dark axe scans found zero serious or critical violations. Evidence:
  `.factory/polish-4-evidence/live-audit.json`.
- `verify-url.sh` passed at 634 ms with no console errors:
  `.factory/polish-4-evidence/verify-url/verify.json`.
- Live Lighthouse: Performance 100, Accessibility 100, Best Practices 100,
  SEO 100; FCP 782 ms, LCP 912 ms, CLS 0, TBT 5 ms:
  `.factory/polish-4-evidence/lighthouse-live.json`.
- Local/live SHA-256 values match for `index.html`, `sw.js`, 404, hashed JS,
  and hashed CSS. The deployed root and 404 responses include
  `frame-ancestors 'self'`.

See `.factory/polish-4.md` for the complete finding-by-finding mapping,
screenshots, test names, and live URL checks.

## Run and deploy

```sh
npm ci
npm test
npm run build
/opt/fleet/lib/deploy-static.sh family-meal-lanes dist
```

## Known gaps / next steps

None. All review findings are closed and live verification passed.
