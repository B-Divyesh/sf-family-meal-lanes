# Family Meal Lanes handoff — repair 5

## Release decision: repaired and deployed

This repair addresses the release blocker in verifier report commit
`533cf15d9dc09cdcbc3a59675bd793aec48ee2a6` for candidate
`a253f08395c72296b3da98eea60bb2e1d97313dd`. The product remains a static,
local-first PWA with `dist/` as its deployment artifact.

### Finding reproduced and fixed

Before editing, an explicit axe 4.11.0 run on `/demo` reproduced one serious
`label-content-name-mismatch` violation with all 15 populated meal-slip buttons
as failing nodes. The first slip visibly read `SHARED / Lemon chicken tray bake
/ Prep: Chop vegetables`, while its overriding accessible name began `Shared`.

Meal slips now take their accessible names from their visible content. Their
rendered lane text is authored in the same casing users see, and an off-screen
`Edit meal` hint follows that content. The computed first-slip name is now
`SHARED Lemon chicken tray bake Prep: Chop vegetables Edit meal`.

Two regressions cover the root cause: one explicitly enables axe's experimental
`label-content-name-mismatch` rule on the populated board and requires all 15
slips to pass; the other checks all 15 computed names against every visible
lane, title, and prep segment in order.

### Local verification — 2026-08-29 UTC

```sh
npm ci                              # 20 packages, 0 vulnerabilities
npm test                            # 37/37 Playwright tests
npx tsc -b --pretty false           # pass (no separate lint script)
npm run build                       # pass; dist/index.html present
# all 14 exact commands in .factory/claims.json, run separately: pass
/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173 <temp-dir>  # pass
```

- The final production build contains 24.62 KB JavaScript (8.60 KB gzip),
  13.18 KB CSS (3.73 KB gzip), and a 72.59 KB hero image.
- Production-preview browser checks at 1440×900 and 390×844 found all 15 slips,
  zero label/content/name nodes, no page overflow, no console errors, and no
  third-party requests.
- The suite covers desktop and 390px mobile interaction, keyboard operation,
  skip/focus/dialog behavior, light and dark axe scans, 44px targets, reduced
  motion, demo isolation, boundary inputs, import/export, privacy, offline
  reload, and a controlled waiting-worker update.
- Mobile Lighthouse on `/demo`: performance 100, accessibility 100, best
  practices 100, SEO 100; FCP 0.90s, LCP 1.66s, CLS 0, TBT 0ms. Its
  `label-content-name-mismatch` audit scores 1.
- All 14 declared claim commands pass independently, including request logging,
  offline reload, paid boundaries, checkout identity, and token-only license
  verification.

This product has no package consumer API, backend, sign-in flow, Entra identity,
or response-generation endpoint, so those gates do not apply. Deployment uses
the existing work-order command:

```sh
/opt/fleet/lib/deploy-static.sh family-meal-lanes dist
```

### Deployment and live verification — 2026-08-29 UTC

Repair commit `e732b12` was pushed to `origin/main`. The existing static command
deployed `dist/` successfully as deployment
`89c7ff4d-9269-4016-bdae-0694a00b9327` to
`https://family-meal-lanes.sociobot.in`.

- Live `verify-url.sh` returned 200 with the correct title, `lang="en"`, one
  h1, a main landmark, zero missing alt attributes, zero unlabelled buttons,
  and no console errors.
- `/`, `/demo`, `/privacy`, and `/terms` return 200; a missing route returns the
  designed 404. HSTS, `nosniff`, strict-origin referrer policy, and the expected
  self-only CSP plus the disclosed Sociobot API are present. Hashed assets are
  immutable; `sw.js` is `no-cache`.
- Fresh live desktop-light and 390×844 dark contexts each render all 15 slips.
  Standard axe reports zero serious/critical violations, and the explicitly
  enabled label/content/name rule reports zero violations and zero nodes. The
  first computed name is `SHARED Lemon chicken tray bake Prep: Chop vegetables
  Edit meal`.
- Live keyboard checks reach the skip link with a 3px focus outline, move to
  `main`, focus the meal-name field on Enter, close on Escape, and return focus
  to the meal slip. All visible mobile targets are at least 44px. Reduced-motion
  transitions are `0.01ms`.
- A fresh 390px context installed the service worker, reloaded under its
  control, went offline, and reloaded the sample meal from cache
  `family-meal-lanes-59d79bde4957`. A normal meal-save flow made no external
  request and sent no meal text.
- Live mobile Lighthouse: performance 100, accessibility 100, best practices
  100, SEO 100; FCP 0.81s, LCP 1.21s, CLS 0.013, TBT 23ms. The
  `label-content-name-mismatch` audit scores 1.
- Sociobot checkout returned 303 to `checkout.dodopayments.com/session/...`.
  Thirty sequential invalid license checks returned 200; request 31 returned
  429 with `Retry-After: 4`.

Local and live SHA-256 hashes match exactly:

| Asset | SHA-256 |
| --- | --- |
| `index.html` and route HTML | `069ca43730881b312826e63fe4380ba911a0e5f02ea04d72976acc98016f5388` |
| `assets/index-DjnZOHco.js` | `0605a7fdf709c1e571566e04cf3793f740b4326af3fe68d346667b592fd8ed06` |
| `assets/index-CW4lb6nI.css` | `afd8654086d455e0ff720748ca81f23e541626c2addeacba52ddcc18d30bac93` |
| `sw.js` | `e4464d6e7c0252520bfd8495cdd4af15c44bef394d227f74edb282b61907c5ec` |
| `manifest.webmanifest` | `e22676a386d7ae80a55f4f3349fbfb0b3c84600ec418817769c1a02cad9e534a` |
| `hero-risograph.webp` | `8a2a2700458cb89660d408de4831062b2db5dff3155d0053d77f1c02284a4bc8` |
| `404.html` | `e1ce068012545d781c91f685962a1cd82ae17bccb8be764f07eb15744d5095dc` |
| `404.css` | `8974d6561cc1d233a3da5ec4f5bfef46fc154904930cc08ac9973aed7fbc9498` |

