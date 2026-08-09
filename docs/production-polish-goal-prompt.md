# Match Cut production-polish execution — fresh-session goal prompt

Copy everything inside the block into a fresh Codex `/goal` task.

```text
/goal Complete Match Cut's production-polish and launch-readiness milestone from
the current Wave 3 production baseline. Fix the release pipeline, make How to
Play mode-specific, solve Chronology choice readability, build real desktop
compositions, finish the shared typography/icon/motion system, polish every
mode and terminal state, and leave a fully verified local release candidate.

Repository:
`/Users/mwamburi/Projects/Daily Movie Game`

Production:
`https://matchcutdaily.com`

## Objective

Turn the current healthy quiet-beta build into a coherent production-quality
release candidate without changing any game rule, score, deal, difficulty,
content pool, persistence contract, or share semantics.

The work has five linked outcomes:

1. The automated release gate finishes reliably and truthfully.
2. Every How to Play entry is scoped to the surface that opened it.
3. Chronology's ten choices are readable instead of overlapping title slivers.
4. Desktop is a deliberate product composition, not a phone-width game floating
   inside a 1440px viewport.
5. Every affected mode, modal, and result state passes responsive, interaction,
   accessibility-risk, bundle, rule-parity, and browser verification.

Continue until the milestone is locally complete or a named visual, real-device,
external-service, rule, or publication decision requires Buri. Stop at each
required visual checkpoint. Never commit, push, merge, deploy, remove `noindex`,
add the production URL to shares, or change an external service without Buri's
explicit approval.

## No Figma dependency

Buri does not have a Figma account. Do not make Figma, a Figma board, a hosted
design tool, ImageGen, or a new visual mockup service a prerequisite.

Use the current production UI, the accepted screenshots, the Stub handoff,
browser screenshots, and code-native responsive prototypes as visual truth.
For each visual checkpoint, show real rendered app screenshots at matching
viewports. Do not substitute prose wireframes for the working UI.

## Current repository and production baseline — verify first

Read `AGENTS.md`, then inspect rather than assume.

At prompt authoring time:

- Branch: `codex/daily-mode-polish`.
- HEAD and origin branch: `a710fff` — `Add Wave 3 movie pool expansion`.
- Production is serving that Wave 3 release at `matchcutdaily.com`.
- Production content: 304 fully credited movies, 482 dated movies, unchanged
  89-film `DUEL_POOL_IDS` used by Solo and Duel.
- Connections daily grids were re-baked and pinned for pool 304.
- Production returned HTTP 200 and the current audit captured zero browser
  warnings or errors.
- Existing untracked files include:
  - `docs/pool-expansion-goal-prompt.md` — unrelated; preserve untouched.
  - `docs/production-polish-audit-2026-08-08.md` — this milestone's source
    audit; treat it as intended work, not disposable clutter.
- Current-run audit screenshots are in
  `audit/production-polish-2026-08-08/` and may be ignored by Git/Vercel while
  remaining valid local evidence.
- This prompt will be at `docs/production-polish-goal-prompt.md` if created in
  the same worktree.

The current GitHub Actions release gate is NOT green:

- Workflow run `31271896414` timed out after 15 minutes.
- Job `delivery-and-rules` exceeded `timeout-minutes: 15`.
- `verify` completed 64/64, Solo completed 8/8, and Chronology completed 42/42.
- The job was cancelled during `verify:connections`, after its first four
  sections had passed and while it was entering determinism/pin verification.
- The dependent browser-smoke job never ran.
- GitHub also reported that the current action versions target a deprecated
  Node action runtime.
- CI explicitly selects Node 22 while the linked Vercel project currently builds
  with Node 24. Do not silently pick one; verify current official support and
  make the repository, CI, and Vercel contract agree.

Before editing, record:

- `git status --short --branch`
- `git log -1 --oneline`
- current package scripts and dependencies
- current `.github/workflows/ci.yml`
- current Vercel/project Node setting if readable without mutation
- current production HTTP, asset hash, robots metadata, and console state
- current local runtimes of all build/verification commands
- the exact set of current ignored/untracked audit artifacts

