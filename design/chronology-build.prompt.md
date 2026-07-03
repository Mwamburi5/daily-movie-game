# Chronology, Phase 3 build prompt

> Paste the block below into a new Claude Code session from the repo root to build
> the Chronology mode UI. Phases 1 (Stage A pool) and 2 (core + verify gate) are
> already done and green; this prompt starts the screen you play on.

---

Read these files in full before doing anything else, in this order:
design/chronology.md (the locked design spec), docs/chronology-PRD.md,
docs/chronology-tasks.md, and docs/chronology-reuse.md. They are the design of
record for "Chronology," a third, standalone mode for the Marquee movie game.
Treat them as the source of truth. Do not redesign the mode.

## Where things stand (done and green, do not redo or break)
- Phase 1 Stage A: scripts/chronology-seed.ts holds a ~160-film curated pool
  (US-theatrical date policy, see the file header). scripts/build-chronology-pool.ts
  validates it and emits src/data/chronology-pool.json. Run that script first if
  the JSON is missing or stale.
- Phase 2: src/lib/chronology.ts implements the pure core (dealRound, correctSlot,
  scorePlacement, gapTightness, plus the shared streak/tight-call economy:
  newStreak, streakCredit, and isLineSorted). The seeded RNG lives in
  src/lib/rng.ts (sim/rng.ts re-exports it). sim/chronology-verify.ts is the gate
  and passes 35/35. The Duel gate (sim/verify.ts) is still 60/60.

## Locked decisions (carry forward, do not relitigate)
- Insertion into a year-ordered line. Hard placement: a card is in the correct
  slot or it is not. A miss flips to reveal the real year, snaps to the correct
  slot, costs a stroke, and the line is re-sorted so it is never out of order.
- The card face shows only the year; the full date is the hidden resolver. Ties
  resolve by date, so there is always exactly one correct slot.
- Scoring (golf, low wins): clean +0, misfire +1, streak of 3 clean -1, tight-call
  mercy (TIGHT_GAP_YEARS, 3). Final = strokes minus credits. All of this already
  lives in src/lib/chronology.ts; the UI calls it, it does not re-implement it.
- Hand size 10 (1 anchor + 10 placements).

## Your task: implement Phase 3 (the mode UI) ONLY
Build src/ChronologyGame.tsx for real (it is currently a shell). It must call ONLY
src/lib/chronology.ts for rules; no scoring or ordering logic in the component.
- A horizontal LINE of placed cards with insertable gaps, including both ends (a
  line of n cards has n+1 drop targets).
- A hand of placement cards, titles shown, years hidden.
- Drop into a gap calls scorePlacement. Clean settles in place. Misfire animates
  the flip-to-reveal-year and snap-to-correct-slot, then re-sorts the line, and
  ticks a stroke. This flip is the signature moment; make it feel good.
- A top bar with strokes and streak in the Daily Puzzle tally style, with a
  Streak x3 badge.
- Reuse per docs/chronology-reuse.md: COPY the flip mechanics from CardView
  (src/components/Card.tsx), the drag-to-place primitive from RaisedCard
  (src/components/Hand.tsx), and the drop hit-test from attemptPlay
  (src/SoloGame.tsx). Do not import those Movie-typed components directly; copy the
  mechanics into Chronology-specific pieces so the mode stays decoupled. Derive a
  card color from `decade` (the pool has no posterColor).
- Every animated piece must read useReducedMotion() and ship a fallback.
- Wire the mode into the App.tsx menu picker as the LAST step (one Mode member, one
  button, one render branch). Until then you may render it behind a dev flag to
  playtest.

Stop after Phase 3. Do NOT build Phase 4 (end screen + share) or Phase 5 (daily +
difficulty) in this run.

## Forbidden (do not touch, under any circumstance)
- src/DuelGame.tsx, sim/RULESET.md, sim/duel-sim.ts, src/lib/duel.ts,
  src/lib/difficulty.ts, src/lib/solver.ts, and anything in the Duel sim parity
  contract.
- Do NOT change the green core or verify gate except to ADD what the UI needs, and
  if you do, keep sim/chronology-verify.ts at full pass.
- Do NOT add any dependency (React 18, Vite, Tailwind 4, Framer Motion only).
- Do NOT use em dashes in any document you write.

## Done when
- A full round is playable: deal, place, clean settles, misfire flips and snaps,
  strokes and streak update, the hand empties.
- npm run build passes with no new errors.
- node sim/chronology-verify.ts is still fully green, and node sim/verify.ts is
  still 60/60.
- No forbidden file was changed. Then stop and summarize what landed.
