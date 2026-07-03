# Marquee Duel — Canonical Ruleset (sim ↔ React parity contract)

This is the **single source of truth** the React port must match the sim on. It
was derived by reading both implementations side by side:

- Sim agent turn: `sim/duel-sim.ts` → `takeTurn` / `applyPlay` / `playGame`
- React CPU turn: `src/DuelGame.tsx` → the `cpuTurn` effect (lines ~560–736) +
  `resolveCpuPlay` / `playerPlay`

Both files import the **same** rules engine (`src/lib/duel.ts`,
`src/lib/difficulty.ts`, `src/lib/solver.ts`), so the math is shared by
construction. What this document pins is the **turn orchestration** and the
**economy**, plus the places the two intentionally differ.

`sim/verify.ts` (`#3` section) holds the executable parity tests.

---

## 1. Setup

- 89 unique movie cards **+ 3 wild cards** (see `#11`). `deal()` shuffles the 89,
  then: `starter` = 1 card, each side draws 7, the rest form the deck; the 3 wilds
  are then spliced into the **deck** (never the opening piles/hands). So the deck
  holds 73 real + 3 wild = 76 cards.
- Tokens per side: **Final Cut** ×1, **Recast** ×1.
- Cards live in exactly one zone at all times: pile(s) · both hands · deck ·
  banked melds · burned. (Conservation invariant — see `#2`; wilds are conserved
  separately, exactly 3 in play at all times.)

## 2. Scoring economy (shared constants — do not drift)

| Action | Points | Source |
|---|---|---|
| Standard link (1 shared actor) | **+1** | `TIER_POINTS.standard` |
| Strong link (director/writer, or 2 shared people) | **+2** | `TIER_POINTS.strong` |
| Super link (same series, or 3+ shared people) | **+4** + encore | `TIER_POINTS.super` |
| Meld / lay-off — per card, by **rung** (see `#11`) | **+3 / +2 / +1 / +1** | `LADDER_PTS` |
| Final Cut (wild play) | **+1** | — |
| Wild card (play to pile, or as meld filler) | **+0** | — |

Melds score per card by the **meld ladder** ("highest rung wins"): Auteur +3 >
Actor +2 > Series +1 > Genre +1. The rung is **locked at bank time** — lay-offs
onto a banked meld earn its locked per-card rung, and the meld's display name
never flips. (The old flat `MELD_POINTS_PER_CARD = 2` survives only as a
pre-ladder fallback constant.)

**Scoring uses the full `sharedPeople(top, card)` link, never the agent's
`knownShared` view.** Knowledge (deep links / deep melds) gates what an agent will
*attempt*; the points awarded are always what objectively happened.
→ `applyPlay`/`bankMeld` (duel-sim.ts) and `resolveCpuPlay`/`bankMeld` (DuelGame.tsx) match here.

## 3. Link tiers (`linkTier`)

- **super**: same `series`, OR ≥3 shared people.
- **strong**: ≥2 shared people, OR any shared non-actor (director/writer).
- **standard**: exactly one shared actor.

## 4. Canonical turn decision order

The agent (CPU in React; both sides in the sim) resolves a turn in this exact
order. First applicable action wins:

1. **Mid-run?** Only cards chaining through the run's carrier person(s) are
   legal. Play the best such card; if none, the run ends and the turn passes.
2. **Bank a meld** — the highest-VALUE meld the agent can see (`ladderBestMeld`,
   size × rung; includes genre sets and one wild filler), gated by `banksMeld`
   (Matinee may miss it; Feature banks every meld; was lazy pre-2026-06-30).
3. **Whiff?** A casual agent may overlook a legal play and just draw (or pass if
   the deck is empty). Gated by `whiffs(k)`.
4. **Take-to-meld** (rummy): forgo a weak play to lift a pile top that completes a
   meld the hand can't bank alone (banked next turn — no immediate play). Skipped
   if a super (+4 + encore) or a winning Final Cut is on offer, and **blocked when
   a wild covers that pile top** (see `#11`). Gated by the same `banksMeld` knob.
5. **Pile play** (`pickPlay` over legal cards): if the best link scores less
   than a lay-off's locked rung and a lay-off exists, **lay off instead**; else play.
6. **Final Cut to win**: if holding 1 card, Final Cut available, and going out
   now locks a winning net score → play it wild (+1).
7. **Lay off** the cheapest brick that fits an open meld.
8. **Lone-wild go-out**: holding only a wild → play it for +0 and go out.
9. **Draw**: if the drawn card connects, play it (after a Recast check); a drawn
   wild is always kept; otherwise **toss** it onto the most-connective pile
   (denial) or **keep** it, per `cpuTossOrKeep`.
10. **Final Cut dump**: deck empty, no play — slam the worst brick wild (+1).
11. **Stuck-wild shed**: truly stuck (deck empty, no play, no Final Cut) but holding
    a wild → play it for +0 rather than pass.
12. **Pass**. Two passes in a row (deck empty) → stalemate.

## 5. Runs & encores

