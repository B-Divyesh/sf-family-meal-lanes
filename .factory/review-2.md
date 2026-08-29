# Adversarial first-read review 2

**Verdict: FAIL.** One minor copy finding remains. A PASS requires no findings.

Reviewed on 2026-08-29 UTC against live `https://family-meal-lanes.sociobot.in`
and clean checkout `893f5b1c898a4821a3de151fe78bc4e0528daf5f`. Product code was not
changed.

## First read

Fresh Chromium contexts at 390 x 844 and 1440 x 900 gave the same answer before
scrolling:

- **What it does:** a weekly meal board that puts meals in each person's lane
  and repeats a shared meal across selected lanes.
- **For whom:** “For households with different meals, so everyone can see what
  is theirs and what they share.”
- **What to click first:** **Try it with sample data**. The adjacent result is
  “See a filled week. Nothing is saved.”

The first-screen clarity gate passes. The h1 is “Plan meals for each person”,
the action is visible at both sizes, and the cut-paper meal-board art is
product-specific rather than a generic SaaS layout. There were no load console
or page errors. The normal request log contained only the product origin.

## Findings

### F-2-1 — Minor — README heading says every listed check is in the demo

**Location/quote:** README heading: `Claims checked in the demo`.

**Why this is inaccurate:** The section itself says it checks “the lane limit
and license privacy.” Those assertions run against a fresh real plan, not the
demo: the demo intentionally hides the paid section. “In the demo” therefore
does not name the actual scope of the section and gives a reader an incorrect
test boundary.

**Concrete fix:** Rename the heading to `Claims tested`. Keep the two following
sentences; they already say what is covered.

## Copy audit

Word counts include visible labels and headings on the landing page. Commands
are not sentences. No landing copy is over 22 words, uses a banned marketing
adjective, uses inconsistent product terms, or has a non-result-naming button.
The README heading issue is F-2-1; otherwise its sentences are at or below the
22-word cap and have no copy finding.

### Landing page

| Words | Copy | Result |
| ---: | --- | --- |
| 4 | Skip to meal plan | pass |
| 3 | Family Meal Lanes | pass |
| 1 | Demo | pass |
| 1 | Board | pass |
| 1 | Privacy | pass |
| 6 | A weekly board for one kitchen | pass |
| 5 | Plan meals for each person | pass |
| 16 | For households with different meals, so everyone can see what is theirs and what they share. | pass |
| 5 | Try it with sample data | pass |
| 4 | See a filled week. | pass |
| 3 | Nothing is saved. | pass |
| 6 | Works offline after your first visit. | pass |
| 7 | Meal plan saved only on this device | pass |
| 4 | Export a JSON copy | pass |
| 8 | Plan one meal in more than one lane. | pass |
| 2 | This week | pass |
| 3 | Who eats what | pass |
| 10 | Add people, then put the first meal in a lane. | pass |
| 3 | Add a meal | pass |
| 2 | Manage people | pass |
| 1 | Print | pass |
| 2 | Export JSON | pass |
| 2 | Import JSON | pass |
| 1 | Lane | pass |
| 3 | How it works | pass |
| 5 | Plan individual and shared meals | pass |
| 3 | Name each lane. | pass |
| 7 | Add each person and one shared lane. | pass |
| 3 | Place the meal. | pass |
| 9 | Pick a day, a lane, and who shares it. | pass |
| 3 | Mark the prep. | pass |
| 7 | Leave a small prep task for later. | pass |
| 5 | What this does not do | pass |
| 14 | It does not store recipes, order groceries, score nutrition, or send your plan anywhere. | pass |
| 9 | It keeps a clear weekly view on one device. | pass |
| 4 | Read the privacy details | pass |
| 2 | One-time purchase | pass |
| 8 | Add as many lanes as your household needs | pass |
| 7 | Free plans include Shared plus three people. | pass |
| 9 | Pay $12 once for unlimited lanes on this device. | pass |
| 5 | Buy unlimited lanes for $12 | pass |
| 3 | Have a license? | pass |
| 2 | Restore license | pass |
| 7 | Sociobot and Dodo handle the hosted checkout. | pass |
| 11 | A restored license is checked with Sociobot when you are online. | pass |
| 9 | One weekly meal board for a shared kitchen device. | pass |
| 1 | Privacy | pass |
| 1 | Terms | pass |
| 4 | Built by Param Factory | pass |
| 3 | v1.0.0 | pass |
| 6 | Original illustration generated for this product. | pass |

