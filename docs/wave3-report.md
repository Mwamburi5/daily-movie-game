# Match Cut pool expansion — Wave 3 local completion report

**Status:** locally complete; awaiting Buri's review before any commit, push, or deployment.
**Selection:** 67 full cards — all A, all B, C01–C17, all E, all F; C18 and D skipped.
**Scope held:** no artwork, rule/scoring change, persistence change, Solo/Duel cutover, commit, push, or deployment.

## Exact selected films, grouped by why they were added

### High-value completers and anchors — A01–A16 (16)

*Gran Torino*; *Who Framed Roger Rabbit*; *The Iron Giant*; *Glass Onion: A Knives Out Mystery*; *The Rock*; *Ex Machina*; *Skyfall*; *Dumb and Dumber*; *Walk the Line*; *Cars*; *Sherlock Holmes*; *Avatar*; *Shaun of the Dead*; *Dune: Part Two*; *Point Break*; *Do the Right Thing*.

### Additional one-short completers — B01–B12 (12)

*Vice*; *Argo*; *50 First Dates*; *Boyz n the Hood*; *Before Sunrise*; *School of Rock*; *The Thing*; *X-Men: First Class*; *Sideways*; *Harry Potter and the Goblet of Fire*; *Miss Congeniality*; *Steel Magnolias*.

### Coherent director/series packages — C01–C17 (17)

*Malcolm X*; *BlacKkKlansman*; *Snowpiercer*; *Memories of Murder*; *Mickey 17*; *My Neighbor Totoro*; *Princess Mononoke*; *Howl's Moving Castle*; *Gravity*; *Roma*; *Children of Men*; *Harry Potter and the Prisoner of Azkaban*; *Escape from New York*; *They Live*; *Halloween*; *You've Got Mail*; *Julie & Julia*.

These complete new formation-ready groups for Spike Lee, Bong Joon-ho, Hayao Miyazaki, Alfonso Cuarón, and John Carpenter. The two Nora Ephron additions leave her deliberately one short after C18 was struck. The two Harry Potter additions create an honest four-film series group.

### International and women-director breadth — E01–E12 (12)

*Lady Bird*; *Little Women*; *Lost in Translation*; *Selma*; *The Farewell*; *Past Lives*; *Portrait of a Lady on Fire*; *Amélie*; *Oldboy*; *Godzilla Minus One*; *RRR*; *Love & Basketball*.

### Recent and popular relevance — F01–F10 (10)

*Wicked*; *Sinners*; *One Battle After Another*; *F1*; *Superman (David Corenswet)*; *KPop Demon Hunters*; *Spider-Man: Brand New Day*; *The Super Mario Galaxy Movie*; *Marty Supreme*; *Frankenstein (2025)*.

## Stub graduations versus entirely new cards

| Class | Count | Films |
|---|---:|---|
| Graduated existing `DATED_STUBS` | 22 | *Who Framed Roger Rabbit*; *The Rock*; *Skyfall*; *Dumb and Dumber*; *Walk the Line*; *Cars*; *Sherlock Holmes*; *Avatar*; *Shaun of the Dead*; *Dune: Part Two*; *Point Break*; *Do the Right Thing*; *The Thing*; *Mickey 17*; *Gravity*; *Roma*; *Escape from New York*; *Halloween*; *Wicked*; *Sinners*; *F1*; *Superman (David Corenswet)*. |
| Entirely new full cards | 45 | All other selected titles. Forty-four carry policy dates; *KPop Demon Hunters* is the one intentionally undated card. |

Every graduation reused its canonical id and date byte-for-byte. No id remains in both `MOVIES` and `DATED_STUBS`.

## Before/after pool and distribution

