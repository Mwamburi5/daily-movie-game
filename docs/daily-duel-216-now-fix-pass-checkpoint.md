# Match Cut 216+16 — Now Fix Review checkpoint

Date: 2026-08-27  
Branch: `codex/daily-mode-polish`  
HEAD: `ce398376d0c03be5356d64000557817c2f0150c3`  
Status: local dirty candidate; unstaged, uncommitted, unpushed, undeployed, and unindexed

## 1. Executive verdict

**Proceed to the separate launch-readiness pass.** The four authorized Now items are resolved and the declared Node 24 matrix is green. This checkpoint is not launch approval: attended accessibility/device work, support/privacy/analytics decisions, exact-SHA CI, deployment, production verification, and indexing approval remain separate.

## 2. Verified before/after state

The pass started on the expected branch and SHA, one commit ahead of `origin/codex/daily-mode-polish`. The dirty baseline was 20 modified and 31 untracked paths. Its 20 modified paths exactly matched Appendix A of the full review; the review-era 27 untracked paths plus four later review/prompt documents were preserved.

After this checkpoint, the worktree has 23 modified and 32 untracked paths; the evidence directory is Git-ignored. The count delta is exactly the three newly modified tracked files (`src/App.tsx`, `src/components/Onboarding.tsx`, `src/index.css`) and this new untracked checkpoint. Five other tracked paths were already dirty and received scoped edits.

Exact paths changed by this pass:

```text
RULEBOOK.md
docs/daily-duel-216-now-fix-pass-checkpoint.md
docs/master-plan.md
src/App.tsx
src/DuelGame.tsx
src/components/HowToPlay.tsx
src/components/Onboarding.tsx
src/index.css
tests/browser/delivery-smoke.spec.ts
audit/daily-duel-216-now-fix-pass-2026-08-27/manifest.md
audit/daily-duel-216-now-fix-pass-2026-08-27/01-chronology-320x568-before-late-line.png
audit/daily-duel-216-now-fix-pass-2026-08-27/02-chronology-320x568-after-start.png
audit/daily-duel-216-now-fix-pass-2026-08-27/03-chronology-320x568-after-late-line.png
audit/daily-duel-216-now-fix-pass-2026-08-27/04-chronology-360x800-after-start.png
audit/daily-duel-216-now-fix-pass-2026-08-27/05-chronology-390x844-after-start.png
audit/daily-duel-216-now-fix-pass-2026-08-27/06-chronology-768x1024-after-start.png
audit/daily-duel-216-now-fix-pass-2026-08-27/07-chronology-1024x768-after-start.png
audit/daily-duel-216-now-fix-pass-2026-08-27/08-chronology-1440x900-after-start.png
audit/daily-duel-216-now-fix-pass-2026-08-27/09-chronology-200pct-emulated-720x450-css.png
audit/daily-duel-216-now-fix-pass-2026-08-27/10-onboarding-390x844-cpu-net.png
audit/daily-duel-216-now-fix-pass-2026-08-27/11-menu-390x844-duel-copy.png
audit/daily-duel-216-now-fix-pass-2026-08-27/12-duel-help-390x844-cpu-net-series.png
audit/daily-duel-216-now-fix-pass-2026-08-27/13-duel-result-390x844-cpu-net.png
audit/daily-duel-216-now-fix-pass-2026-08-27/14-daily-help-390x844-people-only.png
audit/daily-duel-216-now-fix-pass-2026-08-27/15-onboarding-320x568-cpu-net-stress.png
audit/daily-duel-216-now-fix-pass-2026-08-27/16-menu-320x568-duel-copy-stress.png
```

## 3. F01–F04 resolution

