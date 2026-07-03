# Marquee · Card Spec A — Repertory Ticket

> Production spec for the **A · Repertory Ticket** front, reverse-engineered from
> the winning Stitch renders (project "Marquee Card Prototypes", June 23 2026 —
> canonical reference: the Titanic card in the two-card A/B board, the cleanest
> render of the exploration). Geometry and data slots come from
> `card-template-contract.md`; this file adds everything style-specific plus the
> paste-ready generation prompt.
>
> **Canonical reference render:** `design/reference/reference-A-titanic.png`

---

## 1 · Identity

A mid-century **repertory cinema admission ticket**, printed by silkscreen. Warm
cream stock, a vertical perforated stub down the left edge, three to four flat spot
inks, visible halftone grain, slight ink misregistration. It should feel like it
came out of a letterpress shop in 1962 and spent a week in a coat pocket.

Where drifted renders differed from this spec, **this spec wins** — it
canonicalizes the best render and rejects the drift (§8).

## 2 · Palette (sampled from the canonical render)

The whole card uses **five colors, period.** Screen-print means limited ink;
if a sixth color appears, the render fails QA.

| Token | Hex | Used for |
|---|---|---|
| `paper-cream` | `#F0EBD8` | Card stock, reversed-out text, art highlights |
| `ink-navy` | `#1F3A52` | Title, year, credit names & points, art frame, art darks |
| `ink-teal` | `#2E8C94` | Stub bar, genre pip, art mid-tones — as rendered on the reference card; swapped per-genre (see below) |
| `ink-teal-deep` | `#1C6E78` | Deep Cut badge fill, art shadows |
| `ink-amber` | `#CF952A` | Director pip; optional single accent in the art |

**Genre exception:** the genre pip always renders in the movie's true genre color
from the contract's taxonomy (full-saturation column) — it is UI, not art. For a
non-teal genre, that genre color also *replaces* `ink-teal` as the art's mid-tone
ink, keeping the total at five (e.g. a Sci-Fi card prints in cream/navy/blue/deep-
blue/amber). The stub bar always matches the genre ink. This is how 8 genres stay
inside a 5-ink screen-print system.

## 3 · Paper & texture recipe

- Matte uncoated stock with faint paper tooth; even cream, no yellowing gradients.
- **Halftone dot grain** over all inked areas: 45° dot screen, dots visible at
  100 % but dissolving at thumbnail; strongest in art mid-tones.
- **Misregistration:** inks offset 2–3 units from their keylines in one consistent
  direction per card. Subtle — a printing flaw, not a glitch effect.
- Chunky flat shapes only. No gradients anywhere. No photographic texture.

## 4 · Die-cut & stub chrome (geometry on the 1000 × 1333 grid)

| Element | Spec |
|---|---|
| Silhouette | Rounded rect, r 36, plus one semicircular tear notch (r 44) centered on the top edge and one on the bottom edge, both at x 580 |
| Perforation | Vertical dotted line at x 230: punched dots ⌀ 14, pitch 34, running full height |
| Stub column | x 0 → 215; everything left of the perforation |
| Genre pip | Filled genre shape, 110 wide, centered (115, 150) |
| Stub bar | Solid genre-ink rectangle x 88 → 142, y 270 → 950 |
| "ADMIT ONE" | Vertical reading bottom-to-top, centered on x 115, y 990 → 1230, geometric sans caps 44, letterspaced +20 %, `ink-navy` |

## 5 · Zone dressing (positions from the contract)

| Zone | Style A treatment |
|---|---|
| Title | ALL CAPS bold **condensed slab serif** (Rockwell Bold Condensed / Clarendon family), `ink-navy`, left x 270, baseline y 190. ≤ 11 chars: cap-height 92, one line. 12–22 chars: two lines cap-height 64, block y 90–230. > 22 chars: two lines cap-height 56 |
| Year | Same slab, cap-height 56, right-aligned x 950, baseline y 190 |
| Title rule | 4-unit `ink-navy` hairline, x 270 → 950, y 242 |
| Art frame | `ink-navy` stroke 10, corner r 24, around the contract window (x 270→950, y 290→902); inner `paper-cream` keyline 3, inset 10 |
| Deep Cut badge | Circle ⌀ 120 at (860, 810), `ink-teal-deep` fill, `paper-cream` ring inset 6, "DEEP / CUT" in cream geometric sans caps 30, two lines |
| Credit rows | Per contract alignment. Pips 44 (role shape, full-saturation role color). Names bold geometric sans 52 `ink-navy`. Points "+1"/"+2" bold 52 `ink-navy`, right-aligned x 920. No underlines, no boxes, no trailing pips |

## 6 · Typography

| Slot | Face (feel) | Case | Notes |
|---|---|---|---|
| Title | Bold condensed slab (Rockwell/Clarendon) | ALL CAPS | Tight tracking; the loudest thing on the card |
| Year | Same slab | Lining figures | Visually half the title's weight |
| Credits & points | Geometric sans (Futura/DIN feel), bold | Title Case names | High x-height for fan legibility |
| ADMIT ONE | Same geometric sans | ALL CAPS | The only rotated text allowed |

## 7 · Art treatment (how the movie brief renders in A)

