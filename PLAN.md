> ⛔ **SUPERSEDED 2026-07-06 by [`docs/master-plan.md`](docs/master-plan.md) — the only live plan.**
> Kept for history; do not update. WS1–WS5 + Amendment 1 state was absorbed there.

# Marquee — Launch-Ramp Build (pre-playtest)

**Everything buildable WITHOUT playtest feedback, ending in a friends & family
playtest of all FOUR modes on a ~300-film pool wearing the Stub UI.**
Status: **DRAFT awaiting approval** (2026-07-04). Supersedes the executed flow-package
plan (fully shipped 2026-06-22/27; preserved in git history and project memory).

Contract unchanged: [`sim/RULESET.md`](sim/RULESET.md). Standing gates on every step:
`tsc` + `vite build` clean · `npm run verify` **64/64** (63→64: the DUEL_POOL_IDS
pool-pin landed with the duelPool split, 2026-07-05) · chronology **42/42** ·
solo **8/8** (pin bumps only as a conscious cutover) · RULEBOOK.md updated in the
same pass as any mechanic/mode change.

## Locked context (from the 2026-07-04 grill — don't re-litigate)
- End goal **public**; front door **TBD by playtest** (leaning Chronology).
- Persistence guardrail **lifted**: localStorage for meta-state only (streaks,
  played-today, personal bests). Rules stay stateless and seed-derived.
- **Connections** is mode 4, built before the playtest, Stub-native.
- Quiet phase: obscure alias + `noindex`, **no gate**, shares stay URL-less
  (URL-in-share is the launch growth switch, flipped later).
