# Match Cut 216+16 launch-readiness completion (Goals 4–8) — Resume goal prompt

Run this in a fresh Codex session. The launch-readiness pass opened on
2026-08-28 and completed Goals 0–3 with receipts; this prompt resumes it at
Goal 4 and carries it through the checkpoint and exact-path staging proposal.
Copy everything inside the block.

````text
/goal Resume and complete the interrupted Match Cut 216+16 launch-readiness
pass from Goal 4 onward. Goals 0-3 — accepted baseline, the interim GitHub
support route and privacy disclosure, the minimal privacy-safe journey
analytics dictionary, and progress meta-state hardening — are complete, PASS,
and receipted in the pass manifest. Do not redo or rewrite them; re-verify
their gates still pass on the current worktree, then measure Connections
long-title legibility plus the recorded 1024x768 Chronology contact, complete
every actually available accessibility/device lane, reconcile the runtime and
security receipts, run the full Node 24 release matrix, and produce the
launch-readiness checkpoint with an exact-path staging proposal. Preserve
gameplay, content, tuning, and publication boundaries. Stop before staging,
commit, push, deploy, or indexing unless Buri gives a new explicit approval at
that boundary.

Repository:
`/Users/mwamburi/Projects/Daily Movie Game`

Governing prompt — its locked Buri decisions, guardrails, dictionaries, and
Goal 4-8 specifications remain in force verbatim; where this resume prompt is
silent, follow it:
`docs/daily-duel-216-launch-readiness-goal-prompt.md`

Mid-flight evidence manifest with the Goal 0-3 receipts:
`audit/daily-duel-216-launch-readiness-2026-08-27/manifest.md`

Required accepted checkpoint:
`docs/daily-duel-216-now-fix-pass-checkpoint.md`

## Outcome

Finish the launch-readiness pass:

1. re-baseline the mid-flight candidate without disturbing the Goal 0-3
   receipts;
2. measure Connections long-title legibility over the 320-film catalog and
   change it only on confirmed evidence, and give the same measured treatment
   to the pre-existing 1024x768 Chronology placement-instruction/ticket
   contact recorded in Now-pass screenshot 07;
3. complete every genuinely available automated and attended accessibility/
   device lane at the correct evidence tier;
4. reconcile the full security receipt-count chain across passes;
5. run the complete Node 24 release matrix including the new
   `verify:analytics` and `verify:progress` gates; and
6. write `docs/daily-duel-216-launch-readiness-checkpoint.md` with the
   verdict, the F05-F12 resolution matrix, and the exact-path staging
   proposal, then stop for Buri.

## Preconditions — stop before editing if these fail

1. Branch is `codex/daily-mode-polish`; HEAD is
   `ce398376d0c03be5356d64000557817c2f0150c3`; upstream is
   `origin/codex/daily-mode-polish` at 1 ahead / 0 behind. If HEAD moved or
   anything was staged, stop and report — no pass authorized a commit.
2. The manifest above records Goals 0-3 as PASS, and the Goal 1-3 artifacts
   exist: the three `.github/ISSUE_TEMPLATE/` files,
   `scripts/verify-analytics.ts`, `scripts/verify-progress.ts`, and
   `src/lib/journeyAnalytics.ts`.
3. On Node 24.x (`/usr/local/bin` first on `PATH`; do not install a runtime):
   `npm run verify:analytics`, `npm run verify:progress`, and the manifest's
   targeted smoke greps for support/privacy, journey analytics, and malformed
   progress all pass.
4. `git status --short --untracked-files=all` reconciles exactly to the
   manifest's entry baseline (23 modified + 32 untracked) plus the Goal 1-3
   additions and edits the manifest itemizes. Any unexplained dirty path:
   stop and report it before touching anything.
5. A normal production build contains no `VITE_E2E` fixture marker and no
   analytics test seam.

If any check is red or unexplained, complete a read-only diagnosis and stop
with the exact prerequisite. Do not paper over it inside this pass.

## 2026-08-31 baseline addendum — read together with precondition 4

Re-verified on 2026-08-31 against the live worktree (HEAD unchanged at
`ce398376d0c03be5356d64000557817c2f0150c3`, upstream still 1 ahead / 0
behind, nothing staged, `verify:analytics` and `verify:progress` both PASS on
Node v24.14.0):

- Modified tracked paths now count **30**: the manifest's 23-path entry
  baseline plus the seven Goal 2-3 edits the manifest itemizes
  (`package.json`, `src/lib/analytics.ts`, `src/lib/progress.ts`,
  `src/components/Results.tsx`, `src/components/ShareCopy.tsx`,
  `src/ChronologyGame.tsx`, `src/ConnectionsGame.tsx`). No tracked file has a
  modification date after 2026-08-28; treat these 30 as fully reconciled.
