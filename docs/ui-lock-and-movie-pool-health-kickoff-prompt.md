# Match Cut UI checkpoint lock + movie-pool health audit — kickoff prompt

Copy everything inside the block into a fresh Codex session.

````text
/goal Lock the reviewed first-run onboarding and menu-polish checkpoint in one
surgical local commit, then produce a reproducible, evidence-backed health audit
of Match Cut's movie pools. Do not expand or edit the movie data in this goal.

Repository:
`/Users/mwamburi/Projects/Daily Movie Game`

## Outcome

Complete these two phases in order:

1. Verify and locally commit only the reviewed onboarding/menu checkpoint.
2. Audit the current movie pools, their overlap, usage, balance, and connection
   health; write a durable report that recommends what kind of expansion, if
   any, should come next.

This prompt authorizes one local commit for the exact Phase 1 checkpoint after
you verify its scope and gates. It does not authorize a push, pull request,
merge, Preview, production deployment, external account mutation, public share,
or indexing change.

Phase 2 is analysis and documentation only. Do not edit `src/data/`, re-bake
Connections grids, change seeds, tune difficulty, call TMDB, create a candidate
slate, or merge movie additions. Stop with the audit and a clear decision gate.

Continue until both phases are complete or a genuine scope discrepancy, failed
gate, or required human decision prevents safe progress.

## Read first

Read these sources before taking action:

- `AGENTS.md`.
- `docs/master-plan.md`, especially the Ledger in Section 6 and the pool/
  launch decisions in Sections 0, 7, and 9.
- `RULEBOOK.md` and `sim/RULESET.md`.
- `docs/goal-5-public-launch-acceptance.md` and
  `docs/production-release-checklist.md` for the held publication boundaries.
- `src/App.tsx`, `src/components/Onboarding.tsx`,
  `src/components/HowToPlay.tsx`, `src/lib/progress.ts`, `src/index.css`, and
  `tests/browser/delivery-smoke.spec.ts` for the Phase 1 change.
- `src/data/movies.ts`, `src/data/duelPool.ts`,
  `src/data/chronology-pool.json`, and
  `src/data/connections-grids.json` for the Phase 2 census.
- `src/data/types.ts`, `src/lib/daily.ts`, `src/lib/solver.ts`,
  `src/lib/chronology.ts`, and `src/lib/connections.ts` for canonical behavior.
- `sim/solo-verify.ts`, `sim/chronology-verify.ts`,
  `sim/connections-verify.ts`, and `sim/connections-gen.ts` for reproducible
  daily windows, invariants, and existing analysis functions.
- `docs/connections-yield.md`, `docs/pool-unification.md`,
  `docs/wave3-report.md`, and the content-related Ledger entries for historical
  context. Treat historical metrics as context, not current proof.

Do not treat `PLAN.md`, `orchestration-plan.md`, or `ui-tasks.md` as live plans.
`docs/master-plan.md` is the only live build plan.

## Authoring-time repository state — verify, do not assume

At prompt creation on 2026-08-24:

- Branch: `codex/daily-mode-polish`.
- HEAD: `31bc25f780bb6ffb8b63b9522c3488dd43234ada`
  (`Complete Goal 5 public-launch acceptance candidate`).
- Upstream: `origin/codex/daily-mode-polish`.
- HEAD and upstream were even: 0 ahead / 0 behind.
- The reviewed UI checkpoint was uncommitted.
- The verified content baselines were:
  - 89 films in the frozen Daily Puzzle/Duel pool;
  - 3 additional non-movie wild cards in Duel;
  - 304 fully credited films in `MOVIES`, used by Connections generation;
  - 482 dated films in the Chronology pool;
  - 365 baked Connections grids, each containing 16 films.

The expected reviewed Phase 1 paths were:

- modified: `docs/master-plan.md`
- modified: `src/App.tsx`
- modified: `src/components/HowToPlay.tsx`
- new: `src/components/Onboarding.tsx`
- modified: `src/index.css`
- modified: `src/lib/progress.ts`
- modified: `tests/browser/delivery-smoke.spec.ts`

The following pre-existing untracked documents are unrelated to the UI commit
and must be preserved and excluded:

- `docs/full-product-code-review-kickoff-prompt.md`
- `docs/pool-expansion-goal-prompt.md`

This kickoff prompt may itself be untracked and must also be excluded from the
Phase 1 UI commit:

- `docs/ui-lock-and-movie-pool-health-kickoff-prompt.md`

