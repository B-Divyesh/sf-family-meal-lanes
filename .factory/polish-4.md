# Perfection loop — polish 4

Base review: `.factory/review-4.md` at `544c5cfcaf8e261b121e8a415a15a6c1ae53360e`.
Repair commit: `53d9512bcc06b91454fcb104f49d1034367b4a34`. Deployment:
`df9b0e50-8051-41b1-934b-eb089fac10af`.

## Cumulative finding closure

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Kept the designed static 404 on the shared skip/header/nav/main/footer/legal skeleton. | `@regression:direct 404 has the site skeleton, metadata, legal links, and CSP-clean styling`; [cold 404 mobile](polish-4-evidence/live-404-mobile.png); `https://family-meal-lanes.sociobot.in/missing-polish-4` returns 404. |
| F-1-2 | Kept `Page not found` and direct recovery text in the static and in-app states. | Direct-404 and in-app-not-found regressions; [cold 404 mobile](polish-4-evidence/live-404-mobile.png). |
| F-1-3 | Kept the job-first h1 `Plan meals for each person`. | `@regression:review-1 copy uses concrete wording and a valid catalog line`; [cold home mobile](polish-4-evidence/live-home-mobile.png); live `/` cold check. |
| F-1-4 | Kept `Manage people` as the visible and accessible control name. | `@regression:visible Export JSON label is its accessible name`; [cold home mobile](polish-4-evidence/live-home-mobile.png). |
| F-1-5 | Kept `Plan individual and shared meals` as the how-to heading. | `@regression:review-1 copy uses concrete wording and a valid catalog line`; [cold home mobile](polish-4-evidence/live-home-mobile.png). |
| F-1-6 | Kept first-visit offline wording and the offline demo path. | `@claim:offline-reload`; live audit offline reload at `/?demo=1` in [live audit](polish-4-evidence/live-audit.json). |
| F-1-7 | Kept the concrete prep wording without an untested time-saving promise. | `@regression:review-1 copy uses concrete wording and a valid catalog line`; [cold home mobile](polish-4-evidence/live-home-mobile.png). |
| F-1-8 | Retained the README’s four short action sentences. | `.factory/copy-audit.md`; clean-clone `npm test` passed 51/51. |
| F-1-9 | Retained the concise README test description without internal jargon. | `.factory/copy-audit.md`; clean-clone `npm test` passed 51/51. |
| F-1-10 | Retained plain browser-storage wording in household-facing README copy. | `.factory/copy-audit.md`; `@regression:review-1 copy uses concrete wording and a valid catalog line`. |
| F-1-11 | Retained separate observable claims for six sample meals and free transfers. | `@claim:sample-six-meals`; `@claim:free-export-import-print`; live [demo mobile](polish-4-evidence/live-demo-mobile.png). |
| F-2-1 | Retained the accurate README heading `Claims tested`. | `@regression:review-2 describes the full claim test scope accurately`; `.factory/copy-audit.md`. |
| F-3-1 | Retained the explicit create/save/reload/edit core claim. | `@claim:meal-create-edit`; clean-clone individual claim run passed. |
| F-3-2 | Retained the concrete single-weekly-board wording. | `@regression:review-3 copy is concrete, provider roles are clear, and public provenance copy is absent`; [cold home mobile](polish-4-evidence/live-home-mobile.png). |
| F-3-3 | Retained the tested recipe/grocery/nutrition/allergen boundary. | `@claim:scope-boundaries`; live `/` cold check in [live audit](polish-4-evidence/live-audit.json). |
| F-3-4 | Kept untestable illustration-provenance copy out of public footers. | `@regression:review-3 copy is concrete, provider roles are clear, and public provenance copy is absent`; [cold 404 mobile](polish-4-evidence/live-404-mobile.png). |
| F-3-5 | Retained plain README deploy copy plus tested built routes, headers, 404, and cache rules. | `@claim:build-output`; `@claim:hosting-config`; live header and direct-route checks in [live audit](polish-4-evidence/live-audit.json). |
| F-3-6 | Retained the explicit Sociobot/Dodo payment roles. | `@regression:review-3 copy is concrete, provider roles are clear, and public provenance copy is absent`; `@claim:paid-unlock`. |
| F-4-1 | Added `frame-ancestors 'self'` to the response CSP in `staticwebapp.config.json`. | `@claim:hosting-config` now asserts the directive; every cold live route and 404 exposes it in [live audit](polish-4-evidence/live-audit.json). |
| F-4-2 | Added the existing social card as `twitter:image` in the SPA shell and static 404; route updates preserve it. | `@regression:each route has its own title, description, and canonical URL` now asserts it; all five cold live pages expose it in [live audit](polish-4-evidence/live-audit.json). |

## Verification

- Clean remote clone `/tmp/family-meal-lanes-polish-4-D2f1Ju` at
  `53d9512bcc06b91454fcb104f49d1034367b4a34`: `npm ci` passed, then all 20
  literal commands in `.factory/claims.json` passed separately. The same
  clone passed `npm test` (51/51) and a final `npm run build`.
- The production build is 26.02 kB JavaScript raw / 8.89 kB gzip and 13.60 kB
  CSS raw / 3.84 kB gzip. The generated hero remains 72,588 bytes.
- `verify-url.sh https://family-meal-lanes.sociobot.in/` passed at
  634 ms: HTTP 200, title, `lang=en`, one h1, main landmark, no missing image
  alt text, no unlabeled buttons, and no console errors. Its output is in
  [verify.json](polish-4-evidence/verify-url/verify.json).
- The cold live audit passed on `/`, `/demo`, `/privacy`, `/terms`, and an HTTP
  404: titles, h1s, Twitter image, CSP framing protection, no horizontal
  overflow, and no unexpected console/page errors. It also passed the direct
  `?demo=1` reset/exit isolation, same-origin request log, explicit
  `label-content-name-mismatch` axe rule, and offline reload. See
  [live audit](polish-4-evidence/live-audit.json).
- Axe WCAG 2 A/AA serious/critical checks passed on those five routes in both
  light and dark schemes (10 scans, zero violations). Mobile screenshots are
  [home](polish-4-evidence/live-home-mobile.png),
  [demo](polish-4-evidence/live-demo-mobile.png), and
  [404](polish-4-evidence/live-404-mobile.png).
- Mobile Lighthouse on live `/?demo=1`: Performance 100, Accessibility 100,
  Best Practices 100, SEO 100; FCP 782 ms, LCP 912 ms, CLS 0, TBT 5 ms. See
  [lighthouse JSON](polish-4-evidence/lighthouse-live.json).
- Deployment bytes match for `index.html`, `sw.js`, static 404, hashed JS, and
  hashed CSS. The live header contains `frame-ancestors 'self'`.

All 20 review findings are closed. No issue is deferred.
