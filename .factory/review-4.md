# Adversarial first-read review 4

**Verdict: FAIL.** Two minor findings remain. A PASS requires zero findings.

Reviewed on 2026-08-29 UTC against live
`https://family-meal-lanes.sociobot.in` at 390 × 844 and 1440 × 900, and
against clean clone `43b122d6ab8957214c93a30017678e13ba3fcef7`. Product code
was not changed. `.factory/brief.json` is absent, so the missed-leverage check
used the published product, README, demo documentation, claims, and design
thesis.

## First read

Before scrolling, on both viewports, the answer was clear:

- **What it does:** a weekly meal board for assigning individual and shared
  meals to each person.
- **For whom:** households sharing one device where people eat different and
  shared meals.
- **What to click first:** **Try it with sample data**; its adjacent result is
  `See a filled week. Nothing is saved.`

The first-screen clarity gate passes. The mobile viewport contains the
job-first h1, audience sentence, primary action, immediate result, and three
plain facts. It has no horizontal overflow. The cut-paper meal planner,
risograph texture, and offset meal slips are recognisably product-specific,
not a generic SaaS template. Cold loads produced no product console or page
errors.

Evidence: `review-4-evidence/first-mobile.png`,
`review-4-evidence/first-desktop.png`, and `review-4-evidence/live-audit.json`.

## Findings

### F-4-1 — Minor — the response CSP does not prevent another site framing the meal board

**Location/evidence:** live responses for `/`, `/demo`, `/privacy`, `/terms`,
and the HTTP 404 send:

```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self';
img-src 'self' data:; connect-src 'self' https://api.sociobot.in;
manifest-src 'self'; worker-src 'self'
```

`public/staticwebapp.config.json` has the same policy. It omits the required
response-header `frame-ancestors` directive.

**Why this fails:** A household can be shown the genuine meal board inside an
unrelated page. That weakens the local-first privacy boundary and fails the
site-structure CSP requirement. This is not visible from the happy-path
screen, so it needs an explicit release check.

**Concrete fix:** Add `frame-ancestors 'self'` (or the intentional narrower
policy) to the `Content-Security-Policy` value in `globalHeaders`, deploy it as
a response header, and add a hosting-config regression that asserts the live
header contains it without browser CSP errors.

### F-4-2 — Minor — Twitter card metadata has no product image

**Location/evidence:** `index.html` and `public/404.html` supply
`twitter:card`, `twitter:title`, and `twitter:description`, but neither
supplies `twitter:image`. The SPA updates title and description on `/demo`,
`/privacy`, and `/terms` but cannot add the missing image either. The existing
`og:image` is `https://family-meal-lanes.sociobot.in/social-card.webp`.

**Why this fails:** The required social metadata calls for a real 1200 × 630
product image for both Open Graph and Twitter cards. A link preview consumer
that reads Twitter-specific fields can receive no designed product image,
despite the product having one.

**Concrete fix:** Add `meta name="twitter:image"` pointing to the existing
social card in `index.html` and `404.html`; update it in `updateMetadata` if
route-specific social metadata is maintained. Add a route-metadata test that
asserts a valid Twitter image on `/`, `/demo`, `/privacy`, `/terms`, and the
HTTP 404.

## Copy audit

Counts use visible words; commands are not sentences. All landing and README
copy is at or below 22 words. No banned marketing adjective, vague mood
heading, inconsistent core term, or non-result-naming product button was
found. Claim-like public statements map to the 20 entries in
`.factory/claims.json`; the two findings above are metadata/security omissions,
not unlisted product claims.

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
| 4 | Read the privacy details | pass — navigation link |
| 2 | One-time purchase | pass |
| 8 | Add as many lanes as your household needs | pass |
| 7 | Free plans include Shared plus three people. | pass — `free-lane-limit` |
| 9 | Pay $12 once for unlimited lanes on this device. | pass — `paid-unlimited-lanes` |
| 5 | Buy unlimited lanes for $12 | pass — `paid-unlock` |
| 3 | Have a license? | pass |
| 2 | Restore license | pass — `paid-unlimited-lanes` |
| 5 | Sociobot opens the payment page. | pass — `paid-unlock` |
| 4 | Dodo processes the payment. | pass — `paid-unlock` |
| 11 | A restored license is checked with Sociobot when you are online. | pass — `license-invalid-cache` |
| 9 | One weekly meal board for a shared kitchen device. | pass |
| 1 | Privacy | pass — navigation link |
| 1 | Terms | pass — navigation link |
| 4 | Built by Param Factory | pass |
| 3 | v1.0.0 | pass |

