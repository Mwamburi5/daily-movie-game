# Match Cut — launch-runway kickoff prompt (2026-09-10)

> **Executed 2026-09-10, same evening:** S0 baseline green, S1 lane pack and
> S2 owner checklist written under `docs/attended-lanes/`, S4 docs done; **S3
> deferred on D9** (and the Approval 5 diff is three files, not four — no smoke
> asserts a URL-free share). Receipt = the 2026-09-10 addendum in
> `docs/launch-status-review-2026-09-06.md`. Do not re-run this prompt as is.

Written Thursday 2026-09-10, ~22:00 MDT, at Buri's ask ("where are we, recap
the last couple of sessions, get back on track"). Same family as the other
kickoff prompts: UNTRACKED until a docs commit picks it up. Every "today" claim
in §2 came from a read-only check listed there; nothing in the tree, on GitHub,
or on Vercel was changed to write this page.

Context for the two-day gap: on 09-10 a Meld kickoff (a different project) was
pasted into a session sitting in this directory. That work ran entirely in
`~/Projects/Meld` and touched nothing here. Ignore it.

---

## 0. Where we are, in one paragraph

Production has served the launch build `main@9a5fdbb` since 2026-09-05T21:25Z
(`dpl_HWeNAMnK2eLernz47PCG9RAmgCu6`, aliased matchcutdaily.com), bytes proven,
rollback drilled at 7 s back / 19 s forward. The site is quiet on purpose
(`noindex, nofollow`, URL-free shares) until Approval 5. The first 216-film
Daily deals **Sunday 2026-09-27, 17 days out**; the 72-hour freeze starts
09-24. The last three sessions were docs and review only: the status review
(09-06), the handoff + stale-docs PR #16 (09-08, open, CI green), and the
process retrospective (09-08, output untracked). **No code has changed since
PR #14 on 09-05.** The soak week the retro mapped for 09-08 → 09-13 has not
started: no lane pack, no sittings booked, no owner chores attested.

## 1. Recap of the last sessions (newest first)

- **09-10** — a Meld kickoff pasted here by mistake; nothing in this repo
  touched. This prompt written.
- **09-08 — process retrospective RUN** (`docs/process-retrospective-2026-09-08.md`,
  732 lines, untracked; seven Opus sub-agents, reconciled). Verdict:
  "efficient per owner-minute, inefficient per calendar day." Recommends two
  weekly owner slots, prompts capped at five gated steps, ADRs + a CHANGELOG
  line over receipts, dropping as-is UI ratification checkpoints (10 of 18
  changed nothing). Carries a calendar mapping for 09-08 → 09-27 (§9) and
  **12 questions for Buri (§10), unanswered.**
- **09-07/08 — HANDOFF/ + PR #16** (`codex/handoff-and-stale-docs`, three
  docs-only commits: track HANDOFF/ + the seven local-only docs + `promo/`;
  stale-docs pass on ten files; master-plan v6 with the §6 runway row and the
  §8 LAUNCH RUNWAY paragraph). **Open, awaiting Buri's merge; CI green.**
- **09-06 — launch-status review** (`docs/launch-status-review-2026-09-06.md`):
  the dated table in §2 with owners and deadlines; single next action = book
  the lanes (D3) and build the lane pack. Its first deadlines (09-08) have
  now passed.
- **09-04/05 — Approval 4, production.** Clean-clone Preview of `9a5fdbb` →
  `deploy --prod` → `dpl_HWeN…`; served hashes identical to the filtered
  rebuild; security gate, smoke on seed 09-05 and on seed 09-27 (216 pool,
  day 86) PASS on prod bytes; rollback drill; PR #14 → `main d22a255` turned
  on the `prod-smoke` (nightly) and `prod-canary` crons.
- **09-03 — five-agent pre-launch review** (`docs/prelaunch-review-2026-09-03.md`,
  decisions D1–D11) → polish PRs #10 safety, #11 ops, #12 copy merged the
  same day, #13 receipt → `main 9a5fdbb`.
