# Match Cut 216+16 immediate fix pass — Goal prompt

Copy everything inside the block into a fresh Codex session.

````text
/goal Implement and verify the complete Match Cut 216+16 "Now" fix pass from
section 14 of `docs/daily-duel-216-full-review-report.md`. Make the browser
release gate deterministic, remove the confirmed 320 px Chronology header
collision, and align all current player-facing Duel/Daily copy to Buri's settled
decisions. Re-run the complete release matrix on Node 24.x, capture fresh
evidence, write a checkpoint, and stop for review. Do not begin support,
analytics, broader launch-readiness, or publication work in this pass.

Repository:
`/Users/mwamburi/Projects/Daily Movie Game`

## Outcome

Deliver a locally working, reviewable candidate in which:

1. the required Playwright smoke suite is deterministic without weakening its
   coverage of reduced motion, Take-helper behavior, or ordinary/wild Draw 3;
2. Chronology's mode/score header remains legible and non-overlapping at
   320x568 while retaining all essential controls and score meaning;
3. **CPU** is the one canonical opponent identity on every current
   player-facing and accessibility surface;
4. the primary Duel promise says exactly:
   **"Reaching 20 ends the show; highest net score wins."**;
5. Daily is described as people-only, while Duel's series behavior is described
   precisely without changing its legal-play helper; and
6. the complete local release matrix is green on the declared Node 24.x
   runtime, with fresh before/after evidence and no publication mutation.

Continue until all independent work is complete or a genuine rule boundary,
environment blocker, or unrelated-work collision prevents safe progress. Do
not stop merely because one test is slow. If a proposed copy correction would
require changing legality, scoring, deals, data, difficulty, or tuning, stop
that item and report the exact boundary instead of silently changing the game.

## Buri decisions locked by this prompt

These are settled. Do not ask again or substitute a different interpretation.

### Opponent identity

- **CPU everywhere** is the public product decision.
- Remove `Taz` from current player-facing text, visual labels, accessible names,
  onboarding, Help, results/share text if present, and current living docs/tests.
- Internal implementation symbols such as `TazCorner.tsx`, historical audit
  artifacts, and frozen design references do not need gratuitous renames. Rename
  an internal symbol only if leaving it creates a current product leak or a
  concrete maintenance error. No player-visible or assistive-technology surface
  may still call the opponent Taz.

### Duel finish and winner wording

- Reaching 20 ends the show; it does **not** automatically win the Duel.
- The player with the highest **net score** wins after held-card deductions.
- Use this exact primary sentence wherever the Duel promise is taught:
  **"Reaching 20 ends the show; highest net score wins."**
- Short labels may be composed to fit, but they must not say or imply
  "first to 20 wins," "race to 20" as the win condition, or merely "high score"
  without explaining that 20 is the end trigger.

### Daily versus Duel links

- Daily ordinary play is people-only: a shared actor, director, or writer.
- Duel ordinary legal play is also person-gated against either marquee.
- In Duel, series can upgrade the score of an otherwise legal link and can
  support a meld. Do not describe a series-only pair as an ordinary legal play.
- The current 216-film pool happens to have zero same-series pairs without a
  shared person. That data fact masks the documentation ambiguity; it does not
  authorize broader wording.
- This pass is copy/documentation/test work only. It does **not** authorize
  series-only legality, rule/scoring changes, or difficulty re-tuning.

## Authority

This prompt authorizes narrowly scoped edits required for the four Now items,
including current UI copy/components/styles, living rule/help documentation,
browser tests and existing E2E-only fixtures, and the two new evidence artifacts
listed below. Likely affected files include, but are not limited to:

- `src/App.tsx`;
- `src/components/Onboarding.tsx`;
- `src/components/HowToPlay.tsx`;
- `src/components/DailyModeHeader.tsx`;
- `src/ChronologyGame.tsx` and `src/index.css` only where the compact header
  actually requires them;
- `RULEBOOK.md`;
- `tests/browser/delivery-smoke.spec.ts`;
- the smallest existing E2E-only fixture/seam needed for deterministic states;
- `docs/master-plan.md` only for a factual Ledger/checkpoint update after the
  work is proven.

It also authorizes:

- existing builds, verifiers, simulations, and browser automation;
- switching to an already installed Node 24.x runtime through the repository's
  normal version manager;
- fresh screenshots and diagnostics under
  `audit/daily-duel-216-now-fix-pass-2026-08-27/`;
- one new checkpoint:
  `docs/daily-duel-216-now-fix-pass-checkpoint.md`.

It does **not** authorize:

- gameplay-rule, scoring, legal-move, deal, seed, movie-data, wild-pool,
  Connections/Chronology source, difficulty, or tuning changes;
- production persistence behavior, share payload/copy, support-route,
  privacy-copy, or analytics changes;
- dependency installation or upgrade;
- source-data rebakes, TMDB calls, or reopening approved movie rulings;
- staging, committing, amending, pushing, PR work, merging, deploying,
  changing Vercel/GitHub settings, or removing `noindex`;
- broad refactors, especially a reducer rewrite of `src/DuelGame.tsx`.

