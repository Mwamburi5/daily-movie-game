# Match Cut — pre-launch polish execution (three batches) — Kickoff prompt

Buri approved on 2026-09-03 (after the five-agent pre-launch review,
`docs/prelaunch-review-2026-09-03.md`) the execution of three batches:
**Q-copy** (copy + a11y one-liners), **Q-safety** (chunk-preload recovery +
error boundary + CI verify steps, with the menu bundle budget raised to
104 KiB), and **Q-ops** (runbook corrections, promoted production smoke driver
with a clock-shifted 2026-09-27 dress rehearsal, immutable asset caching, and
a docs-only evidence commit). Each batch is its own branch, its own PR, its
own green CI, merged to `main` in order. Production stays `c063f26` — nothing
here deploys.

Governing context: `docs/prelaunch-review-2026-09-03.md` (§2 quick wins,
§4 risks), the raw reviews under
`audit/daily-duel-216-launch-readiness-2026-08-27/prelaunch-review-2026-09-03/`
(`review-B-polish.md`, `review-C-code.md`, `review-D-ops.md`,
`review-E-content.md`), `CLAUDE.md` (surgical changes; `src/DuelGame.tsx` is
the blast-radius file; rule/scoring changes are never quick wins),
`docs/production-release-checklist.md`, `docs/security-launch-checklist.md`.

## Approvals in force (Buri, 2026-09-03)

1. Approved: the three batches below as separate commits/PRs on `codex/**`
   branches from `main@2be26f4`, pushed for exact-SHA CI, merged to `main`
   after green CI. Raising `menuGzip` to 104 KiB in `scripts/check-bundle.mjs`
   is approved as part of Q-safety (decision D5 of the review brief).
2. NOT approved: production deploy, alias changes, Vercel project settings,
   indexing/launch switches (`noindex` stays; shares stay URL-free), any
   rule, scoring, seed, pool, or dealer change, new dependencies, streak
   arithmetic changes (copy only), the `DAILY_EPOCH` move (D6, separate
   decision), the small-phone layout pass (D11, separate UI wave).

## Preconditions

- `origin/main` = `2be26f41d9056cc99df6e5805e09080a67df2f8c` (or a later
  merge of one of these batches). Node 24 via `PATH=/usr/local/bin:$PATH`.
  `gh` authenticated. CI triggers on push only for `main` and `codex/**`.
- Every gate a batch touches re-runs locally before push: `npm run build`,
  `check:bundle`, `check:security`, `git diff --check`, plus the verifiers
  named per batch; `npm run test:smoke` (Playwright, ~1.5 min) for any
  player-facing change. Report outputs verbatim in the PR body.

## Batch Q-copy — branch `codex/prelaunch-copy-a11y` (one commit)

No rule/scoring change; no menu-chunk bytes beyond a few characters. Items
(file:line refer to `main@2be26f4`; re-locate if drifted):