- Untracked files (`--untracked-files=all`) now count **43**: the manifest's
  32 entry files, the six Goal 1-3 additions, this resume prompt itself
  (`docs/daily-duel-216-launch-readiness-resume-goal-prompt.md`, written
  2026-08-30), and four promo-exploration documents created 2026-08-31
  outside this pass: `docs/promo-execution-prompts.md`,
  `promo/brand-sheet.md`, `promo/phase0-docs-checkpoint.md`, and
  `promo/shot-list.md`. The promo files are unrelated preserved work — do not
  edit, stage, or delete them; the Goal 8 staging proposal classifies them as
  excluded from the release commit (a separate docs-only commit is an option
  it may present).

Any dirty path beyond these 73 is unexplained: stop and report it per
precondition 4.

## Priority directive (Buri, 2026-08-31)

The owner's stated top priority is merging `codex/daily-mode-polish` to
`main` as quickly as possible with the candidate polished and done. UI
exploration and marketing/canvas work are explicitly deprioritized behind
that merge. This loosens no guardrail, gate, evidence tier, or stop point in
this pass. It does mean:

- open no new scope beyond Goals 4-8;
- where the evidence supports it, prefer the measured no-change decision over
  speculative polish; and
- the Goal 8 exact-path staging proposal must present the fastest safe
  sequence to a `main` merge — stage the classified release paths → commit →
  push (the same push carries the already-committed `ce39837`) → exact-SHA CI
  → PR → merge to `main` — naming each remaining Buri approval individually,
  with protected-Preview verification, production deploy, and indexing/
  launch-switch changes remaining separate gates after the merge.

## Resume rules

- Append to the existing audit manifest; never rewrite or renumber the
  Goal 0-3 receipts. New evidence rows use the same
  `file | goal | mode/state | viewport/device/AT | exact build identity |
  evidence tier | verdict | blocker` schema.
- Locked decisions carry forward unchanged: CPU is the opponent; `Reaching 20
  ends the show; highest net score wins.`; Daily links are actor/director/
  writer only; the support route is the public GitHub issue chooser with its
  sign-in/public warnings; the analytics event dictionary and its forbidden-
  data list are final for this release.
- Goal 2's open provider-plan item (plan-specific caps on app-supplied custom
  event properties versus the three-property `mode_start`/`first_action`/
  `friction` events) is a publication-time confirmation. Carry it into the
  checkpoint as an explicit pre-deploy verification item; do not query the
  production dashboard and do not silently redesign the dictionary.
- All governing-prompt guardrails apply: no new dependency, no TMDB call or
  rebake, no `DuelGame.tsx` state refactor, no change to the approved 216+16
  pools, the 2026-09-27 Daily boundary, wilds, seeds, difficulty, or tune;
  localStorage stays meta-only; preserve all unrelated dirty/untracked work;
  never use `git add .`, `git clean`, reset, checkout, or stash.

## Work sequence — checkpoint after every goal

### Goal R0 — re-baseline the mid-flight candidate

Record branch, HEAD, upstream, Node/npm, five recent commits, and the exact
current dirty path list grouped four ways: pre-review 216+16 candidate paths,
Now-pass paths, Goal 1-3 launch-readiness paths, and this session's new
paths. Run the precondition gates above and log their exact output in the
manifest.

Checkpoint: reconciled baseline, spot-check results, and confirmation that
Goals 0-3 receipts stand untouched.

### Goal 4 — long-title legibility and the 1024x768 Chronology contact

Execute the governing prompt's Goal 4 exactly: a reproducible title-fit
inventory over the current 320-film Connections catalog, densest cases
captured at 320x568, 360x800, 390x844, 768x1024, and 1024x768, measuring line
count/overflow, font size, tile-height consistency, badge collision, 200
percent behavior, and focus/solved readability. No change without confirmed
defect evidence; smallest shared fix if confirmed; re-run and open the
matrix either way.

In the same sweep, measure the pre-existing Chronology defect recorded in
`audit/daily-duel-216-now-fix-pass-2026-08-27/07-chronology-1024x768-after-start.png`:
at 1024x768 the centered placement instruction contacts the middle choice
ticket. Determine whether it is contact-only or occlusion, which viewports
show it, and whether reduced-motion or late-line states worsen it. Apply the
smallest evidence-driven layout fix or record a measured no-change decision
with the same rigor. This is a visual-layout item only — no rule, deal, or
data change.

Checkpoint: corpus method, worst cases, before/after or no-change decisions
for both items, and the attended-readability limitation.

### Goal 5 — accessibility and device acceptance

Execute the governing prompt's Goal 5 tiers 1-8 against the same candidate
state. Automated Chromium, automated WebKit smoke where the installed runtime
allows, and automated 200 percent captures close only their own tiers.
Attended desktop Safari, real iPhone Safari, real Android Chrome, VoiceOver,
and TalkBack each require the named hardware and a present human; record
device/OS/AT versions, date, tester, candidate identity, four-mode paths, and
pass/fail. A lane without its human or hardware is `ATTENDED NOT RUN` with a
precise continuation script — never closed by automation, a simulator, an old
receipt, or a different SHA. The attended surfaces now include the Goal 1
support/privacy disclosure and the Goal 3 sanitized-progress menu states.

