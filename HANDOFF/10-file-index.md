# 10 — File index

**Last verified:** 2026-09-08 on `codex/handoff-and-stale-docs` (from d22a255)

Every document in the repo, classified and given one status. Generated from the
handoff inventory script and then corrected by reading the files. Skipped:
`node_modules/`, `dist/`, `dist-e2e/`, `.claude/worktrees/` (three stale agent
worktrees, tool-managed copies of the repo), `.playwright-cli/`, `.vercel/`,
`.env.local` (never read), and `memory/` (a symlink to Claude's per-project
memory directory outside the repo; summarized in [08-ai-workflow.md](08-ai-workflow.md)).

Status meanings: **live** = current source of truth for its topic · **superseded**
= replaced, by what and when · **done** = a record of completed work · **reference**
= timeless · **unclear** = could not tell.

Counts (text documents): plans 11 · prompts 24 · specs 9 · design 10 · decisions 3
· reports 15 · audits 65 · runbooks 4 · agent config 4 · readmes 2 · other 20.
Binary assets: 443 (listed per folder at the end).

Files marked ⚠ untracked were local-only as of d22a255; they are tracked on
`codex/handoff-and-stale-docs` since 2026-09-08 (see [09-open-work.md](09-open-work.md)).

## Root and agent config

| Path | Status | Last commit | Lines | What it is |
|---|---|---|---|---|
| `README.md` | live | 2026-07-10 | 60 | Public README: four modes, stack, scripts table, structure. Status line slightly stale (says Chronology pool "still growing"; growth is paused) |
| `CLAUDE.md` | live | 2026-07-10 | 49 | Claude's working rules: think-before-coding, surgical changes, project guardrails (live plan pointer, sim contract + gate counts, locked deps, persistence rule, RULEBOOK sync) |
| `AGENTS.md` | live | 2026-08-21 | 26 | Pointer file for non-Claude agents (Codex): read CLAUDE.md; feature-branch policy ("never push directly to main") |
| `RULEBOOK.md` | live | 2026-09-03 | 449 | Plain-English player rulebook for all four modes, "What's new" log. Header date says 08-27; last edited 09-03 |
| `BACKLOG.md` | live | 2026-09-08 (branch) | 35 | Five small items; 1–3 struck as shipped 2026-09-08 |
| `PLAN.md` | superseded | 2026-07-06 | 173 | Launch-ramp build plan (WS1–WS5, 2026-07-04). Bannered; replaced by `docs/master-plan.md` 2026-07-06 |
| `design-qa.md` | done | 2026-08-09 | 42 | Production-polish Phase 4 design QA verdict (gitignored, local) |
| `.agents/skills/tmdb-check/SKILL.md` | live | 2026-08-07 | 104 | The `/tmdb-check` skill (Codex copy) |
| `.claude/skills/tmdb-check/SKILL.md` | live | 2026-07-06 | 104 | The `/tmdb-check` skill (Claude copy). Byte-identical to the `.agents` copy (diffed 2026-09-07) |
| `.claude/launch.json` | live | — | — | Browser-preview dev-server configs `marquee` @5173 and `marquee-alt` @5183 |
| `.codex/config.toml` | live | — | — | Codex MCP config (Stitch). Contains headers; not read for this handoff |
| `.github/ISSUE_TEMPLATE/*.md` (3) | live | 2026-09-01 | ~36 each | Player support route: bad movie data / accessibility trouble / broken game |
| `.github/workflows/ci.yml` | live | 2026-09-03 | — | CI: build+budgets+security+audit, Duel verify, daily verifies, Connections verify, browser smoke, dependency review |
| `.github/workflows/prod-smoke.yml` | live | 2026-09-05 | — | Nightly four-mode production smoke (cron 04:20 UTC), opens an issue on failure |
| `.github/workflows/prod-canary.yml` | live | 2026-09-05 | — | 30-minute curl canary against production |
| `public/.well-known/security.txt` | live | 2026-09-03 | 9 | RFC 9116 contact (GitHub issues); expires 2027-09-01 |

## Plans (`docs/`, `promo/`)

