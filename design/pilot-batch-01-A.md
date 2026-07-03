# Marquee · Pilot Batch 01 — Repertory Ticket prompts

> **12 paste-ready generation prompts**, one per movie, for style **A · Repertory Ticket (screen-print)**.
> Movie facts pulled from `src/data/movies.ts` (credits = top-2 billed cast +1 each,
> director +2, per RULEBOOK scoring; `deepCut` = the film has hidden deep-billed
> credits). Spec: `card-spec-A-repertory-ticket.md` · shared rules: `card-template-contract.md`.
>
> **How to use (Stitch or Claude Design):** copy ONE prompt block per generation —
> never batch cards into one image. Generate at 1536 × 2048 (3:4). Check each
> result against the contract's 10-point QA checklist; if a render drifts,
> re-generate — if the same drift repeats across movies, fix the template in the
> spec file (then regenerate this file), never hand-edit a single prompt.
>
> Pilot coverage: all 11 database genres · two-line titles (13–19 chars) · one
> >22-char title (Shawshank) · one 4-credit card (The Godfather) · two cards with
> NO Deep Cut badge (Catch Me If You Can, Unforgiven) · three series films
> (Godfather, Dark Knight, Toy Story — series markers are not yet in the card spec;
> they render as normal cards for now).
>
> Note: the June 23 prototype rendered Titanic with a teal circle (assumed Drama);
> the database says Romance → rose heart. These prompts follow the database.
>
> Generated 2026-07-03 by `scripts/gen-pilot-cards.py` from the spec templates — do not hand-edit;
> regenerate instead.

---

## 01 · GOODFELLAS (1990) — Crime · deep cut: yes

**Movie block:**

```json
{
  "id": "goodfellas",
  "title": "GOODFELLAS",
  "year": 1990,
  "genre": "Crime",
  "credits": [
    {
      "name": "Robert De Niro",
      "role": "actor",
      "points": 1
    },
    {
      "name": "Ray Liotta",
      "role": "actor",
      "points": 1
    },
    {
      "name": "Martin Scorsese",
      "role": "director",
      "points": 2
    }
  ],
  "deepCut": true,
  "art": {
    "subject": "a chrome-trimmed diner booth table set with a whiskey tumbler, an ashtray, and a snub-nosed revolver",
    "setting": "a late-night city diner window, venetian blinds half open, neon signs glowing on the wet street outside",
    "mood": "sharp, glamorous, dangerous",
    "accent": "a banded stack of cash beside the ashtray",
    "composition": "hero-center"
  }
}
```

**Prompt (copy everything inside the fence):**

```
Design ONE mobile game card FRONT for the movie-connection card game "Marquee."
This is one card of a large matched set: the LAYOUT below is a fixed template and
must be followed exactly; only the movie content changes between cards. Portrait
3:4 card at high resolution on a dark walnut table. Output the single card only —
no labels, no captions, no extra cards.

STYLE — "REPERTORY TICKET" (screen-print):
A vintage repertory-cinema admission ticket, silkscreen-printed. Matte cream
uncoated paper (#F0EBD8). STRICT five-color limit: cream paper, navy ink
(#1F3A52), deep red ink (#A02C2C), a deeper shade of that same
ink for shadows, and amber (#CF952A) as at most one small accent. Visible halftone
dot grain in all inked areas, slight ink misregistration, chunky flat shapes, no
gradients, no photo texture. Die-cut silhouette: rounded corners plus one
semicircular tear notch centered on the top edge and one on the bottom edge.

TICKET STUB (left edge):
A vertical perforated line of punched holes about a quarter in from the left edge,
running the full height. Left of it: the GENRE PIP at the top — a plain filled
diamond in #A02C2C, nothing drawn inside it — then a solid
vertical deep red bar, then "ADMIT ONE" reading vertically in small
letterspaced navy caps near the bottom.

HEADER (right of the stub):
"GOODFELLAS" in very large bold condensed slab-serif navy capitals, left-aligned,
readable even when the card is overlapped in a fanned hand. The year "1990" in
smaller navy slab figures, right-aligned on the same line. A thin navy rule under
the header.

ART WINDOW (fixed size — identical on every card in the set):
A rectangular framed window spanning the full width right of the stub, from just
below the header rule to about two-thirds down the card, with a 10-unit navy frame,
gently rounded corners, and a thin cream inner keyline. Inside, an ORIGINAL
symbolic screen-print illustration — flat chunky shapes in the card's five inks
with halftone tonal steps. NO people, NO faces, NO logos, NO readable text, nothing
copied from a real poster or still.
  Subject: a chrome-trimmed diner booth table set with a whiskey tumbler, an ashtray, and a snub-nosed revolver
  Setting: a late-night city diner window, venetian blinds half open, neon signs glowing on the wet street outside
  Mood / light: sharp, glamorous, dangerous
  One accent element: a banded stack of cash beside the ashtray
  Composition: the hero subject sits centered, facing the viewer, filling about two-thirds of the window height, with the setting band across the lower third and the backdrop above
A circular "DEEP CUT" badge — deep deep red fill, cream ring and cream caps on two lines — sits inside the window near its bottom-right corner.

CREDITS (bottom block, aligned to the art window's edges):
THREE scored rows, top to bottom:
Robert De Niro (actor, blue circle) +1
Ray Liotta (actor, blue circle) +1
Martin Scorsese (director, amber square) +2
Each row: a small flat role glyph on the left (actor = blue #2C89A1 circle,
director = amber #CF952A square), the name in bold navy geometric sans, and the
point value in bold navy right-aligned at the row's far right. Plain rows — no
underlines, no boxes, no repeated glyphs on the right.

Texture is the headline requirement: the silkscreen halftone grain and flat spot
inks must be unmistakable even at thumbnail size. Professional collectible card
game finish.
```

## 02 · THE GODFATHER (1972) — Crime · deep cut: yes

**Movie block:**

```json
{
  "id": "the-godfather",
  "title": "THE GODFATHER",
  "year": 1972,
  "genre": "Crime",
  "credits": [
    {
      "name": "Marlon Brando",
      "role": "actor",
      "points": 1
    },
    {
      "name": "Al Pacino",
      "role": "actor",
      "points": 1
    },
    {
      "name": "James Caan",
      "role": "actor",
      "points": 1
    },
    {
      "name": "Francis Ford Coppola",
      "role": "director",
      "points": 2
    }
  ],
  "deepCut": true,
  "art": {
    "subject": "a high-backed leather desk chair, empty, behind a heavy carved wooden desk",
    "setting": "a dark wood-paneled study with thin slatted light through closed blinds, a crystal decanter and a fedora on the desk",
    "mood": "hushed, powerful, funereal",
    "accent": "a single red rose lying on the desk blotter",
    "composition": "hero-center"
  }
}
```

