> **⚑ EXECUTED 2026-07-06 (steps 1–6) — historical design doc; the Ledger in
> `docs/master-plan.md` is the live record.** Steps 1–6 landed exactly as
> designed: `Movie.releaseDate?` added, 116 overlap dates copied onto canonical
> entries, 46 `DATED_STUBS` added, `build-chronology-pool.ts` rewired to
> `MOVIES.filter(m=>m.releaseDate)` ∪ `DATED_STUBS`, and the emitted
> `chronology-pool.json` is **byte-identical** to the pre-A4 committed pool (the
> go/no-go). `DUEL_POOL_IDS` pin `0x2fa00c8d` untouched; `verify:chronology`
> 42/42, `verify:solo` 8/8, `tsc --noEmit` clean.
> **Two deviations from the literal design, both flagged for the ledger:**
> (1) 4 credited films (LOTR ×3 + Mission: Impossible – Fallout) carry a
> Chronology title that deliberately differs from their Duel card-face title, so
> the build applies a small `CHRONO_TITLE_OVERRIDES` map (asserted to actually
> diverge) to keep byte-identity — the design assumed byte-identical titles across
> both DBs, which is false for these 4. (2) **Step 7 seed retirement landed in a
> same-day follow-up (orchestrator):** the design's consumer map had missed that
> `sim/chronology-verify.ts` and `sim/chronology-eval.ts` also imported the
> seed. Both now read the derived `src/data/chronology-pool.json` itself (fs
> read — the gates verify the exact artifact the app deals from) and
> `scripts/chronology-seed.ts` is deleted. One source, no split brain.

# Pool unification — design (PLAN.md Amendment 1 · A4)

**Status: DESIGN SIGNED OFF by Buri 2026-07-05; implementation = next
session's first item.** Wave-2 is merged (MOVIES=237), so unification runs
over all 116 overlapping ids as designed. Content architecture only — zero rule changes; if a
step touches game rules or `sim/RULESET.md`, stop.

## Goal

One canonical pool with all data per film; every mode deals from it or from
frozen/derived views of it. Today there are two databases: `src/data/movies.ts`
(credited films, Duel/Solo/Connections) and `src/data/chronology-pool.json`
(dates-only, built from `scripts/chronology-seed.ts`). ~116 films exist in
both, by identical id (id identity is the unification hook; zero title+year
matches with mismatched ids — verified 2026-07-05).

## The consumer map (verified against the repo, 2026-07-05)

| consumer | reads | after unification |
|---|---|---|
| Duel / Solo / sims (`duel-sim`, `verify`, `eval`, `solo-verify`) | `DUEL_POOL` (+ `movieById` lookups) | **unchanged** |
| Chronology (`main.tsx` → `chronologyPool.ts`) | `chronology-pool.json` | **unchanged import** — the JSON becomes a derived artifact |
| Connections gen (`sim/connections-gen.ts`) | `MOVIES` | **unchanged** — `MOVIES` stays "fully credited films" |
| `build-chronology-pool.ts` | `chronology-seed.ts` | **rewritten** to read the canonical pool |

App-side, `MOVIES` is imported only by `duelPool.ts`. That's why the design
below has zero app-code churn.

## Design (recommended): credited entries + dated stubs, one file

`src/data/movies.ts` becomes the single canonical pool with two typed grades:

1. **`Movie` gains `releaseDate?: string`** — optional, ISO `YYYY-MM-DD`,
   under the locked US-theatrical policy (types 2+3, limited counts, no
   premieres/streaming). Additive and inert: no consumer reads it until the
   chronology build does. The ~116 overlapping credited films get their date
   copied from the chronology pool.
