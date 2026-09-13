# Match Cut — build-process retrospective (2026-09-08)

Written 2026-09-08 from `docs/process-retrospective-kickoff-prompt.md`, read-only.
UNTRACKED by design (same family as the other kickoff outputs). Evidence base:
`HANDOFF/`, `audit/process-retro-2026-09-08/` (session table, session digest,
long prompts, inventory), the prompt files and their receipts, `docs/master-plan.md`,
git and PR history, and the raw session transcripts under
`~/.claude/projects/-Users-mwamburi-Projects-Daily-Movie-Game/`. Seven Opus
sub-agents (sections A–G of the kickoff) returned numbers with pointers; this
file reconciles them. Where the analysts disagree the file says which number
it uses and why. Nothing in the tree other than this file was changed.

Conventions: session ids are the 8-char prefixes in
`audit/process-retro-2026-09-08/session-table.md`; commit shas are from
`git log`; "the digest" = the four files in `audit/process-retro-2026-09-08/`.
Buri = the owner (they/them).

---

## 1. TL;DR

1. In 90 calendar days (2026-06-11 → 09-08) the process shipped a four-mode
   game with a parity-gated rules engine, a drilled 7-second rollback, and
   production watchers, on roughly 105 owner messages and an estimated 15–28
   owner-hours (section C.3; `docs/daily-duel-216-production-deploy-receipt.md`).
2. Machine effort was large and skewed: 6,245 recorded assistant turns across
   35 Claude sessions (plus at least 6 transcript-less Codex runs), 1.76 billion
   tokens of which 26% went to sub-agents, and five sessions carrying 36% of
   all turns (sections A.3, B.1, E.3).
3. The measurable waste was not bad work but latency on human-only steps and
   unbounded fan-out: a 20-day dead zone with 8 approved commits undeployed
   (07-17 → 08-07), a 32-hour block on a 30-second cookie mint, a 25-day PR,
   a 19-day unwritten question, and a review fleet that lost 44% of its tokens
   to session limits (sections A.2c, A.2d, E.2, G.1).
4. Gates caught 27 real defects, almost all through machine gates and
   adversarial review, while 10 of 18 UI checkpoints changed nothing; the one
   gate class that has found defects on real assistive tech (attended lanes)
   has never been run on the launch build (section C.2, C.1e).
5. Documentation ran at one line per line of code overall and 2.6:1 since
   09-01; 79% of the 167 docs were never edited after creation, the live set
   is 19% of the corpus, and the four gate counts live in 36 files with the
   DuelGame line count carrying six different values (section D).

**Verdict:** efficient per owner-minute, inefficient per calendar day. The
process is over-built for writing and gating machine output, and under-built
for scheduling the handful of steps only Buri can take.

---

## 2. Metrics table

Phase rows follow `HANDOFF/05-plans.md` §Timeline. Sessions and turns are from
`session-table.md` with one correction: session `20cedd93` (09-08) has 102
non-sidechain assistant turns in its transcript, not 7, so the corrected total
is **6,245**, not 6,150 (section B, transcript
`~/.claude/projects/-Users-mwamburi-Projects-Daily-Movie-Game/20cedd93*.jsonl`).
Commits are from `git log` (105 on `main` at `d22a255` + 3 on
`codex/handoff-and-stale-docs` = 108). ⚠ = the window has commits or receipts
but **no Claude transcript** (June 11–27, 07-01 → 07-08, 08-24 → 08-30 ran in
Codex `/goal` or pre-date the transcript set); those cells are digest gaps,
not free work.

