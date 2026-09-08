# Match Cut handoff

**Last verified:** 2026-09-08 on branch `codex/handoff-and-stale-docs` (from main
d22a255) · 105 commits on main (2026-07-03 → 2026-09-05) · repo:
https://github.com/Mwamburi5/daily-movie-game · the formerly untracked docs,
`promo/`, and this folder are tracked on that branch

Start with [SUMMARY.md](SUMMARY.md). Then read in this order:

1. [01-overview.md](01-overview.md) — what it is, names and aliases, ten-line history, vocabulary
2. [03-how-to-run.md](03-how-to-run.md) — get it running first; everything else makes more sense after
3. [02-architecture.md](02-architecture.md) — stack, layout, key modules, invariants, tests, services
4. [04-decisions.md](04-decisions.md) — 66 dated decisions, 20 locked rules, 11 reversals. **Read before you change anything**
5. [05-plans.md](05-plans.md) — the plan of record, the timeline, which plans are live vs history
6. [06-prompts.md](06-prompts.md), [08-ai-workflow.md](08-ai-workflow.md) — how the project is actually built (prompt library + AI protocol)
7. [07-ui-and-design.md](07-ui-and-design.md) — the Stub design system, screens, sources, QA
8. [09-open-work.md](09-open-work.md) — the launch runway, backlog, debt, doc conflicts, questions for Buri
9. [10-file-index.md](10-file-index.md) — every document, classified, with status

## Status snapshot

| Item | Value |
|---|---|
| Product | Match Cut, four daily movie games at https://matchcutdaily.com (quiet phase: `noindex`, URL-free shares) |
| Last commit | `d22a255` 2026-09-05 "Merge pull request #14" (crons live) |
| Production | `main@9a5fdbb` = `dpl_HWeNAMnK2eLernz47PCG9RAmgCu6`, live since 2026-09-05T21:25Z; rollback target `dpl_8SighytERqgygRYvbf1eMyLis6SL` |
| Plan of record | `docs/master-plan.md` (v6, 2026-09-08: constitution + roadmap, Ledger current through Approval 4); current state in `docs/launch-status-review-2026-09-06.md` |
| Rules contract | `sim/RULESET.md`; player guide `RULEBOOK.md` |
| Gates (run 2026-09-07, Node 24.14.0) | build clean · verify **64/64** · verify:solo **8/8** · verify:chronology **42/42** · verify:connections **14/14** · verify:analytics PASS · verify:progress PASS · check:bundle PASS · check:security PASS (370/27) |
| Browser smoke | 39/39 per the polish receipt; not re-run locally (CI green on every merge) |
| Difficulty tune | 65.9 / 50.3 / 41.4 (Matinee / Feature / Director's) vs targets 65 / 50 / 41; not re-run (long) |
| Deploy target | Vercel project `marquee` (Hobby plan), explicit CLI deploys only, no git integration |
| Monitoring | `prod-smoke.yml` nightly + `prod-canary.yml` every 30 min (GitHub throttles to ~4–5 h) |
| Next hard date | **Premiere 2026-09-27** (first 216-film Daily, day 86); Approval 5 ~09-19/20; freeze from 09-24 |
| Sessions mined | 35 Claude Code sessions, 2026-06-28 → 2026-09-08, from `~/.claude/projects/-Users-mwamburi-Projects-Daily-Movie-Game` |
| Docs indexed | 167 text documents + 443 binary assets (see 10-file-index.md) |
| Decisions logged | 66 dated + 20 locked rules + 11 reversals |
| Prompts catalogued | 34 (24 files in the repo + session-only) |

## Coverage and gaps

**Verified directly:** the manifest, entry points, source tree and line counts,
CI workflows, Vercel config, the nine local gates above, git log/branches/PR
list, and every document status in the file index (by reading banners,
headers, and cross-references). Production state was taken from the
2026-09-05 receipt and the 2026-09-06 live checks recorded in the status
review; this handoff did not itself curl production.

**UNVERIFIED this run:** `npm run test:smoke` and the `eval tune` numbers (both
long; last green in CI and in the 2026-09-03 receipts); which file holds the
2026-08-07 Chronology concept images; whether `docs/card-redesign-proposal.html`
is still relevant.

**Not read:** `.env.local`, the Codex config headers, raw session transcripts
(only the digest), and the three agent worktrees under `.claude/worktrees/`.

**Memory dependency:** a large part of June–July history and the "next session"
pointer live in Claude's per-project memory on Buri's machine (`memory/`
symlink, gitignored). This handoff transcribes what matters; a newcomer on
another machine will not have those files.

## Handoff changelog

- 2026-09-07 — initial handoff (d22a255)
- 2026-09-08 — docs-only branch `codex/handoff-and-stale-docs`: handoff + launch-window docs + promo tracked; stale-docs pass (10 files date-bannered/ticked); master-plan v6; handoff refreshed to match
