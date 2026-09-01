# Match Cut 216+16 ship pass (stage → commit → push → CI → PR → merge) — Goal prompt

Run this in a fresh session. Buri accepted the Local Launch-Readiness Review
checkpoint on 2026-09-01 and gave the approvals recorded below. Copy the
`/goal` block from the session notes, or paste this whole file; this document
is the governing specification either way.

## Approvals in force (Buri, 2026-09-01)

1. **Approved:** stage the classified release paths, create ONE reviewable
   release commit, push `codex/daily-mode-polish`, wait for exact-SHA CI, open
   the PR, and **merge to `main`** once CI is green on the exact pushed SHA.
   This executes Approvals 1 and 2 of the checkpoint's §12 sequence, per the
   standing 2026-08-31 merge-first priority directive.
2. **Approved evidence scope:** force-add the two gitignored `audit/`
   directories only (≈1.6 MB) — `audit/daily-duel-216-now-fix-pass-2026-08-27/`
   and `audit/daily-duel-216-launch-readiness-2026-08-27/`. Do NOT commit
   `output/` (screenshots there stay local and regenerable; links to them in
   committed docs remain local-only, matching the existing goal-5 precedent).
3. **Still NOT approved — do not perform:** protected-Preview verification
   sign-off, production deploy, production analytics dashboard query, and any
   indexing/launch switch (`noindex` removal, URL-in-share, front door). Each
   remains a separate later approval. The provider property-cap item
   (checkpoint §6) stays a pre-deploy verification for that later gate.

Governing context (read first): `docs/daily-duel-216-launch-readiness-checkpoint.md`
(especially §12 classification and §14 states), then the audit manifest
`audit/daily-duel-216-launch-readiness-2026-08-27/manifest.md`.

## Preconditions — stop before acting if any fail

1. Branch `codex/daily-mode-polish`; HEAD
   `ce398376d0c03be5356d64000557817c2f0150c3`; upstream
   `origin/codex/daily-mode-polish` at 1 ahead / 0 behind; nothing staged.
2. `git status --short --untracked-files=all` reconciles to exactly the
   checkpoint §12 baseline of 77 paths (32 modified + 45 untracked) **plus
   this prompt file** (`docs/daily-duel-216-ship-pass-goal-prompt.md`) = 78.
   Any other path is unexplained: stop and report.
3. Node 24.x via `/usr/local/bin` first on `PATH` (`node --version` = v24.x);
   `npm run verify:analytics` and `npm run verify:progress` pass.
4. `gh auth status` shows the Mwamburi5 account; `.github/workflows/ci.yml`
   exists.

## Work sequence

### S0 — re-baseline and gate refresh

Record branch/HEAD/upstream/Node/npm and the reconciled 78-path listing. Then
check byte-identity with the 2026-08-31 receipts: no tracked or untracked
source path (outside `docs/daily-duel-216-ship-pass-goal-prompt.md`, `audit/`,
and `output/`) has an mtime after 2026-08-31 23:10.

- If byte-identical: run the fast gate set on Node 24 — `npm run build`,
  `check:bundle`, `check:security`, `verify:solo`, `verify:chronology`,
  `verify:analytics`, `verify:progress`, ONE full `npm run test:smoke`
  (expect 38/38), `git diff --check`. The heavy gates (`verify` 64/64,
  `verify:connections` 14/14, tune assert) were green on this identical tree
  on 2026-08-31 and CI re-runs its own matrix on the exact SHA.
- If anything drifted: stop, report the drift, and only with an explanation
  that preserves the receipts re-run the FULL Goal-7 matrix instead.

### S1 — stage exactly the classified paths and commit once

Stage by explicit path, never `git add .`, never `git clean/reset/checkout/stash`:

- the 32 modified paths (checkpoint §12 categories A+B+C, including the two
  release checklists);
- the 41 classified untracked paths (A U×29, B U×2, C U×10);
- this prompt file (category C by self-classification); and
- `git add -f audit/daily-duel-216-now-fix-pass-2026-08-27 audit/daily-duel-216-launch-readiness-2026-08-27`.