| # | file | change |
|---|---|---|
| c1 | `src/components/ShareCopy.tsx` ~15-19 | The revert timer arms for `'failed'` too, so the `<pre data-share-fallback>` (rendered only while `copy === 'failed'`) disappears after 2.2 s. Change the guard so only the `'copied'` state reverts (`if (copy !== 'copied') return`). Extend `tests/browser/delivery-smoke.spec.ts` (the forced-fallback case near lines 186-189) to assert `[data-share-fallback]` is still visible after ≥2.6 s. **P1.** |
| c2 | `src/ChronologyGame.tsx` ~1054 | "Score -2 = 1 strokes − 3 credits" → pluralise strokes/credits by count. |
| c3 | `src/ConnectionsGame.tsx` ~334 and ~381 | `${mistakesLeft} mistakes left` → pluralise (aria-label and the desktop side-rail text). |
| c4 | `src/ChronologyGame.tsx` ~352 + `RULEBOOK.md` | When a misfire's decisive neighbour shares an **identical `releaseDate`**, the message must not say "decided by exact date". Add a branch: e.g. `actually 2024 — same release day, decided by tiebreak`. Update the RULEBOOK sentence ("Same-year films still have exactly one right slot, because the game knows the full release dates…") to admit the identical-date tiebreak. The ordering/scoring code (`compareCards` id tiebreak) is NOT changed. `npm run verify:chronology` must stay 42/42. Test hint: the 2026-10-29 deal pairs Gladiator II / Wicked (2024-11-22). |
| c5 | `src/components/Results.tsx` ~105 | "Solved in -1, par 9" reads as a bug when combo credits go negative → e.g. "Score −1 · par 9 (10 under par)". Keep the parenthetical logic. |
| c6 | Duel result `ResultMeaning` detail (in `src/DuelGame.tsx`) | `played - held` ASCII hyphen → en dash `–` to match the rows below. One character; nothing else in DuelGame.tsx. |
| c7 | `src/App.tsx` (~160, ~407, ~199/234/278), `src/ConnectionsGame.tsx` ~388, `src/components/HowToPlay.tsx` ~135/137, `src/components/Results.tsx` ~152 | Normalise visible apostrophes to `’`; "Today's bill" sentence case in both the board and the help sheet. Do not touch share strings' byte layout beyond the apostrophe if any (check `src/lib/share.ts` — if share text contains an apostrophe, leave it: the family format is pinned by tests). |
| c8 | `index.html` | Add `<meta name="apple-mobile-web-app-title" content="Match Cut" />` in `<head>` (no JS bytes). `check:security` must still report zero inline scripts. |
| c9 | `src/components/HowToPlay.tsx` ~54 | Rewrite "Dates from September 27, 2026 use the expanded 216-film pool" as player copy ("The film catalogue grew on 27 September 2026 — earlier days use the older, smaller catalogue."). Keep `RULEBOOK.md` consistent. |
| c10 | Loss/stuck result screens (Connections loss, Solo stuck, any daily loss) | The `DAY N · STREAK M` line on a **loss** reads like a bug because the streak counts showing up (documented `RULEBOOK.md` ~339-340, `progress.ts` ~216-227). Copy-only: on a non-win print `played N`-style wording or append "· showing up counts". **Do not change the arithmetic.** The verify-progress gate must stay green. |
| c11 | `src/components/ScoreRace.tsx` ~132-147 (compact branch) | Add `aria-label`s: `You ${playerScore}` and `CPU ${cpuScore} · show ends at ${TARGET_SCORE}` so the 375×667 header announces the goal. Duel chunk only. |
| c12 | `src/ConnectionsGame.tsx` ~117 `tileFontSize()` | "CHINATOWN" breaks mid-word at 375 (content box 65 px, word 67 px at 10 px). Proposed divisor `91 → 86`. **Before committing, measure every longest word across all 365 baked grids (`src/data/connections-grids.json`) at 375 width with Playwright + the real font**; ship the largest divisor ≤ 91 that fixes CHINATOWN with zero regressions, or drop c12 and say why. |

Gates: build · check:bundle (menu must stay ≤ 100 KiB here — this batch runs
before the budget bump; if it doesn't, split the offending item into
Q-safety) · check:security · verify:chronology · verify:progress ·
test:smoke · git diff --check. Commit message: "Polish launch copy and
accessibility strings" + body listing c1–c12 with any dropped item explained.

## Batch Q-safety — branch `codex/prelaunch-safety-net` (one commit)

| # | change |
|---|---|
| s0 | `scripts/check-bundle.mjs`: `menuGzip: 100 * KIB` → `104 * KIB` with a one-line comment: "raised 2026-09-03 (prelaunch review D5) to admit the error boundary; the menu shell is otherwise frozen for launch". |
| s1 | `src/main.tsx`: handle `vite:preloadError` (dispatched on `window` when a lazy chunk fails to load, e.g. a stale tab after a deploy): `event.preventDefault()`, a one-shot `sessionStorage` guard (key e.g. `matchcut:reloaded-once`), then `location.reload()`. Wrap storage access in try/catch (Safari private mode). ≈150 B gzip. |
| s2 | New `src/components/ErrorBoundary.tsx` (~25-line class component: `getDerivedStateFromError`, `componentDidCatch` no-op or dev-only log) wrapping `<App />` in `main.tsx`, rendering a minimal on-brand fallback: headline, one sentence, a "Reload" button (`location.reload()`), and the public support link already used in `HowToPlay.tsx` (GitHub issues URL). No new dependency. Match existing voice/tokens (`src/index.css`). |
| s3 | `tests/browser/delivery-smoke.spec.ts`: add one case that aborts `**/assets/SoloGame-*.js` (route abort) on the menu, taps Daily Puzzle, and asserts the page is not blank — either the reload happened (second request allowed → mode renders) or the boundary fallback is visible. Keep it deterministic. |
| s4 | `.github/workflows/ci.yml`: append `npm run verify:analytics` and `npm run verify:progress` steps to the `daily-rules` job (after Chronology). |

