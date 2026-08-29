# Adversarial first-read review 3

**Verdict: FAIL.** No blocking failure was found, but six minor findings remain.
A PASS requires zero findings and no unlisted claim.

Reviewed on 2026-08-29 UTC against live
`https://family-meal-lanes.sociobot.in` and clean commit
`68f9c50a351e641420bb25f87cc8f7a77069a573`. Product code was not changed.
`.factory/brief.json` is absent, so scope and missed-leverage checks used the
README, design thesis, demo documentation, claims manifest, and live product.

## First read

Fresh Chromium contexts at 390 x 844 and 1440 x 900 gave a complete answer
before scrolling:

- **What it does:** a weekly board that assigns meals to each person and can
  show one shared meal in several lanes.
- **For whom:** households where people eat different and shared meals.
- **What to click first:** **Try it with sample data**. The adjacent text says,
  `See a filled week. Nothing is saved.`

The first-screen gate passes. The exact h1 is `Plan meals for each person`.
The audience sentence, primary action, action result, and three facts are in
the first mobile viewport. Normal cold loads produced no console or page
errors. The cut-paper planner, offset ink, meal slips, and kitchen still-life
are recognisably product-specific rather than a generic SaaS template.

Evidence:

- `.factory/review-3-evidence/first-read-mobile.png`
- `.factory/review-3-evidence/first-read-desktop.png`

## Findings

### F-3-1 — Minor — the core create-and-edit promise is absent from the claims manifest

**Location/quote:** landing h1, `Plan meals for each person`; README,
`Put meals in their lanes.`; live demo board, `Choose a meal slip to change
it.`

**Why this fails:** these are the product's central observable promises, but
`.factory/claims.json` has no create/edit claim. Several tests create meals as
setup for other claims, but no registered claim verifies the complete core
path: save a meal, reload it, edit its day or lane, and observe the changed
board. A verifier can run every declared claim while never treating the main
job as a promised result.

**Concrete fix:** add a `meal-create-edit` entry to `.factory/claims.json` and
one `@claim:meal-create-edit` test. From a fresh real plan, save `Bean chilli`
for Tuesday in a named lane, reload, edit it to Wednesday, and assert that the
old cell is empty and the new cell contains the meal. List the landing, demo
board, and README locations in `where`.

### F-3-2 — Minor — the landing page makes a subjective, untested clarity claim

**Location/quote:** landing privacy section, `It keeps a clear weekly view on
one device.`

**Why this fails:** `clear` is a marketing adjective with no observable
threshold, and no claims entry covers this sentence. It tells the visitor how
the interface should feel rather than what it does.

**Concrete fix:** rewrite it as `It shows one weekly meal board on this
device.` Cover the board result through the new core claim in F-3-1 and the
device boundary through `local-only`.

### F-3-3 — Minor — the negative scope promises are only partly registered

**Location/quote:** landing, `It does not store recipes, order groceries,
score nutrition, or send your plan anywhere.` README, `It is not a recipe
book, grocery service, nutrition tool, or allergen checker.`

**Why this fails:** `local-only` covers the data-transfer clause, but no claim
entry covers the recipe, grocery, nutrition, or allergen boundaries. These are
statements a household may rely on when deciding what the tool replaces.

**Concrete fix:** add a `scope-boundaries` claim and one test that checks the
real and demo interfaces expose only meal-board planning and no recipe,
ordering, nutrition scoring, or allergen-checking action. Alternatively,
remove the unregistered clauses and keep only the tested local-data statement.

### F-3-4 — Minor — the public footer makes an unlisted provenance claim

**Location/quote:** landing footer, `Original illustration generated for this
product.`

**Why this fails:** `original` and `generated for this product` are factual
provenance claims, but neither has a claims entry or a sandbox-verifiable
test. The sentence does not help a visitor use, price, or trust the meal
board; the useful provenance already belongs in `.factory/design.md`.

**Concrete fix:** remove this sentence from the public footer and retain the
asset prompt and generation record in `.factory/design.md`. If it remains
public, add an auditable provenance record and a matching claim test.

