# Independent verification 3 — PASS

**Candidate:** `dfaf00beee095a352ed9e8934518c01a8362f82e` (`main`)
**Live URL:** https://family-meal-lanes.sociobot.in
**Verified:** 2026-08-28 UTC
**Decision:** **PASS — release accepted.**

## Cold first read

On a fresh desktop browser visit, the first screen says **“Plan meals by person, not guesswork.”** It immediately says it is for households with different meals, explains that it shows what is each person's and what is shared, and presents the single clear first action **“Try it with sample data”** with the adjacent explanation “See a filled week. Nothing is saved.” The one-click action opens a populated six-meal household week in the separate demo sandbox. This meets the plain-words and demo-sandbox gate.

## Clean-checkout gates

`npm ci` completed successfully (0 vulnerabilities). No separate lint script is defined; `npm run build` runs the repository's TypeScript project build.

| Gate | Result | Evidence |
| --- | --- | --- |
| Every `.factory/claims.json` command, run individually before other QA | PASS | All ten exact commands passed from the clean install: `demo-sandbox`, `json-export`, `json-import-safety`, `offline-reload`, `local-only`, `shared-lanes`, `prep-labels`, `print-plan`, `named-lanes`, and `paid-unlock`. |
| `npm test` | PASS | 23/23 Playwright tests passed (18.7 s). |
| `npm run build` | PASS | TypeScript and Vite build succeeded and produced `dist/`. |
| Bundle budget | PASS | JS 22,929 B / 8.18 KB gzip; CSS 12,198 B / 3.55 KB gzip; hero WebP 72,588 B. |
| Lighthouse, live `/demo` | PASS | Performance 95; accessibility 100; LCP 0.9 s; CLS 0.028. |

## Independent live-product exercise

- `/demo` displays its persistent “Demo — sample data, nothing is saved” banner and 15 rendered sample slips representing six source meals, including shared meals in their selected lanes.
- Adding a meal with a prep label persists through reload. An invalid JSON import gives the stated recovery message and leaves the existing plan untouched. Deletion exposes **Undo** and restores the meal.
- An empty required meal name is kept in the form and rejected by browser validation. The free-plan fourth-person boundary gives the explicit license next step. **Start for real** opens an empty real plan with no demo meal.
- Desktop and 390×844 mobile work without page overflow. Keyboard Enter opens a meal slip and places focus in the named meal field. The tested add and demo reset controls are at least 44 px high. Reduced motion reduces transitions to `0.01ms`.
- Serious/critical axe findings were zero on live `/`, `/demo`, `/privacy`, and `/terms` in a CSP-bypassed audit context. The ordinary live context reported no console or page errors. The committed suite also tests dark mode, keyboard path, touch targets, and a controlled service-worker update.

## Privacy, PWA, deployment, and server checks

- Playwright's request log for the whole live demo save/recovery flow contained only `https://family-meal-lanes.sociobot.in`; no meal-plan data left the origin. The optional license flow is separately disclosed and its CSP allowlist contains only `https://api.sociobot.in` beyond self.
- Live response headers provide `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and HSTS. Hashed assets are immutable for one year; `sw.js` and the manifest are `no-cache`. `/`, `/demo`, `/privacy`, and `/terms` return 200; a nonexistent route returns a designed HTTP 404.
- The live manifest parsed without Chrome errors and declares standalone mode, themed 192/512 icons, and a versioned start URL. The live service worker was active and controlled the page; after the first visit, an offline reload of `/demo` still displayed the board and sample meal. The local controlled worker-update regression test passed in the 23-test suite.
- Fresh-build SHA-256 values matched live exactly: `index.html` `ff5732b3…70cfa`, JS `a3f3d26f…6893e`, CSS `e9a6180a…464db`, service worker `5b8ce182…467705`, manifest `3a559219…4843e`, and hero `8a2a2700…a4bc8`. The deployment is therefore this candidate, not a stale build.
- `GET /api/v1/products/family-meal-lanes/checkout` returned HTTP 303 to a Dodo hosted-checkout session, matching the visible $12 offer. The documented factory product-unlock allowance is enforced: 30 sequential invalid `/verify` requests were accepted and request 31 returned HTTP 429 with `Retry-After: 3` (also `x-ratelimit-after: 3`). No application sign-in, backend data API, or Entra flow exists, so those checks are not applicable.

## Defects

None found. No critical, high, medium, or low release-blocking defects remain.

