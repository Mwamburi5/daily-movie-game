# Match Cut pool expansion — Wave 3 research slate

**Status:** CHECKPOINT 2 — selection locked at 67 titles; review-only candidate and audit artifacts drafted; no `src/data/` edits.
**Prepared:** 2026-08-08 on `codex/daily-mode-polish` at `d201020` (`HEAD` is one commit ahead of origin).
**User-scope amendment:** this request reopens content exploration after the §9 pause at 438. It does **not** authorize a Solo/Duel pool cutover, rule change, art production, merge, commit, push, or deploy.

## Executive call

The original research recommendation was a 36-card Wave 3. Buri instead selected a **67-card Wave 3**: all of A, all of B, C01–C17 (not C18), none of D, all of E, and all of F. That explicit selection supersedes the smaller recommendation while preserving the same metadata, parity, bundle, and release guardrails.

The tables below preserve the pre-selection research snapshot and its original unchecked interface. The authoritative locked scope is:

```text
SELECTED (67): A01–A16, B01–B12, C01–C17, E01–E12, F01–F10
SKIPPED: C18, D01–D15, G01–G06, H01–H08
```

The review-only implementation lives in `scripts/wave3-candidate.ts`; generated TMDB, date, and name reports remain evidence rather than runtime data.

## 1. Verified repository baseline

### State and commands

```text
git status --short --branch
## codex/daily-mode-polish...origin/codex/daily-mode-polish [ahead 1]
?? docs/pool-expansion-goal-prompt.md

git log -1 --oneline --decorate
d201020 (HEAD -> codex/daily-mode-polish) Add P1 delivery foundations

node -e "import('./src/data/movies.ts')..."
237 credited Movies · 226 dated credited Movies · 212 DATED_STUBS · 438 dated total

npm run gen:connections
237 credited films
9,562,667 viable key-quadruples of 15,777,195
2,868,800 estimated strict accidental-free key-sets (6,000/20,000 sample; lower bound)

npm run build
PASS — movies chunk 69.97 kB raw / 19.25 kB gzip

npm run check:bundle
PASS — menu 95.41 KiB; cold JS 115.97–137.54 KiB by mode
```

The untracked `docs/pool-expansion-goal-prompt.md` pre-existed this work and is untouched.

### Pool census

| Measure | Current |
|---|---:|
| Fully credited `MOVIES` | 237 |
| Credited movies with policy dates | 226 |
| Dates-only stubs | 212 |
| Derived Chronology pool | 438 |
| Frozen `DUEL_POOL_IDS` | 89 |
| Chronology by decade, 1970s→2020s | 34 / 60 / 91 / 97 / 104 / 52 |
| Genres | Drama 43; Sci-Fi 32; Crime 29; Thriller 27; Action 22; Comedy 22; Adventure 17; Animation 16; Romance 10; War 7; Horror 6; Western 6 |
| Distinct exact-string credit names | 1,076 |
| Linked film pairs | 1,696 of 27,966: 1,216 standard; 387 strong; 93 super |
| Median / maximum graph degree | 14 / 37 |
| Isolated credited films | 5: `casablanca` (intentional wild), `crouching-tiger-hidden-dragon`, `parasite`, `spirited-away`, `the-wizard-of-oz` |

Connections formation keys: 25 directors, 100 actors, 4 series, and all 12 genres are group-ready at four or more films. Exactly-one-short keys: **6 directors, 44 actors, 3 series**.

The heaviest existing concentrations are directors Martin Scorsese 10; Christopher Nolan, Quentin Tarantino, and Steven Spielberg 9; and actors Matt Damon, Tom Cruise, and Tom Hanks 13; Brad Pitt, Harrison Ford, Leonardo DiCaprio, and Robert De Niro 11. New cards led by those people need a second reason beyond “more links.”

### Representation limits in the current schema

The data has no country, language, gender, or demographic fields, so a reproducible census for international cinema or creator identity is impossible without adding research annotations outside runtime data. A conservative manual director audit finds only **10/237 films** with a woman among the listed primary directors: the four Matrix films, `Cloud Atlas`, `Barbie`, `Shrek`, `Sleepless in Seattle`, `Zero Dark Thirty`, and `The Hurt Locker`. Those 10 films come from six exact director names, with half concentrated in the Wachowski cluster. International/non-English coverage is visibly thin and mechanically isolated: `Parasite`, `Spirited Away`, and `Crouching Tiger, Hidden Dragon` currently have graph degree zero.

## 2. Observed taste model

| Observation | Evidence | Confidence |
|---|---|---|
| Recognizability is a vetoable human judgment, not a database score. | Stage B explicitly assigned title keeps to Buri; 277/352 were kept and 74 were struck. | Demonstrated, high |
| Prefer cards that finish a one-short or do two jobs. | Waves 1–2 were organized around completion double-plays, franchise cappers, and self-contained clusters; Wave 2 intentionally seeded Eastwood, Zemeckis, McKay, Brad Bird, and others at three. | Demonstrated, high |
| Preserve roughly 85–90% broad anchors and 10–15% genuine deep cuts. | Wave 1 targeted 12% deep cuts; Wave 2 landed about 9%. | Demonstrated, high |
| Curation beats completeness. | `godfather`, `lotr`, and `dark-knight` are explicitly “uncompletable one-shorts”; the docs say not to invent a fourth film. | Demonstrated, high |
| Broad, accessible 1990s–2010s titles are safest; canonical status alone is insufficient. | Stage B kept almost the entire 1990s–2010s commercial slate but struck many 1970s/1980s canon or cult picks, including *American Graffiti*, *Cabaret*, *Stand by Me*, *Airplane!*, and *Tootsie*. | Demonstrated, high |
| Current event films can earn a place, but streaming-only chronology is not silently normalized. | Stage B kept *Anora*, *Sinners*, *Mickey 17*, and major franchise titles; struck *CODA*, *Hamilton*, and several streaming-era choices; `Soul` was ruled undated. | Demonstrated, high |
| Card-face cast is recognizability-first, but every performance must be real. | Billing-order rulings repeatedly kept famous principals; archive Don Rickles was excluded; voices and uncredited real performances can count under prior rulings. | Demonstrated, high |
| Exact-name and screenplay-only discipline is part of curation quality. | The ruling ledger preserves credited-at-the-time names, byte-identical link spellings, primary directors, and excludes story/novel/characters jobs. | Demonstrated, high |
| Breadth picks with modest immediate yield are welcome in small doses. | *Spirited Away* and other international/classic anchors were kept despite low graph value, while each wave stayed below the deep-cut ceiling. | Demonstrated, medium-high |
| Inference: prefer a mechanically rich 36-card wave now over another 74-card wave. | Current graph yield is already enormous, §9 says presentation is the launch constraint, and the bundle now has explicit budgets. | Inference, medium; correct this if your priority is content volume |

