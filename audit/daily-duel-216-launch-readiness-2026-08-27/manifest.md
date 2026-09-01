# Match Cut 216+16 launch-readiness — evidence manifest

Pass opened: 2026-08-28  
Candidate: `codex/daily-mode-polish` at `ce398376d0c03be5356d64000557817c2f0150c3`, plus the deliberately dirty 216+16 worktree  
Upstream: `origin/codex/daily-mode-polish`; 1 ahead, 0 behind  
Declared gate runtime: `/usr/local/bin/node` `v24.14.0`, npm `11.9.0`  
Default shell runtime: `/Users/mwamburi/.local/bin/node` `v22.23.2`, npm `10.9.8`  
Evidence rule: local automation, browser observation, attended checks, source-control state, deployment, production, and indexing are independent tiers. No lower tier closes a higher one.

## Goal 0 — accepted baseline

`docs/daily-duel-216-now-fix-pass-checkpoint.md` explicitly says **Proceed to the separate launch-readiness pass**. Its accepted Node 24 receipt records:

- the six affected deterministic browser targets at 6/6 and 60/60 with `--repeat-each=10`;
- full smoke at 31/31 twice after one diagnosed copy-literal retry;
- green 320x568, 360x800, and 390x844 Chronology header evidence;
- CPU on current player-facing/accessibility surfaces and the exact sentence `Reaching 20 ends the show; highest net score wins.`;
- Daily actor/director/writer links only, with Duel series behavior matching the existing person-gated helper; and
- no deterministic E2E fixture marker in the normal production bundle.

The current branch, HEAD, upstream, installed Node 24 runtime, locked player-facing strings, and exact dirty-file counts still match that checkpoint. The apparent default `git status --short` count of 29 untracked entries collapses `tools/daily-duel-pool-picker/` to one directory; `git status --short --untracked-files=all` confirms the checkpoint's 32 exact untracked files.

Five recent commits:

```text
ce39837 Polish first-run onboarding and menu follow-through
31bc25f Complete Goal 5 public-launch acceptance candidate
c063f26 Complete Goals 2-4 polish and security hardening
5316b04 Complete production polish release candidate
a710fff Add Wave 3 movie pool expansion
```

### Exact dirty baseline at this pass entry

- 23 modified tracked paths.
- 32 exact untracked files.
- 55 total dirty file paths.
- Audit directories are ignored by Git and are counted separately in the evidence/staging manifest.

Pre-review 216+16 candidate modified paths (20):

```text
RULEBOOK.md
docs/master-plan.md
docs/name-audit.md
sim/RULESET.md
sim/connections-verify.ts
sim/duel-sim.ts
sim/solo-verify.ts
sim/verify.ts
src/DuelGame.tsx
src/SoloGame.tsx
src/components/DrawChoice.tsx
src/components/HowToPlay.tsx
src/data/connections-grids.json
src/data/duelPool.ts
src/data/movies.ts
src/devAssertions.ts
src/lib/difficulty.ts
src/lib/duel.ts
src/lib/solver.ts
tests/browser/delivery-smoke.spec.ts
```

Now-pass additions to the modified tracked set (3):

```text
src/App.tsx
src/components/Onboarding.tsx
src/index.css
```

Now-pass edits also overlap five already-dirty candidate paths: `RULEBOOK.md`, `docs/master-plan.md`, `src/DuelGame.tsx`, `src/components/HowToPlay.tsx`, and `tests/browser/delivery-smoke.spec.ts`. Path membership does not prove hunk ownership; the later staging proposal must review the combined diff.

The exact 32 untracked files at entry are the 27-file review-era set plus the four later review/prompt documents and the accepted Now checkpoint. They are preserved unchanged by this baseline. This pass begins with only this ignored audit manifest as a new path.

## Evidence index

| file | goal | mode/state | viewport/device/AT | exact build identity | evidence tier | verdict | blocker |
|---|---|---|---|---|---|---|---|
| `manifest.md` | Goal 0 | accepted Now-pass baseline | repository / Node 24 availability | HEAD `ce398376d0c03be5356d64000557817c2f0150c3` + 55 dirty file paths | source-control and documentary receipt | PASS | none |
| `output/playwright/launch-readiness/support-privacy-*.png` | Goal 1 | overview Help, disclosure expanded | 320x568, 360x800, 390x844, 1024x768 Chromium | Node 24 E2E build from dirty candidate | automated real-browser screenshot, opened and inspected | PASS | none |

## Boundary log

No dependency install/upgrade, TMDB call, data rebake, stage, commit, amend, push, PR, merge, deploy, production analytics query, GitHub/Vercel setting change, or indexing change occurred in Goal 0.

## Goal 1 — interim support and privacy disclosure

Verdict: **PASS (local candidate)**.

