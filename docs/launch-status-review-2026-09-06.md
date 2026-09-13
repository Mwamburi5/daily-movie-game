# Match Cut — plain-English launch status review (2026-09-06)

Written Sunday 2026-09-06, the morning after Approval 4, from
`docs/launch-status-review-kickoff-prompt.md`. LOCAL-ONLY and untracked, like
the other kickoff prompts. Read-only session: nothing in the tree, on GitHub,
or on Vercel was changed to make this page. Every claim points at the file (or
the read-only check) it came from. Where a file disagreed with memory, the
file won and the disagreement is called out.

Three live checks were run today (read-only): `curl -sI` against
matchcutdaily.com and playmatchcut.com, the TLS certificate dates, the
registrar's public whois, and `gh run list` / `gh api` for the watchers and the
repository rulesets. Everything else is from the documents.

---

## 0. TL;DR

1. **The launch build is live.** Production has served `main@9a5fdbb`
   (`dpl_HWeNAMnK2eLernz47PCG9RAmgCu6`) since 2026-09-05T21:25Z, bytes and
   provenance proven, rollback drilled at 7 s back / 19 s forward
   (`docs/daily-duel-216-production-deploy-receipt.md` §P2–§P5). Today's
   `curl` still shows the same asset (`index-DAtVcX_d.js`) and the quiet-phase
   `noindex` tag (live check).
2. **The site is still private on purpose.** Search engines are told to stay
   out and shares carry no URL until Approval 5, planned for ~09-19/20
   (`docs/daily-duel-216-deploy-and-indexing-runbook.md` §3; `index.html:14`;
   `src/lib/share.ts:7`).
3. **The first 216-film Daily deals on Sunday 2026-09-27**, 21 days from today;
   the 72-hour freeze starts 09-24 (runbook §2.6). The cutover deal has
   already been played once on production bytes and passed (receipt §P4.2).
4. **Three things decide whether 09-27 is a good day:** (a) the five attended
   lanes — real iPhone, real Android, TalkBack have *never* been run on any
   build (`docs/daily-duel-216-attended-acceptance.md`); (b) Approval 5 landing
   by 09-20 so the share loop and the OG card work before the premiere
   (`docs/launch-campaign-plan.md` §9 risk 1); (c) the first-week content
   experience, where 26 of 35 first-month Daily Puzzles need a credit the card
   faces never show and nobody has measured how that feels
   (`docs/prelaunch-review-2026-09-03.md` §4 R1).
5. **Monitoring is on but thinner than the docs imply.** The nightly smoke and
   the "every 30 minutes" canary are both green, but GitHub is running the
   canary roughly every four to five hours and fired last night's smoke four
   hours late (live `gh run list`; see §3).
6. **Single next action:** Buri books the attended-lane sittings this week (D3)
   and an agent builds the lane pack the scheduling prompt describes — the
   run-sheets do not exist yet (`docs/daily-duel-216-attended-lanes-scheduling-goal-prompt.md`
   deliverables 1–5; `ls docs/attended-lanes` → no such directory).

---

## 1. What has shipped (June → today)

**The game and the Duel sim contract (June 2026).** Duel vs Computer and the
solo hand game were built first; the simulator became the rules contract on
2026-06-17 (`sim/RULESET.md` is the canonical text; `npm run verify` 64/64 is
the gate named in `CLAUDE.md`). The Flow Update shipped 2026-06-22 (Double
Feature, Draw 3 Keep 1, show ends at 20) and the Funpass Update on 2026-06-30
(meld ladder, genre melds, wild cards, take-to-meld) — both listed in
`RULEBOOK.md` "What's new" and locked in `sim/RULESET.md` §9 and §11.

**Four modes (June–July).** Chronology became playable 2026-06-30 and the
Daily Puzzle became a real date-seeded daily on 2026-07-03 (`RULEBOOK.md`
"What's new"). The repository as it exists today starts at commit `266390c` on
2026-07-03 (`git log --reverse`). Connections shipped 2026-07-07 as commits
`ff512a2` (engine) and `34931f1` (UI), with its dealer lock and standing
`verify:connections` gate from 2026-07-06 (`151a9f5`; `sim/RULESET.md` §13).
The game was renamed Match Cut on 2026-07-04 (`src/lib/share.ts` comment).

**The Stub UI and the public URL (July).** `docs/master-plan.md` became the only
live plan on 2026-07-06 (§10 v1–v2). Waves W1–W5 re-dressed every mode in the
ticket-stub design; W6 "SEND" put the game at matchcutdaily.com on 2026-07-10
with `noindex` and URL-less shares held (`0e1e403`; master-plan §10 v3). Circle
feedback was logged 2026-07-16 (`docs/feedback-log.md`, 27 entries). Stage B
grew the Chronology pool to 438 films and was deployed 2026-07-12
(`dpl_2YrXPFMDWjZujapDznvoNH65jBYZ`, commit `c87ac3c`).

**Polish, delivery, security (August).** The §9 polish-and-scale plan was
written 2026-08-07 (master-plan §10 v4). Wave 3 took the dated pool to 482
films and deployed 2026-08-08 (`a710fff`; master-plan §6). Delivery
foundations (code split, budgets, CI) and the P2–P4 mode waves were approved
locally through 2026-08-24 (master-plan §6 ledger rows). Goal 4 security
hardening (CSP, pinned actions, `check:security`) was Preview-verified
2026-08-18 (`docs/security-launch-checklist.md`), and the pre-cutover
production build `c063f26` went live the same evening as
`dpl_8SighytERqgygRYvbf1eMyLis6SL` (`docs/goal-5-public-launch-acceptance.md`
"Read-only production baseline").

**The 216 + 16 cutover (late August).** Buri approved the 216-film Daily/Duel
pool and the 16 Hall-of-Fame wilds on 2026-08-26 with 2026-09-27 as the first
expanded Daily; difficulty was retuned to 65.9/50.3/41.4 over 8,000 games per
tier (master-plan §6 "CONTENT CUTOVER" rows; `RULEBOOK.md` header). The
launch-readiness pass closed locally on 2026-08-31 with every gate green and
five attended lanes honestly `ATTENDED NOT RUN`
(`docs/daily-duel-216-launch-readiness-checkpoint.md` §1, §9).

