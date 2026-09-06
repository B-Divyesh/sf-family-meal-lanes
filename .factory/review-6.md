# Plan meals for each person — review 6

**Verdict: FAIL.** One medium finding remains. There are no untested public
claims. A PASS requires zero findings of every severity.

Reviewed on 2026-09-06 UTC against
`https://family-meal-lanes.sociobot.in` without changing product code.

- Implementation candidate: `53d9512bcc06b91454fcb104f49d1034367b4a34`
- Documentation checkout: `eae14c66cb2a66bedc1035da5652f4a3354e51f6`
- The commits after `53d9512` contain reports and evidence only. Fresh local
  build hashes match the live HTML, JavaScript, CSS, worker, manifest, 404,
  and social image.

`.factory/brief.json` is absent from the checkout. The supplied researched
brief was used as the acceptance context.

## Job, audience, and first action

Fresh phone and desktop browsers gave the same answer before scrolling:

- **Job:** plan individual and shared meals for each person on one weekly board.
- **Audience:** a household sharing one device where people eat different and
  shared meals.
- **First action:** **Try it with sample data**. The adjacent text says,
  `See a filled week. Nothing is saved.`

The h1 is `Plan meals for each person`. The audience sentence, action, result,
and three facts are visible inside the 390 × 844 first viewport. The desktop
viewport was 1440 × 900. Both cold loads had one h1 and no console or page
error. Evidence:
[phone](review-6-evidence/first-read-phone.png) and
[desktop](review-6-evidence/first-read-desktop.png).

## Finding

### F-6-1 — Medium — the paid section does not reflow at 200% text size

At a 390 px viewport, increasing the root text size to 200% widens the page to
456 px. The `Buy unlimited lanes for $12` action and license form extend past
the right viewport edge. A user who enlarges text must scroll horizontally to
read and operate this ordinary form content.

This fails the attached accessibility baseline that text resize to 200%
without loss. The weekly table is allowed to scroll inside its own labeled
container; the paid form is not a two-dimensional-content exception.

Evidence:

- [200% text screenshot](review-6-evidence/text-200-phone.png)
- [Live audit](review-6-evidence/live-audit.json): viewport 390 px, body and
  document scroll width 456 px; this is the audit's only failed check.

Concrete fix: let the purchase action and license form shrink or stack within
their container at enlarged text sizes. Remove the form input's effective
minimum width at narrow widths and constrain both actions to the available
width. Add a 390 px, 200% text-size regression that asserts the document does
not exceed the viewport and that every paid control remains visible and
operable.

## Demo, normal use, boundaries, and recovery

The one-click action opened `/?demo=1` with six realistic meals across Shared,
Mara, Jon, and Kids. The first product screen was populated. The banner stayed
visible and read `Demo — sample data, nothing is saved`, with **Reset demo**
and **Start for real**.

The live exercise proved:

- Reset removed an edited/imported demo plan and restored exactly six samples.
- A real-plan sentinel survived demo use. Demo meals and an exit probe never
  entered the real plan. Reopening the demo reseeded only the sample.
- Shared Lemon chicken appeared in all four selected lanes, with its prep label.
- Blank required input stayed in the dialog, focused Meal name, and showed a
  recovery instruction. Cancel then closed the invalid form.
- An 80-character meal name, 60-character prep label, 240-character note, and
  Sunday placement saved and survived reload.
- A complete JSON import replaced the visible demo plan. An incomplete import
  retained the current plan and showed the recovery message.
- Export produced parseable JSON. Delete exposed **Undo**, which restored the
  meal.
- Enter opened the meal dialog, Escape closed it and restored focus, and the
  reduced-motion transition was `0.00001s`.
- Shared plus three people saved; trying a fourth kept the people dialog open
  with the exact free-limit explanation.

The populated state is shown in
[the phone demo capture](review-6-evidence/demo-after-one-click-phone.png).
The normal planning flow made same-origin requests only and logged no console
or page errors.

## Claims

After `npm ci` in a clean detached checkout of the implementation candidate,
every literal command in `.factory/claims.json` ran separately. All 20 passed.

