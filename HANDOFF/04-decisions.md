# 04 — Decisions

**Last verified:** 2026-09-07 at d22a255

A decision is logged here when a newcomer would otherwise re-litigate it: a
technology choice, a rule that was locked, a direction rejected, a scope cut, or
a launch-sequencing call. Sources in order of reliability: Buri's locked-context
blocks in kickoff prompts, the master plan's §7 rulings and §10 amendment log,
`docs/tmdb-rulings.md`, CLAUDE.md, session closing messages, and project memory
(`memory/` symlink; files named `marquee-*`). "Why: not recorded" means exactly
that. Dates are when Buri ruled, not when the code landed.

## Decision log

| Date | Decision | Why | Rejected alternatives | Source |
|---|---|---|---|---|
| 2026-06-11 | Pivot to "Marquee": a movie card game (solitaire + Duel vs CPU) instead of a movie-chain guesser | Pure solitaire was too solvable by flipping; the session-based Duel was more fun | movie-chain guesser; NYT-daily-only framing (kept as a mode for comparison) | memory `marquee-pivot-and-stack` |
| 2026-06-11 | **Stack locked: React 18, TypeScript, Vite, Tailwind 4, Framer Motion. No other runtime dependency without asking.** | Keep the bundle small and the blast radius known | any UI kit, router, state lib, PostHog, GSAP, haptics libs (all explicitly skipped 2026-07-10) | CLAUDE.md; memory pivot file; master-plan §7·8 |
| 2026-06-12 | Movie data hand-curated in `src/data/movies.ts`; links are exact-string name matches; visible top cast max 5, deeper credits in `deepCast` | Spelling consistency is what builds the graph; deep cuts are a designed skill element | live API at runtime (rejected: static site, no backend) | memory pivot file; `docs/tmdb-plan.md` |
| 2026-06-17 | **The sim is the rules contract.** `sim/RULESET.md` canonical; `npm run verify` is the gate; React and sim import the same `src/lib/` functions | Parity by construction, not discipline | duplicated logic | CLAUDE.md; `sim/RULESET.md` |
| 2026-06-17 | Duel flow package locked: Double Feature (two piles), draw-3-keep-1, race to 20 | Sim showed the old flow "brick-spiraled"; go-out bonus measured a dud and dropped | go-out bonus; single pile; draw-1 | memory `marquee-flow-diagnosis` |
| 2026-06-22 | Burned draw cards stay invisible (no discard zone) — parked default D1 | Calmer board; render-only change if revisited | visible discard pile | memory `marquee-decisions-log` |
| 2026-06-22 | Multi-pile helpers split by layer: pure → `duel.ts`, knobs-aware → `difficulty.ts` (corrects an earlier plan) | Putting all in `duel.ts` creates a circular import | all-in-`duel.ts` | memory `marquee-decisions-log` D2 |
| 2026-06-22 | Difficulty tiers Matinee / Feature / Director's Cut with casual win-rate targets **65 / 50 / 41** | Design target for a casual player | — | memory `marquee-difficulty-spec` |
| 2026-06-23 → 06-30 | Funpass rules locked: meld ladder (Auteur > Actor > Series > Genre, rung locked at bank), genre melds need 3 cards, 3 wild cards, **take-to-meld only** (no free take), wild-blocks-take | Each simmed; free take caused hoarding and wrecked pacing | take-no-limit; wild-bridge | memory `marquee-funpass-decisions`; RULESET §11 |
| 2026-07-01 | Take-friction: keep the take-to-meld rule, make taking obvious (glow) on **Matinee only** | Buri kept fighting the rule in play but ruled UX over a rule change | reopening the rule | memory funpass, round 3 |
| 2026-07-01 | Execution order for the review findings: communication pass → playtest → Solo daily decision → Stage B unification → visual phase | Fix the explained game before testing it | — | memory `marquee-review-priorities` |
| 2026-07-03 | Daily Puzzle becomes a real date-seeded daily built **constructively** (seeded walk), solver re-proves, par = (hand+1)+4 − best combo | Random 8-card deals never solve (0/400) | rejection sampling; demoting Mode 1 | memory review-priorities "jumpstart" |
| 2026-07-03 | Measurement methodology: ≥4,000 games or it is noise (8,000 when effect ≤2pp); CRN pairing; CI-contains-target = on-target | A 500-game read misled the tune once | small samples | RULESET §12 |
| 2026-07-04 | **Goal = public launch.** Phase until then = learning/measurement | Buri: "get this out there in the public in the best format possible" | — | memory review-priorities "grill" #1 |
| 2026-07-04 | Front door deferred until playtest data; **decided by qualitative interviews** ("which mode would you miss most"), analytics as cross-check | Buri's call over a return-rate metric | pick now | grill #2, #6 |
| 2026-07-04 | **Persistence guardrail lifted: localStorage for meta-state only + Vercel Analytics.** Rules/deals stay stateless and seed-derived | Needed as a retention mechanic and to measure which mode people return to | accounts; server | CLAUDE.md "Persistence"; grill #3 |
| 2026-07-04 | Build **Connections** as mode 4 before the playtest, from existing meld metadata; no second content pipeline | All four "horses race together" | poster reveal / box-office modes; clue-peeling guesser (parked) | grill #4 |
| 2026-07-04 | Quiet phase = obscure alias + `noindex`, **no password gate**; shares URL-less; **URL-in-share is the launch switch** | Friction would contaminate return-rate data | Vercel password protection | grill #5 |
| 2026-07-04 | **Rename to Match Cut**; domains matchcutdaily.com + playmatchcut.com bought; lowercase "marquee" stays as the Duel pile term | Naming sweep with live domain checks | keep Marquee | memory review-priorities "REBRAND" |
| 2026-07-05 | Content review = split pass: Claude cross-checks against TMDB and emits diffs; Buri arbitrates only flagged diffs | Keeps the gate human, shrinks the work | full manual review | WS2 grill #1 |
| 2026-07-05 | **TMDB is author-time only, a witness not a judge**; key never in the bundle; attribution in the rules/About modal; free tier = non-commercial + attribution (monetizing = ~$149/mo commercial licence = a launch switch) | Static site; community-edited data | runtime TMDB calls | `docs/tmdb-plan.md`; memory `marquee-tmdb-pipeline` |
| 2026-07-05 | Content rules: cast = performed in the film (archive footage excluded; voice/uncredited kept); "adaptation by" excluded (screenplay only); billing = fix true order errors, keep recognizability picks; international films date to first **US theatrical**, never origin year (2026-07-12) | Consistent link graph | — | `docs/tmdb-rulings.md` standing policies; WS2 grill #4 |
| 2026-07-05 | Duel pool frozen as an explicit `DUEL_POOL_IDS` list (89); Solo daily pins to it; waves append to `MOVIES` without touching published dailies; verify bumped 63→64 with a pool-pin check | Growing a pool invalidates tuning like a rule change | per-film flag; slice | WS2 grill #6–#8 |
| 2026-07-05 | **The Stub** (`design_handoff_the_stub/`) is the visual direction; UI-PRD §10 A–D superseded | Buri chose it over four mockup alternatives | UI-PRD §10 A–D | memory `marquee-orchestration-workflow`; master-plan §2.1 |
| 2026-07-05 | Orchestrated multi-agent build with commit-per-wave and push to origin main; deploys stay Buri's button | Buri moved from working-tree-only to a git/PR workflow | — | memory orchestration-workflow |
| 2026-07-06 | **One live plan: `docs/master-plan.md`.** PLAN.md, orchestration-plan.md, ui-tasks.md bannered history | Buri called the project "lost and bloated" | multiple plans | master-plan header; CLAUDE.md |
| 2026-07-06 | **Gate-split autonomy:** objective waves auto commit+push; UI waves stop for Buri with side-by-sides at 390×844 and 375×667 vs the reference PNGs plus a played game | Recon showed the UI "drift" was invisible inventory, not wrong pixels | full autonomy; full manual | master-plan §2.2; §10 v1 |
| 2026-07-06 | Cohesion rule: the six Duel comps are the element library for every mode; other surfaces are **extrapolated** and tagged so at checkpoints | Only Duel screens were designed | wait for more comps | master-plan §2.4; §10 v2 |
| 2026-07-06 | **Card faces are typographic this build**; scene art is a future look; art slot excluded from checkpoints | The handoff's baked card PNGs leak year and points; art at scale is a parked track | ship baked art | master-plan §2.6; §10 v2 |
| 2026-07-06 | Connections dealer lock: person/series-first, ≤1 genre group per grid, strict accidental-free deals only | 84% of naive grids had an accidental alternative solution | uniform; genre-free variants | master-plan §4·W4; RULESET §13 |
| 2026-07-06 | Duel deep-cut reveal as a difficulty lever: concept approved, **parked**; not a launch blocker | Needs a TMDB deepCast pass, a flip face, and a re-tune | folding into a wire | memory `marquee-deepcut-initiative` |
| 2026-07-06 | `CHRONO_TITLE_OVERRIDES` map stands (LotR trilogy, M:I Fallout, later Force Awakens, Mermaid/Superman remakes) | Card-face vs pool title conventions | a `chronoTitle` field | master-plan §7·3b |
| 2026-07-07 | Connections tiles are title-only tickets, not literal StubCards; share squares 🟦🟥🟩🟪; no 🎬 lead | A genre-tagged card would leak the genre group | full StubCards | W4 checkpoint rulings (commit 6d88362) |
| 2026-07-07 | Duel keeps **flip-to-peek** credits (not credits always on face); Duel↔Solo reveal divergence accepted | Solo's score IS flips | credits-on-face | W2 checkpoint (commit 23f43e0) |
| 2026-07-08 | **First-player tilt (~9.5pp human edge) shipped as a documented, gate-pinned house edge** | Human is always seated first; the tune already contains it; "fixing" it would make the game harder and force a re-tune | fairness variant; alternating starts | master-plan §7·4 (commit 5e0f644) |
| 2026-07-08 | Pool cutover deferred to pool LOCK; Solo cutover = cheap re-pin, **Duel cutover = its own re-sim/re-tune** | A bigger Duel pool invalidates the tune | blind pin swap | same |
| 2026-07-08 | Connections category diversity: leave as-is for SEND, add an actor ≤2 floor at LOCK if it reads repetitive (it did, 2026-07-08 phone pass) | Mix is a pool-shape artifact | constrain now | same; W5c |
| 2026-07-08 | Onboarding = minimal one-shot framing overlay; CPU last-card warning = quiet booth pip; Solo/Chrono end stats already shipped | Grill-first scoping of three under-specified UI features | funnel before feedback | W5c rulings (commit 09a02d0) |
| 2026-07-09 | "Name is the hero" card title redesign; Taz → "CPU" label sweep, taunts kept | Titles must always be whole | — | commit d16e974 |
| 2026-07-09 | Difficulty-as-personas moved **post-SEND**, gated on real feedback | Do not build presentation before data | pre-SEND build | commit 95390cf |
| 2026-07-10 | **W6 SEND on the public domain** matchcutdaily.com (not an obscure alias) — noindex and URL-free shares still hold | Easier to share with the circle | obscure alias | master-plan §0 (commit 0e1e403) |
| 2026-07-10 | SEND-window deploy **freeze**: fixes build+commit+push freely, deploys batch to window close; exception (a) = score-corrupting blockers may deploy | Keep the feedback window's data clean | continuous deploy | master-plan §2.11 |
| 2026-07-10 | UI-overhaul intake (§7·8): zero-dep SVG icon pass, share-emoji exemption, Framer-only polish, landing pass tied to the launch switch; filter = "does this glyph carry the ticket-stub voice or fight it?" | Buri's design guide; over-cleaning into a productivity-app look is also failure | glassmorphism, PostHog, haptics, GSAP | master-plan §7·8 (commit ddf599a) |
| 2026-07-12 | Stage B struck 74 of 352 slates; Spirited Away dated 2002-09-20 (US policy); "300" struck; Soul dropped from Chronology (Disney+ day-and-date) | Content arbitration | — | commits c7352d3, 2fccdcf |
| 2026-07-16 | Feedback batch 1: remake titles disambiguated ("(Animated)/(Live-Action)"); summary-first How-to-Play; drag nudge; hand-fan rail token deviation ratified; same-year month reveal deferred | 27 circle reports triaged | batch-submit scoring, lowest-time scoring (both rule changes, parked) | `docs/feedback-batch1-plan.md`; commits 3d84a15…481768a |
| 2026-07-17 | Race-to-20 mid-turn timing divergence (sim checks after the full turn, React ends instantly) **flagged, not changed** | Scoring-path divergence; the tune was measured on sim timing | quiet fix | commit 4b9ca3c |
| 2026-08-07 | **Pause movie expansion after the current pool**; next constraint is presentation, delivery weight, and launch ops → the polish/scale program (master-plan §9) | Status audit verdict | more content | master-plan §9, §10 v4 |
| 2026-08-07 | Menu order **Daily Puzzle → Chronology → Connections → Duel**; Duel no longer the hero card | Duel comprehension failed for three independent testers; zero would-return votes | Duel first | session 4de0b2cd closing message |
| 2026-08-08 | Exception to the pause: the 67-card Wave 3 (Buri's larger pick over the 36-card recommendation) merged → dated pool 482 | Buri's explicit selection | 36-card wave | `docs/pool-expansion-wave3-slate.md` |
| 2026-08-18 | Security posture: strict CSP (`script-src 'self'`), all headers mirrored in Vite preview, actions SHA-pinned, `check:security` gate, analytics loader moved out of inline HTML | Goal 4 hardening | — | `docs/security-launch-checklist.md` |
| 2026-08-20 | Practice = onboarding-ish; Buri leaned toward removing evergreen practice — **question never formally ruled** (open as D4) | — | — | session f3f59ecf; prelaunch review D4 |
| 2026-08-26 | **216 + 16 cutover approved**: exact 216 Keep / 0 Maybe / 6 Strike; 16 all-time-film wilds, keep-all multi-wild; first expanded Daily **2026-09-27**; seeds ≤09-26 byte-pinned to the legacy 89; retune to **65.9 / 50.3 / 41.4** over 8,000 games per tier | Launch content | 200-card target (became 216) | master-plan §6 "CONTENT CUTOVER"; `docs/daily-duel-216-release-checkpoint.md` |
| 2026-08-27 | Player-facing copy: opponent is "CPU"; "Reaching 20 ends the show; highest net score wins"; Daily links are people-only; Duel series upgrades a link | Locked by the launch-readiness prompt | — | `docs/daily-duel-216-launch-readiness-goal-prompt.md` §"Buri decisions locked" |
| 2026-08-28 | Support route = public GitHub issues with three templates + in-app privacy disclosure; minimal privacy-safe journey analytics (nine events, no identity) | Cheapest owner-controlled route | email; third-party forms | launch-readiness Goals 1–2 |
| 2026-08-31 | Priority: fastest safe sequence to a main merge; measured no-change beats speculative polish | Runway to 09-27 | — | resume prompt |
| 2026-09-01 | Gates **sequenced** as separate approvals: 1–2 commit/merge, 3 protected Preview, 4 production deploy, 5 indexing switches; evidence scope = the two `audit/` directories only (~1.6 MB), never `review-B-shots/` | Each external mutation gets its own yes | one big approval | memory next-session-queue; ship-pass prompt |
| 2026-09-02 | Preview gate opts out of the Vercel Toolbar via `x-vercel-skip-toolbar: 1` (harness edit, own commit); `npm audit fix` lockfile bump as its own commit | Platform injection, not our code; dependency change = own approval | disabling Toolbar in Vercel settings; accepting a diagnostic receipt | commits 0dd6c8d, 6b758b0 |
| 2026-09-02 | **Sub-agents run on Opus by default** with full self-contained briefs; deviate only with permission | Quality over speed/cost | — | memory `feedback-subagent-model-opus` |
| 2026-09-03 | D1: stay on Vercel **Hobby**; custom events will not record; deploy anyway, revisit at the 10-04 readout | No code shape preserves signal on Hobby | Pro / Pro+Plus | `docs/prelaunch-review-2026-09-03.md` D1; runbook §1 |
| 2026-09-03 | D5: menu gzip budget raised 100 → **104 KiB** (with comment) so the error boundary fits | 154 B headroom had become a shipping freeze | freeze the menu | prelaunch review D5; PR #10 |
| 2026-09-03 | D8: franchise-shaped Connections groups (e.g. four Harry Potter films under one actor) accepted for launch | Dealer change is not a quick win | post-filter + re-bake | prelaunch review D8 |
| 2026-09-03 | Three polish batches (Q-copy, Q-safety, Q-ops) as separate PRs merged in order safety → ops → copy; production untouched | Small reviewable diffs | one PR | `docs/prelaunch-polish-kickoff-prompt.md` |
| 2026-09-04 | D6: **`DAILY_EPOCH` stays 2026-07-04** (first public player sees "day 86") | Now-or-never; Buri chose keep | move to 09-27 or deploy date | memory next-session-queue (P0) |
| 2026-09-04 | Deploy SHA gets its own protected Preview pass first, and the 09-27 seed is replayed on real production bytes | main gained player-facing code after Approval 3 | trust the earlier Preview | deploy kickoff prompt |
| 2026-09-05 | Rollback target stays the **previous** deployment, not the new one (kickoff wording corrected as deviation 4) | "Update to the new dpl" would make rollback a no-op | — | deploy receipt §Deviations |
| 2026-09-05 | Crons enabled: nightly prod-smoke + 30-min canary, issue-on-failure | Production serves the cutover build so a failure is a real alert | — | PR #14 |

## Locked rules (the "do not relitigate" list)

Consolidated from CLAUDE.md, the master plan §2 constitution, and the locked
blocks of the September prompts. Each with its source.

1. **`docs/master-plan.md` is the only live plan.** PLAN.md / orchestration-plan.md /
   ui-tasks.md are history. *(CLAUDE.md; master-plan header)*
2. **`sim/RULESET.md` is the canonical contract; the sim is the source of truth.**
   Any rule/scoring change → `npm run verify` 64/64 + solo 8/8 + chronology
   42/42 + connections 14/14 + re-tune. *(CLAUDE.md)*
3. **Rule, scoring, seed, pool, pin, wild, dealer, or tune changes are never
   trivial and never fold into an unrelated edit.** *(CLAUDE.md; every 2026-09 prompt)*
4. **Deps locked** to React 18 / Vite / Tailwind 4 / Framer Motion. *(CLAUDE.md)*
5. **localStorage = meta-state only.** Never persist anything a rule depends on.
   *(CLAUDE.md)*
6. **RULEBOOK.md updates in the same pass** as any mechanic change. *(CLAUDE.md)*
7. **`src/DuelGame.tsx`: surgical edits only; no reducer refactor; one writer at a
   time.** *(CLAUDE.md; master-plan §2.7)*
8. **Deploys, rule changes, pool cutovers, arbitration rulings, checkpoint
   approvals, and every external mutation are Buri's.** Pushing never deploys.
   *(master-plan §2.9; release checklist)*
9. **UI waves stop for Buri** with side-by-sides at 390×844 and 375×667 plus a
   played game; objective waves auto-commit and push. *(master-plan §2.2)*
10. **Visual authority order:** reference PNGs (composition) → README token table /
    7f (exact values; never eyedrop where a token exists) → `docs/ui-contracts.md`
    → UI-PRD §4/§5. *(master-plan §2.1)*
11. **Typographic card faces this build; no posters, stills, frames, or key art
    anywhere** (game or promo). *(master-plan §2.6; promo §0 rule 4)*
12. **Player-facing brand is Match Cut**; transcribe the handoff's language, never
    its "Marquee" brand strings. *(master-plan §8)*
13. **Content merges go through `/tmdb-check` arbitration**; `movies.ts` is
    append-only; `docs/tmdb-rulings.md` is append-only. *(master-plan §8; tmdb-plan)*
14. **Quiet-phase switches hold** (`noindex`, URL-free shares) until Approval 5;
    each switch is its own go/no-go. *(runbook §3)*
15. **Attended lanes close only with the named hardware, a present human, and the
    exact candidate.** Never by automation, simulator, old receipt, or other SHA.
    *(`docs/daily-duel-216-attended-acceptance.md`)*
16. **Deploy from a clean clone, `vercel whoami` first; agents never read the
    Vercel token or mint the bypass jar.** *(runbook §2.2; memory next-session-queue)*
17. **Never `git add .` / `git clean` / `reset` / `checkout` / `stash` in an agent
    session; preserve unrelated dirty and untracked work** (the promo family in
    particular). *(launch-readiness prompts)*
18. **Promo: nothing posts, Buri posts; look-and-feel is Buri's gate; never
    today's or an upcoming deal in an asset.** *(`docs/promo-execution-prompts.md` §0)*
19. **Sub-agents on Opus with full briefs.** *(memory feedback)*
20. **Wind-down on a long session:** finish the in-flight wave to its gate,
    commit+push, tick the Ledger, update memory, restart fresh. *(master-plan §8)*

## Reversed decisions

| Originally | Reversed | What changed |
|---|---|---|
| 2026-06-11: no persistence, no streaks, no daily gating, no analytics (explicitly forbidden) | 2026-07-04 | Lifted for meta-state only + Vercel Analytics, as a retention mechanic and measurement instrument |
| 2026-06-11: two modes behind a menu, Duel-first | 2026-07-04 / 2026-08-07 | Four modes; Duel moved to the bottom of the menu after feedback |
| 2026-06-12: pool = 89 films, no TMDB | 2026-07-05 | TMDB author-time pipeline; pool 320 credited / 482 dated |
| 2026-07-01: per-card hand-authored card-art SVGs | 2026-07-01 → 07-06 | Parametric/typographic faces; art pilot parked |
| 2026-07-04: quiet launch on an obscure alias | 2026-07-10 | SEND on the public domain (shareability), noindex kept |
| 2026-07-05: UI-PRD §10 A–D directions | 2026-07-05 | The Stub handoff chosen instead |
| 2026-07-06: self-render the Stub HTML to `renders/` as acceptance references | 2026-07-06 (same day) | Buri exported six reference PNGs; those are the acceptance set |
| 2026-07-10: interviews ~2026-07-24 pick the front door | 2026-09 | Interviews now D+14 after the premiere = 2026-10-11 |
| 2026-08-07: pause movie expansion at 438 | 2026-08-08 | One controlled exception (Wave 3 → 482); pause otherwise stands |
| 2026-08-31: evidence commit excluded from the release commit | 2026-09-01 | Two `audit/` directories force-added (~1.6 MB); 22 MB of review shots stay local |
| 2026-09-01: analytics journey dictionary expected to record | 2026-09-03 | Discovered Hobby plan records no custom events; accepted (D1), code left in place |