Gates: build · check:bundle (report the new menu number; it must be < 104
KiB and the delta must be ≈ the boundary + handler only) · check:security ·
verify:analytics · verify:progress · test:smoke · git diff --check. Commit
message: "Add a chunk-preload recovery path and an error boundary".

## Batch Q-ops — branch `codex/prelaunch-ops-runbook` (one or two commits)

| # | change |
|---|---|
| o1 | **Runbook** `docs/daily-duel-216-deploy-and-indexing-runbook.md` (untracked today — this batch tracks it; see o6): rewrite the Approval 4 procedure per `review-D-ops.md` §2: deploy from a **clean clone** of the exact SHA (`.vercelignore` does not exclude `promo/`, `output/`, `design/`, `tools/`, `dist-e2e/` → Tailwind source-scan drift), copy `.vercel/project.json` in, run `npx --yes vercel@59.11.1 whoami` first (refreshes the expiring stored token), then `npx --yes vercel@59.11.1 deploy --prod --yes`; served-SHA verification = `vercel inspect` `meta.githubCommitSha` read-back **plus** hash compare against a `.vercelignore`-filtered rebuild (in-tree builds differ by design — say so); post-deploy gates = `npm run verify:preview-security -- --url=https://matchcutdaily.com` (no jar; note it fires the documented test event) and `npm run smoke:prod -- --base=https://matchcutdaily.com`; rollback = `npx --yes vercel@59.11.1 rollback dpl_8SighytERqgygRYvbf1eMyLis6SL --yes` + verification, and the instruction to update the target after every deploy; timing rules (≥1-week soak, no deploy within ~2 h of local midnight, 72-h freeze before 09-27); first-hour watch list; pointer to the abort criteria. Also correct §1: the plan is known (Hobby → custom events not included; decision D1 = accept). Fix the stale rollback target in `docs/production-release-checklist.md` (~101-102) and its Preview-gate line (~33) to cite the 2026-09-02 green run. |
| o2 | **Promote the matrix driver**: `scripts/prod-smoke.mjs` derived from the session's `p3-matrix.mjs` (copy is under `audit/…/preview/` is NOT — it lives in the session scratchpad `/private/tmp/claude-501/-Users-mwamburi-Projects-Daily-Movie-Game/3aeebadf-dc07-4b20-af00-3fb7a9f29fe3/scratchpad/p3-matrix.mjs` together with `p3-deals.mjs` and `p3-report.mjs`; if the scratchpad is gone, rebuild from `review-D-ops.md` §5 + the receipt's P3 description). Requirements: `--base=<url>`, `--out=<dir>`, `--tag`, `--cookie-jar` (optional, Netscape), `--seed=YYYY-MM-DD` which installs a Playwright clock (`context.clock.install({ time })`) so the app's `localDateSeed()` sees that date AND recomputes the expected deal for that seed, `--root` defaulting to the repo root (no hardcoded absolute path), `x-vercel-skip-toolbar: 1`, exits non-zero on any FAIL/fault, writes `<out>/matrix-<tag>.json` + `.md`. Add `"smoke:prod": "node scripts/prod-smoke.mjs"` to `package.json` scripts (no dependency change). `npm run check:security` scans repository files — make sure the script carries none of the six forbidden markers as literals (see `scripts/verify-preview-security.mjs` for the list; reference them indirectly if needed). |
| o3 | **Dress rehearsal (evidence, not code)**: build the branch (`npm run build`), serve `dist/` with `npx vite preview --port 4175 --strictPort`, and run `smoke:prod` with `--seed=2026-09-27`, `2026-09-28`, `2026-09-29`, `2026-09-30` against it. All four must pass with 0 faults and the Daily Puzzle must deal from the **216** pool (assert the recomputed deal uses `dailyDuelPoolForSeed(seed).length === 216`). Save outputs under `audit/daily-duel-216-launch-readiness-2026-08-27/dress-rehearsal-2026-09-27/` (gitignored evidence) and summarise in the PR body. Kill the server. |
| o4 | **Daily production smoke workflow** `.github/workflows/prod-smoke.yml`: `workflow_dispatch` now; the cron (`'20 4 * * *'`, i.e. 00:20 America/New_York) present but **commented out with "enable after Approval 4"** because production still serves `c063f26` and would fail the deal cross-check. Job: checkout (pinned SHA action, `permissions: contents: read, issues: write`), Node 24, `npm ci`, `npx playwright install --with-deps chromium`, `npm run smoke:prod -- --base=https://matchcutdaily.com --out=out --tag=prod`, upload `out/` as an artifact, and on failure `gh issue create` (title "Production smoke failed <date>", body = the .md) using `GITHUB_TOKEN`. Also a cheap `curl` canary workflow (`prod-canary.yml`, every 30 min, same commented-cron rule) asserting 200 + entry `<script type="module">` present + hashed asset 200. |
| o5 | `vercel.json`: add a second headers rule `{ "source": "/assets/(.*)", "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }] }` (Vite content-hashes everything under `/assets/`). `check:security` only inspects the `/(.*)` rule, but run it. Note in `docs/security-launch-checklist.md` that this header rule was added (the checklist re-opens on header changes; the security header SET is unchanged). Also add `public/.well-known/security.txt` (Contact = the GitHub issues URL, Expires ≈ 2027-09-01, Preferred-Languages en) — confirm `.vercelignore`'s `*.md`/`*.txt` patterns do not exclude it (they list `*.md` only; verify). |
| o6 | **Docs-only evidence commit** (second commit, or part of this PR): `git add` these currently-untracked docs: `docs/daily-duel-216-ship-receipt.md`, `docs/daily-duel-216-preview-verification-goal-prompt.md`, `docs/daily-duel-216-preview-verification-receipt.md`, `docs/daily-duel-216-deploy-and-indexing-runbook.md`, `docs/daily-duel-216-attended-lanes-scheduling-goal-prompt.md`, `docs/prelaunch-review-2026-09-03.md`, `docs/prelaunch-polish-kickoff-prompt.md`; plus `git add -f` the gitignored evidence `audit/daily-duel-216-launch-readiness-2026-08-27/preview/` (≈0.7 MB) and the five `review-*.md` + `review-E-per-day-table.md` + `review-B-findings-part*.json` under `audit/…/prelaunch-review-2026-09-03/` — **NOT** `review-B-shots/` (22 MB of PNGs; stays local). **Exclude the promo family** (`docs/promo-execution-prompts.md`, `promo/`) — Buri's separate track. Scrub before adding: no cookie values, tokens, nonces (the receipts already redact; grep for `_vercel_jwt=`, `Bearer`, `eyJ`). |