| Claim | Result |
| --- | --- |
| `demo-sandbox` | PASS |
| `sample-six-meals` | PASS |
| `meal-create-edit` | PASS |
| `json-export` | PASS |
| `json-import-safety` | PASS |
| `offline-reload` | PASS |
| `local-only` | PASS |
| `scope-boundaries` | PASS |
| `shared-lanes` | PASS |
| `prep-labels` | PASS |
| `print-plan` | PASS |
| `free-export-import-print` | PASS |
| `named-lanes` | PASS |
| `paid-unlock` | PASS |
| `free-lane-limit` | PASS |
| `paid-unlimited-lanes` | PASS |
| `license-invalid-cache` | PASS |
| `license-request-privacy` | PASS |
| `build-output` | PASS |
| `hosting-config` | PASS |

The landing page, legal pages, README, demo document, and claims manifest were
cross-checked. Every public promise maps to one of these tests or is a direct
instruction. Untested claim count: **0**. Exact command results are in
[claims-summary.tsv](review-6-evidence/claims-summary.tsv).

## Clean checkout and build

The documented setup completed from the clean implementation checkout:

- `npm ci`: pass; 20 packages, zero reported vulnerabilities.
- `npm test`: pass; 51/51 Playwright tests.
- `npm run build`: pass; `dist/index.html` produced.
- JavaScript: 26.02 kB raw / 8.89 kB gzip.
- CSS: 13.60 kB raw / 3.84 kB gzip.
- Hero image: 72,588 bytes.

There is no lint script. Type checking runs as part of the build. The full test
output is in [npm-test.log](review-6-evidence/npm-test.log).

## Accessibility and structure

- Live light and dark axe scans covered `/`, `/demo`, `/privacy`, `/terms`,
  and the designed HTTP 404. They found zero serious or critical violations.
- The populated board separately passed axe's
  `label-content-name-mismatch` rule.
- Visible 390 px controls were at least 44 × 44 px. Open light/dark dialog
  states are covered by the passing clean suite.
- The skip link has a 3 px focus ring and moves focus to the h1 inside main.
  SPA navigation and Back update focus and the polite route announcement.
- Each route has `lang="en"`, one h1, header, navigation, main, footer,
  route title, description, canonical URL, and product social image.
- `/`, `/demo`, `/privacy`, and `/terms` return 200. A fresh request to the
  missing route returns the expected HTTP 404 and a designed recovery page.
  This deliberate 404 is not a defect.
- All discovered internal links returned 200, except the 404 document's own
  in-page skip link, which correctly remained on the 404 response. Checkout
  returned 303 to `checkout.dodopayments.com`.

The required URL verifier passed the live root: title, language, one h1, main,
image alternatives, labeled buttons, and no console errors. F-6-1 remains
because automated closed-page accessibility scores do not test 200% text
reflow.

## Privacy, PWA, performance, and hosted billing

- Normal meal planning sent requests only to the product origin. There are no
  third-party fonts, scripts, analytics, or trackers.
- The optional license path made one bodyless GET whose URL contained only the
  license parameter; meal data was absent.
- The privacy and terms routes are present. Meal data remains in the browser's
  separate real/demo IndexedDB stores. This static product has no account,
  tenant, product backend, shared PostgreSQL, health endpoint, or server
  restart-persistence path to test.
- The external Sociobot license endpoint allowed 30 invalid verification
  requests. Request 31 returned 429 with `Retry-After: 3`.
- Chromium parsed the standalone manifest without errors. The 192 and 512 px
  icons returned 200, the 512 icon is maskable, and the service worker was
  active.
- A fresh live `/demo` reloaded offline with its heading, banner, and sample
  meal. The clean suite's controlled update test passed the waiting-worker
  notice, **Update now**, activation, and changed-asset reload.
- Mobile Lighthouse on `/demo`: Performance 100, Accessibility 100, Best
  Practices 100, SEO 100; FCP 902 ms, LCP 1,052 ms, TBT 55 ms, CLS 0.
- HSTS, `nosniff`, strict-origin referrer policy, and response-header
  `frame-ancestors 'self'` are live. Hashed JavaScript/CSS are immutable;
  the worker and manifest are not stale-cached.

Evidence: [live PWA](review-6-evidence/live-pwa.json),
[headers](review-6-evidence/live-headers.txt),
[Lighthouse](review-6-evidence/lighthouse-live.json),
[offline phone](review-6-evidence/live-offline-phone.png), and
[deployment hashes](review-6-evidence/deployment-hashes.txt).

## Earlier finding disposition

Every earlier review and verification report was read. The checks below were
repeated against current source and live output rather than accepted from a
closure note.

