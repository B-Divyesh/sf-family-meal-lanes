# Family Meal Lanes handoff — repair

This repair addresses every release blocker from independent verification commit
`445ec91ee0b4cf8fbfa4af387ed5a4632a4d0ef4` of candidate
`17e4cf0b1885edf79cce1552c76b2889df87853f`.

## What changed

- Removed the unavailable $12 checkout and license path. The production billing
  product still returns 404, so advertising a purchase would be misleading.
  The planner now supports household lanes without a paywall; a checkout can be
  added back only after the factory enables the registered product.
- Added strict import validation before any plan is assigned or persisted. A
  plan must have valid unique lanes (including Shared), valid meals, known lane
  references, bounded strings, dates, and complete sharing data. Invalid files
  preserve the visible/current plan and state the recovery action. Invalid old
  browser records are reset safely at load rather than rendered.
- Replaced stable application filenames and the hand-written fixed worker with
  build-generated hashed JS/CSS and a content-versioned service-worker cache.
  The worker itself is `no-cache`, uses a new cache per build, precaches the
  complete shell, surfaces a waiting update, and reloads through **Update now**.
  Its cache lookup uses the request URL, fixing the repeat offline-reload miss.
- Added real route copies for `/demo`, `/privacy`, and `/terms`, removed the
  catch-all navigation fallback, and configured a genuine host 404 response.
  Hashed `/assets/*` are immutable.
- Added the previously unlisted shared-lane, prep-label, print, and safe-import
  claims with observable browser coverage. Deleting a meal now includes the
  promised visible **Undo** action.

## Verify

```sh
npm ci
npm test
npm run build
```

Clean `npm ci` completed with 0 vulnerabilities. Every exact command in
`.factory/claims.json` passed independently: demo sandbox, JSON export, safe
import rejection, offline reload, local-only requests, shared lanes, prep
labels, and printing. The full suite passed 17 Playwright tests, including:

- the verifier's malformed JSON-valid import fixture, with no page error and
  preservation of the sample plan;
- three successive clean runs of `@claim:offline-reload` using
  `context.setOffline(true)`;
- a controlled worker update that asserts the waiting notice, **Update now**,
  activation, and execution of the updated JS asset;
- axe-core 4.11 WCAG 2A/2AA scans of `/`, `/demo`, `/privacy`, and `/terms`
  (zero serious/critical violations), mobile 390px keyboard-dialog coverage,
  and no console/page errors.

`npm run build` produces `dist/` with `index.html` at its root. Current output
is 19.95 KB JavaScript (7.20 KB gzip) and 11.77 KB CSS (3.47 KB gzip). Local
`verify-url.sh` against the production build reported HTTP 200, one h1, one
main landmark, `lang="en"`, zero images missing alt text, zero unlabeled
buttons, and no console errors.

## Deploy and known gaps

Deploy the existing static artifact with:

```sh
/opt/fleet/lib/deploy-static.sh family-meal-lanes dist
```

No product data leaves the browser in normal or demo use; the removed checkout
also removes the formerly declared external API connection. The original
verification report remains in `.factory/verification.md` as the repair input.
There are no known functional gaps. Billing is deliberately not offered until
the factory registers and enables a working Sociobot checkout endpoint.
