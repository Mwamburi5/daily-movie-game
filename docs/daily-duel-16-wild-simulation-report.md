# Daily / Duel 216-film wild-card simulation

**Generated:** 2026-08-25T21:05:56.508Z

**Command:** `node sim/daily-duel-cutover-eval.ts 8000 --seed=200824 --assert --counts=8,16`

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
| 8 | 3.85% | 61.8% [60.7%–62.8%] | 46.0% [44.9%–47.1%] | 38.5% [37.5%–39.6%] | 32.1 | 0.0% | 51.3% | 25.1% | 2.55 | 0.01 | 1.55 | 0.087 | 0 | 0 |
| 16 | 7.41% | 60.3% [59.2%–61.4%] | 48.1% [47.1%–49.2%] | 39.5% [38.5%–40.6%] | 32.1 | 0.0% | 53.3% | 22.5% | 4.91 | 0.01 | 2.26 | 0.329 | 0 | 0 |

## First-player fairness mirror

Forward has the casual player in seat A; mirror swaps the same two agents and
measures the casual player in seat B on the same seeded real-card shuffle.

| Wilds | Matchup | Casual starts | Casual second | Paired delta |
| ---: | --- | --- | --- | --- |
| 8 | matinee | 61.8% [60.7%–62.8%] | 55.6% [54.6%–56.7%] | +6.1pp [4.5–7.8] REAL |
| 8 | feature | 46.0% [44.9%–47.1%] | 41.3% [40.3%–42.4%] | +4.6pp [3.0–6.3] REAL |
| 8 | directors | 38.5% [37.5%–39.6%] | 33.9% [32.9%–34.9%] | +4.6pp [3.1–6.2] REAL |
| 16 | matinee | 60.3% [59.2%–61.4%] | 55.1% [54.0%–56.1%] | +5.2pp [3.6–6.9] REAL |
| 16 | feature | 48.1% [47.1%–49.2%] | 42.9% [41.8%–44.0%] | +5.2pp [3.6–6.9] REAL |
| 16 | directors | 39.5% [38.5%–40.6%] | 34.8% [33.7%–35.8%] | +4.8pp [3.2–6.3] REAL |

## Paired tier gaps

| Wilds | Matinee − Feature | Feature − Director's |
| ---: | --- | --- |
| 8 | +15.8pp [14.4–17.2] REAL | +7.4pp [6.1–8.8] REAL |
| 16 | +12.1pp [10.7–13.6] REAL | +8.6pp [7.3–9.9] REAL |

## Wild-specific flow

| Wilds | Force-kept | Blocks Take/game | Held at end/game | Covering pile/game | Used to go out/game | Wild cards in multi-draws/game |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 8 | 100.0% | 0.000 | 0.990 | 0.010 | 0.018 | 0.176 |
| 16 | 100.0% | 0.000 | 2.637 | 0.016 | 0.027 | 0.666 |

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
10. Vertigo `wild-vertigo` — proposed addition
11. Tokyo Story `wild-tokyo-story` — proposed addition
12. Bicycle Thieves `wild-bicycle-thieves` — proposed addition
13. In the Mood for Love `wild-in-the-mood-for-love` — proposed addition
14. Spirited Away `wild-spirited-away` — proposed addition
15. Metropolis `wild-metropolis` — proposed addition
16. Pather Panchali `wild-pather-panchali` — proposed addition

Titles do not affect these results: wild shells have blank credits and private
genres. Each variant uses the first N identities shown for its tested count.

## Evidence recommendation

Buri directed **16 total wilds** after the initial 8-wild checkpoint. The
evidence recommendation among the tested counts is **16**.
Sixteen's encounter share is 7.41%, compared
with 3.85% at eight and 3.95%
for the live 89-real-plus-3-wild deck. The paired 8-minus-16
player-win differences are Matinee +1.5pp [0.2–2.8] REAL, Feature
-2.2pp [-3.5–-0.9] REAL, and Director's -1.0pp [-2.3–0.3] noise.
The 16-wild result is evidence for the owner-directed mechanic; it does not
silently alter the locked flow rules or authorize runtime cutover.

Maximum compared-count player-win difference: **2.17pp**.
The required 8,000-game follow-up condition is satisfied or not triggered.

Machine-readable per-matchup, mirror, tier-gap, cross-variant, end-reason, and
wild-flow evidence is in `docs/daily-duel-16-wild-simulation-data.json`.
