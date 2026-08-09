# Production polish local release candidate

**Prepared:** 2026-08-09
**Branch:** `codex/daily-mode-polish`
**Baseline/upstream:** `a710fff` (`Add Wave 3 movie pool expansion`)
**Candidate:** uncommitted Phase 0–4 worktree
**Status:** local automation and visual checkpoints complete; attended,
remote-CI, external-service, and publication gates remain

## 1. Executive outcome

The production-polish milestone is a fully verified **local release candidate**.
The release pipeline is structurally repaired, help is mode-scoped, Chronology
uses ten readable title-first choices, every mode has a deliberate desktop
composition, the shared icon/result treatment is complete, and Buri approved
all three visual checkpoints. Nothing has been committed, pushed, deployed, or
changed in production.

This is not a public-launch certification. Real-device, assistive-technology,
remote CI, monitoring, legal/rights, and public-switch work remains explicitly
gated below.

## 2. Requirement completion

| Requirement | Local result | Remaining gate |
|---|---|---|
| Release workflow reliability | Five-job parallel workflow; no assertion removed | Push exact candidate and receive green GitHub run |
| Mode-specific How to Play | Complete and browser-verified | Real screen-reader spot-check |
| Chronology readability | Complete at all five target viewports | Real phone/browser confirmation |
| Deliberate desktop compositions | Menu, Solo, Chronology, Connections, Duel complete | Real-device/laptop spot-check |
| Shared typography/icons/motion/results | Complete; local SVG family, 44px targets, reduced-motion path | 200% zoom and instrumented contrast |
| Rule and data integrity | Protected-file diff clean; all sims green | None for local candidate |
| Bundle/lazy-loading budgets | Complete; all budgets green | Production asset receipt after deployment |
| Accessibility risk evidence | Automated keyboard/focus/reduced-motion evidence recorded | VoiceOver, TalkBack, 200% zoom, real devices |
| Operational readiness | Docket prepared | Monitoring, analytics, vitals, rollback, spend, privacy, rights |
| Publication | Intentionally not performed | Separate commit, push, and deploy approvals |

## 3. Screenshot evidence

The complete before/after and state matrix is indexed in
[`production-polish-design-qa.md`](production-polish-design-qa.md). Primary
accepted sets:

- Phase 1: menu/mode help and Chronology production-versus-candidate at
  375×667, 390×844, 768×1024, 1280×720, and 1440×900.
- Phase 2: menu, Daily Puzzle idle/raised/credits/invalid/win/stuck/solution,
  and Connections preservation through result/share.
- Phase 3: Duel first turn at five viewports, every action/feedback state,
  desktop and compact long results, and Duel help.

Every cited image was opened and inspected before approval. No Figma or image
generation was used as visual evidence.

## 4. How to Play entry contract

`HowToPlay` accepts exactly `overview | solo | chronology | connections | duel`.
The menu opens `overview`; each game opens only its own context.

| Context | Objective and sections |
|---|---|
| `overview` | Four short cards: Daily Puzzle, Chronology, Connections, Duel |
| `solo` | Connect the hand to the pile; actions, golf score/par, terms, daily/practice, expandable full rules |
| `chronology` | Place ten hidden-year titles; actions, strokes/streaks, mercy, daily/practice, expandable full rules |
| `connections` | Sort 16 titles into four groups; actions, four mistakes, Today's Bill, daily/practice, expandable full rules |
| `duel` | Link across two marquees; actions, scoring, tools/terms, difficulty, expandable full rules |

All contexts retain TMDB attribution. Phones use one scroll body with a fixed
primary close CTA; desktop uses a bounded 760px dialog. Focus trap, Escape, and
trigger-focus restoration are browser-covered.

## 5. Chronology choice tray

The initial inventory is ten title-only native buttons: 2×5 on phones and 5×2
from tablet upward. Years and other answer-bearing metadata remain hidden. A
raised title leaves a stable placeholder; Enter/Space raises and moves focus to
the first legal gap; Escape restores the tray slot. The reel exposes every gap,
including explicit `OLDER` and `NEWER` ends, and remains horizontally reachable
as the line grows. `Saturday Night Fever` is the accepted long-title stress
case. Phase 1 evidence covers initial, raised, late-line, and result states at
all five target viewports.

## 6. Desktop composition decisions

- **Menu:** program rail plus 2×2 mode grid, with all modes above the fold.
- **Daily Puzzle:** distinct pile, travel, and 4+3 hand zones inside an 1180px
  stage; the pile remains the dominant anchor.
- **Chronology:** wide film reel and 5×2 title shelf rather than a stretched
  phone fan.
- **Connections:** accepted 4×4 board preserved and framed as a centered desktop
  program; game logic and bill remain unchanged.
- **Duel:** 1180px table with separate score race, CPU booth, marquees/deck,
  tools, commentary, optional Meld shelf, and readable seven-card fan.

## 7. CI repair and status

The failed baseline graph was one 15-minute serial `delivery-and-rules` job,
followed by browser smoke. Run `31271896414` reached Duel 64/64, Solo 8/8, and
Chronology 42/42, then timed out during the exhaustive Connections verifier;
browser smoke never started.

The candidate graph runs four prerequisites in parallel:

1. `build-and-budgets` — 10-minute ceiling.
2. `duel-rules` — 20-minute ceiling.
3. `daily-rules` — 10-minute ceiling.
4. `connections-rules` — 30-minute ceiling.
5. `browser-smoke` — waits for all four; 20-minute ceiling.

