# Match Cut movie-pool health report — 2026-08-24

> **Owner decision after review (2026-08-24):** the recommendation to hold the
> 89-film Daily Puzzle/Duel pool was rejected. The active product direction is
> to design a **150–200 real-film cutover plus an expanded wild-card set**, while
> preserving full person-link connectivity and a high minimum degree. The audit
> verdict below is retained as the original evidence-based recommendation, not
> the current product decision. No pool, seed, rule, or wild-card source has been
> changed yet.

## Executive verdict

**Recommendation: hold the current pools. Confidence: high (0.90).** Match Cut
does not have a launch-blocking movie-volume problem. The frozen 89-film graph
is dense, has no isolates, and is one connected component; Chronology exposes
all 482 dated films in the fixed year with a narrow 2–18 appearance range; and
the 304-film credited pool already supplies 192 group-ready Connections keys
(175 director/actor, five series, and 12 genre).

The material issues are **selection concentration, not catalog size**:

- Daily Puzzle's 10 highest-degree films are 11.24% of its pool but occupy
  18.53% of its 2,920 fixed-window slots and touch 33.70% of the best-line
  solution edges.
- Connections uses 292 of 304 credited films, but 77.19% of its 1,460 baked
  groups are actor groups, 128/365 grids (35.07%) are all-actor, and 289/365
  (79.18%) contain at least three actor groups.
- Connections' 10 most exposed films occupy 9.97% of all grid slots even though
  10 films are only 3.29% of the credited pool. Its most exposed titles are
  largely reusable franchise cards, not the highest person-link graph hubs.
- The 304-film person-link graph has seven isolates and two small islands, but
  the dealer can still use some of those films through genre/director groups.
  More movies alone would not guarantee better exposure or category variety.

If expansion is reconsidered after the launch gate, use a **targeted 12–20 film
credited wave**, not a broad slate. Its job should be to bridge fragile graph
cards, complete near-ready director/series keys, and graduate selected existing
Chronology stubs. It must not automatically change the frozen 89; a Daily/Duel
cutover remains a separate re-pin/re-tune decision.

All numbers below are direct local computations unless marked **Inference**.
The machine-readable source is
`docs/movie-pool-health-data-2026-08-24.json`.

## Method and fixed window

The analysis uses local repository data and canonical functions only. No TMDB,
web source, external API, credential, candidate research, data edit, grid bake,
seed change, or difficulty tune was used.

- Branch: `codex/daily-mode-polish`
- HEAD: `ce398376d0c03be5356d64000557817c2f0150c3`
- Window: **2026-07-06 through 2027-07-05 inclusive** (365 local-calendar seed
  strings)
- Daily Puzzle: `dailySoloPuzzle(seed, DUEL_POOL)` plus `bestLine()`
- Chronology: `dealRoundShaped(seed, chronologyPool, 'standard')`
- Connections: the 365 committed baked grids anchored at 2026-07-06; the
  required verifier independently proved every baked grid equals `dealGrid()`
- Duel: static pool/graph analysis only. Duel has no 365-day published schedule,
  so this report does not present simulated deals as dailies.
- Person adjacency: `sharedPeople(a, b).length > 0`
- Tier: `linkTier(a, b, sharedPeople(a, b))`
- Same genre never inflates person-link degree; same-series opportunities are
  reported separately.

Primary sources:

- `src/data/movies.ts`, `src/data/duelPool.ts`,
  `src/data/chronology-pool.json`, `src/data/connections-grids.json`
- `src/data/types.ts`, `src/lib/daily.ts`, `src/lib/solver.ts`,
  `src/lib/chronology.ts`, `src/lib/connections.ts`
- `sim/solo-verify.ts`, `sim/chronology-verify.ts`,
  `sim/connections-verify.ts`, `sim/connections-gen.ts`
- `docs/connections-yield.md`, `docs/pool-unification.md`, and
  `docs/wave3-report.md` as historical context only

Reproduction command:

```sh
node /private/tmp/matchcut-movie-pool-audit-2026-08-24.mjs
```

The temporary script is analysis-only and is not a repository file. Validation
also ran `npm run verify:solo`, `npm run verify:chronology`, and the exhaustive
`npm run verify:connections` (14/14).