**Prompt (copy everything inside the fence):**

```
Design ONE mobile game card FRONT for the movie-connection card game "Marquee."
This is one card of a large matched set: the LAYOUT below is a fixed template and
must be followed exactly; only the movie content changes between cards. Portrait
3:4 card at high resolution on a dark walnut table. Output the single card only —
no labels, no captions, no extra cards.

STYLE — "REPERTORY TICKET" (screen-print):
A vintage repertory-cinema admission ticket, silkscreen-printed. Matte cream
uncoated paper (#F0EBD8). STRICT five-color limit: cream paper, navy ink
(#1F3A52), deep red ink (#A02C2C), a deeper shade of that same
ink for shadows, and amber (#CF952A) as at most one small accent. Visible halftone
dot grain in all inked areas, slight ink misregistration, chunky flat shapes, no
gradients, no photo texture. Die-cut silhouette: rounded corners plus one
semicircular tear notch centered on the top edge and one on the bottom edge.

TICKET STUB (left edge):
A vertical perforated line of punched holes about a quarter in from the left edge,
running the full height. Left of it: the GENRE PIP at the top — a plain filled
diamond in #A02C2C, nothing drawn inside it — then a solid
vertical deep red bar, then "ADMIT ONE" reading vertically in small
letterspaced navy caps near the bottom.

HEADER (right of the stub):
"THE GODFATHER" in very large bold condensed slab-serif navy capitals, left-aligned,
readable even when the card is overlapped in a fanned hand. The year "1972" in
smaller navy slab figures, right-aligned on the same line. A thin navy rule under
the header.

ART WINDOW (fixed size — identical on every card in the set):
A rectangular framed window spanning the full width right of the stub, from just
below the header rule to about two-thirds down the card, with a 10-unit navy frame,
gently rounded corners, and a thin cream inner keyline. Inside, an ORIGINAL
symbolic screen-print illustration — flat chunky shapes in the card's five inks
with halftone tonal steps. NO people, NO faces, NO logos, NO readable text, nothing
copied from a real poster or still.
  Subject: a high-backed leather desk chair, empty, behind a heavy carved wooden desk
  Setting: a dark wood-paneled study with thin slatted light through closed blinds, a crystal decanter and a fedora on the desk
  Mood / light: hushed, powerful, funereal
  One accent element: a single red rose lying on the desk blotter
  Composition: the hero subject sits centered, facing the viewer, filling about two-thirds of the window height, with the setting band across the lower third and the backdrop above
A circular "DEEP CUT" badge — deep deep red fill, cream ring and cream caps on two lines — sits inside the window near its bottom-right corner.

CREDITS (bottom block, aligned to the art window's edges):
FOUR scored rows, top to bottom:
Marlon Brando (actor, blue circle) +1
Al Pacino (actor, blue circle) +1
James Caan (actor, blue circle) +1
Francis Ford Coppola (director, amber square) +2
Each row: a small flat role glyph on the left (actor = blue #2C89A1 circle,
director = amber #CF952A square), the name in bold navy geometric sans, and the
point value in bold navy right-aligned at the row's far right. Plain rows — no
underlines, no boxes, no repeated glyphs on the right.

Texture is the headline requirement: the silkscreen halftone grain and flat spot
inks must be unmistakable even at thumbnail size. Professional collectible card
game finish.
```

## 03 · TAXI DRIVER (1976) — Thriller · deep cut: yes

**Movie block:**

```json
{
  "id": "taxi-driver",
  "title": "TAXI DRIVER",
  "year": 1976,
  "genre": "Thriller",
  "credits": [
    {
      "name": "Robert De Niro",
      "role": "actor",
      "points": 1
    },
    {
      "name": "Jodie Foster",
      "role": "actor",
      "points": 1
    },
    {
      "name": "Martin Scorsese",
      "role": "director",
      "points": 2
    }
  ],
  "deepCut": true,
  "art": {
    "subject": "a 1970s yellow checker taxi cab with its headlights on",
    "setting": "a rain-slicked midtown street at night, steam rising from a manhole, blurred theater marquees far behind",
    "mood": "restless, feverish, lonely",
    "accent": "a cloud of white steam swallowing the rear wheels",
    "composition": "hero-left-diagonal"
  }
}
```

**Prompt (copy everything inside the fence):**

```
Design ONE mobile game card FRONT for the movie-connection card game "Marquee."
This is one card of a large matched set: the LAYOUT below is a fixed template and
must be followed exactly; only the movie content changes between cards. Portrait
3:4 card at high resolution on a dark walnut table. Output the single card only —
no labels, no captions, no extra cards.

STYLE — "REPERTORY TICKET" (screen-print):
A vintage repertory-cinema admission ticket, silkscreen-printed. Matte cream
uncoated paper (#F0EBD8). STRICT five-color limit: cream paper, navy ink
(#1F3A52), plum ink (#5C4A78), a deeper shade of that same
ink for shadows, and amber (#CF952A) as at most one small accent. Visible halftone
dot grain in all inked areas, slight ink misregistration, chunky flat shapes, no
gradients, no photo texture. Die-cut silhouette: rounded corners plus one
semicircular tear notch centered on the top edge and one on the bottom edge.

TICKET STUB (left edge):
A vertical perforated line of punched holes about a quarter in from the left edge,
running the full height. Left of it: the GENRE PIP at the top — a plain filled
square in #5C4A78, nothing drawn inside it — then a solid
vertical plum bar, then "ADMIT ONE" reading vertically in small
letterspaced navy caps near the bottom.

HEADER (right of the stub):
"TAXI DRIVER" in very large bold condensed slab-serif navy capitals, left-aligned,
readable even when the card is overlapped in a fanned hand. The year "1976" in
smaller navy slab figures, right-aligned on the same line. A thin navy rule under
the header.

ART WINDOW (fixed size — identical on every card in the set):
A rectangular framed window spanning the full width right of the stub, from just
below the header rule to about two-thirds down the card, with a 10-unit navy frame,
gently rounded corners, and a thin cream inner keyline. Inside, an ORIGINAL
symbolic screen-print illustration — flat chunky shapes in the card's five inks
with halftone tonal steps. NO people, NO faces, NO logos, NO readable text, nothing
copied from a real poster or still.
  Subject: a 1970s yellow checker taxi cab with its headlights on
  Setting: a rain-slicked midtown street at night, steam rising from a manhole, blurred theater marquees far behind
  Mood / light: restless, feverish, lonely
  One accent element: a cloud of white steam swallowing the rear wheels
  Composition: the hero subject sits lower-left, angled up and to the right, filling about two-thirds of the window height, with the setting band behind it and open sky above
A circular "DEEP CUT" badge — deep plum fill, cream ring and cream caps on two lines — sits inside the window near its bottom-right corner.

CREDITS (bottom block, aligned to the art window's edges):
THREE scored rows, top to bottom:
Robert De Niro (actor, blue circle) +1
Jodie Foster (actor, blue circle) +1
Martin Scorsese (director, amber square) +2
Each row: a small flat role glyph on the left (actor = blue #2C89A1 circle,
director = amber #CF952A square), the name in bold navy geometric sans, and the
point value in bold navy right-aligned at the row's far right. Plain rows — no
underlines, no boxes, no repeated glyphs on the right.

Texture is the headline requirement: the silkscreen halftone grain and flat spot
inks must be unmistakable even at thumbnail size. Professional collectible card
game finish.
```