Node is repository-pinned to `24.x`; checkout/setup-node use v6. Observed final
local durations were approximately 2.3 seconds for build, 3 minutes for Duel,
3 minutes 22 seconds for Connections, and 48.9 seconds for 14 browser tests.
Remote status remains **not run**, because the candidate is not committed or
pushed.

## 8. Accessibility evidence and limits

Automated/browser evidence covers native button semantics, accessible dialog
names, focus trap and restoration, Escape, 44px primary targets, Chronology
keyboard movement, stable result scrolling, live error feedback, and reduced
motion. Screenshot evidence covers compact viewport reachability.

No claim of full accessibility compliance is made. Real VoiceOver, TalkBack,
iPhone Safari, Android Chrome, 200% zoom/text enlargement, and instrumented
contrast checks remain attended gates. The pre-existing Duel raised-card
keyboard/tap collision remains separately gated because correcting its observed
score effect requires an explicit rule/parity decision.

## 9. Bundle and network

| Surface | Incremental JS | Cold JS | Cold session |
|---|---:|---:|---:|
| Menu | — | 95.31 KiB | — |
| Daily Puzzle | 37.13 KiB | 132.44 KiB | 322.36 KiB |
| Chronology | 22.08 KiB | 117.39 KiB | 269.44 KiB |
| Connections | 49.06 KiB | 144.37 KiB | 271.14 KiB |
| Duel | 47.85 KiB | 143.17 KiB | 269.94 KiB |

All limits pass: menu ≤100 KiB gzip, first-mode JS ≤250 KiB, and cold session
≤2 MiB. The browser suite proves a cold menu loads no mode chunk and selecting
Solo does not fetch other modes. It also fails on console/page errors, failed
first-party requests, or HTTP error responses. Normal production chunks contain
no E2E marker. Full and production-only npm audits report zero vulnerabilities;
the lockfile-only fix updates build-time PostCSS 8.5.15→8.5.26 and Nanoid
3.3.12→3.3.18 without changing a direct or production dependency. npm also
refreshed optional Tailwind WASI lock metadata; it does not add an application
runtime dependency.

## 10. Files changed and why

- Delivery: `.github/workflows/ci.yml`, `package.json`, `package-lock.json`,
  `tests/browser/delivery-smoke.spec.ts`.
- Shared app shell/system: `src/App.tsx`, `src/index.css`,
  `src/components/HowToPlay.tsx`, `Icon.tsx`, `DailyModeHeader.tsx`,
  `ChronoCard.tsx`, `Hand.tsx`, and `PlayBanner.tsx`.
- Mode composition: `src/SoloGame.tsx`, `ChronologyGame.tsx`,
  `ConnectionsGame.tsx`, and surgical layout work in `DuelGame.tsx`.
- Durable records: this report, requirements, design QA, release checklist,
  audit, delivery report, goal prompt, and `docs/master-plan.md`.

The unrelated untracked `docs/pool-expansion-goal-prompt.md` is preserved and
must be excluded from any production-polish commit.

## 11. Exact automated gates

- `npm ci` — pass.
- `npm audit` / `npm audit --omit=dev` — 0 vulnerabilities.
- `npm run build` — pass; 438 modules.
- `npm run check:bundle` — pass.
- `npm run verify` — 64 passed, 0 failed.
- `npm run verify:solo` — 8 passed, 0 failed.
- `npm run verify:chronology` — 42 passed, 0 failed.
- `npm run verify:connections` — 14 passed, 0 failed.
- `npm run test:smoke` — 14 passed, 0 failed.
- `git diff --check` — pass.
- `npm run audit:names` — correctly skipped because content was not touched.

## 12. Protected-contract confirmation

The final protected diff is empty for movie data, chronology pool, Connections
grids, Duel pool IDs, `sim/RULESET.md`, rule/scoring libraries, progress and
persistence logic, and share logic. There is no authorized or observed change
to rules, scoring, deals, difficulty, pools, baked grids, persistence keys,
analytics semantics, or URL-free share output. `noindex, nofollow` remains.

## 13. Attended and external-service docket

Before launch certification:

- Play the exact candidate on real iPhone Safari and Android Chrome, including
  orientation and safe-area behavior.
- Spot-check VoiceOver and TalkBack; run 200% zoom/text enlargement and
  instrumented contrast checks.
- Resolve or explicitly defer the Duel keyboard/tap score collision.
- Push only after approval, then record a green five-job GitHub run and exact SHA.
- After separate deploy approval, verify production HTTP/assets, one complete
  interaction per changed mode, console/network state, `noindex`, URL-free
  share output, TMDB attribution, and rollback target.
- Exercise monitoring alert delivery, Web Vitals, analytics receipts, spend
  ceiling, rollback drill, privacy/retention language, and TMDB commercial-use
  decision before the public launch switch.
- Keep `noindex` removal, URL-in-share, and public front-door changes behind one
  separate explicit launch approval.

## 14. Publication proposal

If Buri approves the next gate, stage only the reviewed production-polish files
listed above, excluding `docs/pool-expansion-goal-prompt.md`; commit them on
`codex/daily-mode-polish`; push that branch; and wait for all five CI jobs. Do
not merge or deploy. A production deployment should require a second explicit
approval tied to the resulting green SHA.
