# Chronology, Task Breakdown

> Phased checklist tracking the 6 build phases in `design/chronology.md`. Each
> task has a one-line acceptance criterion. Order inside a phase is the suggested
> build order. Nothing here touches the Duel sim parity contract.
>
> CURRENT STATUS (2026-06-30, Phase 6 done — build plan complete):
> - Phase 2 (core logic + verify gate): DONE. `npm run verify:chronology` is now
>   42/42 (Phase 5 added the #5 deal-spread section). `npm run build` is clean.
> - Phase 1 (data pipeline): Stage A DONE. 162-film pool, even spread, emitted by
>   `npm run build:chronology-pool` into `src/data/chronology-pool.json` (moved
>   from repo root in Phase 3 so the app imports it like movies.ts). Stage B (grow
>   to 300 to 500) is still open and content-only. Dates still need a human
>   verification pass before lock.
> - Phase 3 (mode UI): DONE. `src/ChronologyGame.tsx` is a playable sibling of
>   DuelGame, reachable from the App.tsx menu. Build clean, gates green (chronology
>   35/35, duel all green).
> - Phase 4 (end state + share): DONE. `ChronoResults` is the real Cleared screen
>   (gated on hand empty, shows final score + emoji row) with a `copy result`
>   action (first real clipboard action in the app) in the family share format and
>   a transient `copied ✓` confirmation. Solo/Duel untouched.
> - Phase 5 (daily seed + difficulty dial): DONE. The daily rides the standard
>   uniform deal keyed to the player's LOCAL date ('YYYY-MM-DD'); a practice round
>   takes a random seed at a chosen spread. The dial is a NEW pure helper
>   `dealRoundShaped(seed, pool, difficulty, handSize)` in `src/lib/chronology.ts`
>   (additive; the rule/scoring functions are untouched): 'standard' delegates to
>   `dealRound`, 'easy' spreads the hand across the timeline (wide gaps), 'hard'
>   clusters it into a tight window (small gaps, degrades gracefully on a thin
>   pool). Menu: the Chronology card's main button starts the daily; a `practice`
>   row with `Wide`/`Tight` pills starts a random round. Verify #5 proves hard is
>   tighter than easy (easy ~5.1y vs hard ~0.8y mean neighbor span, paired CI
>   excludes 0). `main.tsx` asserts every difficulty deals a valid round.
> - Phase 6 (docs): DONE. `RULEBOOK.md` now has a "Mode 3 — Chronology (Solo) · NEW"
>   section in the same voice and per-mode skeleton as Modes 1 and 2 (30-second
>   how-to, ASCII "What's on screen", golf scoring list, "How it ends"), plus the
>   daily-vs-practice split and the Wide/Tight dial in plain words. The intro was
>   restructured from "both modes" / "two ways to play" into an honest three-mode
>   family note (movie cards + golf + shareable emoji row) with the link framing
>   scoped to Modes 1 and 2; Chronology is never implied to use links. Glossary,
>   modes line, and a "What's new" entry updated. Docs-only: no code or sim file
>   touched. Verified the doc scoring against `src/lib/chronology.ts` (clean +0,
>   misfire +1, streak-of-3 −1, tight-call mercy within TIGHT_GAP_YEARS=3) — no
>   mismatch.
> - NEXT: build plan is closed. The only open track is the CONTENT gate for a public
>   daily — Stage B grow the pool to 300 to 500 plus a human date-verification pass,
>   then lock the pool.
>
> Before building a phase, check `docs/chronology-reuse.md`: it maps the existing
> code that transfers (the flip animation, drag-to-place, seeded RNG, golf score
> and share row, end screen, rules overlay) so a phase does not reinvent it.

## Phase 1, Data pipeline (curation-first)

Goal: a content layer file `chronology-pool.json` of 300 to 500 recognizable
films, evenly spread across decades, each carrying its full release date.
Recognizability is a human curation decision (the `src/data/movies.ts` way), not
an automated popularity filter; the script validates and emits, it does not scrape.

Staged build: pool size is a content knob behind `dealRound(seed, pool, ...)`, so
growing it is content-only, no code change. Stage A, a ~150-film pool (about 25
per decade, evenly spread) to unblock the core, UI, and feel work. Stage B, expand
to 300 to 500 once content rules and feel are locked. The size must be locked
BEFORE the public daily launches, because the daily deal is a function of the
pool, so expanding it later reshuffles past and future daily hands. Stage B holds
the same date policy and recognizability bar; grow with more of the same quality,
not filler.

- [x] Decide the date-fill method and release-type policy. DONE: manual lookup
      under the locked US-theatrical policy (PRD section 6); starter sample in
      `scripts/chronology-seed.ts`.
- [x] Author the curated seed list across the 1970s to the 2020s, extending the
      starter sample in `scripts/chronology-seed.ts`. Bootstrap from the 89
      recognizable titles in `src/data/movies.ts` (copy titles, do not import the
      module), then weight new curation to the under-filled decades (1970s, 1980s,
      2020s). Acceptance: a committed seed of 300 to 500 famous films, hand-spread
      so each decade has a comparable share, with no pre-1970 entries. STAGE A
      DONE: 162 films committed, spread 27/28/30/27/25/25 across the 1970s to the
      2020s. (Stage B grows this toward 300 to 500 before the public daily.)
- [x] Enrich each seed entry with its canonical release date. Acceptance: every
      entry ends with a decidable ISO `YYYY-MM-DD` date, and the enriched output
      is committed so the build has no runtime network dependency. DONE: dates are
      hand-filled in the committed seed; `enrichDates` confirms presence (no
      network). NOTE: dates are AI-curated under the US-theatrical policy and need
      a human verification pass before the pool is locked for the public daily.
- [x] Validate the hard constraints and refuse to emit on any violation.
      Acceptance: the script throws unless the era window holds, every decade meets
      the per-decade minimum, ids are unique, and every date is valid ISO. DONE:
      `validate` collects every violation and throws one report; proven to refuse
      duplicate ids, pre-1970 entries, impossible/malformed dates, and a starved
      pool, while accepting the real seed.
- [x] Emit `chronology-pool.json` in the record shape
      `{ id, title, year, releaseDate, decade, popularity }`, deriving `year` and
      `decade` from the release date. Acceptance: the file parses, holds 300 to
      500 unique ids, and every record has all six fields. DONE for Stage A: 162
      unique records, date-sorted, all six fields present (the 300 to 500 count is
      a Stage B target).
- [x] Add the build command to `package.json` scripts. Acceptance: one command
      regenerates the pool file end to end from the committed seed. DONE:
      `npm run build:chronology-pool`.

## Phase 2, Core logic in `src/lib/chronology.ts`

Goal: pure, typed, React-free functions that the UI and the sim both call, so
parity is by construction.

- [x] Define `ChronologyCard` and round and placement types. Acceptance: types
      match the pool record shape and compile under strict mode.
- [x] Implement `dealRound(seed, pool, handSize)`. Acceptance: same seed yields
      the same anchor and hand; the anchor is excluded from the hand; hand length
      equals handSize. DONE: seeded Fisher-Yates over the pool via `makeRng(seed,
      'chronology-deal')`; throws on a pool smaller than `handSize + 1`.
- [x] Implement `correctSlot(card, line)`. Acceptance: returns the index where
      the card's release date falls in date order, resolving same-year ties by
      date. DONE: compares by full ISO date (then `id`) and guards its pre-sorted
      invariant (`isLineSorted`).
- [x] Implement `scorePlacement(card, line, chosenSlot)`. Acceptance: returns
      clean with +0 when chosenSlot equals the correct slot, misfire with +1
      otherwise, and reports the correct slot.
- [x] Implement `gapTightness(line, slot)`. Acceptance: returns the year span
      between the slot's two neighbors, and signals an open-ended end gap
      (Infinity).
- [x] Confirm where streak and tight-call mercy state lives. Acceptance: a
      documented decision that the caller owns streak state, with the helpers it
      needs exposed from the core. DONE: the caller threads a `StreakState` and
      advances it through the pure `streakCredit(prev, result, gapYears)` helper
      (plus `newStreak()`), so the streak and tight-call mercy economy has one
      shared implementation rather than two that drift.

## Phase 3, Mode UI in `src/ChronologyGame.tsx`

Goal: a sibling to `DuelGame.tsx` that renders the line, accepts insertions, and
plays the flip and snap, calling only `src/lib/chronology.ts` for rules.

- [x] Render the horizontal line of placed cards with insertable gaps including
      both ends. Acceptance: a line of n cards shows n plus 1 drop targets. DONE:
      the line maps `line.length + 1` `[data-gap]` targets interleaved with the
      cards; verified 1 anchor -> 2 gaps in the browser. Scrolls horizontally as it
      fills; gaps widen and show an insert bar while a card is raised.
- [x] Render the hand of titles with years hidden. Acceptance: hand cards show the
      title and never the year before placement. DONE: the hand front face shows
      the title and "year ?"; the year lives only on the flip back face (revealed
      on a misfire), like the Movie card.
- [x] Wire drop to `scorePlacement`. Acceptance: a clean drop settles the card in
      place; a misfire triggers the reveal path. DONE: `onDrop` hit-tests the drop
      point to the nearest gap (generalized from SoloGame's `attemptPlay`), then
      calls `scorePlacement`; clean commits immediately, misfire takes the flip
      path. No rule logic in the component.
- [x] Animate the flip and snap on misfire and re-sort the line. Acceptance: a
      wrong drop flips to reveal the year, moves to the correct slot, and the line
      stays strictly ordered. DONE: misfire flips the raised card (rotateY reveal),
      then a delayed commit splices the card at `correctSlot` under a shared
      `layoutId`, so Framer animates the snap and the splice keeps the line sorted
      by construction (no wrong-order window). Reduced-motion crossfade fallback.
- [x] Render the top bar with strokes and streak in the Daily Puzzle tally style.
      Acceptance: strokes and streak update live and a streak badge appears at 3.
      DONE: header shows `Strokes N` with a credit note, streak pips, and a 🛡 when
      mercy is armed; a `Streak ×3` badge pops via `streakCredit` (the badge and
      tight-call mercy come from the shared economy, not re-derived here).
- [x] Wire the mode into the menu picker in `App.tsx`. Acceptance: the menu starts
      a Chronology round and returns to the menu on exit. DONE: a Chronology menu
      card starts the round; the back arrow returns to the menu. Verified both ways
      in the browser.

## Phase 4, End state and share

Goal: a Cleared screen that shares like the other two modes. DONE 2026-06-30. All
in `src/ChronologyGame.tsx` (`ChronoResults` + two module helpers); no forbidden
file touched, build clean, gates green (chronology 35/35, duel all green).

- [x] Show a Cleared screen when the hand empties. Acceptance: the screen appears
      only when the hand is empty and shows the final score. DONE: the caller gates
      `ChronoResults` on `status === 'cleared'` (set only when `nextHand.length === 0`);
      it shows "Cleared!", the final score, and the stroke/credit tally.
- [x] Build the emoji row from the run. Acceptance: the row uses a clean glyph and
      a misfire glyph in placement order, one glyph per placement. DONE: `🎬` +
      one `🟩`/`🟥` per `playLog` entry, in placement order.
- [x] Provide a copy to share action. Acceptance: copying yields the emoji row and
      score in the family share format. DONE: a `copy result` button calls
      `navigator.clipboard.writeText` (hidden-textarea `execCommand` fallback) and
      shows a transient `copied ✓` confirmation in the house voice; on a blocked
      clipboard it reveals a `select-all` block of the same text. Family format
      (decided here, mirrors the other two modes' golf framing + 🎬 row):
      `Marquee · Chronology` / `score N (S strokes[, C back])` / the emoji row.
      First real copy action in the app; a shared share helper is flagged for a
      later pass, not built now (Solo/Duel untouched).

## Phase 5, Daily seeding and difficulty dial

Goal: a deterministic daily and a difficulty dial that lives only in the deal.

- [x] Seed the daily round from the date. Acceptance: every player gets the same
      anchor and hand on the same calendar day. DONE: `ChronologyGame` seeds the
      daily with the player's LOCAL `YYYY-MM-DD` (locked decision: local-midnight
      rollover, not UTC) and deals it 'standard', so the daily IS the uniform
      `dealRound` everyone shares. Verify #5 asserts `dealRoundShaped(seed,
      'standard') === dealRound(seed)` and that a re-deal is identical.
- [x] Add a random round path. Acceptance: a random seed yields a fresh round that
      uses the same deal function. DONE: the menu's `Wide`/`Tight` practice pills
      start a round off a random base seed through the same `dealRoundShaped`
      entry point; the in-game ↺ reshuffles a fresh one (practice only; the daily
      is fixed).
- [x] Implement the difficulty dial in the deal. Acceptance: easy deals spread
      hand films far apart in time and hard deals cluster them, with no rule or
      scoring change. DONE: `dealRoundShaped` adds 'easy' (one card per equal
      date-sorted segment → wide, even gaps) and 'hard' (one tight contiguous
      window, sampled → small gaps; window clamps to the pool when thin). No rule
      or scoring function changed. Verify #5 proves hard < easy on mean neighbor
      span (paired, real); browser check: easy span 52y vs hard span 6y on the
      live 162-film pool.

## Phase 6, Docs

Goal: docs cover all three modes without drift, on ship.

- [x] Promote the spec How to play into `RULEBOOK.md` as Mode 3. Acceptance:
      `RULEBOOK.md` describes Chronology in the same plain voice as the other two
      modes. DONE: "Mode 3 — Chronology (Solo) · NEW" mirrors the Modes 1/2
      skeleton (30-second how-to, ASCII "What's on screen", golf scoring list,
      "How it ends") and adds the daily-vs-practice split and the Wide/Tight dial in
      plain words. Scoring words verified faithful to `src/lib/chronology.ts`.
- [x] Add a short canonical note so the docs read as one family. Acceptance: a
      reader can find all three modes and how they relate from one place. DONE: the
      intro ("The big idea (all three modes)") is restructured into a three-mode
      family note (every card a movie, every mode golf, every mode ends on a
      shareable emoji row), with the link framing scoped to Modes 1 and 2 and
      Chronology given its own big idea. No "both modes" / "two ways to play" left.

## Verify gate (cross-cutting, lands with Phase 2)

Goal: Chronology gets its own verify discipline, the analog of the Duel 60/60.

- [x] Build `sim/chronology-verify.ts` scoring assertions. Acceptance: the harness
      asserts clean and misfire deltas and correct-slot resolution, and exits non
      zero on any failure. DONE: sections #1 to #3 cover correct slot (incl.
      same-year ties), deltas, the invariant guard, the streak / tight-call
      economy, and deterministic deal.
- [x] Build the difficulty ramp measurement. Acceptance: the harness simulates a
      naive and a calibrated player and reports clean rate by placement index,
      confirming gaps tighten as the line fills. DONE: section #4 plays a
      year-reasoning player over an evenly-spread synthetic pool; clean rate falls
      from 94% (early) to 79% (late) with non-overlapping Wilson intervals, and a
      calibrated player beats a naive one on strokes (paired, real).
- [x] Add the verify command to `package.json` scripts. Acceptance: one command
      runs the Chronology verify gate. DONE: `npm run verify:chronology`.