One meaningful tension is unresolved and should be decided through the slate, not assumed: the 1970s need 16 dated additions to reach the old 50-film floor, but Stage B already struck many of the obvious candidates. My recommendation does **not** force all 16 back in; it exposes the strongest ones for a fresh card-value ruling.

## 3. Systematic gap analysis

### Highest-value exact one-shorts

The most useful real candidates are not simply the generator's largest phantom deltas; they are films that can close multiple real keys without overfeeding a mega-hub.

- **Double completers:** *Gran Torino* closes Clint Eastwood as both director and actor; *The Rock* closes Ed Harris and David Morse; *Ex Machina* closes Oscar Isaac and Domhnall Gleeson.
- **Director + useful actor:** *Who Framed Roger Rabbit* closes Robert Zemeckis; *Vice* closes Adam McKay; *The Iron Giant* closes Brad Bird; *Glass Onion* closes Rian Johnson; *Point Break* advances Kathryn Bigelow and adds a broad Keanu/Swayze anchor.
- **Actor completers with efficient stubs:** *Skyfall*→Javier Bardem; *Dumb and Dumber*→Jeff Daniels; *Walk the Line*→Joaquin Phoenix; *Cars*→John Ratzenberger; *Sherlock Holmes*→Jude Law; *Shaun of the Dead*→Simon Pegg; *Dune: Part Two*→Rebecca Ferguson; *Avatar*→Sigourney Weaver.
- **Packages:** three Spike Lee additions join existing *Inside Man*; three Bong Joon-ho additions join *Parasite*; three Miyazaki additions join *Spirited Away*; three Nora Ephron additions join *Sleepless in Seattle*. These should be kept or struck together if the director group is the reason.
- **Never fake:** `godfather`, `dark-knight`, and `lotr` remain real trilogies. Do not tag *The Batman* as Nolan's `dark-knight`, *The Hobbit* as `lotr`, or an unrelated Coppola film as `godfather` merely to make a four.

### Complete one-short inventory and disposition

This is the complete live `buildKeys(...).filter(pool.length === 3)` inventory, not only the names that made the recommendation.

