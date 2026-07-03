# Chronology — Claude Code Kickoff Prompt

> Paste the block below into Claude Code from the repo root. It reads
> `design/chronology.md`, writes the PRD and task breakdown, scaffolds typed
> stubs, and stops for review before implementing logic.

---

Read design/chronology.md in full before doing anything else. It is the locked design spec for "Chronology" (working title), a third game mode for Marquee. Treat it as the source of truth. Do not redesign it.

## Context (carry forward — already decided, do not relitigate)
- Marquee has two live modes: Daily Puzzle (solo golf) and Duel vs Computer. Chronology is a THIRD, standalone mode.
- Core loop: insertion. Place movie cards into a growing year-ordered line.
- Placement is HARD: a card is in the correct slot or it is not. Wrong placement flips to reveal the real year, snaps to the correct slot, costs a stroke; the line is never left out of order.
- PURE YEAR. No casts, no person-links, no connection graph. Chronology shares NONE of the Duel link engine.
- Resolution: official TMDB release DATE (hidden), shown to the player as a year only. Ties resolve by date so there is always one correct slot.
- Era window: 1970-01-01 to present.
- Hand size: 10 (1 anchor + 10 placements per round).
- Scoring is golf (low wins): clean +0, misfire +1, streak of 3 clean -1, tight-call mercy. Final = strokes minus streak credits.
- Pool: build to 300-500 recognizable films, stratified roughly evenly across decades 1970s-2020s. Record shape: { id, title, year, releaseDate, decade, popularity }.

## Your task, in this exact order
1. Write docs/chronology-PRD.md — a full Product Requirements Document derived from the spec. Sections: problem and goal, the skill hypothesis (reward reasoning over recall), target player and modes context, scope (in/out), the mechanic, the ruleset contract, scoring, data requirements, success metrics (define measurable ones, e.g. round completion, stroke distribution, day-over-day retention), risks and open questions, and milestones. Do not invent mechanics beyond the spec; where the spec leaves something open, list it under open questions rather than deciding it.
2. Write docs/chronology-tasks.md — a phased, checkbox task breakdown matching the 6 build phases in the spec (data pipeline, src/lib core, mode UI, end state + share, daily seeding + difficulty, docs). Each task: a one-line acceptance criterion.
3. Scaffold the file structure as STUBS ONLY (signatures, types, and TODO comments — no real logic yet):
   - scripts/build-chronology-pool.ts (TMDB pull + recognizability filter + decade stratification -> chronology-pool.json)
   - src/lib/chronology.ts (pure functions: dealRound, correctSlot, scorePlacement, gapTightness — typed, with doc comments, bodies throwing "not implemented")
   - sim/chronology-verify.ts (placeholder harness that will assert scoring correctness and measure the difficulty ramp)
   - src/ChronologyGame.tsx (component shell wired to nothing yet)
4. Then STOP and present a short summary of what you created and the recommended first implementation phase. Wait for my go-ahead before writing any real logic.

## Allowed
- Create new files under docs/, scripts/, src/lib/, src/, and sim/ for this mode only.
- Read any existing file to match house style, types, and conventions.

## Forbidden — do not, under any circumstance
- Do NOT modify src/DuelGame.tsx, sim/RULESET.md, sim/duel-sim.ts, src/lib/duel.ts, src/lib/difficulty.ts, src/lib/solver.ts, or anything in the Duel sim parity contract.
- Do NOT modify RULEBOOK.md. (Chronology promotes into it only on ship, not now.)
- Do NOT add any dependency. Deps are locked: React 18, Vite, Tailwind 4, Framer Motion only.
- Do NOT implement real logic in this run. Stubs and docs only until I approve.
- Do NOT use em dashes in any document you write. Use commas, periods, or semicolons.
- Do NOT add features, abstractions, or files beyond the four scaffolds and two docs listed above.

## Checkpoints
- After step 1 (PRD), output: PRD written, and a 3-line summary. Continue.
- After step 3 (scaffolds), STOP. Output: files created (list paths) and the recommended first phase. Ask before proceeding.

## Done when
docs/chronology-PRD.md and docs/chronology-tasks.md exist and are complete, the four stub files compile (npm run build passes with no new errors), no forbidden file was touched, and you have stopped for my review.
