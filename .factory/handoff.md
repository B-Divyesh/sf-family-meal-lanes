# Repair handoff — perfection loop 1

## Outcome

All eleven findings in `.factory/review-1.md` are fixed and verified. There
were no earlier review or polish reports. The repaired static PWA is live at
https://family-meal-lanes.sociobot.in.

The homepage now says exactly what the board does. Its primary action opens an
isolated `/?demo=1` sample in one click. The demo shows a populated board in the
first mobile viewport and provides working reset and exit controls. The direct
HTTP 404 now uses the product header, navigation, footer, legal links, metadata,
and risograph visual system. Route titles, descriptions, canonical URLs, focus,
and announcements are covered by browser tests.

Two previously unregistered README promises now have claim entries and browser
tests: the six-meal sample and free export/import/print. The README and complete
copy audit use the revised plain wording. The catalog description is verb-first
and 88 characters long.

## Verification

Verified on 2026-08-29 against product commit `5e10ea7`.

- Fresh clone: `/tmp/family-meal-lanes-release-3I5Nx1`.
- `npm ci`: passed; 0 vulnerabilities.
- Every command in `.factory/claims.json`: 16/16 passed independently.
- `npm test`: 45/45 passed. This covers browser integration, keyboard flows,
  390px layout and touch targets, route focus, light/dark axe scans, privacy,
  offline reload, service-worker updates, import safety, and paid boundaries.
- `npm run build`: passed; `dist/index.html` exists.
- Initial bundles: JavaScript 25.94 kB raw / 8.90 kB gzip; CSS 13.60 kB raw /
  3.84 kB gzip; hero image 72.59 kB. All are within their budgets.
- `/opt/fleet/lib/verify-url.sh` against live `/?demo=1`: passed with HTTPS
  200, one h1, `lang=en`, main, alt/labeled controls, and no console errors.
- Live browser QA: 36/36 checks passed. Requests during the demo flow were
  same-origin only. A cold offline reload retained the sample board.
- Live axe: zero serious or critical issues in light and dark modes on `/`,
  `/?demo=1`, `/privacy`, `/terms`, and `/404.html`.
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100,
  SEO 100; LCP 0.9 s, FCP 0.8 s, CLS 0, total blocking time 10 ms.
- Live `GET /missing-polish-1`: HTTP 404 with the new page and legal links.
- Deployment hashes match local output for HTML, JavaScript, CSS, service
  worker, and the 404 document.

Evidence is under `.factory/polish-1-evidence/`. The finding-by-finding map is
in `.factory/polish-1.md`.

## Run and deploy

```sh
npm ci
npm test
npm run build
/opt/fleet/lib/deploy-static.sh family-meal-lanes /work/repo/dist
```

## Known gaps and next steps

No known product, review, test, accessibility, privacy, offline, or deployment
gap remains from this work order. Routine future work is limited to dependency
maintenance and responding to new user feedback.