- Shared Help now exposes one public GitHub support route from overview and all four modes.
- The UI states that GitHub sign-in is required, reports are public, and personal information must not be included.
- The link uses the exact approved chooser URL, announces that it opens a new tab, and carries `target="_blank"` plus `rel="noreferrer noopener"`.
- Three local issue templates exist for bad movie data, accessibility trouble, and broken game. They use no labels and request only mode/screen, visible problem, expectation, reproduction steps where relevant, broad browser/device category, and an optional privacy-checked screenshot.
- The disclosure distinguishes local progress storage from anonymous Vercel page/journey analytics, names the provider context, states the excluded data, explains the cookieless daily session reset, and does not promise a retention period Vercel does not guarantee.
- Live read-only checks confirmed that the repository is public with Issues enabled and that a signed-out request to the chooser redirects to GitHub sign-in. No external GitHub state was changed.

Privacy wording was checked against Vercel's current official Web Analytics privacy, custom-events, and limits/reporting-window documentation on 2026-08-28. A separate Goal 2 decision record will retain the current Vercel custom-property-plan discrepancy instead of hiding it.

Node 24 gates:

```text
npm run build                                                        PASS
npm run test:smoke -- --grep "public support|overview help|each mode opens"  4/4 PASS
CAPTURE_LAUNCH_EVIDENCE=1 npm run test:smoke -- --grep "public support"       1/1 PASS
git diff --check                                                    PASS
```

All four PNGs were opened and visually inspected. The support card, public/sign-in warning, primary link, focused disclosure summary, privacy copy, close control, and fixed primary return action remain readable without horizontal clipping at every captured width.

Goal 1 added only:

```text
.github/ISSUE_TEMPLATE/accessibility-trouble.md
.github/ISSUE_TEMPLATE/bad-movie-data.md
.github/ISSUE_TEMPLATE/broken-game.md
```

It also made surgical launch-readiness edits to the already-dirty `src/components/HowToPlay.tsx` and `tests/browser/delivery-smoke.spec.ts` paths.

No stage, commit, push, PR, merge, deploy, production analytics query, GitHub/Vercel setting mutation, or indexing change occurred in Goal 1.

## Goal 2 — minimal privacy-safe journey analytics

Verdict: **PASS (local implementation and queue evidence)**, with one **publication-time provider-plan confirmation** still open.

The central runtime contract in `src/lib/analytics.ts` accepts only exact keys, flat primitives, fixed event/action/friction enums, bounded integer score fields, and the capped `1|2|3|4+` ordinal/count buckets. Unknown event names, extra properties, cross-mode enum values, free text, movie/seed fields, nested localStorage-like data, and implausible numbers are rejected before `window.va` is called.

| event | local call-site boundary | dedupe owner |
|---|---|---|
| `mode_start` | mode mount; replay reuses its entry ordinal | `JourneyAnalytics.startEntry()` StrictMode guard; replay resets round only |
| `mode_finish` | existing terminal status effect in each mode | existing terminal status transition |
| `share` | successful clipboard copy only | existing result click resolution |
| `first_action` | mode action cores after their existing guards | in-memory once per round |
| `help_open` | explicit overview/mode Help buttons | once per explicit open |
| `help_return` | first action after a mode Help close | armed on close, consumed once |
| `friction` | Solo invalid play; Chronology misfire; Connections repeat/one-away/miss; Duel invalid play/no-play draw | once per resulting transition; per-round bounded bucket |
| `share_attempt` | clipboard promise/fallback resolution | once per click resolution |
| `replay` | explicit result/restart/deal-again action | once per click |

Call-site identity is limited to Daily/practice kind or Duel difficulty. `share_attempt` deliberately omits clipboard contents; `help_open`/`help_return` omit Help text; `friction` omits cards, movies, people, board, errors, and seed. No analytics code reads localStorage, writes a persistent ID, adds a timestamp, creates a drain/export, or loads a new dependency.

The only test-specific addition is the minimal `VITE_E2E` `no-play-draw` Duel state, made from real pool cards and existing helpers so the actual no-play transition is deterministic. The normal Node 24 build erases its marker. There is no analytics test seam in the production source or bundle.

Node 24 gates:

```text
npm run verify:analytics                                                       PASS
  12 valid contracts; 14 forbidden payloads; exact-once/replay/Help/buckets   PASS
npm run build                                                                  PASS
normal dist scan for no-play fixture or analytics E2E seam                    PASS
npm run test:smoke -- --grep "privacy-safe journey analytics|analytics friction"  2/2 PASS
git diff --check                                                               PASS
```

The real-browser queue receipt proves StrictMode entry dedupe, first-action dedupe, Help arm/consume, one terminal event, copied vs manual-fallback share behavior, replay with retained ordinal, a second menu entry with the next ordinal, all four modes' actual friction paths, gameplay survival under a throwing collector, and no localhost `/_vercel/insights/` request.

Provider-plan discrepancy retained for publication review: Vercel's current custom-events documentation permits flat properties but its current limits page documents plan-specific property caps; the approved `mode_start`, `first_action`, and `friction` dictionaries can contain three app-supplied properties. Local validation and queueing are proven, but the deployed project's plan/dashboard handling of the third property has not been queried or mutated in this local pass. Confirm it before treating all third properties as production-reportable; do not redesign the approved dictionary silently.

Goal 2 added:

```text
scripts/verify-analytics.ts
src/lib/journeyAnalytics.ts
```

