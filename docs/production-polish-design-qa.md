# Production polish design QA

**Review date:** 2026-08-08
**Baseline:** production `a710fff`
**Candidate:** uncommitted Phase 0–4 worktree on `codex/daily-mode-polish`
**Visual authority:** Stub system plus the extrapolation rules in `docs/master-plan.md`
**Status:** Phases 1–3 approved; Phase 4 full local release matrix passed

Every screenshot linked below was captured from a real rendered browser surface
and manually opened and inspected. No Figma or generated image was used as a
substitute for the app. The Chronology state runs placed all ten cards through
the real UI and real rule engine; no result seam was used.

## Phase 1 ruling summary

### How to Play — EXTRAPOLATED

- **Pass:** the menu now gives one brief, four-mode orientation instead of
  presenting Duel's full rulebook as the product-wide tutorial.
- **Pass:** every mode has a local help affordance and a mode-named accessible
  dialog with its own objective, actions, scoring/feedback, terminology, and
  daily/practice explanation.
- **Pass:** phones use a full-screen sheet with one scrolling body and a fixed
  amber CTA. Desktop uses a centered, viewport-fixed panel capped at 760px.
- **Pass:** the expanded section is local to the selected mode; focus trap,
  Escape close, trigger-focus restoration, and TMDB attribution remain intact.

Compact phone: [overview](../audit/production-polish-phase1-2026-08-08/implementation-help-overview-375x667.png) · [Daily Puzzle](../audit/production-polish-phase1-2026-08-08/implementation-help-solo-375x667.png) · [Chronology](../audit/production-polish-phase1-2026-08-08/implementation-help-chronology-375x667.png) · [Connections](../audit/production-polish-phase1-2026-08-08/implementation-help-connections-375x667.png) · [Duel](../audit/production-polish-phase1-2026-08-08/implementation-help-duel-375x667.png)

Desktop: [overview](../audit/production-polish-phase1-2026-08-08/implementation-help-overview-1440x900.png) · [Daily Puzzle](../audit/production-polish-phase1-2026-08-08/implementation-help-solo-1440x900.png) · [Chronology](../audit/production-polish-phase1-2026-08-08/implementation-help-chronology-1440x900.png) · [Connections](../audit/production-polish-phase1-2026-08-08/implementation-help-connections-1440x900.png) · [Duel](../audit/production-polish-phase1-2026-08-08/implementation-help-duel-1440x900.png)

### Chronology title-first tray — EXTRAPOLATED

- **Pass:** all ten choices are readable at once. The daily deal includes the
  stress title `Saturday Night Fever`, which fits without truncation at both
  phone widths and on desktop.
- **Pass:** a raised choice leaves a stable dashed placeholder, preserving both
  inventory count and spatial memory. The raised hero remains visually dominant.
- **Pass:** the outer targets say `OLDER` and `NEWER`; every legal gap remains
  present and keyboard reachable.
- **Pass:** compact-phone progress no longer touches the reel. The late line
  remains horizontally scrollable and the result dialog fits without clipping.
- **Pass:** the 1280×720 and 1440×900 versions use a true wide reel and 5×2 tray,
  replacing the deployed phone-width strip/fan composition.
- **Production finding:** the deployed overlapping fan can cause a normal pointer
  click on one visually exposed card to be intercepted by a neighboring card.
  Keyboard selection still works. The native-button tray removes that overlap.

## Production versus implementation matrix

Each group is ordered **initial · raised · late line · result**.