| # | Phase | Dates | Days | Sessions | Turns | Commits | PRs | Shipped | Rework observed |
|---|---|---|---|---|---|---|---|---|---|
| R1 | Pivot, Duel + Solo, sim contract, flow package | 06-11 → 06-22 | 12 | ⚠ 0 | 0 rec. | 0 (pre-git) | 0 | live on `marquee-one-iota.vercel.app` (memory `marquee-flow-diagnosis`) | go-out bonus built, measured a dud, dropped |
| R2 | Funpass sim → lock → port → retune | 06-23 → 06-30 | 8 | 1 (`320546cc`) | 386 | 0 (pre-git) | 0 | verify 62/62, RULESET §11 | 2 levers rejected after probes; take×wild conservation bug found in port (memory `marquee-funpass-decisions`) |
| R3 | Chronology Phases 1–6 | 06-28 → 06-30 | 3 | 1 (`5c62ada1`) | 125 | 0 | 0 | Mode 3 playable (`docs/chronology-tasks.md`) | none found |
| R4 | Review priorities + jumpstart | 07-01 → 07-03 | 3 | ⚠ 0 | 0 rec. | 1 (`266390c`) | 0 | deployed 07-03; real Solo daily; `verify:solo` | tune baseline "50/42" was a lucky sample; tilt found real (memory `marquee-review-priorities`) |
| R5 | `PLAN.md` WS1–WS5 + Amendment 1 | 07-04 → 07-05 | 2 | ⚠ 0 | 0 rec. | 6 | #1 | WS1 + A1–A3; `609a611` = 57 files / 8,404 ins | `PLAN.md` superseded 24 h later |
| R6 | orchestration-plan v2 + ui-tasks (Wave 0/A) | 07-05 | 1 | ⚠ 0 | 0 rec. | (in R5) | #1 | Wave 0; Wave A forge `7ef95aa` (959 lines) | both plans superseded next day; PR #1 lived 20.5 h |
| R7 | **Master plan W0–W6 + P1 + P2 + M4a → SEND** | 07-06 → 07-10 | 5 | 10 | 1,920 | **50** | 0 | live at matchcutdaily.com (`c14114a` → `0e1e403`) | plan reset; review fleet died twice (13/18); "SEND: GO" (`e970e455`) reversed next day by 4 majors |
| R8 | Post-SEND: analytics, chrono fix, Stage B, feedback batch 1, minors | 07-10 → 07-17 | 8 | 6 | 1,468 | 19 | 0 | `61ec120` → `0d0a172`; chrono pool 162 → 438 (`c87ac3c`) | `codex/chronology-reel` approved 07-12, never merged; `ab4d5447` died on limit |
| — | **Dead zone** | 07-18 → 08-06 | **20** | **0** | 0 | **0** | 0 | nothing | 8 approved commits + 1 approved branch undeployed (`4de0b2cd` closing message) |
| R9 | Status audit → §9 polish P0–P4 + Wave 3 | 08-07 → 08-09 | 3 | 1 (`4de0b2cd`) | 96 | 7 | 0 | RC `5316b04`; prod `a710fff` | reel rebuilt on main (`869fa90`: +406/+105 lines) instead of merging the approved branch |
| R10 | Full product review kickoff | 08-09 | 1 | 1 (`f43225a3`) | 95 | 0 | 0 | nothing | died on limit, 0 commits, 33M sub-agent tokens lost (E.1) |
| R11 | Polish Goals 2–5 + onboarding | 08-18 → 08-24 | 7 | 3 | 392 | 4 | #3 | prod `c063f26`; `31bc25f`; `ce39837` | `BACKLOG.md` stale from birth (items 1–3 already built) |
| R12 | **216+16 cutover → full review → now-fix** | 08-24 → 08-27 | 4 | ⚠ 0 (Codex) | ⚠ 0 | 0 (deferred into `bdaa3f5`) | 0 | cutover/release/now-fix checkpoints | 2 P1s reopened a "complete" candidate; candidate lived 8 days as an uncommitted dirty tree |
| R13 | Launch-readiness Goals 0–8 | 08-28 → 08-31 | 4 | 1 (`2bbeed14`) ⚠ | 48 | 0 | 0 | checkpoint 08-31; 409-line manifest | Goals 0–3 stopped mid-flight with no checkpoint; 15.8 KB resume prompt needed |
| R14 | Promo Phase 0 + Canva sprint | 08-31 → 09-01 | 2 | 3 | 439 | 0 | 0 | brand sheet, shot list, 9 mockups | 2 of 3 mark directions retired on sight; one full "these look basic" redo |
| R15 | Approvals 1–2 ship pass | 09-01 | 1 | 3 | 622 | 3 | **#2** | `bdaa3f5` (98 files / 199,444 ins) → `14a546e` | evidence exclusion reversed same day (2 `audit/` dirs force-added) |
| R16 | Approval 3 protected Preview | 09-01 → 09-03 | 3 | 1 (`3aeebadf`) | 268 | 3 | #9 | Preview green after `0dd6c8d` + `6b758b0` | gate red once (Vercel Toolbar); jar minted ≥3× |
| R17 | Five-agent review → three polish batches | 09-03 | 1 | (inside `3aeebadf`) | — | 9 | #10–#13 | `9a5fdbb` | c6 dropped (stale premise); c12 shipped 89 not 86 |
| R18 | **Approval 4 production deploy** | 09-04 → 09-05 | 2 | 1 (`ea8a2717`) | 224 | 3 | #14 | `dpl_HWeNAMnK…` live, crons on (`d22a255`) | 6 recorded deviations; jar mint took 32 h; 4 FAIL receipts deleted |
| R19 | Campaign plan + status review | 09-05 → 09-06 | 2 | 2 | 60 | 0 | 0 | `launch-campaign-plan.md`, `launch-status-review-2026-09-06.md` | none found |
| R20 | Handoff + stale-docs + master-plan v6 | 09-08 | 1 | 1 (`20cedd93`) | 102 (corrected) | 3 | #16 open | `5d0ec9a`, `1795afa`, `3fb5c0e` | the stale-docs pass is itself drift cleanup (24 files touched) |
| | **Total** | 06-11 → 09-08 | **90** | **35** (≥41 incl. Codex) | **6,245** | **108** | **16** (9 merged, 6 Dependabot unmergeable by policy, #16 open) | production `main@9a5fdbb`, 4 modes | ~10% of turns; 22% of calendar days idle |

Five headline numbers (section A.3, B.1, C.3, E.3):

| Metric | Value | Pointer |
|---|---|---|
| Active days | 27 of 90 (30%); longest idle stretch 20 days | `commits-per-day.txt`, `session-table.md` |
| Session length | median 140 turns, p75 260, max 494; top 5 sessions = 36% of all turns | `session-table.md` |
| Owner messages | 105 typed + 4 slash commands + 7 interrupts across all Claude sessions | transcripts, section C.3 |
| Tokens | 1,764,570,476 total; 465,434,085 (26.4%) in 115 sub-agent transcripts | `message.usage` in transcripts, section E.3 |
| Rework share | 2.8% of turns provable, ~10% best estimate, 18% ceiling (all assurance work); 22% of calendar days idle | section A.3, three methods stated there |

---

## 3. What worked (ranked, with evidence)

1. **The sim contract and gate counts.** `sim/RULESET.md` + `verify` 64/64 ·
   8/8 · 42/42 · 14/14 caught a parity break (draw-3 wild burn, `f153662`),
   the 84%-accidental-solution Connections grids (`docs/connections-yield.md`),
   the browser-OOM dealer (`27a2904`), the Wave 3 CI cancellation, and held
   through a 216-film cutover with a re-tune over 8,000 games per tier
   (`docs/daily-duel-216-release-checkpoint.md`). No shipped rule regression
   is on record. Cost: 2.5 min per full run.
2. **Byte-identity and provenance gates at release boundaries.** Approval 3
   found the Vercel Toolbar injection and the Tailwind source-scan hash drift
   (`docs/daily-duel-216-preview-verification-receipt.md` §P1–P2); Approval 4
   proved three sha256s against a filtered rebuild and replayed the 09-27 seed
   on production bytes (`…production-deploy-receipt.md` §P1, §P4). These are
   the two gates that turned "we think it deployed" into evidence.
3. **Read-only multi-agent reviews over disjoint areas.** The six-auditor
   recon produced master-plan v2 wholesale (`docs/master-plan.md` §1); the
   five-agent pre-launch review produced D1–D11 with 7 reconcile turns and
   2.6× speed-up (`docs/prelaunch-review-2026-09-03.md`, section E.4); the
   18-area fleet, once it finished, found the year-in-DOM leak, the decade-rail
   leak, the analytics replay desync, and the Domine `tnum` no-op
   (`docs/master-plan.md` §7·7). The pattern pays when the areas are named,
   read-only, and synthesized in the same session.
4. **Worktree lanes with disjoint files and a PR merge path.** PRs #10–#12
   merged CLEAN with 26 orchestrator turns for three PRs plus receipt
   (`docs/prelaunch-polish-kickoff-prompt.md` receipt; section E.4). W3's five
   lanes shipped in one commit (`5802a84`). The July diff-apply merge pattern
   (memory `marquee-orchestration-workflow`) was the fragile precursor; PRs fixed it.
5. **Preconditions with a stop-read-only clause.** Approval 4's precondition 2
   stopped the agent on the unruled `DAILY_EPOCH` question instead of guessing
   (`…production-deploy-receipt.md` deviation 1); the ship pass staged 98
   explicit paths and left the promo family untouched (`bdaa3f5`). Prompts
   scoring ≥6/8 on the house checklist had 0 of 8 sessions die on the limit
   and delivered first-pass 64–67% of the time, against 0–17% below 6
   (section F.2).
6. **Gate-split autonomy for objective lanes.** P1 pool unification landed
   byte-identical and M4a's dealer lock landed with a 365-grid pin, both
   without a checkpoint (`a5eabd0`, `151a9f5`); 07-06 alone carried 20 commits.
   Objective work never waited on Buri and never shipped a regression.
7. **The Stage B split-arbitration pattern.** Two Opus passes resolved 45 of
   47 date flags for 1.0M tokens in 3.2 minutes; Buri ruled on 2 (`8dcb1e6`,
   `c7352d3`). The 74-strike pass cost Buri 20 measured minutes for a 352-film
   slate (section C.3). This is the cheapest owner-in-the-loop content gate on record.
8. **Clean wind-downs.** 15 of 35 sessions ended with memory updated and the
   next kickoff written (section B.2). The four fastest boots in the corpus
   (7 turns each) are all "Read `docs/master-plan.md` FIRST" boots
   (`4694b8ff`, `7f37d2a1`, `e970e455`, `320546cc`).
9. **Buri's compression.** The single largest measured block of owner
   attention was 73 minutes (07-10 launch day, five concurrent sessions); the
   W5b three-decision grill took 18 minutes; a feedback wave was closed with
   a 20-character approval after a hands-on play (`481768a`). Roughly 20
   owner-minutes per calendar day produced a live, receipted product (section C.3).

---

## 4. What it cost (ranked by turns or days lost, with evidence)

1. **The July freeze that never closed: 20 idle days, 32 days of stale
   production.** §2.11 batched fixes "to window close ~07-24"; the window never
   closed. Last commit `0d0a172` 07-17 12:51, next `869fa90` 08-07 19:33;
   production stayed on the pre-07-16 build until `dpl_8Sighyt…` on 08-18
   (`4de0b2cd` closing message; deploy receipt "production before"). Eight
   approved fix commits and the approved `codex/chronology-reel` reached no
   player for 22–32 days; the reel was then rebuilt on main (`869fa90`, ~511
   of 1,415 insertions). The interviews the freeze protected slid from 07-24
   to 10-11 (`HANDOFF/04-decisions.md` reversed row 8). This is 22% of the
   project's calendar and produced nothing.
2. **Unbounded fan-out against a usage limit: ~67M tokens and 2 sessions.**
   Fleet run 1 dispatched 52 agents, journaled 13 results, 24 agents died at
   zero tokens, 39 produced nothing; 44.4% of the run's 151.8M tokens bought
   nothing (`~/.claude/projects/…/workflows/wf_1d71f814-e14.json`, section E.2).
   The same-session-only resume forced session `1cba6766` and a rewritten
   script. `f43225a3` repeated the shape: 4 agents, 33M tokens, session died
   before synthesis, zero artifacts (E.1). The four sessions with the largest
   fan-out are exactly the four that hit the 429 (B.5). The process retro
   itself was one of the five areas that died, and is 60 days late.
3. **Human-only steps on the critical path with no scheduling: ~34 h blocked
   for ~13 min of work.** Approval 4's Preview deployed 09-04T13:07Z; the jar
   was minted 09-05T21:21Z; P1→P5 then ran in 13 minutes. Three "done" replies
   arrived with no file on disk; four FAIL receipts were written and deleted
   (`…production-deploy-receipt.md` deviation 3). Approval 3 needed ≥3 mints
   because the jar expires hourly and the first script path was wrong
   (`long-prompts.md` `3aeebadf` #2, #7). Estimated ~75 wasted turns (A.2d).
4. **The 25-day release PR and the 73→77→79 dirty-path chain.** PR #2 was open
   08-07 → 09-01 with 161 files / 212k additions; the cutover lived as an
   uncommitted tree 08-24 → 09-01; three consecutive prompts asserted 73, 77,
   then 78 dirty paths and the receipt found a 79th
   (`…launch-readiness-resume-goal-prompt.md:105`, `…checkpoint.md:48`,
   `…ship-receipt.md:44`). The launch-readiness pass stopped mid-flight on
   08-28 with no checkpoint, which is why a 15.8 KB resume prompt exists (A.2f).
5. **The ~25-turn ground-truth ritual every session, regardless of kickoff
   quality: ~1,044 turns (16.7%).** Median strict boot is 24.5 turns for a
   file-based kickoff and 27 for "where are we?" (B.3). The file pattern cut
   boot *minutes* 3× against inline dumps, but not turns. Six short sessions
   were 68–93% boot (`c99087a0`, `290b5289`, `2bbeed14`, `b42c40c2`,
   `01ea3df5`, `83c6d87f`).
6. **Three plans in 44 hours: ~596 dead plan lines and a permanent banner
   tax.** `PLAN.md` (07-04) → `docs/orchestration-plan.md` (`8871467`, PR #1,
   07-05 21:13) → `docs/ui-tasks.md` (`fd3fc5a`) → `docs/master-plan.md`
   (`c14114a`, 07-06 17:42). PR #1 lived 20.5 hours. The thinking survived;
   four files now carry banners and every boot prompt restates "the only live
   plan" (14 files, section D.5).
7. **Ceremony checkpoints: ~10 of 18 UI checkpoints changed nothing.**
   "approve both as-is" (`d16e974`), "everthing looks good" (`481768a`), four
   of five W4 flags ratified (`6d88362`), W5d "as shipped" (`d41db69`), while
   the sessions preparing them ran 430–494 turns (`4694b8ff`, `1cba6766`,
   `2da3c5fc`). Each cost Buri 4–18 measured minutes; each cost a session its
   stop (C.1a, C.2).
8. **Documentation volume: 38,075 doc lines vs 39,235 code lines, 2.6:1 since
   09-01, and copies that drift.** 79% of docs never edited after creation;
   5,771 lines (16%) never referenced again; the gate quadruple in 36 files;
   DuelGame's size in 6 files with 6 values, including `CLAUDE.md` 385 lines
   stale (D.2, D.5). The 09-08 stale-docs pass touched 24 files (`1795afa`,
   `3fb5c0e`).
9. **Prompts that could not finish in one pass.** Every prompt ≥18k chars
   with more than ~5 gated units failed to complete its scope: launch-readiness
   (24.6k, 9 goals, 4 done), full review (24.3k, no gate, died), pool
   expansion (18.1k, paused), 200-card cutover (25.6k, target moved to 216)
   (F.3). The 35.5k production-polish prompt completed because it carried
   five phased checkpoints.
10. **Small structural leaks.** `BACKLOG.md` stale from birth (`6eb352a`,
    struck 09-08); the D4 evergreen-practice question open 19 days because it
    "was never written down" (`docs/prelaunch-review-2026-09-03.md` D4); six
    Dependabot PRs open with no `ignore:` block after D10 ruled "snooze"; 90
    review-B screenshots (22 MB) that exist only on Buri's Mac; the analytics
    journey dictionary built, verified, and inert on Hobby (`HANDOFF/04`
    reversed row 11).

Fairness note, both directions: a structured team would have shipped the same
product in fewer sessions by (a) never freezing deploys without a dated owner
slot, (b) capping fan-out to what one session can synthesize, (c) committing
atomically so no 79-path tree exists, and (d) keeping one plan. It would not
have had better gates: the sim contract, the byte-identity receipts, and the
sequenced Approvals are better than the median small-team release process.

---

## 5. Gate audit

Legend for **caught**: 🔴 real defect · 🟠 design or scope change · ⚪ ceremony
(approved as-is, nothing changed) · — not reached. Buri minutes are measured
from transcript timestamps where a session exists and estimated (est.) where
the gate ran in a Codex window; method in section C.3. Agent turns are the
booting session's turns from `session-table.md`.

| Gate | Date | Type | Decided | Caught | Buri min | Agent turns | Pointer |
|---|---|---|---|---|---|---|---|
| Six-question launch grill | 07-04 | grill | goal=public · front door by interviews · persistence lifted · build Connections · quiet=noindex · winner=interviews | 🟠 ×6 | pre-transcript | — | `HANDOFF/04` rows 2026-07-04 |
| WS2 content grill | 07-05 | grill | split TMDB pass · content rules · `DUEL_POOL_IDS` freeze | 🟠 ×8 | pre-transcript | — | `docs/tmdb-rulings.md` |
| TMDB wave 1 + 2 arbitration | 07-05 | arbitration | 4 + 25 rulings, standing policies | 🟠 | pre-transcript | — | memory `marquee-review-priorities` |
| Six-auditor recon → plan reset | 07-06 | review | master-plan v2 | 🔴 0% Stub pixels reachable | est. 30 | ⚠ Codex | `docs/master-plan.md` §1, `c14114a` |
| W1 checkpoint | 07-06 | UI | five wires + 7a + 7e | ⚪ | est. 10 | ⚠ | `fe61a3f` |
| W2 grill/checkpoint | 07-06/07 | UI+grill | flip-to-peek permanent; divergence accepted; D1 parked | 🟠 | est. 10 | ⚠ | `23f43e0`, `a1354be` |
| W3 inc. 2 checkpoint | 07-07 | UI | flags b, c flipped; `Card.tsx` deleted; a, d kept | 🟠 2 · ⚪ 2 | est. 10 | ⚠ | `ed798b3` |
| W4 five-flag grill | 07-08 | UI+grill | share ⬛→🟩; 4 flags ratified | 🟠 1 · ⚪ 4 | est. 10 | ⚠ | `6d88362` |
| W5a readouts | 07-08 | objective | tune 65.5/49.7/41.8 on target; tilt 9.5pp measured | 🔴 tilt quantified | 0 | ⚠ | `3ec5b52`, `docs/mode-readouts.md` |
| W5b three-decision grill | 07-08 | grill | tilt SHIP · cutover DEFER→LOCK · diversity LEAVE | 🟠 ×3 | **18** | 70 (`7f37d2a1`) | `5e0f644` |
| W5c scoping grill | 07-08 | grill | 3 features scoped | 🔴 mis-scope caught (end stats already shipped) | — | ⚠ | `6542269` |
| W5c checkpoint | 07-08 | UI | "all three ✅" | ⚪ | est. 10 | 70 | `09a02d0` |
| W5c follow-ups | 07-09 | UI | "approve both as-is", taunts kept | ⚪ | ≤5 | **494** (`4694b8ff`) | `d16e974` |
| SEND-readiness | 07-09 | review | "GO — pending your button"; year-in-DOM listed as non-blocking | 🔴 mis-triage (reversed next day) | — | 140 (`e970e455`) | `sessions.md` `e970e455` |
| 18-area review fleet (2 runs) | 07-09/10 | review | 18/18 areas after re-run | 🔴 year-in-DOM · decade rail · wild burn · menu 667 no-scroll · analytics desync · Domine tnum · a11y cluster | 18 + 4 | 207 + 430 | `2faf775c`, `1cba6766`, `f153662` |
| W5d checkpoint | 07-10 | UI | approved as shipped | ⚪ | 4 | 430 | `d41db69` |
| W5e + W6 SEND | 07-10 | UI + deploy | approved + public-URL amendment | 🟠 scope | in 73-min burst | 252 (`11aec86b`) | `0e1e403` |
| UI-overhaul intake | 07-10 | ruling | "I agree with everything" | ⚪ | in 73-min burst | 42 | `ddf599a` |
| Analytics-slice deploy | 07-10 | deploy | deploy then text | ⚪ | 2 | 233 | `61ec120` |
| Chrono overflow fix + deploy | 07-10 | Buri's play → deploy | Option A; §2.11 exception (a) | 🔴 score-corrupting hit-test | 47 | 279 (`6e82d36d`) | `267a8be`, `4ea4038` |
| Stage B strike pass | 07-12 | arbitration | 352 → 74 struck | 🟠 | **24** (20 on the list) | 248 (`736dfca4`) | `def0a1e`, `long-prompts.md` #4 |
| Stage B arbitration + deploy | 07-12 | arbitration + deploy | 2 rulings + 3 merge-time; catalog live | 🟠 | 12 | 248 | `8dcb1e6`, `c7352d3`, `c87ac3c` |
| Chronology Reel plan review | 07-12 | review | greenlit + 4 amendments (ambiguity guard would have broken) | 🔴 | — | 21 (`855cc779`) | `sessions.md` `855cc779` |
| Feedback batch-1 rulings | 07-16 | grill | A1 naming, ship slice greenlit | 🟠 | — | 432 (`2da3c5fc`) | `3d84a15` |
| Feedback batch-1 checkpoint | 07-17 | UI | "everthing looks good"; C4 rail deviation ratified | ⚪ | 18 | 432 | `570edb8`, `481768a` |
| §7·7b/7c minors | 07-17 | UI | never reached checkpoint; race-to-20 timing flagged not built | — | 0 | 446 (`ab4d5447`, died) | `0d0a172`, `4b9ca3c` |
| Status audit + menu reorder | 08-07 | review + UI | Duel demoted; reel direction; ticket rack; Option A "Today's bill" | 🟠 ×3; 🔴 stale prod found | est. 25 | 96 (`4de0b2cd`) | `HANDOFF/04` 2026-08-07 |
| Wave 3 pick + deploy | 08-08 | arbitration + deploy | 67 cards over the 36 recommended | 🟠 | est. 20 | ⚠ | `a710fff` |
| Full product review | 08-09 | review | died | — | 0 | 95 (`f43225a3`, died) | `sessions.md` `f43225a3` |
| Goals 2–4 deploy | 08-18 | deploy | prod `c063f26` | ⚪ | est. 10 | ⚠ | `c063f26` |
| Goal 5 attended lanes (Safari, VoiceOver, 200%) | 08-19 | attended | passed | 🔴 identical spoken names on Duel draw choices | est. 65 | 160 (`f3f59ecf`) | `docs/goal-5-public-launch-acceptance.md` |
| Onboarding checkpoint | 08-20 → 08-24 | UI | four static screens | 🟠 | 45 (only image paste) | 210 (`e9809b98`) | `ce39837` |
| 216 picker → release checkpoint | 08-24 → 08-26 | arbitration | 216/0/6 + 16 wilds + 09-27 epoch | 🟠 | est. 60 | ⚠ Codex | `docs/daily-duel-216-release-checkpoint.md` |
| Full review → now-fix | 08-26/27 | review | 2 P1s + copy on a "complete" candidate | 🔴 320px title collision; fixture leak | est. 10 | ⚠ Codex | `…now-fix-pass-checkpoint.md` |
| Launch-readiness checkpoint | 08-31 | checkpoint | §12 approval sequence adopted | 🟠 | 9 | 381 (`56bff76e`) | `…launch-readiness-checkpoint.md` §12 |
| Approval 1 (stage/commit/push) | 09-01 | approval | 98-path release commit | ⚪ | 3 | 196 (`5c21940b`) | `bdaa3f5` |
| Approval 2 (CI/PR/merge) | 09-01 | approval | PR #2 → `14a546e` | 🔴 add/add conflict, 79th path | 2 | 196 | `…ship-receipt.md` deviations |
| Approval 3 (protected Preview) | 09-01 → 09-03 | approval | Preview green; 2 sub-approvals | 🔴 Toolbar injection · Tailwind hash drift · `npm audit` red · Hobby no events · no git integration | ~40 + 2 mints | 268 (`3aeebadf`) | `…preview-verification-receipt.md` |
| Five-agent review rulings D1–D11 | 09-03 | review + grill | D1 Hobby · D5 104 KiB · D6 keep · D8 accept · D10 snooze; D4 unruled; D3/D7/D11 open | 🔴 D5 budget freeze; D1 | ~10 | (inside `3aeebadf`) | `docs/prelaunch-review-2026-09-03.md` |
| Polish batches (measure clause) | 09-03 | objective | PRs #10–#13 | 🔴 c6 stale premise; c12 divisor 86 regresses | 0 | 3 sub-agents | `…prelaunch-polish-kickoff-prompt.md` receipt |
| Approval 4 (production deploy) | 09-04/05 | approval | `dpl_HWeNAMnK…` live; drill 7 s / 19 s | 🔴 D6 unruled; rollback wording no-op; CI flake | ~20 + **32 h blocked** | 224 (`ea8a2717`) | `…production-deploy-receipt.md` deviations |
| Jar mints (×4 attempts, 2 approvals) | 09-01 → 09-05 | human step | 3 successes | — | ~35 hands-on | — | receipts above |
| P2-LOCK docket grill | queued 07-08 | grill | never convened | — | 0 | — | `docs/master-plan.md` §7·4b |
| Attended lanes A–E | — | attended | **never run on any build** | — | 0 | 0 | `docs/daily-duel-216-attended-acceptance.md` |
| Approval 5 (go-public switches) | ~09-19/20 | approval | not run | — | 0 | 0 | runbook §3 |

Reading the table (section C.2):

- **27 real defects were caught.** With two exceptions (Buri's own Chronology
  play on 07-10; the VoiceOver lane on 08-19) every one came from a machine
  gate, a purpose-built audit harness, a byte-identity check, a measure-first
  clause, or an adversarial multi-agent review.
- **The "double-tap Allow-It guard" is not a gate catch.** It is a
  pre-existing standing fix (`resolvingOffer` at `src/DuelGame.tsx:296`,
  pinned in `docs/master-plan.md:92` and `docs/ui-contracts.md:194`); no
  July–September gate is credited with finding it.
- **Ceremony:** roughly 10 of 18 UI checkpoints approved as shipped. Their
  cost is not Buri's minutes (4–18 each) but the stop they impose on a
  430–494-turn session and the next boot's ~25 turns.
- **Ratio:** 62 agent turns per Buri message project-wide (73 in June, 71 in
  July, 53 in August, 51 in September); sub-agent turns are excluded, so real
  machine work per owner message is materially higher (C.4).
- **The long poles in owner time**, ranked: checkpoint screenshot/hands-on
  reviews (~150–200 min total), the 07-10 launch burst (73), the 216 picker
  (~60), attended lanes (~65 run, 0 for A–E), the Chrono fix evening (47),
  onboarding direction (45), Stage B strikes (24), jar mints (~35 hands-on,
  ~32 h blocked).

---

## 6. Documentation audit

Numbers from section D (`audit/process-retro-2026-09-08/inventory.md`,
`git-log-stat.txt`, a basename-grep inbound-reference graph over 156 repo
`.md` files, 19 memory files, the prompt digest and the session digest;
`HANDOFF/` and this retro excluded as sources because they index everything).

**Shape of the corpus**

| Fact | Value |
|---|---|
| Docs / lines at `d22a255` | 167 / 35,500 (+12 `HANDOFF/` files = 179 / 37,204 today) |
| Doc lines vs code lines inserted, whole git era | 38,075 vs 39,235 (0.97 : 1) |
| Since 09-01 | 16,722 doc vs 6,466 code (2.59 : 1); last 6 commits 5,326 doc lines, 0 code |
| Build phase 07-06 → 07-10 (56 commits, SEND) | 0.32 : 1, only 4 new docs |
| Never edited after creation | 132 of 167 (79%) |
| Edited ≥3 times | 10 docs (`master-plan` 48, `RULEBOOK` 12, release checklist 6, …) |
| Zero durable inbound references | 32 docs / 5,771 lines (16%); ≤1 inbound: 62 docs / 11,434 lines (32%) |
| Live set (per `HANDOFF/05` + status review §6c) | 21 docs / 5,423 lines + `HANDOFF/` 1,704 = 7,127 lines (19%) |
| Generated output (matrices, console captures, TMDB drafts/audits, manifests) | 55 docs / 8,934 lines; 21 of them have zero inbound |
| Prompt files | 24 / 6,547 lines (18%); 23 of 24 never edited; average 11.5 docs named as required reading per prompt |
| Copies of the four gate counts | 44 files mention `64/64`; 36 carry all four; 13 files still say `60/60` |
| DuelGame size claims | 6 files, 6 values (~1,960 · 1,989 · ~2,060 in `CLAUDE.md` · 2,309 · 2,445 correct) |
| `useState` count inside `docs/master-plan.md` alone | 41 (§1), 35 (§2.5), 39 (§10) |

**Which docs were read again.** Top of the inbound graph: `RULEBOOK.md` (46),
`docs/master-plan.md` (36 inbound, 19 "read FIRST"), `sim/RULESET.md` (36),
`CLAUDE.md` (22), `docs/tmdb-rulings.md` (19), the release checklist (17), the
launch-readiness checkpoint (13), the runbook (12). Three superseded plans sit
in the top 18 only because every later doc must say "superseded by". The
largest zero-inbound docs: `design/pilot-batch-01-{A,C}.md` (2,358 lines of
card-art prompts), `docs/production-polish-goal-prompt.md` (818 lines, the
longest prompt, cited by nothing), `docs/wave2-audit.md` (494), the four
Chronology phase kickoffs, and all eight `matrix-*.md` smoke outputs.

**Retention rules (proposed; counts are what each rule affects today)**

| # | Rule | Affects | Live lines removed |
|---|---|---|---|
| K1 | **Keep live**: `docs/master-plan.md` (trimmed, see §9), `sim/RULESET.md`, `RULEBOOK.md`, `CLAUDE.md`, `AGENTS.md`, `README.md`, `docs/tmdb-rulings.md`, the runbook and the two checklists, the current status review, `docs/launch-campaign-plan.md`, `BACKLOG.md` (or its issue replacement), `security.txt`, promo brand sheet / shot list / checkpoints, `HANDOFF/` | 33 docs | 0 (this is the live set) |
| A1 | **Archive at +30 days**: receipts, checkpoints, acceptance records, release candidates → banner with outcome, move to `docs/archive/<yyyy-mm>/`, keep paths resolvable | 13 docs | 2,090 |
| A2 | **Archive on completion**: superseded and executed one-shot plans (`PLAN.md`, `orchestration-plan.md`, `ui-tasks.md`, `pool-unification.md`, `chronology-tasks.md`, `stage-b-plan.md`, `feedback-batch1-plan.md`, `production-polish-requirements.md`) | 8 docs | 1,443 |
| A3 | **Archive on execution**: kickoff/goal prompts once their receipt exists; keep only un-run prompts and the promo prompt set | 22 docs | 6,191 |
| N1 | **Never commit again, regenerate**: `matrix-*.md`, `p1…p7-*` captures, TMDB drafts/audits/name audits, title-fit inventory → gitignored `output/`; the receipt records only the verdict line and the command | 48 docs | 5,545 |
| N2 | **Never write again**: generation-prompt dumps (`design/pilot-batch-01-*`), per-phase kickoff duplicates | 8 docs | 3,887 |
| N3 | **Stop committing generated assets** (274 Playwright PNGs, 90 review-B shots); manifests only if they cite a rerun command | 443 assets | — |
| F1 | **One fact, one home.** `sim/RULESET.md` owns gate counts (`CLAUDE.md` and `AGENTS.md` point, never restate); the deploy receipt owns prod SHA + `dpl_`; delete file-size stats from plans (they are `wc -l`, not decisions); master-plan line 1 owns "only live plan" | 44 gate-count files · 25 `dpl_` files · 21 SHA files · 14 "only live plan" · 6 DuelGame-size files | ~100 future stale claims retired |
| F2 | **Date-stamp or drop** any count, SHA, or date on the line that asserts it | 44+ | 0 |

Net effect: live set 179 docs / 37,204 lines → **33 docs / 7,127 lines**; 99
docs / 19,156 lines archived or no longer written; 48 docs / 5,545 lines become
script output. A stale-docs pass becomes a 30-minute read instead of a session
(`1795afa` + `3fb5c0e` touched 24 files).

Caveat the analyst flagged: inbound counts are basename greps, so a doc named
in prose ("the runbook") scores zero while genuinely being read; the reuse
split is a floor. The edit-history number (79% never edited) is the hard fact.
And the docs are the interface between sessions with no shared memory: cut
copies, not the channel.

---

## 7. Prompt scorecard

Checklist from `HANDOFF/06-prompts.md`: 1 governing file · 2 preconditions ·
3 approvals + NOT-approved · 4 locked decisions · 5 numbered sequence with
gates · 6 guardrails · 7 done-when with exact numbers · 8 named stop point.
Pattern column = ✓/✗ per item in that order. Grouped rows show best/worst
member. Codex `/goal` rows have no transcript, so outcome = receipt only.
Full scoring rationale in section F.

| # | Date | Prompt | Source | Chars | Pattern | /8 | Outcome |
|---|---|---|---|---|---|---|---|
| 1 | 06-28 | Chronology kickoff P1–2 | `design/chronology-kickoff.prompt.md`; `5c62ada1` | 4.4k | ✓✗✗✓✓✓✗✓ | 5 | 125 turns; 35/35 shipped; 3 follow-up nudges |
| 2 | 06-28→30 | Chronology P3–P6 (group) | `docs/chronology-kickoff-phase3…6.md` | 5–12k | P5 ✓✗✗✓✓✓✓✓ / P3 ✓✗✗✗✓✓✗✓ | 6 / 4 | Mode 3 complete, 42/42 |
| 3 | 06-28 | "This is where we left off" | `320546cc` | 1.1k | ✗✗✗✗✓✗✗✗ | 1 | 386 turns; two bare "continue" |
| 4 | 07-05 | Wave 0/A briefs | `docs/orchestration-plan.md` §5–6 | ~13k | ✓✗✗✓✓✓✗✗ | 4 | 5 components forged unwired → plan reset |
| 5 | 07-06 | Master Prompt §8 | `docs/master-plan.md:1350` | 2.4k | ✓✗✓✓✓✓✗✓ | 6 | booted 4 sessions |
| 6 | 07-09 | W5b/W5c boot | `7f37d2a1` | 3.7k | ✓✓✓✓✓✓✗✓ | 7 | 70 turns; 3 rulings `5e0f644`; 0 deviations |
| 7 | 07-09 | W5c follow-ups boot | `4694b8ff` | 3.3k | ✓✓✓✓✓✓✗✓ | 7 | 494 turns (max); `4f50447` |
| 8 | 07-09 | SEND-readiness boot | `e970e455` | 2.1k | ✓✓✓✓✓✓✗✓ | 7 | 140 turns, 1 prompt; mis-triaged year-in-DOM as non-blocking |
| 9 | 07-09/10 | "Thorough review of everything" | `2faf775c` | 1.6k | ✗✗✗✗✗✗✗✗ | **0** | 207 turns; died twice; 13/18; re-pasted verbatim as #2 |
| 10 | 07-10 | W5d / W5e-W6 (group) | `1cba6766` / `11aec86b` | 1.9k / 2.1k | ✓✓✓✓✓✓✓✓ / ✗✗✗✗✗✗✗✗ | 8 / 0 | W5d 430 turns → `f153662`; SEND session 6 prompts, 2 unplanned discoveries |
| 11 | 07-10 | UI-overhaul design-guide dump | `9e1e9643` | 8.0k | ✗✗✗✗✗✗✗✗ | 0 | 42 turns; needed a 2nd Buri prompt; docs only |
| 12 | 07-10 | Analytics-slice boot | `76419469` | 5.6k | ✓✓✓✓✓✓✓✓ | **8** | 233 turns; `efae3d4`, deployed `61ec120`; 0 deviations |
| 13 | 07-10 | Competitor research prompt | `32b518b6` | 0.2k | ✗✗✗✗✗✗✗✗ | 0 | 2 turns; output never used |
| 14 | 07-12 | Design-lead studio brief | `736dfca4` #3 | 8.8k | ✗✗✗✗✗✗✗✗ | 0 | proposals unbuilt; superseded by the Stub |
| 15 | 07-12 | Chronology Reel plan review | `855cc779` | 6.4k | ✗✗✗✗✓✓✗✗ | 2 | 21 turns; 4 amendments, every line ref verified |
| 16 | 07-16/17 | Feedback batch-1 / minors (group) | `2da3c5fc` / `ab4d5447` | 3.2k / 2.1k | ✓✓✓✓✓✓✓✓ | 8 / 8 | 432 turns approved (1 ratified deviation) / 446 turns **died on limit**, slice never resumed |
| 17 | 08-09 | Full product/design/retention review | `docs/full-product-code-review-kickoff-prompt.md`; `f43225a3` | 24.3k | ✓✓✓✗✓✓✗✗ | 5 | 95 turns, **died on limit**, no artifact |
| 18 | 08-09 | Production-polish `/goal` | `docs/production-polish-goal-prompt.md` | **35.5k** | ✓✓✓✓✓✓✓✓ | 8 | Codex; RC `5316b04`; 3 visual checkpoints approved; 0 deviations |
| 19 | 08-20 | Onboarding build | `e9809b98` | 5.2k | ✓✗✓✓✓✓✓✓ | 7 | 1 prompt, 210 turns, full matrix green, 0 commits by design |
| 20 | 08-24 | UI-lock + pool-health | `docs/ui-lock-and-movie-pool-health-kickoff-prompt.md` | 19.1k | ✓✓✗✗✓✓✓✓ | 6 | Codex; report shipped; its "hold the 89" verdict overridden same day |
| 21 | 08-2x | Pool expansion `/goal` | `docs/pool-expansion-goal-prompt.md` | 18.1k | ✓✓✗✓✓✓✗✓ | 5 | Codex; paused; never reached its merged wave |
| 22 | 08-2x | 200-card cutover `/goal` | `docs/daily-duel-200-card-cutover-goal-prompt.md` | 25.6k | ✓✓✗✓✓✓✓✓ | 7 | Codex; shipped 216+16 against "exactly 200" |
| 23 | 08-26 | 216+16 full review `/goal` | `docs/daily-duel-216-full-review-goal-prompt.md` | 21.5k | ✓✓✓✗✓✓✓✓ | 7 | Codex; F01–F12 report |
| 24 | 08-27 | Now-fix pass `/goal` | `docs/daily-duel-216-now-fix-pass-goal-prompt.md` | 16.2k | ✓✓✓✓✓✓✓✓ | 8 | Codex; checkpoint with exact counts; 0 deviations |
| 25 | 08-28 | Launch-readiness `/goal` (Goals 0–8) | `docs/daily-duel-216-launch-readiness-goal-prompt.md` | 24.6k | ✓✓✓✓✓✓✓✓ | 8 | Codex; **4 of 9 goals**, stopped without a checkpoint |
| 26 | 08-30/31 | Launch-readiness resume `/goal` | `…-resume-goal-prompt.md`; `56bff76e` | 15.8k | ✓✓✓✓✓✓✓✓ | 8 | 381 turns; 1 deviation (73 vs 77 paths); checkpoint shipped |
| 27 | 08-31 | Promo execution prompts ×4 (group) | `docs/promo-execution-prompts.md` | ~3.3k each | P4 ✓✓✓✓✓✓✗✓ / P1 ✓✗✓✓✓✓✗✓ | 7 / 6 | P1 ran (`83c6d87f`, 84 turns); P2–P4 never run |
| 28 | 09-01 | Canva mockup sprint | `promo/canva-mockups-kickoff-prompt.md`; `d6139e52` | 4.4k | ✓✓✓✓✓✓✓✓ | 8 | 328 turns; 9 exports; 1 predicted bounce round |
| 29 | 09-01 | Ship pass `/goal` | `docs/daily-duel-216-ship-pass-goal-prompt.md`; `5c21940b` | 8.0k (3.7k block) | ✓✓✓✓✓✓✓✓ | 8 | 196 turns; merged `14a546e`; 3 deviations (asserted, not checked, state) |
| 30 | 09-01 | Preview verification `/goal` | `…-preview-verification-goal-prompt.md`; `3aeebadf` | 6.6k | ✓✓✓✗✓✓✓✓ | 7 | 268 turns, 11 prompts over 4 days; P2 red (environmental); receipt shipped |
| 31 | 09-01 | Attended lanes scheduling `/goal` | `…-attended-lanes-scheduling-goal-prompt.md` | 5.2k | ✓✗✓✓✓✓✓✓ | 7 | **not run**: 0 sessions |
| 32 | 09-03 | Pre-launch polish (three batches) | `docs/prelaunch-polish-kickoff-prompt.md` | 21.5k incl. receipt | ✓✓✓✗✓✓✓✓ | 7 | PRs #10–#13; 2 deviations (c6, c12) + 6 follow-ups noted |
| 33 | 09-04 | Production deploy kickoff | `…-production-deploy-kickoff-prompt.md`; `ea8a2717` | 12.1k (1.6k block) | ✓✓✓✗✓✓✓✓ | 7 | 224 turns; 6 deviations, 2 of them the prompt's own (rollback wording, D6 assumed) |
| 34 | 09-06 | Launch status review kickoff | `docs/launch-status-review-kickoff-prompt.md`; `c99087a0` | 8.5k (0.8k block) | ✓✓✓✗✓✓✓✓ | 7 | 1 prompt, 45 turns, 0 deviations, nine sections |

**Correlation (F.2)**

| Score bucket | n | Median turns per booting session | Ended on limit | First-pass delivery with no follow-up prompt |
|---|---|---|---|---|
| 0–3 | 6 | 124 | 1/6 (twice) | 1/6 |
| 4–5 | 4 | 110 | 1/2 known | 0/4 |
| 6–7 | 15 | 175 | **0/8** | 9/14 |
| 8 | 9 | 354 | 1/6 | 6/9 |

Higher structure correlates with fewer limit deaths and far higher first-pass
delivery. It does not correlate with shorter sessions: structured prompts are
given more work and held to gates. Confounders: task size, read-only vs
mutating, Codex vs Claude (8 rows have no transcript), and calendar (every
0-score prompt is from July, every post-08-26 prompt scores ≥6). The
deviation columns are only comparable at ≥6 because only those prompts asked
for a Deviations section.

**Length.** Past ~18k chars, 4 of 8 prompts failed their stated scope in one
pass. The causal variable is independently gated units, not characters: the
35.5k production-polish prompt (five phased checkpoints) completed; the 24.3k
review (no gate, no stop point) died at 95 turns; the 24.6k launch-readiness
prompt (9 goals) finished 4.

**Best three**

1. Launch status review kickoff (#34): output shape pinned ("nine sections …
   every claim with a file pointer"), read-only fence as an action
   prohibition, falsifiable gate; 803-char block → 45 turns, 0 deviations.
2. Analytics-slice boot (#12): ordering justified by a real deadline ("must
   DEPLOY before he texts the circle"), exact call sites, the refactor not to
   do, the plan-gated-events risk flagged in advance; shipped and deployed.
3. Onboarding build (#19): anti-staleness clause ("re-locate by searching the
   quoted identifiers rather than trusting raw numbers"), an E2E selector
   contract, explicit no-commit stop; 1 prompt, full matrix green.

Weighed and not promoted: ship pass (#29, asserted state it should have
checked), preview verification (#30, 11 prompts over 4 days), production
deploy (#33, 6 deviations, though its stop clause is why D6 was caught).

**Worst three**

1. "Thorough review of everything" (#9): unbounded 12-item scope, no sequence,
   no gate, taste and mechanics mixed; 5 of 18 areas died twice, verifiers
   thin, second session required.
2. Design-lead studio brief (#14): generic craft dump with zero project
   anchors, contradicts the locked typographic-face direction it never names;
   proposals unbuilt.
3. Full product review kickoff (#17): the only long prompt with no completion
   gate and no stop point; 8 methods × 15 sections; died at 95 turns.

**Recurring defects in the prompts themselves (F.5):** 8 stale-precondition
instances (73/77/78/79 paths; runbook "no SHA on main"; c6; c12 divisor;
"exactly 200"; Toolbar assumed absent; D6 assumed ruled; ship-pass upstream
state); 1 wrong instruction that would have broken what it protected
(rollback target "to the NEW dpl"); 26 copies of 3 house-rules blocks; the
"follow it verbatim; this condition is only its completion gate" Stop-hook
boilerplate in 5 files + 5 blocks, which burned a turn when the gate depended
on a human jar mint (`long-prompts.md` `ea8a2717` #2); 3 July boots with inline
SHAs and gate counts that went stale within hours; 4 pasted-artifact prompts
(memory dump, design guide, prior summary, skill text) averaging 0.25/8.

---

## 8. Alternatives

Compared against the current pattern (one live master plan + file-based
kickoff prompts + receipts + gate-split autonomy + in-session grills + a
machine-local memory pointer). Detail, GSD artifact tree, and per-episode
reasoning in section G; the GSD definitions were read from
`~/.claude/get-shit-done/` (v1.39.0-rc.4, 86 skills, 33 agents).

| Episode / constraint | Current | (1) GSD-style `.planning/` | (2) Issues + PR template + ADRs | (3) One plan + CHANGELOG + weekly review |
|---|---|---|---|---|
| 3 plans in 44 h | — | PREVENT | SHORTEN | SHORTEN |
| Wave A invisible inventory | — | SHORTEN (verifier at phase close) | NONE | NONE |
| 07-24 deploy → 08-18 (32 d stale prod) | — | NONE | **PREVENT** (overdue milestone visible) | **PREVENT** (weekly review reads "Unreleased has 8 entries") |
| Review fleet died ×2 (5/18 unrun, retro 60 d late) | — | **PREVENT** (per-area artifacts resume) | SHORTEN | NONE |
| 8-prompt release chain (2,391 lines, 10 d) | — | SHORTEN | SHORTEN (~900 prompt lines) | NONE (Approvals are right to be sequenced) |
| 73→77→79 dirty paths / PR #2 open 25 d | — | **PREVENT** (atomic commits) | **PREVENT** (issue-scoped branches) | SHORTEN |
| Duplicated house rules (`64/64` ×70) | — | PREVENT | PREVENT (gate half via PR template) | NONE |
| 1,722-line plan → v6 catch-up + separate status review | — | PREVENT | SHORTEN | **PREVENT** (this alternative is the fix) |
| D4 never written down (19 d) | — | PREVENT | **PREVENT** (`blocked-on-buri` issue) | SHORTEN |
| 6 open Dependabot PRs | — | NONE | **PREVENT** (`ignore:` block + label) | SHORTEN |
| Memory machine-local | — | PREVENT | SHORTEN | SHORTEN |
| Gate-split autonomy (§2.2) | keeps | **BREAKS** (rival UI verdict) | keeps | keeps |
| Sim contract + 4 gates | keeps | at risk (rival test surface) | keeps, strengthened | keeps |
| Receipts + Approvals 1–5 | keeps | **BREAKS** (no analog for sha256 / `dpl_` / drill) | at risk (checkbox culture) | keeps |
| "One live plan" | at risk (3 files drift) | **BREAKS** (12+ live files) | at risk (board = 2nd plan) | keeps, repairs |
| Grill ritual | keeps | at risk | keeps (ADR = its output) | keeps |
| Codex `/goal` compatibility | keeps | **BREAKS** (Claude-side skills) | keeps | keeps |
| Buri's prefs (Opus, wind-down, deploys) | keeps | keeps, better wind-down | keeps | keeps |
| Setup cost now | — | 8–14 h | 3–5 h | 2–3 h |
| Migration surface | — | ~90 artifacts | ~56 issues + ~25 ADRs | 2 files, ~60 rows |
| **Fit for the next 90 days** | — | **2/5** | **4/5** | **5/5** |

Honest summary: every large loss in the matrix except Wave A and the fleet
deaths was a latency failure on a human step, not a quality failure. No
planning format fixes latency; a calendar with owner names does. GSD would
have prevented the July plan churn and the fleet loss but breaks the receipts
chain and Codex compatibility and would consume the 19-day runway to adopt.
The issue tracker is the only alternative that directly prevents both the
32-day stale deploy and the 79-path release, and it maps onto what the next 90
days are (nine owned, dated items). The light cadence costs 2–3 hours, breaks
nothing, and repairs the one-live-plan rule.

---

## 9. Recommendation: the next 90 days

Sized for one owner and AI sessions, across launch soak (09-08 → 09-27),
interviews (10-11 → 10-18), the front-door ruling (10-18), and P5 card-art /
P6 tracking / P7 leaderboard after. Adopt alternative (3) now, two pieces of
(2) this week, and the cheap durability primitives from (1); keep the sim
contract, the Approval sequence, gate-split autonomy, the grill, and "deploys
are Buri's" untouched.

### Cadence

- **Weekly owner review, fixed slot (Sunday, 30 min).** A read-only agent pass
  using `docs/launch-status-review-kickoff-prompt.md` as the standing prompt
  produces a dated one-page status; Buri re-owns every open item and names
  next week's single next action. This is the mechanism that would have
  caught the 32-day stale production and the six Dependabot PRs (§4 items 1, 10).
- **Two fixed owner slots per week (e.g. Tue and Sat, 20 min each) for every
  human-only step**: approvals, jar mints, rulings, screenshot reviews. Agents
  pre-stage everything before the slot (Preview deployed, gates queued, the
  question written down with a recommendation). Nothing human-only sits on a
  critical path without a slot; the 32-hour jar block becomes a 20-minute one.
- **One gated pass per session, ≤5 gated steps, wind down by ~300 turns.**
  The two limit deaths were 446 and 95+fleet turns; prompts with >5 gated
  units never finished (§4 item 9, §7). Split anything larger into two prompts.
- **Fan-out only read-only or worktree+PR, ≤5 agents, synthesize first.** Per-
  agent output goes to a scratch directory on disk so a dead session resumes
  the survivors; no Workflow fleet larger than what one session can reconcile
  (§4 item 2). Opus stays the default (Buri's rule).
- **Post-launch release train: fortnightly after Approval 5**, deploy on the
  Tuesday slot, receipts only for external mutations. No freeze without a
  dated close and an owner name.

### Artifacts

- **`docs/master-plan.md` trimmed to constitution (§2) + roadmap (§3, §9).**
  The 758-line §6 Ledger's 36 ticked rows become dated history in a new
  `CHANGELOG.md` (Keep-a-Changelog; release headings carry the `dpl_` id);
  its 13 open rows and the live §7 asks become GitHub issues.
- **GitHub issues + one milestone (`09-27 premiere`) + labels**
  (`blocked-on-buri`, `approval`, `ui-checkpoint`, `objective`, `content`).
  The nine `HANDOFF/09-open-work.md` rows become nine issues; D3, D4, D7, D9,
  D11 become `blocked-on-buri` issues today. `BACKLOG.md` retires into issues.
- **`docs/adr/NNNN-*.md`** for rulings: migrate D1–D11 and the 12 reversed
  decisions in `HANDOFF/04`; index the other 67 rows, do not retype them. The
  grill stays the ritual; an ADR is its output.
- **`.github/pull_request_template.md`** carrying the gate table (build ·
  bundle · security · 64/64 · 8/8 · 42/42 · 14/14 · smoke) and a Deviations
  section; **`.github/dependabot.yml`** gains the `ignore:` block D10 ruled.
- **Receipts stay for Approvals only** (Approval 5, any deploy, front-door
  change, pool cutover). Everything else is a CHANGELOG line plus the PR.
- **Retention rules §6 K1/A1–A3/N1–N3/F1/F2 applied in one docs-only pass**
  (~2 h): archive executed prompts and +30-day receipts, gitignore generated
  output, and give the gate counts, the prod SHA, and the file-size stats one
  home each. `CLAUDE.md` and `AGENTS.md` point at `sim/RULESET.md` for counts.
- **Memory stays the resume pointer**, but every fact in it that a newcomer
  needs is also in `CHANGELOG.md`, the issues, or `HANDOFF/`.

### Gates that stay

- The four verify suites and the re-tune rule for any rule/scoring/pool/seed
  change (`CLAUDE.md`, `sim/RULESET.md`).
- Sequenced Approvals for every external mutation: Approval 5, each deploy,
  the front-door change, any pool cutover; each with its own Preview gate and
  a receipt in the current shape (provenance, sha256, rollback drill).
- Attended lanes A–E on production before Approval 5; a real-phone play per
  mode on premiere day. These are the gates with the best defect-per-minute
  record among human gates (§5, VoiceOver 08-19) and the only ones never run.
- `/tmdb-check` arbitration for content merges; the split-arbitration pattern.
- UI checkpoints **only** for new surfaces or first-impression changes (the
  front-door change, P5 card art) and only with a specific question attached
  ("which of these two", not "approve as-is").

### Gates that go

- As-is ratification checkpoints for polish: ship on green, review in the
  weekly slot (10 of 18 changed nothing).
- Per-flag grills on extrapolated details: batch into the weekly slot.
- The P2-LOCK docket grill as a standalone event: fold into the pool-growth
  ADR when pool growth resumes.
- Stop-hook "verbatim / only its completion gate" enforcement on any pass
  that contains a human step the session cannot perform.
- Jar minting inside a pass: mint at the start of the owner slot, or run
  lanes and gates against production after deploy (D3 already recommends prod).
- Inline restatement of house rules, SHAs, and gate counts in prompts: point
  at `CLAUDE.md`, the issue, and the Ledger/CHANGELOG instead.

### Calendar mapping

- **09-08 → 09-27 (soak):** week 1 = lane pack + sittings booked + MFA/ruleset
  + dashboard look + Dependabot `ignore:` + the docs-only retention pass and
  issue creation (~4 h agent, ~1 h Buri across two slots); week 2 = lanes on
  production, Approval 5 prepared as one commit with its own Preview; 09-19/20
  Approval 5 in a Saturday slot; 09-24 freeze; 09-27 premiere watch.
- **09-28 → 10-18 (interviews → front door):** weekly reviews produce the
  readouts (10-04, 10-11, 10-18); interviews logged to `docs/feedback-log.md`;
  the front-door ruling is an ADR; the change ships on the 10-20 train with a
  UI checkpoint that asks one question.
- **10-19 → 12-07 (P5–P7):** each is one ADR (scope + gates + budget) and a
  ≤5-step prompt per increment; P5 card art needs its own Buri checkpoint per
  batch (new surface); P6 tracking is a plan decision at 10-04, not code; P7
  leaderboard needs a server, so its ADR is the first deliverable, not code.

### Prompt template (from section F; keep, cap, drop)

```text
/goal <one sentence: the pass and its single deliverable>.
Read <docs/GOVERNING.md> FIRST; it governs where this block is silent.
Preconditions, stop read-only and report if any fail:
  · origin/<branch> = <full SHA>, CI green; tree clean except <named set>
  · <toolchain / auth / human availability, with the owner slot it needs>
  Anything unexplained: stop. Do not paper over it inside this pass.
State I am asserting is authoring-time: verify, do not assume.
APPROVED this pass: <exact external mutations, enumerated>.
NOT approved: <deploy · alias/settings · indexing · rule/scoring/seed/pool · deps · any other source edit>.
Locked, do not relitigate: <numbered rulings with dates, or the ADR ids>.
Work sequence, checkpoint after EACH step, max 5 steps:
  S0 baseline+gates · S1 … · S4 receipt (or CHANGELOG line + PR) and stop.
  If this pass needs more than 5 gated steps, split it into two prompts.
Guardrails: never git add . / clean / reset / checkout / stash / amend / force-push;
  preserve all unrelated dirty and untracked work; one writer on DuelGame.tsx;
  no new deps; no rule/scoring change folded into this. (House rules: CLAUDE.md.)
Done when ALL hold (exact numbers): <gate table from the PR template + this pass's own counts>.
Stop at the <NAMED> checkpoint: pass/fail per item, LIST DEVIATIONS, ask separately
  for the next approval.
Do not include: inline house-rule restatements · inline SHAs and gate counts as a
  boot preamble · Stop-hook "verbatim" enforcement when a human step is in the pass.
```

---

## 10. Questions for Buri

Things the transcripts cannot answer.

1. **Your hours.** The transcripts show ~8 measured hours in bursts and an
   estimated 15–28 project-wide (section C.3). How many hours did the project
   actually take you, including phone play, the picker, the strike list, and
   the Codex windows? Is ~20 minutes per day sustainable post-launch?
2. **What felt slow.** From the outside the long poles were the July freeze,
   the jar mint, and the 25-day PR. Which waits did you feel, and which did
   you not notice until a session told you?
3. **What you would not give up.** The screenshot checkpoints changed nothing
   10 times out of 18. Do they still earn their place because you want to see
   the game before it moves, or would a weekly review of shipped-on-green
   polish feel the same?
4. **Codex vs Claude.** Since 08-09 the heavy gated passes ran in Codex and
   left no transcript. Was that a cost, a quality, or a habit choice? It
   decides whether the recommendation can assume one runtime.
5. **The July freeze.** §2.11 was a ruling on 07-10. Did the ~07-24 window
   close feel like a date you owned, or a default that drifted? The answer
   decides whether a calendar slot alone fixes the pattern.
6. **The review fleets.** Two 18-area runs cost ~254M tokens and a second
   session; the five-agent review cost 56M and 7 reconcile turns. Do you want
   the big fleet shape again for the front-door and P5 work, or the small one?
7. **Jar mints and human-only steps.** Would you rather mint at the start of a
   fixed slot, run lanes and gates on production after deploy, or change the
   protection model so an agent never needs a jar?
8. **Receipts.** Do you read them? If the CHANGELOG line plus the PR is enough
   after Approval 5, the doc load halves; if you read receipts, they stay.
9. **Public issues on a public repo.** The issue templates are player-facing.
   Are you comfortable with internal `blocked-on-buri` issues beside them, or
   do you want a private tracking repo?
10. **The Opus rule and cost.** Sub-agents were 26% of all tokens. Is that a
    number you want reported weekly, or not a constraint at all?
11. **What "efficient" means to you.** The verdict here is "efficient per
    owner-minute, inefficient per calendar day." If you would trade owner
    minutes for calendar days (more slots, faster shipping), the cadence above
    should get a third weekly slot; if not, it stays at two.
12. **The retro that died.** This document was one of the five review areas
    lost on 07-10. Is there anything you asked for then ("from the plan to how
    it ended up and how we built it") that is still missing here?

---

### Buri's answers (2026-09-13, in session)

1. **Hours:** about 20 hours total. Twenty minutes a day post-launch is fine.
2. **What felt slow:** the initial UI. Also the movie work — the per-movie
   illustrations were given up on, and Buri would love to get that back
   (the parked P5 card-art pilot is the vehicle).
3. **What you would not give up:** not answered directly; see 8.
4. **Codex vs Claude:** Buri will try Codex going forward.
5. **The July freeze:** not answered.
6. **Review fleets:** find a more efficient shape than the four fleets used
   so far (open task for the next retro-sized pass).
7. **Jar mints / human-only steps:** Buri did not know what the question
   meant. Plain version: the protected Preview needs a bypass cookie that only
   Buri can create; it blocked a pass for a day once. Options were: create it
   at the start of a fixed slot, run gates on production after deploy instead,
   or change Vercel's protection so no cookie is ever needed. **Ruled
   2026-09-13: create it at the start of a fixed weekly slot.**
8. **Receipts:** agreed — Buri does not read them. From Approval 5 on, a
   CHANGELOG line plus the PR is enough; receipts stay for Approvals only.
9. **Public issues:** Buri wants a **private tracker** for internal items,
   not `blocked-on-buri` issues on the public repo.
10. **The Opus rule:** try **Sonnet** on genuinely simple, fully specified
    sub-agent tasks and measure whether it holds up; Opus stays the default
    for judgment-dense work.
11. **What efficient means:** not answered directly (see 1: twenty minutes a
    day is the budget).
12. **The retro that died:** nothing named as missing.

## Method and confidence

- Sections A–G were produced by seven Opus sub-agents given the kickoff's
  evidence paths verbatim and told to return numbers with pointers; each ran
  no git and wrote only to its own scratch directory. This file reconciles
  them; where they disagreed (turn totals 6,150 / 6,245 / 6,259; session
  counts 35 / 38 on disk / ≥41 with Codex) the choice and reason are stated
  in §2.
- Measured: message counts, timestamps, turns, tokens (`message.usage` on
  every assistant record), commit and PR data, inbound-reference counts,
  prompt scores (judged from text). Estimated, with method stated in the
  section: owner minutes for Codex-window gates (10 min per UI checkpoint,
  inferred from the measured ones), the 8-minute read-in/read-out constant,
  rework turn shares inside sessions (prompt-ratio proxies), GSD adoption cost
  (inferred from its workflow definitions, never run here).
- Not recoverable: everything before 2026-06-28 and the 07-01 → 07-08 and
  08-24 → 08-30 windows (no transcripts); per-prompt turn splits inside a
  session; context-window pressure per session; which pasted kickoff booted
  which session (inferred from wording and timestamps).
- Least confident: the turn-level rework percentage (2.8% floor, ~10%
  estimate, 18% ceiling) and the project-wide owner-hours estimate. The
  calendar, commit, PR, token, and gate-catch numbers rest on primary logs.
- Fairness: the process shipped a four-mode game with a parity-gated rules
  engine, a proven-bytes deploy, and a drilled rollback in three months on a
  few owner-hours a week. A more structured team would have used fewer
  sessions by scheduling the human steps and bounding fan-out, not by gating
  harder.