Excluded and left untouched: the four promo files
(`docs/promo-execution-prompts.md`, `promo/brand-sheet.md`,
`promo/phase0-docs-checkpoint.md`, `promo/shot-list.md`), all of `output/`,
and any session scratch. After staging, verify `git status` shows ONLY the
four promo paths as remaining untracked and nothing unexpectedly unstaged;
review `git diff --cached --stat` for sanity (combined-diff review is the
ownership evidence). Create one commit:

```text
Ship the 216+16 Daily/Duel cutover with launch readiness

216 Keep + 16 wild pool cutover (first 216-card Daily 2026-09-27; earlier
seeds stay pinned to the legacy 89). MOVIES 304→320; retune 65.9/50.3/41.4
via existing CPU controls; Now-fix F01–F04; launch-readiness Goals 0–8:
public GitHub support route + honest privacy disclosure, privacy-safe
journey-analytics dictionary (verify:analytics), progress meta-state
sanitization (verify:progress), measured long-title/placement-hint fixes
with regression tests, WebKit + 200% automated acceptance. Full Node 24
matrix green (64/64 · 8/8 · 42/42 · 14/14 · smoke 38/38 ×2 · tune asserts,
zero stalemates). Verdict and staging record:
docs/daily-duel-216-launch-readiness-checkpoint.md. Audit evidence
force-added per owner approval 2026-09-01.

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
```

No amend after creation; if the commit is wrong, stop and report.

### S2 — push and exact-SHA CI

`git push origin codex/daily-mode-polish` (carries `ce39837` plus the release
commit). Record the new tip SHA. Watch CI for that exact SHA (`gh run list
--commit <sha>` / `gh run watch`). Green → S3. Red → read-only diagnosis of
the failing job, stop and report; no amend, no force-push, no retry-blind.

### S3 — PR and merge to main

`gh pr create` from `codex/daily-mode-polish` into `main`: title
`Ship the 216+16 Daily/Duel cutover with launch readiness`; body = executive
verdict summary, links to the checkpoint doc, the F05–F12 matrix note, the
attended-lanes caveat, and the footer
`🤖 Generated with [Claude Code](https://claude.com/claude-code)`.
When CI is green on the exact head SHA, merge with a **merge commit**
(`gh pr merge --merge`). If repository settings forbid merge commits (squash-
or rebase-only), STOP and ask Buri — squashing collapses `ce39837` and the
release commit into one and changes the history shape he reviewed.

### S4 — receipt and stop

Write `docs/daily-duel-216-ship-receipt.md` locally (NOT committed; a
docs-only follow-up commit is Buri's later option): merged `main` SHA, PR
number/URL, CI run URL(s), gate outputs from S0, staged-path count, date.
Update project memory. Then STOP and present:

- the merged SHA on `main` and the PR link;
- the remaining separately-gated steps: protected-Preview verification
  (`npm run verify:preview-security` + four-mode Preview matrix), attended
  lanes A–E scheduling (`docs/daily-duel-216-attended-acceptance.md`),
  provider property-cap confirmation, production deploy, post-deploy
  verification, and the indexing/launch switches;
- the cutover runway remaining to 2026-09-27; and
- the still-unanswered 2026-08-20 evergreen-practice ruling (post-merge
  follow-up decision, not part of this release).

## Guardrails

No dependency install; no TMDB call or rebake; no rule/pool/seed/tune/data
change; no `DuelGame.tsx` refactor; no Vercel or GitHub **settings** change
(the PR and merge themselves are the approved mutations); no deploy; no
indexing change; no production analytics query; preserve the promo files and
every unstaged path byte-identical; never `git add .`, `git clean`, `reset`,
`checkout`, `stash`, amend, or force-push.

## Completion gate

Complete only when: preconditions held; the release commit contains exactly
the classified paths + this prompt + the two audit directories and nothing
else; CI is green on the exact pushed SHA; the PR is merged to `main` with a
merge commit; the ship receipt exists locally; the four promo files remain
untracked and untouched; and no unapproved external mutation occurred. Stop at
the **Post-Merge Review** checkpoint with the report above.