The demo first screen also passes: `Try a filled meal week` names the state,
and `Use the sample below. Choose Reset demo to reload it, or start a separate
plan for your household.` is 14 words in each sentence.

### README

| Words | Sentence | Result |
| ---: | --- | --- |
| 5 | Plan meals for each person. | pass |
| 20 | It is for a household sharing one device where individual meals, shared dinners, and prep tasks need one weekly view. | pass |
| 9 | Family Meal Lanes works offline after your first visit. | pass — `offline-reload` |
| 6 | Name the people in your kitchen. | pass |
| 5 | Put meals in their lanes. | pass — `meal-create-edit` |
| 7 | Show shared meals in each relevant lane. | pass — `shared-lanes` |
| 5 | Add a short prep label. | pass — `prep-labels` |
| 15 | Plans stay in your browser and can be printed or moved as a JSON file. | pass — `local-only`, transfer claims |
| 13 | It is not a recipe book, grocery service, nutrition tool, or allergen checker. | pass — `scope-boundaries` |
| 8 | The free plan includes Shared plus three people. | pass — `free-lane-limit` |
| 10 | A $12 one-time license adds unlimited lanes on that device. | pass — `paid-unlimited-lanes` |
| 6 | Export, import, and print remain free. | pass — `free-export-import-print` |
| 5 | Sociobot opens the payment page. | pass — `paid-unlock` |
| 4 | Dodo processes the payment. | pass — `paid-unlock` |
| 10 | Run the app and open http://localhost:5173/?demo=1. | pass — instruction |
| 9 | The deployed /?demo=1 URL opens the same sample. | pass — `demo-sandbox` |
| 9 | The demo has six meals for a small household. | pass — `sample-six-meals` |
| 6 | The demo uses separate browser storage. | pass — `demo-sandbox` |
| 15 | Starting for real discards that demo store and never copies the sample into your plan. | pass — `demo-sandbox` |
| 7 | Build the site with npm run build. | pass — `build-output` |
| 6 | Deploy dist/ as the site root. | pass — instruction |
| 8 | Preview the production build with npm run preview. | pass — instruction |
| 9 | The hosting config adds security headers and direct routes. | pass — `hosting-config` (F-4-1 narrows the missing directive) |
| 9 | It serves the 404 page and caches versioned assets. | pass — `hosting-config` |
| 10 | Your meal plan stays in this browser on this device. | pass — `local-only` |
| 8 | Use Export JSON to make a transfer copy. | pass — `json-export` |
| 6 | Use Import JSON on another device. | pass — `json-import-safety` |
| 20 | If you restore a paid license, its token is checked with Sociobot; meal-plan data is never sent with that check. | pass — `license-request-privacy` |
| 12 | Read the in-app /privacy and /terms pages before relying on the board. | pass — instruction |
| 16 | The test suite checks the demo, exports, imports, shared meals, prep labels, printing, and offline reloads. | pass — test description |
| 9 | It also checks the lane limit and license privacy. | pass — test description |
| 8 | The exact checks are listed in .factory/claims.json. | pass — instruction |
| 1 | MIT. | pass |
| 2 | See LICENSE. | pass |

Headings (`Try it`, `Run and test`, `Deploy`, `Privacy and transfer`, `Claims
tested`, and `License`) name their sections. The terminology table remains
consistent: meal, lane, shared meal, prep label, demo, and license.

## Demo, sandbox, and privacy

- The landing action reaches `/?demo=1` in one click. The immediately rendered
  product is a filled meal board with six realistic source meals for Shared,
  Mara, Jon, and Kids; shared dinners appear in the selected lanes.
- The persistent banner is exactly `Demo — sample data, nothing is saved` and
  has **Reset demo** and **Start for real**. A new reset probe disappeared
  after Reset; a separate exit probe appeared in neither the real plan nor a
  new demo visit. The browser reported separate
  `family-meal-lanes:demo` and `family-meal-lanes:real` databases.