## 04 · INCEPTION (2010) — Sci-Fi · deep cut: yes

**Movie block:**

```json
{
  "id": "inception",
  "title": "INCEPTION",
  "year": 2010,
  "genre": "Sci-Fi",
  "credits": [
    {
      "name": "Leonardo DiCaprio",
      "role": "actor",
      "points": 1
    },
    {
      "name": "Joseph Gordon-Levitt",
      "role": "actor",
      "points": 1
    },
    {
      "name": "Christopher Nolan",
      "role": "director",
      "points": 2
    }
  ],
  "deepCut": true,
  "art": {
    "subject": "a city block of skyscrapers folding upward and over itself like a closing book",
    "setting": "a dream-lit sky where the street curls overhead, window grids catching low golden sun",
    "mood": "impossible, precise, vertiginous",
    "accent": "a tiny spinning top standing on the empty street below",
    "composition": "hero-center"
  }
}
```

**Prompt (copy everything inside the fence):**

```
Design ONE mobile game card FRONT for the movie-connection card game "Marquee."
This is one card of a large matched set: the LAYOUT below is a fixed template and
must be followed exactly; only the movie content changes between cards. Portrait
3:4 card at high resolution on a dark walnut table. Output the single card only —
no labels, no captions, no extra cards.

STYLE — "REPERTORY TICKET" (screen-print):
A vintage repertory-cinema admission ticket, silkscreen-printed. Matte cream
uncoated paper (#F0EBD8). STRICT five-color limit: cream paper, navy ink
(#1F3A52), navy ink (#33518F), a deeper shade of that same
ink for shadows, and amber (#CF952A) as at most one small accent. Visible halftone
dot grain in all inked areas, slight ink misregistration, chunky flat shapes, no
gradients, no photo texture. Die-cut silhouette: rounded corners plus one
semicircular tear notch centered on the top edge and one on the bottom edge.

TICKET STUB (left edge):
A vertical perforated line of punched holes about a quarter in from the left edge,
running the full height. Left of it: the GENRE PIP at the top — a plain filled
triangle in #33518F, nothing drawn inside it — then a solid
vertical navy bar, then "ADMIT ONE" reading vertically in small
letterspaced navy caps near the bottom.

HEADER (right of the stub):
"INCEPTION" in very large bold condensed slab-serif navy capitals, left-aligned,
readable even when the card is overlapped in a fanned hand. The year "2010" in
smaller navy slab figures, right-aligned on the same line. A thin navy rule under
the header.

ART WINDOW (fixed size — identical on every card in the set):
A rectangular framed window spanning the full width right of the stub, from just
below the header rule to about two-thirds down the card, with a 10-unit navy frame,
gently rounded corners, and a thin cream inner keyline. Inside, an ORIGINAL
symbolic screen-print illustration — flat chunky shapes in the card's five inks
with halftone tonal steps. NO people, NO faces, NO logos, NO readable text, nothing
copied from a real poster or still.
  Subject: a city block of skyscrapers folding upward and over itself like a closing book
  Setting: a dream-lit sky where the street curls overhead, window grids catching low golden sun
  Mood / light: impossible, precise, vertiginous
  One accent element: a tiny spinning top standing on the empty street below
  Composition: the hero subject sits centered, facing the viewer, filling about two-thirds of the window height, with the setting band across the lower third and the backdrop above
A circular "DEEP CUT" badge — deep navy fill, cream ring and cream caps on two lines — sits inside the window near its bottom-right corner.

CREDITS (bottom block, aligned to the art window's edges):
THREE scored rows, top to bottom:
Leonardo DiCaprio (actor, blue circle) +1
Joseph Gordon-Levitt (actor, blue circle) +1
Christopher Nolan (director, amber square) +2
Each row: a small flat role glyph on the left (actor = blue #2C89A1 circle,
director = amber #CF952A square), the name in bold navy geometric sans, and the
point value in bold navy right-aligned at the row's far right. Plain rows — no
underlines, no boxes, no repeated glyphs on the right.

Texture is the headline requirement: the silkscreen halftone grain and flat spot
inks must be unmistakable even at thumbnail size. Professional collectible card
game finish.
```

## 05 · THE DARK KNIGHT (2008) — Action · deep cut: yes

**Movie block:**

```json
{
  "id": "the-dark-knight",
  "title": "THE DARK KNIGHT",
  "year": 2008,
  "genre": "Action",
  "credits": [
    {
      "name": "Christian Bale",
      "role": "actor",
      "points": 1
    },
    {
      "name": "Heath Ledger",
      "role": "actor",
      "points": 1
    },
    {
      "name": "Christopher Nolan",
      "role": "director",
      "points": 2
    }
  ],
  "deepCut": true,
  "art": {
    "subject": "a lone searchlight beam cutting up from a rooftop into low night clouds",
    "setting": "a rain-glazed high-rise skyline at night seen from above, windows lit in scattered grids",
    "mood": "brooding, monumental, on edge",
    "accent": "a handful of playing cards fluttering off the rooftop edge",
    "composition": "hero-right-diagonal"
  }
}
```