Checkpoint: evidence-tier matrix and the remaining true human blockers.

### Goal 6 — reconcile runtime and security receipts

Run everything on the declared Node 24.x runtime and record both the declared
and default-shell runtimes as the manifest header does. Reconcile the full
security-count chain — the full review's 225/25, the Now pass's 228/26 then
229/26, and the current output after the Goal 1-3 additions (at minimum the
three issue templates, two verify scripts, and `journeyAnalytics.ts`) — by
diffing classified file lists, not by narrating totals. Name exactly which
paths account for each step. Fix the smallest real classification omission if
one surfaces; never adjust the checker just to reproduce an older number.

Checkpoint: Node identity, the per-step path explanation, unchanged assertion
contract, and exact current output.

### Goal 7 — full local release matrix

From the repository root on Node 24.x:

```sh
node --version
npm --version
npm run build
npm run check:bundle
npm run check:security
npm run verify
npm run verify:solo
npm run verify:chronology
npm run verify:connections
npm run verify:analytics
npm run verify:progress
npm run test:smoke
npm run test:smoke
npm run eval -- tune 8000 --seed=200824 --assert
git diff --check
```

Also run the focused exact-once analytics, progress-corruption, support-link,
long-title, reduced-motion, Draw 3, and compact-header suites with repeat
counts proportionate to risk, and let the exhaustive Connections verifier
finish. Expected contract: Duel 64/64 · Solo 8/8 · Chronology 42/42 ·
Connections 14/14 · both full smoke runs green · build/bundle/security/diff
green · live-flow tune within assertions with zero shipped-flow stalemates ·
no E2E marker or source map in normal `dist` · no external analytics request
from localhost. Record exact command, output, duration, and evidence tier;
report the bundle-budget headroom explicitly (the menu shell was last at
97.81 of 100 KiB gzip — if Goals 1-3 or this pass pushed it over, that is a
finding to surface, not to quietly absorb). Do not hide retries or silently
update expected counts; diagnose any flake to root cause as the Now pass did.

### Goal 8 — launch-readiness checkpoint and exact-path staging proposal

Create `docs/daily-duel-216-launch-readiness-checkpoint.md` with all fifteen
content items the governing prompt's Goal 8 specifies (verdict; verified
baseline; F05-F12 resolution matrix; support receipt; exact privacy
disclosure; analytics dictionary evidence; meta-state policy; title-fit
evidence; automated-versus-attended matrix; Node 24 gates and reconciled
security counts; boundary audit; exact-path staging proposal; rollback notes;
explicit `NOT AUTHORIZED/NOT RUN` publication states; and the precise next
approval required). Add to it:

1. **Cutover runway.** The first 216-card Daily is pinned to `2026-09-27`.
   State the calendar gap between the checkpoint date and that boundary, and
   what production soak the remaining gates (commit/push/CI, Preview, prod
   deploy, attended lanes) can realistically get before the cutover fires.
   If the runway is uncomfortably short, say so in the executive verdict
   rather than leaving it implicit — moving the date is Buri's decision, not
   this pass's.
2. **Provider property-cap item.** Carry the Goal 2 discrepancy as a named
   pre-deploy verification with its exact provider-doc references.
3. **Staging mechanics.** The proposal must classify every modified and
   untracked path (use `--untracked-files=all`) as pre-review candidate,
   Now-pass, launch-readiness, or excluded; state that combined-diff review —
   not path membership — is the ownership evidence; note that the gitignored
   `audit/` evidence directories need an explicit Buri force-add decision
   (checkpoint documents in `docs/` link into them, so excluding them breaks
   those links in the published repository — present the tradeoff, do not
   decide it); and note that the already-committed, unpushed `ce39837`
   onboarding commit rides the same future push, so exact-SHA CI will run on
   a tip containing both.

Update `docs/master-plan.md`, `docs/production-release-checklist.md`,
`docs/security-launch-checklist.md`, and `RULEBOOK.md` only with facts proven
in this pass and only where they are the current canonical record.

## Completion gate and stop point

Complete only when the Goal 0-3 receipts remain green and untouched; both new
items in Goal 4 have measured decisions; every available lane in Goal 5 is
complete and unavailable human lanes are labeled honestly; the security count
chain is explained path-by-path; the full Node 24 matrix is green with both
smoke runs and the tune assertion; screenshots and manifests were opened and
inspected; the launch-readiness checkpoint and exact-path staging proposal
exist; `git diff --check` is clean; and no dependency install, TMDB/rebake,
stage, commit, amend, push, PR, merge, deploy, production analytics query,
GitHub/Vercel setting change, indexing change, or other external mutation
occurred.

Stop at the **Local Launch-Readiness Review** checkpoint. Present Buri with
the verdict, the cutover-runway statement, the attended gaps, the changed-file
list, and the exact-path staging proposal. Ask separately whether to
stage/commit/push for exact-SHA CI. Even if that is authorized later, the
protected-Preview verification, production deploy, and removal of `noindex`
each require further independent approvals.
````
