#!/usr/bin/env python3
"""Generate pilot-batch prompt files for card specs A and C.

Movie facts (title/year/genre/credits/deepCut) come from src/data/movies.ts.
Art briefs are authored per the contract's composition templates.
Templates are copied verbatim from the spec files; only {{SLOTS}} are filled.
"""
import json, textwrap

# genre -> (shape, ink_name, full_hex, muted_hex)   [contract §3, realigned 2026-07-03]
GENRE = {
    "Crime":     ("diamond", "deep red", "#A02C2C", "#7E3A34"),
    "Thriller":  ("square", "plum", "#5C4A78", "#5A5068"),
    "Sci-Fi":    ("triangle", "navy", "#33518F", "#4A5A78"),
    "Action":    ("chevron", "slate", "#5B6B7A", "#5C6670"),
    "Drama":     ("circle", "bronze", "#A87B3E", "#8A6A44"),
    "War":       ("hexagon", "olive", "#77743F", "#6C6845"),
    "Adventure": ("pentagon", "jungle green", "#3E8A5A", "#567553"),
    "Comedy":    ("star", "teal", "#2E8C94", "#4E7F7C"),
    "Animation": ("rounded square", "sky blue", "#3F86C8", "#5A7A96"),
    "Western":   ("shield", "sienna", "#A0623A", "#855640"),
    "Romance":   ("heart", "rose", "#D4708C", "#B06A6A"),
}

COMPOSITION = {
    "hero-center": "the hero subject sits centered, facing the viewer, filling about two-thirds of the window height, with the setting band across the lower third and the backdrop above",
    "hero-left-diagonal": "the hero subject sits lower-left, angled up and to the right, filling about two-thirds of the window height, with the setting band behind it and open sky above",
    "hero-right-diagonal": "the hero subject sits lower-right, angled up and to the left, filling about two-thirds of the window height, with the setting band behind it and open sky above",
}