## Straight pool counts

| Pool or artifact | Exact current count | Meaning |
|---|---:|---|
| Fully credited `MOVIES` | 304 films | Author-time Connections pool and canonical credited records |
| Frozen Daily Puzzle / Duel pool | 89 films | Shared tuned pool; all IDs resolve |
| Duel wild cards | 3 non-movie mechanics | Not counted as films |
| Chronology pool | 482 dated films | 292 credited films with dates + 190 dated stubs |
| Baked Connections window | 365 grids | Four groups of four per day |
| Baked Connections slots | 5,840 | 365 × 16 |
| Unique credited films used in baked Connections | 292 | 12 credited films are unused in the fixed window |

ID integrity is clean: no duplicate IDs in the credited, frozen, or Chronology
pools; no unresolved frozen IDs; no baked grid points outside `MOVIES`; and the
baked anchor is exactly 2026-07-06.

## Pool overlap

Counts are not additive because the frozen 89 is a subset of `MOVIES`, 292
credited films also have Chronology dates, and every baked-used film is credited.
The full four-set union is 494 unique IDs.

| Intersection count | Credited | Frozen 89 | Dated | Baked-used |
|---|---:|---:|---:|---:|
| **Credited** | 304 | 89 | 292 | 292 |
| **Frozen 89** | 89 | 89 | 89 | 89 |
| **Dated** | 292 | 89 | 482 | 282 |
| **Baked-used** | 292 | 89 | 282 | 292 |

Useful exact partitions:

- 89 films are credited + frozen + dated + baked-used.
- 193 are credited + dated + baked-used but outside the frozen 89.
- 10 are credited + dated but unused in the baked year.
- 10 are credited + baked-used but lack a Chronology date.
- 2 are credited-only in this four-set census.
- 190 are dated-only stubs without credited `Movie` metadata.
- 12 credited films lack a Chronology date.
- 12 credited films never appear in the baked Connections year.
- No frozen film is missing from the baked year.

The 12 credited records without a local Chronology date are: *2001: A Space
Odyssey*, *Casablanca*, *Dr. Strangelove*, *KPop Demon Hunters*, *North by
Northwest*, *Psycho*, *Rear Window*, *Soul*, *The Good, the Bad and the Ugly*,
*The Hobbit: An Unexpected Journey*, *The Wizard of Oz*, and *Vertigo*. This is
a local completeness flag, not a request to invent or web-correct dates.

## Exposure and repetition

### Summary

| Mode | Population | Slots | Min | Median | Mean | P90 | Max | Zero | Top 10 slot share | Top 25 slot share |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Daily Puzzle | 89 | 2,920 | 10 | 30 | 32.81 | 54 | 65 | 0 | 19.38% | 43.39% |
| Chronology | 482 | 4,015 | 2 | 8 | 8.33 | 12 | 18 | 0 | 3.74% | 8.79% |
| Connections | 304 | 5,840 | 0 | 17 | 19.21 | 35 | 63 | 12 | 9.97% | 20.92% |

The concentration rows are mode-specific. They must not be combined into a
single cross-mode frequency because the board sizes, pool sizes, and dealer
contracts differ.

### Daily Puzzle

The fixed year contains 365/365 unique boards, each one starter + seven hand
cards. Every frozen film appears at least 10 times. Starter exposure runs 1–11
(median 4); hand exposure runs 3–60 (median 26).

Most exposed:

| Film | Appearances |
|---|---:|
| Once Upon a Time in Hollywood | 65 |
| Saving Private Ryan | 60 |
| The Irishman | 59 |
| Casino | 56 |
| Catch Me If You Can | 56 |

Least exposed include *Fargo* (10), *No Country for Old Men* (11), *The Silence
of the Lambs* (11), *The Sixth Sense* (11), and *The Social Network* (11).

Par distribution over this fixed window is 7×10, 8×64, 9×123, 10×83, 11×71,
and 12×14. This differs slightly from a rolling-from-today verifier histogram
because the audit deliberately fixes the Connections anchor year.

