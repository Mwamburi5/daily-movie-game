# CLAUDE.md — Match Cut (Daily Movie Game)

Working guidelines for this repo. Two behavioral rules (adapted from the
[Karpathy guidelines](andrej-karpathy-skills/skills/karpathy-guidelines/SKILL.md)),
kept because they add value *here*. The other two principles — Simplicity First
and Goal-Driven Execution — are already enforced by the sim contract and project
memory, so they're intentionally omitted to keep this file lean.

## Think Before Coding (Karpathy #1)

Don't assume. Don't hide confusion. Surface tradeoffs.

- State assumptions explicitly; if uncertain, ask.
- Most requests here are **subjective** ("make it pop / feel snappier / more
  fun"). Name the readings — visual vs. mechanical vs. pacing — and recommend one
  before building, rather than silently picking.
- A **rule or scoring change is never trivial**: it invalidates the difficulty
  tuning and the sim↔React parity. Flag it; don't fold it into an unrelated edit.

## Surgical Changes (Karpathy #3)

Touch only what you must. Match existing style. Clean up only your own mess.

- `src/DuelGame.tsx` is ~1,300 lines / 31 `useState`. Highest blast radius in the
  repo. Change only the lines the task requires; do **not** refactor the state
  soup into a reducer "while you're in there" — not asked, not broken.
- Match the existing voice: lowercase `say()` messages, comments that explain
  *why*, no new dependencies.
- Notice unrelated dead code? Mention it — don't delete it.

## Project guardrails (what the rules above protect)

- **`sim/RULESET.md` is the canonical contract.** The sim is the source of truth;
  React must match it. Any rule/scoring change → re-run `npm run verify` (must be
  **60/60**) and re-tune difficulty before shipping. React and the sim should call
  the **same** functions in `src/lib/` — parity by construction, not by discipline.
- **Deps are locked:** React 18 / Vite / Tailwind 4 / Framer Motion only. No new
  deps or features without asking.
- **Persistence: revisited 2026-07-04.** localStorage is now IN scope, but only for
  meta-state — per-mode streaks, played-today, personal bests. Game rules and deals
  stay stateless and seed-derived; never persist anything a rule depends on.
- **`RULEBOOK.md` is the living plain-English guide** (the two modes, for a 12-year-old).
  When a mechanic, mode, or scoring rule changes, update RULEBOOK.md in the same pass so
  it never drifts from the actual game.