**Prompt (copy everything inside the fence):**

```
Design ONE mobile game card FRONT for the movie-connection card game "Marquee."
This is one card of a large matched set: the LAYOUT below is a fixed template and
must be followed exactly; only the movie content changes between cards. Portrait
3:4 card at high resolution on a dark walnut table. Output the single card only —
no labels, no captions, no extra cards.

STYLE — "REPERTORY TICKET" (screen-print):
A vintage repertory-cinema admission ticket, silkscreen-printed. Matte cream
uncoated paper (#F0EBD8). STRICT five-color limit: cream paper, navy ink
(#1F3A52), slate ink (#5B6B7A), a deeper shade of that same
ink for shadows, and amber (#CF952A) as at most one small accent. Visible halftone
dot grain in all inked areas, slight ink misregistration, chunky flat shapes, no
gradients, no photo texture. Die-cut silhouette: rounded corners plus one
semicircular tear notch centered on the top edge and one on the bottom edge.

TICKET STUB (left edge):
A vertical perforated line of punched holes about a quarter in from the left edge,
running the full height. Left of it: the GENRE PIP at the top — a plain filled
chevron in #5B6B7A, nothing drawn inside it — then a solid
vertical slate bar, then "ADMIT ONE" reading vertically in small
letterspaced navy caps near the bottom.

HEADER (right of the stub):
"THE DARK KNIGHT" in very large bold condensed slab-serif navy capitals, left-aligned,
readable even when the card is overlapped in a fanned hand. The year "2008" in
smaller navy slab figures, right-aligned on the same line. A thin navy rule under
the header.

ART WINDOW (fixed size — identical on every card in the set):
A rectangular framed window spanning the full width right of the stub, from just
below the header rule to about two-thirds down the card, with a 10-unit navy frame,
gently rounded corners, and a thin cream inner keyline. Inside, an ORIGINAL
symbolic screen-print illustration — flat chunky shapes in the card's five inks
with halftone tonal steps. NO people, NO faces, NO logos, NO readable text, nothing
copied from a real poster or still.
  Subject: a lone searchlight beam cutting up from a rooftop into low night clouds
  Setting: a rain-glazed high-rise skyline at night seen from above, windows lit in scattered grids
  Mood / light: brooding, monumental, on edge
  One accent element: a handful of playing cards fluttering off the rooftop edge
  Composition: the hero subject sits lower-right, angled up and to the left, filling about two-thirds of the window height, with the setting band behind it and open sky above
A circular "DEEP CUT" badge — deep slate fill, cream ring and cream caps on two lines — sits inside the window near its bottom-right corner.

CREDITS (bottom block, aligned to the art window's edges):
THREE scored rows, top to bottom:
Christian Bale (actor, blue circle) +1
Heath Ledger (actor, blue circle) +1
Christopher Nolan (director, amber square) +2
Each row: a small flat role glyph on the left (actor = blue #2C89A1 circle,
director = amber #CF952A square), the name in bold navy geometric sans, and the
point value in bold navy right-aligned at the row's far right. Plain rows — no
underlines, no boxes, no repeated glyphs on the right.

Texture is the headline requirement: the silkscreen halftone grain and flat spot
inks must be unmistakable even at thumbnail size. Professional collectible card
game finish.
```

## 06 · JURASSIC PARK (1993) — Adventure · deep cut: yes

**Movie block:**

```json
{
  "id": "jurassic-park",
  "title": "JURASSIC PARK",
  "year": 1993,
  "genre": "Adventure",
  "credits": [
    {
      "name": "Sam Neill",
      "role": "actor",
      "points": 1
    },
    {
      "name": "Laura Dern",
      "role": "actor",
      "points": 1
    },
    {
      "name": "Steven Spielberg",
      "role": "director",
      "points": 2
    }
  ],
  "deepCut": true,
  "art": {
    "subject": "a towering tyrannosaur silhouette, mid-roar",
    "setting": "a dusk jungle clearing behind a sagging electric fence line, an electric storm overhead",
    "mood": "awe, menace, wonder",
    "accent": "a single fork of lightning splitting the sky",
    "composition": "hero-left-diagonal"
  }
}
```

**Prompt (copy everything inside the fence):**

```
Design ONE mobile game card FRONT for the movie-connection card game "Marquee."
This is one card of a large matched set: the LAYOUT below is a fixed template and
must be followed exactly; only the movie content changes between cards. Portrait
3:4 card at high resolution on a dark walnut table. Output the single card only —
no labels, no captions, no extra cards.

STYLE — "REPERTORY TICKET" (screen-print):
A vintage repertory-cinema admission ticket, silkscreen-printed. Matte cream
uncoated paper (#F0EBD8). STRICT five-color limit: cream paper, navy ink
(#1F3A52), jungle green ink (#3E8A5A), a deeper shade of that same
ink for shadows, and amber (#CF952A) as at most one small accent. Visible halftone
dot grain in all inked areas, slight ink misregistration, chunky flat shapes, no
gradients, no photo texture. Die-cut silhouette: rounded corners plus one
semicircular tear notch centered on the top edge and one on the bottom edge.

TICKET STUB (left edge):
A vertical perforated line of punched holes about a quarter in from the left edge,
running the full height. Left of it: the GENRE PIP at the top — a plain filled
pentagon in #3E8A5A, nothing drawn inside it — then a solid
vertical jungle green bar, then "ADMIT ONE" reading vertically in small
letterspaced navy caps near the bottom.

HEADER (right of the stub):
"JURASSIC PARK" in very large bold condensed slab-serif navy capitals, left-aligned,
readable even when the card is overlapped in a fanned hand. The year "1993" in
smaller navy slab figures, right-aligned on the same line. A thin navy rule under
the header.

ART WINDOW (fixed size — identical on every card in the set):
A rectangular framed window spanning the full width right of the stub, from just
below the header rule to about two-thirds down the card, with a 10-unit navy frame,
gently rounded corners, and a thin cream inner keyline. Inside, an ORIGINAL
symbolic screen-print illustration — flat chunky shapes in the card's five inks
with halftone tonal steps. NO people, NO faces, NO logos, NO readable text, nothing
copied from a real poster or still.
  Subject: a towering tyrannosaur silhouette, mid-roar
  Setting: a dusk jungle clearing behind a sagging electric fence line, an electric storm overhead
  Mood / light: awe, menace, wonder
  One accent element: a single fork of lightning splitting the sky
  Composition: the hero subject sits lower-left, angled up and to the right, filling about two-thirds of the window height, with the setting band behind it and open sky above
A circular "DEEP CUT" badge — deep jungle green fill, cream ring and cream caps on two lines — sits inside the window near its bottom-right corner.

CREDITS (bottom block, aligned to the art window's edges):
THREE scored rows, top to bottom:
Sam Neill (actor, blue circle) +1
Laura Dern (actor, blue circle) +1
Steven Spielberg (director, amber square) +2
Each row: a small flat role glyph on the left (actor = blue #2C89A1 circle,
director = amber #CF952A square), the name in bold navy geometric sans, and the
point value in bold navy right-aligned at the row's far right. Plain rows — no
underlines, no boxes, no repeated glyphs on the right.

Texture is the headline requirement: the silkscreen halftone grain and flat spot
inks must be unmistakable even at thumbnail size. Professional collectible card
game finish.
```