**Approvals 1–3 (2026-09-01 → 09-03).** The release commit `bdaa3f5` merged to
`main` as `14a546e` via PR #2 on 2026-09-01 (`docs/daily-duel-216-ship-receipt.md`).
Approval 3 verified a protected Preview of that SHA
(`dpl_FTnTRXPKr4V1Hyz8Fu68AfPymr75`): the security gate needed a one-line
Toolbar opt-out (`0dd6c8d`) and a lockfile-only audit fix (`6b758b0`), merged
as PR #9 → `2be26f4`; the four-mode Preview matrix passed
(`docs/daily-duel-216-preview-verification-receipt.md`;
`docs/production-release-checklist.md` "Local release gates").

**The polish batches (2026-09-03).** After a five-agent review
(`docs/prelaunch-review-2026-09-03.md`), three batches merged the same day:
Q-safety PR #10 (error boundary, chunk-reload, CI verify steps, menu budget
104 KiB), Q-ops PR #11 (rewritten runbook, `scripts/prod-smoke.mjs`, immutable
asset cache, `security.txt`, evidence commit), Q-copy PR #12 (eleven copy and
accessibility fixes) → `main@b08d8db`, then PR #13 → `9a5fdbb`
(`docs/prelaunch-polish-kickoff-prompt.md` "Receipt").

**Approval 4 (2026-09-04/05).** Clean-clone Preview of `9a5fdbb`
(`dpl_3XYcXVGb3gpnZCmygW1yo7HtqMMb`) → gates green → `deploy --prod` at
21:25:10Z → `dpl_HWeNAMnK2eLernz47PCG9RAmgCu6` aliased to matchcutdaily.com;
served bytes hash-identical to the filtered rebuild; security gate, both
production smokes (seed 09-05 and seed 09-27), static surfaces, and the
rollback drill all green; PR #14 → `main@d22a2553` turned on the nightly
prod-smoke and 30-minute canary crons (`docs/daily-duel-216-production-deploy-receipt.md`;
`.github/workflows/prod-smoke.yml`, `prod-canary.yml`). First scheduled runs
of both are green (live `gh run list`: 34022673652, 34034882862).

---

## 2. Launch-critical: must happen before 2026-09-27

Ordered by how much runway each one burns. "Both" means Buri decides or
attends and an agent prepares. Deadlines assume the freeze starts 09-24
(`docs/daily-duel-216-deploy-and-indexing-runbook.md` §2.6).

| # | Item | Why it blocks | Owner | Deadline | Blocked by |
|---|---|---|---|---|---|
| 1 | **Attended lanes A–E on production** — desktop Safari, real iPhone, real Android, VoiceOver, TalkBack (`docs/daily-duel-216-attended-acceptance.md` scripts A–E). Note: the file wins over memory here — desktop Safari and VoiceOver *were* run once on the older `c063f26`-era candidate (`docs/goal-5-public-launch-acceptance.md` attended table), but the acceptance doc explicitly refuses to carry those forward; iPhone, Android and TalkBack have never been run on any build | The only launch gate no automation can close; a defect found here needs a fix *and a deploy* before the freeze | **Both** — Buri picks people and hardware, an agent builds the pack | Pack by **09-08**; sittings by **09-13**; hard stop **09-20** (last deploy window before the freeze) | D3 booking (Buri); the lane pack (`docs/attended-lanes/` does not exist, `audit/…/attended/` does not exist) |
| 2 | **The Vercel dashboard look** — page views and Web Vitals arriving; journey events absent by design on Hobby (runbook §1 D1; receipt §P4.5) | Two release-checklist rows and the checkpoint's "monitoring" row stay open until a human has looked (`docs/production-release-checklist.md` "Operational launch gate") | **Buri** | **09-08** (five minutes) | nothing |
| 3 | **D7 `playmatchcut.com`** — still a bare 404 today (live `curl`), same for `www` | The campaign plan lists the redirect as an owned-channel asset (`docs/launch-campaign-plan.md` §4); any printed or spoken URL that lands on a 404 is a lost player | **Buri** (dashboard, own approval) | **09-20** — it is a DNS/alias change and must be outside the freeze | Export the current DNS records first (`docs/security-launch-checklist.md` "Domain registrar and DNS") |
| 4 | **Account MFA** on Vercel, GitHub and Name.com (`docs/security-launch-checklist.md` account sections; registrar = Name.com per whois) | **Launch-blocking.** Once the site is public, the account is the site; every other control assumes it. Cheap, attended, unrecorded | **Buri** | **09-19**, before Approval 5 | nothing |
| 5 | **Approval 5 — the go-public switches**, one commit, its own Preview gate, its own deploy: remove the `noindex` meta (`index.html:14`) **and** its pin in `tests/browser/delivery-smoke.spec.ts:76`; add the URL line in `src/lib/share.ts:7`; flip the URL-free assertion in `scripts/prod-smoke.mjs` in the same commit (`docs/prelaunch-polish-kickoff-prompt.md` follow-up 4). Then update both rollback ids (runbook §2.5, release checklist) and re-drill | Without it the share grid has no link and Google has no page — the campaign's whole loop (`docs/launch-campaign-plan.md` §9 risk 1) | **Both** — agent prepares and deploys on Buri's word; Buri approves the three boxes in `docs/production-release-checklist.md` "Public-launch switches" | **Sat/Sun 09-19/20**; absolute last day **09-23** (never within ~2 h of local midnight) | Lanes clean (row 1); D9 ruling on whether `practice ·` shares also get the URL (runbook §3b); MFA (row 4) |
| 6 | **Cert auto-renew check** — the live certificate still says notAfter 2026-10-03 (live `openssl`; receipt §P0). Vercel renews automatically, but the renewal will land inside or just after the freeze | If renewal fails, the fix is a settings action inside the freeze, and expiry is six days after the premiere | **Both** — agent runs the `openssl` one-liner, Buri fixes if red | Check **09-20** and again **09-23**; if still unrenewed on 09-23, decide before the freeze | nothing |
| 7 | **72-hour freeze** — no deploys, no DNS, no Vercel settings from **09-24** through the premiere (runbook §2.6; receipt "Still NOT approved") | A deploy across the cutover mixes a rollover with a cutover | **Buri** (the rule) | 09-24 00:00 local → 09-27 | rows 3, 5 done |
| 8 | **Premiere-day watch** — the first-hour list in runbook §2.7, one real-phone play of each mode, and the abort criteria in the release checklist "Rollback trigger examples"; the nightly smoke fires around 00:20 EDT *plus GitHub's delay* (§3) | Nobody else is watching; rollback is 7 s (receipt §P5) | **Buri** | Sun **09-27**, morning local; repeat on **09-29** (Show HN day, no deploys) | nothing |