- A **run** continues the turn: after a play, if the hand still has a card
  chaining through the same person, the agent may play again — up to **3 plays**
  total (`played < 3`).
- A **super link grants an encore**: an unrestricted extra play that *supersedes*
  any run (the run is cleared).
- Mid-run, only same-person chains are legal; melds/lay-offs are not offered.

## 6. Tokens

- **Final Cut** (once): play any card with no connection for +1. Used to go out
  on a winner or dump a dead hand.
- **Recast** (once): cancel an opponent's **super link or Final Cut** before it
  resolves. Policy by tier (`mayRecast`):
  - `never` (Matinee): never recasts.
  - `gameLoss` (Feature, and the simulated casual player): only to stop the
    opponent going out.
  - `full` (Director's Cut): stops a go-out **or** a catch-up super
    (mover'sScore + 4 ≥ defender'sScore).
  - Arg mapping: `mayRecast(defenderKnobs, { playerScore: moverScore,
    cpuScore: defenderScore, ... })`.

## 7. Ending & winner

- **Go out**: a side empties its hand.
- **Stalemate**: deck empty and both sides pass consecutively.
- **Net score** = points played − cards still held. Highest net wins; equal = draw.
  (`playerNet`/`cpuNet` in React; `netA`/`netB` in the sim — identical formula.)

## 8. Difficulty knobs (`KNOBS`)

| Tier | deepLinks | deepMelds | policy | whiff | meldMiss | meldLazy | recast |
|---|---|---|---|---|---|---|---|
| Matinee | no | no | random | .44 | .68 | no | never |
| Feature | yes | no | greedy | .05 | 0 | **no** | gameLoss |
| Director's | yes | yes | greedyDenial | .18 | 0 | no | full |

Tuned for the **full base game** (flow package + the four funpass winners, `#11`) to land the casual
player at ~65 / 50 / 41 % win rate vs Matinee / Feature / Director's (measured 66 / 50 / 42 @ 6000
games, `npm run eval tune`). The winners lifted casual on Feature to ~52.5; **re-tuned 2026-06-30**
by flipping Feature `meldLazy → no` (eager melding) — whiff proved a no-op lever that low. Director's
keeps deep knowledge ("sees everything") but whiffs .18 so a casual can still take ~2 of 5 — the
whiff is execution, not sight.

Simulated casual player (`HUMAN_CASUAL`): greedy, whiff .22, meldMiss .45,
recast gameLoss, no deep knowledge.

---

## 9. Rule VARIANTS — the shipped flow package

The flow package below is now **the shipped React game** (ported 2026-06-22:
`piles: string[][]`, the draw-3 picker, and the race-to-20 end). In the sim these
stay `Rules` flags that default OFF — so `eval`/`verify` can still measure
shipped-vs-flow — but React hardwires all three ON, and `npm run sim` now runs
them by default. All three call the same `src/lib/` helpers React does.

- **Double Feature** (`doubleFeature`): two side-by-side pile tops, seeded by the
  starter + the first deck card. A play may land on **either** top; the agent
  picks the best (card, pile) pair. A run stays on the pile it started.
- **Draw-3-keep-1** (`draw3`): a draw reveals 3, the agent keeps the best 1, and
  **burns the other 2** (out of play — tracked in the `burned` zone).
- **Race to target** (`targetScore`): the game also ends the moment a side
  reaches N played points.
- **Go-out bonus** (`goOutBonus`): bonus points for emptying your hand.
  *(Sim-proven dud — dropped; documented for completeness.)*

LOCKED flow package (per project decision, 2026-06-17): **Double Feature +
draw3 + race-to-20.**

The **four funpass winners** (`#11`) went one step further: they were lifted into
the shared engine and **collapsed to unconditional base game** (2026-06-30) — no
flags at all, they ride in every game. Only `doubleFeature`/`draw3`/`targetScore`/
`goOutBonus`/`marquee` remain as `Rules` toggles, kept as A/B scaffolding for the
gate's differential invariants.

---

## 10. Intentional sim ↔ React divergences (read before porting)

1. **Multi-pile generalization.** The sim's `legalCardsAnyPile` and
   `bestPilePlay` operate over a list of piles. With one pile they reduce
   **exactly** to React's single-`top` calls (`knownLegalPlays(top, …)` and
   `pickPlay(top, …)`). The port adds the multi-pile path for Double Feature;
   under shipped rules the behavior is identical. *(Tested in `#3`.)*

2. **The human is modeled, not ported.** In React the human plays via the UI
   (manual meld selection, keep/toss/play choice, Final Cut arming, Recast
   button). The sim cannot run a UI, so it models the human as a **greedy-casual
   agent** (`HUMAN_CASUAL`) using the same `takeTurn` logic as the CPU. Therefore
   "player win rate" = "win rate of a casual-greedy agent," which is exactly what
   the casual-model sanity check (`#6`) validates. Parity is asserted for the
   **CPU/agent decision logic**, which is the code path literally being ported.

