# Independent verification 5 — FAIL

**Decision:** FAIL — do not release candidate
`57b73aac4ca49b3de48c2dff9feddc1f0c7e5d9f`.

**Tested:** 2026-08-28 UTC at
`https://family-meal-lanes.sociobot.in` and from a clean detached checkout of
the candidate. The live deployment matches the candidate byte-for-byte for
HTML, hashed JavaScript/CSS, service worker, manifest, hero, and 404 assets.

The first-read gate passes and every declared claim command passes. Core meal
planning, local persistence, import/export, privacy, offline reload, service
worker updates, build quality, and performance also pass. Release remains
blocked by defects that the repository suite does not cover.

## Release-blocking findings

### 1. Serious dark-mode contrast failure inside the meal dialog

Open `/demo` with a dark color scheme and choose **Add a meal**. The dialog
heading, labels, fields, legend, and sharing choices render black on Night.
Computed colors are `rgb(0, 0, 0)` on `rgb(23, 32, 48)`. Live axe 4.11 reports
one serious `color-contrast` violation across 15 nodes, with ratios from
1.28:1 to 1.49:1 instead of 3:1/4.5:1.

The committed tests scan dark routes only while dialogs are closed, so all
repository tests pass while this user-critical state fails. Evidence:
`evidence/live-a11y-pwa.json` and
`evidence/live-dark-dialog-contrast.png`.

### 2. Cancel and close cannot dismiss a blank meal form

On a fresh mobile or desktop plan, choose **Add a meal**, leave the required
name blank, then choose **Save meal**. The browser correctly leaves the dialog
open and focuses the invalid field. Both **Cancel** and the × **Close meal
form** control then fail to close it. Both controls are submit buttons inside
the validating `method="dialog"` form. Escape is an undocumented workaround,
but pointer and touch recovery is broken.

Fresh live result: dialog visible before save, after invalid save, after
Cancel, and after ×. Evidence:
`evidence/invalid-dialog-cancel-failure.json` and
`evidence/invalid-dialog-cancel-failure-mobile.png`.

### 3. Interactive accessibility still fails in the actual product states

- Lighthouse's axe audit reports serious WCAG 2.5.3 `label-content-name-mismatch`
  on every sample meal slip. Visible lane and prep text is not included in the
  custom button's `aria-label`.
- In the open 390px meal dialog, sharing checkboxes are 20×20px and their
  clickable labels are only 26px high. This misses the contract's 44×44px
  touch-target minimum. The broad repository target scan never opens a dialog.

Evidence: `evidence/lighthouse-live.json` and
`evidence/live-a11y-pwa.json`.

### 4. Demo edits survive leaving demo mode

From `/demo`, save **Demo persistence probe**, choose **Start for real**, then
return to `/demo`. The probe reappears from `family-meal-lanes:demo`. The
sample remains isolated from real data, but leaving demo does not discard demo
data as required, and the persistent banner says “nothing is saved.” **Reset
demo** does remove the edit.

This is also a claims-contract gap: `demo-sandbox` proves only that sample data
does not enter the real plan. It does not test the stronger visible “nothing is
saved” statement or the required discard-on-exit lifecycle. Evidence:
`evidence/live-product-qa.json`.

### 5. The valid-import portion of a declared claim is not tested

Claim `json-import-safety` says the product “Imports complete Family Meal
Lanes JSON without replacing the current plan when a file is incomplete,” but
its tagged test exercises only rejection of an incomplete file. The README
also tells users to transfer a plan with **Import JSON**. A fresh live
export/import round trip succeeds, but the required claim test does not prove
that promise. Under the supplied claims contract, incomplete observable claim
coverage is release-blocking even when the manual behavior works.

## Other findings

### Medium — Board navigation is dead on legal routes

The shared header uses `href="#board"`. On `/privacy` and `/terms`, choosing
**Board** navigates to `/privacy#board` or `/terms#board`, where no `#board`
exists, and focus remains on the legal-page h1. It should navigate to the
actual board on `/`. Evidence: `evidence/live-404-navigation.json`.

### Medium — route canonical metadata is incorrect

`/demo`, `/privacy`, and `/terms` retain the root canonical URL. Lighthouse
reports an invalid canonical on `/demo` and scores SEO 92. Route titles do
update correctly.

## Mandatory gates and evidence

### Claims and first read

`.factory/claims.json` exists. All 14 exact commands were run independently
before broader QA and passed:

| Claim | Result |
| --- | --- |
| `demo-sandbox` | PASS |
| `json-export` | PASS |
| `json-import-safety` | PASS, but incomplete coverage described above |
| `offline-reload` | PASS |
| `local-only` | PASS |
| `shared-lanes` | PASS |
| `prep-labels` | PASS |
| `print-plan` | PASS |
| `named-lanes` | PASS |
| `paid-unlock` | PASS |
| `free-lane-limit` | PASS |
| `paid-unlimited-lanes` | PASS |
| `license-invalid-cache` | PASS |
| `license-request-privacy` | PASS |

