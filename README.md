# Family Meal Lanes

Plan meals by person, not guesswork. It is for a household sharing one device
where individual meals, shared dinners, and prep tasks need one weekly view.

Family Meal Lanes is an offline-first PWA. Name the people in your kitchen,
place meals in their lanes, show shared meals in every relevant lane, and add
a short prep label. Plans stay in your browser and can be printed or moved as
a JSON file. It is not a recipe book, grocery service, nutrition tool, or
allergen checker.

The free plan includes Shared plus three people. A $12 one-time license adds
unlimited lanes on that device. Export, import, print, and all accessibility
features remain free.

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

## Privacy and transfer

No account or analytics are used. Meal lanes, titles, notes, and prep labels
are stored locally in IndexedDB. Use **Export JSON** to make a transfer copy,
then use **Import JSON** on another device. Read the in-app `/privacy` and
`/terms` pages before relying on the board.

## Claims checked in the demo

The automated browser suite checks the separate demo store, JSON export, an
offline reload after the first visit, and that saving a meal makes no request
outside the app origin. The exact checks are listed in `.factory/claims.json`.

## License

MIT. See [LICENSE](LICENSE).