| Viewport | Production | Phase 1 candidate |
|---|---|---|
| 375×667 | [initial](../audit/production-polish-phase1-2026-08-08/production-375x667-initial.png) · [raised](../audit/production-polish-phase1-2026-08-08/production-375x667-raised.png) · [late](../audit/production-polish-phase1-2026-08-08/production-375x667-late-line.png) · [result](../audit/production-polish-phase1-2026-08-08/production-375x667-result.png) | [initial](../audit/production-polish-phase1-2026-08-08/implementation-375x667-initial.png) · [raised](../audit/production-polish-phase1-2026-08-08/implementation-375x667-raised.png) · [late](../audit/production-polish-phase1-2026-08-08/implementation-375x667-late-line.png) · [result](../audit/production-polish-phase1-2026-08-08/implementation-375x667-result.png) |
| 390×844 | [initial](../audit/production-polish-phase1-2026-08-08/production-390x844-initial.png) · [raised](../audit/production-polish-phase1-2026-08-08/production-390x844-raised.png) · [late](../audit/production-polish-phase1-2026-08-08/production-390x844-late-line.png) · [result](../audit/production-polish-phase1-2026-08-08/production-390x844-result.png) | [initial](../audit/production-polish-phase1-2026-08-08/implementation-390x844-initial.png) · [raised](../audit/production-polish-phase1-2026-08-08/implementation-390x844-raised.png) · [late](../audit/production-polish-phase1-2026-08-08/implementation-390x844-late-line.png) · [result](../audit/production-polish-phase1-2026-08-08/implementation-390x844-result.png) |
| 768×1024 | [initial](../audit/production-polish-phase1-2026-08-08/production-768x1024-initial.png) · [raised](../audit/production-polish-phase1-2026-08-08/production-768x1024-raised.png) · [late](../audit/production-polish-phase1-2026-08-08/production-768x1024-late-line.png) · [result](../audit/production-polish-phase1-2026-08-08/production-768x1024-result.png) | [initial](../audit/production-polish-phase1-2026-08-08/implementation-768x1024-initial.png) · [raised](../audit/production-polish-phase1-2026-08-08/implementation-768x1024-raised.png) · [late](../audit/production-polish-phase1-2026-08-08/implementation-768x1024-late-line.png) · [result](../audit/production-polish-phase1-2026-08-08/implementation-768x1024-result.png) |
| 1280×720 | [initial](../audit/production-polish-phase1-2026-08-08/production-1280x720-initial.png) · [raised](../audit/production-polish-phase1-2026-08-08/production-1280x720-raised.png) · [late](../audit/production-polish-phase1-2026-08-08/production-1280x720-late-line.png) · [result](../audit/production-polish-phase1-2026-08-08/production-1280x720-result.png) | [initial](../audit/production-polish-phase1-2026-08-08/implementation-1280x720-initial.png) · [raised](../audit/production-polish-phase1-2026-08-08/implementation-1280x720-raised.png) · [late](../audit/production-polish-phase1-2026-08-08/implementation-1280x720-late-line.png) · [result](../audit/production-polish-phase1-2026-08-08/implementation-1280x720-result.png) |
| 1440×900 | [initial](../audit/production-polish-phase1-2026-08-08/production-1440x900-initial.png) · [raised](../audit/production-polish-phase1-2026-08-08/production-1440x900-raised.png) · [late](../audit/production-polish-phase1-2026-08-08/production-1440x900-late-line.png) · [result](../audit/production-polish-phase1-2026-08-08/production-1440x900-result.png) | [initial](../audit/production-polish-phase1-2026-08-08/implementation-1440x900-initial.png) · [raised](../audit/production-polish-phase1-2026-08-08/implementation-1440x900-raised.png) · [late](../audit/production-polish-phase1-2026-08-08/implementation-1440x900-late-line.png) · [result](../audit/production-polish-phase1-2026-08-08/implementation-1440x900-result.png) |

## Phase 2 ruling summary

### Menu and launch surface — EXTRAPOLATED

- **Pass:** 375×667 and 390×844 retain one readable, normally scrollable ticket
  stack. The recommended Daily Puzzle action is carried by the first ticket,
  while every practice control has a physical 44px target.
- **Pass:** tablet uses a 2×2 grid, and 1280×720 / 1440×900 use a restrained
  program rail plus a real 2×2 mode grid. All four modes remain above the fold.
- **Pass:** daily status, streaks, records, and practice choices remain visible
  without turning the surface into a dashboard. The mode entry and persistence
  contracts are unchanged.

Menu evidence: [375×667](../audit/production-polish-phase2-2026-08-08/menu-375x667.png) · [390×844](../audit/production-polish-phase2-2026-08-08/menu-390x844.png) · [768×1024](../audit/production-polish-phase2-2026-08-08/menu-768x1024.png) · [1280×720](../audit/production-polish-phase2-2026-08-08/menu-1280x720.png) · [1440×900](../audit/production-polish-phase2-2026-08-08/menu-1440x900.png) · [compact help](../audit/production-polish-phase2-2026-08-08/menu-help-375x667.png)

### Daily Puzzle desktop composition and state clarity — EXTRAPOLATED

- **Pass:** phone and tablet preserve the Solo-only 4+3 rack, slot stability,
  tap/keyboard raise, pile play, drag, flip, Escape, and card anatomy.
- **Pass:** desktop grows to 1180px and assigns separate pile, travel, and hand
  zones. The pile is the larger anchor; the rack uses its width as a readable
  4+3 set instead of a phone board surrounded by empty canvas.