If the branch, commit, production state, or worktree differs materially from
this baseline, explain the drift before proceeding.

## Required sources — read before implementation

1. `AGENTS.md`
2. `docs/production-polish-audit-2026-08-08.md`
3. every accepted screenshot in `audit/production-polish-2026-08-08/`
4. `docs/master-plan.md`, especially §0, §2, §6, §7, and §9 P0–P8
5. `docs/ui-contracts.md`, especially Appendix B
6. `design-qa.md`
7. `docs/delivery-foundations-report.md`
8. `docs/feedback-batch1-plan.md` and `docs/feedback-log.md`
9. `design_handoff_the_stub/README.md` and only the reference screens required
   for the surface being changed
10. `RULEBOOK.md` and `sim/RULESET.md`
11. `src/App.tsx`, `src/index.css`, and `src/components/HowToPlay.tsx`
12. `src/components/DailyModeHeader.tsx`, `StubCard.tsx`, `Hand.tsx`,
    `Results.tsx`, `ShareCopy.tsx`, `useDialogA11y.ts`, and `Icon.tsx` if present
13. `src/SoloGame.tsx`, `src/ChronologyGame.tsx`,
    `src/ConnectionsGame.tsx`, and `src/DuelGame.tsx`
14. `src/lib/motion.ts`, `src/lib/analytics.ts`, and `src/lib/progress.ts`
15. `tests/browser/delivery-smoke.spec.ts`, `playwright.config.ts`,
    `scripts/check-bundle.mjs`, `package.json`, and `.github/workflows/ci.yml`

Search for the actual responsive caps, fixed heights, microtype, overflow rules,
and mode/result entry points. Do not rely only on comments or this prompt.

## Product rulings already made

These are requirements, not open questions:

1. **Connections' board is good.** Preserve its current bill, 4×4 board,
   selection order, inline feedback, solved groups, reveal flow, action row, and
   result ticket. Shared changes may improve its header, icons, type tokens,
   modal, or desktop framing, but do not redesign the core board.
2. **How to Play is mode-specific inside a game.** Connections shows only
   Connections instructions; Duel shows only Duel; Chronology shows only
   Chronology; Daily Puzzle shows only Daily Puzzle.
3. **The menu may keep a four-mode overview.** It is the only place where the
   short guide may summarize all four modes together.
4. **Chronology's overlapping fan is not acceptable as the final choice UI.**
   The recommended direction is a title-first choice tray described below.
5. **Desktop needs composition, not decoration.** Do not solve the problem by
   adding more background around the same 420px or 760px phone layout.
6. **Keep the Stub/movie-house identity.** Preserve navy, cream, amber, paper
   texture, Domine display type, ticket notches, perforation, and physical-card
   metaphor. This is polish, not a rebrand.
7. **Modern means precise.** Improve hierarchy, alignment, scale, responsive
   use of space, typography, state clarity, and motion. Do not add glassmorphism,
   gratuitous gradients, glossy dashboard chrome, or generic SaaS styling.
8. **Connections is the benchmark for result ergonomics.** Other modes may
   reuse its outcome-first, actions-reachable hierarchy without copying its
   game-specific content.

## Non-negotiable engineering guardrails

- No scoring, rule, deal, fairness, hint, difficulty-knob, seed, pool, baked-grid,
  persistence, streak, share-format, or analytics-event behavior change unless
  Buri separately approves it as a rule/product change.
- `sim/RULESET.md` remains canonical. React and sim parity must hold.
- Do not change `DUEL_POOL_IDS`, Solo's deal source, the 304 credited pool, the
  482 dated pool, or Connections baked grids in this milestone.
- No new production dependency. React 18, Vite, Tailwind 4, and Framer Motion
  remain the locked stack. Development dependencies also require focused
  approval if anything beyond the already approved Playwright package is needed.
- Do not refactor `DuelGame.tsx` into a reducer or rewrite its state architecture.
  It is the highest-blast-radius file. Make surgical layout/component changes.