**Security checklist boxes: which are launch-blocking and which are
due diligence.** All three account sections in
`docs/security-launch-checklist.md` are still unticked.

- *Launch-blocking:* MFA on all three accounts (row 4). Nothing else in the
  checklist stops a hijacked account from re-pointing the domain.
- *Due diligence, do before Approval 5 because it is five minutes:* repository
  rulesets on `main` — today there are **none** (`gh api …/rulesets` → `[]`;
  branch protection → "Branch not protected"). A solo repo survives without
  them, but the checklist promises them and Dependabot's five open PRs
  (`gh pr list`) are exactly the kind of thing a ruleset keeps off `main`.
- *Due diligence, not urgent:* registrar auto-renew and expiry alerts — both
  domains expire **2027-07-05** and transfer lock is already on (whois), so
  this cannot hurt 09-27; DNSSEC and CAA stay explicitly "attended, separate,
  with rollback" (checklist); spend alerts do not exist on Hobby (runbook §1);
  the GitHub Actions token/permissions review is already per-workflow
  (`prod-smoke.yml` and `prod-canary.yml` declare `contents: read`, `issues: write`).

---

## 3. Should happen before launch but does not block it

Each with a one-line cost / benefit.

- **D11 small-phone layout pass (375×667).** Four items at that size fail the
  same direction (Solo pile card under the header, hint overprinted, empty
  Chronology stage, Duel fan hiding titles) and amber-on-cream text sits at
  2.2:1 (`docs/prelaunch-review-2026-09-03.md` §3). Cost: a UI wave with
  side-by-sides and a deploy, so it must ship *before* the freeze, in practice
  alongside Approval 5. Benefit: the smallest iPhones see the year and the
  hint. If it is not started by ~09-12, skip it for launch (review D11).
- **HowToPlay "exact date" copy.** The Chronology help sheet still says
  same-year order is "decided by exact date" — the falsehood c4 fixed in the
  banner and RULEBOOK (`src/components/HowToPlay.tsx:108`;
  `docs/prelaunch-polish-kickoff-prompt.md` follow-up 1). Cost: one line, ride
  the Approval 5 deploy as its own commit. Benefit: the help sheet stops lying
  on the four tied days a year, the first of which is 2026-10-29.
- **Six long Connections titles** (GHOSTBUSTERS, INTERSTELLAR, NIGHTCRAWLER,
  PHILADELPHIA, BLACKKKLANSMAN, EDGE OF TOMORROW) still break mid-word at any
  divisor (polish receipt follow-up 2). Cost: a floor/cap or `measureText`
  fit — a design call and half a day. Benefit: rare (six of 315 titles);
  post-launch is fine.
- **The nightly cron's DST drift.** `04:20 UTC` is 00:20 EDT now and 23:20 the
  previous evening once EST returns; the workflow comment already says so and
  pins `TZ=America/New_York` (`.github/workflows/prod-smoke.yml`). Clocks change
  **2026-11-01**, outside this review's window, so nothing to do before
  launch. Cost of the eventual fix: change one cron line. Benefit: the smoke
  plays the *new* day, not the old one, from November.
- **GitHub schedule throttling (new finding).** The canary is declared every
  30 minutes but actually ran at 00:07, 04:57, 09:14 and 13:02 UTC today; the
  nightly smoke scheduled for 04:20 ran at 08:43 (live `gh run list`). Both
  are green, so this is coverage, not failure. Cost: accept, or add an
  external pinger (a new service — Buri's call under the locked stack,
  `CLAUDE.md`). Benefit: honest expectations — today R3 "no monitoring"
  (`docs/prelaunch-review-2026-09-03.md` §4) is really "monitoring every
  four hours".
- **`npm audit` retry wrapper.** CI has no retry on the audit step
  (`.github/workflows/ci.yml:39-40`); it flaked on registry 503s twice on
  09-03 and once on the deploy SHA (receipt deviation 2). Cost: ten minutes.
  Benefit: the Approval 5 commit does not go red for a reason that is not ours.
- **R1 216-findability instrument (Q-o7).** A non-blocking readout in
  `sim/solo-verify.ts` of "face-readable winning lines per day"
  (`docs/prelaunch-review-2026-09-03.md` §2 Q-o7, §4 R1). Cost: one to two
  hours, no rule change. Benefit: you know *before* 09-28 whether day two's
  invisible-only opener is a fairness story, and any response becomes a
  W5-class decision with numbers instead of a hunch.
- **Privacy disclosure wording.** The in-app text says analytics records "a
  small set of journey events"; on Hobby it records none (runbook §1;
  `src/components/HowToPlay.tsx:374`). Harmless direction today; becomes an
  under-statement the day the plan is upgraded. Fix in the same pass as any
  plan change.
- **Dependabot snooze (D10).** Five PRs open since 09-01 including `vite 6→8`
  and `plugin-react 4→6` (`gh pr list`). Cost: close or snooze. Benefit: no
  accidental merge of a build-tool major inside the launch window.

---

## 4. Roadmap after launch

**Master-plan §9 P0–P8 as they stand today** (`docs/master-plan.md` §9; ledger
§6):

| Phase | State |
|---|---|
| P0 direction, P1 delivery foundation | Done — code split, budgets, CI, monitoring hooks (§6 "delivery foundations" row; `docs/delivery-foundations-report.md`) |
| P2 shared visual system, P3 mode waves | Done — Phases 1–3 approved, release candidate 2026-08-09, onboarding 08-18/08-24 (§6 polish rows) |
| P4 personas | Effectively absorbed: the three difficulty tiers and Taz's booth are the presentation layer; no separate persona wave shipped and none is queued. Treat as moot unless interviews ask for it |
| P5 card-art pilot | **Remains.** Typographic faces were ruled for this build (§10 v2); the pilot spec (18–24 posterless cards, provenance manifest) is intact in §9 P5. Post-launch |
| P6 tracking | **Partly built, inert.** The nine-event journey dictionary exists and is verified (`src/lib/journeyAnalytics.ts`; `verify:analytics`) but records nothing on Hobby (runbook §1 D1). Remains, gated on a plan decision (§7) |
| P7 casual leaderboard | **Remains**, post-launch; needs a server, which is outside the locked stack — its own grill before any build (§9 P7; `CLAUDE.md` deps rule) |
| P8 launch gate | Mostly executed as Approvals 1–4; the residue is §2 of this page (lanes, Approval 5, account boxes, TMDB position) |

