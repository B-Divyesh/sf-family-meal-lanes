# Plan meals for each person — verification 8

**Verdict: PASS.** There are zero findings of every severity and zero untested
public claims.

- Implementation reviewed: `b433b99a5989eb607e5339e4e818e466474847ca`
- Documentation reviewed: `f84b8223f045d2d0f447198e41afc864423a166e`
- Live URL: https://family-meal-lanes.sociobot.in
- Verified: 2026-09-06 UTC

The documentation commit changes only `.factory/handoff.md` after the
implementation commit. A clean build of the documentation commit matches the
live release files byte for byte.

## Job, audience, and first action

Before scrolling in fresh 390 × 844 and 1440 × 900 browsers:

- **Job:** plan individual and shared meals for each person on one weekly board.
- **Audience:** households sharing one device where people eat different and
  shared meals.
- **First action:** **Try it with sample data**. The adjacent text says,
  `See a filled week. Nothing is saved.`

The job, audience, action, result, and three facts fit in both first viewports.
The page has one h1: `Plan meals for each person`. Evidence:
[phone](verification-8-evidence/first-read-phone.png) and
[desktop](verification-8-evidence/first-read-desktop.png).

## Findings

No critical, high, medium, low, or minor finding remains. Untested claim count:
**0**.

The intentional missing-page request returned HTTP 404 with a complete,
designed recovery page. That expected status is not a defect. Evidence:
[404 phone](verification-8-evidence/404-phone.png).

## Demo and meal planning

The first action opened `/?demo=1` in one click. The resulting screen was
already populated with six source meals across Shared, Mara, Jon, and Kids.
Lemon chicken appeared in all four selected lanes and showed its prep label.
The persistent banner read `Demo — sample data, nothing is saved` and kept
**Reset demo** and **Start for real** available. Evidence:
[demo phone](verification-8-evidence/demo-phone.png).

A fresh browser stored `Real plan sentinel` in the real plan before entering
the demo. Reset removed a demo-only probe and restored exactly six sample meal
IDs. Starting for real removed another demo-only probe while preserving the
real sentinel. Reopening the demo showed only the shipped sample. This proves
the sample path does not change real-plan data.

Independent live exercise also passed:

- named lanes saved and survived reload;
- Shared plus three people showed the visible free-limit recovery message;
- a blank meal stayed in the dialog, focused Meal name, and Cancel recovered;
- an 80-character name, 60-character prep label, 240-character note, Sunday,
  and sharing across Ari and Bee saved and survived reload;
- JSON export contained the complete boundary meal;
- a complete JSON import replaced the current plan;
- an incomplete import kept the current plan and showed the recovery message;
- Delete exposed a working **Undo** action;
- reduced motion shortened transitions to `0.00001s`;
- normal use produced no console or page error.

The complete live audit passed 33/33 checks. Evidence:
[audit JSON](verification-8-evidence/live-audit.json) and
[desktop populated flow](verification-8-evidence/normal-flow-desktop.png).

## Declared claims and clean checkout

A fresh remote clone at documentation SHA `f84b822` completed `npm ci` with
zero reported vulnerabilities. Every literal command in
`.factory/claims.json` then ran separately. All 20 passed:

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

The landing page, demo, legal pages, README, demo documentation, and claims
manifest were cross-checked. Every public promise has a matching behavioral
claim or is a direct instruction. There are no missing or partly tested
claims. Summary: [claims TSV](verification-8-evidence/claims-summary.tsv).

The same clean checkout passed `npm test` with 52/52 tests. A final
`npm run build` produced `dist/index.html`:

- JavaScript: 26.02 kB raw / 8.89 kB gzip.
- CSS: 13.95 kB raw / 3.91 kB gzip.
- Hero image: 72,588 bytes.

## Accessibility, phone layout, and routes

The required URL verifier passed the live root with HTTPS 200, a title,
`lang="en"`, one h1, a main landmark, complete image alternatives, labeled
buttons, and no console errors. Evidence:
[verify JSON](verification-8-evidence/verify-url/verify.json).

Fresh Playwright axe scans covered `/`, `/demo`, `/privacy`, `/terms`, and the
HTTP 404 in light and dark schemes. Open meal dialogs were scanned in both
schemes. The populated board was also checked with
`label-content-name-mismatch` enabled. Fourteen scans found zero violations.

All visible interactive targets on the five phone routes measured at least
44 × 44 CSS pixels. Keyboard checks passed the visible skip link, Enter on a
meal slip, initial dialog focus, Escape and focus return, SPA route focus and
announcement, and Back focus. The page respects reduced motion.

At 390 px with root text set to 200%, the viewport, body, and document were
all exactly 390 px wide. The purchase link, license field, and restore button
each remained inside x=16 through x=374, accepted focus, and completed a
mocked license restore. Evidence:
[200% text phone](verification-8-evidence/text-200-phone.png).

Each route has one h1, the shared header/navigation/main/footer skeleton, its
own title, description, canonical URL, and product social image. All 12
discovered internal URLs returned 200. The checkout returned 303 to a Dodo
hosted session.

## Privacy, offline use, security, and performance

Normal demo and real-plan flows made requests only to the product origin.
There are no third-party fonts, scripts, analytics, or trackers. The separate
license claim passed a token-only, bodyless Sociobot request check and proved
that meal text is absent. Privacy and terms pages are live.

A fresh `/demo` context activated the service worker, then reloaded offline
with the sample banner and Lemon chicken still visible. The clean suite also
passed its controlled waiting-worker, **Update now**, activation, and changed
asset test. The manifest has standalone display, a versioned start URL, live
192 and 512 icons, and a maskable 512 icon. Evidence:
[offline phone](verification-8-evidence/offline-phone.png).

