# Goal 3 — Mode-specific onboarding and polish

Date: 2026-08-18

Final result: passed locally

## Scope held

- Presentation and meta-state only. No mechanics, scoring constants, deal
  generation, movie pools, baked Connections grids, share format, or
  rule-dependent persistence changed.
- The Connections 4×4 board and solved/reveal flow remain intact.
- Duel keeps the existing fan and the single-writer state architecture.
- The daily passport reads the existing once-per-seed completion records. It
  adds no storage key or gameplay dependency, and practice never stamps it.
- No commit, push, or deployment was performed.

## Implemented behavior

- Daily Puzzle opens with a first-move prompt. Raising a card changes that copy
  to the next action, emphasizes a valid pile target, and explains a no-link
  choice without exposing an answer.
- Duel opens with a first-turn choice. A raised card emphasizes only playable
  marquee targets; the action label sits on the target. Existing Meld rows keep
  their amber lay-off emphasis.
- Duel Meld selection now numbers and raises selected cards, fades unselected
  cards, and moves the selection readout above the fan so it does not cover
  movie titles.
- Connections keeps its exact sorting board while desktop surrounding space
  becomes two quiet marquee readouts for the task and live progress.
- Every result now states whether lower, fewer, or higher is better. All four
  modes expose the same CTA order: copy result, replay/new deal, Menu.
- The menu adds a local-only 0/3 daily passport and gives each practice entry a
  skill purpose rather than a generic round label.

## Browser evidence

Artifacts are under `output/playwright/goal-3/`.

- `menu-phone.png` and `menu-desktop.png`: passport plus purposeful practice
  labels; the phone menu remains vertically reachable.
- `solo-initial-phone.png` and `solo-raised-phone.png`: contextual first move
  and legal pile emphasis.
- `duel-initial-phone.png`, `duel-target-phone.png`, and
  `duel-meld-selection-phone.png`: first-turn guidance, action-local target, and
  readable Meld selection.
- `connections-desktop.png`: unchanged board with intentional desktop rails.
- The four `*-result-phone.png` captures show the shared result meaning and CTA
  hierarchy.

Fresh-profile browser checks recorded zero page-level horizontal overflow on
the inspected phone and desktop states. The Meld readout ended at y=612 while
the hand began at y=619, proving no overlap. A localStorage check with two
completed dailies showed 2/3 stamps and byte-equivalent stored JSON before and
after the menu render.

## Verification

| Gate | Result |
|---|---|
| `npm run build` | passed; 440 modules |
| `npm run check:bundle` | passed; menu 95.61 KiB gzip JS |
| `npm run verify` | 64 passed, 0 failed |
| `npm run verify:solo` | 8 passed, 0 failed |
| `npm run verify:chronology` | 42 passed, 0 failed |
| `npm run verify:connections` | 14 passed, 0 failed |
| focused browser contracts | 3 passed |
| `npm run test:smoke` | 20 passed |
| `git diff --check` | passed |

The browser suite covers click, Enter, Space, drag, and touch success paths;
real first actions in every mode; mode-scoped rules; terminal/share/menu paths;
and phone, tablet, desktop, compact-height, and result layouts. The four
simulation suites remain the completion evidence for full rule-correct rounds.

## Separate launch gates

Real-device VoiceOver/TalkBack, subjective satisfaction with a new human
tester, remote CI, commit/push, and production deployment remain attended or
operational gates. They are not represented here as completed evidence.
