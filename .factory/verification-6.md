# Independent verification 6 — FAIL

**Decision:** FAIL — do not release candidate
`a253f08395c72296b3da98eea60bb2e1d97313dd`.

**Tested:** 2026-08-28 UTC from the clean candidate checkout and at
`https://family-meal-lanes.sociobot.in`. The live deployment matches the
candidate byte-for-byte for the release-defining HTML, JavaScript, CSS,
service worker, manifest, hero, route HTML, and 404 assets.

The first-read gate and all 14 declared claim assertions pass after the
required lockfile install. Core meal planning, privacy, PWA behavior, mobile
layout, build quality, and performance also pass. Release is blocked by one
serious accessibility defect in the real, populated product state.

## Release-blocking finding

### High — all populated meal slips fail WCAG 2.5.3 label in name

On the live `/demo` board, all 15 rendered meal-slip buttons fail axe's
`label-content-name-mismatch` rule with serious impact. Lighthouse reports the
same audit at score 0 and identifies all 15 buttons. For example, the visible
label is rendered as `SHARED / Lemon chicken tray bake / Prep: Chop
vegetables`, while the custom accessible name is `Shared Lemon chicken tray
bake Prep: Chop vegetables. Edit meal.`. The CSS-transformed visible lane text
is not contained exactly in the accessible name used by speech input.

Fresh reproduction:

```text
axe rule: label-content-name-mismatch
impact: serious
nodes: 15
failure: Text inside the element is not included in the accessible name
```

The committed test only asserts the authored accessible name. The standard
axe scans omit this experimental rule, so 36 repository tests pass while the
user-facing state still fails. Retest by enabling
`label-content-name-mismatch` explicitly on the populated board and by running
Lighthouse. A durable fix is to let the visible text form the name and append
an off-screen “Edit meal” hint, or otherwise ensure the computed accessible
name contains the rendered visible text exactly.

## Mandatory gates

### Claims and first read

`.factory/claims.json` exists and lists 14 claims. In the untouched clone, the
literal first invocation of every listed command returned 127 because
dependencies had not yet been installed (`tsc: not found`). After the required
`npm ci` step, every exact command was rerun separately and its assertion
passed:

| Claim | Result |
| --- | --- |
| `demo-sandbox` | PASS |
| `json-export` | PASS |
| `json-import-safety` | PASS |
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

The pre-install exit is an absent-toolchain prerequisite rather than a failed
product assertion; the installed clean-clone result above is the release
evidence.

The cold first screen passes:

- What: **Plan meals by person, not guesswork**.
- Who: households with different meals that need to see what is theirs and
  what they share.
- First action: **Try it with sample data**, beside “See a filled week. Nothing
  is saved.”
- One click opens `/demo`, a filled six-meal week with the persistent demo
  banner, **Reset demo**, and **Start for real**.

### Clean checkout and build

```text
npm ci                         PASS; 20 packages, 0 vulnerabilities
npm test                       PASS; 36/36 Playwright tests
npx tsc -b --pretty false      PASS
npm run build                  PASS; dist/index.html produced
verify-url.sh local preview    PASS; 200, one h1, lang, main, alt, no errors
```

There is no separate lint script. Production output is 24,700 bytes of
JavaScript (8.63 KB gzip), 13,178 bytes of CSS (3.73 KB gzip), and a 72,588
byte hero. There are no web fonts. These are below the stated budgets.

## Independent product exercise

Fresh live browser contexts passed:

- six realistic demo meals and shared meals repeated in all selected lanes;
- an 80-character meal name, 60-character prep label, 240-character note,
  Sunday placement, save, reload, and JSON export with exact values;
- incomplete JSON rejection with the current plan unchanged;
- delete and **Undo**;
- blank required-name focus plus pointer **Cancel** recovery;
- demo edits discarded by **Start for real**, with the real plan free of
  sample data and a newly opened demo reseeded;