## 07 · TITANIC (1997) — Romance · deep cut: yes

**Movie block:**

```json
{
  "id": "titanic",
  "title": "TITANIC",
  "year": 1997,
  "genre": "Romance",
  "credits": [
    {
      "name": "Leonardo DiCaprio",
      "role": "actor",
      "points": 1
    },
    {
      "name": "Kate Winslet",
      "role": "actor",
      "points": 1
    },
    {
      "name": "James Cameron",
      "role": "director",
      "points": 2
    }
  ],
  "deepCut": true,
  "art": {
    "subject": "a grand four-funnel ocean liner at a low three-quarter angle, portholes glowing",
    "setting": "a calm moonlit open ocean, dramatic dusk-to-night sky",
    "mood": "grand, serene, quietly doomed",
    "accent": "a huge crescent moon rising behind the funnels",
    "composition": "hero-left-diagonal"
  }
}
```

**Prompt (copy everything inside the fence):**

```
Design ONE mobile game card FRONT for the movie-connection card game "Marquee."
This is one card of a large matched set: the LAYOUT below is a fixed template and
must be followed exactly; only the movie content changes between cards. Portrait
3:4 card at high resolution on a dark walnut table. Output the single card only —
no labels, no captions, no extra cards.

STYLE — "REPERTORY TICKET" (screen-print):
A vintage repertory-cinema admission ticket, silkscreen-printed. Matte cream
uncoated paper (#F0EBD8). STRICT five-color limit: cream paper, navy ink
(#1F3A52), rose ink (#D4708C), a deeper shade of that same
ink for shadows, and amber (#CF952A) as at most one small accent. Visible halftone
dot grain in all inked areas, slight ink misregistration, chunky flat shapes, no
gradients, no photo texture. Die-cut silhouette: rounded corners plus one
semicircular tear notch centered on the top edge and one on the bottom edge.

TICKET STUB (left edge):
A vertical perforated line of punched holes about a quarter in from the left edge,
running the full height. Left of it: the GENRE PIP at the top — a plain filled
heart in #D4708C, nothing drawn inside it — then a solid
vertical rose bar, then "ADMIT ONE" reading vertically in small
letterspaced navy caps near the bottom.

HEADER (right of the stub):
"TITANIC" in very large bold condensed slab-serif navy capitals, left-aligned,
readable even when the card is overlapped in a fanned hand. The year "1997" in
smaller navy slab figures, right-aligned on the same line. A thin navy rule under
the header.

ART WINDOW (fixed size — identical on every card in the set):
A rectangular framed window spanning the full width right of the stub, from just
below the header rule to about two-thirds down the card, with a 10-unit navy frame,
gently rounded corners, and a thin cream inner keyline. Inside, an ORIGINAL
symbolic screen-print illustration — flat chunky shapes in the card's five inks
with halftone tonal steps. NO people, NO faces, NO logos, NO readable text, nothing
copied from a real poster or still.
  Subject: a grand four-funnel ocean liner at a low three-quarter angle, portholes glowing
  Setting: a calm moonlit open ocean, dramatic dusk-to-night sky
  Mood / light: grand, serene, quietly doomed
  One accent element: a huge crescent moon rising behind the funnels
  Composition: the hero subject sits lower-left, angled up and to the right, filling about two-thirds of the window height, with the setting band behind it and open sky above
A circular "DEEP CUT" badge — deep rose fill, cream ring and cream caps on two lines — sits inside the window near its bottom-right corner.

CREDITS (bottom block, aligned to the art window's edges):
THREE scored rows, top to bottom:
Leonardo DiCaprio (actor, blue circle) +1
Kate Winslet (actor, blue circle) +1
James Cameron (director, amber square) +2
Each row: a small flat role glyph on the left (actor = blue #2C89A1 circle,
director = amber #CF952A square), the name in bold navy geometric sans, and the
point value in bold navy right-aligned at the row's far right. Plain rows — no
underlines, no boxes, no repeated glyphs on the right.

Texture is the headline requirement: the silkscreen halftone grain and flat spot
inks must be unmistakable even at thumbnail size. Professional collectible card
game finish.
```

## 08 · CATCH ME IF YOU CAN (2002) — Comedy · deep cut: NO badge

**Movie block:**

```json
{
  "id": "catch-me-if-you-can",
  "title": "CATCH ME IF YOU CAN",
  "year": 2002,
  "genre": "Comedy",
  "credits": [
    {
      "name": "Leonardo DiCaprio",
      "role": "actor",
      "points": 1
    },
    {
      "name": "Tom Hanks",
      "role": "actor",
      "points": 1
    },
    {
      "name": "Steven Spielberg",
      "role": "director",
      "points": 2
    }
  ],
  "deepCut": false,
  "art": {
    "subject": "a small 1960s twin-engine airliner banking low over a runway",
    "setting": "a golden-hour airport apron with a rolling boarding staircase, loose bank checks scattering in the wind",
    "mood": "playful, slick, always one step ahead",
    "accent": "a pilot's cap resting on a leather suitcase",
    "composition": "hero-right-diagonal"
  }
}
```

**Prompt (copy everything inside the fence):**