| Path | Status | Last commit | Lines | What it is |
|---|---|---|---|---|
| `docs/master-plan.md` | **live — plan of record** | 2026-09-08 (branch) | ~1720 | "This is the only live plan." §2 constitution · §6 Ledger (resume sheet) · §7 user-input queue · §8 boot prompt · §9 polish/scale plan · §10 amendment log (v1–v6). v6 2026-09-08 records Approvals 1–4 and the crons |
| `docs/orchestration-plan.md` | superseded | 2026-07-06 | 222 | Orchestration Plan v2 (2026-07-05). Bannered; replaced by master-plan |
| `docs/ui-tasks.md` | superseded | 2026-07-06 | 148 | UI wave/task checklist snapshot (2026-07-05). Bannered; replaced by master-plan |
| `docs/chronology-tasks.md` | done | 2026-07-03 | 245 | Chronology 6-phase build checklist; all phases complete 2026-06-30 |
| `docs/feedback-batch1-plan.md` | done | 2026-07-16 | 223 | Circle feedback batch-1 fix docket; executed 2026-07-16/17 |
| `docs/stage-b-plan.md` | done | 2026-07-05 | 52 | Chronology Stage B pool-growth plan; executed 2026-07-12 (pool 162→438) |
| `docs/tmdb-plan.md` | reference | 2026-07-06 | 102 | TMDB integration rules and tooling ("author-time only; witness not judge") |
| `docs/launch-campaign-plan.md` ⚠ untracked | live | 2026-09-05 (mtime) | 216 | "Tonight's Program" public-launch campaign brief, 09-07 → 10-25 |
| `promo/phase0-docs-checkpoint.md` ⚠ untracked | live | 2026-09-01 | 93 | Promo Phase 0 stop point; five open questions for Buri |
| `promo/phase1-mockups-checkpoint.md` ⚠ untracked | live | 2026-09-01 | 141 | Canva mockup sprint stop point; Buri's mark ruling recorded |

## Specs and contracts

| Path | Status | Last commit | Lines | What it is |
|---|---|---|---|---|
| `sim/RULESET.md` | **live — canonical rules contract** | 2026-09-01 | 337 | Duel sim↔React parity contract (§1–§12) plus Connections contract (§13). The sim is the source of truth |
| `docs/ui-contracts.md` | reference (pins drifted) | 2026-08-07 | 613 | Frozen prop contracts for the Stub components, extracted from DuelGame.tsx at 1,989 lines (2026-07-05). Line numbers no longer match (file is 2,445 lines) |
| `design/UI-PRD.md` | superseded (partial) | 2026-07-03 | 276 | Game-UI redesign PRD. §10 A–D superseded by the Stub ruling 2026-07-05; §4 desktop and §5 gaps still cited as briefing sources |
| `docs/chronology-PRD.md` | done | 2026-07-03 | 256 | Chronology PRD; built |
| `design/chronology.md` | reference | 2026-07-03 | 250 | Chronology locked design spec (the design of record for Mode 3) |
| `docs/production-polish-requirements.md` | done | 2026-08-09 | 85 | Execution contract for the 2026-08 polish milestone; Phases 1–4 approved, 5–6 absorbed into the launch gates |
| `design/card-template-contract.md` | reference (parked) | 2026-07-03 | 231 | Card-art template geometry (1000×1333 grid) for the parked card-art pilot |
| `design/card-spec-A-repertory-ticket.md` | reference (parked) | 2026-07-03 | 178 | Card-art style A spec |
| `design/card-spec-C-silent-era.md` | reference (parked) | 2026-07-03 | 175 | Card-art style C spec |

## Design

