# 09 — Open work

**Last verified:** 2026-09-07 at d22a255. Primary source:
`docs/launch-status-review-2026-09-06.md` (yesterday's read-only review),
cross-checked against the receipts, the prelaunch review, and memory.

## In progress (the launch runway, 2026-09-08 → 09-27)

| # | Item | Owner | Deadline | State |
|---|---|---|---|---|
| 1 | **Attended lanes A–E on production** (desktop Safari, real iPhone, real Android, VoiceOver, TalkBack). Real iPhone/Android/TalkBack have never been run on any build | Buri books people + hardware; an agent builds the pack (`docs/daily-duel-216-attended-lanes-scheduling-goal-prompt.md`, none of its deliverables exist) | pack 09-08 · sittings by 09-13 · hard stop 09-20 | **not started** |
| 2 | Vercel dashboard look (page views + Web Vitals arriving; custom events absent by design on Hobby) | Buri | 09-08 | open |
| 3 | D7 `playmatchcut.com` is a bare 404 → attach as redirect to the apex (export DNS first) | Buri | 09-20 | open |
| 4 | **Account MFA** on Vercel, GitHub, Name.com + tick the security checklist boxes | Buri | 09-19 | open, launch-blocking |
| 5 | Repository ruleset on `main` (PR required, no force-push, required checks) — none exists today | Buri | 09-19 | open, five minutes |
| 6 | **Approval 5** — one commit: remove `noindex` (`index.html:14` + pin in `tests/browser/delivery-smoke.spec.ts:76`), add the URL line in `src/lib/share.ts:7`, flip the URL-free assertion in `scripts/prod-smoke.mjs`; own Preview gate, own deploy; then update both rollback ids and re-drill | agent prepares, Buri approves and says deploy | Sat/Sun 09-19/20, last day 09-23 | held diffs in runbook §3 |
| 7 | TLS cert auto-renew check (notAfter 2026-10-03) | agent checks, Buri fixes if red | 09-20 and 09-23 | open |
| 8 | 72-hour **freeze** (no deploys/DNS/settings) | Buri | 09-24 → 09-27 | rule |
| 9 | Premiere-day watch (first-hour list runbook §2.7, one real-phone play per mode, abort criteria) | Buri | Sun 09-27; again 09-29 (Show HN) | — |

Should-do before launch, non-blocking (status review §3): D11 small-phone
375×667 layout pass (skip unless started by ~09-12) · HowToPlay Chronology
"exact date" copy fix (one line) · six long Connections titles break mid-word ·
`npm audit` retry wrapper in CI · R1 findability instrument in `verify:solo`
(Q-o7) · privacy-disclosure wording ("journey events" records none on Hobby) ·
snooze the five Dependabot PRs (#4–#8) plus the new #15.

## Backlog

`BACKLOG.md` (5 items): 1–3 are shipped and should be struck; 4 (Duel keyboard
hint overlay) keep post-launch; 5 (`say()` tone audit) keep, report-only.

Post-launch tracks from `docs/master-plan.md` §9 and the campaign plan:

- **P5 card-art pilot** (18–24 posterless cards, provenance manifest) — parked.
- **P6 tracking** — journey dictionary exists and is verified but records nothing
  on Hobby; revisit the plan decision at the 10-04 readout.
- **P7 casual leaderboard** — needs a server, outside the locked stack; own grill.
- **Front door** — decided from D+14 interviews (2026-10-11 → 10-18), leaning
  Chronology; a small `App.tsx` + menu-emphasis change, own approval.
- **Movie-pool growth** — paused until the launch gate is green. Chronology 482
  dated / 320 credited; Stage B mini-slate for the 1970s never ran.
- **D1 Duel deep-cut reveal as a difficulty lever** — parked (needs deepCast
  content pass + flip face + re-tune).
- **Difficulty-as-personas** — post-SEND, gated on feedback; effectively moot.
- **Connections diversity floor (actor ≤2)** and bundle intern — queued for the
  next pool LOCK re-bake.
- **Campaign**: Phase 0-captures (Playwright rig, 9 shots) → Phase 1 Canva proper
  (brand kit, amber pick) → Phase 2 motion; Show HN 09-29, Reddit 09-30, Product
  Hunt optional 10-01; readouts from 10-04; objective 250 daily uniques by 10-25.
- Dated: TMDB re-audit due 2027-01-05; Connections bake horizon 2027-07-05;
  domains expire 2027-07-05; `security.txt` expires 2027-09-01; DST cron drift
  from 2026-11-01; two forward-dated 2026 Chronology films deal 10-16 and 10-20.

## Known bugs and tech debt

- **R1 216 findability (biggest, unmeasured):** on 26 of the first 35 Daily
  Puzzle days every winning line needs a credit the card faces never show;
  day two (09-28) has an invisible-only opener. Designed mechanic, but an
  "unfair vs hard" retention risk no gate measures (`docs/prelaunch-review-2026-09-03.md` §4).
- **Race-to-20 timing divergence:** sim checks the target after the full turn;
  React ends the instant a score crosses. Flagged 2026-07-17, deliberately
  unchanged (the tune was measured on sim timing).
- `src/DuelGame.tsx` 2,445 lines / ~41 `useState`; a `lowerTimer` cleanup noted
  in the polish receipt ("mention, don't fix").
- `docs/ui-contracts.md` line pins are stale (extracted at 1,989 lines).
- GitHub schedule throttling: the "30-minute" canary runs every ~4–5 h; the
  nightly smoke fired 4 h late. Coverage, not failure.
- Vercel Hobby: custom events do not record; journey analytics is inert; spend
  alerts do not exist on Hobby.
- The 7b lay-off picker component is forged but unwired (no such flow).
- Six long Connections titles break mid-word at any font divisor.
- HowToPlay Chronology sheet says same-year order is "decided by exact date"
  (false on the four tied days a year; first is 2026-10-29).
- Three stale agent worktrees under `.claude/worktrees/` and stale local
  branches (`claude/eloquent-taussig-63abbf`, `worktree-agent-*`, the merged
  `codex/*` branches); harmless, cleanable.
- `BACKLOG.md` items 1–3 not struck; `README.md` status line slightly stale.

## Doc conflicts and unclear status

Found during this handoff (most also listed in the status review §6b):

- **Plan of record vs reality.** `docs/master-plan.md` is the only live plan by
  rule but stops at v5 (2026-08-31); it does not know about Approvals 1–4, the
  polish PRs, or the crons. Resolution used here: master-plan = constitution and
  roadmap; `docs/launch-status-review-2026-09-06.md` = current state. A "v6"
  amendment is owed (review Q-o6).
- `AGENTS.md` says "never push directly to main"; the July protocol pushed
  waves straight to main. Since August all work is PR-based, so treat AGENTS.md
  as current.
- `docs/daily-duel-216-launch-readiness-checkpoint.md` §14/§15, the runbook's
  line 12, the release checklist's source-control boxes, the deploy receipt's
  "appended below" line, `docs/daily-duel-216-attended-acceptance.md` header,
  `docs/goal-5-public-launch-acceptance.md` rollback id, `docs/feedback-log.md`
  header dates, `RULEBOOK.md` header date — all read as older than they are.
  None changes a decision.
- Memory says lanes "have NEVER been run on any build"; the Goal 5 doc shows
  desktop Safari and VoiceOver were run once on the 08-19 candidate. The
  acceptance doc refuses to carry those forward, so both statements are true
  in their own frame.
- Memory `marquee-promo-track` says `social-preview.png` is a 404 on production;
  it has been a 200 since Approval 4.
- `docs/card-redesign-proposal.html` — unclear provenance; not referenced by
  any live plan.
- `design-qa.md` at the repo root is gitignored but present locally; it
  duplicates the polish design-QA verdict.
- The `.agents` and `.claude` copies of the tmdb-check skill differ in commit
  date (08-07 vs 07-06) but are byte-identical (diffed 2026-09-07).
- **Six local-only files are untracked** and would be lost in a fresh clone:
  `docs/daily-duel-216-production-deploy-kickoff-prompt.md`,
  `docs/launch-campaign-plan.md`, `docs/launch-status-review-2026-09-06.md`,
  `docs/launch-status-review-kickoff-prompt.md`, `docs/promo-execution-prompts.md`,
  `promo/`. Buri has deliberately kept the promo family and kickoffs untracked
  ("LOCAL-ONLY by design"); a docs-only commit was offered and not taken.
  This `HANDOFF/` folder is also untracked until Buri commits it.

## Questions for the owner

1. Do you want the six untracked docs (and this `HANDOFF/` folder) committed,
   so a fresh clone carries the current state?
2. D3: who runs the five attended lanes, on which hardware, on which days?
3. D4: do the four menu practice rows stay for launch? (Never formally ruled;
   it also gates six of nine promo shots.)
4. D9: Approval 5 on 09-19 or 09-20, and do `practice ·` shares also carry the URL?
5. D11: run the 375×667 layout pass before launch (must start by ~09-12) or skip?
6. Vercel plan: stay on Hobby through 09-27 (recommended) and revisit at 10-04?
7. TMDB position: is Match Cut non-commercial at launch (no ads, no payments),
   so attribution alone satisfies the free tier? One line in the release checklist.
8. Promo: red-pen the brand sheet (Q1–Q5), sign the shot list, pick the amber
   (`#CF952A` vs `#DDA321`), choose two social platforms, Product Hunt in or out.
9. Should `docs/master-plan.md` get its v6 amendment now, or is the status review
   the plan's successor for the launch window?
10. Will you fix `playmatchcut.com` (D7) and attest MFA/rulesets yourself, or
    do you want a checklist session that walks you through the dashboards?

## Recommended next three steps

1. **Build the attended-lanes pack and book the sittings this week** (status
   review's single next action). Run the scheduling goal prompt read-only; Buri
   picks people and hardware. The lanes are the only launch gate no automation
   can close, and a defect found there needs a fix and a deploy before 09-24.
2. **Do the five-minute account chores before Approval 5:** MFA on all three
   accounts, a `main` ruleset, the Vercel dashboard look, DNS export, then D7.
3. **Prepare Approval 5 as one reviewable commit with its own Preview gate**,
   paired with the one-line HowToPlay copy fix and the `npm audit` retry, and
   append a premiere watch card to the runbook (rollback commands with the
   `whoami` step, first-hour checks, abort criteria, who is watching 09-27 and
   09-29). Then write master-plan v6 so the plan of record catches up.