```
Design ONE mobile game card FRONT for the movie-connection card game "Marquee."
This is one card of a large matched set: the LAYOUT below is a fixed template and
must be followed exactly; only the movie content changes between cards. Portrait
3:4 card at high resolution on a dark walnut table. Output the single card only —
no labels, no captions, no extra cards.

STYLE — "REPERTORY TICKET" (screen-print):
A vintage repertory-cinema admission ticket, silkscreen-printed. Matte cream
uncoated paper (#F0EBD8). STRICT five-color limit: cream paper, navy ink
(#1F3A52), teal ink (#2E8C94), a deeper shade of that same
ink for shadows, and amber (#CF952A) as at most one small accent. Visible halftone
dot grain in all inked areas, slight ink misregistration, chunky flat shapes, no
gradients, no photo texture. Die-cut silhouette: rounded corners plus one
semicircular tear notch centered on the top edge and one on the bottom edge.

TICKET STUB (left edge):
A vertical perforated line of punched holes about a quarter in from the left edge,
running the full height. Left of it: the GENRE PIP at the top — a plain filled
star in #2E8C94, nothing drawn inside it — then a solid
vertical teal bar, then "ADMIT ONE" reading vertically in small
letterspaced navy caps near the bottom.

HEADER (right of the stub):
"CATCH ME IF YOU CAN" in very large bold condensed slab-serif navy capitals, left-aligned,
readable even when the card is overlapped in a fanned hand. The year "2002" in
smaller navy slab figures, right-aligned on the same line. A thin navy rule under
the header.

ART WINDOW (fixed size — identical on every card in the set):
A rectangular framed window spanning the full width right of the stub, from just
below the header rule to about two-thirds down the card, with a 10-unit navy frame,
gently rounded corners, and a thin cream inner keyline. Inside, an ORIGINAL
symbolic screen-print illustration — flat chunky shapes in the card's five inks
with halftone tonal steps. NO people, NO faces, NO logos, NO readable text, nothing
copied from a real poster or still.
  Subject: a small 1960s twin-engine airliner banking low over a runway
  Setting: a golden-hour airport apron with a rolling boarding staircase, loose bank checks scattering in the wind
  Mood / light: playful, slick, always one step ahead
  One accent element: a pilot's cap resting on a leather suitcase
  Composition: the hero subject sits lower-right, angled up and to the left, filling about two-thirds of the window height, with the setting band behind it and open sky above
This card has NO badge on the artwork.

CREDITS (bottom block, aligned to the art window's edges):
THREE scored rows, top to bottom:
Leonardo DiCaprio (actor, blue circle) +1
Tom Hanks (actor, blue circle) +1
Steven Spielberg (director, amber square) +2
Each row: a small flat role glyph on the left (actor = blue #2C89A1 circle,
director = amber #CF952A square), the name in bold navy geometric sans, and the
point value in bold navy right-aligned at the row's far right. Plain rows — no
underlines, no boxes, no repeated glyphs on the right.

Texture is the headline requirement: the silkscreen halftone grain and flat spot
inks must be unmistakable even at thumbnail size. Professional collectible card
game finish.
```

## 09 · UNFORGIVEN (1992) — Western · deep cut: NO badge

**Movie block:**

```json
{
  "id": "unforgiven",
  "title": "UNFORGIVEN",
  "year": 1992,
  "genre": "Western",
  "credits": [
    {
      "name": "Gene Hackman",
      "role": "actor",
      "points": 1
    },
    {
      "name": "Morgan Freeman",
      "role": "actor",
      "points": 1
    },
    {
      "name": "Clint Eastwood",
      "role": "director",
      "points": 2
    }
  ],
  "deepCut": false,
  "art": {
    "subject": "a weathered clapboard farmhouse with a leaning split-rail fence",
    "setting": "a wide empty prairie under a blood-orange dusk, one bare tree on the ridge line",
    "mood": "grim, elegiac, dead still",
    "accent": "a revolver resting on the fence post in the foreground",
    "composition": "hero-center"
  }
}
```

**Prompt (copy everything inside the fence):**

```
Design ONE mobile game card FRONT for the movie-connection card game "Marquee."
This is one card of a large matched set: the LAYOUT below is a fixed template and
must be followed exactly; only the movie content changes between cards. Portrait
3:4 card at high resolution on a dark walnut table. Output the single card only —
no labels, no captions, no extra cards.

STYLE — "REPERTORY TICKET" (screen-print):
A vintage repertory-cinema admission ticket, silkscreen-printed. Matte cream
uncoated paper (#F0EBD8). STRICT five-color limit: cream paper, navy ink
(#1F3A52), sienna ink (#A0623A), a deeper shade of that same
ink for shadows, and amber (#CF952A) as at most one small accent. Visible halftone
dot grain in all inked areas, slight ink misregistration, chunky flat shapes, no
gradients, no photo texture. Die-cut silhouette: rounded corners plus one
semicircular tear notch centered on the top edge and one on the bottom edge.

TICKET STUB (left edge):
A vertical perforated line of punched holes about a quarter in from the left edge,
running the full height. Left of it: the GENRE PIP at the top — a plain filled
shield in #A0623A, nothing drawn inside it — then a solid
vertical sienna bar, then "ADMIT ONE" reading vertically in small
letterspaced navy caps near the bottom.

HEADER (right of the stub):
"UNFORGIVEN" in very large bold condensed slab-serif navy capitals, left-aligned,
readable even when the card is overlapped in a fanned hand. The year "1992" in
smaller navy slab figures, right-aligned on the same line. A thin navy rule under
the header.

ART WINDOW (fixed size — identical on every card in the set):
A rectangular framed window spanning the full width right of the stub, from just
below the header rule to about two-thirds down the card, with a 10-unit navy frame,
gently rounded corners, and a thin cream inner keyline. Inside, an ORIGINAL
symbolic screen-print illustration — flat chunky shapes in the card's five inks
with halftone tonal steps. NO people, NO faces, NO logos, NO readable text, nothing
copied from a real poster or still.
  Subject: a weathered clapboard farmhouse with a leaning split-rail fence
  Setting: a wide empty prairie under a blood-orange dusk, one bare tree on the ridge line
  Mood / light: grim, elegiac, dead still
  One accent element: a revolver resting on the fence post in the foreground
  Composition: the hero subject sits centered, facing the viewer, filling about two-thirds of the window height, with the setting band across the lower third and the backdrop above
This card has NO badge on the artwork.

CREDITS (bottom block, aligned to the art window's edges):
THREE scored rows, top to bottom:
Gene Hackman (actor, blue circle) +1
Morgan Freeman (actor, blue circle) +1
Clint Eastwood (director, amber square) +2
Each row: a small flat role glyph on the left (actor = blue #2C89A1 circle,
director = amber #CF952A square), the name in bold navy geometric sans, and the
point value in bold navy right-aligned at the row's far right. Plain rows — no
underlines, no boxes, no repeated glyphs on the right.

Texture is the headline requirement: the silkscreen halftone grain and flat spot
inks must be unmistakable even at thumbnail size. Professional collectible card
game finish.
```