Adjacent days share at least one film on 188/364 boundaries (51.65%), with 312
repeated-film occurrences and a maximum of five repeats across one boundary.
On 356/365 days, at least one film had also appeared somewhere in the preceding
six days. The top seven-day repeaters include *Once Upon a Time in Hollywood*,
*Saving Private Ryan*, *The Irishman*, *Goodfellas*, and *Casino*.

**Finding:** the constructive graph walk favors hubs. The 10 highest-degree
films take 18.53% of slots and touch 861/2,555 (33.70%) of the edges in the
solver's best lines. That does not invalidate solvability or par, but it can
make the daily catalog feel narrower than 89 films.

### Chronology

Each day is one anchor + 10 hand films. Every dated film appears in the fixed
year. Total exposure is tightly bounded at 2–18, while anchor exposure is
naturally sparse: 233 films are never anchors, but all still appear in hands.

Most exposed are *Up* (18), *Joker* (16), *Die Hard* (15), *Gone Girl* (15),
*The Waterboy* (15), and *Zero Dark Thirty* (15). The minimum-exposure group is
*A Star Is Born*, *Ex Machina*, *Nomadland*, *Ocean's Twelve*, and *The
Revenant*, each at 2.

Adjacent days repeat films on 94/364 boundaries (25.82%), with 102 occurrences
and at most two repeated films on one boundary. The top 10 occupy only 3.74% of
slots. **Verdict:** the uniform Chronology schedule is the healthiest exposure
distribution of the three scheduled modes.

### Connections

The 365 committed grids use 292/304 credited films. The most exposed are *The
Return of the King* (63), *Harry Potter and the Goblet of Fire* (62), *Harry
Potter and the Prisoner of Azkaban* (62), *The Fellowship of the Ring* (62),
and *The Dark Knight Rises* (61).

The 12 unused films are *Casablanca*, *The Wizard of Oz*, *The Bourne Identity*,
*Whiplash*, *Slumdog Millionaire*, *Grease*, *Crouching Tiger, Hidden Dragon*,
*Past Lives*, *Oldboy*, *Godzilla Minus One*, *Wicked*, and *Sinners*.

Adjacent grids share films on 220/364 boundaries (60.44%), with 472 repeated
film occurrences and as many as eight repeats across one boundary. On 361/365
days, at least one film had appeared in the prior six days. The heaviest
seven-day repeaters are concentrated in Harry Potter, Lord of the Rings, and
Toy Story cards.

The 304-film person-degree/exposure Pearson correlation is 0.554: graph degree
matters, but does not fully explain selection. The top 10 person-degree hubs
occupy only 4.90% of grid slots; the most exposed franchise cards are a
different set. **Finding:** key/category selection and reusable series groups,
not only person-link hubs, drive repetition.

## Era, genre, people, series, and date coverage

### Credited pool by era

| Decade | Films |
|---|---:|
| 1930s | 1 |
| 1940s | 1 |
| 1950s | 3 |
| 1960s | 4 |
| 1970s | 13 |
| 1980s | 28 |
| 1990s | 69 |
| 2000s | 90 |
| 2010s | 74 |
| 2020s | 21 |

The credited graph is heavily modern: 254/304 films (83.55%) are from the
1990s onward. The Chronology pool is intentionally broader from 1971 onward.

### Dated pool by era

| Decade | Films |
|---|---:|
| 1970s | 34 |
| 1980s | 62 |
| 1990s | 98 |
| 2000s | 112 |
| 2010s | 115 |
| 2020s | 61 |

There are no missing years between 1971 and 2026, but the thin years are 1971
(3), 1972 (1), 1973 (3), 1975 (3), 1981 (2), 2020 (2), and 2026 (2). The most
crowded are 1999 and 2004 (16 each), 2019 (15), and 2012 (14).

There are 25 exact-date clusters. The largest is 2005-07-15 with three films;
the other listed clusters contain two. December 25 recurs most often as a
month/day (18 films across years), and the busiest year-month buckets contain
five films (2001-12, 2012-11, and 2014-10). Full cluster lists are in the JSON.

### Credited genres

Genre counts are **exclusive**, not multi-label: each credited `Movie` has one
canonical `genre` string.

