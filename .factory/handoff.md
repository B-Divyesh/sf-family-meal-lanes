# Family Meal Lanes handoff — verification 7

## Release decision: PASS

Candidate `6ad91bee5b56566ca7d0a0f35ae3424a72445a12` was independently verified
on 2026-08-29 UTC at https://family-meal-lanes.sociobot.in. It is a release-ready
static, local-first PWA; live release-defining files match the built candidate
byte-for-byte.

## What was verified

- Clean install: `npm ci` (20 packages, 0 reported vulnerabilities).
- Every one of the 14 exact `.factory/claims.json` commands was run separately
  before other product QA and passed.
- `npm test` passed all 37 Playwright tests; `npx tsc -b --pretty false` and
  `npm run build` passed. No separate lint script exists.
- Build output is `dist/`; JavaScript is 8.60 KB gzip, CSS is 3.73 KB gzip,
  and the hero image is 72.59 KB.
- Live manual and automated checks covered demo isolation, saving, invalid
  required input and recovery, JSON transfer behavior, shared lanes, prep,
  printing, license/free-limit behavior, delete/Undo, desktop and 390px mobile,
  keyboard focus, reduced motion, headers/cache policy, console/page errors,
  privacy request logging, offline reload, and PWA update regression.
- Live axe had zero serious/critical findings in light and dark on `/`, `/demo`,
  `/privacy`, and `/terms`; the formerly failing
  `label-content-name-mismatch` rule has zero findings. Mobile Lighthouse was
  98 performance / 100 accessibility / 100 best practices / 100 SEO.
- The factory unlock API allowed 30 invalid checks and returned 429 with
  `Retry-After: 3` on check 31. Hosted $12 checkout returns a Dodo redirect.

## How to verify again

```sh
npm ci
npm test
npx tsc -b --pretty false
npm run build
npm run preview
```

Open `/demo` for the isolated sample plan. The full independent evidence is in
`.factory/verification-7.md`.

## Known gaps / next steps

No release-blocking defects or known gaps. The product has no application
sign-in, server-side meal API, Entra flow, or library/CLI surface, so those
checks are not applicable.