It edited `package.json`, `src/lib/analytics.ts`, `src/components/ShareCopy.tsx`, `src/components/Results.tsx`, the four mode components, `src/App.tsx`, and `tests/browser/delivery-smoke.spec.ts`. Most game/UI paths were already dirty at entry; the final exact-path review must inspect combined hunks.

No production events, external collector requests, analytics dashboard queries, drain/export, stage, commit, push, PR, merge, deploy, provider-setting mutation, or indexing change occurred in Goal 2.

## Goal 3 — progress meta-state hardening

Verdict: **PASS (local implementation, pure verifier, and rendered receipt)**.

`sanitizeProgress()` now applies this conservative v1 policy independently to each nested record:

- a non-object root or wrong version resets the whole blob;
- missing/corrupt Solo, Chronology, Connections, or individual Duel difficulty records reset only that record;
- missing Connections retains the prior additive-v1 migration behavior;
- seeds must be real `YYYY-MM-DD` calendar dates from year 2000 onward; an invalid/missing seed resets that mode's `lastSeed` and streak but does not erase an otherwise valid best;
- a mode with a valid completed seed gets a streak clamped to `1..36,525`; fresh/invalid-seed modes get `0`;
- integer bests clamp to conservative display ranges: Solo `-100..1000`, Chronology `-10..100`, Connections `0..3`; wrong/non-finite values reset to `null`;
- Duel plays clamp to `0..1,000,000`; wins clamp to `0..plays` per difficulty;
- only real booleans preserve the onboarding/drag/retired-intro flags, and only a known difficulty preserves the menu default; and
- a valid current v1 object, including the retired optional `seenIntro`, round-trips unchanged.

Storage read, JSON parse, and write failures still degrade to fresh/no-write meta-state without interrupting gameplay.

Node 24 gates:

```text
npm run verify:progress                                               PASS
  malformed JSON/root/version/nested types/bounds/additive/round-trip PASS
  throwing getItem/setItem isolation                                  PASS
npm run build                                                         PASS
CAPTURE_LAUNCH_EVIDENCE=1 npm run test:smoke -- --grep "malformed progress"  1/1 PASS
git diff --check                                                      PASS
```

The inspected `progress-sanitized-menu-390x844.png` receipt shows the valid Solo streak preserved, corrupt Chronology cleared, negative Connections streak repaired to 1, impossible Duel `8 wins / 3 plays` repaired to `3/3`, and invalid last difficulty falling back to Matinee. A follow-up malformed-JSON reload reached first-run onboarding and then the clean menu without a crash or stale chips.

Rule/deal isolation proof: `src/lib/daily.ts`, `solver.ts`, `duel.ts`, `chronology.ts`, `connections.ts`, `difficulty.ts`, and every `sim/` source have no progress/localStorage import or read. Consumers remain the menu, result/meta displays, finish recorders, onboarding/nudge gates, and the existing development assertion. App's stored difficulty is only an initial menu selection that flows through the same prop as a player chip tap; the difficulty helper itself does not read storage.

Goal 3 added `scripts/verify-progress.ts`, edited `src/lib/progress.ts`, added `verify:progress` to `package.json`, and extended the already-dirty browser smoke file. It did not change rules, scoring, deals, solvers, seeds, pools, or difficulty knobs.

No stage, commit, push, PR, merge, deploy, external mutation, or indexing change occurred in Goal 3.

---

# Resume 2026-08-31 — Goals R0 and 4–8

Resumed under `docs/daily-duel-216-launch-readiness-resume-goal-prompt.md` (amended 2026-08-31). The Goal 0–3 receipts above stand untouched; everything below is appended.

## Goal R0 — re-baseline the mid-flight candidate

Verdict: **PASS**.

- Branch `codex/daily-mode-polish`; HEAD `ce398376d0c03be5356d64000557817c2f0150c3`; upstream `origin/codex/daily-mode-polish` 1 ahead / 0 behind; nothing staged.
- Declared gate runtime: `/usr/local/bin/node` `v24.14.0`, npm `11.9.0`. Default shell runtime: `v22.23.2` (unchanged from the pass header).
- Five recent commits unchanged from the Goal 0 record (`ce39837`, `31bc25f`, `c063f26`, `5316b04`, `a710fff`).

### Dirty baseline, grouped four ways (73 paths total: 30 modified + 43 untracked)

1. **Pre-review 216+16 candidate** — the 20 modified paths itemized in Goal 0 plus the 27-file review-era untracked set and the four later review/prompt documents.
2. **Now-pass** — modified additions `src/App.tsx`, `src/components/Onboarding.tsx`, `src/index.css`; untracked `docs/daily-duel-216-now-fix-pass-checkpoint.md` (plus overlap hunks on five already-dirty candidate paths per the Goal 0 note).
3. **Goal 1–3 launch-readiness** — modified edits `package.json`, `src/lib/analytics.ts`, `src/lib/progress.ts`, `src/components/Results.tsx`, `src/components/ShareCopy.tsx`, `src/ChronologyGame.tsx`, `src/ConnectionsGame.tsx` (plus overlap hunks on already-dirty paths); untracked additions `.github/ISSUE_TEMPLATE/accessibility-trouble.md`, `.github/ISSUE_TEMPLATE/bad-movie-data.md`, `.github/ISSUE_TEMPLATE/broken-game.md`, `scripts/verify-analytics.ts`, `scripts/verify-progress.ts`, `src/lib/journeyAnalytics.ts`.
4. **New since the manifest entry, outside this pass** — `docs/daily-duel-216-launch-readiness-resume-goal-prompt.md` (2026-08-30) and the four promo-exploration files `docs/promo-execution-prompts.md`, `promo/brand-sheet.md`, `promo/phase0-docs-checkpoint.md`, `promo/shot-list.md` (2026-08-31, preserved untouched, classified excluded). This resume session has added no repository path as of R0.