| Measure | Before | After | Change |
|---|---:|---:|---:|
| Fully credited `MOVIES` | 237 | 304 | +67 |
| Credited movies carrying policy dates | 226 | 292 | +66 |
| Chronology-only `DATED_STUBS` | 212 | 190 | −22 |
| Derived dated pool | 438 | 482 | +44 |
| Frozen `DUEL_POOL_IDS` | 89 | 89 | none |
| Exact-string credit spellings | 1,076 | 1,366 | +290 |
| Linked credited-film pairs | 1,696 / 27,966 | 2,244 / 46,056 | +548 absolute; density 6.06%→4.87% |
| Standard / strong / super linked pairs | 1,216 / 387 / 93 | 1,660 / 475 / 109 | +444 / +88 / +16 |
| Median / maximum graph degree | 14 / 37 | 14 / 43 | median flat; maximum +6 |
| Isolated credited cards | 5 | 7 | packages connected *Parasite*, *Spirited Away*, and *Crouching Tiger*; five selected breadth cards are new isolates |

The new isolates are *Past Lives*, *Amélie*, *Oldboy*, *Love & Basketball*, and *KPop Demon Hunters*. Existing isolates *Casablanca* and *The Wizard of Oz* remain. This is the clearest breadth-versus-immediate-link tradeoff in the wave.

### Chronology decades

| Decade | Before | After | Change |
|---|---:|---:|---:|
| 1970s | 34 | 34 | 0 |
| 1980s | 60 | 62 | +2 |
| 1990s | 91 | 98 | +7 |
| 2000s | 97 | 112 | +15 |
| 2010s | 104 | 115 | +11 |
| 2020s | 52 | 61 | +9 |

Skipping D means the known 1970s floor remains unresolved. *Halloween* graduated an existing stub, so it did not increase the dated total for that decade.

### Credited genres

| Genre | Before | After | Change |
|---|---:|---:|---:|
| Action | 22 | 33 | +11 |
| Adventure | 17 | 20 | +3 |
| Animation | 16 | 24 | +8 |
| Comedy | 22 | 30 | +8 |
| Crime | 29 | 31 | +2 |
| Drama | 43 | 53 | +10 |
| Horror | 6 | 11 | +5 |
| Romance | 10 | 18 | +8 |
| Sci-Fi | 32 | 40 | +8 |
| Thriller | 27 | 31 | +4 |
| War | 7 | 7 | 0 |
| Western | 6 | 6 | 0 |

Horror and Romance receive proportionally strong repair. Action, Drama, and Sci-Fi remain the main concentration risks.

## Connections yield, ambiguity, and bake

| Measure | Before checkpoint | After merge | Change |
|---|---:|---:|---:|
| Group-ready directors | 25 | 35 | +10 |
| Group-ready actors | 100 | 140 | +40 |
| Group-ready series | 4 | 5 | +1 |
| Viable key quadruples | 9,562,667 | 37,260,495 | +27,697,828 (3.90×) |
| Estimated strict accidental-free key sets | ≈2,868,800 | ≈11,228,450 | +≈8,359,650 (3.91×) |
| Sampled strict success within eight tries | 30.0% | 6,027 / 20,000 = 30.1% | essentially flat |

The raw option space nearly quadrupled without degrading the sampled strict rate. The 365-day bake contains 334 grids with no genre group and 31 with one; none exceed the dealer's one-genre cap. `verify:connections` independently re-dealt all 365 grids, proved every card sits, proved no card fits two groups, and matched the baked file. The content-driven digest and anchor-day spot check were consciously re-pinned for pool 304.

The larger graph exposed a real author-time scalability limit: a 12 GB Node heap no longer holds the exhaustive 37.3-million-set dealer context. The three author-time scripts now declare a 20 GB ceiling, and the yield report releases its duplicate census before invoking the cached dealer. Runtime behavior is unchanged; the browser imports only pre-baked grids.

## Metadata, dates, and rulings

- TMDB probe passed before the audit.
- Final direct candidate audit: 57 clean, 9 raw flags, 1 unmatched. The extra noise comes from policy-year same-title matching and the disambiguated Superman card title.
- Supplemental origin-year/title audit: 61 clean, 6 flags, 0 unmatched.
- All six surviving supplemental flags are settled classes: two recognizability-first top-cast choices, three established `Bong Joon-ho` spelling differences, and Totoro's international card year.
- Live plus draft name audit and final live name audit: zero fold-identical or structural clusters.
- Material dates: *Ex Machina* 2015-04-10; *My Neighbor Totoro* 1993-05-07; *Oldboy* 2005-03-25; *RRR* 2022-03-25; *Wicked* 2024-11-22; *KPop Demon Hunters* undated.
- No new human judgment or exception remained, so `docs/tmdb-rulings.md` did not need a Wave 3 append.