Per-claim output is in `evidence/claims/` with the aggregate in
`evidence/claims/summary.tsv`.

Cold first read at desktop and 390px passes:

- What: “Plan meals by person, not guesswork.”
- Who: “For households with different meals...”
- First click: **Try it with sample data**, next to “See a filled week.
  Nothing is saved.”
- One click opens `/demo` with the filled sample board and persistent demo
  banner.

Evidence: `evidence/first-read.json` and its desktop/mobile captures.

### Clean checkout and repository gates

From a clean detached checkout of the candidate:

```text
npm ci                         PASS (20 packages, 0 vulnerabilities)
npm run build                  PASS; dist/ produced
npx tsc -b --pretty false      PASS
npm test                       PASS; 31/31 tests
```

There is no lint script. Production output is 23,509 bytes JavaScript
(8,368 bytes gzip), 12,893 bytes CSS (3,702 bytes gzip), and a 72,588-byte
hero. These are within the static-product budgets. Evidence:
`evidence/clean-gates-summary.txt`, `evidence/npm-test.log`, and
`evidence/dist-files.txt`.

### Independent live product exercise

Passed in fresh browser contexts:

- one-click seeded demo and separation from a fresh real plan;
- Shared plus three named lanes, visible fourth-person limit;
- 80-character meal name, 60-character prep label, 240-character note,
  Sunday placement, and sharing from Ari to Bee;
- persistence across reload;
- JSON download parsing and valid round-trip import;
- malformed JSON recovery without replacing the plan;
- delete and Undo;
- reduced-motion transition reduced to `0.00001s`;
- desktop and 390px layout, normal keyboard opening, Escape close, focus
  return, route h1 focus, and a visible 3px skip-link focus ring;
- direct 404 status/design, all internal links except the Board defect above,
  and the Dodo checkout redirect.

The normal flows had no console/page errors. Evidence:
`evidence/live-product-qa.json`, `evidence/live-skip-focus.json`, and
`evidence/link-crawl.json`.

### Privacy, headers, rate limiting, and identity

- Normal planning produced same-origin requests only. No third-party font or
  script loaded.
- A license restore emitted one bodyless GET with only the test token in the
  query. The private test meal was absent from the request.
- `/`, `/demo`, `/privacy`, and `/terms` return 200; a missing route returns
  404. Responses include HSTS, `nosniff`, strict-origin referrer policy, and a
  self-only CSP except for the disclosed Sociobot API.
- Hashed JavaScript/CSS are `public, max-age=31536000, immutable`; worker and
  manifest are `no-cache`.
- Checkout returns 303 to `checkout.dodopayments.com/session/...`.
- The license verification endpoint allowed 30 sequential invalid requests
  from one client. Request 31 returned 429 with `Retry-After: 3`.
- Local and live SHA-256 hashes are identical for all release-defining assets.

Evidence: `evidence/live-product-qa.json`, `evidence/live-headers.txt`,
`evidence/license-rate-limit.txt`, `evidence/checkout-identity.txt`, and
`evidence/deployment-hashes.txt`.

### PWA and performance

- Chromium reports a parsed standalone manifest with no installability
  errors, 192/512 icons, and a versioned start URL.
- A live 390px `/demo` reload works offline with the Lemon chicken sample,
  no failed requests, and cache `family-meal-lanes-248dd5e3a1b6`.
- The controlled waiting-worker regression shows the update toast, activates
  **Update now**, reloads, and passes.
- Live mobile Lighthouse: performance 91, closed-page accessibility 100, best
  practices 100, SEO 92; FCP 0.77s, LCP 1.21s, CLS 0.013, TBT 140ms. The
  interactive dialog findings above are not represented in the closed-page
  accessibility score.

Evidence: `evidence/live-manifest-installability.json`,
`evidence/live-a11y-pwa.json`, `evidence/service-worker-update.log`, and
`evidence/lighthouse-summary.json`.

This is a static local-first PWA with no product backend, account, or sign-in
flow. Backend concurrency, server persistence/health, package-consumer, and
Entra authority checks do not apply. The only server-side product surface is
the Sociobot license/checkout API, checked above.

## Required retest

1. Make non-save dialog controls bypass validation and add pointer/touch tests
   for blank required input recovery.
2. Set explicit dark dialog/form colors, enlarge sharing targets, and run axe
   on every open dialog in both color schemes.
3. Make each meal slip's accessible name contain its visible text in order.
4. Discard the demo database on exit or change the visible promise and
   documented lifecycle; add the missing claim test.
5. Test a valid JSON import in the tagged claim, fix Board links from legal
   routes, and set route-specific canonicals.
6. Repeat every declared claim, full clean gates, live hashes, interactive
   accessibility states, offline/update, Lighthouse, request log, and the
   30-request API allowance.