`git status --short --untracked-files=all` reconciles to exactly these 73 paths; no tracked file has a modification date after 2026-08-28.

### Precondition gate outputs (2026-08-31, Node v24.14.0)

```text
npm run verify:analytics
  analytics verifier: 12 valid contracts, 14 forbidden payloads, exact-once journey gates PASS
npm run verify:progress
  progress verifier: malformed, version, nested type, bounds, additive v1, round-trip, and storage isolation PASS
npm run build                                                          PASS (vite 1.13s, tsc clean)
normal dist scan: VITE_E2E / no-play fixture / analytics seam markers  none found; 0 source maps
npm run test:smoke -- --grep "public support|overview help|each mode opens"       4/4 PASS (19.5s)
npm run test:smoke -- --grep "privacy-safe journey analytics|analytics friction"  2/2 PASS (10.0s)
npm run test:smoke -- --grep "malformed progress"                                 1/1 PASS (5.2s)
```

### Evidence rows

| file | goal | mode/state | viewport/device/AT | exact build identity | evidence tier | verdict | blocker |
|---|---|---|---|---|---|---|---|
| `manifest.md` (this section) | Goal R0 | resumed baseline re-verification | repository / Node 24 | HEAD `ce398376d0c03be5356d64000557817c2f0150c3` + 73 dirty file paths | source-control and documentary receipt | PASS | none |

No dependency install, TMDB call, rebake, stage, commit, amend, push, PR, merge, deploy, production analytics query, GitHub/Vercel setting change, or indexing change occurred in Goal R0.

## Goal 4 — Connections long-title legibility and the 1024x768 Chronology hint contact

Verdict: **PASS (both items measured; three confirmed defects fixed with smallest shared changes; backstop behaviors measured-accepted and documented)**.

### Corpus method

`title-fit-inventory.ts` (this directory) enumerates every title that can appear on a Connections tile — the union of all 365 baked grids over the 320-film pool — and re-runs the component's exact `tileFontSize` math: **315 unique titles**; shrink distribution 7px×9 · 8px×11 · 9px×22 · 10px×29 (the remaining 244 sit at the 10.5px ceiling). Analytical floor-breach scan: one width-floor breach (`BlacKkKlansman`, 14-char unbreakable word) and zero clamp-floor breaches. Grid density scoring named the capture boards: **grid 81 (daily 2026-09-25)** — four ≤8px tiles, four 39–45-char Harry Potter titles plus BlacKkKlansman — and **grid 325 (daily 2027-05-27)** — the 54-char Pirates title, the corpus's only ~5-line estimate. Output archived as `title-fit-inventory-output.txt`.

Live measurement: `goal4-measure.mjs` (archived here; playwright-core against the Node 24 E2E preview, local date pinned per board via an init-script Date shim) measured all 16 tiles per board at 320x568, 360x800, 390x844, 768x1024, and 1024x768 — computed font size, rendered line count, clamp truncation (`scrollHeight > clientHeight`), tile-height uniformity, badge/title intersection, and a 200 percent CSS-zoom pass — plus Chronology hint/ticket/tray rectangles at those five viewports and envelope probes 1280x800, 1024x700, 1024x690, 1440x900, in fresh, late-line (4 placements), card-raised, and `no-preference` motion states.

### Confirmed defects (before)

1. **5-line clamp truncation (hidden title text)** — seven real board/viewport instances: the 45-char Deathly Hallows – Part 2 plus 39/40-char Chamber/Azkaban at 360x800 and 390x844 (10–10.5px), and the 54-char Pirates title at 360x800, 390x844, **and 1024x768** (8–12px). Every instance had 18.9–50.4px of unused tile headroom — the clamp, not tile capacity, hid the text. This upgrades F12's "no clipping was confirmed": clipping is now confirmed and fixed.
2. **PICK-ordinal glyph collision** — at 320/360 (and 79px² box contact at 390) the amber `PICK n` interleaved directly with the title's first-line glyphs on 5–6-line tiles (opened capture: `PICK 1` over "PIRATES OF"), leaving both illegible at that corner.
3. **Chronology hint-on-tickets** — at 1024x768 only: the centered `Drag or tap a gap to place` hint (top `clamp(610px, 50%+200px, 710px)`, z-40) rendered 13.5px deep into all five top-row choice tickets with real glyph-box intersections (628–841px²) — occlusion-class, not contact-only; `pointer-events-none` so no interaction block. Identical in fresh/late-line/card-raised and under `no-preference` motion. Geometric envelope: ≥768px-wide viewports 721–802px tall (1280x800 grazed the tray box by 5.5px without ticket contact). All other probes clear; the ≤720px-height `top: 508px` rule and the mobile bottom-anchored rules never touch a ticket — measured no-change there.

