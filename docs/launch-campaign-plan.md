# Match Cut — public launch campaign brief ("Tonight's Program")

Written 2026-09-05 via `/marketing:campaign-plan`. UNTRACKED by design (same
family as the promo docs); commit is Buri's call. Companion to
`docs/promo-execution-prompts.md` (asset production) and
`docs/daily-duel-216-deploy-and-indexing-runbook.md` (the switches). This doc
is the distribution plan those two deliberately left out.

## Inputs (stated as assumptions, not asked)

| Input | Assumed | Source |
|---|---|---|
| Goal | Public launch → a habitual daily-player base with a working share loop (awareness → trial → day-2 return → share) | 07-04 grill: goal = PUBLIC |
| Audience | Daily-grid players first, film buffs second, friends-of-players via the grid | circle feedback log |
| Timeline | 09-07 → 10-25 (7 weeks). Switches ~09-20 (D9). Premiere = Sun 09-27, first 216-pool Daily | runbook §3, D9 |
| Budget | $0 media. Buri's time (~3–5 h/week) is the budget. Two optional spends noted in §8 | Hobby Vercel plan, solo founder |
| Geography | English-language, US/UK-weighted film communities; no localization | — |
| Front door | Undecided until D+14 interviews → campaign leads cold traffic with Chronology + Connections, buff/technical traffic with Daily Puzzle; Duel is never the first touch | runbook §3c, feedback log |

