# 05 — Plans

**Last verified:** 2026-09-13 on `codex/handoff-refresh-2026-09-13` (from main 8100e29)

## Plan of record

**`docs/master-plan.md`** (v1 2026-07-06, amended to v6 2026-09-08). The
sentence that proves it is its first line: *"This is the only live plan. It
supersedes `PLAN.md`, `docs/orchestration-plan.md`, and `docs/ui-tasks.md`."*
CLAUDE.md and AGENTS.md both point at it, and every session boot prompt since
2026-07-06 opens with "Read docs/master-plan.md FIRST."

What it covers: §0 finish line (reached 2026-07-10) · §1 ground truth · §2 the
operating constitution · §3 waves W0–W6 · §4 dependency spine · §5 risks · §6 the
**Ledger** (resume sheet, ticked in the same commit as the work) · §7 the
user-input queue (everything only Buri can decide) · §8 the paste-able boot
prompt · §9 the 2026-08-07 pre-launch polish and scale plan (P0–P8) · §10 the
amendment log.

How far along: W0–W6 closed; §9 P0–P3 done; P4 personas moot; **P5 card-art
pilot, P6 tracking, P7 leaderboard remain post-launch**; P8 launch gate mostly
executed as Approvals 1–4. **v6 (2026-09-08)** brought the Ledger current
through Approval 4 and the crons, replaced the §8 post-SEND paragraph with the
launch-runway one, and named the two companion documents. The division of
labor, in this order:

1. `docs/launch-status-review-2026-09-06.md` — plain-English status with
   owners, deadlines, and a calendar to 10-25, kept current by dated addenda
   appended in place (2026-09-10: the table re-run; 2026-09-13: the rulings and
   the lane booking). Read the addenda first.
2. `docs/daily-duel-216-production-deploy-receipt.md` — what is in production.
3. Project memory `marquee-next-session-queue` — the next-session pointer.

## Timeline

