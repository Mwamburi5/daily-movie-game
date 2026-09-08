# Match Cut — plain-English launch status review — Kickoff prompt

Written 2026-09-06, the morning after Approval 4. UNTRACKED by design (same
family as the other kickoff prompts). This is a READ-ONLY review session: it
produces one report and changes nothing else.

## Why this session exists

Production has served the launch build (`main@9a5fdbb`) since 2026-09-05T21:25Z.
The first 216-film Daily deals on Sunday 2026-09-27. Between now and then sit
a soak, attended play-tests, one more approval (the "go public" switches), a
72-hour freeze, and a launch campaign that so far exists only as drafts. The
project has ~90 docs and a long memory; nobody has one page that says, in
plain English, what is done, what still has to happen, and what is missing.
Produce that page.

## State on 2026-09-06 (trust these, verify the rest)

- Production = `dpl_HWeNAMnK2eLernz47PCG9RAmgCu6` = `main@9a5fdbb`; rollback
  target = previous `dpl_8SighytERqgygRYvbf1eMyLis6SL`; drill 7 s / 19 s.
- `main` = `d22a2553` (PR #14): nightly prod-smoke + 30-min canary crons LIVE;
  receipt `docs/daily-duel-216-production-deploy-receipt.md`.
- Quiet phase still ON: `noindex, nofollow` in `index.html`, shares URL-free.
  Approval 5 (the switches) is planned ~09-20 and is NOT approved.
- D6 closed (epoch stays 2026-07-04). D1 accepted (Hobby plan: no custom
  analytics events, page views + Web Vitals only).
- Attended lanes A–E (desktop Safari, real iPhone, real Android, VoiceOver,
  TalkBack) have NEVER been run on any build. They may now target production.
- Untracked-by-design family in the tree: `docs/launch-campaign-plan.md`,
  `docs/promo-execution-prompts.md`, `promo/`, and the kickoff prompts. Read
  them; do not commit them.

## Read, in this order

1. Memory index (auto-loaded) → `marquee-next-session-queue` top section.
2. `docs/master-plan.md` — §6 Ledger (what shipped) and §9 (P0–P8 roadmap +
   calendar), §10 amendment log.
3. `docs/daily-duel-216-launch-readiness-checkpoint.md` §12 (approval
   sequence) and §14/§15 (status rows — some are stale).
4. `docs/production-release-checklist.md` and `docs/security-launch-checklist.md`
   — every unchecked box is a candidate for "still needed".
5. `docs/daily-duel-216-deploy-and-indexing-runbook.md` §2.6 (timing, freeze)
   and §3 (the three Approval-5 switches and their held diffs).
6. `docs/daily-duel-216-production-deploy-receipt.md` (esp. "Deviations") and
   `docs/prelaunch-polish-kickoff-prompt.md` receipt ("Follow-ups noticed").
7. `docs/prelaunch-review-2026-09-03.md` §1 (D1–D11 decisions, which are
   still open) and §4 (risks R1–R7).
8. `docs/daily-duel-216-attended-acceptance.md` +
   `docs/daily-duel-216-attended-lanes-scheduling-goal-prompt.md`.
9. `docs/launch-campaign-plan.md`, `docs/promo-execution-prompts.md`,
   `promo/brand-sheet.md`, `promo/shot-list.md`, `promo/phase0-docs-checkpoint.md`,
   `promo/phase1-mockups-checkpoint.md`, memory `marquee-promo-track`.
10. `BACKLOG.md`, `docs/feedback-log.md`, `docs/goal-5-public-launch-acceptance.md`,
    `RULEBOOK.md` (skim), `docs/tmdb-rulings.md` (standing policies + re-audit clock).

Sub-agents, if used, run on Opus with a full brief (Buri's standing rule).
Parallel read-only fan-out is fine; you write the report.

## Produce

One file, `docs/launch-status-review-2026-09-06.md` (LOCAL-ONLY, untracked),
plus a ≤ 15-line chat summary. Plain English throughout — the register of
`RULEBOOK.md`, not of the checkpoints. Every claim carries a file pointer in
parentheses. Sections, in this order:

0. **TL;DR** — ten lines max: where we are, the three things that decide
   whether 09-27 is a good day, and the single next action.
1. **What has shipped** — one paragraph per milestone from June to now (the
   game, the four modes, the sim contract, the 216 cutover, Approval 3, the
   polish batches, Approval 4). Dates and ids, no adjectives.
2. **Launch-critical: must happen before 2026-09-27** — an ordered table:
   item · why it blocks · owner (Buri / agent / both) · deadline · blocked by.
   Include at least: attended lanes A–E on production, the Vercel dashboard
   look, D7 `playmatchcut.com`, Approval 5 (two-file noindex diff +
   URL-in-share + `prod-smoke.mjs` URL-assert flip, one commit, own deploy,
   its own Preview gate), the 72-h freeze from 09-24, the cert auto-renew
   check (notAfter 2026-10-03), and whichever security-checklist boxes are
   genuinely launch-blocking (account MFA, repo rulesets, registrar
   auto-renew) versus merely due-diligence. Say which is which.
3. **Should happen before launch but does not block it** — D11 small-phone
   pass, the HowToPlay "exact date" copy fix, the six long Connections titles,
   the nightly cron's DST drift (04:20 UTC = 23:20 EST), the `npm audit` retry
   wrapper, R1 216-findability instrument. Each with a one-line cost/benefit.
4. **Roadmap after launch** — master-plan §9 P0–P8 as they stand today (which
   are done, which are moot, which remain: card-art pilot P5, tracking P6,
   casual leaderboard P7), the parked deep-cut lever, the interviews at D+14
   that pick the front door, TMDB re-audit 2027-01-05, Connections bake
   horizon 2027-07-05. Triage `BACKLOG.md`: strike what shipped (items 1–3
   at least are live), keep what is real.
5. **Campaign plan status** — what `launch-campaign-plan.md` and the promo
   track already contain (name, objective, audiences, calendar, assets
   approved so far), what they assume without asking, what they still need
   from Buri (evergreen-practice ruling, red-penned brand sheet, shot list
   sign-off, the amber pick), what cannot start until Approval 5, and the
   standing rules (no stills/frames, no spoilers, Buri posts, never an agent).
   End with the campaign's own next gate.
6. **Documentation audit** — three short lists, one line each:
   (a) *missing and needed* — only docs a hand-off engineer, an ops reviewer,
   or a legal/TMDB reviewer would need in the next 60 days (privacy/retention
   text, TMDB commercial-use position, incident/rollback contact sheet,
   registrar/DNS backup are candidates — judge them);
   (b) *stale and misleading* — docs that say something false today
   (checkpoint §14 rows, BACKLOG, release-checklist "Source-control" boxes,
   the receipt's "appended below" line, anything naming `c063f26` as live);
   (c) *fine as is*. Rule: do NOT propose a document for the sake of having
   one; if the information already lives somewhere findable, say where and
   move on.
7. **Decisions Buri owes** — a table: id · question in one sentence · options
   · recommendation · latest date it can wait.
8. **Calendar 09-06 → 10-25** — one line per dated item, including the freeze,
   the premiere, D+14 interviews, D+28 campaign objective check.

## Guardrails

Read-only. No source edits, no commits, no pushes, no PRs, no `vercel`
commands beyond read-only `inspect`/`api` GETs, no production traffic beyond
`curl -sI`. Do not tick a checklist box; if you believe one is satisfied,
say so in §6(b) with the evidence pointer and leave the edit to Buri. Do not
create any document other than the report. Do not touch the promo family.
Nothing is posted anywhere. If a file contradicts memory, the file wins and
you say so.

## Completion gate

The report exists with all nine sections, every row in §2 has an owner and a
deadline, §6 names at most a handful of genuinely missing docs, and the chat
summary ends with the single next action and the two closing questions
Buri's global instructions ask for.

---

Paste-able `/goal` block:

````text
/goal Produce the plain-English launch status review for Match Cut. Read
docs/launch-status-review-kickoff-prompt.md FIRST and follow it verbatim.
READ-ONLY session: no source edits, commits, pushes, PRs, deploys, Vercel
mutations, or checklist ticks; do not touch the promo family. Output = one
untracked file docs/launch-status-review-2026-09-06.md with the nine
sections the prompt lists (TL;DR · shipped · launch-critical table with
owner+deadline · should-do · roadmap incl. BACKLOG triage · campaign plan
status · documentation audit missing/stale/fine · decisions Buri owes ·
calendar 09-06→10-25), every claim with a file pointer, plus a ≤15-line
chat summary ending with the single next action. Done when the file exists
with all nine sections filled and nothing else in the tree changed.
````