| Genre | Films | Genre | Films |
|---|---:|---|---:|
| Drama | 53 | Sci-Fi | 40 |
| Action | 33 | Crime | 31 |
| Thriller | 31 | Comedy | 30 |
| Animation | 24 | Adventure | 20 |
| Romance | 18 | Horror | 11 |
| War | 7 | Western | 6 |

### People and series

The credited pool contains 159 exact director names, 344 writer names, 961
actors across top + deep cast, and 1,366 unique exact person strings across all
roles. Most frequent actor credits are Tom Hanks (15), Matt Damon (13), Tom
Cruise (13), Brad Pitt (12), Leonardo DiCaprio (12), Harrison Ford (11), Robert
De Niro (11), and Samuel L. Jackson (11). Most frequent directors are Martin
Scorsese (10), Christopher Nolan (9), Quentin Tarantino (9), and Steven
Spielberg (9).

Forty-two films have one of 17 series IDs; 262 have none. Five series are
group-ready for Connections (Mission: Impossible, Star Wars, Harry Potter,
Matrix, Toy Story), and three series sit exactly one film short of a group of
four. The exact-name normalization check found no locally visible punctuation/
diacritic variants collapsing to the same normalized person name. That proves
only local consistency, not external factual correctness.

No demographic identity, nationality, race, gender, or representation label
was inferred from names. Those remain unknown without a separate researched
method and explicit scope.

## Connection-graph health

Person-link degree excludes same genre. Visible links have at least one shared
person printed on both cards; a deep-only edge has no fully visible shared
person. Tiers use the canonical `linkTier()` over person-linked pairs. A film is
called fragile here only when all of its person-linked usefulness depends on
one exact credit string.

| Metric | Credited 304 | Frozen 89 |
|---|---:|---:|
| Person-linked edges | 2,244 | 513 |
| Density | 4.87% | 13.10% |
| Visible edges | 1,668 | 440 |
| Deep-only edges | 576 | 73 |
| Standard / strong / super edges | 1,660 / 475 / 109 | 323 / 148 / 42 |
| Degree min / median / mean / p90 / max | 0 / 14 / 14.76 / 27 / 43 | 2 / 11 / 11.53 / 19 / 25 |
| Zero-degree films | 7 | 0 |
| Connected components | 10 | 1 |
| Top-10 hubs: unique edges incident | 344 (15.33%) | 185 (36.06%) |
| Same-series opportunities | 49 | 18 |

### Credited 304 graph

The five largest hubs are *Saving Private Ryan* (43 neighbors), *Catch Me If
You Can* (41), *Once Upon a Time in Hollywood* (40), *The Departed* (40), and
*Pulp Fiction* (36). Top recurring edge carriers are Tom Hanks (105 edges), Matt
Damon (78), Tom Cruise (78), Brad Pitt (66), Leonardo DiCaprio (66), Harrison
Ford (55), Robert De Niro (55), and Samuel L. Jackson (55).

The main component contains 288 films. Outside it:

- a five-film component joins four Hayao Miyazaki films to *Godzilla Minus One*
  through one local actor link;
- a four-film Alfred Hitchcock component;
- seven isolates: *Casablanca*, *The Wizard of Oz*, *Past Lives*, *Amélie*,
  *Oldboy*, *Love & Basketball*, and *KPop Demon Hunters*.

Fragile one-credit examples include *Crouching Tiger, Hidden Dragon* →
Michelle Yeoh, *Godzilla Minus One* → Ryunosuke Kamiki, *Grease* → John
Travolta, *Portrait of a Lady on Fire* → Valeria Golino, *RRR* → Alison Doody,
*Sinners* → Hailee Steinfeld, *Slumdog Millionaire* → Danny Boyle, *The
Exorcist* → Max von Sydow, and *The Farewell* → Awkwafina. The last link is
deep-only under current local credit visibility.

There are 49 same-series pair opportunities across the credited pool, but zero
series-only edges: every same-series pair also shares at least one person under
the current credits. Series adds super-tier value but does not connect the
person-graph islands.

### Frozen 89 graph

All 89 films form one person-linked component. Only *The Sixth Sense* is at the
report's low-degree threshold (2 neighbors); no frozen film is isolated. The
highest-degree films are *Catch Me If You Can* (25), *Once Upon a Time in
Hollywood* (24), *The Irishman* (24), *The Departed* (23), and *Saving Private
Ryan* (21).