MOVIES = [
 dict(id="goodfellas", title="GOODFELLAS", year=1990, genre="Crime", deep=True,
      credits=[("Robert De Niro","actor",1),("Ray Liotta","actor",1),("Martin Scorsese","director",2)],
      subject="a chrome-trimmed diner booth table set with a whiskey tumbler, an ashtray, and a snub-nosed revolver",
      setting="a late-night city diner window, venetian blinds half open, neon signs glowing on the wet street outside",
      mood="sharp, glamorous, dangerous", accent="a banded stack of cash beside the ashtray", comp="hero-center"),
 dict(id="the-godfather", title="THE GODFATHER", year=1972, genre="Crime", deep=True,
      credits=[("Marlon Brando","actor",1),("Al Pacino","actor",1),("James Caan","actor",1),("Francis Ford Coppola","director",2)],
      subject="a high-backed leather desk chair, empty, behind a heavy carved wooden desk",
      setting="a dark wood-paneled study with thin slatted light through closed blinds, a crystal decanter and a fedora on the desk",
      mood="hushed, powerful, funereal", accent="a single red rose lying on the desk blotter", comp="hero-center"),
 dict(id="taxi-driver", title="TAXI DRIVER", year=1976, genre="Thriller", deep=True,
      credits=[("Robert De Niro","actor",1),("Jodie Foster","actor",1),("Martin Scorsese","director",2)],
      subject="a 1970s yellow checker taxi cab with its headlights on",
      setting="a rain-slicked midtown street at night, steam rising from a manhole, blurred theater marquees far behind",
      mood="restless, feverish, lonely", accent="a cloud of white steam swallowing the rear wheels", comp="hero-left-diagonal"),
 dict(id="inception", title="INCEPTION", year=2010, genre="Sci-Fi", deep=True,
      credits=[("Leonardo DiCaprio","actor",1),("Joseph Gordon-Levitt","actor",1),("Christopher Nolan","director",2)],
      subject="a city block of skyscrapers folding upward and over itself like a closing book",
      setting="a dream-lit sky where the street curls overhead, window grids catching low golden sun",
      mood="impossible, precise, vertiginous", accent="a tiny spinning top standing on the empty street below", comp="hero-center"),
 dict(id="the-dark-knight", title="THE DARK KNIGHT", year=2008, genre="Action", deep=True,
      credits=[("Christian Bale","actor",1),("Heath Ledger","actor",1),("Christopher Nolan","director",2)],
      subject="a lone searchlight beam cutting up from a rooftop into low night clouds",
      setting="a rain-glazed high-rise skyline at night seen from above, windows lit in scattered grids",
      mood="brooding, monumental, on edge", accent="a handful of playing cards fluttering off the rooftop edge", comp="hero-right-diagonal"),
 dict(id="jurassic-park", title="JURASSIC PARK", year=1993, genre="Adventure", deep=True,
      credits=[("Sam Neill","actor",1),("Laura Dern","actor",1),("Steven Spielberg","director",2)],
      subject="a towering tyrannosaur silhouette, mid-roar",
      setting="a dusk jungle clearing behind a sagging electric fence line, an electric storm overhead",
      mood="awe, menace, wonder", accent="a single fork of lightning splitting the sky", comp="hero-left-diagonal"),
 dict(id="titanic", title="TITANIC", year=1997, genre="Romance", deep=True,
      credits=[("Leonardo DiCaprio","actor",1),("Kate Winslet","actor",1),("James Cameron","director",2)],
      subject="a grand four-funnel ocean liner at a low three-quarter angle, portholes glowing",
      setting="a calm moonlit open ocean, dramatic dusk-to-night sky",
      mood="grand, serene, quietly doomed", accent="a huge crescent moon rising behind the funnels", comp="hero-left-diagonal"),
 dict(id="catch-me-if-you-can", title="CATCH ME IF YOU CAN", year=2002, genre="Comedy", deep=False,
      credits=[("Leonardo DiCaprio","actor",1),("Tom Hanks","actor",1),("Steven Spielberg","director",2)],
      subject="a small 1960s twin-engine airliner banking low over a runway",
      setting="a golden-hour airport apron with a rolling boarding staircase, loose bank checks scattering in the wind",
      mood="playful, slick, always one step ahead", accent="a pilot's cap resting on a leather suitcase", comp="hero-right-diagonal"),
 dict(id="unforgiven", title="UNFORGIVEN", year=1992, genre="Western", deep=False,
      credits=[("Gene Hackman","actor",1),("Morgan Freeman","actor",1),("Clint Eastwood","director",2)],
      subject="a weathered clapboard farmhouse with a leaning split-rail fence",
      setting="a wide empty prairie under a blood-orange dusk, one bare tree on the ridge line",
      mood="grim, elegiac, dead still", accent="a revolver resting on the fence post in the foreground", comp="hero-center"),
 dict(id="dunkirk", title="DUNKIRK", year=2017, genre="War", deep=True,
      credits=[("Fionn Whitehead","actor",1),("Tom Hardy","actor",1),("Christopher Nolan","director",2)],
      subject="a little wooden civilian pleasure boat plowing through choppy grey-green sea",
      setting="the wide open Channel under a pale hazy sky, a distant beach with a column of black smoke rising",
      mood="urgent, vast, hemmed in", accent="a lone fighter plane passing low overhead", comp="hero-left-diagonal"),
 dict(id="the-shawshank-redemption", title="THE SHAWSHANK REDEMPTION", year=1994, genre="Drama", deep=True,
      credits=[("Tim Robbins","actor",1),("Morgan Freeman","actor",1),("Frank Darabont","director",2)],
      subject="a massive stone prison wall with one tiny open doorway spilling warm light",
      setting="a torrential night rainstorm over a dark courtyard, a river winding to the horizon beyond the wall",
      mood="oppressive, breaking open into hope", accent="a small rock hammer lying at the doorway's threshold", comp="hero-center"),
 dict(id="toy-story", title="TOY STORY", year=1995, genre="Animation", deep=True,
      credits=[("Tom Hanks","actor",1),("Tim Allen","actor",1),("John Lasseter","director",2)],
      subject="a wooden toy cowboy boot and a red-and-white toy rocket standing together on a bedroom floor",
      setting="a sunny child's bedroom with cloud-pattern wallpaper and wooden alphabet blocks scattered on blue carpet",
      mood="bright, warm, adventurous", accent="a red pull-string ring dangling from the boot", comp="hero-center"),
]

ROLE_A = {"actor": "blue circle", "director": "amber square"}
ROLE_C = {"actor": "slate circle", "director": "brown square"}
COUNT_WORD = {2: "TWO", 3: "THREE", 4: "FOUR"}