Gates: build · check:bundle · check:security · test:smoke (o5 changes
`vercel.json` only, but run it) · `git diff --check` · the dress rehearsal
(o3) green. Commit messages: "Harden the launch runbook and add a production
smoke driver" and "Track the launch-readiness receipts and review evidence".

## Guardrails (all batches)

Work in a dedicated git worktree/branch off `origin/main`; never commit on
`main` directly; never `--force`; never touch `package-lock.json` or install
packages (a `node_modules` symlink to the main checkout is fine for gates);
no rule/scoring/seed/pool/dealer changes (`sim/` untouched; `npm run verify`
64/64 must hold if anything under `src/lib` is touched — it should not be);
no `DuelGame.tsx` edits beyond c6's one character; no production deploy, no
`vercel` mutations, no Preview/production traffic except the read-only
smoke against localhost; do not edit the promo family; keep the untracked
receipts byte-identical except where o1/o6 say otherwise. Every PR body
ends with the standard attribution line and carries the verbatim gate
outputs. Merge order: Q-copy → Q-safety → Q-ops (rebase later branches on
`main` if GitHub reports conflicts; re-run CI on the rebased SHA).

## Completion gate

Complete when all three PRs are merged to `main` with green exact-SHA CI on
their final tips; `main` builds; `check:bundle` reports the menu shell under
104 KiB with the boundary included; `test:smoke` green incl. the two new
cases; the dress rehearsal for 2026-09-27…30 is green on the 216 pool; the
evidence commit is on `main`; production still serves `c063f26`; and
`docs/prelaunch-review-2026-09-03.md` §2 items are annotated done/dropped
in a short receipt appended to this file.

---

Paste-able `/goal` block:

````text
/goal Execute the Match Cut pre-launch polish batches. Read
docs/prelaunch-polish-kickoff-prompt.md FIRST and follow it verbatim; this
condition is only its completion gate. Approved: three codex/** branches off
main (Q-copy, Q-safety incl. the 104 KiB menu budget, Q-ops incl. the
docs-only evidence commit), each its own PR with green exact-SHA CI, merged
in order. NOT approved: production deploy, Vercel settings, indexing
switches, any rule/scoring/seed/pool/dealer change, new deps,
package-lock.json edits, DuelGame.tsx beyond one character, promo files.
Done when all three PRs are merged, main is green, the 2026-09-27…30 dress
rehearsal passed on the 216 pool, the evidence commit is on main, prod still
serves c063f26, and a receipt is appended to the kickoff prompt.
````