Measured-accepted (no change, documented): `break-word` mid-word wraps on the floor-conflict set — `BlacKkKlansman` (every width; a 14-char word cannot fit the 53–69px content column at the 6.5–7px legibility floor), `Nightcrawler` at ≤360, `Unforgiven` at 360 (a fix would over-shrink it at 390+), and vw-boosted desktop `BlacKkKlansman` — the component comment's designed backstop; full titles remain in `aria-label` and the solved band.

### Fixes applied (smallest shared, inside the existing fit system)

- `src/ConnectionsGame.tsx`: tile `WebkitLineClamp` 5 → 6 (the ≤340px override already trusted 6) plus the fit-comment recalibration note; the ordinal badge gains a navy chip matching the selected tile face — invisible except where it prevents glyph interleaving. Accepted tradeoff: on 5–6-line tiles the chip covers the tail of line 1 while that tile is selected (full title one deselect away).
- `src/index.css`: the ≥768px hint rule becomes `top: min(clamp(610px, calc(50% + 200px), 710px), calc(100% - 202px))` — byte-identical rendering at every previously-clean height, capped just above the tray inside the defect envelope. Accepted tradeoff: at 721–802px heights the raised card now covers the centered hint while raised (previously the hint sat on the tickets in every state); idle-state readability — where screenshot 07 recorded the defect — is fully restored, and the gold gap highlight carries the operative affordance.

No rule, deal, data, scoring, seed, or difficulty change; no `DuelGame.tsx` edit.

### After (re-run of the same matrix)

Zero truncation across both boards × five viewports; max 6 rendered lines; tile heights uniform (<1px spread); badge inside tile bounds everywhere with no glyph interleaving (opened captures); desktop 200 percent CSS-zoom truncation now 0 at 768/1024 widths. Chronology: zero ticket and zero glyph-box overlap at all ten probe configurations in every state; hint visible and clear at 566–579.5 vs tray 586 at 1024x768. Full after-data archived as `goal4-measurements-after.json` (the before-run raw JSON was superseded in place by the re-run; its per-tile numbers are transcribed above and in the session log).

### 200 percent limitation

The automated 200 percent pass uses root CSS zoom, which under-scales the `1.2vw` mid-term relative to real browser zoom, overcounting phone-width truncation; real browser zoom re-resolves vw against the shrunken CSS viewport, so the 320/360/390 columns are the faithful reflow equivalents of 200 percent on 640–780px windows — and they are truncation-free. Attended readability (subjective legibility of 6.5–8px type, real zoom) remains a Goal 5 human lane.

### Durable regression tests

Three tests appended to `tests/browser/delivery-smoke.spec.ts`: `Connections long-title densest board …`, `Connections long-title longest-title board …` (per-viewport containment/uniformity/badge assertions, solved-band containment for the extreme group, evidence captures), and `Chronology placement hint clears the choice tickets at desktop heights` (fresh + card-raised clearance at 768x1024/1024x768/1280x800). Stability: 15/15 at `--repeat-each=5`.

Two test-harness flakes were diagnosed to root cause during this work, both Framer-Motion transient-DOM races against position-based locators, not product defects: (1) the new long-title measurement initially read rects during the font-swap-triggered layout animation (`document.fonts.ready` resolves before a lazily-fetched face starts loading) — fixed with an explicit `fonts.load('700 10px Domine')` barrier; (2) the pre-existing `placeChronologyChoiceClean` helper intermittently misfired under load (`Strokes 2 · −1` vs the expected clean `−2`) because `.first()`/`.nth()` re-resolve against exiting flight nodes — fixed with three settled-DOM barriers (unique line ids, id-pinned choice ticket, exact gap-button count). Post-fix: 30 consecutive mixed-batch runs clean (10 loops × `--repeat-each=3`); no expected count was changed anywhere.

### Evidence rows

| file | goal | mode/state | viewport/device/AT | exact build identity | evidence tier | verdict | blocker |
|---|---|---|---|---|---|---|---|
| `title-fit-inventory.ts` + `title-fit-inventory-output.txt` | Goal 4 | 315-title corpus inventory | static analysis / Node 24 | dirty candidate @ `ce39837` + Goal 4 edits | reproducible source-data analysis | PASS | none |
| `goal4-measure.mjs` + `goal4-measurements-after.json` | Goal 4 | both worst boards + chronology probes, all states | 5-viewport matrix + 4 envelope probes, Chromium | Node 24 E2E build of the fixed candidate | automated real-browser geometry measurement | PASS | none |
| `output/playwright/launch-readiness/long-title-2026-09-25-*.png` (5) | Goal 4 | densest board, extreme tile selected | 320x568…1024x768 Chromium | Node 24 E2E build, fixed candidate | automated real-browser screenshot, opened and inspected | PASS | none |
| `output/playwright/launch-readiness/long-title-2027-05-27-*.png` (5) | Goal 4 | longest-title board, extreme tile selected | 320x568…1024x768 Chromium | Node 24 E2E build, fixed candidate | automated real-browser screenshot, opened and inspected | PASS | none |
| `output/playwright/launch-readiness/chronology-hint-1024x768.png` | Goal 4 | daily, card raised | 1024x768 Chromium | Node 24 E2E build, fixed candidate | automated real-browser screenshot, opened and inspected | PASS | none |
| `audit/daily-duel-216-now-fix-pass-2026-08-27/07-chronology-1024x768-after-start.png` | Goal 4 | before-state reference | 1024x768 | Now-pass candidate | prior-pass screenshot, re-opened and re-inspected | defect confirmed → fixed | none |