- Preserve current daily/practice distinctions and URL-less share output.
- Preserve `noindex, nofollow` until the separate launch-switch approval.
- Preserve TMDB attribution.
- Do not generate card artwork, personas, leaderboard infrastructure, accounts,
  or more movie content in this milestone.
- Notice unrelated dead code or stale docs, but do not delete or rewrite them
  unless required by this milestone.

## Success definition

This milestone is locally complete only when all of the following are true:

- CI is structurally capable of finishing every required gate without weakening
  the gate contract.
- Menu How to Play is an overview; each mode's How to Play contains only that
  mode's rules and actions.
- Chronology exposes ten readable choices at 375×667, 390×844, tablet, 1280×720,
  and 1440×900 without leaking years or hiding a legal gap.
- Menu, Daily Puzzle, Chronology, Connections, Duel, How to Play, and terminal
  states use deliberate desktop layouts.
- Essential text is readable without depending on 6–10px microtype.
- Functional glyphs use one local accessible icon system; share emoji are intact.
- Motion uses shared tokens, communicates state, and never delays a valid input.
- Compact How to Play and result actions remain visible or clearly/stably
  reachable without scroll traps.
- Keyboard, focus, reduced-motion, 200% zoom, and screen-reader-risk checks have
  evidence or a named attended-device blocker.
- Menu and mode bundle budgets still pass with honest transitive accounting.
- Build and all four verification suites pass.
- Browser smoke covers all four mode-specific help surfaces and all changed
  responsive/terminal paths.
- `docs/master-plan.md` truthfully reflects Wave 3 being deployed and this
  milestone's actual completion state.
- A production release checklist names the remaining external-service and
  attended-device steps without pretending they were completed locally.

## Workstream A — repair the release gate

### A1. Diagnose with timing evidence

Measure each CI command locally and read the cancelled job log. Separate setup,
build, Duel verify, Solo verify, Chronology verify, Connections verify, and
browser work. Record cold and warm timing where practical.

### A2. Make CI finish without weakening it

Preferred shape:

- put build/bundle and the normal rule suites into jobs that can run in parallel;
- give exhaustive Connections verification its own measured timeout rather than
  spending most of a shared 15-minute job budget;
- do not delete `verify:connections`, reduce its assertions, skip the pin, or
  replace it with a superficial JSON check merely to get green;
- browser smoke must run after the required build/rule prerequisites, or run in
  an independent job that still gates the workflow;
- if a fast checked-bake check and an exhaustive content-authoring check are
  separated, document exactly which one runs on every push, which paths trigger
  exhaustive work, and how a content PR is prevented from merging without the
  full 14/14 contract.

### A3. Runtime and action alignment

- Verify the current official supported versions for GitHub's checkout/setup
  actions before changing them.
- Choose one supported Node major for local documentation, CI, and Vercel.
- Pin it through appropriate repository metadata and document any Vercel
  dashboard action Buri must perform.
- Re-run the workflow on the branch only after local workflow review and Buri's
  approval for any remote mutation.

### A4. Acceptance

- Local equivalent gates pass.
- Workflow structure makes the former 15-minute timeout impossible under the
  measured normal range plus reasonable margin.
- No required assertion is lost.
- Browser smoke remains a required check.
- Action-runtime deprecation warning is resolved or documented with an official
  blocking reason.

## Workstream B — mode-specific How to Play

Refactor How to Play into a data-driven, mode-aware presentation without copying
four divergent walls of JSX.

### B1. Entry contract

Use an explicit context such as:

`overview | solo | chronology | connections | duel`

- Menu opens `overview`.
- Daily Puzzle opens `solo`.
- Chronology opens `chronology`.
- Connections opens `connections`.
- Duel opens `duel`.

Do not infer the mode from visible copy, the URL, or global DOM state.

### B2. Content contract

Every mode-specific help surface contains, in this order:

1. Mode name and one-sentence objective.
2. A short three-step “what you do” sequence.
3. How scoring or mistakes work.
4. Only that mode's special actions/terms.
5. Daily/practice context where applicable.
6. A visible primary close/continue action.
7. An optional “full rules for this mode” expansion that still contains no
   other mode's instructions.

