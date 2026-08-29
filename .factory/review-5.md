# Adversarial first-read review 5

**Verdict: PASS.** No blocking or minor finding remains, and no public claim is
untested.

Reviewed on 2026-08-29 UTC against live
`https://family-meal-lanes.sociobot.in`, in fresh Chromium contexts at
390 × 844 and 1440 × 900, and against clean clone
`39a93257b0d7dabfa6154df2073e47e79a1b853f`. Product code was not changed.
`.factory/brief.json` is absent, so the scope and missed-leverage checks used
the design thesis, README, demo contract, claims manifest, and live product.

## First read

Before scrolling, both viewports gave the same complete answer:

- **What it does:** a weekly meal board that assigns individual and shared
  meals to each person.
- **For whom:** households sharing one device where people eat different and
  shared meals.
- **What to click first:** **Try it with sample data**. The adjacent result is
  `See a filled week. Nothing is saved.`

The exact h1 is `Plan meals for each person`. The audience sentence, primary
action, stated result, and all three facts are inside the first 390 × 844
viewport. The first screen has one h1, no horizontal overflow, and no console
or page error. The cut-paper planner, risograph texture, offset shadows, and
meal-slip board are recognisably specific to this product rather than a generic
SaaS template.

## Findings

None.

## Copy audit

Counts treat contractions and hyphenated terms as one word. URL components are
counted as words. The audit includes all visible landing headings, labels,
actions, and sentences, plus the meaningful hero alt text. Generated day/date
values are data rather than sentences. README shell commands are code, not
sentences. Every row passes the 22-word cap, plain-language, terminology,
heading, and result-naming-action checks.

### Landing page

| Words | Copy | Result |
| ---: | --- | --- |
| 4 | Skip to meal plan | pass |
| 3 | Family Meal Lanes | pass |
| 1 | Demo | pass — navigation link |
| 1 | Board | pass — navigation link |
| 1 | Privacy | pass — navigation link |
| 6 | A weekly board for one kitchen | pass |
| 5 | Plan meals for each person | pass |
| 16 | For households with different meals, so everyone can see what is theirs and what they share. | pass |
| 5 | Try it with sample data | pass |
| 4 | See a filled week. | pass |
| 3 | Nothing is saved. | pass |
| 6 | Works offline after your first visit. | pass — `offline-reload` |
| 7 | Meal plan saved only on this device | pass — `local-only` |
| 4 | Export a JSON copy | pass — `json-export` |
| 12 | A cut-paper weekly meal planner with colored meal slips and kitchen ingredients. | pass — image alt text |
| 8 | Plan one meal in more than one lane. | pass — `shared-lanes` |
| 2 | This week | pass |
| 3 | Who eats what | pass |
| 10 | Add people, then put the first meal in a lane. | pass — `meal-create-edit` |
| 3 | Add a meal | pass |
| 2 | Manage people | pass |
| 1 | Print | pass — `print-plan` |
| 2 | Export JSON | pass — `json-export` |
| 2 | Import JSON | pass — `json-import-safety` |
| 1 | Lane | pass |
| 3 | How it works | pass |
| 5 | Plan individual and shared meals | pass |
| 3 | Name each lane. | pass — `named-lanes` |
| 7 | Add each person and one shared lane. | pass — `named-lanes` |
| 3 | Place the meal. | pass — `meal-create-edit` |
| 9 | Pick a day, a lane, and who shares it. | pass — `shared-lanes` |
| 3 | Mark the prep. | pass — `prep-labels` |
| 7 | Leave a small prep task for later. | pass |
| 5 | What this does not do | pass |
| 12 | It does not store recipes, order groceries, score nutrition, or check allergens. | pass — `scope-boundaries` |
| 9 | It shows one weekly meal board on this device. | pass — `meal-create-edit`, `local-only` |
| 4 | Read the privacy details | pass — navigation action |
| 2 | One-time purchase | pass |
| 8 | Add as many lanes as your household needs | pass — `paid-unlimited-lanes` |
| 7 | Free plans include Shared plus three people. | pass — `free-lane-limit` |
| 9 | Pay $12 once for unlimited lanes on this device. | pass — `paid-unlimited-lanes` |
| 5 | Buy unlimited lanes for $12 | pass — `paid-unlock` |
| 3 | Have a license? | pass |
| 2 | Restore license | pass — `paid-unlimited-lanes` |
| 5 | Sociobot opens the payment page. | pass — `paid-unlock` |
| 4 | Dodo processes the payment. | pass — `paid-unlock` |
| 11 | A restored license is checked with Sociobot when you are online. | pass — `license-invalid-cache` |
| 9 | One weekly meal board for a shared kitchen device. | pass |
| 1 | Privacy | pass — footer link |
| 1 | Terms | pass — footer link |
| 4 | Built by Param Factory | pass |
| 3 | v1.0.0 | pass |

