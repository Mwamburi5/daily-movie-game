# Review A — "Where are we?" · reconciliation of every live plan vs reality

Read-only pass, 2026-09-03 (~12:00Z). No file in the repo was touched.

---

## 1. One-screen status

1. The 216+16 cutover **is on `main`** (`14a546e`, merged 2026-09-01 via PR #2). Code work is done.
2. **Production is not.** `matchcutdaily.com` still serves `c063f26` from 2026-08-18 — a build that contains **no cutover code at all** (`git show c063f26:src/data/duelPool.ts` has no `DAILY_DUEL_POOL_EFFECTIVE_DATE`).
3. Approvals 1–3 are complete and receipted. Approval 3 (protected Preview) passed 2026-09-03T01:25Z: security gate green, four-mode matrix 0 faults.
4. Approval 4 (prod deploy) is the next gate and is **not** blocked on engineering — it's blocked on one billing sentence from Buri.
5. The Vercel team plan reads back as **Hobby** → zero custom-event properties → the whole Goal 2 journey-analytics dictionary records nothing in production as designed.
6. `main` **cannot get a green CI run today**: `npm audit` fails on browserslist until PR **#9** (`codex/preview-gate-skip-toolbar`, 2 files, CI green, MERGEABLE) lands. It is open and unmerged as of this pass.
7. Attended lanes A–E remain `ATTENDED NOT RUN`. The scheduling pack that was specced to de-friction them (`docs/attended-lanes/`) **was never produced** — the directory doesn't exist.
8. Five untracked local-only docs + a gitignored `audit/.../preview/` tree hold the entire Approval 3–5 evidence chain. One `git clean` erases it.
9. Promo track is parked at Phase 0-captures, blocked on three unanswered questions, one of which (evergreen-practice) has **never been written down anywhere**.
10. Runway: **24 days** to 2026-09-27. Latest safe deploy ≈ **09-13**; recommended **09-04/05**.
11. Reframing nobody has stated: 09-27 is a *self-imposed content milestone*, not a correctness cliff. Miss it and prod just keeps dealing the legacy 89 pool. Nothing breaks.
12. Net: this is a decision backlog, not an engineering backlog. Four short answers from Buri unblock everything.

---

## 2. Gate / approval table

| Gate | State | What unblocks it | Evidence |
|---|---|---|---|
| Approval 1 — stage/commit/push | **DONE** 2026-09-01 | — | `docs/daily-duel-216-ship-receipt.md:12-19` (release commit `bdaa3f5`, 98 paths) |
| Approval 2 — exact-SHA CI + PR + merge | **DONE** 2026-09-01T11:54Z | — | ship-receipt:15-17; `main` = `14a546e` |
| Approval 3 — protected Preview | **DONE** 2026-09-03T01:25Z | — | `docs/daily-duel-216-preview-verification-receipt.md` P1:50-59, P2 run2:117-135, P3:150-203 |
| PR #9 merge (gate-skip harness + browserslist bump) | **READY — blocked on Buri** | one `gh pr merge`; CI green on `6b758b0`, MERGEABLE, not draft | run 33699865177; `git diff --stat origin/main..6b758b0` = 2 files |
| Provider property-cap verdict (checkpoint §6) | **BLOCKED-ON-MONEY / BLOCKED-ON-BURI** | Buri names the plan and rules: accept-Hobby, upgrade, or fold the dictionary to 2 props | preview-receipt:211-214 (`billing.plan = hobby`); `docs/daily-duel-216-deploy-and-indexing-runbook.md:8-43` |
| Approval 4 — production deploy | **BLOCKED-ON-BURI** (runbook makes §6 a precondition) | the §6 verdict + an explicit "deploy" | runbook:45-72; `npx --yes vercel@59.11.1` is the proven path (CLI not installed) |
| Post-deploy verification (SHA/asset/CSP/four-mode/noindex-still-present) | **NOT RUN** — auto-follows Approval 4 | the deploy | runbook:66-70; `docs/production-release-checklist.md:117-131` |
| Attended lanes A–E | **BLOCKED-ON-HUMANS** — the long pole | Buri picks 3 testers, sends outreach, books sittings; pack session produces the run-sheets | `docs/daily-duel-216-attended-acceptance.md:18-22`; pack spec `docs/daily-duel-216-attended-lanes-scheduling-goal-prompt.md` (unrun) |
| Lane target ruling (Preview vs local preview vs prod) | **BLOCKED-ON-BURI** (one line) | Buri rules; recommend production post-deploy | preview-receipt:239-241 ("lane participants need the same SSO-bypass access") |
| Rollback drill | **NOT RUN, ever** | 10 minutes on Vercel after Approval 4 | `docs/production-release-checklist.md:140`; target ID at goal-5 acceptance receipt line 26 is now **stale** |
| Approval 5a — `noindex` removal | **NOT AUTHORIZED** | soak + Buri go/no-go | runbook:77-88; the only robots control is `index.html:14` |
| Approval 5b — URL-in-share | **NOT AUTHORIZED** | Buri go/no-go; test-asserted surface | runbook:90-103; `src/lib/share.ts:6-8` |
| Approval 5c — front door | **DEFERRED by design** | 2-week post-launch interviews | runbook:105-109; master-plan §0 |
| Promo Phase 0-captures | **BLOCKED-ON-BURI ×3** | red-penned brand sheet + shot list + the evergreen-practice ruling | `promo/phase1-mockups-checkpoint.md:134-137`; `promo/phase0-docs-checkpoint.md:22-41` |
| Promo Phase 1 (brand kit) | **BLOCKED transitively on Approval 4** | `social-preview.png` 404s on prod until the new build ships | `promo/phase1-mockups-checkpoint.md:29-32`; runbook:70 |

---

## 3. Open decisions for Buri — ranked by runway burned

1. **Hobby-plan analytics.** Q: do the 3-property journey events need to record in production before we deploy? Options: (a) accept Hobby, deploy now, record "custom events unavailable on plan" as the §6 verdict; (b) Pro + Web Analytics Plus (~$30/mo total) — dictionary fits with headroom; (c) base Pro — 2-prop cap, over-cap behavior undocumented; (d) approved 2-property fold (code change → re-gates everything). **Recommend (a) now, revisit (b) during soak.** The runbook treats this as a deploy precondition; it shouldn't be. A $10/mo measurement nicety must not hold a hard-dated launch.
2. **Merge PR #9.** Q: merge the gate-skip + browserslist bump to `main`? Options: merge / hold and deploy `14a546e` as-is. **Recommend merge today.** Until it lands, `main` is red on every push — meaning a soak-period hotfix would start from a failing pipeline. The bundle is byte-identical either way (preview-receipt:147), so it costs nothing.
3. **Attended-lane scheduling.** Q: who, on what hardware, when? Options: 3 sittings if paired (A+D on the Mac, C+E on the Android, B on an iPhone) / abandon the lanes / narrow to A+D only. **Recommend: run the pack session this week, book weekends 09-06 and 09-13, keep all five.** This is the declared long pole and the only work that cannot be compressed by a decision.
4. **Lane target.** Q: do lanes run against the protected Preview, a local `npm run preview`, or production? **Recommend production after Approval 4.** The Preview needs a hand-minted ~1h SSO jar per participant and already failed once on a stale CLI token — an unworkable ask for a borrowed human with a phone.
5. **Evergreen-practice ruling.** Q: **nobody can restate the question.** It appears by name in 4 places (`ship-receipt:81`, `ship-pass-goal-prompt:133`, `promo/phase0-docs-checkpoint:28`, `promo/phase1-mockups-checkpoint:33,136`) and in memory, always as "the 08-20 ruling", never with its text. The only description is second-hand: whether the always-available practice affordances (`src/App.tsx:204,239,282,327` — four menu practice rows) survive launch. **Recommend: restate it first, then default to "practice stays."** Removing it is a menu change against a bundle with 0.15 KiB of headroom, 24 days out, and it re-cuts 6 of 9 promo shots.
6. **Docs-only commit of the untracked receipts.** Q: commit the 5 local-only docs + the preview evidence? Options: commit / leave local / commit docs but not the gitignored PNGs. **Recommend commit the docs now** — the entire Approval 3–5 audit trail currently exists in one working tree.
7. **Dependabot during the freeze.** Q: five open PRs including `vite 6→8` and `@vitejs/plugin-react 4→6` majors. No policy exists. **Recommend: close/snooze all five until post-launch**, accept only security-driven lockfile bumps (as #9 was). Merging a major violates the locked-deps guardrail and invalidates the bundle and tune evidence.
8. **Indexing pair timing (5a + 5b).** Q: when? **Recommend ~09-20, both together**, after ≥1 week of soak — that gives unfurls and crawlers a week's head start on the 09-27 event, and keeps the last 72h change-free.
9. **Promo amber (Phase-0 Q1) / Duel 216 captures (Q3) / menu-as-shot-1 (Q5).** Low burn — Q3 self-resolves after Approval 4; Q1 is already deferred to Phase 1. **Leave.**
10. **Front door.** Explicitly post-interview. **Leave.**

---

## 4. Stale-doc list (do not edit — one pass fixes all)

### `docs/daily-duel-216-launch-readiness-checkpoint.md`
- `:305` "stage / commit of this candidate | **NOT RUN**" → **DONE** 2026-09-01, release commit `bdaa3f5`.
- `:306` "push / exact-SHA CI | **NOT RUN** (branch tip `ce39837` remains unpushed, 1 ahead)" → **DONE**, CI green runs 33501320800 + 33503913820.
- `:307` "PR / merge to `main` | **NOT RUN**" → **DONE**, PR #2 merged 2026-09-01T11:54:03Z, `main` = `14a546e`.
- `:308` "protected-Preview verification | **NOT RUN**" → **PASS** 2026-09-03, `dpl_FTnTRXPKr4V1Hyz8Fu68AfPymr75`.
- `:312` "production analytics dashboard query | NOT RUN (provider cap item §6 pending)" → the §6 *docs* half is resolved and the plan is now known (Hobby); only the live query remains.
- `:315-321` §15 "**Next approval required: Approval 1**" → next is **Approval 4**, gated on the §6 plan verdict.
- `:24-33` §1 "27 days" runway → **24 days**.
- `:42-45` §2 baseline (branch `codex/daily-mode-polish`, HEAD `ce39837`, unpushed, 77 dirty paths) → superseded by merged `main` `14a546e`; the tracked tree is clean.
- `:62` F07 row and `:169` §9 attended row — statuses still correct, but both should name the new candidate SHA.

### `docs/daily-duel-216-attended-acceptance.md`
- `:3-4` candidate pinned to `ce398376…` + the 08-31 dirty worktree → should be **`14a546e79ae1af3206e470f8f555d74257ff3a58`** (the pack prompt already ordered this change; it never ran).
- `:31-32` "or the protected Preview once one exists for the pushed SHA" → one now exists; add its URL and the jar caveat, or replace with the ruled lane target.

### `docs/production-release-checklist.md`
- `:33` "[ ] Run `npm run verify:preview-security` against the protected Goal 5 Preview" → **run and GREEN** 2026-09-02 against the 216 Preview (not Goal 5's), after an approved 4-line harness change.
- `:40` "`npm run test:smoke` — **24/24**" → **38/38**.
- `:44-45` "Menu shell is **95.87 KiB** gzip" → **99.85 / 100 KiB** (0.15 KiB headroom).
- `:109-115` all six source-control/CI boxes unchecked → all six are now **done** (approval, scoped commit, push approval, green CI, PR merged, run URLs recorded).
- `:16-25` "Goal 5 candidate recorded 2026-08-19 … base `c063f26`" and `:164-174` "Launch-readiness candidate recorded 2026-08-31 … HEAD `ce39837` (1 ahead of origin, unpushed)" → both superseded; needs one current candidate block naming `14a546e`.
- `:87-95` production-baseline paragraph and `:101-102` rollback target `dpl_7Mk27AwKQ8vcN3CUPj666kfCPNx9` → after Approval 4 the rollback target becomes `dpl_8SighytERqgygRYvbf1eMyLis6SL`.

### `docs/security-launch-checklist.md`
- tail `:74-80` (local receipt 2026-08-31, "241 repository / 25 production files") → superseded twice: ship pass 244/26, preview pass 285/25.
- No record anywhere in this file of the `scripts/verify-preview-security.mjs` change, even though the preview receipt (`:117-124`) says it "re-opens security checklist items." Add the harness note + the re-run result.

### `docs/goal-5-public-launch-acceptance.md`
- tail `:34-40` — "[ ] Reviewed Goal 5 scope committed…", "[ ] Push separately approved…", "[ ] Protected Vercel Preview separately approved and deployed from that SHA", "[ ] Preview protection tested; reviewer path works", "[ ] Required headers/CSP … verified on the protected Preview" → all now true **for the successor candidate**. This doc lacks the superseded-candidate banner that `daily-duel-216-attended-acceptance.md:6-9` carries. Add one rather than ticking boxes across candidates.
- `:25` TLS "valid 2026-07-05 through 2026-10-03" → expires 6 days after cutover; confirm Vercel auto-renew.

### `docs/master-plan.md`
- §6 Ledger (`:376-1055`) has **no entry** for: the 2026-09-01 merge to `main`, the 2026-09-01/03 Preview verification, the Hobby-plan finding, or the harness/lockfile branch. Last ledger state is the 08-31 checkpoint. Three new `[x]` lines needed.
- §10 amendment log `:1596-1611` (v5, 2026-08-31) ends "Next: Buri's **Approval 1**… 27-day runway at writing" → needs a **v6** entry.
- `:44` §1 recon snapshot "main == origin/main @ `7ef95aa`" → dated 07-06 snapshot; harmless but misleading in a doc that's read as current.

### `docs/daily-duel-216-ship-receipt.md`
- `:70-71` "Still separately gated (NOT approved, NOT run): 1. Protected-Preview verification…" → **done**.
- `:74` "Provider property-cap confirmation (checkpoint §6) — pre-deploy item" → the plan is now known; the item is a *decision*, not a lookup.
- `:80` "26 calendar days from merge" → 24 remain.

### `BACKLOG.md`
- All five items (`:8-27`) — How-to-Play modal, persist personal bests, share button, keyboard hints — **shipped months ago**. This file is scaffolding from `6eb352a` that was never reconciled and reads as a live work queue. Highest risk of causing redundant agent work of anything in the repo.

---

## 5. Risks nobody has written down

- **R1 — The verified artifact and the deploy target diverge the moment #9 merges.** The Preview receipt certifies `14a546e`. Merging #9 makes `main` a new SHA. The receipt *does* assert the rebuild is byte-identical (`:147`), so the certification transfers — but no document says so, and no runbook step tells the deploy session which SHA to ship. Deploying `14a546e` instead means shipping a lockfile with two known high advisories.
- **R2 — `main`'s CI is red by default.** Until #9 lands, any push to `main` or `codex/**` fails at `npm audit` (preview-receipt:146). A soak-period hotfix would begin from a failing pipeline — exactly when you'd least want to debug the harness.
- **R3 — Five unruled Dependabot PRs**, including `vite 6→8` and `@vitejs/plugin-react 4→6` majors, sitting open against a locked-deps guardrail with no freeze policy written anywhere.
- **R4 — The 216 cutover deal has never actually been played.** Every gate exercises the *current* date's legacy-pool deal; the preview receipt says so explicitly (`:200-203`). `verify:solo` pins the boundary numerically, but no human or matrix has ever loaded a ≥2026-09-27 board in a browser. The attended lanes already require a device-clock override for the 09-25 board (acceptance `:44-47`) — the rig exists, nobody thought to also demand a **clock-set 09-27 play of Daily Puzzle + Duel on the 216 pool**. This is the single largest correctness gap for the actual launch event and no plan lists it.
- **R5 — The menu-shell budget (99.85/100 KiB) collides with the launch switches.** §7·8(4) of the master plan promises the front door "a landing-page-quality presentation pass" *when URL-in-share flips*. That's shell-side. `check:bundle` will fail. No doc connects the budget warning to the Approval-5 work it will block.
- **R6 — The evidence chain is one `git clean` from gone.** Ship receipt, preview receipt, runbook, lanes prompt, preview goal prompt — all untracked; `audit/` is gitignored and only 24 files were force-added into `bdaa3f5` (the preview evidence came later and is **not** among them).
- **R7 — The SSO jar makes Preview-based attended lanes impractical.** ~1h expiry, hand-minted by Buri, already failed once on a stale CLI token (preview-receipt:152-155, 205-207). Any plan that routes borrowed testers through the Preview will die on logistics.
- **R8 — The rollback drill has never been run**, and the recorded rollback target is already stale (it names the deployment *before* current prod).
- **R9 — Promo Phase 1 is blocked on Approval 4** via the `social-preview.png` 404, and no doc in either track notes the dependency.
- **R10 — An open ruling with no written question.** The evergreen-practice item has been carried for 14 days by name only. Whatever answer Buri gives, it will be an answer to a reconstructed question.
- **R11 — `ChronologyGame.tsx:1054` "1 strokes"** — found during P3, described-not-fixed, and recorded in no backlog or ledger. It will be lost.
- **R12 — No plan states what happens if 09-27 slips.** Because prod has no cutover code at all, the honest answer is "nothing" — but nobody has written that, so the date is being treated as a cliff.

---

## 6. Timeline sanity (backward from 2026-09-27, a Sunday)

| Date | Day | What must be true |
|---|---|---|
| **09-27** | Sun | First 216-card Daily fires. Prod must be serving the cutover build. |
| 09-24 → 09-26 | Thu–Sat | **Hard change freeze.** No deploys inside 72h of the cutover. |
| **09-20** | Sun | **Latest safe Approval 5** — noindex + URL-in-share together, deploy, verify. Gives crawlers/unfurls a week before the event. |
| 09-15 → 09-19 | Tue–Sat | Buffer for one lane-defect round-trip (fix → gates → redeploy → re-verify ≈ 2–3 days). |
| **09-13** | Sun | **LATEST SAFE PRODUCTION DEPLOY.** Past this, the cutover fires on a build with under two weeks of soak and no room for a lane-found defect. |
| 09-12 / 09-13 | Sat/Sun | Backstop attended weekend — any lane not closed on 09-06. |
| 09-06 / 09-07 | Sun/Mon | **Primary attended weekend.** 3 sittings: A+D (Mac + VoiceOver), B (iPhone), C+E (Android + TalkBack). |
| **09-04 / 09-05** | Fri/Sat | **RECOMMENDED DEPLOY.** Approval 4 executes; post-deploy verification; soak starts; lanes get a real production target. |
| **09-03 / 09-04** | Thu/Fri | Merge PR #9 · rule the Hobby-plan verdict · run the attended-lane pack session · Buri sends 3 outreach messages · docs-only commit of the receipts + the §4 fixes. |

**Latest safe deploy: 2026-09-13.** Recommended: **09-04/05** — it buys two spare weekends for the only work that can't be compressed by a decision, and every day it slips comes straight out of attended-lane slack, not out of soak.

**The pressure valve:** if 09-04 slips, nothing breaks. Production has no cutover code, so an undeployed 09-27 simply means the legacy 89 pool keeps dealing and the 216 Daily starts whenever you ship. The date is a milestone you chose, not a deadline the code imposes.

---

**Least confident:** the exact human cost of the attended lanes. I'm treating three sittings × ~30 min as the plan of record because the pack prompt says so, but no lane has ever been run on this project — the real bottleneck is Buri finding three willing people with the right hardware, which could be a day or three weeks, and nothing in the docs calibrates that.

**What Buri might be missing:** the 09-27 date is doing more work in these documents than it earns. Nothing on production breaks if it slips — prod has no cutover code, so the legacy pool just keeps dealing. Meanwhile four unanswered questions (Hobby plan, PR #9, lane target, evergreen practice) are each individually a two-minute answer, and together they are the entire critical path. The risk isn't running out of days; it's spending them waiting on decisions while treating a self-imposed content milestone as a hard deadline — and, relatedly, that nobody has yet played a single 216-pool board in a browser.
