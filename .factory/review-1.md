# Adversarial first-read review 1

**Verdict: FAIL.** No blocking failure was found, but the findings below mean
the product is not at the required zero-findings standard.

## Scope and first read

Reviewed live at `https://family-meal-lanes.sociobot.in` in fresh Chromium
contexts at 390 × 844 and 1440 × 900, on 2026-08-29. I did not change product
code. There were no earlier `.factory/review-*.md` or `.factory/polish-*.md`
files to re-check. `.factory/brief.json` is absent in this checkout.

Before scrolling, the answer was clear on both viewports:

- **What it does:** a weekly board that plans meals by person and lets one
  meal appear in several people’s lanes.
- **For whom:** a household sharing one device and needing to distinguish
  individual meals from shared ones.
- **First click:** **Try it with sample data**, which says it will show a
  filled week without saving it.

This passes the first-screen clarity gate. The cold mobile screen has one h1,
the primary action, its immediate result, and the three stated facts in view.
The risograph meal-slip artwork and paper-board treatment are product-specific,
not a generic SaaS template.

## Findings

### F-1-1 — Minor — the cold HTTP 404 does not use the required site skeleton

**Location/quote:** A fresh direct request to `/missing-review-path` returned
HTTP 404 and the page contained only `Family Meal Lanes`, `This paper slip is
missing.`, `Try the weekly meal board instead.`, and `Go to the meal board`.
It had no `header`, `nav`, `footer`, Privacy link, Terms link, skip link,
favicon, description, or canonical tag. This is the checked-in
`public/404.html` as well.

**Why this fails:** The normal page has a consistent header and footer that
give a lost visitor navigation and legal links. A direct 404 drops those
elements, so the first route a visitor reaches does not follow the specified
site structure.

**Concrete fix:** Make the static HTTP 404 use the same skip link, wordmark,
header/nav, footer (including Privacy and Terms), visual tokens, favicon, and
basic metadata as the app 404. Keep its HTTP status 404 and its visible route
back action.

### F-1-2 — Minor — the 404 heading is a metaphor, not an error explanation

**Location/quote:** `public/404.html` and the in-app not-found state use
`This paper slip is missing.`

**Why this fails:** A visitor arriving at an unknown URL needs to hear what
happened. “Paper slip” is product lore and does not say that the requested
page was not found.

**Concrete fix:** Change the h1 to `Page not found` and retain the concrete
next sentence/action, for example: `This address does not have a meal board.`

### F-1-3 — Minor — the main headline adds an unhelpful figurative contrast

**Location/quote:** landing h1: `Plan meals by person, not guesswork`.

**Why this fails:** “Not guesswork” is a slogan-like contrast rather than the
job. The useful part is already “Plan meals by person”; the extra phrase is
not a concrete capability.

**Concrete fix:** Use `Plan meals for each person` (six words), or retain only
the concrete first clause.

### F-1-4 — Minor — the People control does not name its result

**Location/quote:** board toolbar button: `People`. Its accessible name is
`Manage people and lanes`, but that is not what the sighted visitor sees.

**Why this fails:** “People” is a noun, not an action or result. On the first
real board a visitor must infer whether it opens, filters, or edits people.

**Concrete fix:** Change the visible label to `Manage people` (or `Edit meal
lanes`) and make the accessible name match it.

### F-1-5 — Minor — a section heading is mood copy rather than a section name

**Location/quote:** under `How it works`, the h2 is `Keep the whole kitchen in
view`.

**Why this fails:** Heard alone in a heading list, it does not name the
section’s content. It describes a feeling rather than the individual/shared
meal-lane process below it.

**Concrete fix:** Rename it `Plan individual and shared meals`.

### F-1-6 — Minor — the offline fact names a setup the visitor never performs

**Location/quote:** landing fact: `Works offline after setup`.

**Why this fails:** “Setup” is undefined. The verified claim and its test say
the actual condition is the first visit, so a first-time visitor cannot tell
what they need to do.

