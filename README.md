# Family Meal Lanes

Plan meals by person, not guesswork. It is for a household sharing one device
where individual meals, shared dinners, and prep tasks need one weekly view.

Family Meal Lanes is an offline-first PWA. Name the people in your kitchen,
place meals in their lanes, show shared meals in every relevant lane, and add
a short prep label. Plans stay in your browser and can be printed or moved as
a JSON file. It is not a recipe book, grocery service, nutrition tool, or
allergen checker.

## Try it

Run the app and open [http://localhost:5173/demo](http://localhost:5173/demo),
or use the deployed `/demo` URL. The demo has six sample meals for a small
household. It uses a separate IndexedDB store, so starting for real never copies
the sample into your plan.

## Run and test

```sh
npm install
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

No account or analytics are used. Meal lanes, titles, notes, and prep labels
are stored locally in IndexedDB. Use **Export JSON** to make a transfer copy,
then use **Import JSON** on another device. Read the in-app `/privacy` and
`/terms` pages before relying on the board.

## Claims checked in the demo

The automated browser suite checks the separate demo store, JSON export and
safe import rejection, shared meals, prep labels, printing, an offline reload
after the first visit, and that saving a meal makes no request outside the app
origin. The exact checks are listed in `.factory/claims.json`.

## License

MIT. See [LICENSE](LICENSE).