Full evidence and source links are in `docs/wave3-diffs.md`; generated reports are retained beside it.

## Build and bundle impact

| Asset/budget | Before | After | Result |
|---|---:|---:|---|
| `movies` chunk | 69.97 kB raw / 19.25 kB gzip | 89.85 kB raw / 24.79 kB gzip | +19.88 kB raw / +5.54 kB gzip |
| Menu shell | 95.41 KiB gzip JS | 95.41 KiB gzip JS | unchanged |
| Cold JS range by mode | 115.97–137.54 KiB | 116.94–144.33 KiB | within budgets |
| Cold session range | baseline report retained in delivery artifact | 267.21–320.35 KiB | within budgets |

`npm run check:bundle` passes. No mode/data chunk is added to the menu shell.

## Verification ledger

| Gate | Result |
|---|---|
| `npm run build:chronology-pool` | PASS — 482 films; 34/62/98/112/115/61 |
| `npm run gen:connections -- --md docs/connections-yield.md` | PASS — 37,260,495 viable; ≈11,228,450 strict |
| `npm run build:connections-grids` | PASS — 365 grids, pool 304 |
| `npm run build` | PASS |
| `npm run check:bundle` | PASS |
| `npm run verify` | PASS — 64/64 |
| `npm run verify:solo` | PASS — 8/8 |
| `npm run verify:chronology` | PASS — 42/42; no manual date/daily pin change required |
| `npm run verify:connections` | PASS — 14/14 after the conscious content pin and bake |
| `npm run audit:names` | PASS — zero clusters |
| `npm run test:smoke` | PASS — 7/7 browser journeys |
| Candidate + supplemental TMDB audits | PASS — intended match for all 67; no new ruling class |
| `git diff --check` | PASS |

## Scope confirmation and remaining risks

- `DUEL_POOL_IDS` remains 89 and is byte-untouched; Solo still deals from the same frozen source. No `npm run eval` re-tune is triggered.
- `RULEBOOK.md`, `sim/RULESET.md`, scoring, deal rules, persistence, and share behavior are unchanged.
- Chronology daily content will reshuffle if this local wave is later deployed because its source pool grew from 438 to 482. No Chronology digest pin exists to bump; 42/42 validates the mechanics.
- The Connections daily year is intentionally re-baked and re-pinned. Publishing it would change already-generated daily boards; deployment remains a separate Buri decision.
- Five breadth cards are isolated today. They are defensible curation picks but offer no immediate Duel/Connections link value until later compatible cards arrive.
- Tom Hanks rises to 15 credited films and the maximum card degree reaches 43, so future waves should avoid feeding the same mega-hubs without a second reason.
- The 1970s remain at 34 because D was skipped; War and Western also receive no additions.
- Recent 2025–2026 cast metadata is the most drift-prone portion of the wave and should receive a fresh TMDB check before a delayed publication.
- Author-time Connections regeneration now requires a high-memory machine (20 GB Node ceiling). This is locally verified but is a future CI/maintainer ergonomics risk if content keeps growing.

## Files and publication boundary

Runtime data and generated artifacts: `src/data/movies.ts`, `src/data/chronology-pool.json`, `src/data/connections-grids.json`.
Author-time tooling/pins: `package.json`, `sim/connections-gen.ts`, `sim/connections-verify.ts`, `src/lib/connections.ts`, `scripts/build-connections-grids.ts`.
Research/audit/reporting: `scripts/wave3-candidate.ts`, `docs/pool-expansion-wave3-slate.md`, `docs/wave3-candidate-audit.md`, `docs/wave3-credit-audit-supplement.md`, `docs/wave3-candidate-names.md`, `docs/wave3-date-draft.md`, `docs/wave3-diffs.md`, `docs/connections-yield.md`, `docs/name-audit.md`, and this report.

Stop here for review. No commit, push, or deployment is authorized.
