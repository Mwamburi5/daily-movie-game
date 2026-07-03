# Marquee · Card Template Contract

> The movie-independent layer of the card system. Every card in the set — whether
> rendered in style **A · Repertory Ticket** or **C · Silent Era** — obeys this
> contract exactly. The style specs (`card-spec-A-repertory-ticket.md`,
> `card-spec-C-silent-era.md`) define *how* each zone is dressed; this file defines
> *where everything lives* and *what data flows in*. Swap the movie block, keep the
> design. Built to scale to 200–400 movies.
>
> **Last updated:** 2026-07-03 · Companion to `card-design-system.md` (the seven
> rules still govern) and RULEBOOK.md (scoring).

---

## 1 · Master canvas

| Property | Value |
|---|---|
| Unit canvas | **1000 × 1333** units (exactly 3:4 portrait) |
| Generation resolution | 1536 × 2048 px (same 3:4; scale all units × 1.536) |
| Corner radius | 36 units, all four corners (die-cut look, never square) |
| Table background | Generate on a dark walnut table so the die-cut silhouette reads; crop to card for game assets |

All coordinates below are in canvas units on the 1000 × 1333 grid,
`(x from left, y from top)`.

## 2 · Shared zone map

The five zones sit at the same vertical positions in both styles. **The art window
is the same size in both styles and on every single card — no exceptions.** This is
what makes 400 cards read as one deck.

| Zone | Y-range | Contents |
|---|---|---|
| Header | 60 – 240 | genre pip/roundel · title · year |
| **Art window** | **290 – 902** | key art in the style's frame |
| Deep Cut badge | inside window, bottom-right | conditional (see §5) |
| Credits | 950 – 1250 | 2–4 scored connect-credit rows |
| Chrome margin | edges | style-specific (ticket stub / engraved border) |

### The art window (immutable)

| Property | Value |
|---|---|
| Size | **680 wide × 612 tall** (aspect 10:9) — identical on every card, both styles |
| Position, style A | x **270 → 950** (body sits right of the ticket stub) |
| Position, style C | x **160 → 840** (centered inside the engraved border) |
| Bleed | Art fills the window edge-to-edge; no letterboxing, no internal captions |

The art itself is a **new illustration per movie**, but its window never moves,
never resizes, and never changes shape (rectangular with the style's frame — the
oval vignette seen in one Silent Era render is **rejected**; it breaks size parity).

### Credit rows (aligned to the window, not the card)

So both styles line up identically despite different margins:

| Property | Rule |
|---|---|
| Role pip x | window-left + 30 (A: 300 · C: 190) |
| Name x | window-left + 100 (A: 370 · C: 260) |
| Points | right-aligned to window-right − 30 (A: 920 · C: 810) |
| 2–3 credits | row centers at y 990, 1086, 1182 (pitch 96) |
| 4 credits | row centers at y 975, 1059, 1143, 1227 (pitch 84) |
| Pip size | 44 × 44 |

## 3 · Locked genre taxonomy (color + shape, always double-coded)

**Realigned 2026-07-03 to the game database.** `src/data/movies.ts` carries 11
genres and already defines the in-game color language (`posterColor` families:
crime reds, thriller plums, sci-fi navies, action slates, drama bronzes, war
olives, adventure greens, comedy teals, animation blues, western sienna, romance
rose). Cards use the same families so players learn one genre→color mapping. The
earlier 8-genre table (drama-teal etc.) is superseded — it predated the DB check
and was missing Crime, War, Adventure, and Western.

Full-saturation values are used by style A and by the React UI. Style C uses the
muted column (engraved sepia world; same shapes). Ink name is how prompts refer
to the color in words.

| Genre (DB spelling) | Shape | Ink name | Full (A) | Muted (C) |
|---|---|---|---|---|
| Crime | Diamond | deep red | `#A02C2C` | `#7E3A34` |
| Thriller | Square | plum | `#5C4A78` | `#5A5068` |
| Sci-Fi | Triangle | navy | `#33518F` | `#4A5A78` |
| Action | Chevron | slate | `#5B6B7A` | `#5C6670` |
| Drama | Circle | bronze | `#A87B3E` | `#8A6A44` |
| War | Hexagon | olive | `#77743F` | `#6C6845` |
| Adventure | Pentagon | jungle green | `#3E8A5A` | `#567553` |
| Comedy | Star | teal | `#2E8C94` | `#4E7F7C` |
| Animation | Rounded square | sky blue | `#3F86C8` | `#5A7A96` |
| Western | Shield | sienna | `#A0623A` | `#855640` |
| Romance | Heart | rose | `#D4708C` | `#B06A6A` |
| Horror *(reserved — no films yet)* | Crescent | violet | `#7C5AA6` | `#6E5A7E` |

**The genre pip is a plain filled shape.** No stars inside circles, no words inside
the pip (both drifts observed in Stitch renders — reject them).

> Note: the June 23 prototype renders show Titanic with a teal circle (assumed
> Drama). The DB says Titanic is **Romance** → rose heart. The reference renders
> remain valid for style/texture, not for that pip.

## 4 · Role glyphs (credit rows)

| Role | Shape | Full (A) | Muted (C) | Points |
|---|---|---|---|---|
| Actor | Circle | `#2C89A1` | `#6E8190` | +1 |
| Director | Square | `#CF952A` | `#8A6A3C` | +2 |
| Writer *(reserved)* | Triangle | `#7C5AA6` | `#7E5A6E` | +2 |