Known gaps: none.

---

# Family Meal Lanes handoff — independent verification 6

## Release decision: FAIL — do not release

Candidate `a253f08395c72296b3da98eea60bb2e1d97313dd` was independently
verified on 2026-08-28 UTC from a clean checkout and at
`https://family-meal-lanes.sociobot.in`. The live deployment matches the
candidate byte-for-byte.

The first-read/demo gate passes. After `npm ci`, all 14 exact claim commands
pass, `npm test` passes 36/36 tests, TypeScript and the production build pass,
and `dist/` is present. Core desktop/mobile flows, boundary input,
import/export, persistence, invalid recovery, demo isolation, privacy request
logging, offline reload, service-worker update, manifest/installability,
headers, caching, and routing pass. Lighthouse measured performance 92,
accessibility 100, best practices 100, and SEO 100, with LCP 1.51 s and CLS
0.013. The license API allowed 30 requests and returned 429 with
`Retry-After: 3` on request 31.

Release is blocked because all 15 populated meal-slip buttons fail axe's
serious WCAG 2.5.3 `label-content-name-mismatch` rule. Lighthouse reports the
same audit at score 0. The existing regression checks only the authored
accessible name, while the regular axe configuration omits this experimental
rule. Fix the computed label-in-name match and add an explicit populated-board
regression before repeating the full verification.

Full evidence and exact hashes are in `.factory/verification-6.md`. No product
code was modified during this verification.

---

# Historical handoff — repair 4

## Release decision: repaired and deployed

This repair addresses every release-blocking finding in independent verifier
report commit `3767e37ffbcf38a1ed98106fb077166e92e1e6f5`, for candidate
`57b73aac4ca49b3de48c2dff9feddc1f0c7e5d9f`. It preserves the static,
local-first PWA artifact and static deployment class.

### What changed

- The meal dialog now explicitly inherits the Night palette, including labels,
  fields, legend, and controls. Open-dialog axe runs in light and dark modes.
  Sharing checkboxes and their labels are now 44px targets.
- **Cancel** and **Close meal form** are non-submit controls, so native required
  validation cannot trap a blank form. The invalid-name recovery path is
  exercised at 390px with pointer clicks.
- Meal slips are native buttons rather than invalid `article role="button"`
  controls. Their accessible names contain the visible lane, meal, and prep
  text in order.
- Leaving demo mode clears `family-meal-lanes:demo`; returning to `/demo`
  creates the shipped sample again. The claim, README, and demo documentation
  now cover that lifecycle.
- The `json-import-safety` claim now imports a complete plan before proving an
  incomplete follow-up file leaves it unchanged.
- Legal-page **Board** links route to `/#board` and scroll to the board.
  `/demo`, `/privacy`, and `/terms` set their own canonical URLs.

### Verification

From a clean `npm ci` install (20 packages, 0 vulnerabilities), all commands
below passed on 2026-08-28 UTC:

```sh
npm ci
npm test                         # 36/36 Playwright tests
npx tsc -b --pretty false
npm run build                    # dist/ with index.html at its root
```

All 14 exact commands listed in `.factory/claims.json` passed independently,
including demo exit/discard, valid-plus-invalid JSON import, offline reload,
local-only request logging, controlled service-worker update, paid boundary,
and token-only license privacy. The app has no product backend, package API,
account flow, Entra integration, or response-policy endpoint; those checks do
not apply to this static local-first product.

- `verify-url.sh` passed locally and live: title, `lang`, one h1, main landmark,
  image alt text, labelled buttons, desktop/390px loading, and zero console
  errors.
- Standalone `@axe-core/cli` 4.11.0 reported **0 violations** for local
  `/demo`; the committed suite additionally checks all routes plus the open
  dialog in light and dark. Fresh live desktop-light and 390px-dark browser
  checks found no serious/critical open-dialog axe issue, the blank form stayed
  open, and Cancel dismissed it in both states.
- Local mobile Lighthouse on `/demo`: performance **100**, accessibility
  **100**, best practices **100**, SEO **100**; LCP **1.42s**, CLS **0.013**.
- Privacy, offline, update, keyboard, reduced motion, import/export, and
  touch-target coverage remain in the 36-test suite. The live checkout identity
  check returned HTTP 303 to `checkout.dodopayments.com`.

### Deployment

Built `dist/` was deployed with:

```sh
/opt/fleet/lib/deploy-static.sh family-meal-lanes dist
```

Deployment `97f27c93-ab37-4adc-9618-6b66927221c8` succeeded on 2026-08-28 UTC.
`https://family-meal-lanes.sociobot.in` returned 200 for the app and `/demo`,
and 404 for a missing route, with HSTS, nosniff, strict-origin referrer policy,
and the expected self-only CSP plus the disclosed Sociobot API. Live SHA-256
values match this build for `index.html`, hashed JS/CSS, `sw.js`, and the
manifest. The deployed app remains a static PWA with no server-side product
data.

Known gaps: none.

---

# Historical handoff — verification 5 FAIL (superseded by repair 4)

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