**Parked and dated items.**

- Duel deep-cut reveal as a difficulty lever — parked since 2026-07-06, not a
  launch blocker (master-plan §6 last row).
- **Interviews at D+14 (2026-10-11)** pick the front door; Chronology is the
  lean (runbook §3c; `docs/launch-campaign-plan.md` §5 weeks 4–5). The
  front-door change is a small `src/App.tsx` edit plus menu emphasis, its own
  approval.
- **TMDB re-audit due 2027-01-05** — six months from the first audits
  (`docs/tmdb-rulings.md`; `docs/prelaunch-review-2026-09-03.md` Q-o8).
- **Connections bake horizon 2027-07-05** — extend the 365-grid bake before
  any published daily pins past it (review Q-o8).
- Two forward-dated 2026 Chronology films (Super Mario Galaxy 04-01,
  Spider-Man: Brand New Day 07-31) deal on 10-16 and 10-20 — re-confirm the
  dates before then (review Q-o8).
- Both domains expire 2027-07-05 (whois); `security.txt` expires 2027-09-01
  (`public/.well-known/security.txt`).
- Movie-pool growth stays paused until the launch gate is green (§9 P8 last
  line); Chronology's "pool still growing" note in `RULEBOOK.md` refers to that
  same pause.

**`BACKLOG.md` triage** (five items; striking is an edit and is Buri's):

| # | Item | Verdict |
|---|---|---|
| 1 | "How to Play" modal | **Shipped** — mode-specific How to Play plus a four-screen first-run welcome (`src/components/HowToPlay.tsx`, `src/components/Onboarding.tsx`; master-plan §6 08-24 row). Strike |
| 2 | Persist personal bests to localStorage | **Shipped** under the `matchcut:v1` key with a sanitizer, not the `mc.personalBest.<mode>` key the item proposes (`src/lib/progress.ts`; checkpoint §7). Strike |
| 3 | Share-result button | **Shipped** — family share format with clipboard and a manual fallback (`src/lib/share.ts`, `src/components/ShareCopy.tsx`). Strike |
| 4 | Keyboard-shortcut hint in Duel | **Keep, post-launch.** Keyboard play exists and is documented (`RULEBOOK.md` "Playing by keyboard"), but no first-play overlay exists; it costs menu/Duel bytes against a 104 KiB budget |
| 5 | `say()` tone audit | **Keep** — report-only, cheap, no bytes |

Real items that live only in receipts and should join the backlog: the five
polish follow-ups (`docs/prelaunch-polish-kickoff-prompt.md` "Follow-ups
noticed", including the `lowerTimer` cleanup in `src/DuelGame.tsx` that
`CLAUDE.md` says to mention, not fix), the Q-o7 instrument, the cron throttling
question, and a `mint-jar.mjs` `whoami` refresh (memory
`marquee-next-session-queue`, 09-03 entry).

---

## 5. Campaign plan status

**What already exists.** `docs/launch-campaign-plan.md` (2026-09-05) names
the campaign "Tonight's Program", sets one SMART objective (a 7-day average of
250 daily unique visitors by D+28 = 2026-10-25 with 40 % direct), four
secondary objectives, three audiences plus a maker segment, four key
messages, a channel table (share grid, the site, two social profiles, the
circle, Show HN Tue 09-29, Reddit 09-30, roundups and newsletters in week 4,
Product Hunt optional 10-01, no paid media), a six-week calendar 09-07 → 10-25,
twelve must-have assets, KPIs with floor/target/stretch, and a risk table
(§1–§9). The promo track supplies the brand sheet (`promo/brand-sheet.md`), a
nine-shot list (`promo/shot-list.md`), and Canva mockups in which Buri ruled
the incumbent ticket-stub mark the winner and approved B (carousel), C (share
showcase) and D (device frames) as v2 directions
(`promo/phase1-mockups-checkpoint.md` "Buri's review ruling").

**What it assumes without asking.** Its own inputs table says goal, audience,
timeline, budget, geography and front door were assumed, not asked
(`docs/launch-campaign-plan.md` "Inputs"). Beyond that table it also assumes:
Buri has three to five hours a week for it; two social handles will be
reserved and run; a Search Console property gets verified; the circle will
post their 09-27 grids on request; Product Hunt is worth a listing; and a
Sunday readout habit from 10-04. Its week-0 line "Approval 4 (latest safe
09-13)" is already satisfied (receipt §P2), so the "premiere slips" branch of
risk 1 is closed.

**What it still needs from Buri.**

- The evergreen-practice ruling (D4) — the question was never written down;
  six of nine shots source from practice rows, and the plan keeps practice
  rows visible in captures by default (`docs/prelaunch-review-2026-09-03.md`
  D4; `promo/phase0-docs-checkpoint.md` Q2; `src/App.tsx:204`).
- A red-penned brand sheet (Q1–Q5 in `promo/phase0-docs-checkpoint.md`) and a
  shot-list sign-off — both gate Phase 0-captures
  (`docs/promo-execution-prompts.md` Prompt 2 precondition).
