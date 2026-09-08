# 08 — AI workflow

**Last verified:** 2026-09-07 at d22a255

This project is built almost entirely through AI coding sessions: Claude Code
(desktop app, Fable/Opus/Sonnet tiers) as orchestrator and, since August, Codex
`/goal` tasks for long gated passes. Buri's role is product owner, arbiter of
every subjective or external-facing call, and the only person who deploys.

## Instruction files

| File | Enforces |
|---|---|
| `CLAUDE.md` (repo root, always loaded) | Two Karpathy rules: **Think Before Coding** (state assumptions; name the reading of subjective asks; a rule/scoring change is never trivial) and **Surgical Changes** (touch only what you must; DuelGame.tsx is the blast-radius file; match the lowercase `say()` voice; mention dead code, don't delete). Project guardrails: master-plan is the only live plan; RULESET is canonical with the gate counts; deps locked; persistence = meta-state only; RULEBOOK sync |
| `AGENTS.md` | For Codex and other agents: read CLAUDE.md first; feature-branch policy (never push directly to main — note this conflicts with July's push-to-main practice; since August all work goes through `codex/**` branches and PRs) |
| `docs/master-plan.md` §2 + §8 | The constitution and the boot prompt |
| `~/.claude/CLAUDE.md` (Buri's global) | Substantive answers end with "Least confident" and "What you might be missing" |
| `.claude/skills/tmdb-check/SKILL.md` = `.agents/skills/tmdb-check/SKILL.md` | The `/tmdb-check` skill: probe → audit → filter rulings → arbitrate new flags with Buri → apply → right-sized gate sweep. Args: a draft `Movie[]` module, `dates`, or `names` |
| `.claude/launch.json` | Preview dev servers for the in-app browser |
| `.codex/config.toml` | Codex MCP (Stitch) config |

## Skills, agents, and plugins used

- **Project skill:** `/tmdb-check` (content arbitration).
- **User skills seen in sessions:** `/project-handoff` (this), `/marketing:campaign-plan`
  (produced `docs/launch-campaign-plan.md`), grill-me style decision sessions,
  Karpathy guidelines (adapted into CLAUDE.md, plugin install pending since 2026-06-22).
- **Sub-agents:** heavy use of the Agent tool for parallel read-only reviews
  (six-auditor recon 2026-07-06; 18-area review fleet 2026-07-09/10; five-agent
  pre-launch review 2026-09-03) and for isolated build lanes in git worktrees
  (three polish batches 2026-09-03, one PR each). **Rule since 2026-09-02:
  sub-agents run on Opus with full self-contained briefs.**
- **Connectors:** Canva (mockups, 2026-09-01); Vercel via `npx vercel`; GitHub via `gh`.
- **Browser tooling:** the desktop app's browser pane (`mcp__Claude_Browser__*`)
  and earlier `Claude_Preview` tools for screenshots at contract sizes; Playwright
  for the smoke suite and the production driver.

## Project memory

`memory/` in the repo is a symlink to
`~/.claude/projects/-Users-mwamburi-Projects-Daily-Movie-Game/memory/` (gitignored).
Files are `marquee-*.md` with frontmatter; `MEMORY.md` is the index loaded each
session. The load-bearing ones:

| File | What it holds |
|---|---|
| `marquee-next-session-queue.md` | ▶ **START HERE** pointer: production state, open approvals, next actions, lessons (e.g. jar minting, Vercel token) |
| `marquee-orchestration-workflow.md` | The protocol: one live plan, gate-split autonomy, git/push policy, sub-agent conventions, wind-down preference |
| `marquee-review-priorities.md` | The long narrative of July: grills, WS1–WS2, master-plan reset, W0–W5 execution |
| `marquee-stub-ui-handoff.md` | Stub facts and rulings |
| `marquee-tmdb-pipeline.md` | Content tooling, licence posture, TMDB gotchas |
| `marquee-promo-track.md` | Promo status + Canva design IDs |
| `marquee-deepcut-initiative.md` | Parked D1 lever |
| `marquee-funpass-decisions.md`, `-flow-diagnosis.md`, `-difficulty-spec.md`, `-implementation-plan.md`, `-decisions-log.md`, `-chronology-mode.md`, `-card-asset-template.md`, `-design-roadmap.md`, `-pivot-and-stack.md`, `-tooling-and-docs.md` | June history (pre-git) |
| `feedback-subagent-model-opus.md` | Buri's Opus rule |

Memory is updated at every wind-down; the master plan's Ledger and the receipts
are the durable record, memory is the resume pointer. **A newcomer without
access to Buri's machine does not have this memory**; this handoff and the
status review carry the same facts.

## Session patterns

35 sessions were mined (2026-06-28 → 2026-09-08). A typical one:

1. **Boot** with a kickoff prompt (often written by the previous session and
   saved as a file), or "where are we?" / "resume".
2. **Verify ground truth**: quick gates + `git status` before anything.
3. **Work the first unticked item** with the gate-split rule; parallel
   sub-agents for reviews or disjoint lanes; one writer on DuelGame.
4. **Checkpoint**: side-by-sides at both sizes + a played game (UI) or gate
   output (objective); Buri rules in-session, sometimes as a one-decision-at-a-
   time grill.
5. **Receipt**: checkpoint/receipt doc, Ledger tick in the same commit, PR.
6. **Wind-down**: memory update + the next kickoff prompt, then "restart fresh".

Sessions run long (up to ~500 assistant turns) and several hit the usage limit
mid-flight; the file-based kickoff/receipt pattern exists precisely so that a
cold restart loses nothing. Buri's stated preference: stop cleanly rather than
push on with thin context.

## Guardrails (consolidated)

- Read the governing file first; stop read-only if preconditions fail.
- Node 24 via `PATH=/usr/local/bin:$PATH`.
- Objective lanes auto commit+push on green; UI lanes stop for Buri with
  screenshots; **deploys and every external mutation are Buri's**.
- Rule/scoring/pool/seed/pin/dealer changes: never fold in; flag; own approval;
  full gates + re-tune.
- Deps locked; localStorage meta-only; typographic faces; brand Match Cut.
- One writer on `src/DuelGame.tsx`; surgical edits; no reducer refactor.
- Content merges via `/tmdb-check`; `movies.ts` and rulings ledgers append-only.
- Never `git add .`/`clean`/`reset`/`checkout`/`stash`; preserve the promo family.
- Deploy from a clean clone; `vercel whoami` first; agents never read the
  Vercel token or mint the jar (Buri runs `scratchpad/mint.sh` in the Terminal tab).
- Sub-agents on Opus; self-contained briefs; no git or concurrent builds in
  sub-agents; unique dev-server ports.
- Freeze file edits while capturing browser evidence (the preview pane reloads
  on any edit).
- Never post or publish promo; Buri posts.
- Wind down long sessions: gate → commit+push → Ledger → memory → fresh start.

## How to start the next session

Paste this (fill the bracket after reading the status review):

```text
You are the orchestrator for Match Cut (~/Projects/Daily Movie Game).
Read HANDOFF/SUMMARY.md, then docs/launch-status-review-2026-09-06.md (the
current state, owners, deadlines, calendar), then docs/master-plan.md §2
(constitution) and §7 (Buri's open queue). Verify ground truth before
anything: PATH=/usr/local/bin:$PATH npm run build · verify:solo ·
verify:chronology · verify:connections, plus git status (expect main at
d22a255 or later, six untracked local-only docs/promo files — leave them).

Expected state: PRODUCTION = main@9a5fdbb (dpl_HWeNAMnK2eLernz47PCG9RAmgCu6)
since 2026-09-05; rollback target dpl_8SighytERqgygRYvbf1eMyLis6SL; crons
live; noindex ON and shares URL-free until Approval 5 (~09-19/20); first
216 Daily = 2026-09-27 (day 86); 72-h freeze from 09-24.

THIS SESSION: [the next item from the status review §2 — e.g. build the
attended-lanes pack per docs/daily-duel-216-attended-lanes-scheduling-goal-
prompt.md, read-only otherwise]. Stop at [the named checkpoint].

APPROVED: [exactly what]. NOT approved: production deploy, alias/DNS/Vercel
settings, indexing switches, any rule/scoring/seed/pool/dealer change, new
deps, DuelGame.tsx refactor, touching the promo family.

HOUSE RULES: CLAUDE.md + master-plan §2; sub-agents on Opus with full briefs;
Node 24 prefix; never git add . / reset / stash; deploys are Buri's; wind
down cleanly on a long session (gate → commit+push → docs → memory).
```