Required content boundaries:

- **Daily Puzzle:** connect every hand card to the pile; raise/tap/drag; flip
  for credits costs +1; invalid play behavior; golf score/par; deep-cut meaning.
- **Chronology:** choose a title without seeing its year; raise it; place it in
  a legal older-to-newer gap; strokes, clean placements, streak credit, tight
  call/mercy language exactly as the canonical rulebook currently defines it.
- **Connections:** select four; category types may repeat; Today's Bill names
  the exact remaining category multiset; four mistakes; one-away/miss/solve;
  shuffle/deselect/submit; loss reveals rather than claims the groups were found.
- **Duel:** turns; connect through printed credits; the two marquee piles; play
  one card or draw; flip/deep-cut meaning; Meld, Final Cut, Recast, tokens;
  race to 20 and highest-net result; difficulty affects the rival, not the rules.
- **Overview:** one brief card per mode only. It must not become the full rules
  wall shown inside a mode.

### B3. Responsive and accessibility behavior

- Heading/ARIA label names the current mode, for example “How to play
  Connections.”
- Retain dialog focus entry, focus trap, Escape behavior, and labelled close.
- At 375×667, the primary close/continue action is visible in the initial
  viewport or lives in a stable sticky footer while the body scrolls.
- At desktop, use a centered bounded modal or intentional two-column layout;
  never a 420px full-height strip with unused lower space.
- At 200% zoom, body and footer remain independently reachable without nested
  scroll trapping.

### B4. Automated contract

Add browser assertions that:

- each mode opens a dialog named for that mode;
- the current mode's unique terms are present;
- headings/unique terms from the other modes are absent;
- overview includes all four short summaries;
- compact viewport can reach the primary action;
- Escape and focus trap still work where dismissal is allowed.

Update `RULEBOOK.md` only if player-facing wording needs synchronization. Do not
change `sim/RULESET.md` unless a mechanic changes; this milestone should not.

## Workstream C — solve Chronology choice readability

### C1. Recommended direction: title-first choice tray

Replace the overlapping ten-card fan with a responsive tray of compact Stub
tickets whose first job is to make every title readable.

This is a presentation change only. The same ten movies, same order semantics,
same hidden years, same raise state, same drag/tap/keyboard placement, same legal
gaps, and same scoring remain.

### C2. Mobile requirements — 375×667 and 390×844

- Show all ten choices in a two-column by five-row title-first tray when the
  hand is full.
- Each choice is a native button with at least a 44px interaction height.
- Use a compact perforated-ticket treatment that belongs to the existing Stub
  family without pretending each inventory row is a full poster card.
- Title is at least 12px, Domine or the approved readable title role, up to two
  lines, with deterministic handling for the longest real pool titles.
- Do not show year, release month, credits, or any answer-bearing metadata.
- Do not require horizontal scrolling to discover choices.
- Tapping a choice raises the existing full Chronology card into the hero slot.
- Preserve a selected placeholder/outline in the tray so the list does not jump
  and users know which title is raised.
- Preserve drag and keyboard behavior. If the compact ticket is the drag source,
  use an existing/full-card drag preview rather than changing placement rules.
- Escape returns the raised card to its tray slot.
- The raised hero card, instruction, legal gaps, and choice tray must not overlap
  at either phone height.

### C3. Tablet and desktop requirements

- At 768px and above, stop scaling the phone fan.
- Use a five-column by two-row lower choice shelf, or an equally readable
  title-first side tray proven with real screenshots. The default recommendation
  is the 5×2 shelf because it keeps all ten titles visible without a 500px-tall
  sidebar.
- At 1280×720 and 1440×900, the reel should occupy the main stage width and the
  raised card should be materially larger than a hand choice.
- Make both outer legal gaps visually unmistakable and keyboard reachable.
- Keep every legal gap available as the line grows from 1 to 11 cards.
- Give reel overflow a visible position/continuation cue without introducing a
  fake gap or changing hit testing.
- At the late-game 10-card line, no placed card or end gap may become unreachable.

### C4. States to prove

Capture and inspect:

