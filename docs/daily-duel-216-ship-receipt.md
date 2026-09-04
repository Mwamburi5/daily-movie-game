# Match Cut 216+16 — ship receipt (2026-09-01)

Local-only record of the executed ship pass (stage → commit → push → exact-SHA
CI → PR → merge). NOT committed; a docs-only follow-up commit is Buri's later
option. Governing spec: `docs/daily-duel-216-ship-pass-goal-prompt.md`;
verdict/classification: `docs/daily-duel-216-launch-readiness-checkpoint.md`.

## Outcome

| item | value |
|---|---|
| merged `main` SHA | `14a546e79ae1af3206e470f8f555d74257ff3a58` (true merge commit, parents `6eb352a` + `23c592a`) |
| release commit | `bdaa3f5085833cabe342c762c552b81a7723526a` — "Ship the 216+16 Daily/Duel cutover with launch readiness", spec message verbatim, never amended |
| conflict-resolution merge | `23c592ab583cff654e44dacaa2c04506fac24d9c` — origin/main (`6eb352a`) merged into the branch; see deviations |
| PR | #2 — https://github.com/Mwamburi5/daily-movie-game/pull/2 (merged 2026-09-01T11:54:03Z) |
| CI on release-commit SHA `bdaa3f5` | https://github.com/Mwamburi5/daily-movie-game/actions/runs/33501320800 — success (dependency-review skipped, push-event norm) |
| CI on final head SHA `23c592a` | https://github.com/Mwamburi5/daily-movie-game/actions/runs/33503913820 (push, incl. dependency-review pass) and https://github.com/Mwamburi5/daily-movie-game/actions/runs/33503909712 (pull_request) — both success |
| staged-path count | 98 = 74 explicit classified paths (32 M + 29 A-U + 2 B-U + 10 C-U + ship-pass prompt) + 24 files force-added from the two audit dirs (`git add -f`, ≈1.6 MB) |
| staged diff | 98 files, +199,444 / −346, 16 binaries (audit PNGs), all `audit/` files inside the two approved 2026-08-27 dirs |
| excluded, untouched | promo ×4 (`docs/promo-execution-prompts.md`, `promo/brand-sheet.md`, `promo/phase0-docs-checkpoint.md`, `promo/shot-list.md`), all of `output/`, plus post-spec promo session scratch (see deviations) |
| runtime | `/usr/local/bin/node` v24.14.0 · npm 11.9.0 (default shell v22.23.2, unused for gates) |
| date | 2026-09-01 |

## S0 gate outputs (Node 24.14.0, pre-stage, byte-identical tree)

- mtime byte-identity vs the 2026-08-31 23:10 receipts: **zero tracked-file
  drift**; only post-cutoff untracked = the ship-pass prompt itself + the
  explained promo scratch (deviation 1).
- `npm run build` — tsc clean, vite built in 1.06s.
- `check:bundle` — PASS; menu shell **99.85/100 KiB** gzip (budget effectively
  spent, unchanged).
- `check:security` — PASS (244 repository files, 26 production files).
- `verify:solo` — **8/8** incl. cutover pin: 2026-09-26 → 89, 2026-09-27/28 → 216.
- `verify:chronology` — **42/42**.
- `verify:analytics` — 12 valid contracts, 14 forbidden payloads, exact-once
  journey gates PASS.
- `verify:progress` — all seven checks PASS.
- `npm run test:smoke` — **38/38** passed (1.3m), one full run.
- `git diff --check` — clean.
- Heavy gates (verify 64/64, connections 14/14, tune assert) not re-run per
  spec: tree byte-identical to the 2026-08-31 green matrix; CI re-ran its
  matrix on both exact SHAs.

## Deviations from the spec (all recorded in-flight)

1. **79th dirty path, explained.** `promo/canva-mockups-kickoff-prompt.md` —
   untracked promo scratch written 2026-09-01 07:05:52, 37 s AFTER the
   ship-pass spec file, by the same wind-down session at Buri's Canva-mockups
   ask. Treated as the spec's "any session scratch" exclusion class; never
   staged. (During the pass, the parallel Canva sprint added further
   `promo/canva-mockups/` untracked outputs — same excluded family.)
2. **PR reuse instead of create.** An open PR for this exact branch pair
   already existed (#2, opened 2026-08-07 by Mwamburi5, head auto-tracking
   the branch). GitHub allows one open PR per pair, so #2 was retitled and
   rebodied to the spec's release title/body instead of close-and-recreate.
   It was also still a **draft**; `gh pr ready 2` preceded the merge.
3. **main had moved → AGENTS.md add/add conflict.** `origin/main` gained
   `6eb352a` "Add AGENTS.md and BACKLOG.md scaffolding (#3)" (2026-08-21).
   The branch carried its own July AGENTS.md (`869fa90`). The PR reported
   CONFLICTING; the local `git merge` was first denied by the permission
   classifier, so the resolution was put to Buri, who approved in-session:
   merge origin/main into the branch, resolving AGENTS.md to **main's exact
   bytes** (the newer slim pointer doc). Result `23c592a`: net PR diff vs
   main = exactly the reviewed release diff; `AGENTS.md`/`BACKLOG.md`
   contribute nothing; no amend, no force-push; `ce39837`/`bdaa3f5`
   byte-identical. CI re-watched green on `23c592a` before merge.

## Still separately gated (NOT approved, NOT run)

1. Protected-Preview verification: `npm run verify:preview-security` + the
   four-mode Preview matrix.
2. Attended lanes A–E scheduling (`docs/daily-duel-216-attended-acceptance.md`)
   — the runway long pole; can start from the Preview gate onward.
3. Provider property-cap confirmation (checkpoint §6) — pre-deploy item.
4. Production deploy + post-deploy SHA/asset/CSP/mode verification
   (live prod remains `c063f26`).
5. Indexing/launch switches: `noindex` removal, URL-in-share, front door —
   each its own decision.

Runway: first 216-card Daily fires **2026-09-27** — 26 calendar days from
merge. Open post-merge ruling: the 2026-08-20 evergreen-practice question.
