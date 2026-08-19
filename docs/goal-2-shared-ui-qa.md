# Goal 2 — Shared UI alignment and clipping

Date: 2026-08-18

Final result: passed

## Scope held

- Presentation-only shared shell work. No mechanics, scoring, deals, movie
  data, persistence, share format, or mode rules changed.
- Existing mode-specific stage compositions remain intact: Solo ticket rack,
  Chronology reel and title tray, Connections 4×4 sorting board, and Duel
  theater/table.
- No commit, push, or deployment was performed.

## Shared contract

- Shell widths: 420px phone, 760px tablet, 1180px desktop.
- Header chrome: one navy dotted surface, 2px amber keyline, centered ticket
  tab, 44px back target, and 32px help control with a 44px hit area.
- Safe areas: one root-level inset contract for all four edges. Validation also
  used simulated 47px top and 34px bottom insets at 390×844.
- Borders: 2px shared frame width and 18px shared stage radius.
- Counters: shared label/value type roles and stable tabular/fixed digits where
  already required.
- Feedback: shared bounded, wrapping banner treatment; long messages may wrap
  rather than crop.
- Results: one replay/deal primary and one Menu secondary action component in
  every mode.
- 200% zoom: a 1440×900 window is validated as a 720×450 CSS viewport with a
  vertically reachable 667px game canvas and no horizontal page scrolling.

## Screenshot matrix

The baseline contains 45 screenshots and the final matrix contains 54:

| Surface | 320×568 | 390×844 | 768×1024 | 1440×900 | 200% zoom | safe-area phone |
|---|---:|---:|---:|---:|---:|---:|
| Menu | before/after | before/after | before/after | before/after | before/after | after |
| Daily Puzzle | before/after | before/after | before/after | before/after | before/after | after |
| Chronology | before/after | before/after | before/after | before/after | before/after | after |
| Connections | before/after | before/after | before/after | before/after | before/after | after |
| Duel | before/after | before/after | before/after | before/after | before/after | after |
| Four terminal result screens | before/after | before/after | before/after | before/after | before/after | after |

Artifacts are under `output/playwright/goal-2/`. Contact sheets:

- `before-mode-contact-sheet.png`
- `after-mode-contact-sheet.png`
- `before-result-contact-sheet.png`
- `after-result-contact-sheet.png`

Automated capture diagnostics are in `before-diagnostics.json` and
`after-diagnostics.json`. The final matrix records zero browser/page errors,
zero visible-text clips, zero page-level horizontal overflow, and matching
shell/header widths at every breakpoint. The only heuristic clip entry is the
intentional `sr-only` Chronology announcement (`Oldboy, movie 1 of 1`).

## Verification

| Gate | Result |
|---|---|
| `npm run build` | passed; 439 modules |
| `npm run check:bundle` | passed; menu 95.30 KiB gzip JS |
| `npm run verify` | 64 passed, 0 failed |
| `npm run verify:solo` | 8 passed, 0 failed |
| `npm run verify:chronology` | 42 passed, 0 failed |
| `npm run verify:connections` | 14 passed, 0 failed |
| `npm run test:smoke` | 20 passed |
| `git diff --check` | passed |

The browser suite exercised click, keyboard, touch, and drag paths; all four
mode-specific help dialogs; all four terminal/share/menu paths; phone and
desktop composition; and the existing responsive Chronology, Solo, and Duel
contracts.
