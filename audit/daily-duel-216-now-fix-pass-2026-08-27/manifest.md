# Match Cut 216+16 Now fix pass — evidence manifest

Fix-pass date: 2026-08-27  
Candidate: `codex/daily-mode-polish` at `ce398376d0c03be5356d64000557817c2f0150c3`, plus the deliberately dirty 216+16 worktree  
Runtime gate: installed Node `v24.14.0`, npm `11.9.0`  
Evidence rule: browser screenshots and automated receipts prove only this local candidate. Browser-emulated 200% enlargement is not attended low-vision acceptance.

## Goal 0 — safe baseline

- Upstream: `origin/codex/daily-mode-polish`; `HEAD...upstream` = 1 ahead, 0 behind.
- Five recent commits: `ce39837`, `31bc25f`, `c063f26`, `5316b04`, `a710fff`.
- Dirty baseline: 20 modified paths and 31 untracked paths.
- The 20 modified paths exactly match Appendix A of `docs/daily-duel-216-full-review-report.md`.
- The review-era 27 untracked paths remain present. Four later untracked review/prompt documents were also preserved. This audit directory is ignored by Git.
- Default shell runtime remains Node `v22.23.2` / npm `10.9.8`; an already-installed declared runtime is available at `/usr/local/bin/node` (`v24.14.0`) with npm `11.9.0`. Every release gate in this pass put `/usr/local/bin` first on `PATH`.
- No source path had changed after the review. Later prompt/report documents were not absorbed into source work.

## Evidence index

| file | goal | state | viewport | input/fixture | evidence tier | verdict |
|---|---|---|---|---|---|---|
| `01-chronology-320x568-before-late-line.png` | Goal 2 | before, 8/11 placed | 320x568 | direct keyboard title/gap play | fresh local screenshot | fail: `Chronology` collides with `STROKES` |
| `02-chronology-320x568-after-start.png` | Goal 2 | after, start | 320x568 | direct mode entry | fresh local screenshot | pass: 49.3 px title/counter gap; no horizontal overflow |
| `03-chronology-320x568-after-late-line.png` | Goal 2 | after, 8/11 and −2 | 320x568 | seven clean keyboard placements | fresh local screenshot | pass: 16.3 px title/counter gap; score meaning retained |
| `04-chronology-360x800-after-start.png` | Goal 2 | after, start | 360x800 | direct mode entry | fresh local screenshot | pass: 20.9 px header gap; controls present |
| `05-chronology-390x844-after-start.png` | Goal 2 | after, start | 390x844 | direct mode entry | fresh local screenshot | pass: 50.9 px header gap; controls present |
| `06-chronology-768x1024-after-start.png` | Goal 2 | after, start | 768x1024 | direct mode entry | fresh local screenshot | pass: header unchanged and separate |
| `07-chronology-1024x768-after-start.png` | Goal 2 | after, start | 1024x768 | direct mode entry | fresh local screenshot | header pass; pre-existing non-header instruction/ticket contact noted for the next visual sweep |
| `08-chronology-1440x900-after-start.png` | Goal 2 | after, start | 1440x900 | direct mode entry | fresh local screenshot | pass: desktop header composition preserved |
| `09-chronology-200pct-emulated-720x450-css.png` | Goal 2 | after, start | 720x450 CSS at emulated 200% | browser CSS zoom, top of page | automated screenshot | pass for automated reflow only; not attended acceptance |
| `10-onboarding-390x844-cpu-net.png` | Goal 3 | after, Duel intro | 390x844 | first-run onboarding | fresh local screenshot | pass: CPU and exact 20/net sentence, no clipping |
| `11-menu-390x844-duel-copy.png` | Goal 3 | after, menu | 390x844 | menu scroll | fresh local screenshot | pass: exact 20/net sentence wraps cleanly |
| `12-duel-help-390x844-cpu-net-series.png` | Goal 3 | after, Help | 390x844 | Duel Help, settled transition | fresh local screenshot | pass: person-gated play, series role, exact finish promise |
| `13-duel-result-390x844-cpu-net.png` | Goal 3 | after, terminal | 390x844 | E2E terminal seam, real result dialog | fresh local screenshot | pass: CPU; 20 ends show; held-card net 13 vs −7 is explicit |
| `14-daily-help-390x844-people-only.png` | Goal 3 | after, Help | 390x844 | Daily Help, settled transition | fresh local screenshot | pass: actor/director/writer only; no series claim |
| `15-onboarding-320x568-cpu-net-stress.png` | Goal 3 | after, Duel intro | 320x568 | first-run onboarding | fresh local screenshot | pass: essential copy, CPU, and CTA remain visible |
| `16-menu-320x568-duel-copy-stress.png` | Goal 3 | after, menu | 320x568 | menu scroll | fresh local screenshot | pass after 340 px selector fit: exact promise and all difficulty labels readable |

