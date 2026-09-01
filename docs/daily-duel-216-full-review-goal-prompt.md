# Match Cut 216+16 full product review — Goal prompt

Copy everything inside the block into a fresh Codex session.

````text
/goal Perform a comprehensive, evidence-backed, review-only audit of the current
Match Cut local release candidate. Confirm that the approved 216-film Daily
Puzzle/Duel cutover and 16-wild Duel still work, then review the whole product
for gameplay continuity, mode confusion, UI niggles visible in fresh
screenshots, contextual help/support gaps, analytics gaps, accessibility risk,
and engineering regressions. Produce prioritized review artifacts and stop for
Buri's decisions. Do not implement fixes.

Repository:
`/Users/mwamburi/Projects/Daily Movie Game`

## Outcome

Answer five questions decisively:

1. Does the current local candidate still pass its complete technical,
   deterministic-data, simulation, browser, and security contracts?
2. Does each of the four modes make sense to a first-time player and remain
   satisfying to a returning player when played directly—not merely completed
   through a test seam?
3. Do the modes feel like one coherent product while explaining their
   intentional rule differences clearly, especially Daily Puzzle versus Duel?
4. What visible UI niggles, continuity errors, misleading copy, help/support
   gaps, accessibility risks, or telemetry blind spots remain?
5. What should be improved first, and which proposed changes would cross a
   rule, scoring, content, persistence, analytics, or publication boundary?

Continue until the full audit and evidence set are complete or a genuine
external/human blocker prevents a required observation. A slow verifier, a
failed screenshot attempt, or one unavailable attended surface is not by itself
a reason to stop; complete every independent lane and record limitations.

## Review-only authority

This goal authorizes:

- read-only repository, Git, build-output, and local product inspection;
- existing builds, verification suites, simulation/evaluation commands, and
  browser tests;
- local preview/development servers and browser automation;
- fresh screenshots and diagnostics under
  `audit/daily-duel-216-full-review-2026-08-26/`;
- one new report: `docs/daily-duel-216-full-review-report.md`.

It does **not** authorize:

- edits to application code, rules, movie data, tests, existing documentation,
  generated source data, CI, configuration, or package manifests;
- dependency installation or upgrade;
- staging, committing, amending, pushing, opening/updating a PR, merging,
  deploying, changing Vercel/GitHub settings, or mutating an external service;
- removing `noindex`, changing share output, adding tracking, calling TMDB,
  rebaking Connections/Chronology sources, or changing Daily seeds;
- treating a recommendation as approval to implement it.

The report, screenshots, screenshot manifest, and optional read-only JSON
diagnostics are the only intended workspace writes. Preserve all existing dirty
and untracked work. Never run `git add .`, `git clean`, reset, checkout, stash,
or another command that could hide or discard it.

## Read first

Read these in order before drawing conclusions:

1. `AGENTS.md`.
2. `docs/daily-duel-216-release-checkpoint.md` — candidate receipt.
3. `docs/daily-duel-216-selection.md` and
   `docs/daily-duel-216-cutover-checkpoint.md` — owner decisions and evidence.
4. `docs/master-plan.md` — the only live build plan.
5. `RULEBOOK.md` — living player-facing rules.
6. `sim/RULESET.md` — canonical Duel sim↔React contract.
7. `docs/ui-contracts.md`, `docs/goal-3-mode-specific-qa.md`,
   `docs/delivery-foundations-report.md`, and
   `docs/production-release-checklist.md`.
8. `docs/feedback-log.md` and current feedback/QA reports for all four modes.
9. `design_handoff_the_stub/README.md` and its six frozen reference screens.
10. The current application, components, data, rule helpers, analytics,
    persistence, sharing, tests, and verifier files listed below.

Treat `PLAN.md`, `orchestration-plan.md`, and `ui-tasks.md` as bannered history.
Treat older screenshots and release reports as historical comparison evidence,
not proof of the current candidate.

## Authoring-time candidate state — verify; do not assume

At prompt creation on 2026-08-26:

- Branch: `codex/daily-mode-polish`.
- HEAD: `ce398376d0c03be5356d64000557817c2f0150c3`.
- The 216+16 candidate is deliberately **uncommitted, unpushed, undeployed,
  and unindexed**.