**Concrete fix:** Change it to `Works offline after your first visit.` This
matches `offline-reload` and removes the unexplained term.

### F-1-7 — Minor — an outcome claim has no claims entry

**Location/quote:** landing How-it-works step: `Leave the small task that saves
time later.`

**Why this fails:** “Saves time later” is a visitor-relevant outcome claim,
but `.factory/claims.json` has no entry or observable test for it.

**Concrete fix:** Prefer the non-claim rewrite `Leave a small prep task for
later.` If retaining the outcome, add a narrowly observable claim and test;
do not leave an untestable time-saving promise in the copy.

### F-1-8 — Minor — README instruction sentence exceeds the 22-word cap

**Location/quote:** README, opening description (24 words): `Name the people
in your kitchen, place meals in their lanes, show shared meals in every
relevant lane, and add a short prep label.`

**Why this fails:** It combines four actions and exceeds the plain-words hard
cap, making the product summary harder to scan.

**Concrete fix:** Split it: `Name the people in your kitchen. Put meals in
their lanes. Show shared meals in each relevant lane. Add a short prep label.`

### F-1-9 — Minor — README’s claim-suite sentence is 37 words and opaque

**Location/quote:** README, “Claims checked in the demo” (37 words): `The
automated browser suite checks the separate demo store and exit lifecycle,
JSON export and complete/safe import rejection, shared meals, prep labels,
printing, an offline reload, local-only meal saves, and the paid license
boundary and privacy behavior.`

**Why this fails:** It exceeds the cap by 15 words and uses internal terms
such as “exit lifecycle” and “license boundary” that do not help a household
visitor understand the product.

**Concrete fix:** Replace it with two plain sentences: `The test suite checks
the demo, exports, imports, shared meals, prep labels, printing, and offline
reloads. It also checks the lane limit and license privacy.`

### F-1-10 — Minor — README uses unexplained storage/product jargon

**Location/quote:** `Family Meal Lanes is an offline-first PWA.`; `It uses a
separate IndexedDB store.`; and `Meal lanes, titles, notes, and prep labels are
stored locally in IndexedDB.`

**Why this fails:** “PWA” and “IndexedDB” are implementation terms, not plain
words for the household reader the README introduces.

**Concrete fix:** Use `Family Meal Lanes works offline after your first visit.`
and `The demo uses separate browser storage.` / `Your meal plan stays in this
browser on this device.` Technical implementation detail can move to a
developer note.

### F-1-11 — Minor — two README promises are not individually registered as claims

**Location/quote:** `The demo has six sample meals for a small household.` and
`Export, import, and print remain free.`

**Why this fails:** The former is a count promise and the latter is a pricing
promise. Neither has its own `.factory/claims.json` entry. Existing tests show
six meals during JSON export and exercise the tools, but their registered
claims are “exports JSON,” “imports safely,” and “prints”; they do not promise
the six-meal demo or that these functions remain free.

**Concrete fix:** Either remove the promises or add two entries, for example
`sample-six-meals` (fresh `/demo`; assert six distinct stored meals) and
`free-export-import-print` (fresh real plan without a license; perform all
three functions). State the exact README locations in their `where` fields.

## Copy audit

Word counts treat visible labels/headings as copy as well as prose. No landing
or README sentence was omitted. `F-1-3` through `F-1-11` identify the flagged
rows; the remaining rows are checked with no copy finding.

### Landing page