- **09-01 → 09-03 — Approvals 1–3.** Release commit `bdaa3f5` merged (PR #2
  → `14a546e`); protected Preview verified (Toolbar opt-out `0dd6c8d` +
  lockfile audit fix `6b758b0`, PR #9 → `2be26f4`); four-mode Preview matrix
  PASS.

## 2. Verified 2026-09-10 (read-only)

| Check | Result |
|---|---|
| `curl https://matchcutdaily.com/` | 200; `index-DAtVcX_d.js` / `index-CoBkmvh_.css`, unchanged since Approval 4 |
| robots meta | `noindex, nofollow` (quiet phase holds) |
| `prod-smoke` cron | green 09-09 09:01Z and 09-10 09:00Z (nightly, ~4.5 h GitHub delay) |
| `prod-canary` cron | green, last 20 runs; fires every ~2–5 h, not every 30 min |
| TLS certificate (`openssl x509 -dates`) | **RENEWED**: notBefore 2026-09-06, notAfter **2026-12-05** → status-review row 6 (cert check 09-20/09-23) is CLOSED |
| `playmatchcut.com` | still 404 (D7 open) |
| PR #16 | open, both CI runs green; `main` = `d22a255` |
| Dependabot | six PRs open (#4–#8, #15); D10 freeze never formally ruled |
| `docs/attended-lanes/`, `audit/**/attended/` | do not exist (lane pack never built) |
| Local tree | `codex/handoff-and-stale-docs` = origin; untracked: `docs/process-retrospective-2026-09-08.md` and this file |

## 3. Dates (17 days to the premiere)

- **MISSED:** lane pack (09-08) · Vercel dashboard look (09-08).
- **AT RISK:** sittings by Sun 09-13 (three days out, nobody booked) · D11
  375×667 layout pass had a start-by of ~09-12 → recommend SKIP.
- **09-19:** MFA on Vercel, GitHub, Name.com + a `main` ruleset (before
  Approval 5).
- **Sat/Sun 09-19/20:** Approval 5 (own commit, own Preview, own deploy);
  absolute last day 09-23, never within ~2 h of local midnight.
- **09-20:** D7 `playmatchcut.com` redirect (DNS/alias; must be outside the
  freeze; export DNS first).
- **09-24 00:00 local → 09-27:** freeze. No deploys, DNS, or settings.
- **Sun 09-27:** premiere watch (runbook §2.7). **09-29:** Show HN, no
  deploys. **10-04:** first readout. **10-11 → 10-18:** interviews pick the
  front door.

## 4. The prompt (paste into a fresh session)

Shape follows the retro's template (§9): at most five gated steps,
preconditions, approved / not approved, locked rulings, exact done-when, a
named stop.

```text
/goal Soak week 1 for the 2026-09-27 premiere: build the attended-lanes pack, put the owner-only chores in front of Buri as one checklist, prepare Approval 5 as one reviewable branch, and bring the dated status table current. Single deliverable: docs/attended-lanes/ + a dated addendum to docs/launch-status-review-2026-09-06.md + branch codex/approval-5 (NOT merged, NOT deployed).
Read docs/master-plan.md §2 and §8 FIRST; CLAUDE.md holds the house rules. Current state: docs/launch-status-review-2026-09-06.md §2 (its 09-08 deadlines are past) and HANDOFF/09-open-work.md. This kickoff: docs/launch-runway-kickoff-prompt.md (§2 is the table to re-run).
Preconditions, stop read-only and report if any fail:
  · origin/main = d22a25530745700dd7fe32f8db1f2065faadcffd, CI green; production serves index-DAtVcX_d.js with the noindex meta; prod-smoke + prod-canary green in `gh run list`
  · local tree on codex/handoff-and-stale-docs, clean except docs/process-retrospective-2026-09-08.md (untracked, keep) and docs/launch-runway-kickoff-prompt.md
  · quick gates green: npm run build · npm run verify 64/64 · verify:solo 8/8 · verify:chronology 42/42 · verify:connections 14/14
  · Buri reachable for one slot this week (the lane bookings need a human)
  Anything unexplained: stop. Do not paper over it inside this pass.
State I am asserting is authoring-time (2026-09-10): verify, do not assume.
APPROVED this pass: new files under docs/attended-lanes/; a dated addendum section appended to docs/launch-status-review-2026-09-06.md; a new branch codex/approval-5 from origin/main carrying the held Approval-5 diff (runbook §3: the noindex meta at index.html:14 AND its pin in tests/browser/delivery-smoke.spec.ts:76, the URL line in src/lib/share.ts:7, the URL-free assertion flip in scripts/prod-smoke.mjs) as ONE commit, pushed for CI only; docs-only commits on codex/handoff-and-stale-docs (track the retro output and this kickoff).
NOT approved: deploy · alias/DNS/Vercel settings · merging PR #16 or codex/approval-5 · indexing · rule/scoring/seed/pool · deps (the six Dependabot PRs stay untouched) · any other source edit · minting the Vercel bypass jar (Buri runs scratchpad/mint.sh himself if a Preview is needed; the agent never reads the CLI token).
Locked, do not relitigate: D6 DAILY_EPOCH = 2026-07-04 (Buri, 09-04) · gates are sequenced and Approval 5 is its own commit + Preview + deploy (09-01) · rollback target = the PREVIOUS deployment, dpl_8SighytERqgygRYvbf1eMyLis6SL (09-05) · D1 Hobby analytics accepted, no code change (09-03) · sub-agents run on Opus (09-02) · deploys are Buri's button and pushes never deploy (no git integration).
Work sequence, checkpoint after EACH step, max 5 steps:
  S0 Baseline: the preconditions above plus the read-only table in the kickoff §2, re-run; list any drift (the cert already renewed to 2026-12-05 on 09-06, so the status review's row 6 closes here).
  S1 Lane pack: execute docs/daily-duel-216-attended-lanes-scheduling-goal-prompt.md deliverables 1–5 against PRODUCTION (D3 already recommends prod, and no jar is needed there): run-sheets A–E under docs/attended-lanes/, outreach drafts, the hardware list, and a booking grid with candidate dates 09-12 → 09-19. Real iPhone, real Android and TalkBack have never been run on any build; desktop Safari and VoiceOver ran once on the older 08-19 candidate and are not carried forward.
  S2 Owner chores, one page (docs/attended-lanes/owner-checklist.md): MFA on Vercel, GitHub and Name.com; the `main` ruleset (PR required, no force-push, required checks); the Vercel dashboard look (page views + Web Vitals arriving; custom events absent by design on Hobby); DNS export then the D7 playmatchcut.com redirect; the Dependabot snooze. Exact click paths, tick boxes, and the security-checklist rows each one closes. Buri attests; the agent never touches a dashboard.
  S3 Approval 5 branch, ONLY after D9 is ruled (the date, and whether `practice ·` shares also carry the URL). One commit on codex/approval-5, CI green, the diff pasted into the checkpoint. The HowToPlay Chronology "exact date" copy fix and the `npm audit` retry wrapper go in SEPARATE commits on a separate branch, never folded in. If D9 is unruled at this point, record S3 as deferred and continue.
  S4 Docs: a dated addendum to the status review (rows closed: cert; rows missed and re-dated: lane pack, dashboard look; the new booking dates), a docs-only commit on codex/handoff-and-stale-docs that tracks docs/process-retrospective-2026-09-08.md and this kickoff, and one line in the master-plan §6 runway row. Then stop.
  If this pass needs more than 5 gated steps, split it into two prompts.
Guardrails: never git add . / clean / reset / checkout / stash / amend / force-push; preserve all unrelated dirty and untracked work (the promo family, the receipts); one writer on DuelGame.tsx (untouched this pass); no new deps; no rule/scoring change folded into this. (House rules: CLAUDE.md.)
Done when ALL hold (exact numbers): build green · verify 64/64 · verify:solo 8/8 · verify:chronology 42/42 · verify:connections 14/14 · docs/attended-lanes/ holds run-sheets A, B, C, D, E + outreach drafts + owner-checklist.md · the status-review addendum is dated · codex/approval-5 is CI green with exactly the four-file diff (or S3 is recorded as deferred on D9) · production unchanged (index-DAtVcX_d.js served, noindex present) · prod-smoke + prod-canary still green.
Stop at the SOAK-WEEK-1 checkpoint: pass/fail per item, LIST DEVIATIONS, then ask separately, as one batch: PR #16 merge · D3 bookings (people, hardware, dates) · D9 · D11 skip · D10 Dependabot snooze · and, if Buri has time, the retro's 12 questions (§10).
Do not include: inline house-rule restatements · inline SHAs and gate counts as a boot preamble beyond the preconditions above · Stop-hook "verbatim" enforcement (this pass contains human steps).
```

## 5. Open asks for Buri (batched; none block S0–S2)

1. **Merge PR #16?** Docs-only, CI green. Until it merges a clone of `main`
   lacks `HANDOFF/` and the launch-window docs.
2. **D3:** who runs lanes A–E, on which hardware, on which days between 09-12
   and 09-19?
3. **D9:** Approval 5 on Sat 09-19 or Sun 09-20, and do `practice ·` shares
   carry the URL?
4. **D11:** skip the 375×667 pass? (Recommended; its start-by date was 09-12.)
5. **D4:** do the four menu practice rows stay for launch? (Never ruled; gates
   six of nine promo shots.)
6. **D10:** snooze the six Dependabot PRs until the 10-04 readout?
7. **Vercel plan:** stay on Hobby through 09-27 (recommended), revisit 10-04.
8. **TMDB:** one line in the release checklist that Match Cut is
   non-commercial at launch (no ads, no payments), so attribution alone
   satisfies the free tier.
9. **The retro's 12 questions** (`docs/process-retrospective-2026-09-08.md`
   §10): answer whenever; they shape the post-launch cadence, not the runway.

## 6. What "back on track" means this week

The retro's own calendar (§9, week 1): lane pack + sittings booked + MFA and
ruleset + dashboard look + Dependabot ignore + the docs-only retention pass,
about four agent-hours and one owner-hour across two slots. Two of those days
are gone. The one thing that cannot slip is the lane sittings, because a
defect found there needs a fix **and a deploy** before the 09-24 freeze, and
the last comfortable deploy window is 09-20.
