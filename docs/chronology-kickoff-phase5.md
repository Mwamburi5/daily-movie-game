# Chronology, Phase 5 Kickoff Prompt

> Paste the block below into a fresh session to resume Chronology at Phase 5 (the
> deterministic daily seed and the difficulty dial). It is self-contained: it
> states what is already done, the design calls to make first, what to build, and
> the guardrails to honor. Written 2026-06-30 at the clean Phase 4 stop (the mode
> is playable end to end with a real Cleared and share screen). Note: do not use em
> dashes in any document.

---

Read these files in full before doing anything else, in this order:
`design/chronology.md` (the locked design spec, see Phase 5 in the build plan, the
"Ruleset contract" section 5 and 6, and the "Parked / open items"),
`docs/chronology-PRD.md` (sections 4, 6, 8, 9, and the open questions in section
10), `docs/chronology-tasks.md` (Phase 5), and `docs/chronology-reuse.md`. They are
the design of record for "Chronology," a third, standalone mode for the Marquee
movie game. Treat them as the source of truth. Do not redesign the mode.

## Where things stand (done, do not redo)
- Phase 1 (data pipeline), Stage A: DONE. `scripts/chronology-seed.ts` holds 162
  curated films, even decade spread (about 27 per decade across the 1970s to the
  2020s). `npm run build:chronology-pool` validates and emits
  `src/data/chronology-pool.json` (record shape
  `{ id, title, year, releaseDate, decade, popularity }`); `src/data/chronologyPool.ts`
  is the typed loader. Stage B (grow to 300 to 500) and a human date-verification
  pass are still open, content only. The pool MUST be locked before a public daily,
  because the daily deal is a function of the pool, so growing it later reshuffles
  past and future daily hands.
- Phase 2 (core logic + verify gate): DONE. `src/lib/chronology.ts` is the pure,
  React-free core: `dealRound(seed, pool, handSize)` (deterministic seeded
  Fisher-Yates via `makeRng(seed, 'chronology-deal')`, throws on a pool smaller
  than `handSize + 1`), `correctSlot`, `scorePlacement`, `gapTightness`, and the
  shared streak/tight-call economy `streakCredit` plus `newStreak`. The full
  seedable RNG lives in `src/lib/rng.ts`; `sim/rng.ts` re-exports it. Gate:
  `npm run verify:chronology` is green (35 checks). IMPORTANT: `dealRound` is a
  plain uniform shuffle by design; the code comment in it already says the
  difficulty dial is "a Phase 5 layer ON TOP of this uniform deal." That layer is
  your job.
- Phase 3 (mode UI): DONE. `src/ChronologyGame.tsx` is a playable sibling of
  `DuelGame.tsx`, reachable from the `App.tsx` menu, calling only
  `src/lib/chronology.ts` for rules. The line, gaps, hand, flip-and-snap, top bar,
  streak badge, and toasts are all built.
- Phase 4 (end state and share): DONE. `ChronoResults` in
  `src/ChronologyGame.tsx` is the real Cleared screen (gated on the hand emptying):
  final score, the per-placement emoji row (one glyph per placement, clean and
  misfire glyphs), and a copy-to-share action (the app's first real clipboard
  action) that writes the family share text and shows a transient "copied"
  confirmation. The locked family share format is three lines:
  `Marquee` and the mode name on line 1, `score N (S strokes[, C back])` on line 2,
  the emoji row on line 3.

## The scaffolding Phase 5 replaces
- `src/ChronologyGame.tsx` near the top: `DEV_SEED = 'chronology-dev'`,
  `dealFor(n) = dealRound(`${DEV_SEED}-${n}`, CHRONOLOGY_POOL)`, and a `roundN`
  counter; the header has a circular-arrow "New round" button wired to `resetGame`.
  This is dev-only seeding. Phase 5 swaps it for a real date seed (daily) and a
  random-round path.