If the branch, SHA, upstream relation, path list, or diffs have materially
changed, inspect and explain the drift before proceeding. Never overwrite,
discard, stage, or clean unrelated user work.

## Standing product and engineering guardrails

- Make surgical changes only. Do not refactor `src/DuelGame.tsx` or unrelated
  state while working nearby.
- No new runtime or development dependencies.
- Preserve all game mechanics, scoring, deals, seeds, difficulty, persistence
  semantics, share output, movie pools, and baked Connections grids.
- `sim/RULESET.md` is canonical for rules. React and the sim must remain in
  parity.
- Local storage is meta-state only. The reviewed `seenOnboarding` addition must
  not become rule-bearing state.
- Do not raise the 100 KiB menu-shell budget merely to make the build pass.
- Keep `noindex, nofollow`; do not add the public URL to share output.
- Push, Preview, production, and public indexing are separate approval gates.
- Real-device and attended assistive-technology evidence cannot be replaced by
  automation.
- Do not use TMDB or web sources to silently correct local movie records. Any
  future metadata verification belongs to the separate `tmdb-check` workflow
  and requires Buri's rulings on new flags.
- Do not silently harmonize conflicting counts or source values. Record the
  discrepancy, likely cause, and decision needed.

## Phase 1 — lock the reviewed UI checkpoint

### 1. Inspect the exact change

Review the working-tree diff path by path. Confirm that the intended behavior
is limited to:

- replacing the old welcome overlay with a four-screen, static first-run
  onboarding flow;
- clear GOLF labels only where the mode is golf-scored;
- a replay entry in the overview How to Play sheet above TMDB attribution;
- deterministic focus return to the menu `?` / How to play control after
  onboarding dismissal;
- a completed 3/3 Daily Passport becoming a distinct Triple Feature state;
- tighter menu spacing and improved label legibility;
- additive meta-only onboarding persistence and browser coverage;
- the matching local-verification Ledger receipt.

Confirm that no rule, score, deal, movie pool, baked grid, share contract,
analytics schema, or storage version changed. If the diff exceeds this scope,
stop and report the exact unexpected lines rather than folding them into the
commit.

### 2. Verify the checkpoint

Run the complete local matrix from the repository root:

```sh
npm run build
npm run check:bundle
npm run check:security
npm run verify
npm run verify:solo
npm run verify:chronology
npm run verify:connections
npm run test:smoke
git diff --check
```

Expected baseline from the reviewed tree:

- build passes;
- menu shell is approximately 97.36 KiB gzip and remains under 100 KiB;
- security passes across 199 repository files / 26 production files;
- Duel 64/64;
- Daily Puzzle 8/8;
- Chronology 42/42;
- Connections 14/14;
- browser smoke 25/25;
- no whitespace errors.

The Connections verifier is exhaustive and can be slow. Let it complete. If a
local preview server is blocked by sandbox permissions, use the normal approval
mechanism for the test command; do not weaken or skip the browser gate.

If any gate fails, diagnose whether the failure is a real regression,
environmental limitation, or changed baseline. Fix only an in-scope regression.
Re-run every gate affected by a fix. Do not commit with a red required gate.

### 3. Stage explicitly and review the staged candidate

Stage only these seven paths:

```text
docs/master-plan.md
src/App.tsx
src/components/HowToPlay.tsx
src/components/Onboarding.tsx
src/index.css
src/lib/progress.ts
tests/browser/delivery-smoke.spec.ts
```

Do not use `git add .`, `git add -A`, a broad glob, or any command that might
capture the unrelated prompts. Before committing, verify:

- `git diff --cached --check` is clean;
- `git diff --cached --name-status` contains exactly the seven intended paths;
- `git diff --cached --stat` is plausible;
- `git status --short` still shows the unrelated prompt documents untracked and
  unstaged.

### 4. Create one local commit

This prompt authorizes the scoped local commit. Use this message unless the
repository's actual diff makes it misleading:

```text
Polish first-run onboarding and menu follow-through
```

After committing:

- record the exact commit SHA and subject;
- confirm the seven paths are no longer dirty;
- list every remaining modified or untracked path;
- confirm that no push, PR, merge, deployment, or indexing change occurred.

Do not amend or rewrite earlier commits. Do not push.

## Phase 2 — reproducible movie-pool health audit

Start Phase 2 from the new local UI commit. The pre-existing prompt documents
and this kickoff prompt may remain untracked; preserve them.

### Audit boundary

This phase may read source data, import existing pure functions, run existing
analysis/verifier commands, and write new audit artifacts under `docs/`.

