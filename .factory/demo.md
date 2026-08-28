# Demo sandbox

Open `/demo` or `/?demo=1` to load the built-in week for Mara, Jon, and the Kids.
It includes six realistic meals, shared dinner links, and prep labels. The banner
states that this is a demo and provides **Reset demo** and **Start for real**.

The demo uses the IndexedDB database `family-meal-lanes:demo`; a real plan uses
`family-meal-lanes:real`. The two stores are never read together. Reset replaces
only the demo store with the shipped sample. The service worker caches the app
shell, so the sample and interface can be checked offline after the first visit.