- After service-worker activation, the six-meal demo reloaded offline with its
  banner and content intact.
- The complete observed cold/demo/reset/exit/offline flow made requests only
  to `https://family-meal-lanes.sociobot.in`. It made no analytics, font,
  payment, AI, or other third-party request. The optional payment request is
  not made in demo mode.

The brief is absent and the published job does not imply an AI workflow. The
product already provides the obvious transfer leverage through free JSON export
and import; no decorative AI or embedded provider key was found.

## Claims and local quality gates

I cloned the exact candidate into `/tmp/fml-review4-clean-u4uBEO`, ran
`npm ci`, and executed every literal test command in `.factory/claims.json`
separately. All 20 passed: `demo-sandbox`, `sample-six-meals`,
`meal-create-edit`, `json-export`, `json-import-safety`, `offline-reload`,
`local-only`, `scope-boundaries`, `shared-lanes`, `prep-labels`, `print-plan`,
`free-export-import-print`, `named-lanes`, `paid-unlock`, `free-lane-limit`,
`paid-unlimited-lanes`, `license-invalid-cache`, `license-request-privacy`,
`build-output`, and `hosting-config`.

`npm test` then passed 51/51 tests and `npm run build` produced `dist/`.
Initial JavaScript is 8.87 kB gzip. The live checkout returned HTTP 303 to the
Dodo hosted checkout. The registered privacy and offline claims are therefore
tested, but F-4-1 and F-4-2 remain outside the current manifest coverage.

## History recheck

I read every prior `review-*.md`, `polish-*.md`, and the prior handoff, then
checked each reported item against current source and live behavior.

| Earlier findings | Confirmation |
| --- | --- |
| F-1-1, F-1-2 | A cold unknown URL returns HTTP 404 with the common skip/header/nav/main/footer/legal skeleton, `Page not found`, concrete recovery text, metadata, favicon, and no CSP style error. |
| F-1-3 through F-1-7 | The concrete h1, `Manage people`, named how-to heading, first-visit offline wording, and non-time-saving prep wording are live and in `src/main.ts`. |
| F-1-8 through F-1-11; F-2-1 | README action/test copy remains short and plain; browser-storage jargon is absent; sample/free-transfer claims and the `Claims tested` heading remain correct. |
| F-3-1 through F-3-6 | Create/edit and scope claims exist and passed; subjective/provenance/deploy-jargon copy remains absent; payment roles are explicit. |

No earlier finding is unfixed, half-fixed, or regressed. Earlier independent
verification issues are also confirmed fixed: current 390px controls all meet
44 × 44 px, visible `Export JSON` is its accessible name, direct 404 styling
is external/CSP-clean, route changes and Back focus/announce the destination
h1, and the lane limit remains visible in its open dialog.

## Structure, routes, accessibility, and links

- `/`, `/demo`, `/privacy`, and `/terms` return HTTP 200; an unknown cold URL
  returns HTTP 404. All have a route-appropriate title, one h1, one main,
  description, canonical URL, OG data, favicon, consistent header/footer,
  and Privacy/Terms links. F-4-2 is the remaining Twitter-image gap.
- Direct navigation, Back, and a screen-reader announcement place focus on the
  destination h1 (`Your meal plan stays on this device`, then `Plan meals for
  each person` when returning).
- All discovered internal links resolved, and checkout returned HTTP 303.
  The mobile target sweep found no visible interactive target below 44 × 44
  px. Axe 4.11, including WCAG 2.1 A/AA tags, returned zero violations on the
  five routes in both light and dark schemes.
- `robots.txt`, `sitemap.xml`, manifest, favicon, social card, reduced-motion
  rules, self-hosted system type, service worker, and the designed static 404
  are present. The only remaining structural security omission is F-4-1.

## What would make this perfect

Add and test `frame-ancestors` in the response CSP, then supply and test the
Twitter image metadata on every route and the HTTP 404. Re-run the 20 claim
commands, full suite, live header check, and link-preview metadata check. With
those two findings closed, the product is at the requested zero-findings bar.
