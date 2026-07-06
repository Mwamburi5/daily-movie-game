> ⛔ **SUPERSEDED 2026-07-06 by [`master-plan.md`](master-plan.md) — the only live plan.**
> Kept for history; do not update. The wave protocol, lane map, and model tiering
> that worked were carried into master-plan.md §2–§3; the Step 0 checkpoint and
> 60/60 gate count here were already stale.

# Orchestration Plan v2 — the Structured Orchestrated Path

> **Directive: moving forward, all remaining build-plan work runs through this
> protocol.** Point the executing session at this file. It reconciles against
> the in-flight wave plan (Step 0), then executes the remaining work as
> orchestrated waves: a Fable main loop dispatching Fable/Opus/Sonnet
> subagents, cut for maximum parallelism under the repo's one hard constraint.
>
> This doc is self-contained: copy it into any working copy of the repo and
> execute from it. It changes no game code by itself.

---

> **Artifact paths:** the UI-PRD this plan briefs from is
> **`design/UI-PRD.md`** (not docs/). Contracts: `docs/ui-contracts.md`.
> Task list: `docs/ui-tasks.md`.

## Step 0 — Reconcile (the executing session does this FIRST)

The live wave plan was authored in-session and never committed, so this doc
cannot know task-level status. Known checkpoint from the user (2026-07-05):

- **Wave 1: DONE.**
- **Wave 2: IN PROGRESS — currently at task A3.**

Before dispatching anything, the orchestrator must:

1. **Snapshot the in-flight plan into the repo.** Write the full wave/task
   list — done, in-progress, and remaining — to `docs/ui-tasks.md`, checkbox
   format like `docs/chronology-tasks.md`, one acceptance line per task.
   Commit it. (If this session no longer has the plan in context, rebuild the
   remaining list from the task catalog in §5 below — it covers the full
   UI-PRD scope; check off whatever the working tree already shows as done.)
   **Include the chosen visual direction** (which UI-PRD §10 add-on, A–D) and
   any design-token summary wave 1 produced — parallel agents style
   consistently only if that decision is committed, not remembered.
2. **Finish the task in flight (A3) to its gate before switching modes.**
   Never hand a half-edited `DuelGame.tsx` to a subagent.
3. **Re-bucket every remaining task** into the lanes (§2) and tiers (§3),
   then pack waves per §4. From that point on, the orchestrator implements
   nothing by hand — it briefs, dispatches, reviews, merges, and runs gates.

---

## 1. The one hard constraint (unchanged, non-negotiable)

`src/DuelGame.tsx` (~1,960 lines, 31 `useState`) holds the hero screens (Duel
board, overlays, end recap — UI-PRD §S2/S3/S4). It is the repo's highest
blast radius and CLAUDE.md forbids refactoring it. Therefore:

- **Exactly one agent owns `DuelGame.tsx` at any moment.** Its edits are the
  serial critical path; every wave is paced by it.
- Nobody "quickly" touches it from a side lane. Ever.
- The way to parallelize hero-screen work anyway is §4's **build-then-wire**
  pattern — that is the main upgrade in this v2.

`src/lib/` and `sim/` are **frozen** for the redesign (chrome-only work;
UI-PRD §8 freezes rules and copy). Any task that wants in is a scope
escalation → stop and ask the user. Deploys are always held for user OK.

## 2. Lane map (disjoint file sets = the parallelism budget)

| Lane | Files | UI-PRD | Concurrency |
| --- | --- | --- | --- |
| **HERO** | `src/DuelGame.tsx` | S2, S3, S4 | serial, one owner |
| **FORGE** | NEW files in `src/components/` (see §4) | S2–S4 chrome parts | fully parallel — each new component is its own lane |
| MENU | `src/App.tsx` | S1 | parallel |
| SOLO | `src/SoloGame.tsx`, `src/components/Results.tsx` | S5 | parallel |
| CHRONO | `src/ChronologyGame.tsx`, `src/components/ChronoCard.tsx` | S6 | parallel |
| SHELL | `src/components/Hand.tsx`, `MeldZone.tsx`, `HowToPlay.tsx`, `ShareCopy.tsx` | shared chrome | parallel, but Hand/MeldZone interface changes land BETWEEN hero tasks, not during |
| TOKENS | `src/index.css` + token values | §3 tokens | parallel; land before dependents |
| CONTENT | `scripts/chronology-seed.ts` + emitted pool JSON | — | fully parallel to everything |
| DOCS | `RULEBOOK.md`, `README.md` | — | parallel; last |
| CARDS | `src/components/Card.tsx` | out of scope (separate workstream, `design/card-*.md`) | do not touch from this plan |

