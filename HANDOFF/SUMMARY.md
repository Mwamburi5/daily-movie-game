# Match Cut — handoff summary

**Last verified:** 2026-09-08 on `codex/handoff-and-stale-docs` (from d22a255) · **Handoff folder:** [HANDOFF/README.md](README.md)

## What it is

Match Cut is a free browser game at matchcutdaily.com: four daily movie
puzzles (Daily Puzzle, Chronology, Connections, and a Duel vs the computer)
where every card is a movie and movies connect through the people who made
them. Static React site, no accounts, no backend; every puzzle is a pure
function of the calendar date and a curated pool. Built and owned by Buri
(GitHub `Mwamburi5`) through Claude Code and Codex sessions since June 2026.
Older name: Marquee ("marquee" survives as the Duel pile term).

## Where it stands

**Live but private.** The launch build (`main@9a5fdbb`) has been in production
since 2026-09-05 with bytes proven, rollback drilled (7 s), and nightly/30-min
watchers green. Search engines are told to stay out and shares carry no URL
until **Approval 5 (~2026-09-19/20)**. The **premiere is Sunday 2026-09-27**,
when the Daily Puzzle and Duel switch from the legacy 89-film pool to the
curated 216 + 16 wilds. A 72-hour freeze starts 09-24. A circle of friends has
played since 2026-07-10 (27 feedback entries logged). What still decides
whether 09-27 is a good day: real-device/screen-reader lanes that have never
been run, Approval 5 landing on time, and an unmeasured "hidden credit"
difficulty in launch week. Plan of record: [`docs/master-plan.md`](../docs/master-plan.md)
(constitution + roadmap, v6 amended 2026-09-08 through Approval 4); current state:
[`docs/launch-status-review-2026-09-06.md`](../docs/launch-status-review-2026-09-06.md).

## Run it in five minutes

1. Node 24 (`/usr/local/bin/node` on Buri's Mac; the shell default is 22), then `npm ci`.
2. `PATH=/usr/local/bin:$PATH npm run dev` → http://localhost:5173
   (`?mode=duel` jumps into a mode).
3. Quick gates: `npm run build && npm run verify:solo && npm run verify:chronology && npm run verify:connections`
   → clean · 8/8 · 42/42 · 14/14.
4. Full Duel contract: `npm run verify` → 64/64 (~2.5 min).
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
  bannered history. Deploys and every external mutation are Buri's. [05-plans.md](05-plans.md)
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
| Design system + reference screens | `design_handoff_the_stub/` |
| Author-time content tooling (TMDB) and release gates | `scripts/`, `/tmdb-check` skill |
| Browser smoke + CI + production watchers | `tests/browser/`, `.github/workflows/` |
| Evidence screenshots (gitignored, partly force-added) | `audit/` |
| Promo track (untracked) | `promo/`, `docs/promo-execution-prompts.md` |
| Claude's working rules and memory | `CLAUDE.md`, `AGENTS.md`, `memory/` (symlink, Buri's machine only) |

## Next

1. Build the attended-lanes pack and book real-iPhone / Android / TalkBack
   sittings this week (hard stop 09-20). [09-open-work.md](09-open-work.md)
2. Five-minute account chores before Approval 5: MFA on Vercel/GitHub/Name.com,
   a `main` ruleset, the analytics dashboard look, fix `playmatchcut.com`.
3. Prepare Approval 5 as one commit with its own Preview gate and deploy
   (09-19/20) and append a premiere watch card to the runbook.

## Ask Buri about

Merge the docs-only PR that tracks this folder · D3 lanes (who,
hardware, dates) · D4 practice rows stay? · D9 Approval 5 date and URL on
practice shares · D11 small-phone pass or skip · Vercel plan · TMDB
non-commercial position · promo red-pen, amber pick, platforms, Product Hunt ·
master-plan v6 now or after launch. Full list in [09-open-work.md](09-open-work.md#questions-for-the-owner).