| Path | Status | Last commit | Lines | What it is |
|---|---|---|---|---|
| `design_handoff_the_stub/README.md` | **live — visual source of truth** | 2026-07-17 | 131 | "The Stub" token table + six Duel screen specs (7a–7f). Amended 2026-07-17 (Domine has no tabular numerals) |
| `design_handoff_the_stub/reference/the-stub-screens.html` | reference | 2026-07-06 | — | The six screens as one inspectable HTML file |
| `design_handoff_the_stub/design_handoff_screenshots/7a–7f.png` (6) | reference | 2026-07-06 | — | The UI acceptance set: reference PNGs for side-by-side checkpoints |
| `design_handoff_the_stub/reference/uploads/*.png` (3) | reference | 2026-07-06 | — | Three baked card-art PNGs (style references only; they bake year and points, so they cannot ship) |
| `design/card-design-system.md` | reference (parked) | 2026-07-03 | 111 | Card design system for the parked card-art track |
| `design/stitch-card-styles.md` | superseded | 2026-07-03 | 119 | Three Stitch card styles; style B dropped, A + C kept in the card-spec files |
| `design/pilot-batch-01-A.md`, `-C.md` | reference (parked) | 2026-07-03 | 1209 / 1149 | Generated card-art prompt batches for the pilot |
| `design/reference/*.png` (4) | reference | 2026-07-03 | — | Card-art reference renders (A/C × Jurassic/Titanic) |
| `docs/card-redesign-proposal.html` | unclear | — | — | HTML proposal for a card redesign; not referenced by the live plan. Probably a 2026-08-07 concept artifact |
| `promo/brand-sheet.md` ⚠ untracked | live (awaiting red pen) | 2026-09-01 | 151 | Promo brand sheet transcribed from repo canon |
| `promo/shot-list.md` ⚠ untracked | live (awaiting sign-off) | 2026-09-01 | 153 | Nine-shot gameplay capture list for promo |
| `promo/canva-mockups-manifest.md` ⚠ untracked | done | 2026-09-01 | 120 | Canva design IDs and export manifest |
| `promo/canva-mockups/*.png` (9) ⚠ untracked | done | 2026-09-01 | — | Approved mockup exports (mark ×2 ambers, carousel, share showcase, device frames) |
| `.github/ISSUE_TEMPLATE/*` | (listed above) | | | |

## Decision ledgers

| Path | Status | Last commit | Lines | What it is |
|---|---|---|---|---|
| `docs/tmdb-rulings.md` | live (append-only) | 2026-07-12 | 62 | "Ours-correct" content arbitration ledger + standing policies. Six-month re-audit due 2027-01-05 |
| `docs/feedback-log.md` | live (append-only) | 2026-07-16 | 52 | Circle feedback ledger, 27 entries from 2026-07-10/16. Header dates are stale (interviews now D+14 = 2026-10-11) |
| `BACKLOG.md` | (listed above) | | | |

## Prompts (kickoff / goal prompts)

