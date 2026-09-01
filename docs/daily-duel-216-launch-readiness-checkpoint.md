# Match Cut 216+16 — Local Launch-Readiness Review checkpoint

Written 2026-08-31 at the end of the resumed launch-readiness pass (Goals 0–3
receipted 2026-08-28; Goals R0 and 4–8 completed 2026-08-31). Evidence manifest:
`audit/daily-duel-216-launch-readiness-2026-08-27/manifest.md`. This checkpoint
stops at the **Local Launch-Readiness Review** boundary: nothing has been
staged, committed, pushed, deployed, or indexed.

## 1. Executive verdict

**Ready for exact-SHA approval.** Every local gate is green on the declared
Node 24 runtime: the full sim contract (64/64 · 8/8 · 42/42 · 14/14), both new
verifier gates, two full 38/38 smoke runs, the 8000-game tune assertion at
exactly 65.9/50.3/41.4 with zero stalemates, build/bundle/security/diff, and
the Goal 4 measured fixes with their regression tests. The remaining true
blockers are human, not code: five attended device/AT lanes are honestly
`ATTENDED NOT RUN`, and the release itself needs Buri's staged sequence of
approvals (stage/commit/push → CI → PR → merge, then Preview, deploy, and
indexing as separate gates).

Two items belong in the verdict rather than a footnote:

- **Cutover runway (27 days).** The first 216-card Daily fires on
  `2026-09-27`; dates through `2026-09-26` stay pinned to the legacy 89 pool.
  From today that leaves 27 calendar days for: Buri's review of this
  checkpoint, the commit/push/exact-SHA CI cycle, PR and merge to `main`,
  protected-Preview verification, the production deploy, the attended
  device/AT lanes, and meaningful production soak. If the merge lands this
  week, production gets roughly three weeks of soak before the boundary —
  adequate but compressing fast, and the attended lanes are the long pole
  because they need scheduled humans and hardware. If approvals slip past
  mid-September, soak becomes thin; moving the date is Buri's decision, not
  this pass's.
- **The menu-shell budget is effectively spent: 99.85 of 100 KiB gzip**
  (0.15 KiB headroom, up from 97.81 at the Now pass — the Goal 1–3 payload).
  Within budget and green today, but the next shell-side addition will break
  the gate; treat any future menu-shell feature as requiring a budget
  decision first.

## 2. Verified baseline and changed files

Branch `codex/daily-mode-polish`; HEAD
`ce398376d0c03be5356d64000557817c2f0150c3`; upstream
`origin/codex/daily-mode-polish` at 1 ahead / 0 behind (the unpushed
`ce39837` onboarding commit rides the next push); nothing staged at any point.
Declared runtime `/usr/local/bin/node v24.14.0` / npm 11.9.0 (default shell
v22.23.2 recorded alongside, unused for gates). Dirty worktree at checkpoint
time: **32 modified + 45 untracked = 77 paths** — the resume addendum's 73,
plus `docs/daily-duel-216-attended-acceptance.md`, this checkpoint, and the
Goal 8 dated-record appends to `docs/production-release-checklist.md` and
`docs/security-launch-checklist.md` (all Goal 5/8 artifacts). Full grouped
listing in §12 and in the manifest's R0 section. Goal 4's code edits touched
only already-dirty paths (`src/ConnectionsGame.tsx`, `src/index.css`,
`tests/browser/delivery-smoke.spec.ts`).

## 3. F05–F12 resolution matrix