| Dates | Plan / phase | Outcome | Record |
|---|---|---|---|
| 2026-06-11 → 06-22 | Pivot, Duel + Solo, sim contract, flow package | Shipped to `marquee-one-iota.vercel.app` | memory `marquee-flow-diagnosis`, `marquee-implementation-plan` |
| 2026-06-23 → 06-30 | Funpass (sim → lock → port → retune) | Shipped 2026-06-30; verify 62/62 then | memory `marquee-funpass-decisions`; RULESET §11 |
| 2026-06-28 → 06-30 | Chronology Phases 1–6 | Mode 3 playable + documented | `docs/chronology-tasks.md`; `design/chronology.md` |
| 2026-07-01 → 07-03 | Review priorities + "jumpstart" (communication pass, real Solo daily, `verify:solo`) | Deployed 2026-07-03 | memory `marquee-review-priorities` |
| 2026-07-04 → 07-05 | `PLAN.md` launch-ramp WS1–WS5 + Amendment 1 (TMDB, waves 1–2) | WS1 + A1–A3 done; A4/A5 absorbed into master-plan P1/P2 | `PLAN.md` (superseded) |
| 2026-07-05 | `docs/orchestration-plan.md` v2 + `docs/ui-tasks.md` (Wave 0 / A) | Wave 0 done, Wave A mid-flight → reset | both superseded 2026-07-06 |
| 2026-07-06 → 07-10 | **Master plan W0–W6** + P1 (pool unification) + P2 (Stage B kickoff) + M4a (Connections dealer) | All closed; SEND 2026-07-10 | master-plan §6; commits c14114a → 0e1e403 |
| 2026-07-10 → 07-17 | Post-SEND: analytics slice, Chronology overflow fix, Stage B strike/arbitrate/merge/deploy, feedback batch 1, §7·7b/c minors | Done; `codex/chronology-reel` branch approved but never merged as such (superseded by the 08-07 reel polish) | commits 61ec120 → 0d0a172; `docs/feedback-batch1-plan.md` |
| 2026-08-07 → 08-09 | Status audit → **§9 production polish** Phases 0–4 + P1 delivery foundations + Wave 3 pool | Phases 1–4 approved; RC 2026-08-09; production `a710fff` (08-08) | `docs/production-polish-*`; `docs/delivery-foundations-report.md` |
| 2026-08-09 | Full product/design/retention/software review kickoff | Ran, hit session limit; findings folded into polish Goals | `docs/full-product-code-review-kickoff-prompt.md` |
| 2026-08-18 → 08-24 | Polish Goals 2–5 (shared UI, mode onboarding, security, public-launch acceptance), first-run onboarding | Production `c063f26` 2026-08-18; Goal 5 candidate 08-19; onboarding 08-24 | `docs/goal-*-qa.md`, `docs/security-launch-checklist.md` |
| 2026-08-24 → 08-27 | **216 + 16 cutover** (pool health audit → picker → cutover → full review → now-fix pass) | Release checkpoint 08-26; fix checkpoint 08-27 | `docs/daily-duel-216-*checkpoint.md`, `-full-review-report.md` |
| 2026-08-28 → 08-31 | Launch-readiness Goals 0–8 | Checkpoint 08-31, all local gates green, lanes A–E not run | `docs/daily-duel-216-launch-readiness-checkpoint.md` |
| 2026-08-31 → 09-01 | Promo track Phase 0-docs + Canva mockup sprint (parallel) | Brand sheet, shot list, 9 approved mockups; awaiting red pen | `promo/`, `docs/promo-execution-prompts.md` |
| 2026-09-01 | Approvals 1–2 ship pass | PR #2 merged → `14a546e` | `docs/daily-duel-216-ship-receipt.md` |
| 2026-09-01 → 09-03 | Approval 3 protected Preview | Green after Toolbar opt-out + audit fix (PR #9) | `docs/daily-duel-216-preview-verification-receipt.md` |
| 2026-09-03 | Five-agent pre-launch review → three polish batches | PRs #10–#13 → `9a5fdbb` | `docs/prelaunch-review-2026-09-03.md`; polish kickoff receipt |
| 2026-09-04 → 09-05 | **Approval 4 production deploy** | `dpl_HWeNAMnK2eLernz47PCG9RAmgCu6` live; rollback drilled; crons on (PR #14 → `d22a255`) | `docs/daily-duel-216-production-deploy-receipt.md` |
| 2026-09-05 → 09-06 | Campaign plan + plain-English status review | Both written; tracked since PR #16 | `docs/launch-campaign-plan.md`, `docs/launch-status-review-2026-09-06.md` |
| 2026-09-07 → 09-08 | Project handoff (`HANDOFF/`), stale-docs pass, master-plan v6, process retrospective | Docs-only PR #16 (merged 2026-09-13 → `8e1e3bd`); retro verdict "efficient per owner-minute, inefficient per calendar day" | `HANDOFF/`, `docs/process-retrospective-2026-09-08.md` |
| 2026-09-10 | Launch-runway kickoff S0–S4 (baseline · lane pack · owner checklist · Approval 5 branch · status addendum) | `docs/attended-lanes/` built; S3 deferred on D9; two doc corrections (no Speed Insights; Approval 5 needs a URL assertion) | `docs/launch-runway-kickoff-prompt.md`; status review addendum 09-10 |
| 2026-09-13 | Rulings D9 / D10 / D11 / Speed Insights, the retro answers, D3 booking; Approval 5 commit built for CI | PR #17 → `8100e29`; `codex/approval-5` = 5edaec3, CI green, **not deployed** | status review "Rulings 2026-09-13"; commit 5edaec3 |
| **Next** 2026-09-14 → 09-27 | **Tue 09-15** lanes A–E + owner checklist (MFA, `main` ruleset, dashboard look, DNS export + D7, Dependabot) · **Sat 09-19** Approval 5 (jar at slot start → Preview gate → deploy → rollback ids + re-drill) · freeze 09-24 · **premiere 09-27** | — | `docs/attended-lanes/schedule.md`; status review §8 + addenda |
| After | Show HN 09-29, readouts, interviews D+14 (10-11), front-door ruling (10-18), campaign check D+28 (10-25); P5/P6/P7 | — | campaign plan §5; master-plan §9 |

## All plans

| Path | Status | Superseded by | One line |
|---|---|---|---|
| `docs/master-plan.md` | **live** | — | The only live plan; v6 2026-09-08 current through Approval 4 |
| `docs/launch-status-review-2026-09-06.md` | live (status, not a plan) | — | Current state, owners, deadlines, calendar |
| `docs/launch-campaign-plan.md` | live | — | "Tonight's Program" go-to-market brief, assumptions flagged (tracked since 2026-09-08) |
| `docs/daily-duel-216-deploy-and-indexing-runbook.md` | live | — | §2 executed; §3 holds the Approval 5 diffs |
| `docs/production-release-checklist.md` | live | — | Quiet release done; public switches unticked |
| `docs/security-launch-checklist.md` | live | — | Account boxes (MFA, rulesets, registrar) unticked |
| `docs/promo-execution-prompts.md` + `promo/*checkpoint.md` | live | — | Promo phases; next gate Phase 0-captures |
| `docs/daily-duel-216-attended-lanes-scheduling-goal-prompt.md` | superseded | `docs/launch-runway-kickoff-prompt.md` S1/S2, 2026-09-10 | Its deliverables were built by the runway kickoff instead |
| `docs/launch-runway-kickoff-prompt.md` | done | executed 2026-09-10 (S3 finished 2026-09-13) | Five-step runway pass; bannered "do not re-run as is" |
| `docs/attended-lanes/schedule.md` + `owner-checklist.md` | **live** | — | The lane grid (booked Tue 09-15) and the five owner chores due before Approval 5 |
| `docs/process-retrospective-2026-09-08.md` §9 | live (recommendations) | — | 90-day process plan; adopted so far: Q7 slot mint, Q8 receipts-for-Approvals, Q10 Sonnet trial; CHANGELOG / ADRs / PR template / private tracker still open |
| `PLAN.md` | superseded | master-plan, 2026-07-06 | Launch-ramp WS1–WS5 |
| `docs/orchestration-plan.md` | superseded | master-plan, 2026-07-06 | Orchestrated build v2 |
| `docs/ui-tasks.md` | superseded | master-plan, 2026-07-06 | Wave 0/A checklist |
| `docs/pool-unification.md` | done | executed as P1 2026-07-06 | Byte-identical JSON gate |
| `docs/stage-b-plan.md` + `docs/stage-b-slates.md` | done | executed 2026-07-12 | Chronology pool 162 → 438 |
| `docs/chronology-tasks.md` + `docs/chronology-PRD.md` | done | — | Mode 3 build, complete 2026-06-30 |
| `docs/feedback-batch1-plan.md` | done | executed 07-16/17 | Circle feedback fixes |
| `docs/production-polish-requirements.md` | done | Phases 5–6 absorbed by the launch gates | Polish contract |
| `docs/pool-expansion-wave3-slate.md` | done | — | Wave 3, paused after |
| `docs/tmdb-plan.md` | reference | — | Content-pipeline rules |
| `BACKLOG.md` | live | — | Items 1–3 struck as shipped 2026-09-08; 4–5 remain |

## How planning works here

The house pattern, visible in every phase since July:

1. **A kickoff or goal prompt** is written to a file (`docs/*-kickoff-prompt.md`,
   `docs/*-goal-prompt.md`) with locked decisions, preconditions, a work
   sequence, guardrails, a completion gate, and a paste-able `/goal` block. It is
   often written by the *previous* session as its last act.
2. **A fresh session executes it** (Claude Code or Codex), stopping read-only if
   preconditions fail, and **stops at a named checkpoint** for Buri.
3. **A checkpoint or receipt document** records what shipped, gate results with
   exact counts, deviations, and follow-ups (`docs/*-checkpoint.md`,
   `docs/*-receipt.md`, `audit/*/manifest.md`). Since 2026-09-13 receipts are
   kept for Approvals only; other passes get a CHANGELOG line plus the PR (retro Q8).
4. **Buri rules** in-session (a "grill": one decision at a time, recommendation
   argued, ruling logged) and the ruling lands in the master plan §7 or a
   docs-only commit.
5. **A review pass** (often several Opus sub-agents in parallel, read-only) audits
   the result and produces the next prompt's decision list.
6. Memory (`marquee-next-session-queue`) is updated at wind-down so a cold session
   can resume.

Objective work commits and pushes itself; UI work waits for screenshots and
Buri's eyes; anything that mutates the outside world (deploy, alias, DNS,
settings, indexing, posting) is a separate, named Approval.