- **Directors (6):** Adam McKay→B01; Brad Bird→A03; Clint Eastwood→A01; Rian Johnson→A04; Robert Zemeckis→A02; Rob Reiner→parked after the fit screen (*Stand by Me* was a prior Stage B strike, while *Misery* is recognizable but adds less breadth than the selected Horror options).
- **Actors covered by the scored slate (29):** Ben Affleck→B02; Clint Eastwood→A01; Cuba Gooding Jr.→B04; David Morse + Ed Harris→A05; Domhnall Gleeson + Oscar Isaac→A06; Drew Barrymore→B03; Ethan Hawke→B05; J.K. Simmons→G01; Jared Leto→G03; Javier Bardem→A07; Jeff Daniels→A08; Joan Cusack→B06; Joaquin Phoenix→A09; John Ratzenberger→A10; Jude Law→A11; Kurt Russell→B07; Marion Cotillard→G04; Michael Fassbender→B08; Paul Giamatti→B09/G02; Ralph Fiennes→B10; Rebecca Ferguson→A14; Regina King→B11; Sally Field→B12; Sigourney Weaver→A12; Simon Pegg→A13; Tim Robbins→G05; William H. Macy→G06.
- **Actors parked after the fit screen (15):** Alec Baldwin (*Glengarry Glen Ross*, brief-role/billing risk); Billy Crystal (*City Slickers*, lower package value); Billy Dee Williams (*The Lego Batman Movie*, voice/continuity clutter); Daryl Hannah (*Splash*, feeds Hanks 13); Don Rickles (*Kelly's Heroes*, lower recognition; archive *Toy Story 4* remains disallowed); Frank Oz (*The Blues Brothers*, cameo-depth risk); Jeff Bridges (*TRON: Legacy*, franchise/Sci-Fi concentration); Joe Pantoliano (*Bad Boys*, feeds Will Smith); Kirsten Dunst (*Bring It On*, useful but lower than selected women-director lane); Martin Sheen (*Wall Street*, Crime/hub concentration); Mary Steenburgen (*Back to the Future Part III*, Zemeckis/franchise concentration); Michael Biehn (*The Abyss*, Cameron/Sci-Fi concentration); Richard Harris (*Camelot*, pre-window and deep-cut risk); Seth Rogen (*Knocked Up*, Comedy hub rather than breadth); Tim Roth (*Planet of the Apes* (2001), remake/title and franchise clutter).
- **Series (3):** `godfather`, `dark-knight`, and `lotr`; all are deliberately parked as real trilogies with no honest fourth member.

The parked list is evidence of consideration, not a shadow candidate slate: those films failed the initial fit/concentration screen and therefore are not among the 97 scored choices. Any can be promoted as a swap, at which point it should receive a full row and score before Phase 2.

### Era, genre, and breadth gaps

- The 1970s are 16 short of the prior floor. The best recognizable repair candidates are *American Graffiti*, *Enter the Dragon*, *Carrie*, *Close Encounters*, *Superman*, *The Deer Hunter*, *Kramer vs. Kramer*, *The Sting*, *Serpico*, and *Dog Day Afternoon*. Several were previously struck; the slate marks that instead of erasing the evidence.
- Horror and Western have only six credited cards each; War has seven and Romance ten. Horror has the better near-term opportunity because *The Thing*, *Carrie*, *Halloween*, and *The Texas Chain Saw Massacre* also add director/actor or era value.
- Women-primary-director coverage is only 10 films. *Lady Bird*, *Little Women*, *Lost in Translation*, *Selma*, *The Farewell*, *Past Lives*, and *Love & Basketball* improve this without manufacturing a four-film group.
- International cards should be added in coherent, recognizable packages so they do not become more isolated zero-degree breadth tokens. Bong and Miyazaki are the cleanest packages; *Oldboy*, *Amélie*, *Godzilla Minus One*, and *RRR* are individual breadth options.

### Batch-size options

Wave 2's 74 full entries occupy about 32.4 kB of source, or **~437 source bytes/card**. The current `movies` chunk is 19.25 kB gzip for 237 full cards plus 212 stubs; marginal gzip cost is likely roughly 0.08–0.15 kB/card, but only a post-merge build can confirm. Baked Connections grid count is fixed, so rebaking changes ids/assignments rather than linearly adding grids; ambiguity and cold-session size still need measurement.

| Option | Shape | Likely stub graduations | Estimated direct source / gzip delta | QA and marginal value |
|---|---|---:|---:|---|
| **36 — recommended** | Highest-value completers + 2–3 packages + a few era/current picks | ~16 | ~15.7 kB / ~3–5 kB | One controlled arbitration wave; high value per card; does not repair the full 1970s floor. |
| **60–75** | Adds a full 1970s repair and 3–4 breadth packages | ~25–32 | ~26–33 kB / ~5–10 kB | Similar scale to Waves 1–2; more accidental-group and exact-name QA; diminishing graph value but better representation. |
| **100** | Broad catalog program rather than a wave | ~38–45 | ~43.7 kB / ~8–15 kB | Multiple audit/arbitration batches, larger rebake risk, harder taste review, and weakest fit with the current launch constraint. |

## 4. Scoring rubric

Each row is `F/R/C/L/E/B/S/M − P = T`:

- **F 0–5** demonstrated taste fit.
- **R 0–5** broad recognizability.
- **C 0–5** Connections value: completed keys, package support, likely strict yield.
- **L 0–4** useful real links in the wider card graph.
- **E 0–3** Chronology/era value.
- **B 0–3** genre, cultural, regional, or creator breadth.
- **S 0–2** existing-stub graduation efficiency.
- **M 0–3** Phase-1 metadata confidence.
- **P 0–3** penalty for concentration, ambiguity, collision, prior strike, date/billing risk, or deep-cut load.

The score is triage, not an approval. The reason/caveat column controls when the number and judgment disagree. `★` marks my 36-card recommendation; `stub` means the canonical id/date already exists and must be reused if kept.

## 5. Candidate slate — 97 viable choices

### A. Obvious high-value keeps (16)

| Pick | Film | Score | What it unlocks / caveat |
|---|---|---:|---|
| [ ] ★ A01 *Gran Torino* (2008) | `5/5/5/4/2/2/0/3−0=26` | The cleanest double-play: completes Clint Eastwood as director and actor via *Unforgiven*, *Mystic River*, *Million Dollar Baby*, and *The Good, the Bad and the Ugly*. |
| [ ] ★ A02 *Who Framed Roger Rabbit* (1988) — stub | `5/5/5/3/1/3/2/3−0=27` | Completes Robert Zemeckis with *Forrest Gump*, *Cast Away*, and *Back to the Future*; animation/live-action breadth and canonical date already exist. |
| [ ] ★ A03 *The Iron Giant* (1999) | `5/5/4/2/2/3/0/3−0=24` | Completes Brad Bird through *Ghost Protocol*, *The Incredibles*, and *Ratatouille* without adding another crowded franchise sequel. |
| [ ] ★ A04 *Glass Onion: A Knives Out Mystery* (2022) | `5/5/4/3/3/1/0/3−1=23` | Completes Rian Johnson and begins a defensible `knives-out` series; penalty for actor/genre overlap and a title that needs exact punctuation. |
| [ ] ★ A05 *The Rock* (1996) — stub | `5/5/5/4/2/1/2/3−0=27` | Rare true double-completer: Ed Harris and David Morse; also introduces Nicolas Cage/Sean Connery lanes without relying on an existing mega-hub. |
| [ ] ★ A06 *Ex Machina* (2014) | `5/4/5/4/2/2/0/3−0=25` | Double-completes Oscar Isaac and Domhnall Gleeson; compact cast and a useful sci-fi anchor, though Sci-Fi is already the second-largest genre. |
| [ ] ★ A07 *Skyfall* (2012) — stub | `5/5/5/3/3/1/2/3−0=27` | Completes Javier Bardem and links Daniel Craig to *Knives Out*; reuse `skyfall` and do not invent a broad Bond series unless the metadata policy is decided. |
| [ ] ★ A08 *Dumb and Dumber* (1994) — stub | `5/5/4/3/2/3/2/3−0=27` | Completes Jeff Daniels and strengthens Comedy without needing a deep cast; Jim Carrey is already group-ready, so avoid padding beyond the principals. |
| [ ] ★ A09 *Walk the Line* (2005) — stub | `5/5/4/3/2/2/2/3−0=26` | Completes Joaquin Phoenix and adds a musical/romance-flavored drama anchor; straightforward graduation. |
| [ ] ★ A10 *Cars* (2006) — stub | `5/5/4/3/2/3/2/3−1=26` | Completes John Ratzenberger and links Owen Wilson; slight animation/voice-cast ambiguity penalty, but the existing date makes it efficient. |
| [ ] ★ A11 *Sherlock Holmes* (2009) — stub | `5/5/4/4/2/1/2/3−0=26` | Completes Jude Law and links Robert Downey Jr.; recognizable non-superhero action/mystery anchor. |
| [ ] ★ A12 *Avatar* (2009) — stub | `5/5/4/3/2/2/2/3−1=25` | Completes Sigourney Weaver and creates a future Avatar package; penalty because the film is a broad hub and Sci-Fi is already dense. |
| [ ] ★ A13 *Shaun of the Dead* (2004) — stub | `5/5/4/3/2/3/2/3−0=27` | Completes Simon Pegg and repairs both Comedy and Horror; unusually good breadth-to-risk ratio. |
| [ ] ★ A14 *Dune: Part Two* (2024) — stub | `5/5/5/4/3/2/2/3−1=28` | Completes Rebecca Ferguson, extends Denis Villeneuve and a real Dune series; penalized only for Sci-Fi/hub concentration. |
| [ ] ★ A15 *Point Break* (1991) — stub | `5/5/4/3/2/3/2/3−0=27` | Advances Kathryn Bigelow from two to three directors, adds Keanu Reeves and Patrick Swayze links, and graduates a popular stub. |
| [ ] ★ A16 *Do the Right Thing* (1989) — stub | `5/5/5/3/1/3/2/3−0=27` | With C01+C02, completes Spike Lee from existing *Inside Man*; a major breadth anchor and efficient stub graduation. |

### B. Additional one-short completers (12)

| Pick | Film | Score | What it unlocks / caveat |
|---|---|---:|---|
| [ ] ★ B01 *Vice* (2018) | `5/4/5/4/3/1/0/3−1=24` | Completes Adam McKay; links Christian Bale and Steve Carell, but both are already dense enough to justify a concentration penalty. |
| [ ] ★ B02 *Argo* (2012) | `5/5/4/3/3/1/0/3−0=24` | Completes Ben Affleck and adds a recognizable director/actor card with a restrained graph footprint. |
| [ ] B03 *50 First Dates* (2004) | `4/5/4/3/2/3/0/3−1=23` | Completes Drew Barrymore and opens an Adam Sandler comedy lane; penalty for star-driven redundancy. |
| [ ] ★ B04 *Boyz n the Hood* (1991) | `5/5/4/3/2/3/0/3−0=25` | Completes Cuba Gooding Jr. and materially broadens Black-led 1990s drama beyond the current crime/war hubs. |
| [ ] ★ B05 *Before Sunrise* (1995) | `5/4/4/3/2/3/0/3−0=24` | Completes Ethan Hawke and adds a canonical Romance card; sequels can remain out until their marginal value is proven. |
| [ ] ★ B06 *School of Rock* (2003) | `5/5/4/3/2/3/0/3−0=25` | Completes Joan Cusack and starts a useful Jack Black comedy/animation lane. |
| [ ] ★ B07 *The Thing* (1982) — stub | `5/5/5/3/1/3/2/3−0=27` | Completes Kurt Russell and is one quarter of the C13–C15 John Carpenter package; disambiguate from the 2011 film. |
| [ ] B08 *X-Men: First Class* (2011) | `4/5/4/4/3/1/0/3−1=23` | Completes Michael Fassbender and begins a defensible X-Men series, but adds superhero/franchise density. It is new, not the existing `x-men` stub. |
| [ ] B09 *Sideways* (2004) | `4/4/4/3/2/2/0/3−0=22` | Completes Paul Giamatti without leaning on the previously struck recent *Holdovers*; moderate recognizability is the only concern. |
| [ ] B10 *Harry Potter and the Goblet of Fire* (2005) | `5/5/5/3/2/1/0/3−1=23` | Completes Ralph Fiennes; paired with C12 it takes the existing two-film Harry Potter series to four, but actor/series ambiguity must be tested. |
| [ ] B11 *Miss Congeniality* (2000) | `5/5/4/3/2/3/0/3−0=25` | Completes Regina King and adds Sandra Bullock/comedy breadth with little mega-hub overlap. |
| [ ] B12 *Steel Magnolias* (1989) | `4/5/4/3/1/3/0/3−0=23` | Completes Sally Field and strengthens women-led ensemble drama; Julia Roberts is already group-ready, so she is a link rather than the reason. |

### C. New cluster packages — keep or strike as packages (18)

For package scoring, `C` assumes the complete package is kept. If only one member survives, reduce its Connections score by 2–3 points.

| Pick | Film | Score | What it unlocks / caveat |
|---|---|---:|---|
| [ ] ★ C01 *Malcolm X* (1992) | `5/5/5/4/2/3/0/3−0=27` | **Spike Lee package 1/2:** with A16 and C02 joins existing *Inside Man* for a four-director group; strong Denzel link. |
| [ ] ★ C02 *BlacKkKlansman* (2018) | `5/4/5/3/3/3/0/3−0=26` | **Spike Lee package 2/2:** contemporary endpoint and John David Washington/Adam Driver lanes; less universally known than the other two, but mechanically necessary. |
| [ ] ★ C03 *Snowpiercer* (2014 policy year; 2013 origin) | `5/4/5/4/3/3/0/3−0=27` | **Bong package 1/3:** Chris Evans and Tilda Swinton link outward while the director group connects isolated *Parasite*; [Film Independent](https://www.filmindependent.org/press-releases/bong-joon-ho-snowpiercer-north-american-premiere-opening-night-2014-los-angeles-film-festival/) records the US release as June 27, 2014. |
| [ ] ★ C04 *Memories of Murder* (2005 proposed policy year; 2003 origin) | `4/3/5/2/2/3/0/2−1=20` | **Bong package 2/3, genuine deep cut:** low broad recognition but it is the package's authored deep-cut slot; Phase 2 must confirm the reported July 2005 US run and exact romanization. |
| [ ] ★ C05 *Mickey 17* (2025) — stub | `5/4/5/3/3/3/2/3−0=28` | **Bong package 3/3:** graduates a current stub and links Robert Pattinson/Toni Collette; current enough to keep the package from feeling academic. |
| [ ] ★ C06 *My Neighbor Totoro* (1988 proposed display year; Chronology unresolved) | `5/5/5/1/1/3/0/1−2=19` | **Miyazaki package 1/3:** iconic animation, but no contemporaneous US theatrical run is established; propose a 1988 undated full card unless Buri later rules a re-release into Chronology. |
| [ ] ★ C07 *Princess Mononoke* (1999 policy year; 1997 origin) | `5/4/5/2/2/3/0/2−1=22` | **Miyazaki package 2/3:** recognizable international animation; the [documented US run](https://www.nausicaa.net/miyazaki/mh/usatheaters.html) begins October 29, 1999, while the NYFF premiere is excluded. |
| [ ] ★ C08 *Howl's Moving Castle* (2005 policy year; 2004 origin) | `5/5/5/2/2/3/0/2−1=23` | **Miyazaki package 3/3:** completes the director group with *Spirited Away*; [Disney's D23](https://d23.com/a-to-z/howls-moving-castle/) records a June 10, 2005 limited US release. |
| [ ] C09 *Gravity* (2013) — stub | `4/5/5/3/3/3/2/3−1=27` | **Cuarón package 1/4:** highly recognizable and efficient; Sandra Bullock/George Clooney create some hub overlap. |
| [ ] C10 *Roma* (2018) — stub | `4/4/5/1/3/3/2/3−1=24` | **Cuarón package 2/4:** major international breadth pick with low outward links; theatrical-vs-streaming evidence must be preserved. |
| [ ] C11 *Children of Men* (2006) | `5/4/5/3/2/3/0/3−0=25` | **Cuarón package 3/4:** strong genre-canon anchor with Clive Owen/Julianne Moore links. |
| [ ] C12 *Harry Potter and the Prisoner of Azkaban* (2004) | `5/5/5/4/2/2/0/3−1=25` | **Cuarón package 4/4:** also pairs with B10 to complete the Harry Potter series; penalty for predictable cast/series cross-group ambiguity. |
| [ ] C13 *Escape from New York* (1981) — stub | `4/4/5/3/1/3/2/3−0=25` | **Carpenter package 1/3:** with B07, C14, C15 creates a new director group and reinforces Kurt Russell without using a modern franchise. |
| [ ] C14 *They Live* (1988) | `4/4/5/2/1/3/0/3−1=21` | **Carpenter package 2/3:** cult-recognizable but near the deep-cut line; keep only with the whole package. |
| [ ] C15 *Halloween* (1978) | `5/5/5/3/3/3/0/3−0=27` | **Carpenter package 3/3:** iconic 1970s repair and Horror anchor; exact 1978 original avoids remake collision. |
| [ ] C16 *You've Got Mail* (1998) | `5/5/5/3/2/3/0/3−0=26` | **Nora Ephron package 1/3:** joins existing *Sleepless in Seattle*, reconnects Tom Hanks/Meg Ryan, and strengthens Romance. |
| [ ] C17 *Julie & Julia* (2009) | `4/4/5/3/2/3/0/3−0=24` | **Nora Ephron package 2/3:** adds Meryl Streep/Amy Adams links while avoiding another male-director cluster. |
| [ ] C18 *Michael* (1996) | `3/4/5/3/2/2/0/2−1=20` | **Nora Ephron package 3/3:** package capper through John Travolta; title collision risk demands the exact 1996 film and a strong review rationale. |

### D. 1970s repair and classic-stub graduations (15)

`prior strike` records Stage B's chronology-only decision. A full card can have new mechanical value, but the old ruling remains negative taste evidence rather than disappearing.

| Pick | Film | Score | What it unlocks / caveat |
|---|---|---:|---|
| [ ] D01 *Willy Wonka & the Chocolate Factory* (1971) — prior strike | `3/5/2/2/3/3/0/3−1=20` | Strong family-era anchor but little immediate graph value; use the 1971 title, not *Wonka* or the 2005 remake. |
| [ ] ★ D02 *American Graffiti* (1973) — prior strike | `4/5/3/4/3/3/0/3−1=24` | Fresh 1970s/coming-of-age coverage with George Lucas, Harrison Ford, and Richard Dreyfuss links; high card value justifies re-presenting the strike. |
| [ ] ★ D03 *Enter the Dragon* (1973) — prior strike | `4/5/2/2/3/3/0/3−1=21` | Broadly recognizable martial-arts lane with little current overlap—breadth is the reason, not yield. |
| [ ] D04 *The Texas Chain Saw Massacre* (1974) — prior strike | `4/5/3/1/3/3/0/3−1=21` | Iconic Horror and era repair, but likely remains isolated unless the horror package grows. Exact title uses “Chain Saw.” |
| [ ] D05 *Monty Python and the Holy Grail* (1975) — prior strike | `3/5/3/3/3/3/0/3−1=22` | Comedy/UK breadth and a future Python cluster; prior strike and ensemble-name density temper the score. |
| [ ] D06 *The Rocky Horror Picture Show* (1975) — prior strike | `3/5/2/2/3/3/0/3−1=20` | Recognizable cult musical with low strict-yield value; do not confuse its id with `the-rock`. |
| [ ] ★ D07 *Carrie* (1976) — stub | `5/5/4/3/3/3/2/3−0=28` | Efficient Horror/1970s addition through Brian De Palma and Sissy Spacek; specify the 1976 original. |
| [ ] D08 *Close Encounters of the Third Kind* (1977) — stub | `5/5/4/3/3/2/2/3−1=26` | Spielberg is already at nine, but this is a canonical 1970s repair with a locked date ruling; concentration penalty prevents an automatic keep. |
| [ ] D09 *Saturday Night Fever* (1977) — stub | `5/5/3/3/3/3/2/3−0=27` | Strong era/musical-pop-culture card and John Travolta link; efficient graduation. |
| [ ] D10 *Superman* (1978) — stub | `5/5/3/4/3/2/2/3−1=26` | Major era/franchise anchor with Gene Hackman and Marlon Brando links; must be titled/id'd distinctly from the 2025 stub. |
| [ ] D11 *The Deer Hunter* (1978) — stub | `5/5/4/4/3/2/2/3−1=27` | De Niro/Streep/Walken create strong links and 1970s War breadth, but De Niro concentration earns a penalty. |
| [ ] D12 *Kramer vs. Kramer* (1979) — stub | `5/5/3/3/3/2/2/3−0=26` | Recognizable family drama with Dustin Hoffman/Meryl Streep; clean era repair and graduation. |
| [ ] D13 *The Sting* (1973) — stub, Stage B keep | `5/5/3/3/3/2/2/3−0=26` | Converts an already-approved chronology anchor into a Redford/Newman card; graph value is moderate but confidence is high. |
| [ ] D14 *Serpico* (1973) — stub, Stage B keep | `5/5/3/3/3/2/2/3−1=25` | Strong Pacino/Crime link and era repair; Pacino is already at ten, so breadth—not density—must carry the keep. |
| [ ] D15 *Dog Day Afternoon* (1975) — stub, Stage B keep | `5/5/4/4/3/2/2/3−1=27` | Pacino plus John Cazale and Sidney Lumet value; another dense Crime card, but one with exceptional recognizability. |

### E. International and women-director breadth (12)

| Pick | Film | Score | What it unlocks / caveat |
|---|---|---:|---|
| [ ] ★ E01 *Lady Bird* (2017) | `5/5/3/4/3/3/0/3−0=26` | Adds a second Greta Gerwig director card and strong Saoirse Ronan/Laurie Metcalf links; high recognizability for a breadth pick. |
| [ ] ★ E02 *Little Women* (2019) | `5/5/4/4/3/3/0/3−0=27` | Takes Gerwig to three and links Ronan, Florence Pugh, Emma Watson, and Timothée Chalamet; ensemble ambiguity must be watched but the value is real. |
| [ ] E03 *Lost in Translation* (2003) | `5/5/3/3/2/3/0/3−0=24` | Sofia Coppola and women-director breadth with Bill Murray/Scarlett Johansson links; strong favorite despite no immediate completion. |
| [ ] E04 *Selma* (2014) | `5/5/3/3/2/3/0/3−0=24` | Ava DuVernay, David Oyelowo, and historical-drama breadth; graph value is modest but the canon case is strong. |
| [ ] E05 *The Farewell* (2019) | `4/4/2/2/3/3/0/3−0=21` | Lulu Wang and Asian-American breadth; likely low immediate yield, honestly labeled. |
| [ ] E06 *Past Lives* (2023) | `4/4/2/2/3/3/0/3−0=21` | Celine Song and recent Romance breadth; a quality/current pick more than a graph pick. |
| [ ] E07 *Portrait of a Lady on Fire* (2019) | `3/3/2/1/3/3/0/2−1=16` | Genuine deep cut for Céline Sciamma, international cinema, and queer Romance; keep only inside the 10–15% deep-cut budget. |
| [ ] E08 *Amélie* (2001 policy year) | `4/5/2/2/2/3/0/2−0=20` | Highly recognizable international Romance; audit exact first-US-theatrical evidence before the year is locked. |
| [ ] E09 *Oldboy* (2005 proposed policy year; 2003 origin) | `4/4/2/2/2/3/0/2−1=18` | Korean thriller breadth with title/remake risk; specify Park Chan-wook's film and confirm the [reported March 25, 2005 US public opening](https://elcinema.com/en/work/2018487/released) in Phase 2. |
| [ ] E10 *Godzilla Minus One* (2023) | `5/5/3/2/3/3/0/3−0=24` | Current, recognizable Japanese blockbuster and a clean genre-breadth pick; series metadata should not collapse unrelated Godzilla continuities. |
| [ ] E11 *RRR* (2022) | `4/5/2/2/3/3/0/2−1=20` | Indian blockbuster breadth and genuine global recognition; long cast/transliteration/date audit is the cost. |
| [ ] E12 *Love & Basketball* (2000) | `4/4/3/3/2/3/0/3−0=22` | Gina Prince-Bythewood, Romance, sports, and Black-led breadth; modest yield but strong lane coverage. |

### F. Recent and popular additions (10)

This lane was refreshed with current sources on 2026-08-08. Box-office or awards visibility is evidence of recognition, never automatic curation. The [2025 domestic chart](https://www.boxofficemojo.com/year/2025/?area=us&grossesOption=calendarGrosses&releaseScale=all&sort=gross) places *Superman* third, *Sinners* seventh, and *F1* fourteenth. The [98th Academy Awards](https://www.oscars.org/oscars/ceremonies/2026) made *One Battle after Another* Best Picture and nominated *F1*, *Frankenstein*, *Marty Supreme*, and *Sinners*. The Associated Press reported *Spider-Man: Brand New Day* as the top film of its opening weekend and a major 2026 event, while also identifying *The Super Mario Galaxy Movie* among the year's commercial drivers ([AP, 2026-08-03](https://apnews.com/article/spiderman-box-office-a2c2efb863263ce50bcee1e7db822574)).

| Pick | Film | Score | What it unlocks / caveat |
|---|---|---:|---|
| [ ] F01 *Wicked* (2024) — stub | `4/5/2/2/3/3/2/3−1=23` | Efficient current musical/fantasy anchor; low immediate graph yield and a likely future two-film package rather than a group today. |
| [ ] ★ F02 *Sinners* (2025) — stub | `5/5/4/3/3/3/2/3−0=28` | Current commercial and awards anchor, Ryan Coogler/Michael B. Jordan lane, Horror-adjacent breadth, and an existing policy date. |
| [ ] F03 *One Battle After Another* (2025) | `5/4/4/4/3/1/0/3−2=22` | Best Picture and a fifth PTA film, but Leonardo DiCaprio is already at 11 and the director group is already ready; strong recognition, weak marginal variety. |
| [ ] F04 *F1* (2025) — stub | `4/5/2/3/3/1/2/3−2=21` | Current hit and efficient stub; Brad Pitt is already at 11 and immediate cluster value is low. Preserve the repo's exact `F1` title unless the card-title convention changes. |
| [ ] F05 *Superman* (2025) — stub | `5/5/2/2/3/1/2/3−1=22` | Clear current blockbuster, but low immediate links; must reuse `superman-2025` and the card title `Superman (David Corenswet)` unless separately re-ruled. |
| [ ] F06 *KPop Demon Hunters* (2025) | `4/5/2/1/0/3/0/3−2=16` | Major current animation/cultural pick; streaming-only chronology likely means undated, exactly the `Soul` class that must not be silently normalized. |
| [ ] F07 *Spider-Man: Brand New Day* (2026) | `5/5/3/3/3/1/0/2−1=21` | The clearest 2026 popular anchor and a Tom Holland lane; extremely fresh metadata and Spider-Man continuity/title ambiguity require a cautious Phase 2. |
| [ ] F08 *The Super Mario Galaxy Movie* (2026) | `4/5/2/2/3/3/0/2−1=20` | 2026 family/animation relevance and future Mario series value; immediate graph links are modest and metadata is fresh. |
| [ ] F09 *Marty Supreme* (2025) | `4/4/3/3/3/2/0/3−1=21` | Current awards recognition and Timothée Chalamet support; lower broad recognition than the blockbuster candidates. |
| [ ] F10 *Frankenstein* (2025) | `4/4/3/3/3/3/0/3−1=22` | Current awards/horror-gothic breadth and Guillermo del Toro support; explicit 2025 disambiguation is mandatory. |

### G. Deep cuts with a specific mechanical reason (6)

These are not filler. Each has a one-short reason, but the lower recognizability or prior strike must fit inside the wave's deep-cut budget.

| Pick | Film | Score | What it unlocks / caveat |
|---|---|---:|---|
| [ ] G01 *Juno* (2007) — prior strike | `4/4/5/3/2/3/0/3−2=22` | Completes J.K. Simmons and adds Diablo Cody/Comedy breadth; prior strike means the mechanical reason must outweigh demonstrated taste. |
| [ ] G02 *The Holdovers* (2023) — prior strike | `3/4/5/3/3/1/0/3−2=20` | Completes Paul Giamatti and is current enough to recognize, but the Stage B strike is direct negative evidence. |
| [ ] G03 *Dallas Buyers Club* (2013) | `4/5/4/3/2/2/0/3−0=23` | Completes Jared Leto and links Matthew McConaughey; recognizable but award-drama-heavy. |
| [ ] G04 *La Vie en Rose* (2007 policy year) | `3/4/4/2/2/3/0/2−1=19` | Completes Marion Cotillard and adds French/international breadth; exact US date and accented names need careful audit. |
| [ ] G05 *Bull Durham* (1988) | `4/4/4/3/1/2/0/3−0=21` | Completes Tim Robbins and adds a sports/romance lane through Kevin Costner and Susan Sarandon. |
| [ ] G06 *Pleasantville* (1998) | `4/4/4/4/2/2/0/3−0=23` | Completes William H. Macy and creates useful Reese Witherspoon/Tobey Maguire/Jeff Daniels links; underrated but not obscure. |

### H. Recognizable favorites with lower immediate yield (8)

| Pick | Film | Score | What it unlocks / caveat |
|---|---|---:|---|
| [ ] H01 *Clueless* (1995) | `5/5/2/2/2/3/0/3−0=22` | High-recognition women-directed Comedy with little current graph support; a pure breadth favorite. |
| [ ] H02 *Legally Blonde* (2001) | `5/5/3/3/2/3/0/3−0=24` | Popular women-led Comedy and Reese Witherspoon support; no immediate four-group completion. |
| [ ] H03 *Mean Girls* (2004) | `5/5/2/3/2/3/0/3−0=23` | Extremely recognizable Comedy and Tina Fey/Lindsay Lohan lane; specify the 2004 original. |
| [ ] H04 *The Breakfast Club* (1985) — stub | `5/5/2/2/1/3/2/3−0=23` | Efficient 1980s graduation and teen-comedy anchor; little mechanical value today. |
| [ ] H05 *Ghostbusters* (1984) — stub | `5/5/3/4/1/3/2/3−1=25` | Murray/Aykroyd/Weaver links and franchise value; avoid title-prefix collisions with *Ghostbusters II* and *Ghost*. |
| [ ] H06 *Die Hard* (1988) — stub | `5/5/3/4/1/2/2/3−1=24` | Canonical Action card and efficient stub; Bruce Willis is already at seven, so this is recognizability more than scarcity. |
| [ ] H07 *Top Gun: Maverick* (2022) — stub | `5/5/3/4/3/1/2/3−2=24` | Major modern favorite and real series mate; Tom Cruise is already at 13 and action/franchise concentration is severe. |
| [ ] H08 *The Batman* (2022) — stub | `5/5/2/4/3/1/2/3−2=23` | Broad recent favorite with Pattinson/Farrell links; never tag it `dark-knight`, and avoid Batman/remake title confusion. |

## 6. Tempting titles I recommend against in this wave

| Film | Why strike for Wave 3 |
|---|---|
| *The Wild Robot* (2024) | Stage B already struck it; good animation but no current graph completion, and F06/F08 cover recent animation if wanted. |
| *CODA* (2021) | Prior strike plus streaming-era chronology/date complexity; low current graph value. |
| *Hamilton* (2020) | Prior strike, captured-stage-work boundary, streaming-only date class, and unclear fit with the feature-film pool. |
| *Mission: Impossible – The Final Reckoning* (2025) | Tom Cruise 13, series already 5, Simon Pegg/Ving Rhames already ready: almost pure overconcentration. |
| *Killers of the Flower Moon* (2023) — stub | Scorsese 10 plus DiCaprio/De Niro 11 each; an excellent movie with unusually poor marginal-variety economics. |
| *Asteroid City* (2023) | Wes Anderson and many of its actors are already group-ready; adds accidental-group risk more than breadth. |
| *Joker: Folie à Deux* (2024) | Sequel recognition does not offset weak demonstrated fit and limited new-link value. |
| *Toy Story 5* (2026) | Toy Story is already a four-film series; Hanks 13, Ratzenberger can be completed more efficiently with *Cars*, and current-event novelty is not enough. |

## 7. Duplicate, ambiguity, concentration, and metadata-risk appendix

### Already present; do not propose as new cards

- `Sleepless in Seattle` is already a full Movie and is the existing Nora Ephron package anchor.
- `Rocky` is already full; its 1976 limited-opening date is ruled ours-correct.
- `Ford v Ferrari`, *The Dark Knight* trilogy, the *Lord of the Rings* trilogy, and the *Godfather* trilogy are already full.
- The matching pass treated *X-Men: First Class* as **new**; it is not the `x-men` stub. It also treated *The Rocky Horror Picture Show* as **new**; it is not `the-rock`.

### Title/remake/continuity collisions to pin in Phase 2

- *Superman* (1978) → existing `superman`; *Superman* (2025) → existing `superman-2025` and current disambiguated title.
- *The Thing* means 1982; *Carrie* means 1976; *Frankenstein* means 2025; *Mean Girls* means 2004; *The Batman* means 2022.
- *Oldboy* means Park Chan-wook's 2003-origin film, whose Match Cut year likely follows its 2005 US theatrical date.
- *Michael* means Nora Ephron's 1996 film. *Ghostbusters* must not prefix-match *Ghostbusters II* or *Ghost*.
- Harry Potter additions may create a real four-film series, but cross-group ambiguity with Ralph Fiennes and recurring cast must pass the dealer's strict gate.
- Dune, Spider-Man, X-Men, Batman, Superman, Godzilla, Avatar, and Frankenstein metadata must not collapse remakes or unrelated continuities into one series id.

### Accidental-group and concentration risks

- The current strict sample rejects roughly 70% of checked viable key sets within eight tries. More Drama/Sci-Fi/Crime cards or mega-hub actors can increase poisoning even when raw yield rises.
- The generator's most common accidental alternative groups remain Crime, Sci-Fi, Drama, Comedy, Thriller, and Action. That is why Horror/Romance/international packages score above redundant prestige crime.
- A package can create its intended director group and simultaneously poison actor or genre groups. The only trustworthy before/after answer comes after a selected draft is temporarily evaluated and the strict generator is rerun.
- Current `docs/connections-yield.md` records the historical 9,862,379-key output from before the current ≤1-genre formation lock. The reproducible 2026-08-08 command outputs 9,562,667 and ≈2,868,800 strict. This artifact records the live result; the historical report should be regenerated only with the selected merged wave.

### Metadata/date risks

- International year proposals follow the standing first-US-theatrical rule: *Snowpiercer* 2014, *My Neighbor Totoro* 1993, *Princess Mononoke* 1999, *Howl's Moving Castle* 2005, and *Oldboy* 2005. The selected-title workflow corrected the Phase-1 Totoro assumption: its Streamline dub had a qualifying limited U.S. theatrical opening on 1993-05-07.
- F06 is a `Soul`-class undated full card. Netflix identifies the original *KPop Demon Hunters* debut as streaming-only on 2025-06-20; later sing-along theatrical events do not retroactively qualify it for Chronology.
- 2025–2026 titles have high recognition but the freshest credits and date evidence; they receive metadata penalties until audited.
- Phase 1 used titles, known principal links, repo evidence, current box-office/awards sources, and conservative caveats. It did **not** attempt final writer/billing/deep-cast objects; that work is deliberately behind your selection checkpoint.

The older canon check used the [AFI 100 Movies anniversary list](https://www.afi.com/afis-100-years-100-movies-10th-anniversary-edition/) only as a recognizability/canon cross-check. AFI status did not override prior strikes or low graph value.

## 8. Original 36-card recommendation — superseded

### High-value completers and efficient graduations (22)

`A01–A16` plus `B01`, `B02`, `B04`, `B05`, `B06`, `B07`.

This closes Eastwood director+actor, Zemeckis, Brad Bird, Rian Johnson, Adam McKay, Ben Affleck, Cuba Gooding Jr., Ethan Hawke, Joan Cusack, Kurt Russell, Ed Harris, David Morse, Oscar Isaac, Domhnall Gleeson, Javier Bardem, Jeff Daniels, Joaquin Phoenix, John Ratzenberger, Jude Law, Sigourney Weaver, Simon Pegg, and Rebecca Ferguson, assuming final credits hold.

### Coherent breadth packages (8)

`C01–C08`: Spike Lee (2 additions around A16 + existing *Inside Man*), Bong Joon-ho (3 around *Parasite*), and Hayao Miyazaki (3 around *Spirited Away*).

### Era/creator/current balance (6)

`D02` *American Graffiti*; `D03` *Enter the Dragon*; `D07` *Carrie*; `E01` *Lady Bird*; `E02` *Little Women*; `F02` *Sinners*.

This recommendation is **20 entirely new full cards + 16 stub graduations**. It adds only three 1970s cards, so the dated 1970s would move from 34 to approximately 37, not 50. To make the old floor the priority, swap in 13 more D-lane titles and accept that several are prior strikes with lower graph yield.

Projected mix: roughly 31–33 broad anchors and 3–5 deep/edge picks depending on how you classify *Memories of Murder*, the Miyazaki package, and *Enter the Dragon*—approximately the prior 85–90% / 10–15% policy.

## 9. Selection checkpoint — resolved

Buri resolved this checkpoint on 2026-08-08:

```text
KEEP: all A, all B, C01–C17, all E, all F
STRIKE: C18 and all D
NO ADDITIONS: G or H
TOTAL: 67
```

The candidate module and audit evidence were created only after this instruction. Settled top-cast, screenplay-only, exact-name, international-date, festival-exclusion, and streaming-only policies were applied without re-presenting those classes as new rulings. Runtime merge remains gated on completion of the selected metadata review.