The top 10 hubs touch 36.06% of all frozen graph edges, so the graph is healthy
for connectivity but hub-dependent for deal construction. Robert De Niro
contributes to 55 frozen edges; Leonardo DiCaprio and Martin Scorsese each to
45; Christopher Nolan and Tom Hanks each to 36.

## Mode-specific health

### Daily Puzzle

- Source and board contract confirmed: 89 films; one starter + seven hand
  cards; 365/365 unique fixed-window boards; all solver-winnable.
- Par remains within 7–12 for this window and distributes across every value.
- No film is absent, but exposure is strongly degree-weighted. The highest-
  degree 10 films touch one-third of best-line edges.
- **Inference:** adding random movies to the frozen pool would not reliably
  flatten exposure. It would also reshuffle the append-only daily pin. A future
  remedy should first decide whether it is a content cutover, a schedule/dealer
  balancing change, or both.

### Duel

- Source contract confirmed: 89 real films + three non-movie wild cards.
- The static graph is dense (13.10%), fully connected, and has no isolates.
- Hub dependence exists, but no basic connectivity shortage justifies an
  emergency expansion.
- Any frozen-pool expansion changes the deal graph and invalidates the current
  difficulty tune. It requires a separate sim re-tune, Solo re-pin, parity gate,
  and explicit cutover approval.

### Chronology

- Source and round contract confirmed: 482 dated films; one anchor + 10 hand
  films.
- All 482 appear in the fixed year; top-10 concentration is only 3.74%.
- The 1970s are the thinnest complete decade at 34 films. Individual thin years
  remain visible, but there is no missing year from 1971 through 2026.
- Same-date and holiday-month clusters make some close calls intrinsically
  dense; the full ISO date and ID tiebreak still provide one correct slot.
- **Inference:** more dates are not the current need. Selected dated stubs can
  be graduated to credited records later without increasing Chronology volume.

### Connections

- Source and board contract confirmed: 304-film author-time pool; 4×4 board;
  365 baked grids; 14/14 verifier including the exact pinned digest and
  baked/dealer parity.
- Current group mix: actor 1,127; director 274; genre 31; series 28.
- Current key capacity is ample: 35 director, 140 actor, five series, and 12
  genre keys have at least four films. Near-ready keys: five director, 50 actor,
  and three series at exactly three films.
- The most repeated keys are Actor · Edward Norton (19 grids), Actor · Clint
  Eastwood (18), Actor · Timothée Chalamet (18), and Director · Peter Weir (17).
- Twelve credited films are unused, and repeated franchise cards dominate the
  slot leaders.
- **Inference:** a broad pool addition is unlikely to fix actor/category or
  franchise repetition unless the dealer/bake selection policy also changes.
  That is a rule/dealer decision with a re-bake and new pin, not a silent content
  merge.

## Cross-mode leverage

Eighty-nine films are actually used by all four modes in the fixed window—the
entire frozen pool. There are no exactly-three-mode credited films because
Daily Puzzle and Duel share the same frozen membership: outside that set, a
dated + baked-used credited film naturally spans Chronology and Connections,
not one of the two frozen modes independently.

Among credited films outside the frozen 89, the strongest local person-link
bridges back to it are:

| Film | Frozen person neighbors | Visible | Deep-only | Tier split S / St / Su |
|---|---:|---:|---:|---:|
| Ocean's Thirteen | 21 | 20 | 1 | 15 / 5 / 1 |
| Contagion | 17 | 14 | 3 | 16 / 1 / 0 |
| Cloud Atlas | 16 | 13 | 3 | 13 / 0 / 3 |
| Ocean's Twelve | 16 | 14 | 2 | 12 / 3 / 1 |
| True Grit | 15 | 14 | 1 | 11 / 2 / 2 |
| The Avengers | 15 | 8 | 7 | 12 / 3 / 0 |

These are evidence of available leverage, **not an approved addition slate**.
Adding any of them to the frozen 89 would still trigger the separate re-tune and
daily-pin gate.

