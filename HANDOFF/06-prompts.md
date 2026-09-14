# 06 — Prompt library

**Last verified:** 2026-09-13 on `codex/handoff-refresh-2026-09-13` (from main 8100e29) · 42 sessions mined from
`~/.claude/projects/-Users-mwamburi-Projects-Daily-Movie-Game` (2026-06-28 →
2026-09-13); 42 long prompts; 26 prompt files in the repo.

## How prompts are written here

Buri drives the project through **kickoff prompts** (orchestrator boot, house
style since 2026-07-06) and **goal prompts** (Codex `/goal` style since
2026-08-09, also used with Claude). They share a structure that a newcomer
should copy exactly:

- **"Read X FIRST"** — name the governing file(s) and the reading order; "follow
  it verbatim; this condition is only its completion gate."
- **Expected state / preconditions** — branch, exact HEAD SHA, upstream
  ahead/behind, dirty-path count, Node version, CI status; "**stop read-only and
  report if any fail**."
- **Approvals in force** — what Buri approved on a given date, and an explicit
  **NOT approved** list (deploy, alias, settings, indexing, rule changes, deps).
- **Locked decisions / do not relitigate** — a numbered block.
- **Work sequence** — numbered phases (P0 baseline → … → Pn receipts and stop),
  each with its gate.
- **Guardrails** — never `git add .`/reset/stash; preserve untracked work;
  Node 24 prefix; one writer on DuelGame; no source edit in read-only passes.
- **Done when / completion gate** — enumerated, checkable conditions with exact
  numbers (64/64, 8/8, 42/42, 14/14, budgets).
- **Stop at the named checkpoint**, then a paste-able fenced `/goal` block that
  compresses all of the above into one paragraph.

A short example of the voice (from the 2026-07-09 orchestrator boot):

```text
You are the orchestrator for Match Cut (~/Projects/Daily Movie Game).
Read docs/master-plan.md FIRST — the only live plan. §6 Ledger = resume sheet,
§2 = constitution, §2.2 = gate-split autonomy, §7 = user-input queue, §8 =
protocol. Verify ground truth before anything: quick gates (npm run build ·
verify:solo · verify:chronology · verify:connections, ~6s) + git status.

Expected state: main CLEAN at 3ec5b52, synced with origin. …
HOUSE RULES (§2): deploys are ALWAYS Buri … objective lanes auto commit+push
on green, UI/decision lanes STOP for Buri. Wind-down on a long session: finish
the in-flight lane to its gate, commit+push, tick the Ledger, update memory,
restart fresh.
```