- initial 10-choice tray;
- long-title stress;
- raised choice and returned choice;
- keyboard-raised choice;
- one placed movie, five placed movies, and ten placed movies;
- start gap, interior gap, and end gap;
- clean placement;
- incorrect placement and correction feedback;
- same-year/month disclosure using the already approved rule/copy only;
- reduced motion;
- final result and replay/menu actions.

### C5. First required visual checkpoint

Implement only the Chronology title-first tray and its responsive stage slice
first. Capture current production beside implementation at:

- 375×667
- 390×844
- 768×1024
- 1280×720
- 1440×900

Show initial, raised, late-line, and result states. Explain any tradeoff between
the 2×5 mobile tray and 5×2 desktop shelf. Stop for Buri's approval before using
this responsive desktop grammar elsewhere.

## Workstream D — shared desktop composition system

Do not apply one universal page template blindly. Define shared desktop rules,
then let each game use the available width according to its primary object.

### D1. Shared responsive rules

- Phone behavior remains deliberate at 375/390 widths.
- Tablet begins around the existing 768 breakpoint only after testing.
- Desktop workspaces may grow to approximately 1100–1200px where the content
  benefits, with intentional margins rather than 420/760 hard caps.
- Do not scale the entire phone UI uniformly. Recompose zones with CSS grid/flex.
- The active object is visibly dominant; secondary counters and help recede.
- Remove meaningless empty space or assign it a clear staging/interaction role.
- Essential controls remain above the fold at 720px height.
- No document horizontal overflow; no unreachable nested-scroll content.
- Maintain the existing texture/palette/card anatomy.

### D2. Shared typography floors

Treat these as targets to verify against real content:

- explanatory/body copy: 14–16px;
- essential utility/instruction/card metadata: at least 12px;
- 10px only for nonessential microcopy or decorative labels;
- do not leave a 6–9px label as the only explanation of a score or action;
- active/raised titles are larger than inventory titles;
- use tabular/fixed-width numerals for changing counters so headers do not tick;
- line-height and line clamping must preserve whole words and recognizable titles.

Do not mechanically enlarge every label if doing so causes collisions. Rework
hierarchy and available space first.

## Workstream E — menu and launch surface

### E1. Desktop

- Replace the 420px shell/300px stack with a real desktop composition.
- Recommended starting point: 2×2 mode-ticket grid in an approximately
  900–1100px content frame, with a restrained product intro/status area.
- Keep all four modes reachable without scrolling at 1440×900 where practical.
- Dailies should be distinguishable from practice without repeating the same
  low-emphasis “practice” pattern four times.
- Provide one clear recommended daily starting action while preserving access to
  every mode. Do not claim a permanent front-door winner without evidence.
- Show played-today/streak/record state without making the menu a dashboard.

### E2. Phone

- Preserve the current readable ticket stack.
- Improve daily/practice hierarchy and make the next recommended action obvious.
- Keep all content reachable at 375×667 through normal document/menu scrolling.
- Menu How to Play remains the concise four-mode overview.

### E3. Budget

The menu shell was only about 4.59 KiB under the 100 KiB gzip budget before
future icon/art work. Keep `npm run check:bundle` honest. Lazy-load detailed
mode help or other nonessential menu content if needed rather than weakening the
budget.

## Workstream F — Daily Puzzle

### F1. Preserve

- Preserve the Solo-only 4+3 rack and Duel's separate fan behavior.
- Preserve raised-slot stability, tap, drag, flip, Escape, keyboard-pile play,
  scoring, par, invalid behavior, and persistence.

### F2. Improve

- Desktop: enlarge the pile/active ticket and use more of the stage width.
- Reduce the oversized empty vertical interval between pile/instruction/rack.
- Move the next-action instruction closer to the object it explains.
- Keep the 4+3 rack readable at desktop rather than merely farther apart.
- Replace 6px score labels and other essential microtype with the shared floor.
- Make flip cost/status legible without creating a new mechanic.
- Prove long titles, revealed credits, invalid play feedback, raised card,
  reduced motion, and both terminal outcomes.

