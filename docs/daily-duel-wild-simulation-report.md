# Daily / Duel 216-film wild-card simulation

**Generated:** 2026-08-25T20:36:28.350Z

**Command:** `node sim/daily-duel-cutover-eval.ts 8000 --seed=200824 --assert`

**Pool:** 216 real films · digest `d9b988232fabddadd2616d4fcc6c1ad604bce1207106b9ac6539784b50a38fdb`

**Metadata status:** Buri approved the six policy-covered TMDB cast-list rulings
and the series assignments on 2026-08-25. The sim applies the authoring-only
series overrides `top-gun → top-gun` and `the-avengers → avengers` so
continuity scoring is not omitted before runtime cutover.

Each count uses the same 216 real cards, the same game-index deal/play seeds,
the locked flow rules, unique blank-credit wild shells, and full conservation
assertions. With 216 reals, setup leaves 200 real draw cards before wild insertion.

## Difficulty and flow

| Wilds | Draw-deck encounter | Matinee target 65 | Feature target 50 | Director's target 41 | Avg turns | Stalemate | Dead turns | Draw connects | Wilds drawn/game | Played/game | Melded/game | Multi-wild draws/game | Wilds burned | Conservation failures |
| ---: | ---: | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 7 | 3.38% | 60.9% [59.8%–62.0%] | 45.8% [44.7%–46.9%] | 38.6% [37.5%–39.6%] | 32.2 | 0.0% | 51.0% | 25.5% | 2.25 | 0.01 | 1.42 | 0.066 | 0 | 0 |
| 8 | 3.85% | 61.8% [60.7%–62.8%] | 46.0% [44.9%–47.1%] | 38.5% [37.5%–39.6%] | 32.1 | 0.0% | 51.3% | 25.1% | 2.55 | 0.01 | 1.55 | 0.087 | 0 | 0 |
| 9 | 4.31% | 61.4% [60.3%–62.4%] | 46.4% [45.3%–47.5%] | 38.7% [37.7%–39.8%] | 32.0 | 0.0% | 51.5% | 24.8% | 2.84 | 0.01 | 1.66 | 0.110 | 0 | 0 |

## First-player fairness mirror

Forward has the casual player in seat A; mirror swaps the same two agents and
measures the casual player in seat B on the same seeded real-card shuffle.

| Wilds | Matchup | Casual starts | Casual second | Paired delta |
| ---: | --- | --- | --- | --- |
| 7 | matinee | 60.9% [59.8%–62.0%] | 55.7% [54.6%–56.7%] | +5.2pp [3.6–6.9] REAL |
| 7 | feature | 45.8% [44.7%–46.9%] | 41.4% [40.3%–42.5%] | +4.4pp [2.7–6.0] REAL |
| 7 | directors | 38.6% [37.5%–39.6%] | 33.6% [32.5%–34.6%] | +5.0pp [3.5–6.6] REAL |
| 8 | matinee | 61.8% [60.7%–62.8%] | 55.6% [54.6%–56.7%] | +6.1pp [4.5–7.8] REAL |
| 8 | feature | 46.0% [44.9%–47.1%] | 41.3% [40.3%–42.4%] | +4.6pp [3.0–6.3] REAL |
| 8 | directors | 38.5% [37.5%–39.6%] | 33.9% [32.9%–34.9%] | +4.6pp [3.1–6.2] REAL |
| 9 | matinee | 61.4% [60.3%–62.4%] | 55.8% [54.7%–56.9%] | +5.6pp [4.0–7.2] REAL |
| 9 | feature | 46.4% [45.3%–47.5%] | 41.8% [40.7%–42.9%] | +4.5pp [2.9–6.2] REAL |
| 9 | directors | 38.7% [37.7%–39.8%] | 34.1% [33.0%–35.1%] | +4.7pp [3.1–6.2] REAL |

## Paired tier gaps

| Wilds | Matinee − Feature | Feature − Director's |
| ---: | --- | --- |
| 7 | +15.1pp [13.7–16.5] REAL | +7.2pp [5.9–8.5] REAL |
| 8 | +15.8pp [14.4–17.2] REAL | +7.4pp [6.1–8.8] REAL |
| 9 | +15.0pp [13.6–16.5] REAL | +7.6pp [6.3–8.9] REAL |

## Wild-specific flow

| Wilds | Force-kept | Blocks Take/game | Held at end/game | Covering pile/game | Used to go out/game | Wild cards in multi-draws/game |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 7 | 100.0% | 0.000 | 0.824 | 0.009 | 0.017 | 0.134 |
| 8 | 100.0% | 0.000 | 0.990 | 0.010 | 0.018 | 0.176 |
| 9 | 100.0% | 0.000 | 1.172 | 0.012 | 0.020 | 0.222 |

Every real card and every unique wild ID was checked after every turn when
`--assert` was enabled. A multi-wild draw keeps every revealed wild; none may
enter the burned zone under the locked rule.

## Proposed identity slate

1. 12 Angry Men `wild-12angry` — preserved current wild
2. Casablanca `wild-casablanca` — preserved current wild
3. Citizen Kane `wild-kane` — preserved current wild
4. The Wizard of Oz `wild-wizard-of-oz` — proposed addition
5. 2001: A Space Odyssey `wild-2001` — proposed addition
6. Psycho `wild-psycho` — proposed addition
7. Seven Samurai `wild-seven-samurai` — proposed addition
8. Singin' in the Rain `wild-singin-in-the-rain` — proposed addition
9. Dr. Strangelove `wild-dr-strangelove` — proposed addition

Titles do not affect these results: wild shells have blank credits and private
genres. Each variant uses the first N identities shown for its tested count.

## Evidence recommendation

The evidence recommendation is **8 total wilds**. Nine's
raw summed target deviation is only 0.2pp
better than eight, while every paired 8↔9 matchup difference is statistical
noise. Eight therefore wins on encounter parity and lower forced-wild pressure.

Maximum adjacent-count player-win difference: **0.89pp**.
The required 8,000-game follow-up condition is satisfied or not triggered.

Machine-readable per-matchup, mirror, tier-gap, cross-variant, end-reason, and
wild-flow evidence is in `docs/daily-duel-wild-simulation-data.json`.