| finding | resolution | evidence | remaining blocker |
|---|---|---|---|
| MC216-F05 support gap (P2) | **RESOLVED (local)** — Goal 1: shared Help support card, three issue templates, verified public chooser URL with sign-in/public warnings | manifest Goal 1; 4 opened screenshots; live read-only URL check | owner-response drill is operational, post-launch |
| MC216-F06 telemetry gap (P2) | **RESOLVED (local)** — Goal 2: approved event dictionary, exact-once queue proofs, failure isolation, no-send receipt | manifest Goal 2; `verify:analytics` 12+14 | provider property-cap confirmation (§6); production dashboard receipt post-deploy |
| MC216-F07 attended a11y (P2) | **PARTIAL** — automated tiers 1–3 closed on this candidate (Chromium 10/10, WebKit 26.5 4/4 zero faults, 200% 9/9 no overflow) | manifest Goal 5; `docs/daily-duel-216-attended-acceptance.md` | 5 attended lanes `ATTENDED NOT RUN` with continuation scripts A–E |
| MC216-F08 operations/publication (P2) | **OPEN BY DESIGN** — exact-path staging proposal ready (§12); all publication states `NOT AUTHORIZED/NOT RUN` (§14) | this checkpoint | Buri's staged approvals |
| MC216-F09 Node 24 reproducibility (P3) | **RESOLVED** — entire release matrix on v24.14.0 | manifest Goals R0/6/7 | none |
| MC216-F10 receipt drift (P3) | **RESOLVED** — 225→228→229→241 repository chain decomposed path-by-path with dated files; the transient 26th production file identified as `dist/bundle-report.json` (gate-order artifact, proven live) | manifest Goal 6 + addendum | none |
| MC216-F11 nested meta corruption (P3) | **RESOLVED** — Goal 3 sanitizer with conservative clamp policy | manifest Goal 3; `verify:progress`; rendered receipt | none |
| MC216-F12 long-title legibility (P3) | **RESOLVED** — measured over the full 315-title corpus; three confirmed defects fixed (5→6-line clamp, badge chip, hint `min()` cap); backstop word-breaks measured-accepted and documented | manifest Goal 4; before/after matrices; 11 evidence PNGs | attended readability check rides lanes 4–8 |

## 4. Support receipt

Destination `https://github.com/Mwamburi5/daily-movie-game/issues/new/choose`
— public repository, Issues enabled, signed-out access redirects to GitHub
login (verified read-only 2026-08-28). The UI states GitHub sign-in is
required, reports are public, and personal information must not be included.
Three local templates (`bad-movie-data`, `accessibility-trouble`,
`broken-game`) collect only non-sensitive reproduction fields, use no labels,
and were validated locally. Interim public route, not a private help desk; no
support email exists or is claimed.

## 5. Exact player-facing privacy disclosure

Verbatim from the shared Help disclosure (`What this site saves and
measures`), checked against Vercel's Web Analytics privacy, custom-events, and
limits documentation on 2026-08-28:

> On this device, Match Cut stores per-mode streaks, whether you played today,
> personal bests, and your Duel record. This progress stays in your browser
> and does not affect deals or game rules.
>
> Vercel Web Analytics records anonymous page views and a small set of journey
> events so confusing or broken areas can be found. Provider context can
> include the page and time, general location, browser and operating system,
> and device type.
>
> Match Cut does not add your movie or person choices, typed text, name, email
> address, or a persistent cross-day player ID to those events. Analytics is
> cookieless; Vercel discards the visitor session used for deduplication after
> 24 hours, so it resets daily. Match Cut has no user identity export, drain,
> or D1/D7 player tracking.
>
> Analytics retention follows Vercel's service and plan reporting policy and
> may be longer than the guaranteed reporting window.

## 6. Analytics dictionary and evidence

Nine events (`mode_start` + ordinal, `mode_finish`, `share`, `first_action`,
`help_open`, `help_return`, `friction`, `share_attempt`, `replay`) with fixed
enums, bounded integers, capped `1|2|3|4+` buckets, per-boundary dedupe owners,
and a central contract that rejects unknown events, extra properties, free
text, movie/person/seed data, and localStorage values before `window.va` is
called. Evidence: `verify:analytics` (12 valid contracts, 14 forbidden
payloads), the real-browser queue receipt (StrictMode dedupe, Help
arm/consume, copied vs manual-fallback, replay ordinal retention, all four
modes' friction paths, throwing-collector survival, no localhost
`/_vercel/insights/` request), and a marker-free normal bundle.

**Named pre-deploy verification — provider property caps:** Vercel's
custom-events documentation permits flat properties while its limits page
documents plan-specific caps on app-supplied custom event properties; the
approved `mode_start`, `first_action`, and `friction` events carry three
properties. Before treating all third properties as production-reportable,
confirm the deployed project's plan handling on the live dashboard (references:
`https://vercel.com/docs/analytics/privacy-policy`,
`https://vercel.com/docs/analytics`,
`https://vercel.com/docs/analytics/limits-and-pricing`). Do not redesign the
dictionary silently; this is a publication-time confirmation only.

