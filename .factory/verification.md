# Independent verification — FAIL

**Candidate:** `17e4cf0b1885edf79cce1552c76b2889df87853f`  
**Live URL:** https://family-meal-lanes.sociobot.in  
**Verified:** 2026-08-28 UTC  
**Result:** **FAIL — do not release**

## Release-blocking findings

### P0 — the paid checkout is a dead link in production

The visible **“Buy unlimited lanes for $12”** link points to the required
Sociobot URL:

```
GET https://api.sociobot.in/api/v1/products/family-meal-lanes/checkout
HTTP/2 404
{"error":"enabled factory product","status":404}
```

This is fresh production evidence, not a local-only result. The free/paid
contract promises a hosted $12 checkout, but a buyer cannot begin purchase.
Register/enable the product in the billing API (or remove the paid offer until
it is enabled), then verify the redirect end to end.

### P1 — malformed but JSON-valid imports crash the planner

Using the visible Import JSON control with this accepted file:

```json
{"lanes":[{"id":"shared","name":"Shared","color":"blue"}],"meals":[{"id":"bad","day":0,"laneId":"missing","title":"broken"}],"weekOf":"2026-08-24"}
```

persists the input and produces the browser page error:

```
Cannot read properties of undefined (reading 'includes')
```

The meal is not rendered and the plan has been replaced with invalid persisted
data. Syntax-invalid JSON is handled correctly with the stated recovery
message, but structural validation is absent. Reject and describe malformed
plans before writing them, and retain the existing plan on failure.

### P1 — service-worker updates do not deliver a changed client build

The worker uses a fixed cache name, `family-meal-lanes-v2`, and the build uses
stable asset names (`/assets/app.js`, `/assets/index.css`). In a controlled
local mirror, after the first controlled load I changed only `app.js` (the
normal deployment case where `sw.js` has not changed), reloaded, and called
`registration.update()`:

```
before: cache = ["family-meal-lanes-v2"], changed-app marker = false
after:  cache = ["family-meal-lanes-v2"], changed-app marker = false,
        waiting = false, installing = false
```

The worker cache-first response therefore keeps serving the old application.
Version/cache-bust the worker and precache manifest as part of each build; then
test a waiting worker, the in-app update notice, Update now, and the updated
asset after reload.

### P1 — claims contract is incomplete

`.factory/claims.json` exists, but live/README feature promises are not listed
or sandbox-tested. Examples: landing figure caption **“Plan one meal in more
than one lane”** and README promises that shared meals appear in each relevant
lane and prep labels work. The current claims cover the demo separation,
export, offline, local-only requests, and presence of a checkout link only.
The claims contract explicitly treats this as a release-blocking unlisted
claim. Add observable demo tests for shared-lane rendering and prep labels (or
remove those promises).

### P1 — the required offline claim is flaky/failing on repeat verification

All five declared claim commands passed immediately after clean `npm ci`.
However, the required exact command was rerun later from the same clean
candidate with no product changes and failed all three Playwright retries:

```
npm test -- --grep @claim:offline-reload
Expected heading “Plan meals by person, not guesswork” to be visible after
offline reload; element not found (three retries).
```

The page snapshot contained only the static skip link, which means the cached
shell loaded but the application did not. A claim test must be reliable; this
failure independently blocks release.

## Other findings

### P2 — deletion promises an Undo control that does not exist

Deleting a meal announces **“Meal removed. Use Undo to put it back.”** There
is no Undo button or link anywhere in the page. Either implement the promised
recovery action or remove the statement and use specific deletion confirmation.

### P2 — live static assets are neither fingerprinted nor immutable

The live JS, CSS, image, manifest and worker all return
`cache-control: public, must-revalidate, max-age=30`; Vite emits stable names
such as `assets/app.js`. This misses the PWA caching requirement for
long-lived immutable hashed assets and compounds the stale-worker issue.

### P2 — unknown paths return HTTP 200