No dependency install, TMDB call, rebake, stage, commit, amend, push, PR, merge, deploy, production analytics query, GitHub/Vercel setting change, or indexing change occurred in Goal 4.

## Goal 5 — accessibility and device acceptance

Verdict: **automated tiers 1–3 PASS on this candidate; attended lanes 4–8 honestly open** (no human tester or physical device present on 2026-08-31). Canonical lane matrix and continuation scripts: `docs/daily-duel-216-attended-acceptance.md` — the prior `docs/goal-5-public-launch-acceptance.md` receipts belong to the earlier candidate and were not reused.

- **Tier 1 — automated Chromium suite:** 10/10 PASS (28.4s, Node 24): malformed-progress menu, target-only click/Enter/Space exact-once, touch-play parity, first-run onboarding, compact overview help, support/privacy reachability at release widths, keyboard-only two-tone focus + named controls in every mode, both reduced-motion Duel cue tests, per-mode rules isolation.
- **Tier 2 — automated WebKit smoke:** installed `webkit-2336` (WebKit 26.5) drove all four modes on the E2E preview — real action → seam terminal → share copy `copied ✓` ×4, Duel's three draw options distinct, zero console/page/request faults. Runner archived as `goal5-webkit-smoke.mjs`; receipt `output/playwright/launch-readiness/webkit-smoke-receipt.json`.
- **Tier 3 — automated 200 percent:** 9/9 captures at the prior pass's convention (720×450 CSS viewport @ deviceScaleFactor 2 = 200 percent of 1440×900), zero horizontal overflow: menu, four mode initials, a terminal result, **help with the support card + expanded privacy disclosure (Goal 1 surface)**, **a sanitized menu rendered from a corrupt `matchcut:v1` blob (Goal 3 surface — root-invalid blob degrades to a clean fresh menu, no crash)**, and **the 2026-09-25 long-title board (Goal 4 surface)**. Runner archived as `goal5-zoom200.mjs`; receipt `zoom200-receipt.json`; `zoom200-help-support-privacy-1440x900.png` and `zoom200-sanitized-progress-menu-1440x900.png` opened and inspected.
- **Tiers 4–8 — attended Safari / iPhone Safari / Android Chrome / VoiceOver / TalkBack:** `ATTENDED NOT RUN`, each with a precise continuation script (A–E) covering the four-mode paths plus the new Goal 1/3/4 surfaces and the evidence-record schema. These are the pass's only remaining human blockers.

### Evidence rows

| file | goal | mode/state | viewport/device/AT | exact build identity | evidence tier | verdict | blocker |
|---|---|---|---|---|---|---|---|
| Goal 5 tier-1 suite output (session log) | Goal 5 | 10-test a11y set | 390x844 base + per-test matrices, Chromium | Node 24 E2E build of the fixed candidate | automated real-browser suite | PASS 10/10 | none |
| `goal5-webkit-smoke.mjs` + `output/playwright/launch-readiness/webkit-smoke-receipt.json` | Goal 5 | four-mode journey | 390x844, WebKit 26.5 | Node 24 E2E build of the fixed candidate | automated real-browser smoke (WebKit) | PASS 4/4, 0 faults | none |
| `goal5-zoom200.mjs` + `zoom200-*.png` (9) + `zoom200-receipt.json` | Goal 5 | menu/modes/result/help/sanitized/long-title | 720x450 @2x (200% of 1440x900), Chromium | Node 24 E2E build of the fixed candidate | automated 200% capture, two opened and inspected | PASS, 0 overflow | none |
| `docs/daily-duel-216-attended-acceptance.md` | Goal 5 | lane matrix + continuation scripts | tiers 4–8 named hardware | this candidate | documentary | ATTENDED NOT RUN ×5 | human + devices |

No dependency install, TMDB call, rebake, stage, commit, amend, push, PR, merge, deploy, production analytics query, GitHub/Vercel setting change, or indexing change occurred in Goal 5.

## Goal 6 — runtime identity and the security receipt chain

Verdict: **PASS — chain reconciled path-by-path; no classification omission; assertion contract untouched**.

Runtimes: declared gate runtime `/usr/local/bin/node` `v24.14.0` / npm `11.9.0` (every gate in this resume ran on it); default shell runtime `/Users/mwamburi/.local/bin/node` `v22.23.2` / npm `10.9.8` — both unchanged from the pass header.

