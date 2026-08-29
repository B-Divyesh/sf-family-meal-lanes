# Review handoff — review 1

Completed the adversarial first-read review without modifying product code.

- Wrote `.factory/review-1.md` with verdict **FAIL** and eleven minor findings.
- Reviewed the live product cold at 390px and desktop, then exercised `/demo`,
  the reset/exit boundary, privacy request logging, offline reload, routes,
  metadata, 404, links, keyboard/accessibility coverage, and visual identity.
- In a fresh clone, ran every individual `.factory/claims.json` command (14/14
  passed), aggregate claim tests (14 passed), `npm test` (37 passed), and
  `npm run build` (passed; `dist/` produced).

Known gaps are the review findings: the cold HTTP 404 is not a full site route,
some copy is not plain enough, two README sentences exceed 22 words, and two
README promises lack their own registered claims. No product implementation was
changed in this review.

To verify after repair, run `npm ci && npm test && npm run build`, run every
test command in `.factory/claims.json` from a clean clone, and repeat the live
390px `/`, `/demo`, direct unknown-route, and offline checks described in
`.factory/review-1.md`.