| # | Words | Copy |
|---:|---:|---|
| 1 | 4 | Skip to meal plan |
| 2 | 3 | Family Meal Lanes |
| 3 | 1 | Demo |
| 4 | 1 | Board |
| 5 | 1 | Privacy |
| 6 | 6 | A weekly board for one kitchen |
| 7 | 6 | Plan meals by person, not guesswork |
| 8 | 16 | For households with different meals, so everyone can see what is theirs and what they share. |
| 9 | 5 | Try it with sample data |
| 10 | 4 | See a filled week. |
| 11 | 3 | Nothing is saved. |
| 12 | 4 | Works offline after setup |
| 13 | 7 | Meal plan saved only on this device |
| 14 | 4 | Export a JSON copy |
| 15 | 8 | Plan one meal in more than one lane. |
| 16 | 2 | This week |
| 17 | 3 | Who eats what |
| 18 | 10 | Add people, then put the first meal in a lane. |
| 19 | 3 | Add a meal |
| 20 | 1 | People |
| 21 | 1 | Print |
| 22 | 2 | Export JSON |
| 23 | 2 | Import JSON |
| 24 | 1 | Lane |
| 25 | 3 | How it works |
| 26 | 6 | Keep the whole kitchen in view |
| 27 | 3 | Name each lane. |
| 28 | 7 | Add each person and one shared lane. |
| 29 | 3 | Place the meal. |
| 30 | 9 | Pick a day, a lane, and who shares it. |
| 31 | 3 | Mark the prep. |
| 32 | 8 | Leave the small task that saves time later. |
| 33 | 5 | What this does not do |
| 34 | 14 | It does not store recipes, order groceries, score nutrition, or send your plan anywhere. |
| 35 | 9 | It keeps a clear weekly view on one device. |
| 36 | 4 | Read the privacy details |
| 37 | 2 | One-time purchase |
| 38 | 8 | Add as many lanes as your household needs |
| 39 | 7 | Free plans include Shared plus three people. |
| 40 | 9 | Pay $12 once for unlimited lanes on this device. |
| 41 | 5 | Buy unlimited lanes for $12 |
| 42 | 3 | Have a license? |
| 43 | 2 | Restore license |
| 44 | 7 | Sociobot and Dodo handle the hosted checkout. |
| 45 | 11 | A restored license is checked with Sociobot when you are online. |
| 46 | 9 | One weekly meal board for a shared kitchen device. |
| 47 | 1 | Privacy |
| 48 | 1 | Terms |
| 49 | 4 | Built by Param Factory |
| 50 | 3 | v1.0.0 |
| 51 | 6 | Original illustration generated for this product. |

### README

| # | Words | Copy |
|---:|---:|---|
| 1 | 3 | Family Meal Lanes |
| 2 | 6 | Plan meals by person, not guesswork. |
| 3 | 20 | It is for a household sharing one device where individual meals, shared dinners, and prep tasks need one weekly view. |
| 4 | 7 | Family Meal Lanes is an offline-first PWA. |
| 5 | 24 | Name the people in your kitchen, place meals in their lanes, show shared meals in every relevant lane, and add a short prep label. |
| 6 | 15 | Plans stay in your browser and can be printed or moved as a JSON file. |
| 7 | 13 | It is not a recipe book, grocery service, nutrition tool, or allergen checker. |
| 8 | 8 | The free plan includes Shared plus three people. |
| 9 | 10 | A $12 one-time license adds unlimited lanes on that device. |
| 10 | 6 | Export, import, and print remain free. |
| 11 | 7 | Sociobot and Dodo handle the hosted checkout. |
| 12 | 2 | Try it |
| 13 | 14 | Run the app and open http://localhost:5173/demo, or use the deployed /demo URL. |
| 14 | 10 | The demo has six sample meals for a small household. |
| 15 | 6 | It uses a separate IndexedDB store. |
| 16 | 15 | Starting for real discards that demo store and never copies the sample into your plan. |
| 17 | 3 | Run and test |
| 18 | 2 | npm ci |
| 19 | 3 | npm run dev |
| 20 | 2 | npm test |
| 21 | 3 | npm run build |
| 22 | 15 | npm run build writes the static site to dist/, with index.html at its root. |
| 23 | 8 | Preview the production build with npm run preview. |
| 24 | 1 | Deploy |
| 25 | 11 | The factory deploys the built dist/ directory as a static PWA. |
| 26 | 20 | The checked-in staticwebapp.config.json supplies the security headers, immutable hashed-asset caching, real route rewrites, and the HTTP 404 response. |
| 27 | 3 | Privacy and transfer |
| 28 | 12 | Meal lanes, titles, notes, and prep labels are stored locally in IndexedDB. |
| 29 | 15 | Use Export JSON to make a transfer copy, then use Import JSON on another device. |
| 30 | 20 | If you restore a paid license, its token is checked with Sociobot; meal-plan data is never sent with that check. |
| 31 | 12 | Read the in-app /privacy and /terms pages before relying on the board. |
| 32 | 5 | Claims checked in the demo |
| 33 | 37 | The automated browser suite checks the separate demo store and exit lifecycle, JSON export and complete/safe import rejection, shared meals, prep labels, printing, an offline reload, local-only meal saves, and the paid license boundary and privacy behavior. |
| 34 | 8 | The exact checks are listed in .factory/claims.json. |
| 35 | 1 | License |
| 36 | 1 | MIT. |
| 37 | 2 | See LICENSE. |

