# 09 — Open work

**Last verified:** 2026-09-13 on `codex/handoff-refresh-2026-09-13` (from main 8100e29). Primary sources:
`docs/launch-status-review-2026-09-06.md` with its **2026-09-10 and 2026-09-13
addenda**, `docs/attended-lanes/schedule.md` and `owner-checklist.md`, the
retro's §10 answers, and memory. No source file has changed since d22a255;
production still serves `main@9a5fdbb`.

## In progress (the launch runway, 2026-09-14 → 09-27)

| # | Item | Owner | Deadline | State |
|---|---|---|---|---|
| 1 | **Attended lanes A–E on production** (desktop Safari, real iPhone, real Android, VoiceOver, TalkBack; real iPhone/Android/TalkBack have never been run on any build). Run-sheets `docs/attended-lanes/lane-A.md` … `lane-E.md`; results go into `docs/daily-duel-216-attended-acceptance.md` rows 4–8, evidence under the gitignored `audit/…/attended/` | **Buri runs all three sittings himself** | **Tue 09-15 evening** · backstop Wed 09-16 · hard stop Sat 09-19 | booked 2026-09-13 (D3); a calendar `.ics` for 7–9 pm Mountain was handed over |
| 2 | **Owner checklist**: MFA on Vercel / GitHub / Name.com, a `main` ruleset (PR required, no force-push, the six CI job names as required checks), the Vercel dashboard look, DNS export then the D7 `playmatchcut.com` redirect, Dependabot snooze (D10) | Buri | same evening · MFA + ruleset by 09-19 (**launch-blocking**) · Dependabot by 09-18 · D7 by 09-20 | open; `docs/attended-lanes/owner-checklist.md` |
| 3 | Fix branch if a lane finds a defect | agent builds + PR; Buri reviews, Preview-gates, deploys | budget two calendar days per defect; must land by 09-19 or share the 09-20 → 09-23 retry window with Approval 5 | contingent on row 1 |
| 4 | **Approval 5** — `codex/approval-5` = **5edaec3** (one commit off 8e1e3bd, four files: `index.html` robots meta removed · `src/lib/share.ts` fourth line `matchcutdaily.com` on every share, practice included · `tests/browser/delivery-smoke.spec.ts` pins the meta's absence and URL-terminated shares · `scripts/prod-smoke.mjs` share verdict requires the URL). CI green 2026-09-13. Sequence: Buri mints the jar at the start of the slot → Preview from a clean clone of the branch → `verify:preview-security` + both smokes → Buri says deploy → update both rollback ids in the runbook and memory → re-drill → receipt (receipts stay for Approvals) → submit the sitemap the same day | agent prepares and gates; Buri approves and deploys | **Sat 09-19** · retry 09-20 · absolute last 09-23 | ready for its Preview gate; **not merged, not deployed** |
| 5 | 72-hour **freeze** (no deploys, DNS, or Vercel settings) | Buri | 09-24 00:00 local → 09-27 | rule |
| 6 | Premiere-day watch (runbook §2.7 first-hour list, one real-phone play per mode, abort criteria); again Tue 09-29 for Show HN | Buri | Sun 09-27 · Tue 09-29 | the one-page watch card is **not yet appended** to the runbook |
| 7 | Refresh this handoff in update mode once Approval 5 is in production | agent | after 09-19 | planned (this run is the pre-Approval-5 refresh) |

Closed since the 09-08 handoff: the TLS certificate (renewed 09-06, notAfter
2026-12-05) · the lane pack and owner checklist (built 09-10) · rulings D9,
D10, D11 and Speed Insights (09-13) · PR #16 and PR #17 merged (09-13) · the
Approval 5 commit built and CI-green (09-13).

**Should-do before launch, non-blocking:** HowToPlay Chronology "exact date"
copy (one line) · six long Connections titles break mid-word · an `npm audit`
retry wrapper in CI (it flaked once on a registry 503) · the R1 findability
instrument in `verify:solo` (Q-o7) · privacy-disclosure wording ("journey
events" records none on Hobby). **Struck:** the D11 small-phone pass (ruled
skip) and the Web Vitals dashboard check (no Speed Insights script exists).

**Post-launch, each its own approval:** Speed Insights (code + CSP change) ·
the retro §9 artifacts not yet adopted (`CHANGELOG.md`, ADRs for rulings, a
PR template, the `dependabot.yml` ignore block, trimming the master plan to
constitution + roadmap, and choosing the private tracker).

## Backlog

`BACKLOG.md`: items 1–3 struck as shipped; 4 (Duel keyboard hint overlay) keep
post-launch; 5 (`say()` tone audit) keep, report-only.

Post-launch tracks from `docs/master-plan.md` §9, the campaign plan, and the
retro answers:

- **P5 card-art pilot** (18–24 posterless cards, provenance manifest) — parked,
  but **elevated**: on 2026-09-13 Buri named per-movie illustrations as the
  thing he most wants back. Needs its own grill first; typographic faces stay
  the rule until then.
- **"The UI felt slow"** (retro Q2) — unmeasured; Speed Insights is the first
  post-launch instrument, then decide.
- **P6 tracking** — journey dictionary exists and is verified but records
  nothing on Hobby; revisit at the 10-04 readout.
- **P7 casual leaderboard** — needs a server, outside the locked stack; own grill.
- **Front door** — decided from D+14 interviews (2026-10-11 → 10-18), leaning
  Chronology; a small `App.tsx` + menu-emphasis change, own approval.
- **Movie-pool growth** — paused until the launch gate is green. Chronology 482
  dated / 320 credited; the Stage B 1970s mini-slate never ran.
- **D1 Duel deep-cut reveal as a difficulty lever** — parked.
- **Connections diversity floor (actor ≤2)** and the bundle intern — queued for
  the next pool LOCK re-bake.
- **Campaign** (`docs/launch-campaign-plan.md`): Phase 0-captures is still the
  next gate and still waits on the red-penned brand sheet, shot-list sign-off,
  and the amber pick. The week-0 items (reserve `@matchcutdaily` handles, draft
  HN / Reddit / premiere / circle copy, verify Search Console) have no owner
  hours booked. Show HN 09-29, Reddit 09-30, Product Hunt optional 10-01;
  readouts from 10-04; objective 250 daily uniques by 10-25.
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
- **Only `@vercel/analytics` is wired.** There is no Speed Insights script, so
  no Web Vitals arrive; four docs said otherwise until 09-10.
- `src/DuelGame.tsx` 2,445 lines / ~41 `useState`; a `lowerTimer` cleanup noted
  in the polish receipt ("mention, don't fix").
- `docs/ui-contracts.md` line pins are stale (extracted at 1,989 lines).
- GitHub schedule throttling: the "30-minute" canary runs every ~2–5 h; the
  nightly smoke has fired hours late. Coverage, not failure.
- Vercel Hobby: custom events do not record; journey analytics is inert; spend
  alerts do not exist on Hobby.
- The 7b lay-off picker component is forged but unwired (no such flow).
- Six long Connections titles break mid-word at any font divisor.
- HowToPlay Chronology sheet says same-year order is "decided by exact date"
  (false on the four tied days a year; first is 2026-10-29).
- Six open Dependabot PRs (#4–#8, #15) awaiting the D10 snooze.
- Stale local branches and three agent worktrees under `.claude/worktrees/`
  (plus the merged `codex/handoff-and-stale-docs` and `codex/rulings-2026-09-13`);
  harmless, cleanable.
- Memory `marquee-promo-track` still says `social-preview.png` is a 404 on
  production; it has been a 200 since Approval 4 (memory file, not the repo).

## Doc conflicts and unclear status

- **Three-document split, working as designed:** master-plan = constitution
  and roadmap · `docs/launch-status-review-2026-09-06.md` = current state,
  kept current by dated addenda appended in place (09-10, 09-13) · `HANDOFF/` =
  newcomer entry. The status review's original §2 table is stale on purpose;
  the addenda override it row by row.
- A clone of `main` now carries every document this folder cites (PR #16
  merged 2026-09-13); only the `audit/` evidence folders are gitignored.
- `AGENTS.md` says "never push directly to main"; the July protocol pushed
  waves straight to main. Since August all work is PR-based; treat AGENTS.md
  as current.
- Memory says the lanes "have NEVER been run on any build"; the Goal 5 doc
  shows desktop Safari and VoiceOver were run once on the 08-19 candidate. The
  acceptance record refuses to carry those forward, so both are true in their
  own frame.
- `docs/card-redesign-proposal.html` — unclear provenance; not referenced by
  any live plan.
- `design-qa.md` at the repo root is gitignored but present locally; it
  duplicates the polish design-QA verdict.
- The `.agents` and `.claude` copies of the tmdb-check skill differ in commit
  date (08-07 vs 07-06) but are byte-identical (diffed 2026-09-07).
- The dated records left as history on purpose (prelaunch review §0, deploy
  kickoff line 27 "prod is c063f26", the Goal 5 body, the launch-readiness
  checkpoint rows) all carry banners pointing forward.

## Questions for the owner

1. **D4:** do the four menu practice rows stay for launch? D9 implies yes
   (practice shares now carry the URL) but it was never ruled as such, and it
   gates six of nine promo shots.
2. **Vercel plan:** stay on Hobby through 09-27 (recommended) and revisit at
   the 10-04 readout?
3. **TMDB position:** is Match Cut non-commercial at launch (no ads, no
   payments), so attribution alone satisfies the free tier? One line in the
   release checklist.
4. **Promo:** red-pen the brand sheet (Q1–Q5), sign the shot list, pick the
   amber (`#CF952A` vs `#DDA321`), choose two social platforms, Product Hunt
   in or out. And when do the week-0 campaign items get owner hours?
5. **Which private tracker** (retro Q9)? Until chosen, open items live here and
   in the status-review addenda.
6. **Premiere watch:** who watches on 09-27 and 09-29, and should the watch
   card be appended to the runbook before the freeze?
7. **Retro Q3 / Q5 / Q11** are still unanswered (value of screenshot
   checkpoints, the July freeze, owner-minutes vs calendar days). They only
   shape the post-launch cadence.
8. **Status review:** keep appending dated addenda in place (the de facto
   practice) or start a fresh dated review after Approval 5?

## Recommended next three steps

1. **Tue 09-15:** run the three sittings from the lane sheets and work the
   owner checklist the same evening. Record results in the acceptance record
   rows 4–8 (an agent can transcribe from notes and screenshots). A defect gets
   a fix branch on Wed 09-16.
2. **Sat 09-19 slot:** mint the jar first, Preview-gate `codex/approval-5` from
   a clean clone, deploy, update both rollback ids, re-drill, write the receipt,
   submit the sitemap.
3. **Before the freeze:** append the premiere watch card to the runbook and
   refresh this handoff (update mode) so it includes Approval 5; spend the
   remaining owner hours on promo Phase 0-captures and the launch copy.