The demo first screen also passes: `Try a filled meal week` names the state.
`Use the sample below.` has four words. `Choose Reset demo to reload it, or
start a separate plan for your household.` has 14 words. The banner and its
actions are direct: `Demo — sample data, nothing is saved`, `Reset demo`, and
`Start for real`.

### README

| Words | Copy | Result |
| ---: | --- | --- |
| 3 | Family Meal Lanes | pass — document heading |
| 5 | Plan meals for each person. | pass |
| 20 | It is for a household sharing one device where individual meals, shared dinners, and prep tasks need one weekly view. | pass |
| 9 | Family Meal Lanes works offline after your first visit. | pass — `offline-reload` |
| 6 | Name the people in your kitchen. | pass |
| 5 | Put meals in their lanes. | pass — `meal-create-edit` |
| 7 | Show shared meals in each relevant lane. | pass — `shared-lanes` |
| 5 | Add a short prep label. | pass — `prep-labels` |
| 15 | Plans stay in your browser and can be printed or moved as a JSON file. | pass — `local-only`, `print-plan`, `json-export` |
| 13 | It is not a recipe book, grocery service, nutrition tool, or allergen checker. | pass — `scope-boundaries` |
| 8 | The free plan includes Shared plus three people. | pass — `free-lane-limit` |
| 10 | A $12 one-time license adds unlimited lanes on that device. | pass — `paid-unlimited-lanes` |
| 6 | Export, import, and print remain free. | pass — `free-export-import-print` |
| 5 | Sociobot opens the payment page. | pass — `paid-unlock` |
| 4 | Dodo processes the payment. | pass — `paid-unlock` |
| 2 | Try it | pass — section heading |
| 10 | Run the app and open http://localhost:5173/?demo=1. | pass — instruction |
| 9 | The deployed /?demo=1 URL opens the same sample. | pass — `demo-sandbox` |
| 9 | The demo has six meals for a small household. | pass — `sample-six-meals` |
| 6 | The demo uses separate browser storage. | pass — `demo-sandbox` |
| 15 | Starting for real discards that demo store and never copies the sample into your plan. | pass — `demo-sandbox` |
| 3 | Run and test | pass — section heading |
| 7 | Build the site with npm run build. | pass — `build-output` |
| 6 | Deploy dist/ as the site root. | pass — instruction |
| 8 | Preview the production build with npm run preview. | pass — instruction |
| 1 | Deploy | pass — section heading |
| 9 | The hosting config adds security headers and direct routes. | pass — `hosting-config` |
| 9 | It serves the 404 page and caches versioned assets. | pass — `hosting-config` |
| 3 | Privacy and transfer | pass — section heading |
| 10 | Your meal plan stays in this browser on this device. | pass — `local-only` |
| 8 | Use Export JSON to make a transfer copy. | pass — `json-export` |
| 6 | Use Import JSON on another device. | pass — `json-import-safety` |
| 20 | If you restore a paid license, its token is checked with Sociobot; meal-plan data is never sent with that check. | pass — `license-request-privacy` |
| 12 | Read the in-app /privacy and /terms pages before relying on the board. | pass — instruction |
| 2 | Claims tested | pass — section heading |
| 16 | The test suite checks the demo, exports, imports, shared meals, prep labels, printing, and offline reloads. | pass |
| 9 | It also checks the lane limit and license privacy. | pass |
| 8 | The exact checks are listed in .factory/claims.json. | pass — instruction |
| 1 | License | pass — section heading |
| 1 | MIT. | pass |
| 2 | See LICENSE. | pass — link instruction |

Terminology is consistent: **meal**, **lane**, **shared meal**, **prep label**,
**demo**, and **license** each keep one meaning. No banned marketing adjective,
mood heading, metaphor, empty slogan, or non-result-naming product action was
found.

## Demo, sandbox, offline, and privacy

- The landing action enters `/?demo=1` in one click. Its first product screen
  already shows six realistic source meals across Shared, Mara, Jon, and Kids;
  `Lemon chicken tray bake` is visible in the first mobile viewport.
- The persistent banner reads `Demo — sample data, nothing is saved` and shows
  **Reset demo** and **Start for real**. Reset removed a demo probe and restored
  the six shipped meals.
- A real-plan sentinel saved before entering the demo remained in
  `family-meal-lanes:real`. Demo probes never appeared there. Starting for real
  cleared the demo store; reopening `/demo` reseeded only the six sample meals.
- The complete live landing, demo edit, reset, exit, and offline flow requested
  only `https://family-meal-lanes.sociobot.in`. It made no analytics, font,
  payment, AI, or other third-party request.
- After service-worker activation, a live `/demo` reload while offline retained
  the demo heading, banner, and sample meal.

## Claims

Every literal command in `.factory/claims.json` ran separately after `npm ci`
in clean clone `/tmp/family-meal-lanes-review-5-clean`. Each command built the
site and ran its one tagged behavioral test.