### F-3-5 — Minor — the README deploy copy uses jargon and makes undeclared build claims

**Location/quote:** README, `npm run build writes the static site to dist/,
with index.html at its root.`; `The factory deploys the built dist/ directory
as a static PWA.`; and `The checked-in staticwebapp.config.json supplies the
security headers, immutable hashed-asset caching, real route rewrites, and the
HTTP 404 response.`

**Why this fails:** `PWA`, `immutable hashed-asset caching`, and `route
rewrites` are unexplained jargon. Both sentences also state observable build
or hosting behavior without claims entries. A reader must decode internal
terms, while the claims manifest omits the stated deployment guarantees.

**Concrete fix:** use `Build the site with npm run build. Deploy dist/ as the
site root.` Then write `The hosting config adds security headers and direct
routes. It serves the 404 page and caches versioned assets.` Register the
observable build and config behavior as `build-output` and `hosting-config`
claims whose tests inspect `dist/`, parse the copied config, and request the
built routes and 404.

### F-3-6 — Minor — the payment sentence does not explain the providers' roles

**Location/quote:** landing and README, `Sociobot and Dodo handle the hosted
checkout.`

**Why this fails:** `hosted checkout` is payment-platform jargon, and joining
both provider names does not tell a buyer what opens or who processes the
payment. The link itself is correctly covered by `paid-unlock`; the wording is
the remaining problem.

**Concrete fix:** replace it with `Sociobot opens the payment page. Dodo
processes the payment.`

## Copy audit

Counts use visible words. Commands are not sentences. No sentence exceeds 22
words and no banned marketing word appears. Findings are marked in the Result
column; all other rows pass for length, terminology, heading clarity, and
result-naming actions.

### Landing page

| Words | Copy | Result |
| ---: | --- | --- |
| 4 | Skip to meal plan | pass |
| 3 | Family Meal Lanes | pass |
| 1 | Demo | pass — navigation link |
| 1 | Board | pass — navigation link |
| 1 | Privacy | pass — navigation link |
| 6 | A weekly board for one kitchen | pass |
| 5 | Plan meals for each person | F-3-1 |
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
| 10 | Add people, then put the first meal in a lane. | F-3-1 |
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
| 3 | Place the meal. | F-3-1 |
| 9 | Pick a day, a lane, and who shares it. | pass |
| 3 | Mark the prep. | pass |
| 7 | Leave a small prep task for later. | pass |
| 5 | What this does not do | pass |
| 14 | It does not store recipes, order groceries, score nutrition, or send your plan anywhere. | F-3-3 |
| 9 | It keeps a clear weekly view on one device. | F-3-2 |
| 4 | Read the privacy details | pass |
| 2 | One-time purchase | pass |
| 8 | Add as many lanes as your household needs | pass |
| 7 | Free plans include Shared plus three people. | pass |
| 9 | Pay $12 once for unlimited lanes on this device. | pass |
| 5 | Buy unlimited lanes for $12 | pass |
| 3 | Have a license? | pass |
| 2 | Restore license | pass |
| 7 | Sociobot and Dodo handle the hosted checkout. | F-3-6 |
| 11 | A restored license is checked with Sociobot when you are online. | pass |
| 9 | One weekly meal board for a shared kitchen device. | pass |
| 1 | Privacy | pass |
| 1 | Terms | pass |
| 4 | Built by Param Factory | pass |
| 3 | v1.0.0 | pass |
| 6 | Original illustration generated for this product. | F-3-4 |

### README