- **Pass:** the three essential score labels are 12px instead of 6px. The stage
  now states `First flip +1 · re-flips free`, and an invalid play gives an
  explicit, live-announced `No shared credit · +2` message while retaining the
  existing penalty and shake.
- **Pass:** the raised title, revealed credits, compact/tall phones, short and
  tall desktops, win, stuck, solution, and share-ready result paths were opened
  and inspected. The test-only terminal seam remains excluded from normal builds.

Daily Puzzle idle: [375×667](../audit/production-polish-phase2-2026-08-08/solo-idle-375x667.png) · [390×844](../audit/production-polish-phase2-2026-08-08/solo-idle-390x844.png) · [768×1024](../audit/production-polish-phase2-2026-08-08/solo-idle-768x1024.png) · [1280×720](../audit/production-polish-phase2-2026-08-08/solo-idle-1280x720.png) · [1440×900](../audit/production-polish-phase2-2026-08-08/solo-idle-1440x900.png)

Daily Puzzle states: [raised](../audit/production-polish-phase2-2026-08-08/solo-raised-1440x900.png) · [credits](../audit/production-polish-phase2-2026-08-08/solo-raised-credits-1440x900.png) · [invalid](../audit/production-polish-phase2-2026-08-08/solo-invalid-1440x900.png) · [win](../audit/production-polish-phase2-2026-08-08/solo-win-1440x900.png) · [stuck](../audit/production-polish-phase2-2026-08-08/solo-stuck-375x667.png) · [solution](../audit/production-polish-phase2-2026-08-08/solo-stuck-solution-375x667.png)

### Connections preservation — ACCEPTED SURFACE RECONFIRMED

- **Pass:** no Connections game, board, deal, grouping, scoring, feedback, share,
  or result code changed in Phase 2. The existing board was replayed through the
  required preservation states after the shared responsive work.
- **Pass:** Today's Bill, title-only 4×4 scan, selection order, one-away toast,
  solved bands, loss reveal, result/share ticket, and board-return action remain
  visually and behaviorally intact.

Connections evidence: [idle phone](../audit/production-polish-phase2-2026-08-08/connections-idle-375x667.png) · [selected](../audit/production-polish-phase2-2026-08-08/connections-selected-375x667.png) · [one away](../audit/production-polish-phase2-2026-08-08/connections-one-away-375x667.png) · [solved group](../audit/production-polish-phase2-2026-08-08/connections-solved-group-375x667.png) · [loss](../audit/production-polish-phase2-2026-08-08/connections-loss-375x667.png) · [revealed board](../audit/production-polish-phase2-2026-08-08/connections-revealed-375x667.png) · [tablet](../audit/production-polish-phase2-2026-08-08/connections-idle-768x1024.png) · [desktop](../audit/production-polish-phase2-2026-08-08/connections-idle-1440x900.png) · [result/share](../audit/production-polish-phase2-2026-08-08/connections-result-1440x900.png)

## Phase 3 ruling summary

### Duel comprehension and responsive table — EXTRAPOLATED

- **Pass:** 375×667 and 390×844 group Final Cut, Recast, and Meld as `Your
  tools`, with Sort and Hint grouped as `Hand aids`. Every interactive dock
  control has a 44px physical height and 12px essential text.
- **Pass:** contextual states quiet the dock while a raised card, Meld picker,
  draw choice, or run owns the decision. The one-move cue also yields to a
  visible take-to-meld action, preventing compact-screen label collisions.
- **Pass:** 1280×720 and 1440×900 retire the 420px lit-phone board. The score
  race spans an 1180px table; CPU booth, central deck/marquees, player tools,
  optional meld shelf, commentary band, and seven-title hand occupy distinct
  zones. Duel retains its fan behavior; Solo remains the only 4+3 rack.
- **Pass:** flip/credits, raised, Final Cut, Meld selection, draw-three,
  standard, super/deep, invalid, CPU turn, Recast, banked shelf, difficulty
  help, and compact/desktop end states were rendered and inspected.
- **Pass:** desktop results use a bounded 720px recap ticket. Compact results
  use one stable scroll region with outcome and net first, followed by the recap
  and reachable copy, Deal again, and Menu actions.

