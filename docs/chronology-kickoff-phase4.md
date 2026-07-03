# Chronology, Phase 4 Kickoff Prompt

> Paste the block below into a fresh session to resume Chronology at Phase 4 (the
> end state and share). It is self-contained: it states what is already done, what
> to build, and the guardrails to honor. Written 2026-06-30 at the clean Phase 3
> stop (mode is playable end to end). Note: do not use em dashes in any document.

---

Read these files in full before doing anything else, in this order:
`design/chronology.md` (the locked design spec, see Phase 4 in the build plan and
the "How it ends" section), `docs/chronology-PRD.md` (sections 4, 7, 9),
`docs/chronology-tasks.md` (Phase 4), and `docs/chronology-reuse.md`. They are the
design of record for "Chronology," a third, standalone mode for the Marquee movie
game. Treat them as the source of truth. Do not redesign the mode.

## Where things stand (done, do not redo)
- Phase 1 (data pipeline), Stage A: DONE. `scripts/chronology-seed.ts` holds 162
  curated films, even decade spread. `npm run build:chronology-pool` validates and
  emits `src/data/chronology-pool.json` (record shape
  `{ id, title, year, releaseDate, decade, popularity }`). Stage B (grow to 300 to
  500) and a human date-verification pass are still open but are content only; do
  not block UI work on them.
- Phase 2 (core logic + verify gate): DONE. `src/lib/chronology.ts` is the pure,
  React-free core: `dealRound`, `correctSlot`, `scorePlacement`, `gapTightness`,
  and the shared streak/tight-call economy `streakCredit` plus `newStreak` (the
  caller owns `StreakState`). Gate: `npm run verify:chronology` is 35/35.
- Phase 3 (mode UI): DONE. `src/ChronologyGame.tsx` is a playable sibling of
  `DuelGame.tsx`, reachable from the `App.tsx` menu, calling only
  `src/lib/chronology.ts` for rules. It already tracks everything Phase 4 needs:
  - `playLog: { id, result }[]` records each placement in order (`result` is
    `'clean'` or `'misfire'`).
  - `strokes`, `credits`, and `score = strokes - credits` are live.
  - `status` flips to `'cleared'` when the hand empties.
  - A MINIMAL `ChronoResults` overlay (a sub-component near the bottom of
    `src/ChronologyGame.tsx`) already shows when cleared: title, final score, a
    stroke/credit line, a `🎬` + `🟩`/`🟥` emoji row, and a Play again button.
    Phase 4 makes this the real end and share screen.
  Supporting files added in Phase 3: `src/components/ChronoCard.tsx` (the flip
  card, copied from `CardView`, decade-derived color), `src/data/chronologyPool.ts`
  (typed pool loader). Build is clean; `npm run verify` (Duel) stays 60/60.

## Your task: implement Phase 4 (end state and share) ONLY
Follow the per-task acceptance criteria in `docs/chronology-tasks.md` Phase 4:
1. Show a Cleared screen when the hand empties. It must appear only when the hand
   is empty and show the final score. (Phase 3 already gates on `status` and shows
   a rough version; turn it into the real screen.)
2. Build the emoji row from the run. One glyph per placement, in placement order,
   using a clean glyph and a misfire glyph (the spec calls for `🟩` clean and `🟥`
   misfire; `playLog` is already in order).
3. Provide a copy to share action. Copying must yield the emoji row plus the score
   in the family share format.

Decide and keep consistent: the exact share TEXT (a title line, the score, the
emoji row, and any tag line). Mirror how the result reads in the other two modes
so all three share as one family.

## Reuse, do not reinvent (see `docs/chronology-reuse.md`)
- End screen choreography: COPY the staggered spring entrance, the emoji chip, and
  the Play again button from `src/components/Results.tsx` (do not import it; its
  props are Duel/Solo shaped, Chronology has strokes, streak credits, final score,
  no par or solution). The current `ChronoResults` is the starting point.
- Emoji row build: the `playLog` to glyph-string pattern is already in
  `ChronoResults`; the Solo analog is in `src/SoloGame.tsx` (`emoji = '🎬' + ...`).
- IMPORTANT reality check on "family share format": there is currently NO
  copy-to-clipboard or Web Share action anywhere in the app. Solo and Duel only
  DISPLAY an emoji row (`src/components/Results.tsx` renders the `emoji` string);
  neither has a copy button. So Phase 4 introduces the first real copy action. Use
  `navigator.clipboard.writeText` with a graceful fallback, and show a transient
  "copied" confirmation in the lowercase house voice. Do NOT retrofit the copy
  action into Solo or Duel in this pass: Duel is a forbidden file, and a Solo
  retrofit is scope creep. If a shared share helper feels right, flag it for a
  later pass rather than building it now.
- No new dependencies. Clipboard is a browser API; no library.

## Guardrails (from CLAUDE.md and the spec)
- Surgical changes; match house style (lowercase `say()`-style copy, comments that
  explain why, `data-*` test hooks, `useReducedMotion()` fallbacks). Do NOT
  refactor `DuelGame.tsx`'s state soup.
- Deps are locked: React 18 / Vite / Tailwind 4 / Framer Motion only. No new deps.
- No persistence (localStorage) unless explicitly revisited. (A daily "already
  played" memory is Phase 5, not Phase 4.)
- A rule or scoring change is never trivial. Phase 4 is end-screen and share only;
  if you find yourself wanting to change scoring, stop and flag it instead.
- Do NOT use em dashes in any document.

## Forbidden (do not touch)
`src/DuelGame.tsx`, `sim/RULESET.md`, `sim/duel-sim.ts`, `src/lib/duel.ts`,
`src/lib/difficulty.ts`, `src/lib/solver.ts`, and anything in the Duel sim parity
contract. Do not change `src/lib/chronology.ts` rules (you may read it; only touch
it if a genuinely missing pure helper is needed, and call it out first).

## Done when
- Finishing a round shows the real Cleared screen with the final score and the
  per-placement emoji row, and a copy to share action puts the emoji row and score
  on the clipboard in the family format, with a "copied" confirmation.
- `npm run build` passes with no new errors and `npm run verify:chronology` stays
  35/35 (and `npm run verify` stays 60/60).
- Note: the headless code preview throttles animations when the tab is hidden
  (`visibilityState === 'hidden'`), so framer springs and gestures freeze partway;
  the shipping Solo hand collapses the same way. Verify structure and logic there,
  and trust animation to the copied `Results.tsx` patterns. Drive a real placement
  in a focused browser tab if you need to see the end screen choreography.
- Update `docs/chronology-tasks.md` (check off Phase 4) and the project memory.
- No forbidden file changed. Then stop and summarize. (Phase 5, the deterministic
  daily seed and the difficulty dial, is the next step after this.)
