# Orchestration Plan — Multi-Agent Execution for the UI Redesign

> **What this is:** a blueprint for running the remaining build plan (the UI
> redesign waves from `design/UI-PRD.md`) with a Fable orchestrator delegating
> to Opus/Sonnet subagents, written for the NEXT session to execute. It does not
> change any game code. It exists because the container is ephemeral and the
> live wave/task list currently exists only in a running session's context —
> see "Handoff requirement" at the bottom.

## The honest assessment first

Multi-agent orchestration helps this repo in two ways, and one of them is not
the one people expect:

1. **Wall-clock parallelism** — real, but capped by file topology, not by how
   many agents you can spawn. Roughly half the redesign surface (Duel board,
   Duel overlays, end recap — UI-PRD §S2/S3/S4, the "spend the effort here"
   screens) lives in **one file**, `src/DuelGame.tsx` (~1,960 lines, 31
   `useState`). Two agents editing it concurrently is merge hell in exactly the
   file CLAUDE.md flags as highest blast radius. That work is inherently
   serial. Expect maybe a 25–40% wall-clock win overall, not 4×.
2. **Context hygiene** — the bigger, quieter win. A long single session
   executing a many-wave plan degrades: the executor's context fills with old
   file reads and stale diffs. A fresh subagent per task starts with a full
   context budget and a tight brief, and the orchestrator never has to hold
   the 2,000-line file in its own head. This improves *quality and
   consistency* late in the plan, which matters more here than speed.

So: **Fable orchestrating + Opus/Sonnet workers is the right shape**, as long
as the plan is re-cut by *file ownership* (lanes) rather than by feature, and
as long as `DuelGame.tsx` has exactly one owner at a time.

## Lane map (what can actually run in parallel)

Lanes are disjoint file sets. Tasks in different lanes can run concurrently;
tasks in the same lane are serial. Line counts as of this writing.

| Lane | Files | Size | UI-PRD screens | Parallel-safe? |
| --- | --- | --- | --- | --- |
| **HERO** | `src/DuelGame.tsx` | 1,957 | S2 Duel board, S3 overlays, S4 recap | **No — one owner, always. This lane is the critical path; keep it busy every wave.** |
| MENU | `src/App.tsx` | 155 | S1 Menu | Yes |
| SOLO | `src/SoloGame.tsx`, `src/components/Results.tsx` | 441 | S5 Solo board | Yes |
| CHRONO | `src/ChronologyGame.tsx`, `src/components/ChronoCard.tsx` | 737 | S6 Chronology board | Yes |
| SHELL | `src/components/Hand.tsx`, `MeldZone.tsx`, `HowToPlay.tsx`, `ShareCopy.tsx` | 682 | shared chrome | Yes, but Hand/MeldZone interface changes ripple into HERO — land those *before* or *between* HERO tasks, not during |
| TOKENS | `src/index.css`, design-token values | 21 | §3 token system | Yes, but land in **wave 1 alone** — everything downstream reads it |
| CARDS | `src/components/Card.tsx` | 189 | explicitly OUT of UI-PRD scope (separate workstream, `design/card-*.md`) | separate track entirely |
| DOCS | `RULEBOOK.md`, `README.md` | — | — | Yes |

Rules the lane map encodes:

- `src/lib/` and `sim/` are **frozen** for this workstream. The redesign is
  chrome-only; UI-PRD §8 freezes rules and copy. If any task wants to touch
  them, that's a scope escalation → stop and ask the user (a rule/scoring
  change is never trivial — CLAUDE.md).
- `Card.tsx` renders inside every mode. If a HERO task and a SOLO task both
  "just quickly" restyle it, they collide. Card work is its own workstream;
  placeholder sizes in UI-PRD §2 are the contract.
- Avoid worktree isolation as the fix for overlap. Merging parallel diffs to
  `DuelGame.tsx` costs more than serializing the tasks. Re-slice instead.

## Model tiering

