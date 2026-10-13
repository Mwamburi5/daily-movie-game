# Match Cut — handoff summary

**Last verified:** 2026-09-13 on `codex/handoff-refresh-2026-09-13` (from main 8100e29) · **Handoff folder:** [HANDOFF/README.md](README.md)

## What it is

Match Cut is a free browser game at matchcutdaily.com: four daily movie
puzzles (Daily Puzzle, Chronology, Connections, and a Duel vs the computer)
where every card is a movie and movies connect through the people who made
them. Static React site, no accounts, no backend; every puzzle is a pure
function of the calendar date and a curated pool. Built and owned by Buri
(GitHub `Mwamburi5`) through Claude Code and Codex sessions since June 2026.
Older name: Marquee ("marquee" survives as the Duel pile term).

## Where it stands

**Live but private, two weeks from the premiere.** The launch build
(`main@9a5fdbb`) has been in production since 2026-09-05 with bytes proven,
rollback drilled (7 s), and nightly/30-min watchers green. No source file has
changed since; everything since 09-05 is docs, rulings, and one held commit.
Search engines are told to stay out and shares carry no URL until
**Approval 5 on Saturday 2026-09-19** (the commit is ready and CI-green on
`codex/approval-5`, not deployed). The **premiere is Sunday 2026-09-27**, when
the Daily Puzzle and Duel switch from the legacy 89-film pool to the curated
216 + 16 wilds; a 72-hour freeze starts 09-24. A circle of friends has played
since 2026-07-10 (27 feedback entries logged).

What decides whether 09-27 is a good day: the five attended lanes (real
iPhone, real Android, two screen readers) that have never run on any build,
now **booked for Tuesday 2026-09-15 evening with Buri running all of them**;
the owner chores the same evening (MFA, a `main` ruleset, the domain
redirect); Approval 5 landing on 09-19; and an unmeasured "hidden credit"
difficulty in launch week. Plan of record: [`docs/master-plan.md`](../docs/master-plan.md)
(constitution + roadmap, v6); current state: [`docs/launch-status-review-2026-09-06.md`](../docs/launch-status-review-2026-09-06.md)
(read its 09-10 and 09-13 addenda first).

## Run it in five minutes

1. Node 24 (`/usr/local/bin/node` on Buri's Mac; the shell default is 22), then `npm ci`.
2. `PATH=/usr/local/bin:$PATH npm run dev` → http://localhost:5173
   (`?mode=duel` jumps into a mode).
3. Quick gates: `npm run build && npm run verify:solo && npm run verify:chronology && npm run verify:connections`
   → clean · 8/8 · 42/42 · 14/14.
4. Full Duel contract: `npm run verify` → 64/64 (~2.5 min). Re-run 2026-09-13: build clean, 8/8, 42/42, 64/64.
5. Never deploy from your working tree; pushes never deploy. Runbook:
   [`docs/daily-duel-216-deploy-and-indexing-runbook.md`](../docs/daily-duel-216-deploy-and-indexing-runbook.md).
   Detail in [03-how-to-run.md](03-how-to-run.md).

## Five decisions you must not undo

- **The sim is the source of truth; React must match it.** Any rule, scoring,
  pool, seed, or pin change needs its own approval, all four gates, and a
  re-tune. [04-decisions.md](04-decisions.md#locked-rules-the-do-not-relitigate-list)
- **Dependencies are locked** to React 18 / Vite / Tailwind 4 / Framer Motion;
  localStorage holds meta-state only. [04](04-decisions.md)
- **`docs/master-plan.md` is the only live plan**; PLAN.md and the other two are
  bannered history. Deploys and every external mutation are Buri's, and the
  Preview bypass cookie is minted only at the start of a fixed weekly slot. [05-plans.md](05-plans.md)
- **The Stub is the visual language; card faces are typographic; no posters or
  stills anywhere.** UI work stops for side-by-sides at 390×844 and 375×667. [07](07-ui-and-design.md)
- **The first-player edge in Duel (~9.5pp) ships as a documented house edge;
  the 216 cutover date is 2026-09-27 and `DAILY_EPOCH` stays 2026-07-04.** [04](04-decisions.md)

## Where things live

| Topic | Path |
|---|---|
| Game code (one file per mode; `DuelGame.tsx` is the 2,445-line blast-radius file) | `src/` |
| Shared pure rules (React and sim both import) | `src/lib/` |
| Content pools (append-only) and baked artifacts | `src/data/` |
| Rules contract / simulator / verify suites | `sim/RULESET.md`, `sim/` |
| Player rulebook | `RULEBOOK.md` |
| Plan of record, prompts, checkpoints, receipts, runbooks | `docs/` (index in [10-file-index.md](10-file-index.md)) |
| The launch-runway pack: lane run-sheets, schedule, owner checklist | `docs/attended-lanes/` |
| The held Approval 5 commit | branch `codex/approval-5` (5edaec3) |
| Design system + reference screens | `design_handoff_the_stub/` |
| Author-time content tooling (TMDB) and release gates | `scripts/`, `/tmdb-check` skill |
| Browser smoke + CI + production watchers | `tests/browser/`, `.github/workflows/` |
| Evidence screenshots (gitignored, partly force-added) | `audit/` |
| Promo track and campaign brief | `promo/`, `docs/promo-execution-prompts.md`, `docs/launch-campaign-plan.md` |
| How the project was built, and what to change about that | `docs/process-retrospective-2026-09-08.md` |
| Claude's working rules and memory | `CLAUDE.md`, `AGENTS.md`, `memory/` (symlink, Buri's machine only) |

## Next

1. **Tue 09-15:** Buri runs lanes A–E from `docs/attended-lanes/` and the owner
   checklist; results go into the acceptance record. A defect → fix branch
   Wed 09-16. [09-open-work.md](09-open-work.md)
2. **Sat 09-19:** Approval 5 — jar at slot start, Preview gate on
   `codex/approval-5`, Buri deploys, rollback ids updated and re-drilled,
   sitemap submitted.
3. **Before 09-24:** append the premiere watch card to the runbook, refresh
   this handoff, then promo Phase 0-captures and launch copy.

## Ask Buri about

D4 practice rows stay? · Vercel plan · TMDB non-commercial line · promo
red-pen, amber pick, platforms, Product Hunt, and when the week-0 campaign
items get hours · which private tracker · who watches on 09-27 / 09-29 ·
status review: addenda in place or a fresh review after Approval 5. Full list
in [09-open-work.md](09-open-work.md#questions-for-the-owner).
