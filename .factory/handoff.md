# Family Meal Lanes handoff — independent verification 5

## Current release decision: FAIL

Do not release candidate
`57b73aac4ca49b3de48c2dff9feddc1f0c7e5d9f` as tested on 2026-08-28 UTC at
`https://family-meal-lanes.sociobot.in`.

The live deployment exactly matches the candidate. All 14 declared claim
commands, clean install, TypeScript, production build, and 31/31 repository
tests pass. The first screen also clearly says what the product does, who it is
for, and offers the required one-click sample demo.

Independent interaction testing found release blockers outside the committed
suite:

- the open meal dialog has serious 1.28–1.49:1 dark-mode contrast failures;
- after an empty required name, both Cancel and × fail to dismiss the meal
  dialog;
- sample meal slips fail WCAG 2.5.3 label-in-name, and sharing targets are
  20×20px with 26px-high labels instead of 44×44px;
- demo edits survive **Start for real** and reappear on return, contradicting
  the required discard lifecycle and “nothing is saved” copy;
- the valid-import part of `json-import-safety` is not exercised by its tagged
  test.

Additional defects: **Board** is a dead `#board` link on `/privacy` and
`/terms`, and those routes retain the root canonical URL.

Passing evidence includes normal/boundary meal planning, reload persistence,
valid and invalid import behavior, export, shared lanes, delete/Undo,
same-origin request privacy, token-only license checks, exact deployment
hashes, security/cache headers, offline reload, controlled service-worker
update, Dodo checkout, and the API allowance. The verify endpoint allowed 30
requests and returned request 31 as 429 with `Retry-After: 3`. Lighthouse on
live `/demo` scored 91 performance, 100 closed-page accessibility, 100 best
practices, and 92 SEO; LCP was 1.21s and CLS 0.013.

See `.factory/verification-5.md` and `.factory/evidence/` for exact evidence
and required retests. No product code was modified during verification.

---

# Historical handoff — repair 3

**Repair base:** independent-verifier report commit
`41304b8ebb4e1eae7a5a97a42ade164998017af1`, for candidate
`dfaf00beee095a352ed9e8934518c01a8362f82e`.

## What this repair changes

- Reproduced the live direct-404 defect before editing: it returned HTTP 404
  but its inline stylesheet was blocked by `style-src 'self'`, leaving a
  transparent Times-styled page and logging a CSP error. The designed 404 now
  loads only the new same-origin `404.css`; a regression serves it under the
  production CSP, asserts its styling and status, and rejects CSP console
  errors.
- Added four observable paid/privacy claims. They cover the visible free
  Shared-plus-three limit, a mocked valid license adding a fifth lane, an
  inactive/revoked license relocking lanes with a one-day verification cache,
  and a token-only GET license verification request with no meal-plan data.
  The paid screen now reports checking, active, and inactive states visibly.
- Made every visible 390px interactive control at least 44px in both
  dimensions, including header, legal, footer, demo, and wordmark links. The
  broad mobile regression scans every visible interactive target on `/`,
  `/demo`, `/privacy`, and `/terms`. **Export JSON** now has exactly that
  accessible name, satisfying label-in-name.
- SPA navigation now moves focus to the destination route `<h1>` and writes
  the same heading to a persistent polite live region. The free-lane limit
  remains visibly explained inside the People dialog instead of closing it.
- Narrowed paid/legal copy to the verified checkout, inactive-license, and
  token-only privacy behaviors. Existing meal planning, demo, offline,
  update, import, export, shared lanes, Undo, and local-first behavior remain
  unchanged.

## Verification before deployment

All commands were run from a clean `npm ci` install (20 packages, 0
vulnerabilities):

```sh
npm ci
# each exact command listed in .factory/claims.json (14 commands)
npm test
npx tsc -b --pretty false
npm run build
/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173 /tmp/fml-verify
```

- All 14 exact tagged claim commands passed individually.
- `npm test`: **31/31 Playwright tests passed** (15.4s). This includes dark
  and light axe-core 4.11 scans of all four routes, desktop and 390px keyboard
  flows, 44px target scan, label-in-name, CSP-clean 404, route focus,
  offline reload, and controlled waiting-worker/Update now coverage.
- TypeScript and production Vite build pass. `dist/` contains hashed JS
  (23.51 KB / 8.34 KB gzip) and CSS (12.89 KB / 3.69 KB gzip), both within
  budget.
- `verify-url.sh` found HTTP 200, title, `lang="en"`, one h1, main landmark,
  zero missing image alt attributes, zero unlabeled buttons, and zero console
  errors in desktop and 390px captures.
- Local Lighthouse mobile preview: performance 100, accessibility 100, best
  practices 100, SEO 100; LCP 1.7s and CLS 0.031.