Checker semantics (unchanged): repository count = `git ls-files --cached --others --exclude-standard` (tracked + untracked-not-ignored; the gitignored `audit/` and `output/` evidence trees are excluded by design and inventoried separately in the staging manifest); production count = every file under a freshly built normal `dist/`.

### Repository chain — exact path decomposition (tracked count 197 constant throughout; every step is untracked additions, dated by file mtime)

| step | count | +Δ | exact paths |
|---|---|---|---|
| full review | **225** | — | 197 tracked + the 28 untracked files with mtimes ≤ 2026-08-26 18:08 (the 27-file review-era set + `docs/daily-duel-216-full-review-goal-prompt.md`) |
| Now pass, first run | **228** | +3 | `docs/daily-duel-216-full-review-report.md` (08-27 11:28), `docs/daily-duel-216-now-fix-pass-goal-prompt.md` (12:18), `docs/daily-duel-216-launch-readiness-goal-prompt.md` (12:21) |
| Now pass, final recheck | **229** | +1 | `docs/daily-duel-216-now-fix-pass-checkpoint.md` (17:46) — the checkpoint counting itself, exactly as its wording records |
| current (2026-08-31) | **241** | +12 | Goal 1–3: `.github/ISSUE_TEMPLATE/accessibility-trouble.md`, `bad-movie-data.md`, `broken-game.md`, `scripts/verify-analytics.ts`, `src/lib/journeyAnalytics.ts`, `scripts/verify-progress.ts` (08-28); outside-pass: `docs/daily-duel-216-launch-readiness-resume-goal-prompt.md` (08-31), `docs/promo-execution-prompts.md`, `promo/brand-sheet.md`, `promo/phase0-docs-checkpoint.md`, `promo/shot-list.md` (08-31); this session: `docs/daily-duel-216-attended-acceptance.md` (08-31 22:35) |

Every step sums exactly; 197 + 44 = 241 confirmed against the live `git ls-files` output.

### Production chain (25 → 26 → 25)

The current normal build emits exactly **25 files**, fully enumerated in the session log (10 JS chunks — index, movies, SoloGame, ChronologyGame, ConnectionsGame, DuelGame, Hand, FixedDigits, DailyModeHeader, ResultMeaning — plus 1 CSS, `index.html`, `.vite/manifest.json`, 3 fonts, 3 webp illustrations, 5 icons/preview images, `tmdb-logo.svg`), all clean of source maps, E2E markers, and secret names, with the Vercel Analytics loader present. The full review also saw 25; the Now pass saw 26 twice. The transient 26th file's exact identity is **not reconstructable**: it was a build artifact of the Now-era dirty tree, and the Now-era content of the overlapping dirty sources was superseded in place by the Goal 2–3 edits with nothing committed, so that module graph no longer exists to rebuild. What is provable: the 26→25 transition co-occurred with the Goal 2–3 source edits (which changed the lazy-chunk import graph across `Results`/`ShareCopy`/`analytics` and the four modes), both Now-pass runs and today's run are green under identical assertions, and today's 25 are individually verified. No checker adjustment was made at any point, and no classification omission surfaced.

Current exact output (run twice today, identical):

```text
security checks: PASS (241 repository files, 25 production files)
```

No dependency install, TMDB call, rebake, stage, commit, amend, push, PR, merge, deploy, production analytics query, GitHub/Vercel setting change, or indexing change occurred in Goal 6.

### Goal 6 addendum (same session) — the transient 26th production file is RESOLVED

Goal 7's canonical gate order reproduced the 26 immediately and identified it: **`dist/bundle-report.json`**, written into `dist/` by `scripts/check-bundle.mjs:151`. `npm run build` empties `dist` to 25 files; `npm run check:bundle` adds its report (26); `check:security` counts whatever is present. Proven live: build → 25, check:bundle → 26. The whole production chain is therefore gate-order, not module-graph: the full review (25) counted a report-free dist; the Now pass (26/26) and Goal 7 (26) ran the canonical build → check:bundle → check:security order; this session's R0/Goal 6 standalone runs (25) had rebuilt dist without an intervening check:bundle. No checker change is made — the count is informational, the report file is itself scanned by the same marker/secret assertions, and the deploy pipeline runs `npm run build` alone, so the report never ships. The Goal 6 section's "not reconstructable" stands corrected by this addendum.

## Goal 7 — full local release matrix (Node 24)

Verdict: **PASS — every gate green, both smoke runs, tune assertion exact, zero stalemates**.

