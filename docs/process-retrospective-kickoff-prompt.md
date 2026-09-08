# Match Cut — build-process retrospective — Kickoff prompt

Written 2026-09-08 at Buri's ask, the morning after the project handoff
(`HANDOFF/`). LOCAL-ONLY until Buri decides to track it, like the other
kickoff prompts. Run in a fresh session. READ-ONLY: this pass analyzes how the
project was built; it changes nothing in the game, the plan, or the process.

## Why

Since 2026-06-11 the project has been built almost entirely through AI
sessions: 35 Claude Code sessions (plus Codex `/goal` runs that left no Claude
transcript), 34 catalogued kickoff/goal prompts, ~167 documents, 105 commits,
15 PRs, and roughly 5,900 assistant turns. Buri's question, verbatim in
spirit: *"See if I've been building in an efficient way, if there's a better
way to build, if there's a more structured way to build."* One earlier attempt
at this (the "process-retro" agent of the 2026-07-09/10 18-area review fleet)
died on session limits and was never re-run — this pass owes that answer.

## Inputs (read in this order)

1. `HANDOFF/SUMMARY.md`, then `HANDOFF/06-prompts.md` (the prompt catalogue and
   house style), `HANDOFF/05-plans.md` (timeline), `HANDOFF/04-decisions.md`
   (what got decided when, and the eleven reversals), `HANDOFF/08-ai-workflow.md`.
2. `audit/process-retro-2026-09-08/` — evidence staged for this pass:
   `session-table.md` (every session: dates, branch, prompt count, assistant
   turns, transcript size), `sessions.md` (per-session prompts + Claude's
   closing message), `long-prompts.md` (every prompt ≥600 chars in full),
   `inventory.md` (every doc with git dates). If the folder is missing,
   regenerate with the project-handoff skill's scripts:
   `python3 ~/.claude/skills/project-handoff/scripts/mine_transcripts.py "$PWD" --out <scratch>`.
3. The prompt files themselves (`docs/*-kickoff-prompt.md`, `docs/*-goal-prompt.md`,
   `docs/master-plan.md` §8) and the receipt each one produced (paired in
   `HANDOFF/06-prompts.md`).
4. `docs/master-plan.md` §2 (the constitution) and §10 (amendment log);
   `CLAUDE.md`; `AGENTS.md`; the memory file `marquee-orchestration-workflow`
   (protocol) if accessible.
5. `git log --format='%h %ad %s' --date=short` and `gh pr list --state all`.

## What to analyze (each with evidence, never impression)

**A. Throughput and rework.** For each phase in the HANDOFF timeline: calendar
days, sessions, assistant turns, commits, and what shipped. Where did work get
done twice or thrown away? Known candidates to confirm or refute: Wave A's
"invisible inventory" (five components forged unwired, then a full plan reset
2026-07-06); the 18-area review fleet dying on limits twice; the July "SEND
window" deploy that never happened until 08-07; the Preview jar mint that took
a day; PLAN.md → orchestration-plan → ui-tasks → master-plan (three plans in
two days); the review → fix-pass → readiness → resume → ship → preview → deploy
chain in late August (seven prompts for one release). Quantify what each cost.

**B. Session shape.** Distribution of session length (turns) and how often a
session ended on "You've hit your session limit" or a thin-context wind-down.
Does the file-based kickoff/receipt pattern actually make cold restarts cheap
(measure: turns spent re-establishing state at the top of each session vs.
turns spent building)?

**C. Gating and Buri's time.** Count checkpoints, grills, and approvals. Which
gates caught real defects (list them — e.g. the Preview Toolbar injection,
the year-in-DOM leak, the double-tap Allow-It guard, the CSP drift) and which
were ceremony? Estimate Buri's attended minutes per gate from the transcripts
(prompt count and timestamps) and where his time was the long pole (attended
lanes, jar minting, arbitration passes, screenshot reviews).

**D. Documentation load.** 167 docs for a static game. Which documents were
read again after being written (cross-references, "read X FIRST" mentions in
later prompts)? Which were write-once? Propose a retention rule.

**E. Multi-agent use.** Where parallel sub-agents paid off (six-auditor recon,
five-agent pre-launch review, three worktree batches) and where they did not
(reports ending on garbage text, verifiers dying, worktree merges). Cost in
tokens where recoverable from the transcripts.