`/not-a-page` returns `200 text/html` rather than a 404 response, despite the
included 404 document/configuration. The SPA renders its styled missing-page
view, but HTTP clients and crawlers get a success status.

## First-read result

**Pass.** On a cold desktop and 390px live load, the first screen says what it
does: “Plan meals by person, not guesswork”; names its audience: households
with different meals; and makes the first action unambiguous: **“Try it with
sample data”**, with “See a filled week. Nothing is saved.” The button reaches
the demo in one click.

## Claims and local quality gates

`npm ci` completed successfully (20 packages audited; 0 vulnerabilities).
There is no separate lint script; TypeScript type checking is part of build.

| Claim ID | Exact declared command | Result | Evidence |
| --- | --- | --- | --- |
| `demo-sandbox` | `npm test -- --grep @claim:demo-sandbox` | PASS | Isolated `/demo` sample disappears after Start for real. |
| `json-export` | `npm test -- --grep @claim:json-export` | PASS | Download parsed; six sample meals, including Lemon chicken tray bake. |
| `offline-reload` | `npm test -- --grep @claim:offline-reload` | **FAIL** | Initial run passed; repeat fresh execution failed all three retries as described above. |
| `local-only` | `npm test -- --grep @claim:local-only` | PASS | Demo meal save recorded only `http://127.0.0.1:4173`. |
| `paid-unlock` | `npm test -- --grep @claim:paid-unlock` | PASS but insufficient | It only checks link text/href; live GET is the P0 404 above. |

`npm test` as a full suite consequently failed because of
`@claim:offline-reload`. `npm run build` passes and produces `dist/`:

```
assets/app.js   20.68 KB / 7.43 KB gzip
assets/index.css 11.46 KB / 3.45 KB gzip
hero-risograph.webp 72.6 KB
```

The initial JS/CSS/image budgets are within the stated static-product limits.

## Functional, accessibility, privacy, and deployment evidence

- Normal demo flow works: six sample meals, shared meals are visible in the
  recipient lanes, a new meal with a prep label saved and survived reload, and
  a keyboard Enter on a meal slip opened its edit dialog. Print invokes
  `window.print`; the free four-lane limit gives a live announcement. Syntax
  invalid import gives the expected recovery message.
- Cold live desktop and 390px mobile had one `h1`, one `main`, correct title,
  no horizontal page overflow at 390px, and no console/page errors. The skip
  link, keyboard dialog focus, and reduced-motion rules worked. Axe-core 4.11
  WCAG 2A/2AA scans of `/`, `/demo`, `/privacy`, and `/terms` found zero
  violations (therefore zero serious/critical findings).
- Cold live request logging recorded only
  `https://family-meal-lanes.sociobot.in`; the local privacy claim test
  recorded only the local app origin during a demo save. No remote font/script
  is loaded. Live CSP is self-only except the declared billing
  `https://api.sociobot.in`; `X-Content-Type-Options`, HSTS, and Referrer-
  Policy are present. The app stores plans in separate real/demo IndexedDB
  names.
- The production `index.html`, `assets/app.js`, `assets/index.css`, `sw.js`,
  manifest, and hero WebP SHA-256 values exactly match the built candidate.
  Thus the P0 checkout and the cache/update problems are present on the
  deployed candidate, not deployment drift.
- The license verification API did enforce rate limiting: 30 rapid invalid
  verification requests from this client returned 200, then the next returned
  `429` with `Retry-After: 3` (also `x-ratelimit-after: 3`). No sign-in exists,
  so Entra tenant validation is not applicable.

## Retest checklist

1. Make the production checkout URL redirect to the hosted checkout.
2. Validate imported object structure before persistence and add invalid-file
   recovery coverage.
3. Generate versioned worker/precache data and content-hashed immutable assets;
   prove a client update end to end.
4. Stabilize the offline reload claim and rerun every claim command plus
   `npm test`.
5. Add claim tests for shared meals/prep labels and fix/remove the false Undo
   instruction; correct the HTTP 404 route response.