## 3. Model tiering — Fable on the heavy UI

| Tier | Use for | Concretely |
| --- | --- | --- |
| **Fable — orchestrator** | The main loop. Briefs, dispatch, diff review, merges, full gate runs, user decisions. Implements nothing. | — |
| **Fable — heavy-UI subagents** | The judgment-dense UI work where a larger model visibly pays: anything that must hold the whole PRD layout system in its head at once. | • Every **HERO** integration/wiring pass on `DuelGame.tsx` • the **desktop 1440×900 table re-architecture** (kill the 420px letterbox — the PRD's core ask) • the **z-layer system** + flex-zone layout (no fixed pixel stacking; the 667px stress test) • final **motion/feel pass** across the board (§7 of the PRD) |
| **Opus — subagents** | Complex bounded components and screens: real design judgment, but scoped to one file the brief fully names. | • race-to-20 visualization • Taz presence corner • meld-shelf growth strategy • Recast offer overlay (the drama moment) • end-of-game recap reel • draw-choice overlay • SOLO and CHRONO redesign passes |
| **Sonnet — subagents** | Fully-specified mechanical tasks; the brief determines the outcome. | • TOKENS application • MENU (S1) restyle • announcement banner + token chips + idle-cue components • HowToPlay/ShareCopy restyle • RULEBOOK/README updates • CONTENT Stage B pool growth (162 → 300–500) • stress-test screenshot runs |

Heuristic: brief fully determines the outcome → Sonnet; judgment within one
named file → Opus; must reason about the whole layout system or edit
`DuelGame.tsx` → Fable. Never Sonnet on `DuelGame.tsx`.

## 4. Build-then-wire — how hero work goes parallel anyway

The v1 plan treated S2/S3/S4 as inherently serial because they live in
`DuelGame.tsx`. Half of that work doesn't have to happen *inside* the file:

**FORGE (parallel):** each major piece of new duel chrome is built as a NEW
standalone component file in `src/components/`, by a separate agent, against
a props contract the orchestrator fixes in the brief (inputs, callbacks,
placeholder card sizes from UI-PRD §2, token names). Contracts come from
`docs/ui-contracts.md` (extracted in Wave 0, not guessed). New files touch
nothing existing → any number can be forged concurrently, each verified in
isolation (`tsc --noEmit` clean + its own preview-harness render, §5 Wave 0).
Candidates:

- `ScoreRace.tsx` — the race-to-20 track (Opus)
- `TazCorner.tsx` — opponent nameplate/avatar, fan, count, tokens (Opus)
- `MeldShelf.tsx` — growth-strategy shelf, replaces inline shelf (Opus)
- `RecastOffer.tsx` — the suspense overlay (Opus)
- `RecapReel.tsx` — end-screen highlight reel (Opus)
- `DrawChoice.tsx` — keep-one overlay (Opus)
- `PlayBanner.tsx`, `TokenChips.tsx`, `IdleCue.tsx` — (Sonnet)

**WIRE (serial, Fable):** one HERO pass per wave swaps a forged component in
for the inline zone it replaces — delete the old lines, mount the new
component, thread existing state through the agreed props. Each wire pass is
small and surgical (the component boundary contains the blast radius), ends
with the full gate suite plus an in-browser play, and is a single commit.

This converts most of the hero screen from "serial edits in a 2,000-line
file" into "parallel component builds + short serial wire steps." The state
soup stays where it is — components receive props; no reducer refactor.

## 5. Task catalog & wave packing (max-parallel cut)

Full remaining scope per UI-PRD, pre-bucketed. At Step 0 the orchestrator
checks off whatever the in-flight plan already landed, then packs waves:
**every wave = one HERO/WIRE step (Fable) + as many FORGE/side-lane tasks as
are ready.** Suggested shape — resequence freely to keep all lanes saturated,
respecting only the arrows:

**Wave 0 — lock the foundation (short, mostly serial — do NOT skip it)**

Everything parallel downstream depends on three artifacts existing first:

- **Direction + TOKENS**: confirm the chosen UI-PRD §10 direction (from Step
  0), then land the design-token system in `index.css` (palette, radii,
  shadows, named z-layers, timing) — Sonnet. *(→ blocks all restyle tasks)*
- **Contract extraction** (Sonnet scout, read-only on `DuelGame.tsx`): read
  each inline zone the FORGE components will replace and freeze its props
  contract — state in, callbacks out, current behavior notes — into
  `docs/ui-contracts.md`. Forge briefs quote this file; contracts are not
  guessed. Contract changes after dispatch are an orchestrator decision.
- **Preview harness** (Sonnet): a dev-only route in `main.tsx` behind a
  `?preview=<name>` query param that mounts previews discovered via
  `import.meta.glob('./components/previews/*.preview.tsx')`. Each forge
  agent then verifies by adding its OWN `<Component>.preview.tsx` file —
  in-browser proof with zero shared-file edits. Excluded from the prod path.

**Wave A — hero skeleton + first forge batch**
- HERO (Fable): flex-zone layout skeleton + z-layer adoption inside the duel
  board — the no-fixed-pixel-stacking pass; 667px stress test.
- FORGE in parallel: `ScoreRace` (Opus) · `TazCorner` (Opus) · `PlayBanner`
  + `TokenChips` + `IdleCue` (Sonnet) — all against `docs/ui-contracts.md`,
  each with its preview file.
- CONTENT: Stage B pool growth kickoff (Sonnet, rides along every wave).

**Wave B — wire batch 1 + second forge batch**
- HERO/WIRE (Fable): mount `ScoreRace` + `TazCorner` + `PlayBanner`/chips.
- FORGE in parallel: `MeldShelf` (Opus) · `RecastOffer` (Opus) ·
  `DrawChoice` (Opus).
- MENU (S1) restyle on the new tokens — Sonnet.
- SHELL: `Hand.tsx` fan/raise restyle (Opus — interface ripples into HERO,
  so it lands this wave, wired next wave).

**Wave C — wire batch 2 + desktop**
- HERO/WIRE (Fable): mount `MeldShelf` + overlays + restyled Hand; retire
  `MeldZone.tsx` inline usage.
- HERO (Fable): desktop 1440×900 real-table re-architecture (side-rail
  shelf, top race, ambient backdrop). *(→ needs wired components)*
- FORGE: `RecapReel` (Opus). SOLO pass (Opus) · CHRONO pass (Opus) in
  parallel — mirror the landed duel language.

**Wave D — finish**
- HERO/WIRE (Fable): end-of-game recap with `RecapReel`; motion/feel pass
  (§7) across the board; the double-tap "Allow it" re-entry guard (standing
  bug, same file, same owner).
- SHELL: HowToPlay + ShareCopy restyle (Sonnet).
- DOCS: RULEBOOK/README sweep (Sonnet). Stress-test screenshots (Sonnet).
- Orchestrator: D1 (draw-3 discard visibility) is a rules-adjacent decision —
  surface to the user, don't delegate. Deploy: held for user OK.

## 6. Wave protocol (unchanged mechanics, tightened)

1. **Brief** every subagent self-contained: exact files allowed (named);
   acceptance criteria + the relevant UI-PRD sections pasted in; props
   contract for FORGE tasks; house rules (surgical, match style, lowercase
   `say()`, React 18 / Tailwind 4 / Framer Motion only, no new deps, no
   localStorage, frozen copy); required gates (`tsc --noEmit`, the relevant
   `verify*`, and for screen work the B-guard: run the app — Chromium +
   Playwright preinstalled — and confirm it plays); report anything noticed
   but not touched.
2. **Dispatch** the wave's tasks in one parallel batch; HERO/WIRE runs
   alongside. **Concurrency discipline:** lanes are disjoint files, so one
   shared working tree is fine — but subagents never run `git` (the
   orchestrator owns all commits) and never run the full `npm run build`
   (concurrent Vite builds race on `dist/`; `tsc --noEmit` is safe in
   parallel). Reach for worktree isolation only if two tasks genuinely must
   overlap on a file — and prefer re-slicing the tasks instead.
3. **Integrate** (orchestrator): diff review per brief — files touched ⊆
   files allowed — then merge and run the full suite once per wave:
   `npm run verify` (**60/60**) · `verify:solo` · `verify:chronology` ·
   `npm run build`. All of them every wave; they're the tripwire for scope
   creep into the frozen engine.
4. **Checkpoint**: one commit per wave, wave label in the message, checkbox
   updates to `docs/ui-tasks.md` in the same commit. A dead session loses at
   most one wave.
5. **Review pass** in parallel at wave end: reviewer subagent on the wave
   diff + browser smoke of all three modes, saving a screenshot set (menu +
   each board) to the session scratchpad and eyeballing it against the prior
   wave's set — the cheap tripwire for cross-mode visual regressions the
   verify scripts can't see. Findings feed the next wave's briefs; only a
   broken gate interrupts the current one.

## 7. What stays with the orchestrator, always

Merging · gate runs · props-contract decisions · anything touching locked
decisions in PLAN.md / the PRD · rules-adjacent calls (D1) · deploy timing ·
and talking to the user.
