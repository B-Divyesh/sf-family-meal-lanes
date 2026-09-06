# Family Meal Lanes — repair 6 handoff

## What changed

Fixed review finding F-6-1 in implementation commit
`b433b99a5989eb607e5339e4e818e466474847ca`.

At phone widths, the paid purchase action and license restore form now use the
available width and stack their controls. This prevents enlarged text from
widening the page. The free plan, $12 one-time unlimited-lanes offer, hosted
Sociobot checkout, and license restore path remain unchanged.

Added the outcome-based Playwright regression
`@regression:paid controls reflow and restore a license at 200% text size on a
390px phone`. It doubles the root text size, checks that the document does not
overflow, confirms every paid control is visible and focusable, then restores a
mocked valid license through the visible form.

The prior review documentation is at
`250f3ec85193bb98ba5a7a96a86c4d054cd1fea5`; this repair's implementation is
the separate SHA above.

## Verification

- In a clean clone of `b433b99`, `npm ci` completed with zero reported
  vulnerabilities. Each of the 20 literal commands in `.factory/claims.json`
  passed individually. `npm test` passed 52/52 and `npm run build` produced
  `dist/index.html`.
- Local production output is 26.02 kB JavaScript (8.89 kB gzip) and 13.95 kB
  CSS (3.91 kB gzip), below the static budgets.
- Deployed the tested `dist/` to the existing `sf-family-meal-lanes` Static Web
  App. Deployment `790a8d02-16b4-4bf6-92c2-9a3c7d9317e1` completed, and
  HTTPS returned 200.
- Local and live SHA-256 values match for `index.html`, hashed JavaScript and
  CSS, `sw.js`, the manifest, hero image, and static 404 page.
- `verify-url.sh https://family-meal-lanes.sociobot.in/` passed: one h1,
  `lang=en`, main landmark, image alternatives, labeled buttons, and no root
  console errors.
- Fresh desktop and phone browsers show the job, audience, and first action
  before scrolling: plan meals for each person; households sharing one device;
  **Try it with sample data**. The one-click demo showed its six source meals
  and persistent sample banner. A demo-only meal disappeared after Reset;
  Start for real removed the banner and sample without creating real-plan data.
- On the live 390 px phone page at 200% root text, body and document widths
  are both 390 px. The purchase link, license field, and restore button are
  visible from x=16 to x=374 and each receives keyboard focus.
- Live Playwright axe scans found zero serious or critical issues on `/`,
  `/demo`, `/privacy`, and `/terms` in light and dark schemes. The designed
  missing route returns the expected HTTP 404 with `Page not found`; it is not
  a broken page.
- A fresh live `/demo` visit reloaded offline after service-worker activation
  with its heading, demo banner, and Lemon chicken sample. Security headers
  include `nosniff`, strict-origin referrer policy, and self-only framing.
- Mobile Lighthouse rerun on `/demo`: Performance 100, Accessibility 100,
  Best Practices 100, SEO 100; FCP 0.9 s, LCP 1.1 s, CLS 0, TBT 10 ms.

## Run and deploy

```sh
npm ci
npm test
npm run build
/opt/fleet/lib/deploy-static.sh family-meal-lanes dist
```

## Known gaps

None found in this repair. The optional one-time purchase and license check
continue to depend on Sociobot and Dodo, which were live during verification.