**F. Prompt quality.** Score the 34 prompts on the house-style checklist in
`HANDOFF/06-prompts.md` (governing file, preconditions, approvals in force,
locked decisions, work sequence, guardrails, done-when, stop point). Correlate
with outcome: did the more structured prompts produce fewer deviations and
shorter sessions? Identify the best three and the worst three, with reasons.

**G. Structured alternatives.** Compare the current pattern against at least
three named approaches: (1) a persistent planning tree with phase/plan/verify
artifacts (GSD-style `.planning/`, spec-driven development); (2) issue-tracker-
driven work (GitHub issues + PR template + labels, ADRs for decisions);
(3) a lighter "one living plan + changelog + weekly review" cadence suited to
a solo owner post-launch. For each: what it would have saved in the last
three months, what it would cost to adopt now, what it would break (the
gate-split autonomy, the sim contract, the receipts chain).

## Deliverable

One untracked file `docs/process-retrospective-2026-09-08.md` with these
sections, every claim pointing at a session id, prompt, commit, or document:

1. TL;DR — five sentences, then a one-line verdict on "efficient or not."
2. Metrics table — per phase: days, sessions, turns, commits, shipped, rework.
3. What worked — ranked, with the evidence.
4. What it cost — ranked by turns/days lost, with the evidence.
5. Gate audit — table of every checkpoint/approval: what it caught, what it cost.
6. Documentation audit — keep / archive / never-write-again rules.
7. Prompt scorecard — the 34 prompts scored; best three, worst three.
8. Alternatives — the three approaches compared honestly.
9. Recommendation — a concrete process for the next 90 days (launch soak →
   interviews → front door → P5–P7), sized for one owner and AI sessions:
   cadence, artifacts, gates that stay, gates that go, a prompt template.
10. Questions for Buri — things the transcripts cannot answer (his hours,
    what felt slow, what he would not give up).

Plus a ≤15-line chat summary ending with the single highest-leverage change.

## Method

- Fan out with Opus sub-agents (Buri's standing rule), one per section A–G,
  each given the exact evidence paths above and told to return numbers with
  pointers, not prose. The main session reconciles and writes the file.
- Prefer measured claims; where a number is an estimate, say how it was
  estimated. Where the transcript digest is not enough (e.g. token cost), say
  "not recoverable from the digest" rather than guessing.
- Be fair in both directions: the process shipped a four-mode game with a
  parity-gated rules engine and a drilled rollback in three months; also name
  what a more structured team would have done in half the sessions.

## Guardrails

READ-ONLY. No source edits, no commits, pushes, PRs, deploys, Vercel or GitHub
mutations, no checklist ticks, no memory edits unless Buri asks; do not touch
`promo/`, `HANDOFF/`, or the other untracked docs. Node 24 via
`PATH=/usr/local/bin:$PATH` if any script runs. Sub-agents run no git.

## Done when

`docs/process-retrospective-2026-09-08.md` exists with all ten sections
filled, every non-obvious claim has a pointer, the chat summary is posted, and
`git status` shows only that file added to the untracked set.

---

Paste-able `/goal` block:

````text
/goal Produce the Match Cut build-process retrospective. Read
docs/process-retrospective-kickoff-prompt.md FIRST and follow it verbatim;
this condition is only its completion gate. READ-ONLY session: no source
edits, commits, pushes, PRs, deploys, Vercel/GitHub mutations, checklist
ticks, or memory edits; do not touch promo/, HANDOFF/, or other untracked
files. Evidence = HANDOFF/ + audit/process-retro-2026-09-08/ (session table,
session digest, long prompts, inventory) + the prompt files and their
receipts + git/PR history. Analyze sections A–G (throughput and rework,
session shape, gating and Buri's time, documentation load, multi-agent use,
prompt quality, structured alternatives) with Opus sub-agents returning
numbers with pointers. Output = one untracked file
docs/process-retrospective-2026-09-08.md with the ten sections the prompt
lists, every claim pointing at a session id, prompt, commit, or doc, plus a
≤15-line chat summary ending with the single highest-leverage change. Done
when the file exists with all ten sections filled and nothing else in the
tree changed.
````