| Words | Sentence | Result |
| ---: | --- | --- |
| 5 | Plan meals for each person. | F-3-1 |
| 20 | It is for a household sharing one device where individual meals, shared dinners, and prep tasks need one weekly view. | pass |
| 9 | Family Meal Lanes works offline after your first visit. | pass |
| 6 | Name the people in your kitchen. | pass |
| 5 | Put meals in their lanes. | F-3-1 |
| 7 | Show shared meals in each relevant lane. | pass |
| 5 | Add a short prep label. | pass |
| 15 | Plans stay in your browser and can be printed or moved as a JSON file. | pass |
| 13 | It is not a recipe book, grocery service, nutrition tool, or allergen checker. | F-3-3 |
| 8 | The free plan includes Shared plus three people. | pass |
| 10 | A $12 one-time license adds unlimited lanes on that device. | pass |
| 6 | Export, import, and print remain free. | pass |
| 7 | Sociobot and Dodo handle the hosted checkout. | F-3-6 |
| 10 | Run the app and open http://localhost:5173/?demo=1. | pass |
| 9 | The deployed /?demo=1 URL opens the same sample. | pass |
| 9 | The demo has six meals for a small household. | pass |
| 6 | The demo uses separate browser storage. | pass |
| 15 | Starting for real discards that demo store and never copies the sample into your plan. | pass |
| 15 | npm run build writes the static site to dist/, with index.html at its root. | F-3-5 — undeclared build claim |
| 8 | Preview the production build with npm run preview. | pass |
| 11 | The factory deploys the built dist/ directory as a static PWA. | F-3-5 |
| 20 | The checked-in staticwebapp.config.json supplies the security headers, immutable hashed-asset caching, real route rewrites, and the HTTP 404 response. | F-3-5 |
| 10 | Your meal plan stays in this browser on this device. | pass |
| 8 | Use Export JSON to make a transfer copy. | pass |
| 6 | Use Import JSON on another device. | pass |
| 20 | If you restore a paid license, its token is checked with Sociobot; meal-plan data is never sent with that check. | pass |
| 12 | Read the in-app /privacy and /terms pages before relying on the board. | pass |
| 16 | The test suite checks the demo, exports, imports, shared meals, prep labels, printing, and offline reloads. | pass |
| 9 | It also checks the lane limit and license privacy. | pass |
| 8 | The exact checks are listed in .factory/claims.json. | pass |
| 1 | MIT. | pass |
| 2 | See LICENSE. | pass |

README headings checked: `Family Meal Lanes` (3), `Try it` (2), `Run and
test` (3), `Deploy` (1), `Privacy and transfer` (3), `Claims tested` (2), and
`License` (1). They name their sections. Terminology is otherwise consistent:
meal, lane, shared meal, prep label, demo, and license. Visible buttons and
actions use result-naming verbs.

## Demo and sandbox

- The landing action enters `/?demo=1` in one click. The first product screen
  already contains six distinct sample meals and the populated board; Lemon
  chicken tray bake is in the first mobile viewport.
- The persistent banner says `Demo — sample data, nothing is saved` and shows
  **Reset demo** and **Start for real**.
- A live `Review 3 reset probe` was removed by Reset. A separate `Review 3
  exit probe` did not appear in the real plan and did not return after
  reopening `/demo`. The real plan was empty in the fresh context.
- Live IndexedDB names were `family-meal-lanes:demo` and
  `family-meal-lanes:real`. The observed demo/reset/exit/offline flow requested
  only `https://family-meal-lanes.sociobot.in`; there was no analytics, font,
  Sociobot, Dodo, or other third-party request.
- After service-worker activation, an offline live reload retained the demo
  banner and sample meal.

Evidence: `.factory/review-3-evidence/demo-after-one-click-mobile.png`.

## Claims

Every literal command in `.factory/claims.json` ran independently from clean
clone `/tmp/family-meal-lanes-review-3-kCABb7` at commit `68f9c50`. All passed:

| Claim id | Result |
| --- | --- |
| `demo-sandbox` | pass |
| `sample-six-meals` | pass |
| `json-export` | pass |
| `json-import-safety` | pass |
| `offline-reload` | pass |
| `local-only` | pass |
| `shared-lanes` | pass |
| `prep-labels` | pass |
| `print-plan` | pass |
| `free-export-import-print` | pass |
| `named-lanes` | pass |
| `paid-unlock` | pass |
| `free-lane-limit` | pass |
| `paid-unlimited-lanes` | pass |
| `license-invalid-cache` | pass |
| `license-request-privacy` | pass |

