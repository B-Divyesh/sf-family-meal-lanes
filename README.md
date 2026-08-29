# Family Meal Lanes

Plan meals for each person. It is for a household sharing one device
where individual meals, shared dinners, and prep tasks need one weekly view.

Family Meal Lanes works offline after your first visit. Name the people in your
kitchen. Put meals in their lanes. Show shared meals in each relevant lane.
Add a short prep label. Plans stay in your browser and can be printed or moved
as a JSON file. It is not a recipe book, grocery service, nutrition tool, or
allergen checker.

The free plan includes Shared plus three people. A $12 one-time license adds
unlimited lanes on that device. Export, import, and print remain free.
Sociobot and Dodo handle the hosted checkout.

## Try it

Run the app and open [http://localhost:5173/?demo=1](http://localhost:5173/?demo=1).
The deployed `/?demo=1` URL opens the same sample. The demo has six meals for a small
household. The demo uses separate browser storage. Starting for real discards that
demo store and never copies the sample into your plan.

## Run and test

```sh
npm ci
npm run dev
npm test
npm run build
```

`npm run build` writes the static site to `dist/`, with `index.html` at its
root. Preview the production build with `npm run preview`.

## Deploy

The factory deploys the built `dist/` directory as a static PWA. The checked-in
`staticwebapp.config.json` supplies the security headers, immutable hashed-asset
caching, real route rewrites, and the HTTP 404 response.

## Privacy and transfer

Your meal plan stays in this browser on this device. Use **Export JSON** to
make a transfer copy. Use **Import JSON** on another device. If you restore a
paid license, its token is checked with Sociobot;
meal-plan data is never sent with that check. Read the in-app `/privacy` and
`/terms` pages before relying on the board.

## Claims checked in the demo

The test suite checks the demo, exports, imports, shared meals, prep labels,
printing, and offline reloads. It also checks the lane limit and license
privacy. The exact checks are listed in `.factory/claims.json`.

## License

MIT. See [LICENSE](LICENSE).
