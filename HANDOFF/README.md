# Match Cut handoff

**Last verified:** 2026-09-13 on branch `codex/handoff-refresh-2026-09-13` (from main
8100e29) · 115 commits on main (2026-07-03 → 2026-09-13) · repo:
https://github.com/Mwamburi5/daily-movie-game · every document cited here is
tracked on `main` since PR #16 merged on 2026-09-13

Start with [SUMMARY.md](SUMMARY.md). Then read in this order:

1. [01-overview.md](01-overview.md) — what it is, names and aliases, ten-line history, vocabulary
2. [03-how-to-run.md](03-how-to-run.md) — get it running first; everything else makes more sense after
3. [02-architecture.md](02-architecture.md) — stack, layout, key modules, invariants, tests, services
4. [04-decisions.md](04-decisions.md) — 87 dated decisions, 20 locked rules, 15 reversals. **Read before you change anything**
5. [05-plans.md](05-plans.md) — the plan of record, the timeline, which plans are live vs history
6. [06-prompts.md](06-prompts.md), [08-ai-workflow.md](08-ai-workflow.md) — how the project is actually built (prompt library + AI protocol + the retrospective)
7. [07-ui-and-design.md](07-ui-and-design.md) — the Stub design system, screens, sources, QA
8. [09-open-work.md](09-open-work.md) — the launch runway, backlog, debt, doc conflicts, questions for Buri
9. [10-file-index.md](10-file-index.md) — every document, classified, with status

## Status snapshot

| Item | Value |
|---|---|
| Product | Match Cut, four daily movie games at https://matchcutdaily.com (quiet phase: `noindex`, URL-free shares) |
| Last commit | `8100e29` 2026-09-13 "Merge pull request #17" (rulings + lane booking; docs only) |
| Production | `main@9a5fdbb` = `dpl_HWeNAMnK2eLernz47PCG9RAmgCu6`, live since 2026-09-05T21:25Z; rollback target `dpl_8SighytERqgygRYvbf1eMyLis6SL`; no source change since |
| Held commit | `codex/approval-5` = `5edaec3` (noindex off + URL on every share + both smokes assert it); CI green 2026-09-13; not merged, not deployed |
| Plan of record | `docs/master-plan.md` (v6: constitution + roadmap); current state in `docs/launch-status-review-2026-09-06.md` + its 09-10 and 09-13 addenda |
| Rules contract | `sim/RULESET.md`; player guide `RULEBOOK.md` |
| Gates (re-run 2026-09-13, Node 24.14.0) | build clean · verify **64/64** · verify:solo **8/8** · verify:chronology **42/42** · verify:connections **14/14** (09-07 run + CI; not re-run locally, >10 min) · verify:analytics / verify:progress / check:bundle / check:security PASS (09-07) |
| Browser smoke | 39/39 per the polish receipt; green in CI on every merge and on 5edaec3; not re-run locally |
| Difficulty tune | 65.9 / 50.3 / 41.4 (Matinee / Feature / Director's) vs targets 65 / 50 / 41; not re-run (long) |
| Deploy target | Vercel project `marquee` (Hobby plan), explicit CLI deploys only, no git integration |
| Monitoring | `prod-smoke.yml` nightly + `prod-canary.yml` every 30 min (GitHub throttles to ~2–5 h); only `@vercel/analytics` is wired, no Speed Insights |
| Next hard dates | **Tue 09-15** lanes A–E + owner checklist (Buri) · **Sat 09-19** Approval 5 · freeze 09-24 · **Premiere 2026-09-27** (first 216-film Daily, day 86) · Show HN 09-29 |
| Sessions mined | 42 Claude Code sessions, 2026-06-28 → 2026-09-13, from `~/.claude/projects/-Users-mwamburi-Projects-Daily-Movie-Game` |
| Docs indexed | ~178 text documents + ~443 binary assets (see 10-file-index.md) |
| Decisions logged | 87 dated + 20 locked rules + 15 reversals |
| Prompts catalogued | 37 (26 files in the repo + session-only) |

## Coverage and gaps

**Verified directly this run:** `git log` / branches / PR list / CI status on
`codex/approval-5`, that no file outside `docs/`, `promo/`, and `HANDOFF/`
changed since d22a255, the four quick gates plus the full Duel verify (build ·
8/8 · 42/42 · 64/64 on 2026-09-13), and every document status in the file
index (by reading banners, headers, diffs, and cross-references). Production
state is taken from the 09-13 read-only checks recorded in the status review's
addenda (`index-DAtVcX_d.js` still served, crons green); this refresh did not
itself curl production.

**UNVERIFIED this run:** `verify:connections` (14/14 on 09-07 and in CI),
`npm run test:smoke` and the `eval tune` numbers (long; green in CI and in the
receipts); which file holds the 2026-08-07 Chronology concept images; whether
`docs/card-redesign-proposal.html` is still relevant.

**Not read:** `.env.local`, the Codex config headers, raw session transcripts
(only the digest), and the three agent worktrees under `.claude/worktrees/`.

**Memory dependency:** a large part of June–July history and the "next session"
pointer live in Claude's per-project memory on Buri's machine (`memory/`
symlink, gitignored). This handoff transcribes what matters; a newcomer on
another machine will not have those files.

## Handoff changelog

- 2026-09-07 — initial handoff (d22a255)
- 2026-09-08 — docs-only branch `codex/handoff-and-stale-docs`: handoff + launch-window docs + promo tracked; stale-docs pass (10 files date-bannered/ticked); master-plan v6; handoff refreshed to match
- 2026-09-13 — update: PR #16 and #17 merged (everything tracked on `main`); the 09-10 runway pass (lane pack, owner checklist, two corrections: no Speed Insights, Approval 5 needs a URL assertion); the process retrospective and Buri's answers; rulings D9 (Sat 09-19, URL on practice shares) / D10 / D11 (skip) / Speed Insights post-launch; lanes booked Tue 09-15; `codex/approval-5` built and CI-green; gates re-run; 10 decisions and 4 reversals added; open work and questions rewritten (8100e29)