Duel first turn: [375×667](../audit/production-polish-phase3-2026-08-08/duel-first-turn-375x667.png) · [390×844](../audit/production-polish-phase3-2026-08-08/duel-first-turn-390x844.png) · [768×1024](../audit/production-polish-phase3-2026-08-08/duel-first-turn-768x1024.png) · [1280×720](../audit/production-polish-phase3-2026-08-08/duel-first-turn-1280x720.png) · [1440×900](../audit/production-polish-phase3-2026-08-08/duel-first-turn-1440x900.png)

Duel actions and feedback: [credits](../audit/production-polish-phase3-2026-08-08/duel-flipped-credits-375x667.png) · [raised](../audit/production-polish-phase3-2026-08-08/duel-raised-375x667.png) · [Final Cut](../audit/production-polish-phase3-2026-08-08/duel-final-cut-375x667.png) · [Meld selection](../audit/production-polish-phase3-2026-08-08/duel-meld-selection-375x667.png) · [draw three](../audit/production-polish-phase3-2026-08-08/duel-draw-three-375x667.png) · [standard](../audit/production-polish-phase3-2026-08-08/duel-standard-link-375x667.png) · [super/deep](../audit/production-polish-phase3-2026-08-08/duel-super-deep-link-375x667.png) · [invalid](../audit/production-polish-phase3-2026-08-08/duel-invalid-375x667.png) · [CPU turn](../audit/production-polish-phase3-2026-08-08/duel-cpu-turn-1440x900.png) · [Recast](../audit/production-polish-phase3-2026-08-08/duel-recast-offer-1440x900.png) · [meld shelf](../audit/production-polish-phase3-2026-08-08/duel-meld-shelf-1440x900.png)

Duel help/results: [desktop help](../audit/production-polish-phase3-2026-08-08/duel-help-1440x900.png) · [desktop long recap](../audit/production-polish-phase3-2026-08-08/duel-long-result-1440x900.png) · [compact outcome](../audit/production-polish-phase3-2026-08-08/duel-long-result-top-375x667.png) · [compact actions](../audit/production-polish-phase3-2026-08-08/duel-long-result-actions-375x667.png)

### Shared icon, motion, and result finish

- **Pass:** functional back, help, restart, close, flip, sort, and hint glyphs
  now use one local, zero-dependency 2px SVG family at 16/20/24px optical sizes.
  Accessible names and 44px interaction halos remain on icon-only controls.
- **Pass:** the existing shared motion durations and reduced-motion behavior
  remain authoritative. Duel's dock transition and compact banners use the same
  short transform/opacity language and never delay a legal gameplay input.

### Separately gated parity finding

- A raised-card keyboard activation on the pile can also reach Framer's tap
  handler and pay a first-flip stroke before the play resolver runs. The visual
  work did not create or change this path. Because correcting it changes an
  observed score outcome, it is logged for explicit rule/parity approval rather
  than silently altered inside Phase 2.

## Automated evidence

- `npm run build` — pass, 438 modules.
- `npm run check:bundle` — pass; menu 95.31 KiB gzip, all cold mode loads
  117.39–144.36 KiB gzip, all cold sessions 268.72–321.64 KiB.
- Browser matrix — all 14 permanent smoke tests passed in one run. The Duel
  addition verifies five viewports, 44px tool controls, seven reachable fan
  cards, distinct desktop rails, result scrolling/actions, and difficulty copy.
- Core rule gates reran green after Phase 3: Duel 64/64, Solo 8/8, Chronology
  42/42, Connections 14/14.
- `git diff --check` passed. Movie pools, chronology pool, Connections grids,
  `DUEL_POOL_IDS`, `sim/RULESET.md`, rule/scoring libraries, persistence keys,
  and share text are unchanged.

## Deferred human/operational gates

- Buri rule/parity ruling on the pre-existing raised-card keyboard/tap collision.
- Real iPhone and Android play-through, VoiceOver/TalkBack, 200% zoom, and
  instrumented contrast/performance checks belong to the later launch gate.
- GitHub CI has not run this candidate because nothing has been committed or
  pushed. The production site has not been modified.

## Phase 4 release-candidate ruling

Buri approved Phase 3 and authorized the full local release-candidate pass.
The final matrix is green: build 438 modules, bundle budgets pass, Duel 64/64,
Solo 8/8, Chronology 42/42, Connections 14/14, browser 14/14, and
`git diff --check`. Menu shell is 95.31 KiB gzip; cold first-mode JavaScript is
117.39–144.37 KiB; cold played sessions are 269.44–322.36 KiB. Protected rule,
data, persistence, and share files are unchanged, and normal chunks contain no
E2E marker. See `production-polish-release-candidate.md` for the complete local
handoff and the attended/external docket.