### Review findings

| Finding | Current disposition |
| --- | --- |
| F-1-1 | Closed: cold 404 has skip link, header/nav/main/footer, legal links, metadata, favicon, and product styling. |
| F-1-2 | Closed: static and SPA missing states say `Page not found` and explain recovery. |
| F-1-3 | Closed: h1 is the job statement `Plan meals for each person`. |
| F-1-4 | Closed: visible and accessible control name is `Manage people`. |
| F-1-5 | Closed: section heading is `Plan individual and shared meals`. |
| F-1-6 | Closed: the first-visit offline wording and live offline reload pass. |
| F-1-7 | Closed: the untested time-saving promise remains absent. |
| F-1-8 | Closed: README action copy remains split into short sentences. |
| F-1-9 | Closed: the long, jargon-heavy README test sentence remains absent. |
| F-1-10 | Closed: household-facing PWA and IndexedDB jargon remains absent. |
| F-1-11 | Closed: six-sample and free-transfer claims remain registered and pass. |
| F-2-1 | Closed: the README heading remains `Claims tested`. |
| F-3-1 | Closed: create/save/reload/edit is a registered passing claim. |
| F-3-2 | Closed: the subjective `clear` statement remains absent. |
| F-3-3 | Closed: recipe, grocery, nutrition, and allergen boundaries are tested. |
| F-3-4 | Closed: public illustration-provenance copy remains absent. |
| F-3-5 | Closed: deploy copy is plain; build and hosting claims pass. |
| F-3-6 | Closed: Sociobot and Dodo roles remain stated separately. |
| F-4-1 | Closed: every live route and 404 sends `frame-ancestors 'self'`. |
| F-4-2 | Closed: every route and 404 exposes the product `twitter:image`. |

### Independent verification findings

| Earlier issue | Current evidence |
| --- | --- |
| Dead checkout | Closed: live checkout returns 303 to Dodo. |
| Malformed import crash | Closed: incomplete input is rejected with the current plan unchanged and no page error. |
| Stale service-worker updates | Closed: versioned hashed assets and the controlled update regression pass. |
| Incomplete claim manifest and flaky offline claim | Closed: 20/20 literal commands pass; live offline reload passes. |
| Missing Undo, immutable assets, and HTTP 404 | Closed: Undo works, asset headers pass, and the cold 404 returns 404. |
| Named lanes did not save | Closed: named-lane and core create/edit claims pass through reload. |
| Dark contrast and focus-ring failures | Closed: light/dark route and dialog axe checks pass; focus ring is visible. |
| Small mobile controls | Closed at normal text size: all visible 390 px targets pass 44 × 44 px. F-6-1 is a separate enlarged-text reflow issue. |
| Paid/privacy claims were incomplete | Closed: free limit, valid/invalid license, cache, and request-privacy claims pass. |
| Export label mismatch and meal-slip label mismatch | Closed: explicit visible-label and populated-board axe regressions pass. |
| 404 inline style violated CSP | Closed: external 404 CSS renders without a CSP console error. |
| Route changes focused main, not h1 | Closed: route and Back navigation focus and announce the h1. |
| Free-limit feedback was hidden | Closed: the dialog stays open with visible explanatory text. |
| Dark dialog contrast, small sharing targets, and invalid-form Cancel/close | Closed: interactive light/dark axe, target, and pointer recovery tests pass; live Cancel recovery also passed. |
| Demo edits survived exit | Closed: demo edits are discarded and real data is unchanged. |
| Valid import was not tested | Closed: the tagged claim imports a complete plan before testing rejection; live valid import also passed. |
| Board link on legal routes and route canonicals | Closed: live Board navigation works and every route has its own canonical. |

No earlier finding is unfixed, partly fixed, or regressed. F-6-1 is new and is
not covered by the normal-text target and overflow checks.

## Missed leverage

No missing AI or sync feature is a finding. The supplied brief calls for a
local shared-device planner. Free JSON transfer and print cover the useful
adjacent jobs. Automatic sync would change the stated privacy boundary, and a
meal suggestion lacks the pantry or preference inputs needed to be useful.

## Required retest

Fix F-6-1, then repeat the 390 px 200% text check, all 20 claim commands, the
full suite, live route/axe audit, offline/update path, and deployment hash
comparison. Only a zero-finding rerun may be marked PASS.
