# Chronology, Phase 3 Kickoff Prompt

> Paste the block below into a fresh session to resume Chronology at Phase 3 (the
> mode UI). It is self-contained: it states what is already done, what to build,
> and the guardrails to honor. Written 2026-06-28 at the clean Phase 1 + 2 stop.

---

Read these files in full before doing anything else, in this order:
`design/chronology.md` (the locked design spec), `docs/chronology-PRD.md`,
`docs/chronology-tasks.md`, and `docs/chronology-reuse.md`. They are the design of
record for "Chronology," a third, standalone mode for the Marquee movie game.
Treat them as the source of truth. Do not redesign the mode.

## Where things stand (done, do not redo)
- Phase 2 (core logic + verify gate): DONE. `src/lib/chronology.ts` implements the
  pure, React-free core: `dealRound(seed, pool, handSize)`, `correctSlot(card,
  line)` (resolves by full date with an id tiebreak, guards its pre-sorted
  invariant via `isLineSorted`), `scorePlacement(card, line, chosenSlot)`,
  `gapTightness(line, slot)`, and the shared streak/tight-call economy
  `streakCredit(prev, result, gapYears)` + `newStreak()` (the caller owns
  `StreakState`). Seeded RNG lives in `src/lib/rng.ts` (`makeRng`, `mulberry32`);
  `sim/rng.ts` re-exports it. Gate: `npm run verify:chronology` is 35/35.
- Phase 1 (data pipeline): Stage A DONE. `scripts/chronology-seed.ts` holds 162
  curated films (even decade spread, US-theatrical dates). `npm run
  build:chronology-pool` validates and emits `chronology-pool.json` (record shape
  `{ id, title, year, releaseDate, decade, popularity }`). Stage B (grow to 300 to
  500) and a human date-verification pass are still open but are content-only and
  can happen in parallel; do not block UI work on them.
- `src/ChronologyGame.tsx` exists as a UI shell wired to nothing.

## Your task: implement Phase 3 (the mode UI) ONLY
Build `src/ChronologyGame.tsx` into a playable sibling of `DuelGame.tsx`, calling
ONLY `src/lib/chronology.ts` for rules (no rule logic in the component). Follow the
per-task acceptance criteria in `docs/chronology-tasks.md` Phase 3:
1. Render the horizontal line of placed cards with insertable gaps including both
   ends (n cards show n+1 drop targets).
2. Render the hand of titles with the year hidden until placement.
3. Wire drop to `scorePlacement`: a clean drop settles in place; a misfire takes
   the reveal path.
4. Animate the flip-and-snap on misfire and re-sort the line so it stays strictly
   ordered (this is the signature moment, worth the polish).
5. Top bar with strokes and streak in the Daily Puzzle tally style; a streak badge
   at 3; use `streakCredit` for the credit and tight-call mercy (do not re-derive
   the economy in the component).
6. Wire the mode into the menu picker in `src/App.tsx`.

Load the pool: decide how the app reads `chronology-pool.json` (import vs fetch)
and where it should live (e.g. `src/data/`), then deal with `dealRound`. For now a
fixed/dev seed is fine; the deterministic daily and difficulty dial are Phase 5.

## Reuse, do not reinvent (see `docs/chronology-reuse.md`)
COPY the mechanics of the `Movie`-typed components (do not import them, to keep
Chronology decoupled from Duel's data shape): the 3D flip with reduced-motion
fallback from `CardView` in `src/components/Card.tsx`; the drag-to-place primitive
from `RaisedCard` in `src/components/Hand.tsx`; the drop hit-test from `attemptPlay`
in `src/SoloGame.tsx` (generalize one zone to N gap refs); the golf score / share
row and badges from `src/SoloGame.tsx`. Import pure utilities directly. Derive a
card color from `decade` (the pool has no `posterColor`).

## Guardrails (from CLAUDE.md and the spec)
- Surgical changes; match house style (lowercase `say()`-style copy, comments that
  explain why, `data-*` test hooks, `useReducedMotion()` fallbacks). Do NOT
  refactor `DuelGame.tsx`'s state soup.
- Deps are locked: React 18 / Vite / Tailwind 4 / Framer Motion only. No new deps.
- No persistence (localStorage) unless explicitly revisited.
- A rule or scoring change is never trivial. Phase 3 is UI only; if you find
  yourself wanting to change a rule, stop and flag it instead.
- Do NOT use em dashes in any document.

## Forbidden (do not touch)
`src/DuelGame.tsx`, `sim/RULESET.md`, `sim/duel-sim.ts`, `src/lib/duel.ts`,
`src/lib/difficulty.ts`, `src/lib/solver.ts`, and anything in the Duel sim parity
contract. Do not change `src/lib/chronology.ts` rules (you may read it; only touch
it if a genuinely missing pure helper is needed, and call it out first).

## Done when
- A round is playable end to end in the browser: deal, place cards into gaps, clean
  settles, misfire flips-and-snaps, line stays ordered, strokes/streak update, the
  hand empties.
- `npm run build` passes with no new errors and `npm run verify:chronology` stays
  35/35.
- The mode is reachable from the `App.tsx` menu and returns to it on exit.
- Update `docs/chronology-tasks.md` (check off Phase 3) and the project memory.
- No forbidden file changed. Then stop and summarize. (Phase 4 end/share screen is
  the next step after this.)