- The worktree is dirty by design and contains reviewed UI work, content
  authoring, the runtime cutover, generated Connections data, simulations,
  reports, and prompts.
- Do not infer that production contains this local candidate. Label local and
  production observations separately.

Approved content/runtime contract:

- ordered 216-real-film pool SHA-256:
  `d9b988232fabddadd2616d4fcc6c1ad604bce1207106b9ac6539784b50a38fdb`;
- Daily through `2026-09-26`: legacy 89-card pool;
- Daily from `2026-09-27`: approved 216-card pool;
- Duel: 216 real films plus 16 blank-credit wilds;
- wilds: 12 Angry Men, Casablanca, Citizen Kane, The Wizard of Oz,
  2001: A Space Odyssey, Psycho, Seven Samurai, Singin' in the Rain,
  Dr. Strangelove, Vertigo, Tokyo Story, Bicycle Thieves, In the Mood for Love,
  Spirited Away, Metropolis, and Pather Panchali;
- multi-wild draw: keep every wild and burn only non-wilds; the player taps any
  wild to continue the normal hold/toss/play flow;
- credited `MOVIES`: 320;
- dated Chronology catalog: 482;
- Connections: 365 baked grids from the 320-film credited catalog;
- Connections semantic digest:
  `0f333d3236fea7c2033f3b49577acfa9c9b9e9c199d3802b5e0d48e2e8c6cab6`;
- Chronology JSON SHA-256:
  `578aae49cd6f136eaa0d288fb4d213273fe5bcd579427e1e41135a51173c951e`.

Expected last-green matrix:

- build pass; menu shell 97.81 KiB gzip JS and within budget;
- security pass across 224 repository / 26 production files;
- Duel 64/64; Solo 8/8; Chronology 42/42; Connections 14/14;
- browser smoke 27/27;
- name receipt: 2,797 credits, 1,421 spellings, zero suspicious clusters;
- 8,000-game live-flow tune: 65.9 / 50.3 / 41.4 percent against Matinee /
  Feature / Director's Cut, with zero stalemates;
- `git diff --check` pass.

If a count, hash, branch, dirty path, expected total, or behavior differs, do
not silently harmonize it. Record actual value, likely cause, affected contract,
and whether the discrepancy is regression, intentional later work, or owner
decision.

## Canonical code and evidence to inspect

### Product shell and shared surfaces

- `src/App.tsx`, `src/index.css`, `src/components/Onboarding.tsx`;
- `src/components/HowToPlay.tsx`, `DailyModeHeader.tsx`;
- `src/components/StubCard.tsx`, `Hand.tsx`, `ChronoCard.tsx`;
- `src/components/Results.tsx`, `ResultActions.tsx`, `ResultMeaning.tsx`,
  `ShareCopy.tsx`, `Icon.tsx`, and `useDialogA11y.ts`.

### Four modes

- `src/SoloGame.tsx`, `ChronologyGame.tsx`, `ConnectionsGame.tsx`;
- `src/DuelGame.tsx` — highest blast radius; inspect surgically and do not
  recommend a casual wholesale reducer rewrite.

### Rules, data, continuity, and behavior

- `src/data/movies.ts`, `duelPool.ts`, `chronology-pool.json`,
  `connections-grids.json`, and `puzzle.ts`;
- `src/lib/daily.ts`, `duel.ts`, `difficulty.ts`, `solver.ts`,
  `chronology.ts`, and `connections.ts`;
- `src/lib/progress.ts`, `analytics.ts`, `share.ts`, and `motion.ts`;
- `src/devAssertions.ts`.

### Test, build, delivery, and operations

- `package.json`, lockfile, Vite/TypeScript/Tailwind configuration;
- `tests/browser/delivery-smoke.spec.ts`, `playwright.config.ts`;
- `sim/verify.ts`, `solo-verify.ts`, `chronology-verify.ts`,
  `connections-verify.ts`, `duel-sim.ts`, and cutover/tune evaluators;
- `scripts/check-bundle.mjs`, `check-security.mjs`, and data audit scripts;
- `.github/workflows/ci.yml`, `vercel.json`, and release/monitoring docs.

### Historical visual references

Visually inspect relevant images under:

- `audit/production-polish-2026-08-08/`;
- `audit/production-polish-phase1-2026-08-08/`;
- `audit/production-polish-phase2-2026-08-08/`;
- `audit/production-polish-phase3-2026-08-08/`;
- `audit/design-qa-chronology-reel-2026-08-07/`;
- `audit/design-qa-connections-2026-08-07/`;
- `design_handoff_the_stub/design_handoff_screenshots/`.

Do not call an old image current evidence. Use it to identify regression,
unresolved clipping, lost hierarchy, or intentional change, then capture the
same current state where practical.

## Audit method

### 1. Re-baseline without altering the candidate

Record branch, HEAD, upstream relation if available, five recent commits, Node
version, and every modified/untracked path grouped into UI, runtime data/rules,
generated data, tests, reports/prompts, and unrelated work. Confirm whether a
normal production build contains an E2E marker and whether any inspected live
deployment differs from local.

Do not run `npm ci` or another install. If a local port is sandbox-blocked, use
the normal narrowly scoped approval route for the existing preview/test command
rather than weakening or skipping it.

### 2. Re-run the complete local contract

Run from the repository root:

```sh
npm run build
npm run check:bundle
npm run check:security
npm run verify
npm run verify:solo
npm run verify:chronology
npm run verify:connections
npm run test:smoke
npm run eval -- tune 8000 --seed=200824 --assert
npm run eval -- report 4000 --seed=200824 --assert
git diff --check
```

Recompute, read-only, the ordered 216-ID hash, pool counts around
`2026-09-26`/`2026-09-27`, Chronology hash, and Connections semantic digest/pin.
Do not run source-writing rebake commands.

The Connections verifier is exhaustive and can take well over an hour. Let it
finish while continuing screenshot, code, help, and tracking work. Distinguish
the old one-pile/no-race `report` scaffold from shipped live-flow `tune`
evidence; do not call scaffold stalemates a live regression.

Record exact output, duration, and evidence tier for every command:

- source inspection;
- automated local check;
- browser-observed local behavior;
- old saved screenshot;
- fresh saved screenshot;
- production observation;
- attended/human evidence still required.

### 3. Capture a fresh screenshot matrix

Save screenshots under:
`audit/daily-duel-216-full-review-2026-08-26/`.

Create `manifest.md` with:

`filename | mode | state | viewport | seed/difficulty | input path | inspected details | verdict`

Minimum viewports:

- 320×568 stress phone;
- 360×800 compact phone;
- 390×844 primary phone;
- 768×1024 portrait tablet;
- 1024×768 landscape tablet/small desktop;
- 1440×900 desktop.

Capture at least:

- Menu: fresh onboarding, normal menu, completed 3/3 Passport, overview help.
- Daily: legacy-date start, `2026-09-27` cutover start containing the new
  Mission: Impossible card, raised card, credits, successful play, invalid
  feedback, stuck/solved results, and help.
- Duel: all difficulty starts, playable/non-playable raised cards, Draw 3,
  deterministic three-wild reveal, post-multi-wild hand, Meld, Take,
  run/encore, Final Cut/Recast when reachable, results, and help.
- Chronology: start, raised title, gap, correct/misfire feedback, compact late
  line, result, and help.
- Connections: idle, selection order, one-away, solved group, loss, revealed
  groups, result, practice, and help.

Use deterministic E2E seams only for rare states such as three wilds or terminal
dialogs. Do not count seam completion as direct-play evidence. For every mode,
perform a direct successful action through a normal player control and one
played journey to a real terminal state where practical.

Open and visually inspect every saved screenshot. At every state inspect:

- clipping, viewport escape, overlap, z-index, and motion endpoints;
- cards, borders, dividers, tickets, banners, piles, and hand alignment;
- safe areas, scroll reachability, fixed controls, and keyboard overlap;
- text wrap/truncation, labels, contrast, and essential text size;
- touch targets, focus, modal containment, and color-independent state;
- CTA order, disabled clarity, results, replay, and back/menu paths;
- whether mobile/desktop are composed intentionally, not merely scaled.

Classify observations as confirmed defect, usability risk, subjective polish,
historical-reference difference, or clean pass.

### 4. Play each mode as a new and returning player