Preserve all pre-existing dirty and untracked work. Never use `git add .`,
`git clean`, reset, checkout, or stash. Touch only the lines required for this
pass and match the repository's current voice and dependency boundaries.

## Read first

Read these before editing:

1. `AGENTS.md`.
2. `docs/daily-duel-216-full-review-report.md`, especially findings F01-F04,
   sections 14-17, and the flaky-test appendix.
3. `audit/daily-duel-216-full-review-2026-08-26/manifest.md` and screenshots
   42, 49, and 50.
4. `docs/daily-duel-216-release-checkpoint.md`.
5. `docs/daily-duel-216-selection.md` and
   `docs/daily-duel-216-cutover-checkpoint.md`.
6. `docs/master-plan.md`, the only live build plan.
7. `RULEBOOK.md`, `sim/RULESET.md`, and `docs/ui-contracts.md`.
8. `src/App.tsx`, `src/components/Onboarding.tsx`,
   `src/components/HowToPlay.tsx`, `src/components/DailyModeHeader.tsx`,
   `src/ChronologyGame.tsx`, and the relevant CSS.
9. `tests/browser/delivery-smoke.spec.ts`, `playwright.config.ts`, and the
   E2E-only seams in the mode source.

Treat old screenshots as comparison evidence, not proof of the new candidate.
Treat `PLAN.md`, `orchestration-plan.md`, and `ui-tasks.md` as history.

## Authoring-time state — verify; do not assume

At prompt creation on 2026-08-27:

- branch: `codex/daily-mode-polish`;
- HEAD: `ce398376d0c03be5356d64000557817c2f0150c3`;
- upstream: one commit ahead of `origin/codex/daily-mode-polish`;
- the approved 216-real-film plus 16-wild candidate is deliberately dirty,
  uncommitted, unpushed, undeployed, and unindexed;
- the review found 20 modified and 27 untracked paths before its own artifacts;
- local review runtime was Node `v22.23.2`, while `package.json` and CI declare
  Node `24.x`;
- last complete review matrix: build/bundle/security and all four verifiers
  green; required smoke 26/27; targeted smoke repetitions 4/10;
- the smoke false negatives were five valid Take-helper states that suppress
  the generic idle cue and one valid wild Draw 3 dialog where the test expected
  the ordinary dialog;
- the confirmed visual defect is screenshot 42: Chronology's late-line header
  overlaps `STROKES` at 320x568;
- security currently reports 225 repository / 25 production files; receipt
  reconciliation belongs to the second launch-readiness pass, not this one.

Record actual state before editing. If branch, HEAD, upstream, dirty paths,
Node version, or evidence has changed, preserve the discrepancy and explain it.
Do not overwrite a user's later edits to make the authoring-time state true.

## Work sequence — checkpoint after each goal

### Goal 0 — safe baseline

1. Record branch, HEAD, upstream relation, Node/npm versions, five recent
   commits, and the exact modified/untracked path list.
2. Compare the dirty baseline with the full-review report. Identify any later
   edits and do not absorb unrelated changes into this pass.
3. Switch to an already installed Node 24.x runtime. Do not install one. If no
   compliant runtime exists, continue safe source work but label every runtime
   result provisional and stop before claiming completion.
4. Create the audit directory and a manifest with:

   `file | goal | state | viewport | input/fixture | evidence tier | verdict`

Checkpoint: safe diff scope and runtime status are explicit.

### Goal 1 — make the browser release gate deterministic

Fix F01 without accepting multiple unrelated outcomes or merely deleting an
assertion.

Required behavior coverage:

1. A deliberately selected no-helper Duel state proves the generic idle cue is
   visible and static under `prefers-reduced-motion: reduce`.
2. A deliberately selected Take-available state proves the contextual Take
   helper replaces/suppresses the generic idle cue by design and gameplay
   remains available.
3. A deterministic ordinary Draw 3 proves three distinct choices and the
   `Drew three — keep one` path.
4. A deterministic one-wild Draw 3 proves the special wild conservation copy
   and resulting hand/deck behavior.
5. The existing deterministic multi-wild test continues to prove every wild is
   kept, only non-wilds burn, and the three-wild fixture leaves the expected
   ten-card player hand.
6. Pressing Enter on Draw remains playable under reduced motion, and the tested
   control has no transform animation.

Prefer the smallest existing deterministic seed/fixture mechanism. If a new
seam is unavoidable, it must be gated by `VITE_E2E`, absent from a normal
production build, state-specific, and incapable of changing normal rules or
deals. Do not mock away the rule helper being characterized.

Run the affected Playwright test(s) once and then with `--repeat-each=10`.
Open every failure screenshot/trace. Do not proceed from this checkpoint until
the targeted run is 10/10 or a precise non-product environmental blocker is
documented.

Checkpoint: record the prior six failure modes, chosen deterministic
construction, exact test command/output, production-seam containment check,
and why assertions were not weakened.

### Goal 2 — repair the compact Chronology header

Use the shared `DailyModeHeader` system and the smallest responsive layout
change that removes the 320 px collision. Preserve:

- the mode name, Daily/practice identity, and `STROKES` meaning;
- Back and Help controls, their touch targets, accessible names, and focus;
- safe-area spacing and scroll reachability;
- existing 360/390/tablet/desktop composition;
- all game rules, score calculations, dates, and card behavior.

Test at 320x568, 360x800, 390x844, 768x1024, 1024x768, and 1440x900. Include
start and compact late-line states at 320. Also inspect a browser-emulated 200
percent zoom/text enlargement view as automated evidence; do not call it an
attended low-vision acceptance receipt.

Save and open fresh before/after screenshots. Essential text may wrap or
recompose, but it may not be hidden solely to make the screenshot pass.

Checkpoint: exact changed selectors/components, screenshot links, keyboard and
Help results, and regression verdict for larger viewports.

### Goal 3 — align current product language

Search current source, living docs, tests, and accessible labels for `Taz`,
`Race to 20`, `high score`, and Daily/series definitions. Make the smallest
coherent copy pass.

Required acceptance:

- App/menu and onboarding teach:
  `Reaching 20 ends the show; highest net score wins.`
- Help and results remain consistent with that sentence and actual net-score
  arithmetic.
- Current player-facing opponent labels and accessible names say `CPU`.
- Daily says a legal link shares an actor, director, or writer; it does not
  present same-series as an ordinary legal move.
- Duel says ordinary plays share a person with either marquee; series upgrades
  a legal linked play and can support a meld.
- `RULEBOOK.md`, current Help, onboarding, runtime, and browser assertions agree.
- Add or retain a focused characterization check showing a synthetic
  series-only pair is not an ordinary legal play if the existing test structure
  can express that without adding a framework.

Do not rewrite historical audit receipts or frozen design handoff material.
Do not rename internal components merely for cosmetic source consistency.

Capture fresh menu/onboarding/Help/result screenshots at 390x844 plus a 320x568
menu/onboarding stress view. Open every screenshot and inspect wrapping,
clipping, accessible labeling, and contradiction risk.

Checkpoint: list every current changed string and every intentionally retained
internal/historical `Taz` reference with the reason it cannot reach players.

### Goal 4 — complete Node 24 verification

Run from the repository root on Node 24.x:

```sh
node --version
npm --version
npm run build
npm run check:bundle
npm run check:security
npm run verify
npm run verify:solo
npm run verify:chronology
npm run verify:connections
npm run test:smoke
npm run test:smoke
npm run eval -- tune 8000 --seed=200824 --assert
git diff --check
```

The Connections verifier can be long-running. Let it finish; do not substitute
the old one-pile `report` scaffold for the shipped live-flow `tune` result.

Required results unless the candidate contract itself has legitimately changed:

- Duel 64/64;
- Solo 8/8;
- Chronology 42/42;
- Connections 14/14;
- both complete browser smoke runs green;
- targeted formerly flaky test(s) 10/10;
- live-flow tune within assertions, with zero shipped-flow stalemates;
- build, bundle, security, and `git diff --check` green;
- normal `dist` contains no E2E marker.

Record exact commands, outputs, counts, durations, Node version, and evidence
tier. A green test on Node 22 does not satisfy this gate.

## Evidence and artifacts

Create:

- `audit/daily-duel-216-now-fix-pass-2026-08-27/manifest.md` with screenshots,
  traces, and compact command receipts;
- `docs/daily-duel-216-now-fix-pass-checkpoint.md`.

The checkpoint must contain:

1. executive verdict: proceed to launch-readiness pass, targeted fix still
   required, or hold;
2. verified before/after repository state and exact files changed by this pass;
3. F01-F04 resolution table with evidence links;
4. locked CPU, 20/net, Daily, and Duel wording;
5. screenshot matrix and inspected verdicts;
6. exact Node 24 command matrix, counts, durations, and failures/retries;
7. rule/data/difficulty/persistence/share/analytics/publication boundary audit;
8. unresolved items that belong to the second prompt;
9. proposed exact-path staging list, but do not stage it;
10. explicit confirmation that no dependency install, TMDB/rebake, stage,
    commit, push, PR, merge, deploy, indexing change, analytics send, or
    external mutation occurred.

## Completion gate and stop point

Complete only when:

- all four Now items from review section 14 are implemented or precisely
  blocked;
- F01 is deterministic at 10/10 and the full smoke suite passes twice;
- F02 has fresh inspected 320/360/390 evidence with no hidden essential text;
- F03 and the copy-only portion of F04 match the locked decisions on current
  visual and accessibility surfaces;
- `RULEBOOK.md` and current product Help do not contradict runtime helpers;
- the full declared Node 24 matrix is green;
- all edits are surgical and unrelated dirty work is preserved;
- the audit manifest and checkpoint exist and `git diff --check` is clean.

Stop at the **Now Fix Review** checkpoint. Present Buri with the verdict,
changed-file list, fresh screenshot links, exact gate matrix, unresolved risks,
and the unstaged exact-path list. Do not begin the second prompt automatically.
Do not stage, commit, push, deploy, or remove `noindex`.
````