Standing constraints inherited from the repo: no posters/stills/frames in any
asset (legal position) · TMDB attribution where data is surfaced · spoiler
rule (never today's or an upcoming deal) · noindex + URL-less shares hold
until Approval 5 · nothing is posted by an agent, ever — Buri publishes.

---

## 1. Campaign overview

- **Name:** "Tonight's Program" — the menu's own header and the social-preview
  copy. The campaign borrows the game's framing: every day is a program of
  four shows.
- **Summary:** a zero-paid-media, share-loop-led launch of matchcutdaily.com,
  soft-opened when the switches flip (~09-20), premiered on Sunday 09-27 with
  the first 216-pool Daily, spiked across communities the following week, and
  sustained for four weeks until the front-door decision.
- **Primary objective (SMART):** by Sunday 2026-10-25 (D+28), a 7-day average
  of at least 250 daily unique visitors to matchcutdaily.com, with at least
  40% arriving direct or untagged (the only available proxy for habit and
  share-driven returns), read from Vercel Web Analytics.
- **Secondary objectives:** at least 3 earned placements (roundup lists,
  newsletters, podcasts) · one community post that lands (Show HN ≥ 50 points
  or a subreddit post ≥ 200 upvotes) · 6+ player interviews by D+18 to rule
  the front door · home page + rulebook indexed by 10-04.

## 2. Target audience

**Primary — the daily-grid player.** Already plays Wordle, NYT Connections,
Framed, or Cinenerdle every morning and posts the grid to a group chat.
Pain: their current games are single-mode and exhausted; they want a new
grid worth posting. Motivation: ritual, bragging rights, two minutes a day.
Where: iMessage/WhatsApp group chats, r/wordle, r/NYTConnections,
r/WebGames, TikTok/IG grid-game clips, "games like Framed/Wordle" roundup
articles and Google searches. Stage: awareness → trial is one tap; the real
funnel is trial → day-2 → share.

**Secondary — the film buff.** Letterboxd users, film podcast listeners,
r/movies, r/Letterboxd, r/criterion, film Bluesky/Threads/X. Pain: movie
trivia games test frame recall, not knowledge of who made what. Motivation:
proving taste; "connect movies by the people who made them" is their
language. Where: Letterboxd, Bluesky film community, film newsletters,
YouTube essayists.

**Tertiary — friends of players.** Reached only through the share grid.
Includes non-buffs: the circle's non-buffs (Charlie, Eyad) found Chronology
and Connections the playable doors and Duel opaque.

**Distribution-only segment — makers.** Hacker News and Product Hunt readers.
Not customers, but the solver-guaranteed daily, sim-tuned difficulty, and
zero-dependency stack are a story they spread.

Audience profile: "A daily-grid player who already posts Wordle to the group
chat, is bored of their current games, discovers new ones through friends'
grids and Reddit threads, and cares most that it is fair, fast, and postable."

## 3. Key messages

**Core:** Four movie games, one daily ritual. (canon)

| # | Supporting message | Pain it answers | Proof |
|---|---|---|---|
| 1 | Connect movies by the people who made them. Knowledge, not recall. | Trivia games reward image search and frame memory | The mechanic itself; typographic cards only, so there is nothing to reverse-image-search |
| 2 | Fair every day: every Daily is solver-proven solvable with a computed par. Golf scoring, low wins. | "Today's puzzle was impossible" fatigue | RULEBOOK "Par is computed, not guessed"; verify suites 8/8, 42/42, 14/14 (HN audience) |
| 3 | A door for every level: Chronology and Connections for the casual, Daily and Duel for the buff. | "I don't know enough about films" | Circle: "games are a lot of fun" with favorites Connections + Chronology; "everything worked like it should" from a self-described non-buff |
| 4 | Nothing between you and the game: no account, no app, no ads, keyboard-playable, shares as an emoji grid. | Sign-up walls, app installs | localStorage-only meta-state, no backend |

**Tone by channel:** social = the game's own program copy, sentence case,
short · Hacker News = plain and technical (date-seeded deterministic deals,
solver, sim, React/Vite with no other runtime deps, TMDB data) · Reddit =
"I made this", ask for feedback, never for votes · film communities = lead
with the person-link mechanic and the no-stills choice as a feature · group
chat = the grid speaks.

**Do not say:** "movie trivia" (positions against recall games and invites
"just Google it") · anything hype-flavored (brand rule) · Duel as the opener.

## 4. Channel strategy

| Channel | Why it fits | Format | Effort | When |
|---|---|---|---|---|
| **The share grid** (product) | The Wordle engine; every clear is an ad in a group chat | `Match Cut · <Mode>` + score line + emoji row + URL after Approval 5 | None beyond the switch | Live ~09-20 |
| **matchcutdaily.com** (owned) | The product is the landing page; the OG card is the only ad creative most people see | social-preview.png live, playmatchcut.com redirect, noindex off | Low (engineering gates) | Approval 4 / 5 |
| **Two social profiles** (owned) | Pick ONE short-video (TikTok or IG Reels, carries the Phase 2 clips) and ONE text/community (Bluesky or Threads, where film talk moved). Reserve @matchcutdaily everywhere regardless | Carousel slides, capture cards, clips, a daily grid post | Medium (3 posts/week + 1 grid/day) | From 09-21 |
| **Circle** (earned, 5–10 people) | Highest-trust seed; already know the game | One text: the link + one-line pitch per mode + "post your 09-27 grid to one group chat" | Low | 09-27 |
| **Show HN** (earned) | Technically interesting, playable in one tap, no signup; the classic indie-game spike | Title + maker comment on how it is built; Buri on comments for 6 h | Low prep, high leverage | Tue 09-29 09:00 ET |
| **Reddit** (earned) | Where "games like Wordle" gets answered | r/WebGames (self-promo allowed), r/Letterboxd, r/movies if rules permit; replies in r/wordle and r/NYTConnections "other games" threads | Medium (rules vary; one post per sub, spaced) | 09-30 onward |
| **Roundups + directories** (earned) | Slow-burn SEO and evergreen discovery ("best games like Framed") | 8–12 pitch emails with the press kit | Medium | Week 4 |
| **Film newsletters / podcasts / YouTube** (earned) | Buff audience, credibility | 5–8 targeted pitches; the no-posters angle + a fun pre-cleared grid | Medium–high, low hit rate | Week 4 |
| **Product Hunt** (earned, optional) | Maker audience, gallery format suits Canva B/C/D | Listing + maker comment | Medium | Thu 10-01 if wanted |
| **Paid** | None by default. If ≤ $300 appears: boost the organically best-performing clip or one promoted Reddit post with film-interest targeting, week 3–4 only | — | — | Only after a channel shows pull |

Not recommended: an email list (nothing to send daily that the game does not
already do); Letterboxd lists of the pool (spoilers the content); Discord
(moderation load on a solo founder).

## 5. Content calendar

| Week | Dates | Content / milestone | Channel | Notes and dependencies | Status |
|---|---|---|---|---|---|
| 0 | Mon 09-07 → Sun 09-13 | **Approval 4 prod deploy** (latest safe 09-13) → social-preview.png live · fix playmatchcut.com redirect (D7) · red-pen brand sheet Q1–Q5 + amber pick · **Phase 0-captures** (promo prompt 2) · reserve @matchcutdaily handles · draft HN, Reddit, premiere, and circle copy · verify Search Console property (submit sitemap later) | Engineering, promo, prep | Everything downstream needs the deploy. Premiere slips with it | ☐ |
| 1 | Mon 09-14 → Sun 09-20 | **Phase 1 Canva**: instantiate B/C/D with real captures, export · **Phase 2** storyboards + pool-agnostic clips (a) and (c) · attended lanes A–E on prod (D3) · press kit PDF · UTM link set · **Sat/Sun 09-19/20 Approval 5**: noindex off + URL-in-share in one commit (D9); submit sitemap same day | Promo, engineering | Clip (b) waits for post-cutover footage. Share loop is OFF until this week ends | ☐ |
| 2 | Mon 09-21 → Sun 09-27 | Mon–Thu: mode-explainer carousel, one slide a day (Chronology → Connections → Daily → Duel) · Fri: clip (a) "beat today's par" · **Sun 09-27 PREMIERE**: first 216 Daily; premiere post + share-showcase; text the circle; start posting Buri's own grid daily at a fixed hour · post-cutover reshoot for clip (b) begins | Social, circle | Sunday is a dead slot for HN/Reddit, so those wait. Prod-smoke crons must be on before week 3 | ☐ |
| 3 | Mon 09-28 → Sun 10-04 | **Tue 09-29 Show HN** + maker comment, 6 h on comments, no deploys that day · **Wed 09-30** r/WebGames + r/Letterboxd · **Thu 10-01** Product Hunt (optional) · Fri: clip (c) share payoff · daily grid post continues · **Sun 10-04 readout 1** (visitors, referrers by UTM) | HN, Reddit, PH, social | Spike week. Expect 90% decay within 72 h; judge on the D+28 average | ☐ |
| 4 | Mon 10-05 → Sun 10-11 | Mon–Tue: 8–12 roundup/directory pitches · Wed: 5–8 newsletter/podcast pitches · reply in "games like…" threads as they appear · post-cutover clip (b) publishes · **Sun 10-11 = D+14: interviews begin** (6+ players: circle + newcomers recruited via a social post) · readout 2 | Email outreach, social | Interviews carry every question analytics cannot answer (mode mix, share, day-2) | ☐ |
| 5 | Mon 10-12 → Sun 10-18 | Interviews close · **front-door ruling** (data cross-check limited to referrers/paths) · "which mode is your ritual?" poll · repost best clip · second Reddit wave (r/wordle, r/NYTConnections) if rules allow · readout 3 | Social, Reddit | Front door = small App.tsx change + menu emphasis; its own approval | ☐ |
| 6 | Mon 10-19 → Sun 10-25 | Front-door change ships if ruled · **campaign retro vs §7 KPIs** · set the sustain cadence (3 posts/week + 1 grid/day) or stop · readout 4 (final) | Engineering, social | Kept deliberately light: the 20% slack the calendar needs | ☐ |

Dependency chain: Approval 4 → OG image live → any outbound link · Approval 5
→ URL-in-share → the loop works · captures → Canva B/C/D → every social post
· interviews → front door → landing emphasis.

## 6. Content pieces needed

**Must-have**

| # | Asset | Description | When |
|---|---|---|---|
| 1 | OG card | Exists (`public/social-preview.png`); goes live with Approval 4 | Week 0 |
| 2 | Mode-explainer carousel ×4 | Canva C, approved v2 direction; swap in real captures | Week 1 |
| 3 | Share showcase ×1–2 | Canva D story; "the enviable grid" — the organic-growth asset | Week 1 |
| 4 | Capture cards, feed + story | Canva B, phone-framed, one hook line, footer URL | Week 1 |
| 5 | Show HN post + maker comment | Title ≈ "Show HN: Match Cut – four daily movie games with solver-guaranteed puzzles"; comment = how par is computed, the sim, the no-stills choice | Week 0 draft, week 3 post |
| 6 | Reddit posts ×2–3 | Tailored per sub; "I made" voice; feedback ask | Week 0 draft |
| 7 | Circle launch text | One line per mode (the SEND pitch already exists in master-plan §6) + the grid ask | Week 0 |
| 8 | Clip (a) "beat today's par" | 15–20 s vertical, pool-agnostic, Phase 2 storyboard | Week 1–2 |
| 9 | Clip (c) share payoff | 15–20 s "play → clear → brag" | Week 1–3 |
| 10 | Press kit | One-page Canva PDF: mark, wordmark, 3 captures, 4 one-liners, the no-posters line, TMDB credit, contact; hosted in a shared folder, not in `public/` | Week 1 |
| 11 | Outreach templates ×2 | Roundup/directory; newsletter/podcast | Week 1 |
| 12 | UTM link set | One link per channel; on Hobby this is the only per-channel attribution | Week 1 |

**Nice-to-have:** clip (b) one-mode explainer after the cutover · Product
Hunt gallery · Letterboxd profile with bio link · a "how par works" explainer
thread for HN/Reddit follow-ups · a 375×667 crop for any future ad.

## 7. Success metrics

Measurement reality: Vercel Web Analytics on the Hobby plan reports visitors,
pageviews, referrers, UTM parameters, paths, devices, countries. Custom
events do not record on Hobby (D1, accepted), so mode mix, share rate,
outcomes, and day-2 return are invisible to analytics and belong to the
interviews.

| KPI | Floor | Target | Stretch | Source |
|---|---|---|---|---|
| 7-day avg daily unique visitors at D+28 (10-25) | 100 | 250 | 600 | Vercel |
| Direct/untagged share of visits (habit + share proxy) | 30% | 40% | 55% | Vercel referrers |
| Launch-week peak-day visitors | 1,000 | 3,000 | 10,000 | Vercel |
| Earned placements | 1 | 3 | 6 | manual log |
| Community post outcome | Show HN ≥ 20 pts | ≥ 50 pts or a 200-upvote post | front page | manual |
| Interviews completed by D+18 | 4 | 6 | 10 | manual |
| Indexed pages by 10-04 | home | home + rulebook | + mode paths | Search Console |

Reporting: a Sunday readout each week from 10-04 (four in total), appended to
an append-only campaign log in the style of `docs/feedback-log.md`. The
D+28 average, not the launch spike, is the pass/fail line.

## 8. Budget allocation

Baseline $0. Two places money would change the plan:

| Spend | Cost | What it buys | Status |
|---|---|---|---|
| Vercel Pro | $20/mo | 2 custom-event properties → mode + outcome recorded; the single largest measurement upgrade | Re-opens D1 (Hobby accepted). Not flipped silently; Buri's call |
| Boost the winner | ≤ $300, weeks 3–4 only | Promote the clip or post that already shows organic pull | Only if a channel earns it |

Production cost is time: Canva Pro is already on the account; captures and
clips ride the existing Playwright toolchain. Contingency is calendar slack
(week 6), not cash.

## 9. Risks and mitigations

| Risk | Mitigation |
|---|---|
| **The loop is off during first exposure.** URL-in-share and the OG image are engineering switches (Approval 5, Approval 4), not marketing tasks. Links posted before them land on a card-less, URL-less game | Hard-gate every outbound post on both switches. If Approval 4 misses 09-13, move the premiere a week; do not launch with a 404 OG image |
| **Measurement blind spot** (Hobby: no events) | UTM discipline on every link; interviews carry the behavioral questions; or re-open Pro (§8) |
| **Crowded niche.** Cinenerdle2 owns "connect movies by cast" and Framed owns "daily movie game" mindshare | Never say "trivia"; lead with four modes + computed par + no stills; the roundup pitch is "the one that is four games" |
| **First-touch confusion.** Circle showed a total Duel comprehension failure and a Connections difficulty wall for non-buffs; the pre-launch review flagged 216 findability (26 of 35 first-month Solo days need a hidden credit) | Cold traffic goes to Chronology first; Duel is absent from first-touch creative; keep practice rows (D4 default "practice stays") visible in promo captures |
| **Spike-and-die.** HN/Reddit traffic decays ~90% in 72 h | The ritual is the retention play: a grid posted daily at a fixed hour, and the share loop. Judge on D+28 average |
| **Solo bandwidth + zero monitoring** (R3) | Enable prod-smoke crons before 09-29; no deploys on HN day; week 6 left empty |
| **Public exposure of TMDB usage** | The queued TMDB commercial-use decision should be ruled before the premiere; attribution stays visible in the rules modal and press kit |

## 10. Next steps

Immediate, this week:
1. Ship Approval 4 (gates everything).
2. Fix playmatchcut.com (D7, dashboard, own approval).
3. Buri rules: the two social platforms · premiere = 09-27 confirmed · Pro vs Hobby re-open yes/no · Product Hunt in or out · TMDB commercial-use.
4. Red-pen brand sheet Q1–Q5, pick the amber, then run promo prompt 2 (captures).
5. Reserve @matchcutdaily on TikTok, IG, Bluesky, Threads, X.
6. Draft the HN, Reddit, premiere, and circle copy (agent can draft; Buri posts).

Approvals: Approval 4 · Approval 5 (09-19/20) · asset look-and-feel (Buri's
gate, never self-approved) · every outbound post is posted by Buri.

Decision points: 09-13 (latest deploy, else premiere slips) · 09-20
(switches) · 09-27 (premiere go) · 10-11 (interviews → front door).