## 10 · DUNKIRK (2017) — War · deep cut: yes

**Movie block:**

```json
{
  "id": "dunkirk",
  "title": "DUNKIRK",
  "year": 2017,
  "genre": "War",
  "credits": [
    {
      "name": "Fionn Whitehead",
      "role": "actor",
      "points": 1
    },
    {
      "name": "Tom Hardy",
      "role": "actor",
      "points": 1
    },
    {
      "name": "Christopher Nolan",
      "role": "director",
      "points": 2
    }
  ],
  "deepCut": true,
  "art": {
    "subject": "a little wooden civilian pleasure boat plowing through choppy grey-green sea",
    "setting": "the wide open Channel under a pale hazy sky, a distant beach with a column of black smoke rising",
    "mood": "urgent, vast, hemmed in",
    "accent": "a lone fighter plane passing low overhead",
    "composition": "hero-left-diagonal"
  }
}
```

**Prompt (copy everything inside the fence):**

```
Design ONE mobile game card FRONT for the movie-connection card game "Marquee."
This is one card of a large matched set: the LAYOUT below is a fixed template and
must be followed exactly; only the movie content changes between cards. Portrait
3:4 card at high resolution on a dark walnut table. Output the single card only —
no labels, no captions, no extra cards.

STYLE — "REPERTORY TICKET" (screen-print):
A vintage repertory-cinema admission ticket, silkscreen-printed. Matte cream
uncoated paper (#F0EBD8). STRICT five-color limit: cream paper, navy ink
(#1F3A52), olive ink (#77743F), a deeper shade of that same
ink for shadows, and amber (#CF952A) as at most one small accent. Visible halftone
dot grain in all inked areas, slight ink misregistration, chunky flat shapes, no
gradients, no photo texture. Die-cut silhouette: rounded corners plus one
semicircular tear notch centered on the top edge and one on the bottom edge.

TICKET STUB (left edge):
A vertical perforated line of punched holes about a quarter in from the left edge,
running the full height. Left of it: the GENRE PIP at the top — a plain filled
hexagon in #77743F, nothing drawn inside it — then a solid
vertical olive bar, then "ADMIT ONE" reading vertically in small
letterspaced navy caps near the bottom.

HEADER (right of the stub):
"DUNKIRK" in very large bold condensed slab-serif navy capitals, left-aligned,
readable even when the card is overlapped in a fanned hand. The year "2017" in
smaller navy slab figures, right-aligned on the same line. A thin navy rule under
the header.

ART WINDOW (fixed size — identical on every card in the set):
A rectangular framed window spanning the full width right of the stub, from just
below the header rule to about two-thirds down the card, with a 10-unit navy frame,
gently rounded corners, and a thin cream inner keyline. Inside, an ORIGINAL
symbolic screen-print illustration — flat chunky shapes in the card's five inks
with halftone tonal steps. NO people, NO faces, NO logos, NO readable text, nothing
copied from a real poster or still.
  Subject: a little wooden civilian pleasure boat plowing through choppy grey-green sea
  Setting: the wide open Channel under a pale hazy sky, a distant beach with a column of black smoke rising
  Mood / light: urgent, vast, hemmed in
  One accent element: a lone fighter plane passing low overhead
  Composition: the hero subject sits lower-left, angled up and to the right, filling about two-thirds of the window height, with the setting band behind it and open sky above
A circular "DEEP CUT" badge — deep olive fill, cream ring and cream caps on two lines — sits inside the window near its bottom-right corner.

CREDITS (bottom block, aligned to the art window's edges):
THREE scored rows, top to bottom:
Fionn Whitehead (actor, blue circle) +1
Tom Hardy (actor, blue circle) +1
Christopher Nolan (director, amber square) +2
Each row: a small flat role glyph on the left (actor = blue #2C89A1 circle,
director = amber #CF952A square), the name in bold navy geometric sans, and the
point value in bold navy right-aligned at the row's far right. Plain rows — no
underlines, no boxes, no repeated glyphs on the right.

Texture is the headline requirement: the silkscreen halftone grain and flat spot
inks must be unmistakable even at thumbnail size. Professional collectible card
game finish.
```

## 11 · THE SHAWSHANK REDEMPTION (1994) — Drama · deep cut: yes

**Movie block:**

```json
{
  "id": "the-shawshank-redemption",
  "title": "THE SHAWSHANK REDEMPTION",
  "year": 1994,
  "genre": "Drama",
  "credits": [
    {
      "name": "Tim Robbins",
      "role": "actor",
      "points": 1
    },
    {
      "name": "Morgan Freeman",
      "role": "actor",
      "points": 1
    },
    {
      "name": "Frank Darabont",
      "role": "director",
      "points": 2
    }
  ],
  "deepCut": true,
  "art": {
    "subject": "a massive stone prison wall with one tiny open doorway spilling warm light",
    "setting": "a torrential night rainstorm over a dark courtyard, a river winding to the horizon beyond the wall",
    "mood": "oppressive, breaking open into hope",
    "accent": "a small rock hammer lying at the doorway's threshold",
    "composition": "hero-center"
  }
}
```

**Prompt (copy everything inside the fence):**