- The amber pick (#CF952A game vs #DDA321 marketing), deferred to Phase 1
  proper; it orders the Canva brand-kit palette
  (`promo/phase1-mockups-checkpoint.md` "Next" item 1).
- Which two social platforms, the handle reservations, Product Hunt in or out,
  Pro-plan re-open yes/no, and the TMDB commercial-use position
  (`docs/launch-campaign-plan.md` §10 items 3 and 5).

**What cannot start until Approval 5.** Anything that puts the URL in front
of a stranger: the circle text, Show HN, Reddit, Product Hunt, roundup and
newsletter pitches, the share-showcase asset with a real URL, sitemap and
Search Console submission (`docs/launch-campaign-plan.md` §5 dependency chain,
§9 risk 1; runbook §3). What *can* start now: captures (after the red pen),
instantiating B/C/D with real captures, storyboards and pool-agnostic clips,
the press kit, copy drafts an agent writes and Buri posts, the UTM link set,
and reserving handles (plan §5 weeks 0–1).

**Standing rules** (`docs/promo-execution-prompts.md` §0; plan "Standing
constraints"): no posters, stills, frames or key art anywhere; TMDB
attribution wherever TMDB data shows; never today's or an upcoming deal in an
asset; `noindex` and URL-less shares hold until Approval 5; Buri posts —
never an agent; look-and-feel is Buri's gate, never self-approved.

**One stale fact inside the promo family.** The mockup checkpoint and the
promo memory say `social-preview.png` is a 404 on production and must be
drag-dropped by hand (`promo/phase1-mockups-checkpoint.md` Q4; memory
`marquee-promo-track`). It has been a 200 since Approval 4 (receipt §P4.3;
live `curl` today), so Prompt 3's URL upload now works.

**The campaign's own next gate: Phase 0-captures** (Prompt 2), which needs
the red-penned brand sheet, the shot-list sign-off and the D4 ruling
(`promo/phase1-mockups-checkpoint.md` "Next" item 3).

---

## 6. Documentation audit

Rule applied: no document for its own sake; if the information already lives
somewhere findable, say where.

**(a) Missing and needed in the next 60 days** — three items.

1. **The attended-lanes pack** — five one-page run-sheets, a schedule grid,
   outreach drafts, and the evidence scaffold. The goal prompt that specifies
   it is tracked and has been for a week, but none of its deliverables exist
   (`docs/daily-duel-216-attended-lanes-scheduling-goal-prompt.md`;
   `docs/attended-lanes/` absent). A hand-off tester cannot close a lane
   without it.
2. **A one-page premiere watch card** — the two rollback/promote commands with
   the `whoami` step, the first-hour checks, the abort criteria, where the
   cron failures land (GitHub issues from `prod-smoke.yml` / `prod-canary.yml`
   — confirm Buri gets those notifications), and who is watching on 09-27 and
   09-29. All the facts exist but across runbook §2.5, §2.7, the release
   checklist's rollback triggers, and two workflow files. Best done as a short
   section appended to the runbook, not a new file.
3. **The campaign log** — the append-only Sunday readout file the campaign
   plan promises from 10-04 (`docs/launch-campaign-plan.md` §7 "Reporting").
   Create it the first Sunday; nothing to write before then.

Judged and *not* needed as new documents: privacy/retention text (published
in-app, `src/components/HowToPlay.tsx:366-385`, verbatim in checkpoint §5; the
"published" release-checklist box can be ticked with that pointer); the TMDB
commercial-use position (the rule is already written — free with attribution
while non-commercial, contact sales before monetizing — in `docs/master-plan.md`
§9 P8 and the release checklist; what is missing is a one-line *decision*, see
§7); an incident/rollback contact sheet beyond item 2 (there is no team;
`security.txt` already gives the public route); a registrar/DNS backup
document (the security checklist deliberately routes that to Buri's vault,
not the repo — take the DNS export before D7).

**(b) Stale and misleading today** — things a reader would believe that are
false.

- `docs/daily-duel-216-launch-readiness-checkpoint.md` §14 and §15: every
  publication row reads `NOT RUN` / `NOT AUTHORIZED` and "live prod remains
  `c063f26`"; Approvals 1–4 have all executed. Needs a dated banner pointing at
  the ship receipt, the Preview receipt and the deploy receipt.
- `docs/daily-duel-216-deploy-and-indexing-runbook.md` line 12: "Production
  still serves `c063f26`; nothing in this document has been executed" — §2
  has been executed in full and §2.1/§2.5 already carry the new ids. One
  sentence to fix.
- `docs/production-release-checklist.md` "Source-control and CI gates": all
  seven boxes unticked, yet PR #2 (`14a546e`), #9–#14 and green exact-SHA runs
  (33501320800, 33699865177, 33829755130, 33826836354) satisfy each one. Also
  its "Local release gates" `test:smoke` count reads 24/24 (it is 39/39 since
  #10, polish receipt) and "Confirm `vercel.json`…" stays honestly open for
  the account checks.
- `docs/production-release-checklist.md` "Operational launch gate": "error
  monitoring receives a deliberate test event and the alert route is
  exercised" is arguably met by the two `goal4_security_preview` events plus
  the crons' issue-on-failure path (receipt §P4.1, workflows); "`mode_start`…
  verified as received" is moot on Hobby (runbook §1) and should be re-worded,
  not ticked; "privacy/retention language published" is met in-app (see (a)).
  Leave the ticks to Buri.
- `docs/daily-duel-216-production-deploy-receipt.md` §P6: "run `prod-smoke.yml`
  once by hand (result appended below)" — nothing was appended. The manual
  runs 33994763911 and 33994765483 were green (live `gh run list`; memory).
- `docs/master-plan.md`: last committed 2026-09-01 (`bdaa3f5`); §10 stops at
  v5 (2026-08-31) and §6's last content rows end at "uncommitted, unpushed,
  undeployed". The "only live plan" (`CLAUDE.md`) does not know about
  Approvals 1–4, the polish batches or the crons. A v6 amendment is the
  stale-docs pass the review asked for (`docs/prelaunch-review-2026-09-03.md`
  Q-o6).
- `docs/daily-duel-216-attended-acceptance.md` header still pins the 08-31
  dirty-tree candidate (`ce39837`); lanes should record production `9a5fdbb`
  (the scheduling prompt's ground rule 1 asked for `14a546e`, itself now
  superseded).
- `BACKLOG.md` items 1–3 are live features (§4 above).
- `docs/goal-5-public-launch-acceptance.md`: "Final result: pending" and a
  rollback target of `dpl_7Mk27…` (two deployments back). It is a dated
  record of the 08-19 candidate; it only misleads if read as current — a
  one-line "superseded by …" banner is enough.
- `docs/feedback-log.md` header: "interviews ~2026-07-24" and "Vercel
  Analytics data (share + outcome events)" — interviews are now D+14 =
  2026-10-11 and there are no custom events on Hobby.
- `RULEBOOK.md` header says last updated 2026-08-27; it was edited 2026-09-03
  by the copy batch (`git log -- RULEBOOK.md` → `d27b682`).
- `docs/daily-duel-216-production-deploy-kickoff-prompt.md` line 27 and
  `docs/prelaunch-review-2026-09-03.md` §0 also say prod is `c063f26`; both
  are dated kickoff/brief documents and read as history — no fix needed, but
  they are the ones a grep for "still serves" will surface.
- Memory (not a repo file, noted for Buri): `marquee-promo-track` says the OG
  image is a 404 on prod (now 200); `marquee-next-session-queue` says lanes
  "have NEVER been run on any build" — true for iPhone/Android/TalkBack,
  not for desktop Safari/VoiceOver on the earlier candidate.

**(c) Fine as is.**

- `docs/daily-duel-216-production-deploy-receipt.md` (apart from the one
  "appended below" line), `docs/daily-duel-216-preview-verification-receipt.md`,
  `docs/daily-duel-216-ship-receipt.md` — dated receipts whose "prod remains
  `c063f26`" lines were true when written and read as such.
- `docs/daily-duel-216-deploy-and-indexing-runbook.md` §2.1–§2.8 and §3 —
  executable, ids current, Approval 5 diffs held (only line 12 and the §3
  two-file/prod-smoke notes from the polish receipt's follow-up 4 are behind).
- `docs/security-launch-checklist.md` — the account sections are honestly
  unticked and the header-change notes are current.
- `docs/prelaunch-review-2026-09-03.md` §1 D1–D11 and §4 R1–R7 — still the
  best short list of open decisions and risks; this page leans on it.
- `RULEBOOK.md` content, `sim/RULESET.md`, `docs/tmdb-rulings.md` (standing
  policies and the re-audit clock), `CLAUDE.md`, `public/.well-known/security.txt`.
- The promo family (`docs/promo-execution-prompts.md`, `promo/*`) — current
  except the OG-image note above; untouched by this review as instructed.
- `docs/launch-campaign-plan.md` — current except its week-0 deploy line.

---

## 7. Decisions Buri owes

| id | Question in one sentence | Options | Recommendation | Latest date it can wait |
|---|---|---|---|---|
| D3 | Who runs the five attended lanes on production, on which hardware, on which days? | Three paired sittings (A+D Mac, C+E Android, B iPhone) this week vs ad hoc | Book three sittings for 09-09–09-13 with a 09-19/20 backstop; have the pack built first (`docs/prelaunch-review-2026-09-03.md` D3) | **09-08** to book; sittings done by 09-20 |
| D4 | Do the four menu practice rows stay for launch? | keep / remove | Keep — removal is a menu change against ~3.5 KiB of remaining menu budget (100.50 of 104 KiB, polish receipt) and re-cuts six of nine promo shots (review D4; `promo/phase0-docs-checkpoint.md` Q2) | **09-08** — captures wait on it |
| D7 | Attach `playmatchcut.com` to the project as a redirect to the apex? | attach now / leave 404 | Attach, after exporting the DNS records (security checklist) | **09-20** (outside the freeze) |
| D9 | Approval 5 date, and do `practice ·` shares also carry the URL? | 09-19 vs 09-20; URL on all shares vs dailies only | 09-19 (Saturday, daylight, leaves 09-20 as the retry day); URL on every share — a practice grid in a group chat is still an ad (runbook §3b) | **09-18** for the ruling; deploy by 09-23 |
| D11 | Run the 375×667 layout pass before launch? | yes, as a UI wave with side-by-sides / skip to post-launch | Skip unless an agent can start by 09-12 and ship it with the Approval 5 deploy (review §3, D11) | **09-12** |
| D10 | Snooze the five Dependabot PRs until after launch? | snooze / merge security-only / merge all | Snooze; security lockfile bumps only (review D10) | **09-18** |
| MFA | Self-attest MFA on Vercel, GitHub, Name.com and tick the three boxes? | do it / accept the risk | Do it (`docs/security-launch-checklist.md`) | **09-19** |
| Rules | Add a `main` ruleset (PR required, no force-push, required checks)? | yes / no | Yes, five minutes; none exists today (`gh api`) | **09-19** |
| TMDB | Is Match Cut non-commercial at launch (no ads, no payments), so attribution alone satisfies TMDB's terms? | non-commercial / seek commercial terms now | Rule "non-commercial at launch" and write the one line into the release checklist's TMDB box (`docs/master-plan.md` §9 P8; `docs/launch-campaign-plan.md` §9 last row) | **09-26** (before the premiere post) |
| Plan | Re-open D1 and move to Vercel Pro so mode and outcome events record? | stay Hobby / Pro $20 / Pro + Plus $30 | Stay Hobby through 09-27; revisit at the 10-04 readout with real traffic (runbook §1; campaign §8). Fix the disclosure wording in the same pass | **10-04** |
| Promo-1 | Red-pen the brand sheet (Q1–Q5) and sign the shot list? | approve / edit | Approve with edits in the file margins; unblocks captures | **09-08** |
| Promo-2 | Which amber leads the Canva kit? | #CF952A game / #DDA321 marketing | #DDA321 — every existing marketing surface (OG card, spines) already uses it (`promo/brand-sheet.md` §1) | Day one of Phase 1 proper (~09-14) |
| Promo-3 | Which two social platforms, and reserve @matchcutdaily where? | TikTok or IG Reels; Bluesky or Threads | Reserve everywhere now (free); decide the two later (campaign §4) | **09-13** to reserve; **09-20** to decide |
| Promo-4 | Product Hunt in or out on 10-01? | in / out | Out unless HN lands ≥50 points on 09-29 (campaign §4, optional row) | **09-30** |
| Go | Confirm the premiere on 09-27 (or hold the switches and let the legacy pool keep dealing)? | go / slip | Go if rows 1–5 of §2 are green by 09-23; slipping breaks nothing (review §0 "not a cliff") | **09-23**, before the freeze |
| Door | Which mode is the public front door? | Chronology / Connections / menu stays | Decide from the D+14 interviews; lean Chronology (runbook §3c) | **10-18** |

---

## 8. Calendar 09-06 → 10-25

One line per dated item. Dates are America/New_York unless marked.

- **Sun 09-06** — this review; production `9a5fdbb` live day 2; first
  scheduled prod-smoke and canary runs green (`gh run list`).
- **Mon 09-07** — campaign week 0 starts (`docs/launch-campaign-plan.md` §5).
- **Tue 09-08** — target: D3 sittings booked; lane pack built; Buri's dashboard
  look; D4 ruling; brand-sheet red pen (§2 rows 1–2; §7).
- **Wed 09-09 → Sun 09-13** — attended lanes A–E on production, first window
  (§2 row 1); reserve social handles (§7 Promo-3).
- **Sat 09-12** — go/no-go on the D11 small-phone pass (§7 D11).
- **Mon 09-14** — campaign week 1: Phase 1 Canva proper starts (amber pick
  day one); Phase 2 storyboards and pool-agnostic clips (campaign §5).
- **Fri 09-18** — D9 and D10 rulings; last ordinary weekday before the switches.
- **Sat 09-19** — MFA and ruleset done; **Approval 5** target: one commit,
  Preview gate, `--prod` deploy, rollback ids updated, re-drill (§2 rows 4–5).
- **Sun 09-20** — Approval 5 retry day; **D7** `playmatchcut.com` attached
  (DNS export first); **cert check #1** (§2 rows 3, 6); lanes backstop.
- **Mon 09-21** — campaign week 2: carousel slides begin, one a day
  (campaign §5); share loop now live.
- **Wed 09-23** — absolute last deploy day; **cert check #2**; premiere go/no-go
  (§7 Go).
- **Thu 09-24 00:00** — **72-hour freeze begins**: no deploys, DNS or Vercel
  settings changes (runbook §2.6).
- **Fri 09-25** — the long-title Connections board deals (acceptance surface 7)
  — a real-device check of that grid is worth a look.
- **Sat 09-26** — last legacy-pool Daily (day 85); premiere post drafted; TMDB
  position written down (§7 TMDB).
- **Sun 09-27** — **PREMIERE: first 216-film Daily, day 86**; the cutover
  rolls around the globe over ~26 h by local date (review R6); nightly smoke
  ~00:20 EDT plus GitHub delay; Buri's first-hour watch; circle text with the
  grid ask (campaign §5 week 2).
- **Mon 09-28** — day two: the "invisible-only opener" day (review R1) —
  watch the feedback log and the support issues.
- **Tue 09-29 09:00 ET** — **Show HN** + maker comment; six hours on comments;
  **no deploys** (campaign §4).
- **Wed 09-30** — r/WebGames + r/Letterboxd posts (campaign §5 week 3).
- **Thu 10-01** — Product Hunt, only if ruled in (§7 Promo-4); posts for 10-01
  and 10-04 are R1 "invisible opener" days too.
- **Sat 10-03 02:34 GMT** — current certificate's notAfter; must have renewed
  by then (§2 row 6).
- **Sun 10-04** — **readout 1** (visitors, referrers); Plan decision revisited
  (§7 Plan); campaign log created (§6a item 3); target "home + rulebook
  indexed" (campaign §1).
- **Mon 10-05 → Wed 10-07** — roundup/directory and newsletter/podcast pitches
  (campaign §5 week 4).
- **Sun 10-11** — **D+14: interviews begin** (six-plus players); readout 2.
- **Fri 10-16 · Tue 10-20** — the two forward-dated 2026 Chronology films deal;
  dates re-confirmed beforehand (review Q-o8).
- **Sun 10-18** — interviews close; **front-door ruling** (§7 Door); readout 3.
- **Mon 10-19 → Sat 10-24** — front-door change ships if ruled (own approval);
  sustain cadence set (campaign §5 week 6).
- **Sun 10-25** — **D+28: campaign objective check** — 7-day average ≥250 daily
  uniques, ≥40 % direct; readout 4 and retro (campaign §1, §7).
- *(Outside the window, for the record: 11-01 DST ends → cron drift; 2027-01-05
  TMDB re-audit; 2027-07-05 domains expire and Connections bake ends;
  2027-09-01 `security.txt` expires.)*

---

## Addendum 2026-09-10 (Thursday, ~23:00 MDT) — the dated table, re-run

Appended by the soak-week-1 pass (`docs/launch-runway-kickoff-prompt.md` §4,
steps S0–S4). Same rules as the review: read-only live checks, every claim
points at its source. The §2 table above is left as written on 09-06; this
section is what changed since, and what was wrong.

### Live checks re-run (read-only, 2026-09-10 22:00–23:00 MDT)

| check | 09-06 | 09-10 |
|---|---|---|
| production | `main@9a5fdbb`, `index-DAtVcX_d.js`, `noindex` | unchanged: 200, `index-DAtVcX_d.js` / `index-CoBkmvh_.css`, `noindex, nofollow` |
| `origin/main` | `d22a255` | `d22a255`; PR #16 open, both CI runs green, mergeable |
| prod-smoke / prod-canary | green | green — smoke 09-09 09:01Z and 09-10 09:00Z; canary last 20 runs green, firing every ~2–5 h |
| TLS certificate | notAfter 2026-10-03 | **renewed 09-06** — notBefore 2026-09-06 22:53Z, notAfter **2026-12-05** |
| `playmatchcut.com` | 404 | 404 (resolves to Vercel, not attached to the project); `www` the same |
| rulesets on `main` | none | none; secret scanning, push protection and Dependabot security updates all **disabled**; Actions token read-only |
| Dependabot | 5 PRs | 6 PRs (#15 `actions/upload-artifact` added 09-07) |
| `docs/attended-lanes/` | absent | **present** (built this pass) |
| quick gates | — | build green · verify 64/64 · verify:solo 8/8 · verify:chronology 42/42 · verify:connections 14/14 |

### §2 rows — closed, missed, re-dated, corrected

- **Row 6 cert — CLOSED.** Vercel renewed it automatically on 09-06; expiry
  is now 2026-12-05. The 09-20 / 09-23 cert checks and the §8 "10-03
  notAfter" line are dropped.
- **Row 1 lane pack (due 09-08) — MISSED, then DONE 09-10.** Five run-sheets,
  the booking grid with outreach drafts, the hardware list, and the gitignored
  evidence scaffold now exist under `docs/attended-lanes/`; the acceptance
  doc's rows 4–8 point at the sheets and stay **ATTENDED NOT RUN**.
  **Sittings (due 09-13) — NOT BOOKED.** Re-dated: Sitting 1 (Mac, lanes A+D)
  Fri 09-11; Sitting 2 (iPhone, B) and Sitting 3 (Android, C+E) Sat 09-12 /
  Sun 09-13; backstop Wed 09-16; hard stop Sat 09-19. The runway math is in
  `docs/attended-lanes/schedule.md` §3: lanes done by 09-13 leave six days
  of fix margin, by 09-16 three, on 09-19 none.
- **Row 2 dashboard look (due 09-08) — MISSED**; re-dated **Sun 09-13**, click
  path in `docs/attended-lanes/owner-checklist.md` chore 3. **Correction:**
  the app ships only the Web Analytics script (`/_vercel/insights/script.js`,
  `src/lib/analytics.ts`); there is no Speed Insights script, and Speed
  Insights is where Vercel reports Web Vitals. So Web Vitals will **not**
  arrive, and "page views + Web Vitals arriving" in row 2 above, in
  `HANDOFF/09-open-work.md` row 2, in the deploy receipt §P4.5 and in the
  runbook §2.4 step 4 over-promises. The release checklist's "Web Vitals
  arrive in the production dashboard" row cannot close on this build: either
  strike it for launch or schedule the script (a code + CSP change, own
  approval) post-launch — Buri's call.
- **Rows 3, 4, the `main` ruleset, the Dependabot snooze — unchanged**, now
  one page with exact click paths and the security-checklist rows each one
  closes: `docs/attended-lanes/owner-checklist.md`. Deadlines hold (D7 by
  09-20 with the DNS export first; MFA and the ruleset by 09-19; D10 by 09-18).
- **Row 5 Approval 5 — correction to the held diff.** Neither smoke asserts a
  URL-free share: `scripts/prod-smoke.mjs` `shareVerdict` (line 649) checks
  only `/^Match Cut · /`, and `tests/browser/delivery-smoke.spec.ts`
  `verifyShareAndReturn` (line 544) checks only the prefix. There is no
  "URL-free assertion in `prod-smoke.mjs`" to flip. The Approval 5 commit is
  therefore **three files** — `index.html:14`, the `noindex` pin at
  `tests/browser/delivery-smoke.spec.ts:76`, and `src/lib/share.ts:7` — plus,
  recommended but not required, a **new** assertion in both smokes that the
  share text contains `matchcutdaily.com`, so the gate proves the switch
  instead of ignoring it. Row 5 above, `HANDOFF/09-open-work.md` row 6, the
  master-plan §6 runway row and the kickoff all inherit the four-file wording;
  the S3 pass corrects them in its own commit. **D9 is still unruled**, so
  `codex/approval-5` was **not** created (S3 deferred, per the kickoff).
- **D11 375×667** — its start-by (~09-12) has effectively passed with nothing
  started. Recommendation: **skip** for launch; first post-launch train.
- **D4 practice rows** — still unruled; six of nine promo shots wait on it.

### New today

- `docs/attended-lanes/` (README, `lane-A` … `lane-E`, `schedule.md`,
  `owner-checklist.md`) and this addendum, committed docs-only on
  `codex/handoff-and-stale-docs` (PR #16 grows by these commits).
- `docs/process-retrospective-2026-09-08.md` and
  `docs/launch-runway-kickoff-prompt.md` tracked on the same branch.
- Nothing deployed; no alias, DNS or Vercel settings change; no source edit;
  the six Dependabot PRs untouched; no message sent to anyone.

### Asks for Buri (batched; none block the lanes)

1. Merge PR #16 (docs-only, CI green)?
2. **D3** — people, hardware, dates for the three sittings (`schedule.md` §1);
   send the drafts in §4.
3. **D9** — Approval 5 on Sat 09-19 or Sun 09-20, and do `practice ·` shares
   carry the URL? (Also: add the "share contains the URL" assertion to both
   smokes in the same commit — yes / no.)
4. **D11** — skip the 375×667 pass? (recommended)
5. **D10** — snooze the six Dependabot PRs as `owner-checklist.md` chore 5
   describes?
6. **Row 2 wording** — strike "Web Vitals" for launch, or schedule Speed
   Insights post-launch?
7. The retro's twelve questions (`docs/process-retrospective-2026-09-08.md`
   §10), whenever.

### Calendar deltas against §8

- **Fri 09-11** — Sitting 1 (Mac: lanes A + D; Buri can run it alone).
- **Sat 09-12 / Sun 09-13** — Sittings 2 (iPhone) and 3 (Android + TalkBack);
  the dashboard look by 09-13.
- **Wed 09-16** — lanes backstop.
- **Sat 09-19** — lanes hard stop; MFA + ruleset; Approval 5 (three-file
  commit, own Preview, own deploy).
- **Sun 09-20** — D7 redirect (DNS export first); Approval 5 retry.
  *Cert check #1 — dropped.*
- **Wed 09-23** — last deploy day; go/no-go. *Cert check #2 — dropped.*
- **Sat 10-03** — *cert notAfter line — moot (now 2026-12-05).*

**Note 2026-09-13 (Sunday).** The pass above ran on the evening of 09-10 but
its checkpoint reached Buri on 09-13; no sitting was booked in between. The
grid in `docs/attended-lanes/schedule.md` is re-dated: Sitting 1 (Mac, A + D)
Sun 09-13 or Mon 09-14; Sittings 2 (iPhone) and 3 (Android + TalkBack)
Mon 09-14 / Tue 09-15; backstop Wed 09-16; hard stop Sat 09-19 unchanged.
Fix margin is now four days at best. Re-verified 09-13: production unchanged
(`index-DAtVcX_d.js`, `noindex`), prod-smoke 09-13 09:36Z and canary
09-13 14:58Z green, PR #16 CI green on `22e9d42`.

**Rulings 2026-09-13 (Buri, in session).** PR #16 merged → `main = 8e1e3bd`.
**D9:** Approval 5 on **Saturday 09-19**; `practice ·` shares carry the URL too
(every share is an invitation back). **D11:** skip the 375×667 pass for launch.
**D10:** snooze Dependabot as `docs/attended-lanes/owner-checklist.md` chore 5
describes. **Row 2 / Web Vitals:** schedule Speed Insights post-launch (code +
CSP, own approval); the release-checklist row is struck for launch.
**D3:** still open — Buri may run lanes A, B and D himself if he has the
hardware; C and E need an Android phone. `codex/approval-5` carries the
Approval 5 commit for CI only (three switches + the two new URL assertions).