Map for every mode:

`menu promise → help/onboarding → first action → feedback → recovery → mastery/tension → result meaning → replay/share/menu → reason to return`

At each transition record the likely player question, on-screen answer,
misunderstanding risk, error recovery, next-action clarity, and current metric.

Exercise click, Enter, Space, touch emulation, and drag where supported. Check
keyboard-only, reduced motion, 200% zoom/text enlargement, focus return, Escape,
screen-reader semantics, and color-independent state. Do not claim real iPhone,
Android, VoiceOver, or TalkBack evidence unless actually attended.

### 5. Four-mode continuity and confusion audit

Create one comparison table:

`concept | Daily | Duel | Chronology | Connections | intentional difference? | explanation | confusion risk | recommendation`

Compare at minimum:

- legal move and link/category definitions;
- visible credits, Deep Cuts, series, and genre;
- whether flipping costs;
- pile/target count;
- draw, burn, wild, Meld, Take, run, encore, Final Cut, Recast;
- golf/par versus race/net score versus mistakes/streaks;
- finish condition and result meaning;
- Daily/practice, difficulty, seed replay, Passport, result, and share;
- navigation, help, keyboard, and accessibility conventions.

Give Daily versus Duel a dedicated paired audit because they share 216 real-film
content but intentionally differ:

- Daily has one pile; Duel has two marquees.
- Daily charges first credit flips; Duel peeking is free.
- Daily uses person links; Duel also scores series and has wilds/melds.
- Daily is solver-generated golf; Duel is a CPU net-score contest that rings at
  20 but still compares net scores.
- Daily is date-versioned 89→216; Duel uses 216 after release.

Cross-check each term/rule across `RULEBOOK.md`, `sim/RULESET.md`,
`HowToPlay.tsx`, menu/onboarding, runtime UI, code, and tests. A contradiction is
a continuity finding even when code is correct.

### 6. Audit 216+16 in product context

Confirm:

- pre-boundary Daily seeds still use 89;
- the first cutover seed uses 216 and renders its pinned board cleanly;
- 365 cutover-era boards are unique, solver-valid, and expose all 216;
- Duel conserves 216 unique reals and 16 unique wilds;
- human, CPU, and sim keep every wild in multi-wild Draw 3;
- wilds never enter the real pool or create person/genre adjacency;
- approved series tags behave consistently;
- graduated records do not duplicate Chronology cards;
- Connections' 320-film bake remains unambiguous and current;
- punctuation, titles, dates, credits, Deep Cut badges, and series behavior are
  consistent across modes and surfaces;
- the larger pool did not degrade cards, loading, help, or results.

Do not reopen approved TMDB recognizability rulings without a new local
contradiction. Do not call TMDB.

### 7. Help and “help desk” readiness

Review overview and mode-specific help against actual behavior. Check first
action, scoring/result explanation, every visible term/action, Daily/practice,
replay/streak/Passport, invalid/stuck/no-play/clipboard recovery, scroll/focus/
Escape/close behavior, compact reachability, attribution, privacy/analytics,
and support/contact path.

Create a support-burden table:

`likely question | mode/state | current answer/location | correct? | discoverability | gap | recommended copy/location | approval?`

Cover at least these launch-week questions:

- Why did these movies connect or fail?
- What is a Deep Cut?
- Why did a flip cost here but not in Duel?
- Does 20 automatically win Duel?
- What happened to the other Draw 3 cards?
- Why were several wilds kept, and what can a wild block?
- Run versus encore versus Meld versus Take versus Recast versus Final Cut?
- Why can an old Daily differ from the current pool?
- Is lower or higher better, and what is par/net score?
- What does one-away mean?
- How do tight-call mercy and Chronology streak credit work?
- Daily versus practice, and what counts toward Passport?
- What gets shared and what happens if clipboard copy fails?
- How can a player report bad movie data, accessibility trouble, or a broken
  game?

Recommend the smallest useful help/support improvements; do not default to a
large support platform before concise in-product help or an FAQ proves
insufficient.

### 8. Tracking and learning coverage

Inspect `src/lib/analytics.ts` and all call sites. Current intended events are
`mode_start`, `mode_finish`, and `share` only after successful clipboard copy.

