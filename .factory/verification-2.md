# Independent verification 2 — FAIL

- **Candidate:** `31039a10446048672f77f2984963b7f4511ad425` (`31039a1`)
- **Live URL:** <https://family-meal-lanes.sociobot.in>
- **Verified:** 2026-08-28 UTC, from a clean checkout after `npm ci`
- **Decision:** **FAIL — do not release.**

## Release blockers

### P1 — a newly added person/lane cannot be saved

This breaks the product's distinctive core primitive: named local lanes.

Reproduced twice against the deployed candidate in a fresh Chromium context:

1. Open `/`; choose **People**; choose **Add person**.
2. Replace `New person` with `Ari`; choose **Save people**.
3. Reopen **People**.

Expected: `Ari` is a saved lane and is available in the meal form.  Actual:
`Ari` is absent, the dialog again contains `New person`, and the meal form has
no Ari sharing checkbox. The Save button did close the dialog with
`returnValue="default"`; the state is simply not persisted. This is consistent
with the new close handler being consumed by the prior `close('cancel')` used
by **Add person** before the replacement dialog is saved. It is not covered by
the 17-test suite or any required claim test.

### P1 — dark mode has serious contrast failures

The product explicitly offers a dark treatment but does not meet the required
contrast baseline in it. On the fresh production build, Playwright plus
axe-core 4.11 in `colorScheme: 'dark'` reports one serious `color-contrast`
violation containing **10 nodes**:

- the skip link;
- `.ink` action controls; and
- each of the eight weekly-board column headers.

For example, the dark media query changes `--ink` to `#fff7e8` while `.ink`
and board headers use that variable as their background and retain white text.
The resulting white-on-`#fff7e8` text fails. The small eyebrow uses
`#bf3d3d` on `#172030` (3.07:1), and the `#2758a6` focus ring on that ground is
2.36:1, also below their applicable requirements.

## Required claims — PASS after install

`.factory/claims.json` exists and contains eight tests. I first invoked the
first exact claim command in the pristine checkout; it could not start because
the expected dev dependencies had not yet been installed (`sh: 1: tsc: not
found`). After the required clean `npm ci` (0 vulnerabilities), I ran every
listed command separately through the supplied `/demo` Playwright entry point:

| Claim | Exact selector run | Result |
| --- | --- | --- |
| Sample data is separate from a new plan | `npm test -- --grep @claim:demo-sandbox` | PASS |
| Exports the visible meal plan as JSON | `npm test -- --grep @claim:json-export` | PASS |
| Safe JSON import rejection | `npm test -- --grep @claim:json-import-safety` | PASS |
| Works offline after the first visit | `npm test -- --grep @claim:offline-reload` | PASS |
| Saved only on this device | `npm test -- --grep @claim:local-only` | PASS |
| Shared meals repeat in selected lanes | `npm test -- --grep @claim:shared-lanes` | PASS |
| Prep labels appear on slips | `npm test -- --grep @claim:prep-labels` | PASS |
| Prints the weekly board | `npm test -- --grep @claim:print-plan` | PASS |

The subsequent full `npm test` passed **17/17** Playwright tests. All seven
claim-like visitor promises on the landing page and README (demo isolation,
JSON export/safe import, offline, local-only, shared lanes, prep labels, and
printing) have a claims entry.

## First-read and end-to-end evidence

Cold live-page reading passed the required first-screen test. It says:

- **What:** “Plan meals by person, not guesswork.”
- **For whom:** “For households with different meals…”
- **What to do first:** the visible one-click **Try it with sample data** link,
  with “See a filled week. Nothing is saved.” alongside it.

The live `/demo` opens a realistic six-meal week for Mara, Jon, and Kids; its
persistent banner says “Demo — sample data, nothing is saved,” includes
**Reset demo**, and has **Start for real**. The claim suite confirms the demo
and real IndexedDB stores are separate.

Normal meal creation, shared display, prep text, JSON export, delete/Undo,
reload persistence, malformed JSON recovery, and blank required title blocking
were exercised. The normal saved-meal path works; the independent lane-creation
path above does not, so the core job cannot be accepted end to end.

At 390×844 the page itself has no horizontal viewport overflow (390px
`scrollWidth` / 390px `innerWidth`), keyboard Enter opens a meal slip, the meal
name receives dialog focus, and Escape closes it. `:focus-visible` is styled,
but the dark focus contrast is inadequate. Also at 390px, each board `+` meal
control is 83×30px and **Reset demo** is 71×19px; these miss the 44px touch
target requirement (P2).

## Build, privacy, PWA, and deployment checks

- `npm run build` and `npx tsc -b --pretty false` pass; `dist/` is produced.
- Full `npm test` passes 17/17. The committed standard-theme axe tests pass on
  `/`, `/demo`, `/privacy`, and `/terms`; the independent dark-mode axe result
  above is the release-blocking exception.
- Fresh build sizes: JS 19.95 KB / **7.20 KB gzip**, CSS 11.20 KB / **3.36 KB
  gzip**; both are below the static/PWA budgets. The hero is 72,588 bytes.
- The live root `index.html`, JS, and CSS have byte-identical SHA-256 hashes to
  the fresh candidate build:
  `26def8…e97dd`, `064e61…45c9`, and `18920e…93e` respectively.
- Live `/`, `/demo`, `/privacy`, and `/terms` return 200; `/not-a-page`
  returns 404. The manifest has standalone display, 192/512 icons and a
  versioned start URL. The active live worker is `/sw.js`, cache
  `family-meal-lanes-7c5dea91baa0`; its app shell is cached and an offline
  `/demo` reload retained the sample meal. The suite's controlled
  service-worker-update regression also passed, including waiting-worker toast,
  **Update now**, activation and reload into a changed hashed asset.
- Live cache headers are appropriate: `sw.js` and manifest are `no-cache`; the
  hashed JS is `public, max-age=31536000, immutable`. Root CSP is
  `default-src 'self'` with `connect-src 'self'`, HSTS, nosniff, and strict
  origin referrer policy.
- A fresh live request log contained only
  `https://family-meal-lanes.sociobot.in` (HTML, local JS/CSS, and hero). The
  local-only claim separately saved a demo meal and asserted only the app
  origin. There are no accounts, sign-in flows, server endpoints, analytics,
  or product-unlock calls; rate-limit and Entra checks are not applicable.
- No live console messages or page errors occurred during cold load, demo,
  keyboard, or offline checks.

## Required repair and re-verification

1. Make lane creation/removal save deterministically, then add a claim or
   regression test that creates a named lane, saves it, reloads, and creates a
   shared meal in it.
2. Correct every dark-theme foreground/background pairing and focus ring;
   run axe in both `light` and `dark` schemes and require zero serious/critical
   findings.
3. Make all mobile interactive targets at least 44×44px, including the board
   add control and demo reset action.
4. Re-run all claim commands, the full suite, production build, live hash
   comparison, PWA offline/update test, and independent desktop/mobile QA.
