# Family Meal Lanes handoff

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

Latest local result: `npm test` passed (5 tests). The production build is
20.68 KB JavaScript (7.43 KB gzip), 11.46 KB CSS (3.45 KB gzip), and the hero
WebP is 71 KB. A 390px Playwright smoke check found one title, one h1, one main,
and no console errors on `/demo`.

## Known gaps

- The standalone axe CLI could not run in this container because its Selenium
  launcher cannot find a system Chrome binary; Playwright’s bundled Chromium was
  used for the semantic, keyboard-path, console, and claim checks instead.
- License verification needs internet access only when a buyer restores or
  refreshes a license. The free plan and cached license state continue offline.