3. **Draw-then-play card flow.** React routes a played-from-draw card
   deck→pile directly (`drew: true` keeps it out of hand). The sim routes it
   deck→hand→pile. End state and conservation are identical; only the internal
   bookkeeping differs.

4. **Burned cards aren't tracked in React.** The sim records draw-3 burns in a
   `burned` zone for its conservation invariant; React just drops the two unkept
   cards from the deck (no on-board discard — decision D1). Parity holds because
   the sim's `unseenFor` already counts burned cards as unseen, so neither side
   reasons about them differently. (`pickDraw` is the shared selection both call.)

5. **Player melds/takes use PURE engine helpers, no knobs.** The CPU's meld and
   take logic is knowledge-gated (`k.deepMelds`); the human reasons over printed
   credits, so the React player uses the pure `bestMeld`/`isValidMeld` (visible
   credits). The sim models the human as `HUMAN_CASUAL` (deepMelds = false), which
   is the same visible-only knowledge — so they agree.

---

## 11. The base-game funpass winners (LOCKED, unconditional)

All four were simmed in isolation, locked, then lifted into `src/lib/` and
collapsed to base game (no flags). React and the sim share the implementation.

- **Meld ladder** ("highest rung wins"). A meld scores per card by the strongest
  through-line ALL its cards share: **Auteur +3** (shared director/writer) >
  **Actor +2** > **Series +1** > **Genre +1**. The rung and the display name are
  **locked at bank time** (no flip as lay-offs arrive); lay-offs earn the locked
  per-card rung. Agents chase the highest-VALUE meld (`ladderBestMeld`, size×rung).
  → `meldRung` / `ladderPtsPerCard` / `meldRungName` (`src/lib/duel.ts`).

- **Genre meld-floor = 3.** `GENRE_FLOOR`+ same-genre cards form a lowest-rung
  (+1/card) meld — a shed-rescue for bricky hands with no person/series link.
  Genre sets take **no** wild filler (a wild's genre is private). Sim'd 3-vs-5,
  LOCKED at 3.

- **Wild cards ×3** (`12 Angry Men`, `Casablanca`, `Citizen Kane`). Blank Movies —
  empty credits, each a unique private genre — spliced into the deck. Behaviors:
  - **Transparent on a pile**: `topForLinking` skips trailing wilds, so the real
    card beneath still links. A wild plays onto any pile for **+0** (universal
    shed/unstick).
  - **Meld filler**: ≤1 wild per meld, ≥2 real cards; the wild scores 0 and
    defines no rung. Never bridges two unrelated cards.
  - **Kept, never burned**: a drawn wild is always kept (a player obviously keeps
    a universal). Conserved: exactly 3 in play at all times.
  - **NEW RULE — wild-blocks-take** (2026-06-30): a wild covering a pile top
    **blocks the take** — you can't lift the (real) linking card buried beneath a
    transparent wild. `takeToMeld` skips wild-topped piles. (Forced by a
    conservation bug the isolated spikes never co-tested; minor and rare.)

- **Take-to-meld** (rummy). On your turn you may **take** a pile's top into hand
  *instead of drawing* — but only to **complete a meld** the hand can't bank alone
  (purposeful take only; no free hoarding — a no-limit variant was rejected). No
  immediate play (banked next turn). Taking the last card of a pile reseeds it
  from the deck top so both Double Feature anchors survive.
  → CPU `cpuTakeTop`/`doCpuTake`; React player `takeTargets`/`doTakePile`; shared
  brain `meldGainFromTake` (`src/lib/difficulty.ts`).

REJECTED (documented so they're not re-tried): take with **no limit** (balloons
game length +42%) and the wild **universal bridge** (non-monotonic difficulty curve).

---

## 12. Measurement methodology (how to read the sim without fooling yourself)

**No balance conclusion under 4000 games.** At 500 games a win-rate's 95% CI is
roughly ±4.4pp — wide enough to manufacture a difficulty regression or a fairness
scare out of pure noise. Both traps have already been walked into:

- The post-collapse `npm run sim 500` read **68/56/42** vs targets 65/50/41 and
  implied Matinee + Feature both drifted; the 4000-game re-read was **65.4/52.5/42.1**
  — only Feature was hot, and the retune touched one knob instead of three.
- The full-flow first-player tilt first read **54.6/41.8** at 500 games (a ~13pp
  gap); at 4000–8000 games it is **~52–53.5 vs ~44–46** (a real but ~7pp gap).

Rules of the road:

1. **≥ 4000 games** per matchup before drawing any balance/fairness conclusion;
   8000 when the effect under study is ≤ 2pp. Smaller runs are for smoke-testing
   only, never for decisions.
2. **Pair with CRN seeds** (same deal stream across variants) and read the paired
   CI, not two independent point estimates.
3. **A CI that contains the target is on-target.** Don't chase point-estimate
   wobble inside the interval.
4. Fairness reads use the **full-flow mirror** (`verify.ts #6`), not the
   single-pile mirror — the shipped game is the flow package.