### README

| Words | Sentence | Result |
| ---: | --- | --- |
| 5 | Plan meals for each person. | pass |
| 20 | It is for a household sharing one device where individual meals, shared dinners, and prep tasks need one weekly view. | pass |
| 9 | Family Meal Lanes works offline after your first visit. | pass |
| 6 | Name the people in your kitchen. | pass |
| 5 | Put meals in their lanes. | pass |
| 7 | Show shared meals in each relevant lane. | pass |
| 5 | Add a short prep label. | pass |
| 15 | Plans stay in your browser and can be printed or moved as a JSON file. | pass |
| 13 | It is not a recipe book, grocery service, nutrition tool, or allergen checker. | pass |
| 8 | The free plan includes Shared plus three people. | pass |
| 10 | A $12 one-time license adds unlimited lanes on that device. | pass |
| 6 | Export, import, and print remain free. | pass |
| 7 | Sociobot and Dodo handle the hosted checkout. | pass |
| 10 | Run the app and open http://localhost:5173/?demo=1. | pass |
| 9 | The deployed /?demo=1 URL opens the same sample. | pass |
| 9 | The demo has six meals for a small household. | pass |
| 6 | The demo uses separate browser storage. | pass |
| 15 | Starting for real discards that demo store and never copies the sample into your plan. | pass |
| 15 | npm run build writes the static site to dist/, with index.html at its root. | pass |
| 8 | Preview the production build with npm run preview. | pass |
| 11 | The factory deploys the built dist/ directory as a static PWA. | pass — developer deployment context |
| 20 | The checked-in staticwebapp.config.json supplies the security headers, immutable hashed-asset caching, real route rewrites, and the HTTP 404 response. | pass — developer deployment context |
| 10 | Your meal plan stays in this browser on this device. | pass |
| 8 | Use Export JSON to make a transfer copy. | pass |
| 6 | Use Import JSON on another device. | pass |
| 20 | If you restore a paid license, its token is checked with Sociobot; meal-plan data is never sent with that check. | pass |
| 12 | Read the in-app /privacy and /terms pages before relying on the board. | pass |
| 16 | The test suite checks the demo, exports, imports, shared meals, prep labels, printing, and offline reloads. | pass |
| 9 | It also checks the lane limit and license privacy. | pass |
| 8 | The exact checks are listed in .factory/claims.json. | pass |

README headings checked: `Family Meal Lanes`, `Try it`, `Run and test`,
`Deploy`, `Privacy and transfer`, `Claims checked in the demo` (F-2-1), and
`License`. Terminology is consistent: meal, lane, shared meal, prep label,
demo, and license.

## Demo, sandbox, and claims

- The landing action reaches `/?demo=1` in one click. Its first rendered
  product screen is a populated board: six source meals produce 15 visible
  slips across Shared, Mara, Jon, and Kids.
- The persistent banner is exactly `Demo — sample data, nothing is saved` and
  has **Reset demo** and **Start for real**. A manually added demo meal did not
  enter the real plan and did not return after leaving demo and reopening
  `/demo`. Reset restored the shipped sample. The observed stores were
  `family-meal-lanes:demo` and `family-meal-lanes:real`.
- The complete demo flow made same-origin requests only. No demo request went
  to Sociobot, Dodo, a font host, or an analytics endpoint. The live offline
  behavior, local storage namespaces, and `sw.js` implementation match the
  documented local-first design.
- Every one of the 16 literal commands in `.factory/claims.json` passed
  individually after `npm ci` in `/tmp/family-meal-lanes-review-2-clean`:
  `demo-sandbox`, `sample-six-meals`, `json-export`, `json-import-safety`,
  `offline-reload`, `local-only`, `shared-lanes`, `prep-labels`, `print-plan`,
  `free-export-import-print`, `named-lanes`, `paid-unlock`,
  `free-lane-limit`, `paid-unlimited-lanes`, `license-invalid-cache`, and
  `license-request-privacy`.