## Workstream G — Connections preservation pass

Connections is not a redesign target.

- Preserve the current 4×4 sorting board geometry and square scan pattern.
- Preserve Today's Bill and its exact-category-multiset contract.
- Preserve selection numbering, shuffle, deselect, submit, one-away/miss slot,
  solved tickets, reveal, share colors, and result ticket.
- Never map categories to tiles, hues, or share colors.
- Never change/rebake/deal grids for presentation.
- Apply only shared improvements: mode-specific help, icon family, type floor,
  modal behavior, desktop framing if it improves rather than dilutes scanning,
  and the final accessibility matrix.
- Re-run all existing selected/one-away/solve/loss/share/revealed-board evidence
  to prove no regression.

## Workstream H — Duel comprehension and desktop composition

Duel is last because it has the largest state and layout blast radius.

### H1. Preserve mechanics and architecture

- Do not change turn flow, scoring, net result, tokens, AI, difficulty profiles,
  link tiers, meld validity, deck, hand, marquee piles, Final Cut, Recast, or
  race-to-20 logic.
- Do not refactor the 39-state architecture into a reducer.
- Shared/presentational extraction is allowed only when it reduces layout risk
  without moving game ownership.

### H2. Phone requirements

- At 375×667, reduce simultaneous visual competition.
- Group Final Cut, Recast, and Meld as player resources/actions instead of a
  disconnected left stack; group Sort and Hint as hand aids.
- Keep the one-move instruction near the current decision, not floating in a
  large empty band.
- Ensure the hand communicates seven selectable titles; intentional overlap may
  remain only if every title and focus target is usable.
- Raise required card text to the shared readable floor.
- Prevent HUD/MeldShelf/hand/end-screen collisions.

### H3. Desktop requirements

- Retire the 420px lit-phone composition as the desktop solution.
- Use the width for real zones. Recommended exploration:
  - top score/turn race spanning the table;
  - CPU booth/resources in one bounded rail;
  - deck and two marquee piles as the central play stage;
  - player actions/meld information in a second bounded rail;
  - player hand across a readable bottom tray.
- Cards do not need to become huge; the table and decision hierarchy should
  scale.
- Preserve the movie-house backdrop as atmosphere, not as a substitute for
  layout.
- At 1280×720, every persistent control and the full selectable hand remain
  reachable.

### H4. Comprehension states

Capture and inspect:

- first turn;
- flip for credits and deep-cut explanation;
- valid standard/strong/super play;
- invalid play feedback;
- draw-one and draw-three choice;
- Recast offer;
- Meld selection and shelf update;
- Final Cut;
- CPU turn/readout;
- compact short viewport;
- long end recap, share, deal again, and menu;
- Matinee/Feature/Director's Cut help wording without changing their knobs.

Stop for a Duel-specific visual checkpoint before starting the final shared QA
pass.

## Workstream I — icon and motion finish

### I1. Icons

- Use one local zero-dependency SVG Icon component and the already planned
  16/20/24px optical sizes with approximately 2px strokes.
- Replace functional glyphs such as back, help, restart, flip, sort, hint,
  close, replay, and board-return controls.
- Keep intentional daily share emoji untouched.
- Every icon-only control keeps an explicit accessible name and at least a 44px
  hit target even when the painted icon is smaller.
- Do not handcraft a new visual icon language; use the approved local family.

### I2. Motion

- Use the existing Framer dependency and `src/lib/motion.ts` tokens.
- Standardize press, deal/stagger, place/settle, and result/reveal beats.
- Prefer transform/opacity; avoid layout-thrashing width/height animation.
- Input becomes available as soon as rule state permits.
- Rapid consecutive taps must never land on a moved target.
- Reduced motion uses a short crossfade and preserves all state meaning.

## Workstream J — results and modal ergonomics

- Use Connections' outcome-first result hierarchy as the quality benchmark.
- At 375×667, primary share/replay/menu actions are visible or reached through
  one obvious stable scroll region; no content is clipped at both ends.
- Use sticky actions only if they do not cover result content or trap zoom users.
- At desktop, use bounded centered result panels with appropriate maximum width;
  do not stretch a phone panel full height.