| Claim id | Result |
| --- | --- |
| `demo-sandbox` | pass |
| `sample-six-meals` | pass |
| `meal-create-edit` | pass |
| `json-export` | pass |
| `json-import-safety` | pass |
| `offline-reload` | pass |
| `local-only` | pass |
| `scope-boundaries` | pass |
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
| `build-output` | pass |
| `hosting-config` | pass |

The aggregate `npm test` passed 51/51 tests. A final `npm run build` passed and
produced `dist/`; the initial JavaScript is 26.02 kB raw and 8.89 kB gzip.
Every claim-like landing and README sentence maps to the manifest or describes
a directly runnable instruction. No listed test failed and no claim remains
untested.

## Earlier finding verification

I read every earlier `.factory/review-*.md`, `.factory/polish-*.md`, and the
prior handoff. Each item below was checked in both current source and the live
site; none was accepted merely because a polish report marked it fixed.

| Earlier finding | Live and code confirmation |
| --- | --- |
| F-1-1 | A cold unknown URL returns HTTP 404 with skip link, header/nav, main, footer, Privacy/Terms, metadata, favicon, and the product styling. |
| F-1-2 | Static and in-app missing states use `Page not found` and `This address does not have a meal board.` |
| F-1-3 | The source and live h1 remain `Plan meals for each person`. |
| F-1-4 | The visible and accessible toolbar action remains `Manage people`. |
| F-1-5 | The section heading remains `Plan individual and shared meals`. |
| F-1-6 | The live fact says `Works offline after your first visit.`; the clean claim and live offline reload passed. |
| F-1-7 | The time-saving promise remains absent; the live copy says `Leave a small prep task for later.` |
| F-1-8 | The README retains four short action sentences; none exceeds 22 words. |
| F-1-9 | The long internal test description and `exit lifecycle` jargon remain absent. |
| F-1-10 | Household-facing `PWA` and `IndexedDB` jargon remain absent from the README. |
| F-1-11 | `sample-six-meals` and `free-export-import-print` remain registered and both clean commands passed. |
| F-2-1 | The README heading remains the accurate `Claims tested`. |
| F-3-1 | `meal-create-edit` remains registered and passed the save, reload, and move behavior. |
| F-3-2 | The subjective `clear` claim remains replaced by `It shows one weekly meal board on this device.` |
| F-3-3 | `scope-boundaries` remains registered and passed for recipe, grocery, nutrition, and allergen actions/data. |
| F-3-4 | The public illustration-provenance sentence remains absent; provenance stays in `.factory/design.md`. |
| F-3-5 | README deploy copy remains plain; `build-output` and `hosting-config` both passed. |
| F-3-6 | Live and README copy still explains: `Sociobot opens the payment page. Dodo processes the payment.` |
| F-4-1 | Every checked live response, including the HTTP 404, sends `frame-ancestors 'self'` in its CSP header; the config test asserts it. |
| F-4-2 | `/`, `/demo`, `/privacy`, `/terms`, and the HTTP 404 all expose the 1200 × 630 product image as `twitter:image`. |

No earlier finding is unfixed, half-fixed, or regressed.

## Structure, routes, links, and accessibility

- `/`, `/demo`, `/privacy`, and `/terms` return 200. A cold unknown route
  returns the designed 404. Each checked page has its route title, one h1, one
  main, description, canonical, Open Graph and Twitter image data, favicon,
  consistent header/footer, skip link, and legal links.
- SPA navigation and browser Back focus the destination h1 and update the
  polite route announcement. Deep links reload into their intended state.
- Every supported-route link destination returned 200. The 404 skip link stays
  within the intentional 404 document. The only external product link,
  checkout, returned its expected 303 to the Dodo payment page.
- Live light and dark axe scans on all four routes and the HTTP 404 found zero
  serious or critical WCAG A/AA violations. A 390 px target sweep found no
  visible control below 44 × 44 px, and no route overflowed horizontally.
- `verify-url.sh` passed the live root at 644 ms with a title, `lang=en`, one
  h1, a main landmark, complete image/control labels, and no console errors.
- `robots.txt`, the four-route sitemap, manifest, SVG favicon, 1200 × 630
  social card, service worker, visible focus rules, print rules, and
  reduced-motion fallback are present. No third-party font or script loads.

## Missed leverage

No additional feature is required by the available product evidence. Free JSON
import/export already provides deliberate device transfer, and print covers a
shared physical copy. Automatic sync would conflict with the stated local,
one-device boundary unless the product scope changed. An AI meal suggestion
would be decorative without household preferences, pantry data, or another
planning input; no unexplained AI action or embedded provider key exists.

## What would make this perfect

Nothing identified in this review. Keep the current 20-claim clean-clone gate,
live one-click sandbox check, request-log check, route crawl, copy audit, and
light/dark accessibility sweep on future changes.
