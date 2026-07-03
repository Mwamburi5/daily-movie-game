# Marquee — Flow Package Implementation Plan

**Double Feature + draw-3-keep-1 + race-to-20.** Status: **DRAFT awaiting approval** (2026-06-22).

Contract: [`sim/RULESET.md`](sim/RULESET.md). Hard gate between steps: `npm run verify` = **60/60**.

## Goal
Make the shipped React game match the sim's locked, verified flow package. The sim
already implements all of it behind `Rules{ doubleFeature, draw3, targetScore }`, and
its helpers are unit-tested by `sim/verify.ts`. **So this is mostly RELOCATE + WIRE,
not invent** — the risk is in the 1,300-line component, not the logic.

## Locked decisions

**A — engine / data shape**
1. Shared engine lives in **`src/lib/`** (not a new `duelEngine.ts`). *Refined during Step 1:
   split by layer to avoid a `duel.ts`⇄`difficulty.ts` circular import — pure-engine bits
   (`mostConnectiveTop`, `TARGET_SCORE`) → `duel.ts`; knobs-aware bits (`legalCardsAnyPile`,
   `bestPilePlay`, `pickDraw`) → `difficulty.ts`, beside their single-pile twins. User-confirmed.*
2. Board is **`piles: string[][]`** (array, not `pileA`/`pileB`); `runState`/`cpuRun` gain a `pileIdx`.
3. Draw-3 burned cards stay **INVISIBLE** — no on-board discard. *Deferred choice, logged as D1 in the decisions log; revisit after the draw-3 feel pass.*
4. *(emerged from reading the sim)* Shared helpers take **plain `tops: Movie[]` args, not the sim `State`** — so React (which has no `State` object) can call the exact same functions. Recommended; flagging because it adds churn to the sim/verify call sites. **Confirm this one too.**

**B — sequencing guard** (Surgical Changes / CLAUDE.md): the DuelGame.tsx steps land
as separate sub-steps; **run the app and confirm it still plays after each** — no
big-bang port. Do **not** refactor the 31-`useState` soup while in there.

## Step 0 — Pre-flight (no code change) — ✅ DONE 2026-06-22
- Run `npm run verify` (expect 60/60) and `npm run build` (tsc clean) on the current tree, so any red later is provably ours.
- **Result:** baseline verify **60/60**, build clean (395 modules). Any red from here is ours.

## Step 1 — Shared multi-pile engine in `src/lib/` — ✅ DONE 2026-06-22
**Gate result:** verify **60/60**, build clean, no Vite circular-dep warning. Placement split by
layer (see A1 note): `mostConnectiveTop` + `TARGET_SCORE` → `duel.ts`; `legalCardsAnyPile`,
`bestPilePlay`, `pickDraw` → `difficulty.ts`. `sim/duel-sim.ts` `drawCards` now delegates the
choice to `pickDraw`; `sim/verify.ts` keystone + DF tests re-pointed to plain `tops` (dropped the
dead inline `State`). Blast radius was exactly: duel.ts, difficulty.ts, duel-sim.ts, verify.ts.

Move these out of `sim/duel-sim.ts`, re-signatured from the sim `State` to plain args:
- `legalCardsAnyPile(tops, hand, k)`
- `bestPilePlay(tops, hand, unseen, k, rng) → { card, pileIdx } | null`
- `mostConnectiveTop(tops, unseen) → number`
- `pickDraw(take, tops, k, unseen) → { keep, burn[] }` — the pure draw-3 selection. The sim's `drawCards` stays sim-side but delegates the *choice* to this (it owns the deck/`burned` mutation).
- Add `TARGET_SCORE = 20`.

Re-point callers (logic unchanged, only argument plumbing):
- `sim/duel-sim.ts` — call with `tops(s)`.
- `sim/verify.ts` — lines ~237, 243, 321, 327, 362, 363.

**Gate:** `npm run verify` = 60/60, `npm run build` clean. (If React shares the engine, the sim is now exercising the real shipped code — parity by construction.)