- Prove Solo win and stuck/solution states, Chronology result, Connections win
  and loss/revealed-board states, and Duel short/long recap results.
- Keep honest daily/practice share labelling and existing URL-less output.

## Workstream K — accessibility and responsive acceptance

Automated evidence is necessary but not sufficient.

### K1. Browser/code evidence

- Native roles and names for every interactive object.
- Logical DOM/reading order after desktop recomposition.
- Full keyboard path through each changed mode.
- Visible focus not clipped by overflow.
- Dialog initial focus, trap, Escape, and return-focus behavior.
- Live status changes announced once.
- 44px touch targets.
- 200% zoom and text enlargement without hidden controls or two-axis scrolling.
- Reduced motion.
- Contrast measurements for amber/slate microcopy, disabled actions, paper/navy
  states, and result scrims.
- No page, console, first-party request, or HTTP errors.

### K2. Required viewports

At minimum:

- 375×667
- 390×844
- 768×1024
- 1280×720
- 1440×900

Also test a modern tall phone and one intermediate laptop width if breakpoints
show new behavior.

### K3. Attended gate

Prepare an exact checklist for:

- real iPhone Safari;
- real Android Chrome;
- VoiceOver;
- TalkBack;
- keyboard-only desktop;
- 200% browser zoom/text enlargement;
- orientation and safe-area behavior.

If those devices/surfaces are unavailable, stop with the checklist and mark the
milestone “automation complete; attended launch gate pending.” Do not claim full
accessibility compliance.

## Workstream L — production operations and plan truth

### L1. Master plan

Update `docs/master-plan.md` truthfully:

- Wave 3 `a710fff` is committed, pushed, and deployed.
- The production audit exists and named desktop/Duel/CI gaps.
- P1 delivery code exists, but the CI timeout and operational items prevent a
  fully green launch gate.
- Tick only work actually completed in this milestone.
- Keep P4 personas, P5 art scale, P7 leaderboard, and further movie expansion
  outside this milestone.

### L2. Durable artifacts

Create/update:

- `docs/production-polish-requirements.md` — final requirements and decisions;
- `docs/production-polish-design-qa.md` — screenshot/state/viewport evidence;
- `docs/production-release-checklist.md` — local, CI, external-service,
  attended-device, rollback, and publish gates;
- `docs/master-plan.md` — ledger truth;
- `RULEBOOK.md` only for synchronized help wording if needed;
- tests and reports required by the implementation.

Do not overwrite the Connections-specific historical `design-qa.md`; reference
it and create the new milestone QA file.

### L3. External-service boundary

Prepare requirements and evidence for:

- production analytics receipt;
- Web Vitals;
- error monitoring and alert path;
- rollback command/drill;
- spend alert/hard ceiling;
- privacy/retention copy;
- TMDB commercial-use decision;
- eventual `noindex` and share-URL launch switch.

Use existing Vercel-native capabilities where they satisfy the requirement
without a new dependency. If an external account, paid plan, new vendor, new
dependency, dashboard mutation, secret, or legal decision is required, stop with
one consolidated approval/action docket. Do not fabricate completion.

## Execution order and checkpoints

### Phase 0 — baseline and release health

- Verify current state.
- Diagnose/fix CI structure locally.
- Reconcile Node/action requirements.
- Draft plan/release-checklist truth.
- No visual checkpoint required, but report exact changes before remote CI work.

### Phase 1 — mode-specific help + Chronology vertical slice

- Implement the mode-scoped How to Play contract.
- Implement the Chronology title-first tray and responsive stage.
- Add focused browser tests.
- Run build, budgets, Chronology, and relevant browser gates.
- Capture the first required visual checkpoint and STOP for Buri.

### Phase 2 — shared desktop shell + menu + Daily Puzzle

- Apply the approved responsive grammar.
- Build the real desktop menu.
- Recompose Daily Puzzle desktop and typography.
- Reconfirm Connections remains visually unchanged except approved shared polish.
- Capture phone/tablet/desktop and terminal evidence; STOP for Buri.