Terminology checked: the product consistently uses **meal**, **lane**,
**shared meal**, **prep label**, **meal board**, and **demo**. “People” is the
sole ambiguous visible control (F-1-4).

## Demo, privacy, claims, and functional checks

- The one-click landing action opened `/demo` with six realistic seed meals,
  including shared Lemon chicken tray bake and prep labels. The first rendered
  screen was already a populated meal board.
- The persistent banner read `Demo — sample data, nothing is saved` and exposed
  **Reset demo** and **Start for real**. A saved `Reviewer demo probe` appeared
  in demo, disappeared after Start for real, and did not return after reopening
  `/demo`; the real plan was empty. This confirms the separate storage path in
  the observed flow.
- Live demo request logging during the save flow and offline flow recorded only
  `https://family-meal-lanes.sociobot.in` requests. After service-worker setup,
  a 390px `/demo` reload while offline displayed the h1 and sample meal.
- All 14 commands from `.factory/claims.json` passed individually from a fresh
  clone. The aggregate `npm test -- --grep '@claim:'` reported **14 passed**.
  Full `npm test` reported **37 passed** and `npm run build` passed, producing
  `dist/` with 8.60 kB gzipped JavaScript.
- Claims with direct matching entries were checked against landing/README copy;
  the two unregistered README claims are F-1-11. No listed claim test failed.

## Structure and accessibility checks

- `/`, `/demo`, `/privacy`, and `/terms` returned 200, had one h1, main,
  header/footer, route titles, descriptions, canonical URLs, and no recorded
  console errors. In-app navigation and browser Back focused and announced the
  destination h1 (also covered by the passing suite).
- The cold direct 404 returned HTTP 404 and gave a working return link, but has
  the skeleton and wording defects in F-1-1 and F-1-2.
- Crawled internal links returned 200. The checkout link returned an explicit
  303 to the Dodo hosted-checkout origin. `robots.txt`, `sitemap.xml`,
  favicon, social image, manifest, CSP, and the PWA service worker were live.
- The passing suite includes serious/critical axe checks for light and dark
  `/`, `/demo`, `/privacy`, and `/terms`, 390px target checks, keyboard dialog
  coverage, and route-focus coverage. No live console errors were observed.

## Missed leverage

No additional AI feature is required by the available product evidence. The
core job is a private offline weekly board, and import/export, print, demo, and
shared lanes are already present. Adding AI meal suggestions would be
decorative without a user-provided planning input or an explicit brief need.

## What would make this perfect

Apply F-1-1 through F-1-11, especially making the cold 404 a full product
route and removing ambiguous/non-plain copy. Register or remove every remaining
visitor-relevant count and pricing promise. Re-run the complete fresh-clone
claim matrix, mobile first-read, and direct-404 check; only a zero-findings
review should change this verdict to PASS.
