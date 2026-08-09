# Production polish requirements

**Baseline:** Wave 3 production release `a710fff` at `https://matchcutdaily.com`
**Program opened:** 2026-08-08
**Current checkpoint:** Phases 1–3 approved; Phase 4 local release candidate complete and awaiting publication approval

This is the execution contract for the production-polish milestone. It turns the
findings in `production-polish-audit-2026-08-08.md` into gated, reviewable work.
`docs/master-plan.md` remains the only live build plan; this file records the
requirements and acceptance evidence for this milestone.

## Non-negotiable constraints

- Do not change rules, scoring, deals, difficulty, movie content, persistence,
  share output, or the Connections board.
- `sim/RULESET.md` is canonical. React and the sims must continue to call the
  same pure functions in `src/lib/`.
- Keep React 18, Vite, Tailwind 4, and Framer Motion. Add no production dependency.
- Make surgical edits in `src/DuelGame.tsx`; do not refactor its state model as
  part of visual polish.
- Preserve `noindex, nofollow` and URL-free share output until Buri explicitly
  approves the launch switch.
- Stop at every visual checkpoint. Commit, push, pull request, deploy, analytics
  writes, and other external mutations require explicit approval.
- Every UI wave must include real rendered screenshots, keyboard and reduced-
  motion checks, compact phones, desktop, and a played-through end state.

## Phase gates

| Phase | Scope | Acceptance | State |
|---|---|---|---|
| 0 | Restore release health and plan truth | Local build/budgets/rule suites/browser smoke green; CI warning and timeout causes repaired without dropping assertions; Node aligned | Local repair complete; remote CI proof awaits approval to publish the branch |
| 1 | Mode-specific How to Play and Chronology title-first tray | Brief four-mode overview; each mode exposes only its own rules; persistent primary CTA; ten readable hidden-year choices; clear older/newer end gaps; five viewport × four state comparison | Approved |
| 2 | Menu, Daily Puzzle, Connections | Landing-page hierarchy; stronger Daily Puzzle composition; preserve Connections board and behavior | Approved |
| 3 | Duel | Desktop composition, action hierarchy, compact/result fit, surgical state-safe edits | Approved |
| 4 | Shared icons, motion, type floors, results | Consistent local SVG family, motion tokens, accessible text/targets, all end states | Approved; full local matrix green |
| 5 | Operational readiness | Monitoring, Web Vitals receipts, analytics receipt, rollback drill, spend ceiling, privacy/credits, rights decision | Not started |
| 6 | Launch gate | Full test matrix, real devices, assistive tech, performance, approval of public switches and intended SHA | Not started |

## Phase 0 implementation decisions

- Pin Node to `24.x` in `package.json` and the lockfile. GitHub Actions reads the
  same repository declaration; Vercel will also read the package engine on the
  next approved deployment.
- Replace deprecated `actions/checkout@v4` and `actions/setup-node@v4` with v6.
- Preserve every assertion while splitting the previous serial job into four
  parallel jobs: build/budgets, Duel rules, daily rules, and exhaustive
  Connections rules. Browser smoke waits for all four.
- Keep the exhaustive Connections verifier intact. Its local 187-second run is
  valid release evidence; removing coverage to make CI faster is not acceptable.

## Phase 1 acceptance matrix

### How to Play

- The menu opens a four-card overview, not an all-rules wall.
- Daily Puzzle, Chronology, Connections, and Duel each open a dialog named for
  that mode and contain no other mode's instructions.
- Detailed rules expand only inside the selected mode.
- The footer CTA is visible at 375×667 without scrolling; the content body owns
  any overflow.
- Dialog focus is trapped, Escape closes it, and focus returns to the trigger.
- TMDB attribution remains present.

### Chronology

- The hidden-year inventory contains exactly ten stable title buttons at the
  initial deal: 2×5 on phones and 5×2 from tablet upward.
- Every ticket is at least 44px high, preserves its slot while raised, and shows
  title only—no year, decade color, release date, or other answer-bearing data.
- Enter/Space raises a title and moves focus to the first legal gap; Escape
  lowers it and returns focus to its tray slot.
- The reel exposes explicit `OLDER` and `NEWER` end labels while a card is raised.
- Initial, raised, late-line, and result states fit at 375×667, 390×844,
  768×1024, 1280×720, and 1440×900.
- The long-title daily stress case (`Saturday Night Fever`) remains fully legible.

## Evidence routes

- Visual record: `docs/production-polish-design-qa.md`
- Foundation measurements: `docs/delivery-foundations-report.md`
- Release and launch switches: `docs/production-release-checklist.md`
- Historical production diagnosis: `docs/production-polish-audit-2026-08-08.md`
- Final local candidate: `docs/production-polish-release-candidate.md`