Take the movie block's `art` brief and render it as a **flat screen-print
illustration**: chunky shapes cut from the five inks, halftone dots for tonal
steps, `paper-cream` doing the work of white. Hero subject at 55–70 % of window
height per the contract's composition template. Sky/backdrop in halftoned genre
ink, darks in navy, one amber accent maximum. No outlines thinner than 4 units —
fine linework dies at fan size and isn't screen-printable anyway.

## 8 · Known drifts — reject on sight

Observed in the June 23 exploration; all fail QA:

1. Star (or anything) inside the genre pip — the pip is a plain filled shape.
2. Credit rows with underlines or pips repeated on the right end.
3. Genre pip migrating out of the stub into the body.
4. Deep Cut badge fading into the art or rendered as plain text.
5. A sixth color, gradients, or photographic grain.
6. Poster-style credit blocks replacing the scored rows.
7. Labels or captions under/inside the card image.

## 9 · Generation prompt template

Paste verbatim into Stitch or Claude Design. Fill only the `{{SLOTS}}` from the
movie block. Do not reword between cards — identical wording is what buys
identical output across 400 cards.

```
Design ONE mobile game card FRONT for the movie-connection card game "Marquee."
This is one card of a large matched set: the LAYOUT below is a fixed template and
must be followed exactly; only the movie content changes between cards. Portrait
3:4 card at high resolution on a dark walnut table. Output the single card only —
no labels, no captions, no extra cards.

STYLE — "REPERTORY TICKET" (screen-print):
A vintage repertory-cinema admission ticket, silkscreen-printed. Matte cream
uncoated paper (#F0EBD8). STRICT five-color limit: cream paper, navy ink
(#1F3A52), {{GENRE_INK_NAME}} ink ({{GENRE_INK_HEX}}), a deeper shade of that same
ink for shadows, and amber (#CF952A) as at most one small accent. Visible halftone
dot grain in all inked areas, slight ink misregistration, chunky flat shapes, no
gradients, no photo texture. Die-cut silhouette: rounded corners plus one
semicircular tear notch centered on the top edge and one on the bottom edge.

TICKET STUB (left edge):
A vertical perforated line of punched holes about a quarter in from the left edge,
running the full height. Left of it: the GENRE PIP at the top — a plain filled
{{GENRE_SHAPE}} in {{GENRE_INK_HEX}}, nothing drawn inside it — then a solid
vertical {{GENRE_INK_NAME}} bar, then "ADMIT ONE" reading vertically in small
letterspaced navy caps near the bottom.

HEADER (right of the stub):
"{{TITLE}}" in very large bold condensed slab-serif navy capitals, left-aligned,
readable even when the card is overlapped in a fanned hand. The year "{{YEAR}}" in
smaller navy slab figures, right-aligned on the same line. A thin navy rule under
the header.

ART WINDOW (fixed size — identical on every card in the set):
A rectangular framed window spanning the full width right of the stub, from just
below the header rule to about two-thirds down the card, with a 10-unit navy frame,
gently rounded corners, and a thin cream inner keyline. Inside, an ORIGINAL
symbolic screen-print illustration — flat chunky shapes in the card's five inks
with halftone tonal steps. NO people, NO faces, NO logos, NO readable text, nothing
copied from a real poster or still.
  Subject: {{ART_SUBJECT}}
  Setting: {{ART_SETTING}}
  Mood / light: {{ART_MOOD}}
  One accent element: {{ART_ACCENT}}
  Composition: {{ART_COMPOSITION_SENTENCE}}
{{DEEP_CUT_LINE}}

CREDITS (bottom block, aligned to the art window's edges):
{{CREDIT_COUNT}} scored rows, top to bottom:
{{CREDIT_ROWS}}
Each row: a small flat role glyph on the left (actor = blue #2C89A1 circle,
director = amber #CF952A square), the name in bold navy geometric sans, and the
point value in bold navy right-aligned at the row's far right. Plain rows — no
underlines, no boxes, no repeated glyphs on the right.

Texture is the headline requirement: the silkscreen halftone grain and flat spot
inks must be unmistakable even at thumbnail size. Professional collectible card
game finish.
```

### Slot key

| Slot | From movie block | Example (Titanic) |
|---|---|---|
| `{{TITLE}}` / `{{YEAR}}` | `title`, `year` | `TITANIC`, `1997` |
| `{{GENRE_SHAPE}}` | taxonomy shape | `heart` (Titanic = Romance in the DB) |
| `{{GENRE_INK_NAME}}` / `{{GENRE_INK_HEX}}` | taxonomy color (full) | `rose`, `#D4708C` |
| `{{ART_*}}` | `art` fields | see contract §6 |
| `{{ART_COMPOSITION_SENTENCE}}` | template → sentence | `hero-left-diagonal` → "the hero subject sits lower-left, angled up and to the right, filling about two-thirds of the window height, with the setting band behind it and open sky above" |
| `{{DEEP_CUT_LINE}}` | `deepCut` | true → `A circular "DEEP CUT" badge — deep {{GENRE_INK_NAME}} fill, cream ring and cream caps on two lines — sits inside the window near its bottom-right corner.` · false → *(omit the line entirely)* |
| `{{CREDIT_COUNT}}` / `{{CREDIT_ROWS}}` | `credits` | `THREE` / `Leonardo DiCaprio (actor, blue circle) +1` … one per line |