Every PNG in this manifest was opened and visually inspected. Two early Help/result captures were rejected because they were mid-transition or not truly terminal; files 12–14 above are the corrected, settled replacements.

## Deterministic-browser receipt

- Added four real-card, state-specific fixtures behind `VITE_E2E`: `ordinary-draw`, `one-wild-draw`, `multi-wild-draw`, and `take-ready`.
- The no-helper fixture proves the generic cue is visible/static in reduced motion and Enter still opens ordinary Draw 3 without a transform transition.
- The Take-ready fixture proves the contextual helper intentionally suppresses the generic cue, remains enabled, and moves the real top card into hand.
- Ordinary Draw 3 proves three distinct choices, a one-card keep, hand 7→8, and deck 216→213.
- One-wild Draw 3 proves the conservation copy, exactly one enabled wild, hand 7→8, and deck 216→213.
- Multi-wild Draw 3 retains the existing conservation proof: three enabled wilds, hand 7→10, deck 216→213.
- The fixtures call the real card/rule helpers. No legality, scoring, draw, deal, or animation assertion was removed or broadened to accept unrelated random outcomes.
- `rg` over the normal `dist` found no fixture marker or `E2EDuelFixture` string (expected exit 1 for no matches).

Target command:

```sh
env PATH="/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin" npx playwright test tests/browser/delivery-smoke.spec.ts --grep "Duel draws|Duel keeps one deterministic wild|Duel keeps every wild|first-run onboarding|reduced-motion"
```

Result: 6/6 in 8.3 s. With `--repeat-each=10`: 60/60 in 19.8 s (each of the six passed ten times).

Diagnosed retries:

- The first focused one-wild assertion searched enabled descendants instead of enabled choice buttons; the failure screenshot was opened and the selector was narrowed to `[data-draw-choice]:enabled`.
- The Chronology test first measured the 32 px visible Help glyph instead of its 44 px `::after` hit region, then read transient Framer flight nodes before unmount. Both screenshots were opened; the final check measures the real hit target and waits 180 ms before reading the next line state. Final targeted header result: 1/1 in 11.0 s.

## Node 24 command receipts

All commands ran from the repository root with `PATH=/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin`.

| command | result | duration | evidence tier |
|---|---|---:|---|
| `node --version` | `v24.14.0` | <1 s | local runtime |
| `npm --version` | `11.9.0` | <1 s | local runtime |
| `npm run build` | PASS; 441 modules | 1.9 s | local production build |
| `npm run check:bundle` | PASS; menu 97.81 KiB gzip JS; all mode budgets pass | 0.03 s | static local gate |
| `npm run check:security` | PASS; final recheck 229 repository / 26 production files (228/26 before the new checkpoint) | 0.03 s | static local gate |
| `npm run verify` | 64/64 | ~135 s | deterministic simulation |
| `npm run verify:solo` | 8/8 | 0.14 s | deterministic simulation |
| `npm run verify:chronology` | 42/42 | <1 s | deterministic simulation |
| `npm run verify:connections` | 14/14 | ~267 s | deterministic 365-day simulation |
| `npm run test:smoke` | 30/31; new test literal expected plural but product correctly used singular | 44.2 s | diagnosed browser retry |
| focused Help retry | 1/1 | 10.9 s | browser diagnosis |
| `npm run test:smoke` | 31/31 | 44.4 s | full local browser gate 1 |
| `npm run test:smoke` | 31/31 | 44.0 s | full local browser gate 2 |
| `npm run eval -- tune 8000 --seed=200824 --assert` | PASS; 65.9 / 50.3 / 41.4%; 0.0% stalemates | 45.8 s | shipped live-flow simulation |
| normal-dist marker search | no E2E fixture markers | <1 s | production containment |
| `git diff --check` | PASS; no output | <1 s | local diff hygiene |

The first full-smoke failure screenshot, error context, and trace archive were opened. The product text was `share an actor, director, or writer`; only the assertion's plural literal was corrected. The two subsequent full runs are the release receipt.

## Boundary log

No dependency install/upgrade, TMDB call, rebake, source-data change, gameplay-rule change, scoring change, difficulty change, production-persistence change, share-payload change, analytics send, staging, commit, push, PR, merge, deployment, indexing change, or other external mutation occurred.