No listed claim test failed. F-3-1, F-3-2, F-3-3, F-3-4, and F-3-5 identify
the unlisted claim-like copy; therefore the review still has untested claims
and cannot pass. The complete suite also passed 46/46 tests, and a final
`npm run build` produced `dist/` with 8.90 kB gzipped initial JavaScript.

## History recheck

I read `.factory/review-1.md`, `.factory/review-2.md`,
`.factory/polish-1.md`, `.factory/polish-2.md`, and the prior
`.factory/handoff.md`. Each earlier finding was checked against both live
output and current source rather than accepted from its closure note.

| Earlier finding | Live and code confirmation |
| --- | --- |
| F-1-1 | A cold unknown URL returns HTTP 404 with skip link, header/nav, main, footer, Privacy/Terms, metadata, favicon, and external CSP-clean styling. |
| F-1-2 | Static and in-app 404 states use `Page not found` and `This address does not have a meal board.` |
| F-1-3 | Live and `src/main.ts` use the job-first h1 `Plan meals for each person`. |
| F-1-4 | The visible and accessible toolbar label is `Manage people`. |
| F-1-5 | The section heading is `Plan individual and shared meals`. |
| F-1-6 | The fact says `Works offline after your first visit.`, and the clean claim test plus live offline reload passed. |
| F-1-7 | The untested time-saving promise remains removed; live copy says `Leave a small prep task for later.` |
| F-1-8 | The README action list remains split into four short sentences. |
| F-1-9 | The 37-word test description and internal `exit lifecycle` wording remain absent. |
| F-1-10 | The earlier household-facing `offline-first PWA` and `IndexedDB` sentences remain removed. F-3-5 is a new, narrower deploy-section jargon finding. |
| F-1-11 | `sample-six-meals` and `free-export-import-print` remain registered and both clean claim commands passed. |
| F-2-1 | The README heading is `Claims tested`, not `Claims checked in the demo`. |

No earlier finding is unfixed, half-fixed, or regressed. The new findings do
not reuse an earlier id because they concern claim coverage and copy that the
earlier reports did not flag.

## Structure, routes, accessibility, and links

- `/`, `/demo`, `/privacy`, and `/terms` return 200. Each has the required
  route title, one h1, description, canonical URL, OG/Twitter metadata,
  favicon, `lang=en`, main, header, footer, and legal links.
- A direct unknown URL returns a designed HTTP 404 with `Page not found`, the
  shared skeleton, metadata, and a working board link. Evidence:
  `.factory/review-3-evidence/live-404-mobile.png`.
- SPA navigation focuses and announces the destination h1. Browser Back
  restores `/`, focuses `Plan meals for each person`, and updates the polite
  announcement.
- All product navigation destinations returned 200. The checkout endpoint
  returned its declared 303 redirect to `checkout.dodopayments.com`.
  `robots.txt`, `sitemap.xml`, the manifest, social card, icons, service
  worker, and security headers are live.
- Fresh live axe scans on `/`, `/demo`, `/privacy`, and `/terms` in light and
  dark schemes found zero serious or critical WCAG 2A/2AA violations. The
  full suite also passed keyboard dialog, touch-target, route-focus, reduced
  motion, and mobile-width regressions.

No routing, generic-template, or blocking structure failure was found.

## Missed leverage

No additional AI feature is justified. Meal suggestions would need household
preferences, pantry data, or another planning input that the available scope
does not define. The useful adjacent capabilities a normal visitor would
expect—JSON import/export, print, shared lanes, offline use, and license
restore—already exist. Sync would contradict the explicit one-device,
local-first boundary unless the product scope changed.

## What would make this perfect

Resolve F-3-1 through F-3-6: register and test the core meal workflow and
scope boundaries, replace the subjective sentence, remove or prove the public
art-provenance claim, rewrite and register the deploy guarantees, and explain
the two payment providers in plain words. Then rerun every claim command from
a clean clone, the full copy audit, the mobile demo isolation flow, and the
live route/accessibility crawl. Only a zero-finding rerun should be marked
PASS.
