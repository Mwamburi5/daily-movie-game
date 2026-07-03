# Marquee · Card Spec C — Silent Era

> Production spec for the **C · Silent Era** front, reverse-engineered from the
> Stitch renders (project "Marquee Card Prototypes", June 23 2026 — canonical
> reference: the Titanic Silent Era card in the A/B/C board; the Jurassic Park
> render contributed the aged-paper edge treatment but its oval art frame and
> capsule credit rows are rejected). Geometry and data slots come from
> `card-template-contract.md`; this file adds everything style-specific plus the
> paste-ready generation prompt.
>
> **Canonical reference render:** `design/reference/reference-C-titanic.png`

---

## 1 · Identity

A piece of **early-cinema print ephemera**: an antique playbill / stock-certificate
hybrid on aged ivory stock, wrapped in an ornate engraved Art Nouveau border, with
the key art rendered as a 19th-century steel engraving. Foxing stains, worn
corners, desaturated sepia world. The least "AI-looking" of the explored styles —
its texture depends on *linework*, not effects.

Where drifted renders differed from this spec, **this spec wins** (§8).

## 2 · Palette (sampled from the canonical render)

A sepia monochrome world with three muted color voices on top (genre, roles,
badge). Nothing saturated, ever.

| Token | Hex | Used for |
|---|---|---|
| `paper-ivory` | `#E8DCC2` | Stock base (center) |
| `paper-tan` | `#C9AE7E` | Stock edges — subtle radial age vignette toward corners |
| `sepia-ink` | `#3B2E1E` | Border engraving, art darks, credit names & points |
| `sepia-black` | `#2A2118` | Title strokes — the darkest value on the card |
| `sepia-mid` | `#7A6A50` | Crosshatch mid-tones, year, flourish shading |
| `verdigris` | `#6F8F8C` | Deep Cut badge fill (aged-copper feel) |
| Genre / role colors | contract §3–4, **muted column** | pips only |

## 3 · Paper & texture recipe

- Aged ivory stock with a **radial age vignette**: `paper-ivory` center →
  `paper-tan` at the corners. Fine paper grain throughout.
- **Foxing:** 3–6 soft irregular blotches, low opacity, random per card —
  **never** overlapping the art window, title, or credit rows (QA check).
- **Wear:** softly worn/darkened corners; tiny deckle chips allowed on the outer
  edge; no torn-through damage, no creases across text.
- All illustration is **line**: etching and crosshatch. No flat fills in the art,
  no gradients except the paper vignette.

## 4 · Border chrome (geometry on the 1000 × 1333 grid)

| Element | Spec |
|---|---|
| Outer rule | 6-unit `sepia-ink` rule inset 34 from every edge, corners rounded 20 |
| Inner rule | 3-unit rule inset 58, same radius |
| Corner scrollwork | Art Nouveau engraved scroll blocks ≤ 180 × 180 in each corner, joining the two rules |
| Side flourishes | One small engraved flourish centered on each side between the rules, ≤ 120 long |
| Content area | Everything else lives inside x/y 70 → 930/1263; border art never crosses this line |

The border is **the same engraving on every card** — it is chrome, not art. Only
the foxing placement varies per card.

## 5 · Zone dressing (positions from the contract)

| Zone | Style C treatment |
|---|---|
| Genre roundel | Engraved double-line circle ⌀ 116 centered (150, 155); inside it the genre shape, filled with the **muted** genre color over fine hatching; nothing else inside |
| Title | ALL CAPS **Victorian display serif** (Tuscan feel: spurred serifs, slight flare), `sepia-black`, left x 240, baseline y 185. ≤ 11 chars: cap-height 84. 12–22 chars: two lines cap-height 60, block y 90–230. > 22: two lines 52. Small engraved leaf flourishes may bracket a one-line title — identical flourishes every card |
| Year | Lining serif figures cap-height 52, `sepia-mid`, right-aligned x 930, baseline y 185 |
| Art frame | Double engraved rule (4 then 2 units, 8 apart) around the contract window (x 160→840, y 290→902), corners r 20 with a small engraved rosette at each corner |
| Deep Cut badge | Circle ⌀ 120 at (750, 810), `verdigris` fill with hatched shading, `paper-ivory` double ring, "Deep" in engraved script over "CUT" in small caps |
| Credit rows | Per contract alignment (pips x 190, names x 260, points right x 810). Pips 44: role shape filled with muted role color over hatching. Names old-style serif 52 `sepia-ink`. Points "+1"/"+2" same serif, right-aligned. Plain rows — **no capsule boxes** |

## 6 · Typography

| Slot | Face (feel) | Case | Notes |
|---|---|---|---|
| Title | Victorian/Tuscan display serif (Rye / Cinzel Decorative feel) | ALL CAPS | Ornate but must survive the thumbnail squint test |
| Year | Old-style lining serif | Figures | Quieter than the title by two steps |
| Credits & points | Old-style serif (IM Fell / Playfair feel), medium-bold | Title Case | Legibility beats ornament here — no swashes |
| Badge | Engraved script + small caps | Mixed | Matches the reference render |

## 7 · Art treatment (how the movie brief renders in C)

