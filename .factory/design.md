# Family Meal Lanes — visual thesis

## Direction

**Risograph tactile collage.** A family plan benefits from looking handled rather
than managed: overlapping paper labels make the shared and individual parts of
a meal obvious at a glance. Imperfect ink, cut-paper edges, and offset shadows
give the weekly board a friendly physical logic without making it childish.

## Palette

- Paper `#fff7e8` — warm, explicit page background.
- Ink `#24334b` — primary text and rules; 10.6:1 contrast on paper.
- Tomato `#bf3d3d` — calls to action and dinner marks; white text is 5.4:1.
- Cobalt `#2758a6` — shared-meal marks and focus ring.
- Mustard `#d49319` — prep notes and warning treatment; ink text is 5.7:1.
- Leaf `#35624e` — saved/export success marks.
- Pulp `#f1dfbf` — secondary paper surface.
- Night `#172030` — dark-mode ground with `#fff7e8` text.

## Type and layout

Display type is **Georgia**, deliberately warm and editorial, with **Arial**
for direct kitchen-utility labels. Both are system-installed, so no remote
font is loaded. Type uses a 1.25 scale. The board uses generous 8px rhythm;
meal slips are deliberately dense, while controls retain 44px targets.
At phone widths the days become a horizontal, snap-scrolling paper strip;
lanes stay visible as row labels.

## Interaction and motion

Saving a meal stamps in a 180ms transform/opacity transition. Hovered notes
lift by 2px as if a paper corner loosens. The reduced-motion setting removes
all transforms and transitions. Color is always paired with a lane name or
label.

## Asset plan and provenance

The hero is an original overhead still-life of a week planner made from cut
paper meal slips, kitchen pencil marks, and small ingredient shapes. It is
decorative context; product instructions remain HTML. Asset prompt is kept in
`assets/src/hero-risograph.json`. Generated with the factory Azure image model
on 2026-08-28; no people, brands, text, watermark, or logos. The output is
converted to a WebP under 300 KB and also used to derive the social card.

The UI’s paper corners, dotted rules, and lane symbols are authored in CSS/SVG
inside this product; no third-party art or icon set is used.