Prefer a temporary script under `/private/tmp` for one-off calculations. If a
small dependency-free repository script is genuinely necessary for
reproducibility, explain why and keep it strictly analysis-only. Do not modify
production behavior or bundle imports.

Do not:

- edit `src/data/movies.ts`, `src/data/duelPool.ts`,
  `src/data/chronology-pool.json`, or `src/data/connections-grids.json`;
- run a command that overwrites or re-bakes a source artifact;
- call TMDB, add API keys, browse for candidate facts, or apply metadata
  rulings;
- add candidates, graduate stubs, expand `DUEL_POOL_IDS`, or retune Duel/Solo;
- change rules, scoring, seeds, distribution, or daily behavior;
- commit the Phase 2 report unless Buri separately requests it.

### Canonical definitions

Use the code's definitions rather than inventing approximations:

- `MOVIES` is the fully credited pool.
- `DUEL_POOL_IDS` / `DUEL_POOL` is the frozen 89-film pool shared by Daily
  Puzzle and Duel.
- `chronology-pool.json` is the dated Chronology pool.
- Connections runtime uses the baked grids; its author-time dealer uses
  `MOVIES`.
- Use `sharedPeople()` for person-based adjacency and `linkTier()` for the
  existing standard/strong/super tier. Do not inflate the headline connection
  count with same-genre membership.
- Treat series membership and Connections category viability separately from
  person-link degree.
- Wild cards are Duel mechanics, not movies, and must not be counted as films.

### Fixed analysis window

Use a fixed, written date/seed window so the report is reproducible. Prefer the
existing baked Connections window, 2026-07-06 through 2027-07-05 inclusive,
unless current source code proves a different canonical window. Use the same
365 date strings for Daily Puzzle and Chronology exposure analysis where their
seed contracts allow it.

For Duel, which is not a baked 365-grid schedule in the same sense, do not imply
that simulated deals are actual published dailies. Report static pool/graph
health and, if useful, a clearly labelled deterministic 365-seed simulation.

### Required analysis

#### A. Pool census and overlap

Report exact counts for:

- fully credited `MOVIES`;
- frozen Daily Puzzle/Duel films;
- Chronology dated films;
- baked Connections grids and total grid slots;
- unique films actually used across the 365 baked Connections grids;
- films never used in that baked window;
- the union and every useful intersection among the credited, frozen, dated,
  and baked-used sets.

Include a compact overlap matrix or table. Explain why the counts are not
additive. Validate ID uniqueness and flag any pool ID that fails to resolve.

#### B. Daily exposure and repetition

For the fixed 365-day window, calculate where applicable:

- appearances per film;
- minimum, median, mean, p90, and maximum appearances;
- films with zero appearances;
- the most and least exposed films;
- starter/anchor versus hand/grid appearances when those roles are meaningful;
- consecutive-day or short-window repetition that could feel repetitive;
- concentration: what share of all slots is occupied by the top 10 and top 25
  films.

Keep mode results separate. Do not blend Daily Puzzle, Chronology, Connections,
and Duel into a misleading single frequency.

#### C. Time and category coverage

Report credited and dated coverage by:

- decade and, where useful, year;
- genre;
- series/franchise;
- director, writer, and actor credit frequency;
- role-aware people totals and exact-name consistency risks visible locally.

For multi-genre movies, state whether counts are multi-label or exclusive.
Do not infer demographic identity, nationality, race, gender, or representation
from names. If those questions need future research, label them as unknown
rather than fabricating classifications.

#### D. Connection-graph health

Using canonical local functions, calculate for the 304-film credited graph and
the frozen 89-film graph:

- unique person-linked neighbors per film;
- standard, strong, and super link counts;
- zero-degree and low-degree films;
- median, p90, and maximum degree;
- high-degree hubs and their share of graph edges;
- connected components and any isolated components;
- repeated reliance on the same actor/director/writer;
- same-series opportunities, reported separately;
- fragile cards whose usefulness depends on one exact credit spelling.

List exact examples for each important finding. Keep visible/top-cast versus
deep-only credits distinct if the current types support that distinction.

#### E. Mode-specific health

Daily Puzzle:

- confirm 89-film source pool and eight-film board structure;
- summarize 365-day appearance balance and current par distribution;
- identify whether a small subset of hubs dominates solvable lines.

Duel:

- confirm 89 real films plus three non-movie wild cards;
- summarize graph density, hub dependence, and underlinked cards;
- preserve the current tuned pool and explicitly state that expansion would
  require a separate re-tune and parity gate.