- `src/main.tsx` has a DEV-time assertion that `dealRound('chronology-dev-0', ...)`
  deals a valid round. If the dev seed goes away, update this assertion to the real
  seed helper and assert that each difficulty still deals a valid round.

## Locked decisions (confirmed with the project owner 2026-06-30)
The difficulty model was the one underspecified piece (the spec named only "easy
(wide gaps)" and "hard (clustered)"; PRD section 10 left the deal algorithm, the
tier count, and whether the daily is fixed open). These four are now LOCKED. Build
to them; do not reopen them without flagging.

1. Date to seed mapping. LOCKED: the player's LOCAL calendar date as a
   `YYYY-MM-DD` string, used directly as the deal seed (Wordle-style local-midnight
   rollover), so "the same on the same calendar day" holds in the player's own
   zone. (A strict global daily would key off UTC; not chosen.)
2. The daily is a single FIXED difficulty for everyone. LOCKED: the daily uses ONE
   shared board per local date, so the score and the shareable emoji row are
   comparable across players. The difficulty dial (easy/hard) drives a SEPARATE
   random or practice round, NOT the daily. Concretely: the daily rides the
   existing uniform `dealRound` (the neutral "standard" deal already covered by the
   35-check gate); easy and hard are flavors of the random round only. So the daily
   needs no difficulty shaping at all, just the date seed.
3. Tiers and labels. LOCKED: the dial offers two tiers, easy and hard, applied to
   the random round; the daily's shape is the neutral standard deal (a de facto
   third shape that is not a player-facing pill). Model the difficulty type as
   `'easy' | 'standard' | 'hard'` so the daily can name its shape as `'standard'`
   and reuse the same deal entry point. Give the two pills Chronology's OWN
   house-voice names (do not reuse Duel's Matinee / Feature / Director's Cut). Room
   to promote a middle pill later if a play pass wants it.
4. The shaping algorithm, deterministic and on top of `dealRound`'s seeded stream.
   LOCKED in shape: `standard` is the current uniform shuffle (unchanged). `easy`
   spreads the hand across decade buckets (neighbors far apart in time, wide gaps).
   `hard` clusters the hand into a narrow window (sample within a single decade or a
   tight year span, so gaps are small). All three yield `handSize + 1` unique cards,
   stay deterministic from the seed, and `hard` must degrade gracefully (widen the
   window) if the Stage A pool is too thin for the tightest cluster, rather than
   throw. The exact bucketing and window widths are tuning, not contract: pick
   sensible starting values and let the new sim spread-assertion confirm hard is
   tighter than easy.

## Your task: implement Phase 5 (daily seeding and the difficulty dial) ONLY
Follow the per-task acceptance criteria in `docs/chronology-tasks.md` Phase 5:
1. Seed the daily round from the date. Every player gets the same anchor and hand
   on the same calendar day.
2. Add a random round path. A random seed yields a fresh round that uses the same
   deal function.
3. Implement the difficulty dial in the deal. Easy deals spread hand films far
   apart in time and hard deals cluster them, with no rule or scoring change.

Add the difficulty-aware deal as a NEW pure helper in `src/lib/chronology.ts`
(additive). Do not change `correctSlot`, `scorePlacement`, `gapTightness`, or
`streakCredit`; those are the rules and the scoring, which Phase 5 must not touch.

## Reuse, do not reinvent (see `docs/chronology-reuse.md`)
- Seeded RNG: `makeRng` and `mulberry32` from `src/lib/rng.ts`, already used by
  `dealRound`. The daily seed is just the date string passed in as the seed; the
  difficulty-shaped deal layers on top using the same keyed-stream pattern.
- Menu difficulty control: the segmented pill control under the Duel card in
  `src/App.tsx` (the `DIFFICULTIES.map(...)` block with `data-difficulty` hooks and
  `aria-pressed`) is the visual pattern to COPY. Per the locked decisions, the
  Chronology daily is a single button (no pills, the standard deal); the easy/hard
  pills belong to the random-round affordance, not the daily. Supply a Chronology
  difficulty list of your own. Do NOT import `src/lib/difficulty.ts`; it is
  Duel-tuned and forbidden. Where the easy/hard entry point lives (a small dial in
  `ChronologyGame.tsx` next to the "new round" control, or a pill set on the menu
  card) is your call; keep the daily and the practice round visibly distinct.