```
Design ONE mobile game card FRONT for the movie-connection card game "Marquee."
This is one card of a large matched set: the LAYOUT below is a fixed template and
must be followed exactly; only the movie content changes between cards. Portrait
3:4 card at high resolution on a dark walnut table. Output the single card only —
no labels, no captions, no extra cards.

STYLE — "REPERTORY TICKET" (screen-print):
A vintage repertory-cinema admission ticket, silkscreen-printed. Matte cream
uncoated paper (#F0EBD8). STRICT five-color limit: cream paper, navy ink
(#1F3A52), bronze ink (#A87B3E), a deeper shade of that same
ink for shadows, and amber (#CF952A) as at most one small accent. Visible halftone
dot grain in all inked areas, slight ink misregistration, chunky flat shapes, no
gradients, no photo texture. Die-cut silhouette: rounded corners plus one
semicircular tear notch centered on the top edge and one on the bottom edge.

TICKET STUB (left edge):
A vertical perforated line of punched holes about a quarter in from the left edge,
running the full height. Left of it: the GENRE PIP at the top — a plain filled
circle in #A87B3E, nothing drawn inside it — then a solid
vertical bronze bar, then "ADMIT ONE" reading vertically in small
letterspaced navy caps near the bottom.

HEADER (right of the stub):
"THE SHAWSHANK REDEMPTION" in very large bold condensed slab-serif navy capitals, left-aligned,
readable even when the card is overlapped in a fanned hand. The year "1994" in
smaller navy slab figures, right-aligned on the same line. A thin navy rule under
the header.

ART WINDOW (fixed size — identical on every card in the set):
A rectangular framed window spanning the full width right of the stub, from just
below the header rule to about two-thirds down the card, with a 10-unit navy frame,
gently rounded corners, and a thin cream inner keyline. Inside, an ORIGINAL
symbolic screen-print illustration — flat chunky shapes in the card's five inks
with halftone tonal steps. NO people, NO faces, NO logos, NO readable text, nothing
copied from a real poster or still.
  Subject: a massive stone prison wall with one tiny open doorway spilling warm light
  Setting: a torrential night rainstorm over a dark courtyard, a river winding to the horizon beyond the wall
  Mood / light: oppressive, breaking open into hope
  One accent element: a small rock hammer lying at the doorway's threshold
  Composition: the hero subject sits centered, facing the viewer, filling about two-thirds of the window height, with the setting band across the lower third and the backdrop above
A circular "DEEP CUT" badge — deep bronze fill, cream ring and cream caps on two lines — sits inside the window near its bottom-right corner.

CREDITS (bottom block, aligned to the art window's edges):
THREE scored rows, top to bottom:
Tim Robbins (actor, blue circle) +1
Morgan Freeman (actor, blue circle) +1
Frank Darabont (director, amber square) +2
Each row: a small flat role glyph on the left (actor = blue #2C89A1 circle,
director = amber #CF952A square), the name in bold navy geometric sans, and the
point value in bold navy right-aligned at the row's far right. Plain rows — no
underlines, no boxes, no repeated glyphs on the right.

Texture is the headline requirement: the silkscreen halftone grain and flat spot
inks must be unmistakable even at thumbnail size. Professional collectible card
game finish.
```

## 12 · TOY STORY (1995) — Animation · deep cut: yes

**Movie block:**

```json
{
  "id": "toy-story",
  "title": "TOY STORY",
  "year": 1995,
  "genre": "Animation",
  "credits": [
    {
      "name": "Tom Hanks",
      "role": "actor",
      "points": 1
    },
    {
      "name": "Tim Allen",
      "role": "actor",
      "points": 1
    },
    {
      "name": "John Lasseter",
      "role": "director",
      "points": 2
    }
  ],
  "deepCut": true,
  "art": {
    "subject": "a wooden toy cowboy boot and a red-and-white toy rocket standing together on a bedroom floor",
    "setting": "a sunny child's bedroom with cloud-pattern wallpaper and wooden alphabet blocks scattered on blue carpet",
    "mood": "bright, warm, adventurous",
    "accent": "a red pull-string ring dangling from the boot",
    "composition": "hero-center"
  }
}
```

**Prompt (copy everything inside the fence):**

```
Design ONE mobile game card FRONT for the movie-connection card game "Marquee."
This is one card of a large matched set: the LAYOUT below is a fixed template and
must be followed exactly; only the movie content changes between cards. Portrait
3:4 card at high resolution on a dark walnut table. Output the single card only —
no labels, no captions, no extra cards.

STYLE — "REPERTORY TICKET" (screen-print):
A vintage repertory-cinema admission ticket, silkscreen-printed. Matte cream
uncoated paper (#F0EBD8). STRICT five-color limit: cream paper, navy ink
(#1F3A52), sky blue ink (#3F86C8), a deeper shade of that same
ink for shadows, and amber (#CF952A) as at most one small accent. Visible halftone
dot grain in all inked areas, slight ink misregistration, chunky flat shapes, no
gradients, no photo texture. Die-cut silhouette: rounded corners plus one
semicircular tear notch centered on the top edge and one on the bottom edge.

TICKET STUB (left edge):
A vertical perforated line of punched holes about a quarter in from the left edge,
running the full height. Left of it: the GENRE PIP at the top — a plain filled
rounded square in #3F86C8, nothing drawn inside it — then a solid
vertical sky blue bar, then "ADMIT ONE" reading vertically in small
letterspaced navy caps near the bottom.

HEADER (right of the stub):
"TOY STORY" in very large bold condensed slab-serif navy capitals, left-aligned,
readable even when the card is overlapped in a fanned hand. The year "1995" in
smaller navy slab figures, right-aligned on the same line. A thin navy rule under
the header.

ART WINDOW (fixed size — identical on every card in the set):
A rectangular framed window spanning the full width right of the stub, from just
below the header rule to about two-thirds down the card, with a 10-unit navy frame,
gently rounded corners, and a thin cream inner keyline. Inside, an ORIGINAL
symbolic screen-print illustration — flat chunky shapes in the card's five inks
with halftone tonal steps. NO people, NO faces, NO logos, NO readable text, nothing
copied from a real poster or still.
  Subject: a wooden toy cowboy boot and a red-and-white toy rocket standing together on a bedroom floor
  Setting: a sunny child's bedroom with cloud-pattern wallpaper and wooden alphabet blocks scattered on blue carpet
  Mood / light: bright, warm, adventurous
  One accent element: a red pull-string ring dangling from the boot
  Composition: the hero subject sits centered, facing the viewer, filling about two-thirds of the window height, with the setting band across the lower third and the backdrop above
A circular "DEEP CUT" badge — deep sky blue fill, cream ring and cream caps on two lines — sits inside the window near its bottom-right corner.

CREDITS (bottom block, aligned to the art window's edges):
THREE scored rows, top to bottom:
Tom Hanks (actor, blue circle) +1
Tim Allen (actor, blue circle) +1
John Lasseter (director, amber square) +2
Each row: a small flat role glyph on the left (actor = blue #2C89A1 circle,
director = amber #CF952A square), the name in bold navy geometric sans, and the
point value in bold navy right-aligned at the row's far right. Plain rows — no
underlines, no boxes, no repeated glyphs on the right.

Texture is the headline requirement: the silkscreen halftone grain and flat spot
inks must be unmistakable even at thumbnail size. Professional collectible card
game finish.
```