## 7. Meta-state policy

`sanitizeProgress()` (Goal 3): non-object root or wrong version resets the
blob; each nested record resets independently; seeds must be real
`YYYY-MM-DD` dates ≥ 2000; streaks clamp to `1..36,525` only behind a valid
completed seed; bests clamp to conservative display ranges (Solo `−100..1000`,
Chronology `−10..100`, Connections `0..3`); Duel wins clamp to plays; only
real booleans/known difficulties survive; valid v1 round-trips unchanged;
storage failures degrade to fresh meta without interrupting gameplay. No rule,
deal, seed, solver, score, or difficulty helper reads persisted values —
re-proven by import audit. localStorage remains meta-only.

## 8. Title-fit evidence and decisions

Reproducible corpus: 315 unique tile titles across all 365 grids; inventory
script + output archived in the audit directory. Confirmed and fixed: (1) the
5-line clamp hid real text in seven board/viewport instances (including the
54-char Pirates title at three sizes) while tiles held 19–50px of headroom —
clamp raised to 6 lines, matching the ≤340px override; (2) the `PICK n`
ordinal interleaved glyphs with 5–6-line titles at 320/360 — the ordinal now
sits on a navy chip invisible except where it prevents interleaving; (3) the
desktop Chronology hint intersected all five top-row choice tickets at
1024x768 (the Now-pass screenshot 07 defect; glyph-box overlap, envelope
721–802px heights) — the hint's `top` is now capped just above the tray via
`min()`, byte-identical at every previously-clean height. Measured-accepted
backstops (documented, no change): `break-word` wraps on
`BlacKkKlansman`/`Nightcrawler`/`Unforgiven` at widths where a 12–14-char word
cannot fit at the 6.5–7px legibility floor; chip covers line-1 tail on extreme
tiles while selected; the raised card covers the repositioned hint at
721–802px heights (idle state — where the defect was recorded — is fully
clean). After-matrix: zero truncation, uniform tiles, badge contained, zero
hint/ticket contact at all ten probes. Three durable regression tests added;
15/15 at repeat-5.

## 9. Automated versus attended matrix

| lane | tier | status |
|---|---|---|
| Chromium keyboard/focus/Escape/touch/drag/reduced-motion | automated | PASS 10/10 |
| WebKit four-mode smoke (WebKit 26.5, installed runtime) | automated | PASS 4/4, zero faults |
| 200% zoom captures (720×450 @2×), incl. support/privacy, sanitized menu, long-title board | automated | PASS 9/9, zero overflow |
| Desktop Safari · iPhone Safari · Android Chrome · VoiceOver · TalkBack | attended | **ATTENDED NOT RUN** ×5 — continuation scripts A–E in `docs/daily-duel-216-attended-acceptance.md` |

Prior attended receipts in `docs/goal-5-public-launch-acceptance.md` belong to
the earlier candidate and were not reused.

## 10. Node 24 gates and reconciled security counts

Full matrix on v24.14.0 (manifest Goal 7): build · bundle (99.85/100 KiB shell
— see §1) · security · 64/64 · 8/8 · 42/42 · 14/14 (exhaustive, 6m52s) ·
analytics · progress · smoke 38/38 ×2 (count 31→38 fully accounted by the 7
tests Goals 1–4 added) · tune 65.9/50.3/41.4 zero stalemates, asserts on ·
`git diff --check` clean · focused suites 33/33 at repeat-3. Security chain
reconciled path-by-path (manifest Goal 6 + addendum): 225 → +3 review/prompt
docs → 228 → +its own checkpoint → 229 → +12 dated additions → 241; the
25↔26 production oscillation is `dist/bundle-report.json`, written into
`dist` by `check:bundle` and counted when `check:security` runs after it —
proven live, checker unchanged, never deploys.

## 11. Boundary audit

