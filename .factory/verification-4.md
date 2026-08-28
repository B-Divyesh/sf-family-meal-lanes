# Independent verification 4 — FAIL

**Candidate:** `dfaf00beee095a352ed9e8934518c01a8362f82e`

**Live URL:** https://family-meal-lanes.sociobot.in

**Verified:** 2026-08-28 UTC

**Decision:** **FAIL — do not release.**

The repaired core workflow works, all ten declared claim commands pass, and the
live deployment is byte-for-byte the candidate. The candidate still misses
mandatory claims, accessibility, and console-clean route requirements.

## Release-blocking findings

### P1 — paid and privacy promises are not proved by claim tests

The visible product and README promise more than the tagged `paid-unlock` test
proves:

- “Pay $12 once for unlimited lanes on this device.”
- “A $12 one-time license adds unlimited lanes on that device.”
- “Free plans include Shared plus three people.”
- A restored token is checked with Sociobot, while meal-plan data is never sent.

The only paid claim is **“Offers a $12 unlimited-lanes checkout.”** Its test
asserts the price, checkout URL, and HTTP 303 redirect. It never supplies a
valid mocked verification response, adds a fifth lane, checks invalid/revoked
handling, checks the daily verification cache, or inspects the verification
request for absence of meal data. The `local-only` claim runs only in `/demo`,
where license verification is disabled.

The claims contract says an unlisted or incompletely tested visitor promise is
release-blocking. Add tagged sandbox claims for the free lane limit, successful
unlimited-lane activation, invalid license recovery/cache behavior, and the
license request privacy promise; or narrow the copy to what the checkout test
actually proves.

### P1 — mandatory mobile touch targets and label-in-name do not pass

At 390 CSS px, an independent measurement of every visible interactive element
found these targets below the required 44×44 px minimum:

- header **Demo** and **Board** links: 36.3×44 px;
- **Read the privacy details**: 183.2×17 px;
- footer **Privacy**: 44.6×15 px;
- footer **Terms**: 37×15 px.

This occurs on `/` and `/demo`; the header/footer failures also occur on the
legal routes. The one-pixel hidden file input was excluded as it is operated by
its visible label.

Lighthouse 13.4.1 also reports the serious WCAG 2.5.3
`label-content-name-mismatch` finding for visible **Export JSON**, whose
accessible name is “Export this weekly meal plan as JSON.” The words in the
visible label do not occur in the same order, which impairs speech input. The
committed axe-core 4.11 checks omit the `wcag21a` rule used by the current
Lighthouse axe engine, so the 23-test suite does not catch it.

### P1 — the production 404 violates CSP and logs a console error

`GET /not-a-page` correctly returns HTTP 404, but `404.html` contains an inline
`<style>` while the live policy is `style-src 'self'`. Chromium reports:

```text
Applying inline style violates the following Content Security Policy directive
“style-src 'self'”. The action has been blocked.
```

The computed page consequently falls back to a transparent background, black
text, and 16 px Times New Roman instead of the product design. This violates the
required designed 404, CSP consistency, and no-console-errors-on-load gates.
Evidence: `verification-4-evidence/live-404-mobile.png`.

## Other findings

### P2 — SPA route changes focus `<main>`, not the new `<h1>`

Fresh keyboard testing found visible 3 px focus rings, keyboard-reachable meal
controls, correct dialog autofocus, Escape closure, and focus restoration.
However, opening Privacy and using Back leaves focus on `<main>`. The routing
contract requires focus on and announcement of the new `<h1>`.

### P2 — the free-lane boundary has no readable visual feedback

After Shared plus three people are saved, choosing **Add person** closes the
dialog. The explanation is inserted only into the 1×1 clipped `.sr-only` live
region. A sighted user gets no visible error or next step at the point of
failure. Provide a visible status message or keep the dialog open with the
limit and purchase/restore actions.

## Mandatory first-read gate — PASS

In a clean desktop browser, the first viewport says:

- what: **“Plan meals by person, not guesswork”**;
- for whom: households with different meals that need individual and shared
  meals distinguished;
- first action: **“Try it with sample data”**, beside “See a filled week.
  Nothing is saved.”

One click opens `/demo`, immediately shows six realistic source meals for Mara,
Jon, Kids, and Shared, and shows the persistent **“Demo — sample data, nothing
is saved”** banner with **Reset demo** and **Start for real**. Screenshots:
`verification-4-evidence/live-first-read-desktop.png` and
`live-demo-after-one-click.png`.

## Declared claims — 10/10 commands pass

After a clean checkout of the candidate and `npm ci`, every command from
`.factory/claims.json` was run separately through the supplied demo entry point
before the remaining QA:

| Claim | Exact declared command | Result |
| --- | --- | --- |
| `demo-sandbox` | `npm test -- --grep @claim:demo-sandbox` | PASS |
| `json-export` | `npm test -- --grep @claim:json-export` | PASS |
| `json-import-safety` | `npm test -- --grep @claim:json-import-safety` | PASS |
| `offline-reload` | `npm test -- --grep @claim:offline-reload` | PASS |
| `local-only` | `npm test -- --grep @claim:local-only` | PASS |
| `shared-lanes` | `npm test -- --grep @claim:shared-lanes` | PASS |
| `prep-labels` | `npm test -- --grep @claim:prep-labels` | PASS |
| `print-plan` | `npm test -- --grep @claim:print-plan` | PASS |
| `named-lanes` | `npm test -- --grep @claim:named-lanes` | PASS |
| `paid-unlock` | `npm test -- --grep @claim:paid-unlock` | PASS, but scope is incomplete as above |