Verify locally by stubbing/observing the analytics queue—never sending external
events:

- firing points/properties and Daily/practice/difficulty identity;
- one event per action, no effect/re-render duplicates;
- every terminal state, failed clipboard, replay/deal-again gaps;
- failure isolation and absence of PII or unstable free text.

Map current events to the player journey and identify the smallest gaps needed
to understand starts, first actions, abandonment, completion, second-mode play,
replay, D1/D7 return, help recovery, invalid/stuck friction, and shares.

For proposed telemetry include:

`event | exact trigger | properties/values | question | dedupe | privacy | launch critical?`

Separate product telemetry from operational monitoring such as console errors,
Web Vitals, uptime, CSP, deployment receipts, rollback, and spend alerts. Do not
recommend fingerprinting or taste profiling without explicit value/consent.

### 9. Shared product quality and software risk

Inspect component/state boundaries, shared behavior, React↔sim parity,
deterministic dates/timezones, localStorage resilience/meta-only enforcement,
clipboard fallbacks, accessibility/focus, lazy loading and bundle ceilings,
large baked data, E2E seam containment, test brittleness/gaps, verifier/CI
runtime, CSP/unsafe rendering/query parsing/storage trust, dependency posture,
documentation drift, monitoring, privacy, rollback, and attended launch gates.

Do not recommend a wholesale rewrite because `DuelGame.tsx` is large. Any
containment proposal needs characterization tests, small boundaries, rollback,
and full parity gates.

## Finding discipline

Every finding needs:

- stable ID and P0/P1/P2/P3 severity;
- type: defect, continuity contradiction, usability risk, UI niggle,
  accessibility risk, support gap, telemetry gap, architecture/operations risk,
  preference, or product hypothesis;
- mode/state/viewport and direct evidence;
- player impact and reproducibility;
- smallest recommended behavior and affected files/systems;
- effort/confidence;
- approval boundary: rules, scoring, deals, content, difficulty, persistence,
  share, analytics, or publication;
- proof required for a future fix.

Group responsive variants under one root finding, but never collapse a
scoring/parity issue into “polish.”

## Required artifacts

### Screenshot evidence

Create:
`audit/daily-duel-216-full-review-2026-08-26/manifest.md`

Keep screenshots/diagnostics beside it with sortable mode/viewport/state names.

### Durable review report

Create:
`docs/daily-duel-216-full-review-report.md`

Structure:

1. Executive verdict and proceed/targeted-fix/hold recommendation.
2. Scope, repository state, evidence tiers, and limitations.
3. Release-contract matrix: commands, counts, hashes, and date boundary.
4. Prioritized findings table.
5. Fresh screenshot matrix with linked images.
6. Daily↔Duel paired audit.
7. Four-mode continuity/confusion table.
8. Mode-by-mode direct-play review.
9. Shared UI/design and accessibility review.
10. 216+16 content/data and tuning review.
11. Help/support audit and top-question table.
12. Tracking/learning audit and minimal event dictionary.
13. Software/security/performance/operations review.
14. One Now/Next/Later sequence with dependencies/gates.
15. Ranked top ten; identify the first three improvements.
16. Questions for Buri—only decisions the repository cannot answer.
17. Appendix: exact outputs/durations, screenshot index, and attended/external
    blockers.

## Completion gate and stop point

Complete only when:

- repository and authority boundaries are re-baselined;
- every required command has a result or precise environmental blocker;
- hashes/counts/date boundary are independently rechecked;
- every mode has direct-play evidence;
- fresh screenshots cover required states/viewports and every image is opened;
- Daily↔Duel and four-mode continuity audits are complete;
- rules/help/UI/source/test contradictions are identified;
- support burden and analytics coverage are evaluated;
- findings are de-duplicated, prioritized, actionable, and approval-labelled;
- evidence tiers stay distinct;
- screenshot manifest and report exist;
- `git diff --check` is clean for new artifacts;
- final status confirms no application/source fix, stage, commit, push, PR,
  merge, deploy, indexing change, TMDB call, or external mutation occurred.

Stop at this Review checkpoint. Present Buri with the executive verdict, top
findings, first three recommended improvements, links to report/manifest, and
explicit decisions required before any fix pass.
````