| Path | Status | Last commit | Lines | What it is |
|---|---|---|---|---|
| `design/chronology-kickoff.prompt.md` | done | 2026-07-03 | 50 | First Chronology kickoff (Phase 1–2), 2026-06-28 |
| `design/chronology-build.prompt.md` | done | 2026-07-03 | 78 | Chronology Phase 3 build prompt |
| `docs/chronology-kickoff-phase3.md` … `-phase6.md` (4) | done | 2026-07-03 | 87–183 | Chronology Phase 3–6 kickoffs; all executed by 2026-06-30 |
| `design/card-art-prompt.md` | reference (parked) | 2026-07-03 | 71 | Stitch/Claude Design prompt for card fronts |
| `docs/full-product-code-review-kickoff-prompt.md` | done | 2026-09-01 | 549 | Full product/design/retention/software review kickoff (run 2026-08-09; hit session limit; its findings fed the polish program) |
| `docs/production-polish-goal-prompt.md` | done | 2026-08-09 | 818 | Production-polish execution goal prompt (Codex `/goal` style); Phases 1–4 executed 2026-08-08/09 |
| `docs/ui-lock-and-movie-pool-health-kickoff-prompt.md` | done | 2026-09-01 | 488 | UI checkpoint lock + pool-health audit; produced `docs/movie-pool-health-report-2026-08-24.md` |
| `docs/pool-expansion-goal-prompt.md` | done (paused track) | 2026-09-01 | 367 | Systematic pool expansion; produced the Wave 3 slate/report (2026-08-08). Further expansion paused behind the launch gate |
| `docs/daily-duel-200-card-cutover-goal-prompt.md` | done | 2026-09-01 | 617 | 200-card (became 216+16) Daily/Duel cutover; executed → release checkpoint 2026-08-26 |
| `docs/daily-duel-216-full-review-goal-prompt.md` | done | 2026-09-01 | 506 | Full product review of the 216+16 candidate → `docs/daily-duel-216-full-review-report.md` |
| `docs/daily-duel-216-now-fix-pass-goal-prompt.md` | done | 2026-09-01 | 360 | Immediate fix pass → checkpoint 2026-08-27 |
| `docs/daily-duel-216-launch-readiness-goal-prompt.md` | done | 2026-09-01 | 522 | Launch-readiness Goals 0–8 (governing prompt; locked decisions §"Buri decisions locked") |
| `docs/daily-duel-216-launch-readiness-resume-goal-prompt.md` | done | 2026-09-01 | 301 | Resume prompt for Goals 4–8 → checkpoint 2026-08-31 |
| `docs/daily-duel-216-ship-pass-goal-prompt.md` | done | 2026-09-01 | 153 | Approval 1–2: stage → commit → push → CI → PR → merge (executed 2026-09-01, PR #2) |
| `docs/daily-duel-216-preview-verification-goal-prompt.md` | done | 2026-09-03 | 126 | Approval 3: protected Preview verification (executed 2026-09-01 → 09-03) |
| `docs/daily-duel-216-attended-lanes-scheduling-goal-prompt.md` | **live — not yet run** | 2026-09-03 | 91 | Builds the attended-lanes pack (run-sheets A–E, schedule, outreach). None of its deliverables exist |
| `docs/prelaunch-polish-kickoff-prompt.md` | done (with receipt) | 2026-09-03 | 215 | Three polish batches Q-copy/Q-safety/Q-ops; receipt appended (PRs #10–#12) |
| `docs/daily-duel-216-production-deploy-kickoff-prompt.md` ⚠ untracked | done | 2026-09-04 | 216 | Approval 4 production deploy kickoff (executed 2026-09-04/05) |
| `docs/launch-status-review-kickoff-prompt.md` ⚠ untracked | done | 2026-09-06 | 147 | Read-only status review kickoff → `docs/launch-status-review-2026-09-06.md` |
| `docs/process-retrospective-kickoff-prompt.md` ⚠ untracked | **live — not yet run** | 2026-09-08 | 155 | Build-process retrospective (sections A–G, ten-section report); evidence staged in `audit/process-retro-2026-09-08/` (gitignored) |
| `docs/promo-execution-prompts.md` ⚠ untracked | live | 2026-09-01 | 265 | Four promo phase prompts with shared §0 guardrails. Phase 0-docs done; 0-captures is next |
| `promo/canva-mockups-kickoff-prompt.md` ⚠ untracked | done | 2026-09-01 | 78 | Canva mockup sprint kickoff (executed 2026-09-01) |

## Reports, checkpoints, receipts

| Path | Status | Last commit | Lines | What it is |
|---|---|---|---|---|
| `docs/launch-status-review-2026-09-06.md` ⚠ untracked | **live — most recent status** | 2026-09-06 | 536 | Plain-English launch status: TL;DR, shipped history, launch-critical table with owners/deadlines, roadmap, campaign status, doc audit, decisions Buri owes, calendar 09-06 → 10-25 |
| `docs/daily-duel-216-production-deploy-receipt.md` | done | 2026-09-05 | 182 | Approval 4 receipt: deploy ids, hashes, gates, rollback drill, deviations |
| `docs/daily-duel-216-preview-verification-receipt.md` | done | 2026-09-03 | 241 | Approval 3 receipt |
| `docs/daily-duel-216-ship-receipt.md` | done | 2026-09-03 | 82 | Approvals 1–2 receipt (release commit bdaa3f5 → merge 14a546e) |
| `docs/daily-duel-216-launch-readiness-checkpoint.md` | done (§14/§15 stale) | 2026-09-01 | 322 | Launch-readiness checkpoint 2026-08-31; its publication rows still read NOT RUN |
| `docs/daily-duel-216-release-checkpoint.md` | done | 2026-09-01 | 113 | 216+16 release checkpoint 2026-08-26 |
| `docs/daily-duel-216-cutover-checkpoint.md` | done | 2026-09-01 | 208 | 216 cutover checkpoint |
| `docs/daily-duel-216-now-fix-pass-checkpoint.md` | done | 2026-09-01 | 175 | Now-fix checkpoint 2026-08-27 |
| `docs/daily-duel-216-full-review-report.md` | done | 2026-09-01 | 485 | Full product review 2026-08-26/27 (findings F01–F12) |
| `docs/daily-duel-216-attended-acceptance.md` | live (header stale) | 2026-09-01 | 75 | Attended lanes A–E scripts; lanes 4–8 `ATTENDED NOT RUN`. Header pins the 08-31 candidate, should record production 9a5fdbb |
| `docs/daily-duel-216-selection.md` | done | 2026-09-01 | 87 | The 216 Keep / 6 Strike picker receipt |
| `docs/daily-duel-pool-model-report.md` (+ `-data.json`) | done | 2026-09-01 | 385 | 200-film construction model |
| `docs/daily-duel-wild-simulation-report.md`, `docs/daily-duel-16-wild-simulation-report.md` (+ data json) | done | 2026-09-01 | 90 / 96 | Wild-card simulation readouts |
| `docs/daily-duel-pool-expansion-slate.md` | done | 2026-09-01 | 371 | Daily/Duel expansion slate checkpoint 1 |
| `docs/movie-pool-health-report-2026-08-24.md` (+ data json) | done | 2026-09-01 | 512 | Pool health audit: "no launch-blocking volume problem" |
| `docs/prelaunch-review-2026-09-03.md` | live (decisions list) | 2026-09-03 | 105 | Five-agent pre-launch review brief: §1 decisions D1–D11, §2 quick wins, §4 risks R1–R7. Still the best list of open decisions |
| `docs/goal-2-shared-ui-qa.md`, `docs/goal-3-mode-specific-qa.md` | done | 2026-08-18 | 76 / 81 | Polish Goal 2/3 QA records |
| `docs/goal-5-public-launch-acceptance.md` | done (misleading if read as current) | 2026-08-19 | 223 | Goal 5 acceptance for the 08-19 candidate; "Final result: pending" and an old rollback id |
| `docs/production-polish-audit-2026-08-08.md` | done | 2026-08-09 | 361 | The audit that opened the polish program |
| `docs/production-polish-design-qa.md` | done | 2026-08-09 | 182 | Polish design QA with screenshot links |
| `docs/production-polish-release-candidate.md` | done | 2026-08-09 | 211 | Polish Phase 4 release candidate |
| `docs/delivery-foundations-report.md` | done | 2026-08-09 | 209 | P1 delivery foundations (code split, budgets, CI) measurements |
| `docs/mode-readouts.md` | done | 2026-07-10 | 144 | W5a hard-data readouts per mode (tune 65.5/49.7/41.8 at the time; tilt A 53.6/B 44.1) |
| `docs/wave3-report.md` | done | 2026-08-08 | 164 | Wave 3 pool expansion completion (dated pool 438→482) |
| `docs/production-release-checklist.md` | live (source-control boxes stale) | 2026-09-05 | 221 | Release + launch checklist; quiet-release section executed; public-launch switches unticked |
| `docs/security-launch-checklist.md` | live | 2026-09-03 | 191 | Goal 4 security contract + owner-attended account checks (all account boxes unticked) |
| `docs/daily-duel-216-deploy-and-indexing-runbook.md` | live | 2026-09-05 | 327 | §2 deploy runbook (executed) · §2.5 rollback ids (current) · §3 Approval 5 held diffs. Line 12 stale |
| `output/playwright/goal-5/voiceover-attended-receipt.md` | done | 2026-08-19 | 24 | VoiceOver spot-check receipt (gitignored) |

## Content pipeline documents (`docs/`)

| Path | Status | Last commit | Lines | What it is |
|---|---|---|---|---|
| `docs/chronology-reuse.md` | done | 2026-07-03 | 66 | What Chronology reused from the codebase |
| `docs/connections-yield.md` | done | 2026-08-08 | 108 | Connections yield report (generated by `gen:connections`) |
| `docs/pool-unification.md` | done | 2026-07-06 | 125 | A4 pool unification design; executed 2026-07-06 (byte-identical JSON) |
| `docs/wave1-draft.md`, `docs/wave1-diffs.md` | done | 2026-07-05 | 974 / 108 | Wave 1 content draft + cross-check (89→163) |
| `docs/wave2-draft.md`, `docs/wave2-diffs.md`, `docs/wave2-audit.md` | done | 2026-07-05 | 982 / 92 / 494 | Wave 2 (163→237) |
| `docs/wave3-candidate-audit.md`, `-names.md`, `wave3-credit-audit-supplement.md`, `wave3-date-draft.md`, `wave3-diffs.md`, `pool-expansion-wave3-slate.md` | done | 2026-08-08 | — | Wave 3 (67 cards) audits and slate |
| `docs/stage-b-slates.md` | done | 2026-07-12 | 375 | Chronology Stage B decade slates; Buri struck 74 of 352 |
| `docs/stage-b-arbitration-docket.md` | done | 2026-07-12 | 102 | 47 CHECK flags triaged |
| `docs/stage-b-date-draft-newstub-batch.md`, `-zap-batch.md` | done (generated) | 2026-07-12 | 1872 / 1236 | Date drafts for arbitration; never merge directly |
| `docs/daily-duel-candidate-audit.md`, `-names.md`, `docs/name-audit.md`, `docs/tmdb-date-audit.md` | done (generated) | 2026-07 / 09 | — | Generated audit outputs; regenerate, do not hand-edit |

## Evidence folders (`audit/`, gitignored except force-added files)

| Folder | Files | What it is |
|---|---|---|
| `audit/daily-duel-216-launch-readiness-2026-08-27/` | 224 | Launch-readiness manifest (409 lines), Approval 3 preview evidence, prelaunch-review reports A–E + 90 review-B shots (local only), dress rehearsal matrices for 09-27…09-30, Approval 4 production-deploy evidence (preview/ + prod/ subfolders: headers, hashes, smoke consoles, rollback drill, watcher runs) |
| `audit/daily-duel-216-full-review-2026-08-26/` | 51 | Full-review screenshot manifest + 50 PNG/JPEG |
| `audit/daily-duel-216-now-fix-pass-2026-08-27/` | 17 | Now-fix evidence manifest + 16 PNG |
| `audit/production-polish-*-2026-08-08/` (4 folders) | 113 | Polish phase screenshots |
| `audit/status-review-2026-08-07*/` (3 folders) | 33 | 2026-08-07 status review AUDIT.md + screenshots |
| `audit/design-qa-*-2026-08-07/` (2) | 17 | Chronology reel + Connections design QA shots |
| `audit/live-review-2026-07-12/` | 19 | Live UX/visual/a11y review of matchcutdaily.com |
| `Feedback Screenshots /` | 6 | Circle feedback screenshots (2026-07-16), gitignored |
| `output/playwright/` | 274 | Playwright reports/videos (gitignored) |

## Tools

| Path | Status | What it is |
|---|---|---|
| `tools/daily-duel-pool-picker/` (4 files) | done | Static HTML "200-film Daily/Duel picker" Buri used to Keep/Strike the 216 pool |
| `scripts/gen-pilot-cards.py` | reference (parked) | Card-art pilot generator |

## Binary assets by folder

| Folder | Files |
|---|---|
| `audit/daily-duel-216-full-review-2026-08-26/` | 48 png, 2 jpeg |
| `audit/daily-duel-216-launch-readiness-2026-08-27/` (all subfolders) | 154 png, 13 json, 3 html |
| `audit/daily-duel-216-now-fix-pass-2026-08-27/` | 16 png |
| `audit/production-polish-*` | 113 png |
| `audit/status-review-*`, `audit/design-qa-*`, `audit/live-review-*` | 67 png |
| `design/reference/` | 4 png |
| `design_handoff_the_stub/` | 6 screen png, 3 card png, 1 html |
| `promo/canva-mockups/` | 9 png |
| `docs/` | 4 json (sim/model data), 1 html |
| `public/` | favicon svg/png, apple-touch-icon, social-preview svg/png, tmdb-logo.svg, 3 woff2 fonts |
| `src/assets/` | 3 webp |