- Winner picked via qualitative interviews ~2 weeks in ("which mode would you miss
  most?"); streak/analytics data as the say/do cross-check.
- Stub handoff verdict: pure reskin, rules-clean (handoff RULEBOOK byte-identical
  to repo's); card art must be **scene-only** assets inside a live typographic
  `StubCard` frame — the three handoff PNGs are style references, not assets.

## Workstream 1 — Instrumentation & quiet-phase plumbing (small, ships first)
1. `src/lib/progress.ts`: per-mode localStorage — streak, played-today (keyed by
   daily seed, not wall clock, so streaks survive timezone quirks), personal best.
   Surfaced in the menu (streak chips) and end screens ("day N · streak M").
2. Vercel Web Analytics via the script-tag route (no npm dep — deps stay locked).
   **USER ACTION: enable Analytics in the Vercel dashboard.**
3. `noindex` meta in index.html. **USER ACTION: quietly buy the domain; point
   nothing at it yet.**
4. Crispness prep (from the stack review): self-host + preload Domine / Inter /
   JetBrains Mono (subset, `font-display: swap`); `env(safe-area-inset-bottom)`
   padding under the hand fan (it overflows into home-indicator territory).

## Workstream 2 — Content engine: 89 → ~300 films, bought as clusters
1. **Grid-generator FIRST**: `sim/connections-gen.ts` — builds 4×4 grids from
   credited films with an **ambiguity gate** (any film fitting two groups rejects
   the grid). Run it on the current 89 to emit the **cluster shopping list**
   (which directors/actors/series need a 4th film).
2. Cluster buy in waves — **89 → ~160 → ~230 → ~300** — every film with FULL
   credits + year; unit of acquisition = a cluster (4–6 films); mix ~85%
   recognizable / 15% deep cuts. Per-wave gates: connectivity check · full verify
   suite · grid-generator yield report (viable unambiguous grids per wave).
3. Guardrails: `duelPool` stays LOCKED at the tuned 89 (growing it invalidates
   difficulty tuning — no retune this build). Chronology consumes the full pool.
   Solo daily moves to the bigger credited pool as ONE conscious pin cutover
   (**USER DECISION: cutover date** — it reshuffles future dailies).
4. **USER ACTION: human date/credits spot-check pass** per wave — the one gate
   Claude can't self-certify. *(→ Amendment 1: now TMDB-assisted arbitration via
   `/tmdb-check`; the gate stays human.)*

## Workstream 3 — The Stub UI port (tokens → primitives → modes)
1. Tokens into Tailwind 4 `@theme` (index.css) — handoff screen 7f is the checksum.
2. Primitives built once in `src/components/`: `StubCard` (one frame, all sizes,
   `reveal={{year, credits, art}}` — Duel/Solo show credits+year, Chronology hides
   both, Connections reveals on solve), `Pill`, `PaperPanel` (diorama), `TicketRow`
   (notched), `AwningStrip`, `BottomSheet`, `RaceBar`.
3. Duel = the six handoff screens (7a–7e), **markup/className changes only** — the
   31-`useState` soup is load-bearing and stays (Surgical Changes). Land as
   sub-steps; the app must still play after each. Manual phone verify required
   (Framer rejects synthetic pointer events).
4. Solo + Chronology re-dressed from the same primitives (recap frame 7d
   generalizes to every end screen). **No scene art this build**: `StubCard`'s
   typographic face is the playtest look; a ~20-card art pilot runs in parallel
   (non-blocking); full 300-card art waits for the front-door winner.

## Workstream 4 — Connections (mode 4, Stub-native from birth)
1. Engine in `src/lib/connections.ts` + date-seeded daily via the shared
   `localDateSeed`; deals only grids passing the ambiguity gate.
2. `sim/connections-verify.ts` (`npm run verify:connections`): 365 seeds solvable +
   unambiguous + distinct · deterministic ×2 · append-only pin — same shape as
   solo-verify.
3. UI from WS3 primitives: 16 `StubCard`s, guess flow, one-away feedback, share
   grid in the family format (`Marquee · Connections`). Menu card + streaks wired.
4. RULEBOOK.md + HowToPlay section in the same pass (guardrail).

## Workstream 5 — Polish, gate sweep, ship, playtest kickoff
1. Surviving Day-5 backlog: first-run onboarding funnel, CPU-final-card warning,
   end-of-game stats.
2. **Fairness call (USER):** recommendation — ship the playtest with the ~7pp
   first-player edge as a documented, gate-pinned house edge; revisit with real
   data rather than burning build days simming variants now.
3. Full gate sweep · deploy · phone-in-hand pass on all four modes · **send the
   link** to the 5–10 circle with a one-line pitch per mode. Interviews at ~2 weeks.

## Sequencing (aggressive; 4 days + buffer)
- **Day 1:** WS1 complete · WS2.1 grid-generator + shopping list · wave 1 buy started.
- **Day 2:** WS3 tokens + primitives + first Duel screens · WS2 waves continue.
- **Day 3:** WS3 Duel finished + Solo/Chrono re-dress · WS2 reaches ~300 · user date pass.
- **Day 4:** WS4 Connections end-to-end · WS5 polish.
- **Day 5 (buffer):** gate sweep · deploy · phone verify · SEND.

## Explicitly deferred (not this build)
Full 300-card scene art (winner's pool only, post-decision) · any fairness rule
change · front-door commitment · backend/leaderboards · board-game track ·
Duel pool growth/retune · URL-in-share (launch switch).

## Risks / watch
- **WS3 traveling-card layer on mobile Safari** (z-30 card over piles, under
  header) — the likeliest schedule-eater; transform/opacity only.
- **WS2 pace**: ~210 new films with full credits in ~2 days is the aggressive
  bet; if it slips, the playtest ships at wave 2 (~230) — repeat-rate math still
  acceptable (~1 repeat film per Chronology hand per month).
- **Connections ambiguity** gets harder as the pool grows — the gate must run on
  every wave, not once.
- **DuelGame.tsx blast radius** — same B-guard as the flow package: verify the app
  plays between every sub-step.

## Amendment 1 (2026-07-05, approved) — TMDB pipeline + pool unification

**Status 2026-07-05 (end of session):** A1 ✅ key in, probe green · A2 ✅
executed (162 audited: 148 clean · 5 fixes applied incl. re-pin-free rebuild ·
9 ours-correct ledgered · attribution live in the rules modal, undeployed) ·
A3 ✅ executed (74 merged → MOVIES=237, gates green, tune byte-identical,
yield 9.86M/≈3.05M strict) · A4 design SIGNED OFF, implementation next
session · A5 plan written · A6 done. Deploy of A2/A3 content = Buri's button.

Inserts between WS2.2 (shipped 2026-07-05: wave-1 merged, MOVIES=163, duelPool
split + pool-pin) and WS3. Absorbs WS2 item 4: the per-wave human date/credits
pass is now TMDB-assisted arbitration via `/tmdb-check` — TMDB is a witness,
not a judge; the gate stays human, litigation shrinks to the flagged diffs.

**Sequencing ruling (Buri, 2026-07-05): wave 2 merges BEFORE unification.**
The proven wave-1 protocol runs unchanged on today's `movies.ts`; unification
then runs once, at 237 films, over all ~116 overlapping ids. (Wave 2 gains
nothing from landing in a canonical pool — it's a credits-only draft, so its
films wouldn't enter the chronology view either way.)

1. **A1 — key gate (USER, ~2 min):** TMDB API Read Access Token into
   `.env.local`, `npm run tmdb:probe` green. A2–A4 are blocked keyless.
2. **A2 — Chronology date audit (the existing 162):** `npm run tmdb:dates` —
   policy-encoded check (US theatrical via `/movie/{id}/release_dates`, types
   2+3 limited+wide, earliest; NEVER TMDB's headline `release_date`) against
   `chronology-pool.json`; report grouped likely-wrong / uncertain / cosmetic
   (`docs/tmdb-date-audit.md`, wave1-diffs style); Buri arbitrates; fixes land
   in `scripts/chronology-seed.ts` → rebuild pool → gates. ⚠ Date fixes
   reshuffle the date-seeded Chronology daily: free pre-public, but the first
   batch ships only on Buri's explicit confirm (verify:chronology re-pin in
   the same pass). **TMDB attribution (logo + required notice, rules/About
   modal placement — Buri-approved) ships in the same deploy** as the first
   applied fixes: that is the first TMDB-derived data in the app.
3. **A3 — wave-2 pass (163→237):** wave-1 protocol — `tmdb:audit` as the
   first-line cross-check + targeted web checks (writers, flagged items) →
   Buri arbitrates NEW question types only (credit conventions locked
   2026-07-05: screenplay-only · performed-for-the-film · recognizability-first
   topCast w/ true billing errors fixed · primary director · id reuse) →
   append-only merge → full gate sweep → `gen:connections` yield vs the
   3,047,293 / ≈755k-strict baseline.
4. **A4 — pool unification (design → Buri sign-off → implement):** `Movie`
   gains optional `releaseDate` under the locked date policy; overlapping ids
   dedupe to one entry per film; `chronology-pool.json` becomes a DERIVED
   artifact (build script filters canonical films that have policy dates
   through the existing era/decade validator). Hard constraints:
   `DUEL_POOL_IDS` byte-identical (Duel/Solo deals untouched by construction) ·
   full gate sweep green, with the derived JSON byte-identical to the post-A2
   pool = provably no reshuffle · content architecture only, zero rule
   changes. Design doc: `docs/pool-unification.md`.
5. **A5 — Stage B plan (162 → 300–500 dated films):** `docs/stage-b-plan.md`
   — human picks era-stratified titles (PER_DECADE_MIN tightens toward 50–80
   per decade), TMDB drafts policy dates into a review file, `/tmdb-check`
   audits, Buri arbitrates, merge. Build a drafting tool only if hand-drafting
   is the measured bottleneck.
6. **A6 — docs/ledger/memory sync:** `docs/tmdb-plan.md` Phase 5 concretized;
   rulings ledger in use; RULEBOOK untouched — nothing player-facing changes
   except the attribution notice.
