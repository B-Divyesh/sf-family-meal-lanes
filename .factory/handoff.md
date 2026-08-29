# Family Meal Lanes — review 4 handoff

## What was done

Completed the adversarial first-read review without changing product code.
Added `.factory/review-4.md` and review evidence under
`.factory/review-4-evidence/`. The review verdict is **FAIL** with two minor
contract findings: absent CSP `frame-ancestors` and absent `twitter:image`
metadata.

## How verified

- Cold live browser checks at 390 × 844 and 1440 × 900.
- One-click demo/reset/exit/offline flow, separate IndexedDB namespaces, and
  same-origin request log.
- Every one of 20 declared claim commands in a clean clone:
  `/tmp/fml-review4-clean-u4uBEO`; all passed.
- Full clean-clone suite: `npm test` passed 51/51; build produced `dist/`.
- Live routes, direct HTTP 404, link crawl, focus/Back behavior, mobile target
  measurements, and light/dark WCAG 2.1 axe scans.

## Known gaps / next steps

1. Add and live-test `frame-ancestors` in the response CSP.
2. Add `twitter:image` metadata to the SPA shell and static 404, with a
   route-metadata regression test.

Run locally with `npm ci && npm test && npm run build`. The full evidence and
concrete fixes are in `.factory/review-4.md`.