| finding | resolution | evidence | verdict |
|---|---|---|---|
| MC216-F01 | Replaced random preconditions with four real-card, `VITE_E2E`-only states for no-helper, Take-ready, ordinary draw, one-wild draw, and the existing multi-wild path. Tests still use real rule helpers and assert state transitions. | [manifest — deterministic browser receipt](../audit/daily-duel-216-now-fix-pass-2026-08-27/manifest.md#deterministic-browser-receipt); targeted 6/6 and 60/60; full 31/31 twice; no marker in normal `dist` | resolved |
| MC216-F02 | Kept `DailyModeHeader`; under `max-width:340px`, only Chronology's title becomes 18 px. No score/control/text hiding. The visual review also added a 340 px difficulty-label fit so the required menu stress evidence is unclipped. | [before](../audit/daily-duel-216-now-fix-pass-2026-08-27/01-chronology-320x568-before-late-line.png), [320 late after](../audit/daily-duel-216-now-fix-pass-2026-08-27/03-chronology-320x568-after-late-line.png), [matrix](../audit/daily-duel-216-now-fix-pass-2026-08-27/manifest.md#evidence-index) | resolved |
| MC216-F03 | CPU is canonical on current UI/accessibility surfaces. Menu/onboarding use the exact 20/net promise; Help and result arithmetic agree. | [onboarding](../audit/daily-duel-216-now-fix-pass-2026-08-27/10-onboarding-390x844-cpu-net.png), [menu](../audit/daily-duel-216-now-fix-pass-2026-08-27/11-menu-390x844-duel-copy.png), [result](../audit/daily-duel-216-now-fix-pass-2026-08-27/13-duel-result-390x844-cpu-net.png) | resolved |
| MC216-F04, copy portion | Daily now teaches actor/director/writer links only. Duel teaches person-gated ordinary play; series upgrades an otherwise legal link and can support a Meld. A synthetic test proves series-only fails `legalPlays`, while a three-card series Meld is valid. | [Daily Help](../audit/daily-duel-216-now-fix-pass-2026-08-27/14-daily-help-390x844-people-only.png), [Duel Help](../audit/daily-duel-216-now-fix-pass-2026-08-27/12-duel-help-390x844-cpu-net-series.png), 31/31 browser gate | resolved without rule change |

## 4. Locked wording

- Opponent identity: **CPU**.
- Primary Duel promise: **“Reaching 20 ends the show; highest net score wins.”**
- Daily ordinary play: movies share an actor, director, or writer.
- Duel ordinary play: the hand card shares an actor, director, or writer with either marquee.
- Duel series role: series upgrades an otherwise legal person-linked play and can support a Meld; series alone does not make an ordinary marquee play legal.

Current string edits:

- App Duel card: `Take turns scoring links. Race to 20 — high score wins.` → the exact locked promise.
- Onboarding Duel heading: `Duel: head-to-head against the computer. Race to 20.` → the exact locked promise.
- Onboarding scoreboard/accessibility: `Taz` → `CPU`; `Race to 20` → `Ends at 20`; accessible description now says CPU and explains the end trigger/net winner.
- Daily Help: `valid credit` → explicit actor/director/writer.
- Duel Help: objective, ordinary-play instruction, finish/net paragraph, series paragraph, and draw/wild wording now match the runtime helpers.
- Overview Help: Duel summary now uses the exact locked promise.
- `RULEBOOK.md`: all-mode link summary, Duel intro/step three, super-link row, Link glossary, and historical Flow label now describe the current distinction without changing history or rules.

Intentionally retained `Taz` references cannot reach current players: the internal `TazCorner` component/import, `tazDisplay` variable, source comments, dev-only preview names/data, historical `docs/master-plan.md` ledger text, frozen `docs/ui-contracts.md`, and bannered historical `orchestration-plan.md` / `ui-tasks.md`. The browser assertion that current onboarding does *not* contain `Taz` is also intentionally retained.

## 5. Screenshot matrix

All 16 files in the [evidence manifest](../audit/daily-duel-216-now-fix-pass-2026-08-27/manifest.md#evidence-index) were opened.

- 320x568: before collision confirmed; start and 8/11 late-line after states clean. Back and Help remain named and operable; measured effective targets are at least 44 px; no horizontal overflow.
- 360x800 and 390x844: title, `STROKES`, Daily identity, Back, and Help remain separate.
- 768x1024, 1024x768, and 1440x900: header composition is unchanged by the 340 px-only fix and remains separate. Screenshot 07 also records a pre-existing non-header issue: at 1024x768 the centered placement instruction contacts the middle choice ticket. It is not a regression from this pass and belongs in the next visual sweep.
- Automated 200% emulation: the top-of-page header reflows without overlap or hidden essential text. This is automated evidence, not attended low-vision acceptance.
- 390 product-language set: menu, onboarding, settled Help, and true result state are readable and consistent.
- 320 stress set: onboarding remains fully visible; the menu promise wraps cleanly and all three difficulty labels fit after the scoped selector adjustment.

## 6. Node 24 command matrix

Runtime: Node `v24.14.0`, npm `11.9.0`. Every command used `/usr/local/bin` first on `PATH`.

| command | exact result | duration |
|---|---|---:|
| `node --version` | `v24.14.0` | <1 s |
| `npm --version` | `11.9.0` | <1 s |
| `npm run build` | PASS, 441 modules | 1.9 s |
| `npm run check:bundle` | PASS, menu 97.81 KiB gzip JS; every mode within budget | 0.03 s |
| `npm run check:security` | PASS, final recheck 229 repository / 26 production files (228/26 before this checkpoint) | 0.03 s |
| `npm run verify` | 64 passed, 0 failed | ~135 s |
| `npm run verify:solo` | 8 passed, 0 failed | 0.14 s |
| `npm run verify:chronology` | 42 passed, 0 failed | <1 s |
| `npm run verify:connections` | 14 passed, 0 failed | ~267 s |
| targeted affected smoke | 6/6 | 8.3 s |
| targeted affected smoke `--repeat-each=10` | 60/60 | 19.8 s |
| targeted Chronology header | 1/1 | 11.0 s |
| first full `npm run test:smoke` attempt | 30/31; assertion expected plural while correct product text was singular | 44.2 s |
| focused Help retry | 1/1 | 10.9 s |
| full `npm run test:smoke`, release run 1 | 31/31 | 44.4 s |
| full `npm run test:smoke`, release run 2 | 31/31 | 44.0 s |
| `npm run eval -- tune 8000 --seed=200824 --assert` | PASS: Matinee 65.9%, Feature 50.3%, Director's Cut 41.4%; 0.0% stalemates | 45.8 s |
| normal `dist` marker search | no deterministic-fixture marker | <1 s |
| `git diff --check` | PASS; no output | <1 s |

Retries were diagnosed rather than waived. The first one-wild locator targeted enabled descendants, the header test initially measured the visible Help circle rather than its pseudo-element hit region and then saw transient Framer flight nodes, and the first full run used a plural test literal against correct singular UI copy. Every available failure screenshot/error context/trace was opened; the assertions now state the intended product contract.

## 7. Boundary audit

| boundary | result |
|---|---|
| legality/scoring/deals/seeds | unchanged; focused synthetic tests characterize the existing helpers |
| movie/wild/Chronology/Connections data | unchanged; no TMDB call or rebake |
| difficulty/tuning | no values changed; the shipped tune was re-run only |
| persistence | unchanged; no production localStorage behavior added |
| sharing | unchanged; no payload/copy edit |
| support/privacy/analytics | unchanged; no route, policy, event, or analytics send added |
| dependencies | no install or upgrade; existing locked runtime only |
| publication | no stage, commit, push, PR, merge, deploy, account/config change, or `noindex` change |

## 8. Items for the second prompt

- Owner-approved support destination and response ownership.
- Owner-approved analytics purpose, event scope, retention, disclosure, and consent before implementation.
- Attended 200% zoom/text enlargement, real iPhone/Android, VoiceOver, TalkBack, motion/focus, and current Safari/WebKit receipts. The automated screenshot here does not replace them.
- Visual review of the pre-existing 1024x768 Chronology placement-instruction/ticket contact recorded in screenshot 07.
- Security receipt-count reconciliation: the review saw 225/25; this pass saw 228/26 before the new checkpoint and 229/26 after it, with both checks green.
- Clean exact-SHA staging/commit/CI, protected Preview, deployment, production asset/SHA/mode/CSP/monitoring/rollback verification, and an independently approved indexing change.

## 9. Proposed exact-path staging list — not executed

```text
RULEBOOK.md
docs/daily-duel-216-now-fix-pass-checkpoint.md
docs/master-plan.md
src/App.tsx
src/DuelGame.tsx
src/components/HowToPlay.tsx
src/components/Onboarding.tsx
src/index.css
tests/browser/delivery-smoke.spec.ts
audit/daily-duel-216-now-fix-pass-2026-08-27/manifest.md
audit/daily-duel-216-now-fix-pass-2026-08-27/01-chronology-320x568-before-late-line.png
audit/daily-duel-216-now-fix-pass-2026-08-27/02-chronology-320x568-after-start.png
audit/daily-duel-216-now-fix-pass-2026-08-27/03-chronology-320x568-after-late-line.png
audit/daily-duel-216-now-fix-pass-2026-08-27/04-chronology-360x800-after-start.png
audit/daily-duel-216-now-fix-pass-2026-08-27/05-chronology-390x844-after-start.png
audit/daily-duel-216-now-fix-pass-2026-08-27/06-chronology-768x1024-after-start.png
audit/daily-duel-216-now-fix-pass-2026-08-27/07-chronology-1024x768-after-start.png
audit/daily-duel-216-now-fix-pass-2026-08-27/08-chronology-1440x900-after-start.png
audit/daily-duel-216-now-fix-pass-2026-08-27/09-chronology-200pct-emulated-720x450-css.png
audit/daily-duel-216-now-fix-pass-2026-08-27/10-onboarding-390x844-cpu-net.png
audit/daily-duel-216-now-fix-pass-2026-08-27/11-menu-390x844-duel-copy.png
audit/daily-duel-216-now-fix-pass-2026-08-27/12-duel-help-390x844-cpu-net-series.png
audit/daily-duel-216-now-fix-pass-2026-08-27/13-duel-result-390x844-cpu-net.png
audit/daily-duel-216-now-fix-pass-2026-08-27/14-daily-help-390x844-people-only.png
audit/daily-duel-216-now-fix-pass-2026-08-27/15-onboarding-320x568-cpu-net-stress.png
audit/daily-duel-216-now-fix-pass-2026-08-27/16-menu-320x568-duel-copy-stress.png
```

The audit directory is ignored and would require an explicit force-add decision. Several tracked paths were already dirty with the approved 216+16 candidate, so a future staging pass must review their combined diffs; path-only staging must not be treated as proof that every hunk originated here.

## 10. Stop confirmation

No dependency install/upgrade, TMDB call, source-data rebake, stage, commit, amend, push, PR, merge, deploy, indexing change, analytics send, or other external mutation occurred. Work stops here at **Now Fix Review**.