Take the movie block's `art` brief and render it as a **monochrome steel
engraving**: fine parallel-line and crosshatch shading in `sepia-ink` on the paper
tone, like a 19th-century newspaper cut. Dramatic values — deep hatched darks
against open paper lights. Hero subject at 55–70 % of window height per the
contract's composition template; same brief, same composition as the movie's A
card, different medium. Weather and light do the mood work (storm hatching, moon
glow as reserved paper). Strictly no color inside the window — color belongs to
the pips and badge only.

## 8 · Known drifts — reject on sight

Observed in the June 23 exploration; all fail QA:

1. **Oval / vignette art frame** — the window is rectangular, fixed size, always.
2. Credit rows inside engraved capsule boxes.
3. Genre *word* inside the roundel (the roundel holds the shape glyph only).
4. "Deep Cut" as text floating inside the art instead of the badge.
5. Saturated color anywhere; color inside the art window.
6. Title set in a clean modern serif (loses the era) or an unreadable blackletter.
7. Foxing stains over text or art; torn/creased paper damage.
8. Labels or captions under/inside the card image.

## 9 · Generation prompt template

Paste verbatim into Stitch or Claude Design. Fill only the `{{SLOTS}}` from the
movie block. Do not reword between cards.

```
Design ONE mobile game card FRONT for the movie-connection card game "Marquee."
This is one card of a large matched set: the LAYOUT below is a fixed template and
must be followed exactly; only the movie content changes between cards. Portrait
3:4 card at high resolution on a dark walnut table. Output the single card only —
no labels, no captions, no extra cards.

STYLE — "SILENT ERA" (antique engraving on aged paper):
Early-cinema print ephemera: an antique playbill on aged ivory paper (#E8DCC2
center, aging toward #C9AE7E at the corners) with fine paper grain, three to six
soft foxing stains kept away from all text and artwork, and gently worn corners.
The entire card is wrapped in an ornate engraved Art Nouveau border: an outer and
inner sepia rule (#3B2E1E) with scrollwork corner blocks and one small flourish
centered on each side — the same border every card. Everything is rendered as
etched linework; no flat fills, no gradients, no saturated color.

HEADER (inside the border, top):
At the top-left, an engraved double-line circular roundel containing only the
GENRE glyph — a {{GENRE_SHAPE}} filled with muted {{GENRE_COLOR_NAME}}
({{GENRE_MUTED_HEX}}) over fine hatching. To its right, "{{TITLE}}" in large
ornate Victorian display-serif capitals in near-black sepia (#2A2118), readable
even when the card is overlapped in a fanned hand. The year "{{YEAR}}" in smaller
sepia serif figures, right-aligned on the same line.

ART WINDOW (fixed size — identical on every card in the set):
A RECTANGULAR framed window — never an oval — centered below the header, spanning
most of the card's width down to about two-thirds of the card, framed by a double
engraved rule with a small rosette at each corner. Inside, an ORIGINAL symbolic
STEEL-ENGRAVING illustration: monochrome sepia crosshatch and etched linework like
a 19th-century newspaper cut, dramatic darks against open paper. NO people, NO
faces, NO logos, NO readable text, nothing copied from a real poster or still.
  Subject: {{ART_SUBJECT}}
  Setting: {{ART_SETTING}}
  Mood / light: {{ART_MOOD}}
  One accent element: {{ART_ACCENT}}
  Composition: {{ART_COMPOSITION_SENTENCE}}
{{DEEP_CUT_LINE}}

CREDITS (bottom block, aligned to the art window's edges):
{{CREDIT_COUNT}} plain scored rows — no boxes or capsules — top to bottom:
{{CREDIT_ROWS}}
Each row: a small engraved role glyph on the left (actor = muted slate-blue
#6E8190 circle, director = muted brown #8A6A3C square), the name in a sturdy
old-style serif in sepia ink, and the point value in the same serif right-aligned
at the row's far right.

Texture is the headline requirement: the engraving crosshatch and aged-paper feel
must be unmistakable even at thumbnail size, like genuine Victorian print
ephemera. Professional collectible card game finish.
```

### Slot key

| Slot | From movie block | Example (Titanic) |
|---|---|---|
| `{{TITLE}}` / `{{YEAR}}` | `title`, `year` | `TITANIC`, `1997` |
| `{{GENRE_SHAPE}}` | taxonomy shape | `heart` (Titanic = Romance in the DB) |
| `{{GENRE_COLOR_NAME}}` / `{{GENRE_MUTED_HEX}}` | taxonomy color (muted) | `rose`, `#B06A6A` |
| `{{ART_*}}` | `art` fields | same brief as the movie's A card |
| `{{ART_COMPOSITION_SENTENCE}}` | template → sentence | identical sentence to spec A's slot key |
| `{{DEEP_CUT_LINE}}` | `deepCut` | true → `A circular "Deep Cut" badge — muted verdigris (#6F8F8C) fill with hatched shading, ivory double ring, "Deep" in engraved script over "CUT" in small caps — sits inside the window near its bottom-right corner.` · false → *(omit the line entirely)* |
| `{{CREDIT_COUNT}}` / `{{CREDIT_ROWS}}` | `credits` | `THREE` / `Leonardo DiCaprio (actor, slate circle) +1` … one per line |