Points come from RULEBOOK.md scoring. If scoring ever changes, this table changes
in the same pass (see CLAUDE.md guardrails).

## 5 · Deep Cut badge (conditional!)

Only cards flagged `deepCut: true` carry the badge. The generation prompts must
include or omit it per card — the Stitch exploration put it on every card because
the prompts always asked for it; that is not the rule.

| Property | Value |
|---|---|
| Shape | Circle, diameter 120 |
| Position | window-right − 90, window-bottom − 92 → A: (860, 810) · C: (750, 810) |
| Text | "DEEP CUT" on two lines (style-specific lettering) |

## 6 · The movie block (data contract)

One block per movie. This is the **only** thing that changes between cards of the
same style. Source of truth should be generated from the same movie DB the game
uses (`src/lib/`), never hand-retyped.

```json
{
  "id": "titanic-1997",
  "title": "TITANIC",
  "year": 1997,
  "genre": "Romance",
  "credits": [
    { "name": "Leonardo DiCaprio", "role": "actor",    "points": 1 },
    { "name": "Kate Winslet",      "role": "actor",    "points": 1 },
    { "name": "James Cameron",     "role": "director", "points": 2 }
  ],
  "deepCut": true,
  "art": {
    "subject": "a grand four-funnel ocean liner, low three-quarter angle",
    "setting": "moonlit open ocean at night, calm water, glowing portholes",
    "mood": "grand, serene, quietly doomed",
    "accent": "huge crescent moon behind the funnels",
    "composition": "hero-left-diagonal"
  }
}
```

### Validation rules (run before any batch)

- `title`: render in ALL CAPS. ≤ 11 chars → one line; 12–22 chars → two lines;
  \> 22 chars → two lines at reduced size (see style specs). Never abbreviate.
- `credits`: 2–4 entries; names ≤ 22 characters (longer → use the billing-name
  short form, e.g. "Daniel Day-Lewis" not full legal names).
- `genre`: must be one of the eight locked genres.
- `art.composition`: must be one of the three templates in §7.

## 7 · Art brief rules (what keeps 400 windows consistent)

Every `art` block describes an **original, symbolic illustration**. Non-negotiable:

- **Never**: real posters, film stills, studio logos, custom title-treatment fonts,
  actor likenesses, faces, or readable in-art text of any kind.
- **Always**: evoke the film through setting, objects, weather, mood, and color.

### Composition templates (pick exactly one per movie)

All three share the same skeleton so windows rhyme across the deck: one hero
subject at 55–70 % of window height, a ground/horizon band in the lower third,
sky or backdrop above, exactly one accent element.

| Template | Hero placement | Use when |
|---|---|---|
| `hero-center` | Centered, facing viewer | Iconic single objects (a house, a car, a mask) |
| `hero-left-diagonal` | Lower-left, moving/facing up-right | Vehicles, creatures, journeys |
| `hero-right-diagonal` | Lower-right, moving/facing up-left | Use to vary a run of same-genre cards |

The brief's four fields map 1:1 into the prompt template: `subject` (the hero),
`setting` (the band + backdrop), `mood` (lighting words), `accent` (the one extra
element). Resist adding a fifth idea — at fan size it turns to mud
(`card-design-system.md` rule 4).

## 8 · Generation protocol (Stitch / Claude Design)

Evidence from the June 23 exploration: the 2-card board rendered on-spec, the
3-card boards drifted mildly, the 4-card board broke the layout badly. Therefore:

1. **One card per generation. Never batch cards into one image.**
2. Paste the style spec's prompt template **verbatim** — same wording every run;
   only the `{{SLOT}}` values change. Prompt wording is part of the design system.
3. One style per working session (all-A batch, then all-C batch); don't interleave.
4. In Stitch, keep one project per style so `generate_variants` re-rolls stay
   style-pure. Upload the style spec via `upload_design_md` / DESIGN.md so the
   project's design system reinforces the prompt.
5. Output: 1536 × 2048, fronts only, no board, no labels under the card.

### Batch cadence (matches the pilot plan)

- **Pilot 1:** 10 movies × both styles (20 images). Review against the QA
  checklist. Fix the *prompt template*, never individual wording, then…
- **Pilot 2:** next 20 movies. If ≥ 90 % pass QA without retouch, the template is
  production-ready for the 200–400 run.
- Log every rejected render and its drift in `design/drift-ledger.md` (create on
  first reject). Recurring drift = fix the template, not the card.

### QA checklist (every card, ~30 seconds each)

1. Art window edges exactly at spec (overlay the zone map at 25 % opacity).
2. Title legible at 15 % scale (thumbnail test — shrink and squint).
3. Genre pip: correct shape AND color, plain fill, hard in the top-left.
4. Year present top-right, correct.
5. Credit rows match the movie block: names, order, pips, points.
6. Deep Cut badge present **iff** `deepCut: true`, at spec position.
7. No faces, no people, no logos, no readable text inside the art.
8. Palette compliance (style spec §palette) — no rogue colors.
9. Texture unmistakable at thumbnail (halftone grain / engraving hatch).
10. No stray chrome: no labels, no drop shadows outside the card, no watermarks.

## 9 · Reserved (out of scope for the pilot)

- **Wild cards (×3)** and **powers** (Final Cut, Recast) — need their own frame
  treatment; do not improvise them from the movie template.
- **Deck back / flip back** — see `card-design-system.md` rule 6; separate spec.
- **International clusters** — content phase; the template already carries any
  title/credits that pass §6 validation.