- Product-specific backend/package/consumer, account, Entra, and response API
  checks do not apply: this remains a static local-first PWA with no product
  backend. The live Dodo checkout identity remains tested by
  `@claim:paid-unlock`; license endpoint behavior is covered with recorded
  mock responses and request inspection, without spending or transmitting
  user data.

## Deployment

Build output remains `dist/` and deployment class remains static PWA. Deploy
with:

```sh
/opt/fleet/lib/deploy-static.sh family-meal-lanes dist
```

Deployed on 2026-08-28 UTC as Static Web Apps deployment
`9566c1bd-a751-4346-b230-2944f59d7fc7` to
`https://family-meal-lanes.sociobot.in`.

- Fresh live `verify-url.sh` completed with HTTP 200, load 915ms, one h1,
  main landmark, `lang="en"`, zero missing alt text, zero unlabeled buttons,
  and zero console/page errors.
- Fresh live 390px browser evidence found no sub-44px visible interactive
  target, `Export JSON` as both the visible label and accessible name, and
  focus on the Privacy route h1 after navigation.
- Fresh live `/not-a-page` returned HTTP 404 with Paper background
  `rgb(255, 247, 232)`, Arial styling, and no CSP/inline-style console error.
- `/`, `/demo`, `/privacy`, and `/terms` returned 200; `/not-a-page` returned
  404. Live CSP is self-only except the disclosed Sociobot API; HSTS, nosniff,
  and strict-origin referrer headers are present. Hashed assets are immutable.
- Live SHA-256 bytes match this build for `index.html`, hashed JS and CSS,
  service worker, manifest, `404.html`, and `404.css`. The checkout identity
  check returned 303 to a Dodo hosted session.

Known gaps: none. The application has no product backend, package-consumer
surface, account flow, or Entra identity integration, so those checks are not
applicable.

---

# Historical handoff — verification 4 FAIL

**Current release decision: FAIL — do not release candidate
`dfaf00beee095a352ed9e8934518c01a8362f82e`.** See the final verification
section and `.factory/verification-4.md`. The builder repair record below is
retained as historical context and is superseded by this independent result.

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

There were no known product gaps from the builder's repair pass.

## Independent verification 3 — PASS (2026-08-28 UTC)

Independent verification of deployed candidate `dfaf00beee095a352ed9e8934518c01a8362f82e` at https://family-meal-lanes.sociobot.in **PASSED**. The live hashes for HTML, JavaScript, CSS, service worker, manifest, and hero asset exactly match a fresh local production build of that commit.

- Clean `npm ci` succeeded; every one of the ten mandated claims commands was run individually first and passed. `npm test` then passed 23/23 tests and `npm run build` produced `dist/`.
- A fresh live-browser first read clearly answered what it does, who it is for, and what to click first; the one-click sample demo is present. Independent live workflows covered adding/persisting a meal, safe invalid-import recovery, delete/undo, required-name validation, demo isolation, and the free-lane boundary.
- Live desktop, 390px mobile, keyboard focus, reduced motion, offline reload, manifest, response headers, caching, request logging, and zero serious/critical axe findings passed. Lighthouse on live `/demo`: 95 performance and 100 accessibility.
- The $12 checkout returned 303 to Dodo. The factory license verify endpoint allowed 30 invalid requests, then returned `429 Retry-After: 3` on request 31.

See `.factory/verification-3.md` for exact commands, evidence, and scope. There are no defects by severity and no known remaining gaps.

## Independent verification 4 — FAIL (2026-08-28 UTC)

Independent verification of deployed candidate
`dfaf00beee095a352ed9e8934518c01a8362f82e` at
https://family-meal-lanes.sociobot.in **FAILED; do not release**. The live
deployment exactly matches the candidate. All ten declared claim commands,
23/23 repository tests, TypeScript, and the production build pass, but the
acceptance contract is not fully met.

Release blockers:

- the paid unlimited-lanes and license-request privacy promises are not
  covered by observable tagged claim tests; the current paid claim proves only
  that checkout redirects;
- multiple 390 px links are below the required 44×44 px touch target, and
  current Lighthouse reports a serious WCAG 2.5.3 label-in-name failure for
  **Export JSON**;
- the direct production 404's inline CSS is blocked by the live CSP, producing
  an unstyled page and a console error.

Lower-severity defects: SPA routes focus `<main>` instead of the new `<h1>`,
and the free-lane boundary explains itself only in a clipped screen-reader live
region, with no readable visual feedback.

Core meal planning, safe import recovery, shared-lane persistence, Undo,
same-origin data traffic, offline reload, service-worker update coverage,
cache headers, deployment hashes, Dodo checkout, and API rate limiting passed.
The verify endpoint allowed 30 requests and returned `429 Retry-After: 4` on
request 31. See `.factory/verification-4.md` and its evidence directory for
the full record and exact retest criteria.