No rule, scoring, deal, seed, wild, difficulty, tune, pool, or Daily-boundary
change anywhere in this pass (Goal 4's fixes are visual-layout and test-only).
No `DuelGame.tsx` refactor. No new dependency. No TMDB call or rebake.
localStorage meta-only, with rule/deal isolation re-proven. Share strings
unchanged and URL-less. `noindex` untouched. No stage, commit, amend, push,
PR, merge, deploy, production analytics query, GitHub/Vercel setting change,
or any other external mutation occurred. The four promo files were preserved
untouched.

## 12. Exact-path staging proposal

Classification of all 77 dirty paths (32 modified `M` + 45 untracked `U`).
**Path membership is bookkeeping, not ownership evidence — the release
reviewer must read the combined diff**, because Now-pass and launch-readiness
work landed as hunks on already-dirty candidate paths.

**A — pre-review 216+16 candidate (release commit).** M×20:
`RULEBOOK.md`, `docs/master-plan.md`, `docs/name-audit.md`, `sim/RULESET.md`,
`sim/connections-verify.ts`, `sim/duel-sim.ts`, `sim/solo-verify.ts`,
`sim/verify.ts`, `src/DuelGame.tsx`, `src/SoloGame.tsx`,
`src/components/DrawChoice.tsx`, `src/components/HowToPlay.tsx`,
`src/data/connections-grids.json`, `src/data/duelPool.ts`,
`src/data/movies.ts`, `src/devAssertions.ts`, `src/lib/difficulty.ts`,
`src/lib/duel.ts`, `src/lib/solver.ts`, `tests/browser/delivery-smoke.spec.ts`.
U×27 (review-era set): `docs/pool-expansion-goal-prompt.md`,
`docs/full-product-code-review-kickoff-prompt.md`,
`docs/ui-lock-and-movie-pool-health-kickoff-prompt.md`,
`docs/movie-pool-health-data-2026-08-24.json`,
`docs/movie-pool-health-report-2026-08-24.md`,
`docs/daily-duel-200-card-cutover-goal-prompt.md`,
`scripts/daily-duel-pool-challengers.ts`,
`tools/daily-duel-pool-picker/index.html`,
`tools/daily-duel-pool-picker/styles.css`,
`tools/daily-duel-pool-picker/app.js`,
`tools/daily-duel-pool-picker/data.js`,
`docs/daily-duel-pool-expansion-slate.md`, `docs/daily-duel-candidate-audit.md`,
`docs/daily-duel-candidate-names.md`, `docs/daily-duel-pool-model-data.json`,
`docs/daily-duel-pool-model-report.md`, `scripts/daily-duel-pool-model.ts`,
`docs/daily-duel-wild-simulation-data.json`,
`docs/daily-duel-wild-simulation-report.md`,
`docs/daily-duel-16-wild-simulation-data.json`,
`docs/daily-duel-16-wild-simulation-report.md`, `sim/daily-duel-tune-eval.ts`,
`sim/daily-duel-cutover-eval.ts`, `docs/daily-duel-216-selection.md`,
`scripts/daily-duel-candidate.ts`, `docs/daily-duel-216-cutover-checkpoint.md`,
`docs/daily-duel-216-release-checkpoint.md`, plus
`docs/daily-duel-216-full-review-goal-prompt.md` and
`docs/daily-duel-216-full-review-report.md` (U×29 with these two).

**B — Now-pass (release commit).** M×3 additions: `src/App.tsx`,
`src/components/Onboarding.tsx`, `src/index.css` (plus overlap hunks on five
category-A paths). U×2: `docs/daily-duel-216-now-fix-pass-goal-prompt.md`,
`docs/daily-duel-216-now-fix-pass-checkpoint.md`.

**C — launch-readiness (release commit).** M×9: `package.json`,
`src/lib/analytics.ts`, `src/lib/progress.ts`, `src/components/Results.tsx`,
`src/components/ShareCopy.tsx`, `src/ChronologyGame.tsx`,
`src/ConnectionsGame.tsx`, `docs/production-release-checklist.md`,
`docs/security-launch-checklist.md` (plus Goal 4 hunks on `src/index.css` and
`tests/browser/delivery-smoke.spec.ts`, and the v5 amendment on the
already-dirty `docs/master-plan.md`). U×10:
`.github/ISSUE_TEMPLATE/accessibility-trouble.md`,
`.github/ISSUE_TEMPLATE/bad-movie-data.md`,
`.github/ISSUE_TEMPLATE/broken-game.md`, `scripts/verify-analytics.ts`,
`scripts/verify-progress.ts`, `src/lib/journeyAnalytics.ts`,
`docs/daily-duel-216-launch-readiness-goal-prompt.md`,
`docs/daily-duel-216-launch-readiness-resume-goal-prompt.md`,
`docs/daily-duel-216-attended-acceptance.md`, and this checkpoint
(`docs/daily-duel-216-launch-readiness-checkpoint.md`).

**D — excluded from the release commit.** U×4:
`docs/promo-execution-prompts.md`, `promo/brand-sheet.md`,
`promo/phase0-docs-checkpoint.md`, `promo/shot-list.md` — unrelated preserved
promo exploration (2026-08-31). Option Buri may take later: a separate
docs-only commit; never mixed into this release diff.

**Gitignored evidence trees — Buri decision required.** `audit/…-2026-08-27/`
(both passes) and `output/playwright/…` hold the screenshots, receipts, and
measurement data this checkpoint and the manifest link to. They are gitignored,
so the release commit excludes them unless Buri chooses an explicit force-add.
Tradeoff to decide, not decided here: excluding them keeps the repository lean
but breaks those links for anyone reading the published repo; force-adding the
`audit/` directories (≈ a few MB of PNG/JSON) makes the receipts durable.

**Proposed fastest safe sequence to `main`** (each named approval separate):

1. **Approval 1 — stage + commit + push:** stage exactly categories A+B+C
   (`git add` by explicit path list; never `git add .`), one reviewable
   release commit; push `codex/daily-mode-polish` (the same push carries the
   already-committed `ce39837`, so CI runs on a tip containing both).
2. **Approval 2 — exact-SHA CI + PR + merge:** wait for green CI on the exact
   pushed SHA, open the PR, merge to `main`.
3. **Approval 3 — protected-Preview verification** (`verify:preview-security`
   + four-mode Preview matrix; attended lanes can run here).
4. **Approval 4 — production deploy** with post-deploy SHA/asset/CSP/mode
   verification.
5. **Approval 5 — indexing/launch switches** (`noindex` removal, URL-in-share,
   front door) — each still its own decision.

## 13. Rollback notes

Each workstream reverts independently; none migrates stored player data:
support/privacy = revert the `HowToPlay.tsx` hunks and delete the three
templates; analytics = revert `journeyAnalytics.ts`, the call-site hunks in
`App`/modes/`Results`/`ShareCopy`, `verify-analytics.ts`, and the
`package.json` script line (legacy `mode_start`/`mode_finish`/`share` behavior
is preserved beneath); progress = revert `src/lib/progress.ts` +
`verify-progress.ts` (sanitization is read-side only — stored blobs are
untouched either way); title-fit/hint = revert the `ConnectionsGame.tsx`
clamp/chip hunks, the one `index.css` `min()` rule, and the three added tests
(pure visual/test surface). Post-deploy rollback remains redeploy-previous on
Vercel, unchanged from the release checklist.

## 14. Publication states

| gate | state |
|---|---|
| stage / commit of this candidate | **NOT RUN** |
| push / exact-SHA CI | **NOT RUN** (branch tip `ce39837` remains unpushed, 1 ahead) |
| PR / merge to `main` | **NOT RUN** |
| protected-Preview verification | **NOT RUN** |
| production deploy | **NOT AUTHORIZED** (live prod remains `c063f26`, deployed 2026-08-18) |
| production SHA / asset / live four-mode matrix | **NOT RUN** |
| monitoring / rollback drill | **NOT RUN** |
| production analytics dashboard query | **NOT RUN** (provider cap item §6 pending) |
| indexing / `noindex` removal / URL-in-share / front door | **NOT AUTHORIZED** |

## 15. Next approval required

**Approval 1 of §12: stage the classified A+B+C paths, create the single
release commit, and push for exact-SHA CI** — asked as its own question, with
the `audit/` force-add decision attached. Approvals 2–5 remain separate. The
five attended lanes (scripts A–E) can be scheduled in parallel at any point
from the Preview gate onward.
