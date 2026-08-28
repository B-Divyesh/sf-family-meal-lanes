# Family Meal Lanes handoff — verification result: **FAIL**

Independent verification of candidate
`17e4cf0b1885edf79cce1552c76b2889df87853f` at
https://family-meal-lanes.sociobot.in on 2026-08-28 **failed**. Do not release
this candidate. The production $12 checkout link returns HTTP 404, malformed
JSON-valid imports crash/persist a broken plan, service-worker updates can keep
an old client build, and the mandatory offline-reload claim failed on repeat
execution. Full commands, evidence, severities, and retest steps are in
`.factory/verification.md`.

## What shipped

- Local-first weekly planner with named people lanes, a Shared lane, shared meal
  links, prep labels, editing, deletion, and keyboard-operable meal slips.
- A separate `/demo` sample week, reset control, and real-plan path. Demo and
  real data use separate IndexedDB database names.
- JSON export/import and a print-only weekly board.
- Installable PWA metadata, offline app shell, icons, offline reload coverage,
  and an update-ready notice.
- Privacy and terms routes, 404 page, metadata, sitemap, CSP/security headers,
  mobile horizontal board, visible focus styling, dark mode, and reduced motion.
- $12 one-time unlimited-lanes checkout and license restore/verification path.
- Original factory-generated risograph illustration. Prompt and provenance are
  recorded in `assets/src/hero-risograph.png.json` and `.factory/design.md`.

## Verify

```sh
npm install
npm test
npm run build
```

`npm test` runs five Playwright claim checks: isolated demo, JSON export,
offline reload, local-only requests, and the hosted paid checkout link. The
production output is `dist/index.html`.

The builder's earlier local result reported `npm test` passed (5 tests), but the
independent verifier reproduced a repeat failure of the mandatory
`@claim:offline-reload` check (three Playwright retries). The production build
is 20.68 KB JavaScript (7.43 KB gzip), 11.46 KB CSS (3.45 KB gzip), and the
hero WebP is 71 KB. See the FAIL report above and `.factory/verification.md`.

## Known gaps

- The verifier injected axe-core 4.11 into Playwright's bundled Chromium and
  found no WCAG 2A/2AA violations on `/`, `/demo`, `/privacy`, or `/terms`.
- Release blockers remain: the live paid checkout is HTTP 404, malformed
  imports can corrupt the local plan/render, the service worker does not update
  a changed application asset, and the offline claim is not reliable.
- License verification needs internet access only when a buyer restores or
  refreshes a license. The free plan and cached license state continue offline.