- The complete local suite passed: 45 tests, confirmed by
  `test-results/.last-run.json` with `status: "passed"`. `npm run build` also
  passed and produced `dist/`. The built initial JavaScript is 8.90 kB gzip.
- Every visitor-facing product claim on the landing page and README maps to a
  declared claim. No unlisted product claim was found. The README section
  heading defect is copy scope, not an untested behavior claim.

## History recheck

I read `.factory/review-1.md`, `.factory/polish-1.md`, all seven numbered
verification reports, the original `verification.md`, and the earlier handoff.
The table records live and code confirmation rather than relying on their
“fixed” labels.

| Earlier finding(s) | Confirmation in this review |
| --- | --- |
| F-1-1, F-1-2; HTTP 404/CSP defects | A cold `curl` to an unknown URL returns HTTP 404. `public/404.html` has skip link, header, footer, Privacy/Terms, metadata, `Page not found`, and external `404.css`; a fresh load had no console error. |
| F-1-3 through F-1-7 | Live text is `Plan meals for each person`, `Manage people`, `Plan individual and shared meals`, `Works offline after your first visit.`, and `Leave a small prep task for later.` |
| F-1-8 through F-1-11 | The README sentences are split/plain; household-facing PWA/IndexedDB wording is absent; `sample-six-meals` and `free-export-import-print` are registered and passed. |
| Earlier lane-save, malformed-import, Undo, lane-limit, and demo-exit defects | The applicable named-lanes, import-safety, free-lane-limit, demo-sandbox, and regression tests passed. The manual demo exit check also showed no sample or demo probe in the real plan. |
| Earlier paid, license-cache, and license-privacy claim gaps | The five paid/license claims are now explicit and passed separately, including mocked valid/invalid paths and token-only request assertions. The live checkout link returned HTTP 303 to the Dodo hosted checkout. |
| Earlier dark-dialog contrast, dialog-cancel, touch-target, and label-in-name defects | A fresh live axe scan at 390 px in light and dark schemes with the meal dialog open reported zero WCAG 2A/2AA/2.1A serious or critical violations and zero `label-content-name-mismatch` nodes. |
| Earlier Board-link, canonical, route-focus, SW update, offline, immutable-cache, and 404 defects | `/`, `/demo`, `/privacy`, and `/terms` have distinct titles, descriptions, and canonicals. Privacy then browser Back focused each destination h1. The internal-link crawl returned 200 for app links; checkout returned 303. Live hashed JS is immutable and `sw.js` is no-cache. The full suite contains and passed the controlled worker-update and offline regressions. |

No prior finding is unfixed, half-fixed, or regressed.

## Structure, accessibility, and routes

- Each normal route has the required title pattern, one h1, a main landmark,
  route description and canonical, OG/Twitter metadata, favicon, header,
  footer, skip link, and Privacy/Terms links. `robots.txt`, `sitemap.xml`,
  manifest, social card, and security headers are present.
- Direct unknown-route HTTP behavior is 404. The in-app not-found screen is
  designed and has a route back. Browser navigation and Back moved focus to
  the destination h1 and announced the route. The full link crawl found no
  dead internal link; the sole external checkout had its expected 303.
- Live light/dark axe checks in the populated, open-dialog state found no
  serious or critical violation. The page had no 390px page-width overflow,
  no observed console error, and respected reduced motion in the checked suite.

## Missed leverage

`.factory/brief.json` is absent, so there is no brief-supported additional
capability to require. Based on the available product scope, import/export,
printing, shared lanes, an offline demo, and optional license transfer cover
the obvious value. An AI meal suggestion would be decorative without a stated
planning input or a brief need; no AI feature is required.

## What would make this perfect

Apply F-2-1 by changing the inaccurate README heading to `Claims tested`, then
repeat the README copy audit. With that single wording correction and the
already-passing functional evidence, this review can be PASS.
