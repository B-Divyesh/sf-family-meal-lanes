# Perfection loop — polish 1

Base review: `.factory/review-1.md` at `1d9c630`. No earlier review or polish
report exists in this repository. Deployed product code: `5e10ea7`.

## Finding closure

| Finding | Change made | Automated evidence | Screenshot and live check |
| --- | --- | --- | --- |
| F-1-1 | Rebuilt the static HTTP 404 with the shared skip link, wordmark, header/nav, footer, Privacy and Terms links, favicon, canonical, description, social metadata, and risograph paper styling. It still returns HTTP 404. | `@regression:direct 404 has the site skeleton, metadata, legal links, and CSP-clean styling`; light/dark `@regression:accessibility /404.html`; 390px target sweep | `.factory/polish-1-evidence/live-404-mobile.png`; `GET https://family-meal-lanes.sociobot.in/missing-polish-1` returned 404 and passed the live skeleton check. |
| F-1-2 | Replaced both static and in-app metaphor headings with `Page not found` and a direct explanation. | `@regression:direct 404…`; `@regression:in-app unknown routes use a real not-found title and recovery page` | `.factory/polish-1-evidence/live-404-mobile.png`; the live missing URL exposes the new h1 and title. |
| F-1-3 | Changed the landing h1 to `Plan meals for each person`. | `@regression:review-1 copy uses concrete wording and a valid catalog line`; route-focus regression | `.factory/polish-1-evidence/live-home-mobile.png`; live `/` check passed. |
| F-1-4 | Changed the visible and accessible toolbar label to `Manage people`; widened its paper control at mobile sizes. | `@regression:visible Export JSON label is its accessible name`; `@regression:review-1 copy…`; 390px target sweep | `.factory/polish-1-evidence/live-home-mobile.png`; live name/role check passed. |
| F-1-5 | Renamed the section `Plan individual and shared meals`. | `@regression:review-1 copy uses concrete wording and a valid catalog line` | `.factory/polish-1-evidence/live-home-mobile.png`; live `/` check passed. |
| F-1-6 | Replaced undefined setup wording with `Works offline after your first visit.` | `@regression:review-1 copy…`; `@claim:offline-reload` | `.factory/polish-1-evidence/live-demo-offline-mobile.png`; cold live offline reload kept the sample board visible. |
| F-1-7 | Replaced the untestable time-saving promise with `Leave a small prep task for later.` | `@regression:review-1 copy uses concrete wording and a valid catalog line` | `.factory/polish-1-evidence/live-home-mobile.png`; live `/` check passed. |
| F-1-8 | Split the README’s four-action sentence into four short instructions. | `@regression:review-1 copy uses concrete wording and a valid catalog line`; `.factory/copy-audit.md` | Pushed README at `5e10ea7`; the complete audit records every sentence at 22 words or fewer. |
| F-1-9 | Replaced the 37-word internal test description with three plain sentences. | `@regression:review-1 copy uses concrete wording and a valid catalog line`; `.factory/copy-audit.md` | Pushed README at `5e10ea7`; the longest replacement sentence is 16 words. |
| F-1-10 | Replaced household-facing `PWA` and `IndexedDB` wording with first-visit and browser-storage wording. Technical storage details remain only in `.factory/demo.md`. | `@regression:review-1 copy uses concrete wording and a valid catalog line` | Pushed README at `5e10ea7`; stale-phrase scan found no reviewed wording in product copy. |
| F-1-11 | Registered `sample-six-meals` and `free-export-import-print` in `.factory/claims.json`. Each has one observable browser test. | `@claim:sample-six-meals`; `@claim:free-export-import-print`; `@regression:claim manifest has one matching test for every unique claim` | `.factory/polish-1-evidence/live-demo-mobile.png`; live demo counted six distinct meals. The full no-license transfer flow passed locally. |

## Additional acceptance work

- The primary action now enters `/?demo=1` in one click. The demo has a
  persistent banner, **Reset demo**, and **Start for real**.
- Demo mode uses `family-meal-lanes:demo`; real plans use
  `family-meal-lanes:real`. The live reset and exit probes both disappeared.
- Demo-only layout now places a populated sample meal inside the first 390 ×
  844 viewport.
- Route navigation updates title, description, Open Graph/Twitter metadata,
  canonical URL, focus, and the polite route announcement.
- `.factory/catalog-description.txt` is an 88-character verb-first sentence.

## Evidence summary

- Clean clone `/tmp/family-meal-lanes-release-3I5Nx1` at `5e10ea7`:
  16/16 claim commands passed individually; `npm test` passed 45/45; final
  `npm run build` passed.
- Live verifier: `.factory/polish-1-evidence/verify-live/verify.json` reports
  HTTPS 200, title, `lang=en`, one h1, main, labeled controls/images, and no
  console errors.
- Live browser matrix: `.factory/polish-1-evidence/live-checks.json` reports
  36/36 checks passed, including light/dark axe scans on five routes.
- Lighthouse: `.factory/polish-1-evidence/lighthouse-live.json` reports
  Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 0.9 s,
  CLS 0, and total blocking time 10 ms.
- Deployment identity: local and live SHA-256 values match for `index.html`,
  JavaScript, CSS, and `sw.js`; the live HTTP 404 body matches `public/404.html`.

All F-1-1 through F-1-11 are closed. No severity is deferred.
