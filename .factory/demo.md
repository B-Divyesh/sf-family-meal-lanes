# Demo sandbox

Choose **Try it with sample data** or open `/?demo=1` to load the built-in week.
The `/demo` route opens the same isolated sample for Mara, Jon, and the Kids.
It includes six realistic meals, shared dinner links, and prep labels. The banner
states that this is a demo and provides **Reset demo** and **Start for real**.

The demo uses the IndexedDB database `family-meal-lanes:demo`; a real plan uses
`family-meal-lanes:real`. The two stores are never read together. Reset replaces
only the demo store with the shipped sample. **Start for real** discards the
demo store before opening the real plan, so demo edits do not return on a later
visit. The service worker caches a
versioned app shell, so the sample and interface can be checked offline after
the first visit. Each production build gives its shell a new cache name and
hashed JavaScript/CSS files; an available update is shown with **Update now**.