| Tier | Role | Assign |
| --- | --- | --- |
| **Fable** (main loop) | Orchestrator only: holds the plan, writes briefs, reviews diffs, merges, runs gates, resolves anything ambiguous, talks to the user. Does not implement — its context stays clean for judgment. | — |
| **Opus** (subagent) | Anything touching HERO, and any task requiring layout judgment against the PRD (desktop 1440×900 re-architecture, z-layer system, race-to-20 visualization, meld-shelf growth strategy, Recast overlay drama). | HERO lane, hard SHELL tasks |
| **Sonnet** (subagent) | Contained, well-specified tasks where the brief fully determines the outcome: applying the token palette, MENU restyle, SOLO/CHRONO passes that mirror an already-landed Duel pattern, HowToPlay/ShareCopy restyle, RULEBOOK/README updates, stress-test screenshot runs. | TOKENS, MENU, DOCS, follow-the-pattern SOLO/CHRONO |

Heuristic: **if the brief can fully specify the outcome, Sonnet; if the agent
must make design judgment calls against the PRD, Opus.** Don't put Sonnet on
`DuelGame.tsx` — the file itself is the hazard, regardless of task size.
(Haiku isn't worth wiring in; the small tasks here are Sonnet-cheap already.)

## Wave protocol

Each wave = one HERO task (serial critical path) + up to ~3 side-lane tasks
running concurrently beside it. HERO paces the wave; side lanes are "free"
work that rides along.

1. **Brief** — orchestrator writes each subagent a self-contained brief:
   - exact files it may touch (its lane — nothing else, name them);
   - the task's acceptance criteria from the plan, plus relevant UI-PRD
     sections pasted in (subagents shouldn't re-derive scope);
   - house rules: surgical changes only, match existing style, lowercase
     `say()` voice, React 18 / Tailwind 4 / Framer Motion only, **no new
     deps**, no localStorage, frozen copy;
   - the gates it must run before returning: `npm run build` clean, the
     relevant `npm run verify*` green, and the **B-guard** — actually run the
     app (Chromium + Playwright are preinstalled) and confirm the screen plays;
   - "report what you verified and anything you noticed but did not touch."
2. **Dispatch** — HERO task to Opus; side-lane tasks to Sonnet/Opus per the
   tiering table. All in one parallel batch.
3. **Integrate** — orchestrator reviews each diff against the brief (files
   touched = files allowed?), merges, then runs the full gate suite once:
   `npm run verify` (**60/60**), `npm run verify:solo`, `npm run
   verify:chronology`, `npm run build`. Gates are cheap — run all of them
   every wave even for chrome-only changes; they're the tripwire for scope
   creep into the engine.
4. **Checkpoint** — commit per wave with the wave label in the message; update
   the task list doc (checkboxes) in the same commit so a dead session loses
   at most one wave.
5. **Review pass** (end of wave, parallel): a reviewer subagent on the wave's
   full diff + a browser smoke of the three modes. Findings feed the next
   wave's briefs rather than triggering in-wave churn, unless a gate broke.

What the orchestrator does NOT delegate: merging, gate runs, anything
requiring a user decision (deploys are outward-facing — always held for user
OK), and re-litigating locked decisions in the PRD or PLAN.md.

## Cutting the existing wave plan over

The live wave/task list (the "A3, wave 2" plan) lives in the executing
session's context, not in the repo. To adopt this blueprint:

1. **Handoff requirement:** before the current session ends, have it commit
   its remaining task list to `docs/ui-tasks.md` — same checkbox format as
   `docs/chronology-tasks.md`, one acceptance line per task. Without this
   file, the next session is re-planning from scratch.
2. The next session's orchestrator then re-buckets each remaining task by
   lane (table above), tiers it (Opus/Sonnet), and packs waves as: one HERO
   task + whatever side-lane tasks are ready. Dependency rule of thumb:
   TOKENS first, SHELL interface changes before the HERO tasks that consume
   them, DOCS last.

## Known open threads to fold into the wave plan

Standing items already flagged in PLAN.md / chronology-tasks.md that slot
naturally into lanes:

- **HERO:** double-tap "Allow it" re-entry guard (pre-existing bug, spawned as
  a task); two-pile layout flagged for the feel pass; ending-stalemate feel.
- **D1** (draw-3 discard visibility) — revisit after the draw-3 feel pass;
  it's a *rules-adjacent* visibility decision, so it's an orchestrator/user
  call, not a subagent call.
- **DOCS/content:** Chronology Stage B pool growth (162 → 300–500) + human
  date-verification pass — content-only, Sonnet-friendly, fully parallel to
  everything (touches only `scripts/chronology-seed.ts` + emitted JSON).
- **Deploy** — always held for explicit user OK.