Live responses provide HSTS, `nosniff`, strict-origin referrer policy, and a
response CSP with `frame-ancestors 'self'`. Hashed JavaScript and CSS use a
one-year immutable cache. The worker and manifest use `no-cache`. Evidence:
[headers](verification-8-evidence/live-headers.txt).

Fresh mobile Lighthouse on `/demo` scored Performance 100, Accessibility 100,
Best Practices 100, and SEO 100. FCP was 0.80 s, LCP 1.05 s, TBT 45 ms, and
CLS 0. Evidence:
[Lighthouse JSON](verification-8-evidence/lighthouse-live.json).

The product is a static local-first PWA. It has no product backend, tenant,
health endpoint, server-side database, or restart-persistence path. Backend
tenant, health, restart, and 429 checks therefore do not apply. The visible
billing checkout redirect was tested live; no credential was used.

## Live release identity

The clean candidate and live site have matching SHA-256 values for
`index.html`, hashed JavaScript, hashed CSS, `sw.js`, the manifest, hero image,
static 404, and 404 stylesheet. The live runtime is the implementation
candidate, not a later report-only build. Exact values are in the
[audit JSON](verification-8-evidence/live-audit.json).

## Earlier finding disposition

Every earlier review and independent verification report was read. The checks
below were repeated against current source and live output.

### Review findings

| Finding | Fresh disposition |
| --- | --- |
| F-1-1 | Closed. The HTTP 404 has the shared skeleton, legal links, metadata, favicon, and product styling. |
| F-1-2 | Closed. Both missing states say `Page not found` and explain recovery. |
| F-1-3 | Closed. The h1 is the job statement `Plan meals for each person`. |
| F-1-4 | Closed. The visible and accessible control name is `Manage people`. |
| F-1-5 | Closed. The section says `Plan individual and shared meals`. |
| F-1-6 | Closed. The copy says first visit and the fresh offline reload passed. |
| F-1-7 | Closed. The untested time-saving promise remains absent. |
| F-1-8 | Closed. README actions remain split into short sentences. |
| F-1-9 | Closed. The long internal test sentence remains absent. |
| F-1-10 | Closed. Household copy does not use PWA or IndexedDB jargon. |
| F-1-11 | Closed. Six-sample and free-transfer claims are registered and passed. |
| F-2-1 | Closed. The README heading remains `Claims tested`. |
| F-3-1 | Closed. Create, reload, and edit is a registered passing claim. |
| F-3-2 | Closed. The subjective clarity claim remains absent. |
| F-3-3 | Closed. Recipe, grocery, nutrition, and allergen boundaries are tested. |
| F-3-4 | Closed. Public illustration-provenance copy remains absent. |
| F-3-5 | Closed. Deploy copy is plain; build and hosting claims passed. |
| F-3-6 | Closed. Sociobot and Dodo roles are stated separately; checkout redirected. |
| F-4-1 | Closed. Every response sends `frame-ancestors 'self'`. |
| F-4-2 | Closed. Every route and 404 exposes the product `twitter:image`. |
| F-6-1 | Closed. The 390 px page remains 390 px at 200% text; paid controls fit and work. |

Reviews 5 and 7 reported no findings. Review 6's sole finding is F-6-1 above.

### Independent verification findings

| Earlier issue | Fresh disposition |
| --- | --- |
| Dead checkout | Closed. The live endpoint returned 303 to Dodo. |
| Malformed import crash | Closed. Incomplete input kept the plan and showed recovery with no page error. |
| Stale service-worker updates | Closed. Versioned assets and the controlled update test passed. |
| Incomplete claims and flaky offline claim | Closed. All 20 commands and the fresh live offline reload passed. |
| Missing Undo | Closed. Delete showed Undo and restored the meal. |
| Non-immutable assets | Closed. Hashed assets send one-year immutable caching. |
| Unknown paths returned 200 | Closed. The designed missing route returned HTTP 404. |
| Named lanes did not save | Closed. Ari, Bee, and Cam saved and survived reload. |
| Dark contrast and focus failures | Closed. Light/dark pages and dialogs passed axe; focus remained visible. |
| Small phone controls | Closed. Every visible phone target passed 44 × 44 pixels. |
| Paid and privacy promises were incomplete | Closed. All four license/free-limit claims passed. |
| Export label mismatch | Closed. The full suite passed the exact visible-name check. |
| 404 inline style violated CSP | Closed. External 404 CSS rendered with no CSP or console error. |
| Route changes focused main instead of h1 | Closed. Navigation and Back focused and announced each h1. |
| Free-limit feedback was hidden | Closed. The dialog stayed open with visible recovery text. |
| Dark dialog contrast | Closed. Both open-dialog axe scans were clean. |
| Cancel and close failed after invalid save | Closed. The live pointer recovery and clean regressions passed. |
| Sharing targets were too small | Closed. Open-dialog target checks passed. |
| Demo edits survived exit | Closed. Exit discarded demo edits and preserved the real sentinel. |
| Complete import was untested | Closed. The tagged claim and fresh live round trip both imported a complete plan. |
| Board links on legal routes were dead | Closed. The crawl and clean navigation regression passed. |
| Route canonicals were wrong | Closed. Each live route has its own canonical URL. |
| Populated meal slips failed label in name | Closed. Both explicit populated-board scans had zero violations. |

No earlier finding is partly fixed, regressed, or deferred.

## Scope check

No AI or automatic sync feature is missing from the brief's job. The planner
already provides the useful adjacent transfer paths through JSON and print.
Cloud sync would change the stated local-only privacy boundary, and meal
suggestions lack the pantry or preference input needed to be useful.