- desktop and exact 390×844 mobile layout with no page-level overflow;
- keyboard skip link, 3 px visible focus ring, dialog focus and Escape close;
- reduced-motion transition duration of `0.00001s`;
- dark dialog text and fields, all visible mobile controls, and open-dialog
  controls at least 44×44 px;
- default axe scans with zero other serious/critical findings.

The release blocker above remains because the label-in-name rule must be
enabled explicitly; Lighthouse enables and reports it.

## Privacy, headers, paid endpoint, and routing

- The complete normal demo flow made same-origin requests only. There are no
  third-party fonts, scripts, analytics, or trackers.
- A real live license restore made one bodyless `GET` to
  `https://api.sociobot.in/api/v1/products/family-meal-lanes/verify?license=verification-6-private-token`.
  The private meal title was absent from the URL and request body.
- `/`, `/demo`, `/privacy`, and `/terms` returned 200. A direct missing route
  returned 404 with the designed page.
- Responses include HSTS, `nosniff`, strict-origin referrer policy, and the
  self-only CSP except for the disclosed Sociobot API.
- Hashed JS/CSS use `public, max-age=31536000, immutable`; `sw.js` and the
  manifest use `no-cache`.
- Checkout returned 303 to `checkout.dodopayments.com/session/...`.
- The verify API allowed 30 sequential invalid requests from one client.
  Request 31 returned 429 with `Retry-After: 3`.

## PWA and performance

- Chromium found no manifest parse or installability errors. The standalone
  manifest has 192/512 icons and versioned start URL
  `/?v=a32286987bb5`.
- Live `/demo` reloaded offline with the shell and sample meal visible. Cache
  `family-meal-lanes-a32286987bb5` was present.
- The repository's controlled service-worker update test installed a waiting
  worker, exposed **Update now**, activated it, and loaded the new asset.
- Live mobile Lighthouse: performance 92, accessibility category 100, best
  practices 100, SEO 100; FCP 1.01 s, LCP 1.51 s, CLS 0.013, TBT 357 ms,
  transferred bytes 129,457. The category score does not count the
  experimental serious label-in-name audit described above.

## Deployment identity

Fresh local and live SHA-256 values matched:

| Asset | SHA-256 |
| --- | --- |
| `index.html` and route HTML | `69d29b4802457493127f617e72480d6397b512a988009f205ec107f402e19f03` |
| `assets/index-BKv4Aq0f.js` | `6c44b9b0790276b7bfa4c65b3acd240b0fc145a32a4a2f9f93259f27f358036f` |
| `assets/index-CW4lb6nI.css` | `afd8654086d455e0ff720748ca81f23e541626c2addeacba52ddcc18d30bac93` |
| `sw.js` | `baac3ef1cec172b954189f85f591eab9c7c6db6c16c7ece47e89fd7f4a399d4c` |
| `manifest.webmanifest` | `dd6f7e054aa009a538260df17f2a6e1b4c0d29592133bdc7b611f759035e9e44` |
| `hero-risograph.webp` | `8a2a2700458cb89660d408de4831062b2db5dff3155d0053d77f1c02284a4bc8` |
| `404.html` | `e1ce068012545d781c91f685962a1cd82ae17bccb8be764f07eb15744d5095dc` |
| `404.css` | `8974d6561cc1d233a3da5ec4f5bfef46fc154904930cc08ac9973aed7fbc9498` |

One browser navigation received a transient 502 for `/demo`; ten immediate
fresh HTTP checks all returned 200, and subsequent isolated browser loads
returned 200 without console or page errors. It was not reproducible.

This is a static local-first PWA, not a package, CLI, backend, or sign-in
product. Package-consumer, backend concurrency/persistence/health, and Entra
identity checks do not apply. AI would not improve the brief's smallest useful
job and is correctly absent.

## Required retest

1. Fix the computed label-in-name relationship for every meal slip.
2. Add a regression that explicitly enables axe
   `label-content-name-mismatch` on a populated board.
3. Repeat Lighthouse, the explicit axe rule, all declared claims, full clean
   gates, live hashes, offline/update, request logging, and API throttling.