Other recurring devices: a **grill** ("ONE AT A TIME, relentlessly, each
resolved to a concrete logged ruling before the next"); **evidence tiers**
("automated / attended; never close an attended lane by automation");
**deviations** sections in receipts; **session-scoped Stop hooks** whose
condition is the completion gate text; and the **wind-down clause**.

## Prompt catalogue

| Date | Name | Purpose | Produced | Source |
|---|---|---|---|---|
| 2026-06-28 | Chronology kickoff (Phase 1–2) | Build Mode 3 core + verify gate from the locked spec | `src/lib/chronology.ts`, `verify:chronology` 35/35 | `design/chronology-kickoff.prompt.md`; session 5c62ada1 |
| 2026-06-28 → 06-30 | Chronology Phase 3 / 4 / 5 / 6 kickoffs | UI, end/share, daily+difficulty, docs | Mode 3 complete | `docs/chronology-kickoff-phase3…6.md`; `design/chronology-build.prompt.md` |
| 2026-06-28 | "This is where we left off last in the Daily Movie Chain" | Funpass sim cycle resume | 4 rule levers locked, 2 rejected | session 320546cc |
| 2026-07-05 | Wave 0 / A orchestration briefs | Forge Stub components unwired | 5 components + preview harness | `docs/orchestration-plan.md` (superseded) |
| 2026-07-06 | **Master Prompt (§8)** | Boot any build session under the master plan | W0d → W5 sessions | `docs/master-plan.md` §8 |
| 2026-07-09 | W5b/W5c orchestrator boot | Grill three decisions (tilt, cutover, diversity) then polish | Rulings 5e0f644; W5c 56bdb77 | session 7f37d2a1 (long-prompts) |
| 2026-07-09 | W5c follow-ups boot | "Name is the hero" + Taz→CPU | 4f50447 | session 4694b8ff |
| 2026-07-09 | SEND-readiness boot | Confirm SEND readiness, do not deploy | "GO — pending your button" | session e970e455 |
| 2026-07-09/10 | "Thorough review of everything" (18-area review fleet) | Plan-vs-reality + retro | 13/18 first run, 18/18 after W5d | sessions 2faf775c, 1cba6766 |
| 2026-07-10 | W5d / W5e / W6 SEND boot | Ruled fixes + SEND | Live at matchcutdaily.com (0e1e403) | session 11aec86b |
| 2026-07-10 | UI-overhaul design guide (Buri's 8k-char prompt) | Intake his 2026 design guide against the ticket-stub voice | §7·8 (ddf599a) | session 9e1e9643 |
| 2026-07-10 | Analytics-slice boot ("ORDER MATTERS: deploy before he texts the circle") | Share event + outcome-enriched finish | efae3d4, deployed 61ec120 | session 76419469 |
| 2026-07-10 | Competitor deep-research prompt | External research brief (Framed, Cine2Nerdle, Cinematrix…) | prompt only | session 32b518b6 |
| 2026-07-12 | Design-lead studio brief ("versatility… visual identity pitched at the treatment") | Card/visual identity pitch | proposals, unbuilt | session 736dfca4 #3 |
| 2026-07-12 | Chronology Reel redesign plan review | Verify a plan before kickoff | 4 amendments, greenlit | session 855cc779 |
| 2026-07-16/17 | Feedback batch-1 boot; §7·7b/c minors boot | Fix slices under the deploy freeze | 3d84a15 → 0d0a172 | sessions 2da3c5fc, ab4d5447 |
| 2026-08-09 | **Full product, design, retention, software review kickoff** (24k chars) | Read-only review of everything | Fed the polish program | `docs/full-product-code-review-kickoff-prompt.md`; session f43225a3 |
| 2026-08-09 | Production-polish execution `/goal` | Phases 0–4 | RC 5316b04 | `docs/production-polish-goal-prompt.md` |
| 2026-08-20 | Onboarding flow build prompt | Replace IntroOverlay with four static screens | ce39837 | session e9809b98 |
| 2026-08-24 | UI-lock + movie-pool-health kickoff | Freeze UI, audit pool volume | `docs/movie-pool-health-report-2026-08-24.md` | `docs/ui-lock-and-movie-pool-health-kickoff-prompt.md` |
| 2026-08-2x | Pool expansion `/goal` | Systematic expansion (paused) | Wave 3 docs | `docs/pool-expansion-goal-prompt.md` |
| 2026-08-2x | 200-card cutover `/goal` | Pick and cut over the Daily/Duel pool | 216+16 release checkpoint | `docs/daily-duel-200-card-cutover-goal-prompt.md` |
| 2026-08-26 | 216+16 full review `/goal` | Review the cutover candidate | full-review report | `docs/daily-duel-216-full-review-goal-prompt.md` |
| 2026-08-27 | Now fix pass `/goal` | Surgical fixes from the review | now-fix checkpoint | `docs/daily-duel-216-now-fix-pass-goal-prompt.md` |
| 2026-08-28 | **Launch-readiness `/goal`** (governing prompt) | Goals 0–8 | Goals 0–3 | `docs/daily-duel-216-launch-readiness-goal-prompt.md` |
| 2026-08-30/31 | Launch-readiness resume `/goal` (Goals 4–8) | Finish the pass | checkpoint 08-31 | `docs/daily-duel-216-launch-readiness-resume-goal-prompt.md` |
| 2026-08-31 | Promo execution prompts (4) | Phase 0-docs → 2 motion | brand sheet, shot list | `docs/promo-execution-prompts.md` |
| 2026-09-01 | Canva mockup sprint kickoff | Mockups A–D | 9 exports, mark ruling | `promo/canva-mockups-kickoff-prompt.md` |
| 2026-09-01 | Ship pass `/goal` (Approvals 1–2) | stage → commit → push → CI → PR → merge | 14a546e | `docs/daily-duel-216-ship-pass-goal-prompt.md` |
| 2026-09-01 | Preview verification `/goal` (Approval 3) | Protected Preview gate + matrix | receipt | `docs/daily-duel-216-preview-verification-goal-prompt.md` |
| 2026-09-01 | Attended lanes scheduling `/goal` | Build the lane pack | superseded: the runway kickoff built the pack on 2026-09-10 | `docs/daily-duel-216-attended-lanes-scheduling-goal-prompt.md` |
| 2026-09-03 | Pre-launch polish kickoff (three batches) | Q-copy / Q-safety / Q-ops | PRs #10–#13 | `docs/prelaunch-polish-kickoff-prompt.md` |
| 2026-09-04 | Production deploy kickoff (Approval 4) | One production deploy of 9a5fdbb + gates + drill + crons PR | receipt | `docs/daily-duel-216-production-deploy-kickoff-prompt.md` |
| 2026-09-06 | Launch status review kickoff | Read-only plain-English review, nine sections | `docs/launch-status-review-2026-09-06.md` | `docs/launch-status-review-kickoff-prompt.md` |
| 2026-09-08 | Process retrospective kickoff | Read-only analysis of how the project was built (throughput, gates, docs, prompts, alternatives) | `docs/process-retrospective-2026-09-08.md` (run 2026-09-08 with seven Opus analysts; Buri's §10 answers added 09-13) | `docs/process-retrospective-kickoff-prompt.md` |
| 2026-09-08 | `/project-handoff` skill + "do the docs-only pass on a branch as a PR, in three parts" | Write `HANDOFF/`, track the local-only docs, stale-docs pass, master-plan v6 | PR #16 | session 20cedd93 (session-only) |
| 2026-09-10 | **Launch-runway kickoff** (S0 baseline · S1 lane pack · S2 owner checklist · S3 Approval 5 branch · S4 status addendum) | Turn the soak week into five gated steps after the 09-08 → 09-10 gap | `docs/attended-lanes/` (8 files); the 09-10 addendum; S3 deferred, then `codex/approval-5` 5edaec3 on 09-13 | `docs/launch-runway-kickoff-prompt.md`; session 88ea269b |
| 2026-09-13 | Rulings session ("Yep, merge PR. Can you explain D3 and D9? …" + the retro answers + "schedule D3 for Tuesday night") | In-session grill on the batched asks | PR #17; `codex/approval-5`; a calendar .ics for Tue 09-15 | session 88ea269b (long-prompts) |

## Reusable templates

### Template 1 — Orchestrator boot (build session)

Use when starting a session that builds under the master plan. Replace the
bracketed values.

```text
You are the orchestrator for Match Cut (~/Projects/Daily Movie Game).
Read docs/master-plan.md FIRST — the only live plan (§6 Ledger = resume sheet,
§2 = constitution, §7 = user-input queue, §8 = protocol). Verify ground truth
before anything: quick gates (PATH=/usr/local/bin:$PATH npm run build ·
verify:solo · verify:chronology · verify:connections) + git status.

Expected state: main CLEAN at [SHA], synced with origin. Gates cold: verify
64/64 · solo 8/8 · chronology 42/42 · connections 14/14. [One paragraph of
what is DONE and approved, with commit ids.] State that up front.

THIS SESSION: [the first unticked Ledger item / the named slice]. [Numbered
items, each with its gate and whether it is objective (auto) or UI (STOP).]

HOUSE RULES (§2): deploys are ALWAYS Buri · rule/scoring/pool-pin changes are
never trivial and always escalate · card faces typographic · localStorage =
meta only · no new deps (React18/Vite/Tailwind4/Framer) · content merges go
through /tmdb-check · one writer on DuelGame.tsx · objective lanes auto
commit+push on green, UI/decision lanes STOP for Buri with side-by-sides at
390×844 + 375×667 vs design_handoff_the_stub/design_handoff_screenshots/ plus
a played game. Sub-agents on Opus with self-contained briefs.

Wind-down on a long session: finish the in-flight lane to its gate,
commit+push, tick the Ledger, update memory, restart fresh.
Preview: .claude/launch.json "marquee" @5173.
```

### Template 2 — Gated execution `/goal` (approval-scoped pass)

Use for any pass that touches the outside world or a release boundary. The
full form is `docs/daily-duel-216-preview-verification-goal-prompt.md`; the
compressed block below is the shape of every September `/goal`.

```text
/goal Execute [the pass name]. Read [docs/<governing-prompt>.md] FIRST and
follow it verbatim; this condition is only its completion gate. Buri's
[DATE] approvals recorded there are in force: [what is APPROVED, e.g. one
Vercel PREVIEW deployment of main@<SHA> + verify:preview-security + the
four-mode matrix + local receipts]. NOT approved: [production deploy, alias
or settings changes, indexing switches, production analytics queries, any
rule/scoring/seed/pool/dealer change, new dependencies, any source edit].
Preconditions (stop read-only if any fail): origin/main = <full SHA> with
green CI; Node 24 via /usr/local/bin PATH prefix; [tool auth]; [jar or Buri
present]. Hard constraints: never git add . / clean / reset / checkout /
stash; preserve all unrelated dirty and untracked work incl. the promo
family; no DuelGame.tsx refactor. Done when ALL hold: [numbered, checkable,
with exact counts]. Stop at the [NAME] checkpoint: report pass/fail per
item, list deviations, and ask separately for the next approval.
```

### Template 3 — Read-only review / status pass

The 2026-09-06 review prompt is the reference. Shape:

```text
/goal Produce [the review]. Read docs/<kickoff>.md FIRST and follow it
verbatim. READ-ONLY session: no source edits, commits, pushes, PRs, deploys,
Vercel mutations, or checklist ticks; do not touch the promo family. Output
= one untracked file docs/<name>.md with the [N] sections the prompt lists
([TL;DR · shipped · launch-critical table with owner+deadline · should-do ·
roadmap · … · decisions Buri owes · calendar]), every claim with a file
pointer, plus a ≤15-line chat summary ending with the single next action.
Done when the file exists with all sections filled and nothing else in the
tree changed.
```

### Template 4 — Sub-agent brief (from master-plan §2.7 and memory)

Self-contained; name the allowed files (forge = 2 new files only); quote the
frozen contract section; no git; no `npm run build` (races on `dist/`); use
`tsc --noEmit` and your own dev server on a unique port (5184+, `--strictPort`,
kill after); report = data for the orchestrator including friction flags;
`model: "opus"`.

## Prompts recovered from sessions only

Most long prompts are already files. Three worth knowing that are not:

- **The competitor research prompt (2026-07-10, session 32b518b6)** — a
  self-contained brief for an external deep-research tool describing the four
  modes and asking for two rings of competitors (direct daily movie games:
  Framed, Cine2Nerdle, Cinematrix, Box Office Game, Actorle…; mechanical
  borrowings: NYT Connections, Timeguessr…) aimed at the front-door and
  share-URL decisions. Reuse when positioning work restarts.
- **Buri's UI-overhaul design guide (2026-07-10, session 9e1e9643, 8k chars)**
  — his personal 2026 design guide; the intake ruling is in master-plan §7·8.
- **The "design lead at a small studio" brief (2026-07-12, session 736dfca4)**
  — a studio-style visual-identity pitch prompt; produced proposals that were
  not built. Superseded by the Stub direction.

Session-only orchestrator boots (2026-07-09/10) are variants of Template 1 and
are quoted in `sessions.md` closing messages; nothing in them is missing from
the master plan.
