# Independent verification 7 — PASS

**Candidate:** `6ad91bee5b56566ca7d0a0f35ae3424a72445a12` (`main`)
**Live URL:** https://family-meal-lanes.sociobot.in
**Verified:** 2026-08-29 UTC
**Decision:** **PASS — candidate is release-ready.**

## Cold first read

In a fresh browser, the first screen says **“Plan meals by person, not
guesswork.”** It says this is for households with different meals and that it
shows what is each person's and what they share. The first action is the
visible **“Try it with sample data”** button, with the adjacent plain-language
result **“See a filled week. Nothing is saved.”** One click opens the isolated,
populated meal board. The first-read and one-click demo gates pass.

## Clean-checkout gates

`npm ci` completed from the clean candidate checkout (20 packages; 0 reported
vulnerabilities). `.factory/claims.json` exists and declares 14 claims. Before
other product QA, every literal command in that file was run separately after
the clean install, through the shipped demo entry point; all passed:

| Claim ID | Result |
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

Additional clean checks:

- `npm test`: PASS, 37 Playwright tests.
- `npx tsc -b --pretty false`: PASS. There is no separate lint script.
- `npm run build`: PASS and produces `dist/`.
- Production bundle: JavaScript 24.62 KB (8.60 KB gzip), CSS 13.18 KB
  (3.73 KB gzip), and hero image 72.59 KB. All are inside the static-PWA
  budgets.

## Live product, accessibility, and performance

- The live demo has 15 rendered slips for six source meals. It shows the
  shared Lemon chicken tray bake in Shared, Mara, Jon, and Kids; prep labels,
  JSON export/import recovery, printing, named lanes, free three-person
  boundary, license restoration behavior, and delete/Undo all passed in the
  declared browser assertions. A manual live demo save also rendered and
  recovered with no page error.
- At 390 x 844 there was no page-width overflow. Keyboard Enter opened a meal
  dialog and moved focus to the meal-name field; Escape closed it. An empty
  required meal name kept the dialog open, focused that field, and exposed the
  native message “Please fill out this field.” Reduced motion changed slip
  transition duration to `1e-05s`.
- Live axe scans, with CSP bypassed only to inject the audit script, found zero
  serious or critical findings on `/`, `/demo`, `/privacy`, and `/terms` in
  both light and dark schemes. The explicitly enabled
  `label-content-name-mismatch` rule also found zero nodes on the populated
  board. This independently confirms the repair for the defect in
  verification 6.
- `verify-url.sh` on the live root passed: HTTP 200, title, `lang="en"`, one
  h1, a main landmark, no missing image alt attributes, no unlabeled buttons,
  and no console errors (690 ms measured load).
- Mobile Lighthouse on live `/demo`: performance **98**, accessibility **100**,
  best practices **100**, SEO **100**; FCP 996 ms, LCP 1,150 ms, CLS 0.012,
  TBT 163 ms.

## Privacy, PWA, deployment, and endpoint checks

- The outgoing-request log for a complete live demo save/delete/Undo flow
  contained only `https://family-meal-lanes.sociobot.in`; there were no console
  or page errors. The separate license claim verifies the only permitted
  external request is a token-only GET to `api.sociobot.in`, with no meal data.
- Live `/`, `/demo`, `/privacy`, and `/terms` return 200; a nonexistent path
  returns the styled HTTP 404. Responses provide CSP, HSTS,
  `X-Content-Type-Options: nosniff`, and strict-origin referrer policy. Hashed
  assets are immutable; `sw.js` and the manifest are `no-cache`.
- A fresh live context activated the service worker and, after the first visit,
  reloaded `/demo` offline with the headline and Lemon chicken sample still
  visible. The local suite's controlled waiting-worker/update regression also
  passed.
- The production bytes match this candidate exactly: `index.html`, both hashed
  JS/CSS files, `sw.js`, manifest, and hero WebP all have matching SHA-256
  values locally and live. This is not a stale deployment.
- The visible $12 checkout URL returned HTTP 303 to a Dodo hosted-checkout
  session. The documented product-unlock allowance is enforced: 30 sequential
  invalid verification requests returned 200 and request 31 returned **429**
  with **`Retry-After: 3`**.
- There is no application account, sign-in, server-side meal API, or library/
  CLI surface. Entra identity and consumer-package checks therefore do not
  apply.

## Defects

No critical, high, medium, or low release-blocking defects found.