TEMPLATE_A = """Design ONE mobile game card FRONT for the movie-connection card game "Match Cut."
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
game finish."""

TEMPLATE_C = """Design ONE mobile game card FRONT for the movie-connection card game "Match Cut."
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
ephemera. Professional collectible card game finish."""


def fill(template, m, style):
    shape, ink, full, muted = GENRE[m["genre"]]
    rows_role = ROLE_A if style == "A" else ROLE_C
    rows = "\n".join(f"{n} ({r}, {rows_role[r]}) +{p}" for n, r, p in m["credits"])
    if m["deep"]:
        if style == "A":
            dc = (f'A circular "DEEP CUT" badge — deep {ink} fill, cream ring and cream caps '
                  f'on two lines — sits inside the window near its bottom-right corner.')
        else:
            dc = ('A circular "Deep Cut" badge — muted verdigris (#6F8F8C) fill with hatched '
                  'shading, ivory double ring, "Deep" in engraved script over "CUT" in small '
                  'caps — sits inside the window near its bottom-right corner.')
    else:
        dc = "This card has NO badge on the artwork."
    out = template
    for k, v in {
        "{{TITLE}}": m["title"], "{{YEAR}}": str(m["year"]),
        "{{GENRE_SHAPE}}": shape,
        "{{GENRE_INK_NAME}}": ink, "{{GENRE_INK_HEX}}": full,
        "{{GENRE_COLOR_NAME}}": ink, "{{GENRE_MUTED_HEX}}": muted,
        "{{ART_SUBJECT}}": m["subject"], "{{ART_SETTING}}": m["setting"],
        "{{ART_MOOD}}": m["mood"], "{{ART_ACCENT}}": m["accent"],
        "{{ART_COMPOSITION_SENTENCE}}": COMPOSITION[m["comp"]],
        "{{DEEP_CUT_LINE}}": dc,
        "{{CREDIT_COUNT}}": COUNT_WORD[len(m["credits"])],
        "{{CREDIT_ROWS}}": rows,
    }.items():
        out = out.replace(k, v)
    assert "{{" not in out, f"unfilled slot in {m['id']}"
    return out


def movie_block(m):
    return json.dumps({
        "id": m["id"], "title": m["title"], "year": m["year"], "genre": m["genre"],
        "credits": [{"name": n, "role": r, "points": p} for n, r, p in m["credits"]],
        "deepCut": m["deep"],
        "art": {"subject": m["subject"], "setting": m["setting"], "mood": m["mood"],
                "accent": m["accent"], "composition": m["comp"]},
    }, indent=2)


HEADER = """# Match Cut · Pilot Batch 01 — {name} prompts

> **12 paste-ready generation prompts**, one per movie, for style **{style_long}**.
> Movie facts pulled from `src/data/movies.ts` (credits = top-2 billed cast +1 each,
> director +2, per RULEBOOK scoring; `deepCut` = the film has hidden deep-billed
> credits). Spec: `{spec_file}` · shared rules: `card-template-contract.md`.
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
"""


def emit(style, name, style_long, spec_file, template, path):
    parts = [HEADER.format(name=name, style_long=style_long, spec_file=spec_file)]
    for i, m in enumerate(MOVIES, 1):
        badge = "yes" if m["deep"] else "NO badge"
        parts.append(f"## {i:02d} · {m['title']} ({m['year']}) — {m['genre']} · deep cut: {badge}\n")
        parts.append("**Movie block:**\n\n```json\n" + movie_block(m) + "\n```\n")
        parts.append("**Prompt (copy everything inside the fence):**\n\n```\n" + fill(template, m, style) + "\n```\n")
    with open(path, "w") as f:
        f.write("\n".join(parts))
    print("wrote", path)


BASE = "/Users/mwamburi/Projects/Daily Movie Game/design/"
emit("A", "Repertory Ticket", "A · Repertory Ticket (screen-print)",
     "card-spec-A-repertory-ticket.md", TEMPLATE_A, BASE + "pilot-batch-01-A.md")
emit("C", "Silent Era", "C · Silent Era (antique engraving)",
     "card-spec-C-silent-era.md", TEMPLATE_C, BASE + "pilot-batch-01-C.md")