- Verify discipline: the difficulty-ramp section (#4) in `sim/chronology-verify.ts`
  is the model. It currently ends with `note('easy/hard deal-spread assertion is
  deferred to Phase 5 ...')`. Turn that note into a real `check(...)` that, over
  many seeds, asserts hard deals produce a tighter average neighbor span than easy
  deals (the spread of difficulty between easy and hard, PRD section 9 secondary
  metric).
- DEV assertion convention: `src/main.tsx` already asserts the bundled pool deals a
  valid round. Extend it to assert each difficulty deals a valid round.

## Guardrails (from CLAUDE.md and the spec)
- The difficulty dial is the DEAL, not a rule or scoring change (spec section 6:
  same engine, same scoring, the dial is the deal). If you find yourself changing
  scoring or placement rules, stop and flag it instead.
- Hand size stays fixed at 10 (the 8 easy / 12 hard scaling is parked). Difficulty
  changes the spread of the 10, never the count.
- Determinism is the contract: same date (and difficulty, if folded into the seed)
  yields the same board for everyone. Keep all daily randomness behind `makeRng`
  with the date seed; no `Math.random` in the daily path. The random round may use
  a random seed.
- The Stage A pool (162 films, about 27 per decade) is thin for the tightest hard
  deals, so the shaping must degrade gracefully and the public daily still waits on
  Stage B (300 to 500) plus a human date-verification pass. Phase 5 builds the
  engine; locking the pool is the gate before a public launch, not part of this
  phase.
- Surgical changes; match house style (lowercase `say()`-style copy, comments that
  explain why, `data-*` test hooks, `useReducedMotion()` fallbacks). Do NOT
  refactor `DuelGame.tsx`'s state soup. No new dependencies (React 18 / Vite /
  Tailwind 4 / Framer Motion only).
- No persistence (localStorage). A daily "already played today" memory is a later
  step, not Phase 5.
- Do NOT use em dashes in any document.

## Forbidden (do not touch)
`src/DuelGame.tsx`, `sim/RULESET.md`, `sim/duel-sim.ts`, `src/lib/duel.ts`,
`src/lib/difficulty.ts` (Duel's difficulty; do not import or reuse it for
Chronology), `src/lib/solver.ts`, and anything in the Duel sim parity contract. You
MAY additively extend `src/lib/chronology.ts` (a new deal helper only, leave the
existing rule and scoring functions unchanged), `src/ChronologyGame.tsx`,
`src/App.tsx` (menu wiring), `sim/chronology-verify.ts`, and `src/main.tsx`.

## Done when
- The daily round is deterministic from the date: the same calendar day yields the
  same anchor and hand for everyone (proven by a re-deal equality check in the sim,
  the way section #3 already checks the base deal).
- A random round path deals a fresh board through the same deal function.
- The difficulty dial lives only in the deal: easy deals spread the hand wide in
  time, hard deals cluster it, with identical rules and scoring, and the new sim
  assertion proves hard deals are tighter than easy on average.
- `npm run build` passes with no new errors; `npm run verify:chronology` stays
  green and now includes the spread assertion (so its check count rises above 35);
  `npm run verify` (Duel) stays green.
- Note: the headless code preview throttles animations when the tab is hidden, so
  verify structure and logic there and trust motion to the existing patterns. Drive
  a real round in a focused browser tab if you need to feel the daily and the dial.
- Update `docs/chronology-tasks.md` (check off Phase 5, update the status header)
  and the project memory.
- No forbidden file changed. Then stop and summarize. Phase 6 (promote the spec's
  How to play into `RULEBOOK.md` as Mode 3, plus a short canonical three-mode note)
  is the next step after this.