| command | result | duration |
|---|---|---|
| `node --version` / `npm --version` | `v24.14.0` / `11.9.0` | <1s |
| `npm run build` | PASS (tsc clean; vite 961ms) | 3.2s |
| `npm run check:bundle` | PASS — **menu shell 99.85 KiB gzip JS of 100 KiB budget**; solo 40.83 · chronology 22.76 · connections 52.94 · duel 52.10 KiB incremental, all within budget | 0.3s |
| `npm run check:security` | PASS (241 repository / 26 production — order-dependent 26th = `bundle-report.json`, see addendum) | 0.3s |
| `npm run verify` | 64 passed, 0 failed | 4m10s |
| `npm run verify:solo` | 8 passed, 0 failed | 0.4s |
| `npm run verify:chronology` | 42 passed, 0 failed | 0.2s |
| `npm run verify:connections` | 14 passed, 0 failed (exhaustive verifier ran to completion) | 6m52s |
| `npm run verify:analytics` | 12 valid contracts, 14 forbidden payloads, exact-once gates PASS | 0.2s |
| `npm run verify:progress` | malformed/version/nested/bounds/additive/round-trip/isolation PASS | 0.2s |
| `npm run test:smoke` (run 1) | **38 passed** | 1m16s |
| `npm run test:smoke` (run 2) | **38 passed** | 1m15s |
| `npm run eval -- tune 8000 --seed=200824 --assert` | casual 65.9% [64.9–67.0] / 50.3% [49.2–51.4] / 41.4% [40.3–42.5] vs targets 65/50/41, stalemates 0.0/0.0/0.0, asserts on | 1m28s |
| `git diff --check` | clean | <1s |
| focused suites (`journey analytics·friction·malformed progress·public support·reduced-motion·Draw 3·wild draws·compact`) `--repeat-each=3` | 33/33 | 25s |

Evidence tier: local automation on the declared Node 24 runtime; smoke and focused suites are automated real-browser (Chromium) runs.

- **Smoke count 31 → 38, fully accounted:** +4 Goal 1–3 tests (support/privacy reachability, journey-analytics dedupe, friction boundaries, malformed progress) and +3 Goal 4 tests (two long-title boards, placement-hint clearance). No expected count was silently changed; no retries were hidden — the Goal 4 section documents the two diagnosed harness races and their fixes, and both full runs here were first-attempt green.
- **⚠ Bundle-budget finding (surfaced, not absorbed):** the menu shell stands at **99.85 of 100 KiB gzip — 0.15 KiB of headroom**, up from 97.81 at the Now pass. The growth is the Goal 1–3 payload (journey-analytics contract + support/privacy copy + progress sanitization live in the shell chunk); this pass's Goal 4 edits ship in the Connections chunk and CSS. Within budget and PASS today, but effectively any future shell addition breaks the gate — Buri should treat the budget as spent.
- Normal `dist` re-verified free of E2E markers and source maps (R0 scan + `check:security` assertions); the journey-analytics suite re-proved no external collector request from localhost in both full runs.
- Live-flow tune matches the locked retune numbers exactly (65.9/50.3/41.4) with zero shipped-flow stalemates.

No dependency install, TMDB call, rebake, stage, commit, amend, push, PR, merge, deploy, production analytics query, GitHub/Vercel setting change, or indexing change occurred in Goal 7.

## Goal 8 — launch-readiness checkpoint and exact-path staging proposal

Verdict: **PASS — checkpoint written, canonical docs updated with proven facts only, stop point reached**.

- `docs/daily-duel-216-launch-readiness-checkpoint.md` created with all fifteen governing-prompt items plus the three resume-prompt additions: the 27-day cutover-runway statement in the executive verdict, the named provider property-cap pre-deploy item with its three Vercel doc references, and the staging mechanics (all 77 dirty paths classified A/B/C/D; combined-diff review named as the ownership evidence; the gitignored `audit/`+`output/` force-add tradeoff presented for Buri, not decided; the unpushed `ce39837` noted as riding the same push so exact-SHA CI runs on a tip containing both).
- `docs/daily-duel-216-attended-acceptance.md` created (Goal 5) as the canonical attended record for this candidate.
- Canonical-doc updates, proven facts only: `docs/master-plan.md` amendment-log v5 (pass completion, F-matrix summary, budget warning, next approvals, runway); `docs/security-launch-checklist.md` dated 2026-08-31 receipt (241/25-vs-26 with the `bundle-report.json` explanation, unchanged assertions, 99.85 KiB shell); `docs/production-release-checklist.md` dated 2026-08-31 candidate record (identity, matrix summary, attended state, ungated externals). `RULEBOOK.md` deliberately untouched: no mechanic, mode, or scoring rule changed in this pass.
- Final dirty state: **32 modified + 45 untracked = 77 paths** (the resume addendum's 73 + `docs/daily-duel-216-attended-acceptance.md` + the launch-readiness checkpoint + the two checklist dated-record edits). HEAD still `ce398376d0c03be5356d64000557817c2f0150c3`, upstream 1 ahead / 0 behind, nothing staged, `git diff --check` clean.
- Goal 0–3 receipts above stand untouched — this resume only appended sections.

### Evidence rows

| file | goal | mode/state | viewport/device/AT | exact build identity | evidence tier | verdict | blocker |
|---|---|---|---|---|---|---|---|
| `docs/daily-duel-216-launch-readiness-checkpoint.md` | Goal 8 | Local Launch-Readiness Review checkpoint | repository | HEAD `ce39837…` + 77 classified dirty paths | documentary | PASS — awaiting Buri Approval 1 | Buri approvals; 5 attended lanes |

Boundary log for the whole resume (R0 + 4–8): no dependency install/upgrade, TMDB call, data rebake, stage, commit, amend, push, PR, merge, deploy, production analytics query, GitHub/Vercel setting change, or indexing change occurred. The four promo files and all unrelated dirty/untracked work were preserved byte-identical.