## Step 2 — DuelGame board → two piles — ✅ DONE 2026-06-22
**Verified:** tsc+build clean; in-browser (Director's Cut) the CPU plays onto BOTH marquees with
correct tier scoring, melds + denial-tosses work, 0 console errors; deck seeds to 73 (74−1 lifted
into pile 2); `pileAt` drop-routing maps points to the right pile (off-board → null); player
draw→toss routes a brick via `mostConnectiveTop`. Notes: shrank the `pile` CardSize (152→124w) to
fit two side-by-side + deck on the 420px board (flagged for the feel pass); per-pile super/deep fx
via `fxPile`; player **toss target** = most-connective top (provisional — Step 3 reworks the draw);
hint considers both tops. Framer drag/tap gestures can't be simulated in the preview harness, so
player drag-to-play is verified by construction (unchanged drag plumbing + verified geometry/scoring).
- `pile: string[]` → `piles: string[][]`, seeded `[[starterId], [deckTop]]` (mirror `playGame` lines 560–564).
- `runState` / `cpuRun` gain `pileIdx`; a run stays on the pile it started.
- Two drop-zones + two refs; `topId` / `underlays` become per-pile.
- `playerPlay(id, point)`: route the dropped card to the pile it landed on; validate/score against THAT top.
- CPU effect: swap single-top `pickPlay` for `bestPilePlay(tops, …)`.
- `hintCard` must consider **both** tops.
- **Surgical:** the `pile`→`piles` rename ripples ~15 refs (`topId`, `underlays`, `pileZoneRef`, `say()` lines, CPU effect, hint). Change only those; match existing style.
- **Verify:** run the app — play onto each pile; CPU uses both (sim showed ~49% of plays route to pile 2); melds/runs/tokens still work.

## Step 3 — Draw-3 picker UI — ✅ DONE 2026-06-22
**Verified in-browser:** player draw reveals top 3 (deck −3), tap-one picker overlay with a "CONNECTS"
badge on cards linking to either top; keep 1 → enters existing keep/toss/play (raised), the other 2
burn (deck unchanged after pick) — conservation holds (89). CPU draw via `pickDraw` (deck −3, hand +1).
No `burned` array needed in React: the sim's `unseenFor` already counts burned cards as unseen, so
parity holds by just dropping them from the deck. tsc clean, 0 console errors. New: `drawChoice` state,
`playerPickDraw`, `draw3()` in the CPU effect, picker overlay (real `onClick` buttons).
- `playerDraw`: reveal the top 3 of the deck → player taps 1 to keep → existing keep/toss/play flow on the kept card; the other 2 → `burned` (invisible, per D1).
- CPU draw: `pickDraw(…)` (auto-keep best, burn 2).
- **Verify:** run the app — a draw reveals 3, keeps 1, 2 leave play, deck drops by 3; no card duplicated or lost.

## Step 4 — Race-to-20 end + copy — ✅ DONE 2026-06-22
**Verified in-browser:** drove a Director's Cut CPU to 20 → game ended at exactly CPU 20 (no overrun)
via a score-watching `useEffect` (ends the moment either side hits `TARGET_SCORE`); end screen read
"CPU wins." / "CPU hit 20 — the show goes to the higher net." / "Highest net wins · played − cards
held" with both raw+net rows, winner row highlighted. The racer-loses case uses the same template
(net-driven headline flips to "You win!") so it's clear by construction. HUD shows "show ends at 20".
New: `EndReason 'target'`, race effect, `racerLabel`, rewritten end copy, target HUD hint. tsc+build clean.
**Surfaced (pre-existing, flagged as a task, NOT fixed here):** rapid double-tap of the recast "Allow
it" button double-resolves a CPU play → duplicate card (React key warning). Orthogonal to the flow
package; single-tap play is clean. Needs a re-entry guard.
- After every scoring action (play / meld / lay-off / Final Cut), if either side ≥ `TARGET_SCORE`, end the show; **highest NET still wins**.
- The duel end screen is **inline in DuelGame.tsx** (Results.tsx is the *solo* screen). Rewrite end copy to defuse the "crossed 20 but lost on net" confusion: show raw **and** net, name the winner by net explicitly.
- Scores now land ~18–26/game (was ~60) — re-scale any "good score" framing in the duel HUD.
- **Verify:** run the app — force a 20-pt finish where the racer loses on net; confirm the end screen reads clearly, not confusingly.

## Step 5 — Difficulty retune — ✅ DONE 2026-06-22
**Result (flow package, 5000 games × 2 seeds):** Matinee 64.3/65.3, Feature 48.0/49.1, Director's
39.4/41.0 — all within ~1.5pp of targets 65/50/41. Retuned `KNOBS`: Matinee whiff .55→.44 & meldMiss
.85→.68 (it got *too easy* under Double Feature — random policy + heavy whiff); Feature whiff 0→.05;
Director's whiff 0→.18 (low leverage — it just draws-3 a strong card, so needed a big whiff; left
recast 'full' to keep the contract). Added a fast `eval tune` mode (race-to-20 only, all 3 tiers) for
iteration. **`npm run sim` now runs the flow package by default** (was shipped rules) and its labels say
65/50/41 — that reconciles the stale "target 30". **Gate:** verify 60/60, build clean, `eval package
--assert` conservation held under the flow package.
- `npm run sim --seed=<n>` (paired). Targets: **Matinee down** (~74 → ~65), Feature ~as-is (~50), Director's ~41 (reconcile the stale CLI "target 30" label).
- **Gate:** `npm run eval package <n> --seed=<s> --assert` — React-driving numbers match the sim within CI; asserts confirm conservation.

## Then
- ✅ **RULEBOOK.md** updated — "Coming Next" folded into the live Duel rules + glossary; "What's
  new" changelog; "Last updated" bumped.
- ✅ **sim/RULESET.md** (contract) updated — §8 KNOBS table to the retuned values, §9 reframed
  ("shipped flow package", not port targets), §10 +divergence #4 (React has no `burned` zone).
- ✅ `npm run build` clean.
- ⏳ **Deploy** `npx vercel deploy --prod --yes` — held for user OK (outward-facing; the two-pile
  **layout is functional, flagged for the feel pass** — user may want a local look first).
- Resurface (standing directives): ending-stalemate **feel**; **D1** discard visibility; the
  pre-existing **double-tap "Allow it"** guard (spawned as a task).

## Risks / watch
- **Blast radius** of `pile`→`piles` in the 1,300-line file — mitigated by the B-guard (verify the app between sub-steps).
- **Score-shrink** surprising the HUD / end copy (Step 4).
- **verify.ts re-point** must keep 60/60 — change only arg plumbing, never the logic.
