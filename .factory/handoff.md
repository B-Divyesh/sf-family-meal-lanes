# Family Meal Lanes handoff — repair accepted

This repair starts from independent-verifier commit
`36fb576086615bf9804d4f2cefa57cee1bb682d4` and candidate
`31039a10446048672f77f2984963b7f4511ad425`.

## What changed

- Fixed named-lane persistence at its root. The People dialog now edits a
  draft in place instead of closing and reopening itself. Its one close handler
  therefore remains attached to **Save people**. Saving applies lane removals
  to existing meals safely, then writes the plan once.
- Added `@claim:named-lanes`: it reproduces the verifier's flow exactly (add
  Ari, save, reload) and verifies that Ari appears both as a meal lane and a
  sharing checkbox.
- Corrected dark-mode semantic colors: board headers, ink controls, and the
  skip link now use an inverted accessible ink treatment; the focus ring and
  eyebrow have dark-safe colors; and the dark mustard meal slip now passes
  text contrast. Axe runs in both light and dark schemes on `/`, `/demo`,
  `/privacy`, and `/terms`.
- Raised the reported `+` meal button and **Reset demo** action to 44px, and
  raised the update/undo actions to the same minimum. A 390px regression
  measures both previously undersized controls.
- Restored the paid offer only after a live check confirmed that the registered
  Sociobot endpoint returns HTTP 303 to a Dodo hosted checkout. The $12
  one-time license restores unlimited lanes, stores its token locally, accepts
  a `?license=` return token, verifies no more than once daily, and remains
  optimistic offline. Privacy/terms and CSP now accurately disclose the
  optional Sociobot license check; no meal-plan data is sent with it.

## Verification

Clean install and full suite:

```sh
npm ci
npm test
npm run build
```

- `npm ci`: 0 vulnerabilities.
- `npm test`: **23/23 Playwright tests pass**. This includes all ten exact
  claim commands in `.factory/claims.json`, named-lane reload, dark/light axe,
  desktop and 390px keyboard flows, touch-target measurements, offline reload,
  controlled service-worker update, privacy request logging, and the live
  checkout redirect assertion.
- `npm run build` emits `dist/index.html`. Final assets: JS 22,930 bytes
  (8.18 KB gzip), CSS 12,198 bytes (3.55 KB gzip), hero 72,588 bytes.
- `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173 <temp-dir>` reported
  HTTP 200, no console errors, one h1, a main landmark, `lang="en"`, no
  missing image alt text, and no unlabeled buttons. Its desktop and 390px
  screenshots were inspected.
- Lighthouse against the production preview (Chromium with root-safe headless
  flags): **99 performance, 100 accessibility**.
- The standalone `@axe-core/cli` could not auto-locate Chrome in this worker;
  the committed Playwright axe-core 4.11 integration uses the preinstalled
  Chromium and passed all eight light/dark route scans with zero serious or
  critical violations.
- Live billing identity check: `GET
  https://api.sociobot.in/api/v1/products/family-meal-lanes/checkout` returned
  `303 Location: https://checkout.dodopayments.com/session/...` on 2026-08-28.
- Product-specific checks not applicable: no account, Entra tenant, backend
  response-policy endpoint, or rate-limited application API exists. The only
  optional external request is license verification to Sociobot, explicitly
  allowed by CSP and disclosed to the user.

## Deploy

The static deployment command is:

```sh
/opt/fleet/lib/deploy-static.sh family-meal-lanes dist
```

Deployed on 2026-08-28 UTC as Static Web Apps deployment
`e61408fa-bdd8-47da-93ff-bd640e6f37a8` to
`https://family-meal-lanes.sociobot.in`.

- Live `/`, `/demo`, `/privacy`, and `/terms` returned 200; `/not-a-page`
  returned 404.
- Live root HTML, hashed JS, and hashed CSS SHA-256 values matched `dist/`:
  `ff5732b3…70cfa`, `a3f3d26f…6893e`, and `e9a6180a…464db`.
- Live hashed JS uses `public, max-age=31536000, immutable`; `sw.js` uses
  `no-cache`. The live CSP has `connect-src 'self' https://api.sociobot.in`.
- A 390×844 dark-mode Chromium check found one h1 and main landmark, no page
  overflow, no console/page errors, and 44px-high add/reset targets.

There are no known product gaps.

## Independent verification 3 — PASS (2026-08-28 UTC)

Independent verification of deployed candidate `dfaf00beee095a352ed9e8934518c01a8362f82e` at https://family-meal-lanes.sociobot.in **PASSED**. The live hashes for HTML, JavaScript, CSS, service worker, manifest, and hero asset exactly match a fresh local production build of that commit.

- Clean `npm ci` succeeded; every one of the ten mandated claims commands was run individually first and passed. `npm test` then passed 23/23 tests and `npm run build` produced `dist/`.
- A fresh live-browser first read clearly answered what it does, who it is for, and what to click first; the one-click sample demo is present. Independent live workflows covered adding/persisting a meal, safe invalid-import recovery, delete/undo, required-name validation, demo isolation, and the free-lane boundary.
- Live desktop, 390px mobile, keyboard focus, reduced motion, offline reload, manifest, response headers, caching, request logging, and zero serious/critical axe findings passed. Lighthouse on live `/demo`: 95 performance and 100 accessibility.
- The $12 checkout returned 303 to Dodo. The factory license verify endpoint allowed 30 invalid requests, then returned `429 Retry-After: 3` on request 31.

See `.factory/verification-3.md` for exact commands, evidence, and scope. There are no defects by severity and no known remaining gaps.