Chronology:

- confirm 482 dated films and 11-film round structure;
- show decade distribution, date density, same-day/same-month clusters, and
  thin or crowded periods;
- report exposure balance over the fixed window without revealing dates in any
  player-facing artifact.

Connections:

- confirm 304-film author-time pool, four groups of four, and 365 baked grids;
- calculate baked usage frequency, unused films, category mix, key repetition,
  person/series/genre balance, and reliance on a small set of film hubs;
- use existing dealer/yield helpers when safe, but do not re-bake or change the
  pinned digest.

#### F. Cross-mode leverage

Identify:

- films already valuable in three or four modes;
- credited films excluded from the frozen 89 but highly connected to it;
- Chronology-only dated entries that are plausible future graduation lanes,
  labelled as hypotheses because they do not yet have credited metadata;
- areas where one carefully chosen future film could improve multiple modes;
- areas where adding movies would not solve the actual problem;
- whether current evidence supports holding, targeted expansion, or broad
  expansion.

Do not turn this section into a researched title slate. Local examples are
acceptable; new candidate research belongs to the separate pool-expansion
goal after Buri reviews this audit.

### Required artifacts

Create:

1. `docs/movie-pool-health-report-2026-08-24.md`
2. `docs/movie-pool-health-data-2026-08-24.json`

The Markdown report must contain:

- executive verdict;
- methods, fixed window, commands, and source files;
- straight per-mode count table;
- pool overlap table;
- exposure/repetition findings by mode;
- era/genre/people/series coverage;
- graph-health findings for 304 and 89;
- mode-specific findings;
- cross-mode leverage;
- data-quality limitations and unknowns;
- prioritized recommendations;
- a decision table with at least:
  - **Hold current pools**;
  - **Targeted credited expansion** (suggest a justified range, not an
    automatic batch);
  - **Broad expansion**;
- explicit recommendation and confidence;
- exact next approval needed from Buri.

The JSON artifact must contain the report's core counts and distributions in a
stable, machine-readable shape. Include metadata for generation date, branch,
HEAD, source counts, analysis window, and methodology version. Do not include
secrets or external data.

Every headline number in Markdown must be traceable to the JSON or to a named
existing verifier output. Clearly label inference versus direct computation.

### Audit verification

Before finishing:

- parse the JSON successfully;
- confirm all reported pool IDs resolve as expected or list exceptions;
- independently re-count the four headline pool sizes;
- spot-check at least five high-degree, five low-degree, and five exposure
  examples against source records;
- confirm `git diff --check` passes for new audit artifacts;
- prove with `git diff --name-only <PHASE_1_COMMIT_SHA>` and `git status --short`
  that Phase 2 did not modify movie data, rules, generated grids, gameplay, or
  the Phase 1 commit;
- list any analysis-only script separately;
- leave the report/data artifacts uncommitted unless Buri explicitly approves
  a second commit.

Do not rerun the full gameplay gate merely because documentation/JSON was added.
If Phase 2 changes executable repository code, run the smallest relevant checks
plus `npm run build`, explain why code was necessary, and keep it out of the
already-created Phase 1 commit.

## Required checkpoints and stop conditions

Stop immediately and ask for direction if:

- the Phase 1 diff contains a rule, scoring, deal, pool, share, analytics, or
  storage-version change;
- any required Phase 1 gate is genuinely red;
- the staged Phase 1 file list is not exactly the seven intended paths;
- committing would capture unrelated user work;
- current counts differ materially and the cause cannot be established safely;
- a requested metric would require guessing protected/demographic facts;
- completing the audit would require TMDB, external credentials, source-data
  edits, a grid re-bake, or a pool cutover.

Do not stop merely because the Connections verifier or audit takes time. Send
concise progress updates during long work.

## Final handoff

Lead with the outcome and include:

1. Phase 1 commit SHA, subject, exact paths, and gate results.
2. Confirmation that nothing was pushed, merged, deployed, or indexed.
3. Links to the Markdown and JSON audit artifacts.
4. The four straight pool counts and the report's most important health finding.
5. The recommended expansion posture and confidence.
6. Every remaining modified/untracked file, distinguishing pre-existing files
   from artifacts created by this goal.
7. The single next decision Buri needs to make.

The goal is complete only when the scoped UI checkpoint exists as a verified
local commit and the reproducible movie-pool health report and JSON both exist
without any movie-data or release mutation.
````