### Phase 3 — Duel + shared icons/motion/results

- Recompose Duel surgically.
- Finish icons, motion, How to Play, and all result surfaces.
- Capture the full Duel state matrix and cross-mode results; STOP for Buri.

### Phase 4 — full local release candidate

- Run full automated matrix.
- Finish QA/release artifacts.
- Prepare attended-device and external-service action docket.
- Stop for Buri before commit/push/deploy.

Do not continue past a rejected visual checkpoint. Apply the ruling narrowly,
re-capture, and re-present the same checkpoint.

## Automated verification matrix

At final local completion, run and report exact results:

- `npm run build`
- `npm run check:bundle`
- `npm run verify` — expected 64/64
- `npm run verify:solo` — expected 8/8
- `npm run verify:chronology` — expected 42/42
- `npm run verify:connections` — expected 14/14
- `npm run test:smoke`
- any new focused responsive/help tests
- `npm run audit:names` only if content was unexpectedly touched; expected no
  content touch, so investigate rather than normalize
- `git diff --check`

Also confirm:

- `src/data/movies.ts`, chronology pool, Connections grids, `DUEL_POOL_IDS`,
  `sim/RULESET.md`, scoring/deal code, persistence keys, and share text are
  unchanged unless explicitly authorized.
- normal production chunks contain no E2E completion seam.
- menu shell ≤100 KiB gzip JS.
- first-mode compressed JS ≤250 KiB.
- typical cold played session ≤2 MiB.
- no mode loads another mode's data on first entry.
- no console warnings/errors or failed first-party requests.

## Visual evidence matrix

For every changed mode, save accepted screenshots in a new dated audit folder
and inspect each file before citing it.

Required surfaces/states:

- Menu: phone, compact phone, tablet, 1280, 1440; daily/practice/status/help.
- Daily Puzzle: idle, raised, flipped credits, invalid, short/tall phones,
  desktop, win, stuck/solution, share.
- Chronology: full title tray, long-title stress, raised, start/interior/end gaps,
  early/mid/late line, correct/incorrect, same-year, result, reduced motion.
- Connections preservation: idle, selected, one-away, solve, loss, revealed
  board, result/share, mode-specific help.
- Duel: every H4 state, compact phone, tall phone, 1280, 1440, long result recap,
  mode-specific help.
- Help/results: initial compact viewport, scrolled content where applicable,
  desktop, 200% zoom, keyboard focus.

No screenshot counts as evidence until the saved file is opened and confirmed
not blank, loading, cropped, or showing the wrong state.

## Final handoff

Return:

1. Executive outcome and whether the milestone is fully local-complete or
   attended/external-gated.
2. Requirement-by-requirement completion table.
3. Before/after screenshots by flow step and viewport.
4. Exact How to Play content/entry contract for all five contexts.
5. Exact Chronology choice-tray behavior and long-title evidence.
6. Desktop composition decisions for each mode.
7. CI before/after job graph, timings, and final status.
8. Accessibility evidence and named limitations.
9. Bundle/network before/after.
10. Files changed and why.
11. Exact automated gate results.
12. Confirmation that rules, scoring, deals, pools, persistence, and shares did
    not change.
13. Remaining attended-device and external-service docket.
14. A concise commit/push/deploy proposal, but do not perform it without Buri's
    explicit approval.

## Stop and escalation rules

Stop immediately for Buri if:

- a requested visual improvement requires a mechanic/scoring/deal change;
- Chronology readability cannot be solved without hiding a legal gap or leaking
  date information;
- Duel layout work would require a state-architecture rewrite;
- Connections' accepted board would have to change materially;
- a new dependency, paid service, external account, secret, or dashboard
  mutation is needed;
- a bundle budget would be weakened rather than met;
- a daily digest/deal/grid unexpectedly changes;
- a real-device/accessibility claim cannot be verified;
- commit, push, merge, deploy, `noindex` removal, URL-in-share, or production
  configuration is the next action.

The stopping point is a locally verified, screenshot-backed release candidate
plus an honest attended/external checklist — not an unreviewed production push.
```
