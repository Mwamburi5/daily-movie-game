# 08 — AI workflow

**Last verified:** 2026-09-13 on `codex/handoff-refresh-2026-09-13` (from main 8100e29)

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
  pre-launch review 2026-09-03; seven-analyst process retrospective 2026-09-08)
  and for isolated build lanes in git worktrees
  (three polish batches 2026-09-03, one PR each). **Rule since 2026-09-02:
  sub-agents run on Opus with full self-contained briefs.** Since 2026-09-13
  Sonnet may be tried on simple, fully specified tasks and measured; Opus stays
  the default (retro Q10). Buri also intends to try Codex for upcoming work (Q4).
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

42 sessions were mined (2026-06-28 → 2026-09-13). A typical one:

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

## The process retrospective (2026-09-08)

`docs/process-retrospective-2026-09-08.md` measured the build: 6,245 recorded
turns and 1.76 B tokens across the mined sessions (26% in sub-agents), about
20 owner-hours (Buri's own figure), 27 defects caught by gates, and a verdict
of "efficient per owner-minute, inefficient per calendar day" (a 20-day
undeployed window, a day lost to one jar mint, a 25-day PR). Its §9 recommends
fixed weekly owner slots, one gated pass per session (≤5 gated steps, wind down
by ~300 turns), fan-out of ≤5 agents with synthesis first, a `CHANGELOG.md`,
issues in a tracker, ADRs for rulings, and a PR template. **Adopted on
2026-09-13:** the slot-minted jar (Q7), receipts for Approvals only (Q8), a
private tracker rather than public internal issues (Q9), the Sonnet trial
(Q10). Still open: the CHANGELOG, ADRs, the PR template, the master-plan trim,
and which tracker.

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
  Since 2026-09-13 the jar is minted at the start of a fixed weekly slot, never
  ad hoc (retro Q7).
- Receipts for Approvals only (deploys, front-door change, pool cutover); every
  other pass is a CHANGELOG line plus the PR (2026-09-13, retro Q8).
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
current state; read its 09-10 and 09-13 addenda first), then docs/master-plan.md §2
(constitution) and §7 (Buri's open queue). Verify ground truth before
anything: PATH=/usr/local/bin:$PATH npm run build · verify:solo ·
verify:chronology · verify:connections, plus git status (expect main at
8100e29 or later and a clean tree; codex/approval-5 holds the Approval 5
commit 5edaec3, CI green, NOT deployed).

Expected state: PRODUCTION = main@9a5fdbb (dpl_HWeNAMnK2eLernz47PCG9RAmgCu6)
since 2026-09-05; rollback target dpl_8SighytERqgygRYvbf1eMyLis6SL; crons
live; noindex ON and shares URL-free until Approval 5 (Sat 09-19; Buri mints
the jar at the start of the slot, then Preview gate, then his deploy); first
216 Daily = 2026-09-27 (day 86); 72-h freeze from 09-24.

THIS SESSION: [the next item from the status review's latest addendum — e.g.
record the Tue 09-15 lane results in docs/daily-duel-216-attended-acceptance.md
and open a fix branch if a lane failed; or on 09-19 run the Approval 5 Preview
gate from a clean clone once the jar exists]. Stop at [the named checkpoint].

APPROVED: [exactly what]. NOT approved: production deploy, alias/DNS/Vercel
settings, indexing switches, any rule/scoring/seed/pool/dealer change, new
deps, DuelGame.tsx refactor, touching the promo family.

HOUSE RULES: CLAUDE.md + master-plan §2; sub-agents on Opus with full briefs;
Node 24 prefix; never git add . / reset / stash; deploys are Buri's; wind
down cleanly on a long session (gate → commit+push → docs → memory).
```