The 190 Chronology-only stubs divide 21 / 34 / 29 / 22 / 42 / 42 across the
1970s–2020s. They are the cleanest future graduation lane because their local
dates already exist, but they lack credited metadata and therefore cannot be
ranked for graph value without a separate research/arbitration workflow.

One carefully chosen future credited film can help multiple areas only when it
does several jobs at once: bridge a fragile or isolated film through more than
one exact person, complete a near-ready director/series key, carry an already-
locked date, and avoid reinforcing the most repeated actor/franchise clusters.
That is a selection criterion, not a candidate recommendation.

Areas where adding movies would not solve the actual problem:

- actor-heavy Connections schedules caused by category/key selection;
- repeated use of already-eligible franchise cards;
- Daily Puzzle's graph-walk exposure bias without a balancing constraint;
- launch operations, attended accessibility, real-device, analytics, rights,
  deployment, or indexing gates;
- missing local dates on existing credited records.

## Data-quality limits and unknowns

- This is a local-data audit, not an external factual audit. Credit and date
  truth were not rechecked against TMDB or the web.
- The 12 credited records without dates are reported, not corrected.
- The exact-name consistency check is normalization-based and local. It found no
  collision pairs; it cannot detect two different spellings that normalize
  differently or a shared wrong spelling repeated consistently.
- Actor visibility follows the current `topCast` / `deepCast` fields. A
  deep-only link means every shared person is stored in `deepCast` on at least
  one of the two films.
- Genre is one exclusive local label per credited film; it is not a multi-label
  taxonomy.
- Series and genre opportunities are kept separate from person degree.
- Daily Puzzle and Chronology results are deterministic projections over the
  fixed seed window. Connections reads the already-baked fixed window. Duel has
  no daily schedule and receives no exposure claim.
- Demographic and protected-attribute coverage is unknown by design; no identity
  was inferred from names.
- Exposure and graph structure measure availability, not attended human
  difficulty, delight, recognition, or fairness.

## Prioritized recommendations

1. **Hold all four current pool artifacts through the launch gate.** Do not
   change `DUEL_POOL_IDS`, Chronology dates, credited `MOVIES`, or baked grids
   in response to this report alone.
2. **Treat Daily/Connections repetition as a dealer/schedule question first.**
   Use attended play feedback to decide whether repetition is felt, then scope a
   separate pinned re-deal experiment before buying more content.
3. **Open a separate metadata-completeness decision for the 12 credited/no-date
   records.** If Buri wants them dated, use the `tmdb-check`/date arbitration
   workflow; do not auto-fill them from this audit.
4. **If expansion is later authorized, use a 12–20 film credited wave.** Prefer
   existing dated stubs and cards that complete non-actor keys or bridge fragile
   components through multiple credits. Measure the graph/category delta before
   any merge or grid bake.
5. **Keep the frozen 89 separate by default.** A later credited-pool wave can
   improve Connections without automatically touching Daily Puzzle/Duel. Any
   proposed frozen cutover must arrive with the mandatory Solo pin and Duel
   re-tune plan.

## Decision table

| Option | Evidence fit | Benefits | Costs / risks | Recommendation |
|---|---|---|---|---|
| **Hold current pools** | Strong: frozen graph connected; Chronology balanced; Connections capacity ample; launch gates still open | Preserves pins/tune; directs work at actual schedule and launch constraints | Leaves known repetition and 12 local date gaps to separate decisions | **Choose now** |
| **Targeted credited expansion (12–20 films)** | Conditional: useful for fragile bridges, near-ready director/series keys, and stub graduation | Improves selected graph/category lanes without broad catalog churn | Requires metadata arbitration; Connections re-bake/pin; frozen cutover still separate | **Plan only after launch gate or new evidence** |
| **Broad expansion (roughly 40+ films)** | Weak: current 304 already has ample group-ready keys and 292 baked-used films | More nominal variety | High QA/author-time/bundle cost; does not guarantee category or exposure balance; re-bake required | **Do not choose** |

## Exact next approval needed

**Buri needs to approve or reject the recommended “Hold current pools” posture.**
Approval means this audit closes with no movie-data change. A future candidate
slate, TMDB/date arbitration, frozen-pool cutover, or Connections re-bake each
requires a new and separate authorization.