## Clean build and automated gates

- `npm ci`: PASS; 20 packages installed, 0 vulnerabilities.
- `npm test`: PASS, 23/23 Playwright tests in 19.0 seconds.
- `npx tsc -b --pretty false`: PASS. No separate lint script exists.
- `npm run build`: PASS and produced `dist/`.
- JS: 22,929 B / 8.18 KB gzip; CSS: 12,198 B / 3.55 KB gzip;
  hero WebP: 72,588 B. All static-product budgets pass.
- Factory URL verifier: HTTP 200, correct title/lang, one h1, one main, no
  missing image alt, no unlabeled buttons, and no ordinary root-load errors.
  Evidence: `verification-4-evidence/verify-url-live/verify.json`.
- Lighthouse mobile root: performance 91, accessibility 100, best practices
  100, SEO 100; FCP 0.9 s, LCP 1.1 s, CLS 0.043, TBT 360 ms. The experimental
  serious label-in-name audit above still fails. Evidence:
  `verification-4-evidence/lighthouse-live.json`.

## Independent functional and boundary exercise

- Added Ari, Bee, and Cam; saved and reloaded all named lanes.
- Added a Sunday Shared meal at the UI limits: 80-character title,
  60-character prep label, and 240-character note. It appeared in Shared plus
  all three selected person lanes and all four copies survived reload.
- Syntax-invalid JSON and a structurally valid file with day `7` both produced
  the recovery message and retained all four meal appearances with no page
  error.
- Delete removed all shared appearances; **Undo** restored all four.
- The normal whole-flow request log contained only
  `https://family-meal-lanes.sociobot.in`; there were no console or page errors.
- All internal links discovered on `/`, `/demo`, `/privacy`, and `/terms`
  returned 200. The checkout is the separately verified 303 below.

## Accessibility and responsive evidence

- Playwright plus axe-core 4.11 found zero serious/critical violations on `/`,
  `/demo`, `/privacy`, and `/terms` across light/dark, 1440 px/390 px, and
  reduced-motion contexts. Current Lighthouse found the additional WCAG 2.5.3
  failure described above.
- Each tested page has `lang="en"`, one h1, one main, route-specific title, no
  horizontal page overflow, no page error, and no ordinary console error.
- Reduced motion changes UI transitions to `0.01ms`.
- A keyboard-only path reaches **Add a meal**, Enter opens the dialog with
  focus in Meal name, Escape closes it, and focus returns to Add a meal.
- The 390 px dark and offline captures are in
  `verification-4-evidence/live-demo-mobile-dark.png` and
  `live-demo-mobile-offline.png`.

## Privacy, headers, deployment identity, PWA, and server checks

- Fresh live requests load only same-origin HTML, hashed JS/CSS, and the hero.
  Saving/editing/importing meal data made no external request.
- Visiting `?license=qa-invalid-dfaf00b` stripped the token from the address,
  stored it under `sb_license:family-meal-lanes`, and made exactly one bodyless
  GET to the disclosed Sociobot verify URL. No meal data was present. The
  invalid result relocked the feature and displayed the inactive notice.
- Live response headers include HSTS, `nosniff`, strict-origin referrer policy,
  and a self-only CSP plus the disclosed Sociobot API in `connect-src`.
- Hashed JS/CSS use `public, max-age=31536000, immutable`; `sw.js` and the
  manifest use `no-cache`. `/`, `/demo`, `/privacy`, and `/terms` return 200;
  an unknown route returns 404.
- Manifest: standalone display, 192/512 icons, maskable 512 icon, matching
  theme colors, and versioned `/?v=e5e1660ad6b6` start URL.
- The live worker controlled `/demo` with cache
  `family-meal-lanes-e5e1660ad6b6`. A fresh 390 px offline reload retained the
  title, board, and Lemon chicken sample with no failed request or error. The
  independent full suite's controlled waiting-worker/Update now test passed.
- Live HTML, JS, CSS, worker, manifest, and hero SHA-256 values exactly match
  the fresh candidate build: `ff5732b3…70cfa`, `a3f3d26f…6893e`,
  `e9a6180a…464db`, `5b8ce182…467705`, `3a559219…4843e`, and
  `8a2a2700…a4bc8`.
- The checkout returned HTTP 303 to `checkout.dodopayments.com/session/...`.
  The license verification endpoint allowed 30 sequential invalid requests;
  request 31 returned HTTP 429 with `Retry-After: 4` and
  `x-ratelimit-after: 4`.
- This static PWA has no application backend, account, or sign-in flow, so
  concurrency, server persistence, health/build identity, package-consumer,
  and Entra authority checks are not applicable.

## Required retest

1. Make every paid/privacy promise a tagged observable claim, including a
   mocked valid license that adds a fifth lane and verification privacy/cache.
2. Raise every interactive target to at least 44×44 px and make accessible
   names contain visible labels in the same order; run current axe rules.
3. Move 404 styling to a CSP-permitted asset (or use an exact style hash), then
   assert the direct 404 is styled and console-clean.
4. Focus/announce the route h1 and show the free-lane limit visibly.
5. Repeat all claim commands, full tests/build, live hashes, offline/update,
   mobile keyboard/touch, CSP, Lighthouse, and rate-limit checks.