2. **New export `DATED_STUBS: DatedStub[]`** in the same file —
   `{ id, title, releaseDate }` for the ~46 films that have a policy date but
   no credits yet (chronology-only films). One entry per film across the
   union; a stub **graduates** to a full `Movie` entry when a future wave
   credits it (delete stub + append Movie, same id — the chronology view is
   unaffected because id+date don't change).
3. **`chronology-pool.json` becomes DERIVED**: `build-chronology-pool.ts`
   reads `MOVIES.filter(m => m.releaseDate)` ∪ `DATED_STUBS`, runs the SAME
   validator (era window 1970+, `PER_DECADE_MIN`, unique ids across the
   union, strict ISO dates, **stub ids must not collide with `MOVIES` ids**),
   emits the SAME record shape with the SAME sort (releaseDate, then id).
   `scripts/chronology-seed.ts` retires (dates live on canonical entries).
4. **`/tmdb-check` date-fix path updates in the same pass**: after A4, date
   rulings land on the canonical entry/stub (not the retired seed). The
   SKILL.md line pointing at chronology-seed.ts changes then.

### Why stubs instead of making credits optional on `Movie`

Loosening `director`/`topCast`/`genre`/`posterColor` to optional ripples
type-narrowing through every credit consumer (duel-sim, verify, SoloGame,
connections-gen) for zero runtime benefit — those films are never dealt in
credit modes. Fake empty-credit `Movie` entries were rejected too: they'd
force placeholder `genre`/`posterColor` values (fabricated data) and pollute
`MOVIES`' meaning as "the credited pool" that connections-gen sweeps. The
stub type says honestly what the data is: two grades, one pool, one entry per
film. Stage B (dates-first growth) will add many stubs; waves graduate them.

## Constraints and how each is met BY CONSTRUCTION

- **`DUEL_POOL_IDS` byte-identical:** untouched. Adding a `releaseDate`
  property to existing entries changes neither ids nor the 89's relative
  order; stubs are a separate export, not appended to `MOVIES`. The fnv pool
  pin (0x2fa00c8d) is over the id list — unchanged.
- **Solo pin / verify 64/64 / eval tune byte-identical:** Duel/Solo deal from
  `DUEL_POOL`; the engine never reads `releaseDate`. Sweep still runs as the
  gate, expected no-op.
- **No Chronology reshuffle:** the migration's acceptance test is
  `npm run build:chronology-pool` emitting a **byte-identical
  chronology-pool.json** (empty git diff) vs the post-A2 committed pool.
  Byte-identity = provably identical dailies; verify:chronology 42/42 + pin
  hold without a bump. Any A2-arbitrated date fixes land BEFORE unification
  (in the seed, while it's still the source of truth), so unification itself
  is reshuffle-free.
- **Migration checks (one-time, in the migration script or by hand):** for
  each overlapping id, title strings must match byte-for-byte between the two
  databases and `Movie.year === year(releaseDate)` — any mismatch is surfaced
  for arbitration, not silently resolved. (Known future exception class:
  films whose US-theatrical year differs from the original-release face year,
  e.g. Taken 2008/2009 — `Movie.year` stays the Duel card-face datum,
  Chronology keeps deriving its year from `releaseDate`. Two policies, one
  entry, both deliberate.)

## Execution order (after wave-2 merge lands)

1. Add `releaseDate?` to `Movie`; copy the ~116 dates from
   chronology-pool.json onto their canonical entries (script-assisted edit of
   movies.ts; entry order untouched).
2. Add `DatedStub` type + `DATED_STUBS` (~46 entries) to movies.ts.
3. Rewrite `build-chronology-pool.ts` input side; keep validator + emit
   identical; add the stub-collision check.
4. Run the build → **assert byte-identical JSON** (the design's go/no-go).
5. Retire `scripts/chronology-seed.ts`; update `/tmdb-check` SKILL.md fix
   path; note in docs/tmdb-plan.md.
6. Full gate sweep: build · verify 64/64 · solo 8/8 · chronology 42/42 ·
   eval tune byte-identical.

Rollback is trivial before step 5 (derived artifact unchanged on disk).
