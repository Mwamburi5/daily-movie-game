# Marquee · Stitch Card Styles (Reverse-Engineering Reference)

> **2026-07-03: superseded for production.** Styles A and C are locked; the
> detailed production specs are `card-spec-A-repertory-ticket.md`,
> `card-spec-C-silent-era.md`, and the shared `card-template-contract.md`.
> This file remains as the historical record of the three-style exploration.

Three winning front designs generated in Google Stitch, documented so they can be
reproduced or re-prompted for any movie. All three share the same anatomy from
`card-design-system.md`: top-left genre index (color + shape), big title, year top-
right, framed key art, a "DEEP CUT" badge on the art, and connect-credits shown as
scored rows (actor = circle +1, director = square +2).

---

## A · Repertory Ticket

- **Art style:** Mid-century limited-palette screen-print / letterpress ticket.
- **Format:** Die-cut admission ticket. Vertical column of punched holes plus one
  large semicircular tear notch down the left edge. Rounded corners.
- **Palette (approx):** Cream paper #F2ECD9, petrol teal #1C6E78, navy ink #1B2A4A,
  burnt orange #C8743A. Three to four spot inks only.
- **Type:** Title in a bold slab serif (Clarendon / Rockwell family). UI in a small
  geometric sans. Genre reversed-out white in a teal pill.
- **Art treatment:** Flat vector illustration with a halftone-dot / engraving grain
  overlay. Navy hull, tan funnels, grey halftone smoke, teal sea with simple waves.
- **Top:** Solid teal rule bar across the top edge.
- **Recipe:** Pick 3 spot colors, build flat shapes, overlay halftone texture, mask
  to the ticket diecut silhouette, add punch holes and the tear notch.

## B · Marquee Lights

- **Art style:** Theater-marquee neon signage plus soft-3D rendered key art.
- **Format:** Rounded-rect card, dark navy field #0E1B3A.
- **Frame:** Full perimeter of warm incandescent bulbs with real glow, set inside a
  brass / gold art-deco double pinstripe border.
- **Palette (approx):** Navy field, glowing cyan #5FD2E6 title, brass gold #C9A24A
  trim, warm bulb white #FFE9A8.
- **Type:** Title in lit "neon tube" cyan-white lettering with outer glow / bloom.
  Genre in a thin cyan circle outline.
- **Art treatment:** Soft-3D render: smooth gradients, glossy hull, a volumetric teal
  spotlight beam through fog, dark blue night sky. This render is what separates B
  from A.
- **Recipe:** Dark bg, radial-glow bulb array, gold gradient deco frame, neon-glow
  title (outer glow + bright fill), artwork rendered in soft-3D with a light beam.

## C · Silent Era

- **Art style:** Antique steel-engraving / graphite illustration on distressed paper,
  Victorian / art-nouveau print ephemera. The least "AI" looking of the three.
- **Format:** Rounded-rect card on aged paper with a soft vignette and worn corners.
- **Frame:** Ornate art-nouveau / Victorian engraved border with scrollwork corners,
  like an old stock certificate or playbill, in dark sepia.
- **Palette (approx):** Aged ivory #E8DCC2 to tan, sepia ink #3B2E1E, muted slate-blue
  credit pips #6E8190, brown director square #7A5A38. Desaturated throughout.
- **Type:** Title in an ornate Victorian / Tuscan display serif (spurred, decorative).
- **Art treatment:** Detailed monochrome engraving / etching with fine crosshatch,
  like a 19th-century newspaper cut. Foxing stains and paper grain over everything.
- **Recipe:** Aged-paper texture plus grain and stains, vector ornamental frame,
  engraving / etching-filtered illustration, decorative Victorian title face, muted
  desaturated palette.

---

## How the art stays copyright-safe (all three)

Original symbolic illustration only. Evoke the film through setting, objects, mood,
and color. Never copy a real poster, film still, studio logo, custom title font, or
actor likeness. No faces.

---

## Stitch prompt · test on a different movie (Jurassic Park)

Paste the block below into Stitch to render all three designs for a film that is
deliberately unlike Titanic (different genre, era, and subject), to confirm each
layout flexes. To test yet another film, swap the MOVIE block at the top.

```
Design THREE mobile game card FRONTS, side by side, on a dark wood table background,
for a movie-connection card game called "Marquee." All three cards are for the SAME
film so I can compare three art styles. Portrait tiles, roughly 3:4 ratio, soft die-
cut corners, each labeled underneath: "A · Repertory Ticket", "B · Marquee Lights",
"C · Silent Era".

MOVIE (use on all three cards):
- Title: JURASSIC PARK
- Year: 1993
- Genre index (top-left pip, double-coded color + shape): SCI-FI = blue triangle
- Connect-credits (scored rows): Sam Neill +1 (actor, circle), Laura Dern +1 (actor,
  circle), Steven Spielberg +2 (director, square)
- A small "DEEP CUT" badge on the artwork
- KEY ART (original and symbolic, NO real movie poster, still, logo, or likeness, no
  people): a lone dinosaur silhouette against a dusk jungle and an electric storm,
  amber and deep-green palette, a silhouetted watchtower or fence line, dramatic sky.

SHARED LAYOUT (all three): genre pip hard in the top-left corner, then a LARGE legible
"JURASSIC PARK" title, year "1993" top-right, framed hero art in the upper middle, the
three scored credit rows below, clean center, bold iconography. Keep titles readable as
if the card were overlapped in a fanned hand.

CARD A — REPERTORY TICKET: mid-century limited-palette SCREEN-PRINT. Cream paper, 3 to
4 spot inks, visible halftone dot grain, flat vintage illustration, die-cut ticket with
punched holes and a tear notch down the left edge, bold slab-serif title.

CARD B — MARQUEE LIGHTS: dark theatrical card framed by glowing incandescent marquee
bulbs and brass art-deco trim. Lit neon-tube title with glow. Key art rendered in
SOFT-3D with smooth gradients, glossy surfaces, and a volumetric spotlight beam.

CARD C — SILENT ERA: antique ENGRAVING / etching illustration with fine crosshatch on
distressed aged paper with foxing stains and worn corners, wrapped in an ornate art-
nouveau Victorian scrollwork border, ornate Victorian display-serif title, desaturated
sepia palette.

Texture is the most important part of this brief: make the screen-print grain, the neon
glow and gloss, and the engraving-on-aged-paper unmistakable even in a thumbnail.
Output all three side by side at high resolution. Fronts only.
```
