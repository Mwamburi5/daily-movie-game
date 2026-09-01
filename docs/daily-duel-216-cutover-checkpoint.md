# Daily Puzzle / Duel 216-film Cutover checkpoint

**Status:** approved and locally implemented. The first 216-card Daily is
**2026-09-27**; seeds through 2026-09-26 retain the legacy 89-card pool. The
candidate is stopped at the Release checkpoint pending owner review.

**Approved selection receipt:** 216 Keep · 0 Maybe · 6 Strike

**Real-pool digest:**
`d9b988232fabddadd2616d4fcc6c1ad604bce1207106b9ac6539784b50a38fdb`

**Owner update, 2026-08-25:** Buri said every checkpoint item other than the
proposed added-wild identities looked great, clarified that wild identities
must be all-time amazing films that do not fit the rest of the person-link pool,
then directed eight more additions for **16 total wilds**. The dedicated
8-versus-16 simulation is complete, and Buri approved the exact 16 identities.
On 2026-08-26 Buri approved 2026-09-27 as the exact Daily effective date and
authorized the local implementation pass.

## Recommendation

Proceed with the approved **216 real films** and owner-directed **16 total
wilds**, using a
future-only, date-versioned Daily cutover.

The 216-card pool is healthy without inventing deeper TMDB links. TMDB was used
only to check names, dates, credits, and billing; the graph still uses Match
Cut's canonical exact-person and approved series rules. Hidden Figures is the
only intentional breadth exception among the 16 selected outsiders, at degree
5, and the complete pool still clears every structural and Daily-exposure floor.

Sixteen is now the evidence recommendation among the directly tested 8 and 16
endpoints: it reduces summed target deviation from 9.7 to 8.1 percentage points
by improving Feature and Director's Cut, although Matinee becomes harder. It
also materially increases forced-wild hand pressure, so this is a conscious
mechanic change rather than an identity-only expansion. Every tier remains
below its established player-win target; the post-implementation tuning pass
must adjust existing difficulty knobs without silently changing hand size,
draw count, target score, meld rules, or scoring.

## Final 216 graph and Daily evidence

The model below applies the proposed series tags before computing scoring tiers.
Series tags affect series-continuity scoring, not person-link adjacency.

| Measure | 216 result |
| --- | ---: |
| Person-link edges / density | 1,992 / 8.58% |
| Visible-link share | 73.19% |
| Standard / strong / super edges | 1,507 / 383 / 102 |
| Components / isolates | 1 / 0 |
| Degree min / median / mean / max | 5 / 17 / 18.44 / 41 |
| Maximum exact-person footprint | 15 cards, 6.94% |
| Cards with deep credits | 155, 71.76% |
| Unique Daily boards | 365 / 365 |
| Real films exposed in the year | 216 / 216 |
| Exposure min / median / max | 3 / 13 / 36 |
| Top-10 share of Daily slots | 9.59% |
| Daily par range / distinct values | 7–12 / 6 |

The audited Daily window is 2026-07-06 through 2027-07-05. Its par
distribution is 7: 8, 8: 30, 9: 72, 10: 105, 11: 98, and 12: 52.

## Metadata and series ruling — approved

The 16 authoring-only `Movie` records produced 10 clean TMDB matches and six
top-cast set differences. The joint live-plus-draft name audit found zero likely
name splits across 2,797 credits and 1,421 normalized spellings. All 16 release
dates exactly match their existing Chronology dated stubs.

The six proposed top-cast lists are retained under the standing
recognizability-first policy:

1. **A Quiet Place Part II** — retain Cillian Murphy and Djimon Hounsou rather
   than TMDB's John Krasinski and its different fifth slot.
2. **Top Gun: Maverick** — retain Glen Powell rather than Bashir Salahuddin.
3. **John Wick** — retain Adrianne Palicki and Bridget Moynahan rather than
   Willem Dafoe and Dean Winters.
4. **John Wick: Chapter 4** — retain Hiroyuki Sanada rather than Ian McShane.
5. **Avengers: Infinity War** — retain Scarlett Johansson rather than Josh
   Brolin in the five-name visible list.
6. **Thelma & Louise** — retain Brad Pitt rather than Christopher McDonald.

These are deliberate, recognizable links; no title, year, release-date,
director, or proven billing error was found. TMDB's additional story/character
credits remain informational under the existing screenplay-writer policy.

These series assignments are approved as one batch:

- New cards: `a-quiet-place`, `harry-potter`, `die-hard`, `ghostbusters`,
  `top-gun`, `john-wick`, `mission-impossible`, `avengers`,
  `guardians-of-the-galaxy`, `spider-man-holland`, and `the-batman`, as authored
  in `scripts/daily-duel-candidate.ts`.
- Existing-card continuity fixes: **Top Gun** gets `top-gun`; **The Avengers**
  gets `avengers`.

## Daily cutover policy and date — approved

**Approved: future-only versioning effective 2026-09-27.** Every Daily seed
through 2026-09-26 stays on the legacy 89-card pool. Daily seeds from 2026-09-27
forward use 216, and Duel uses 216 after release. The routing is a pure seed-date
function; no rule-bearing localStorage was introduced.

The alternative is a hard cutover: every historical seed immediately resolves
against 216, reshuffling previously played Daily boards. That is deterministic
but breaks historical replay continuity, so it is not recommended.

The owner supplied the exact first 216-card Daily date: **2026-09-27**.

## Wild recommendation and evidence

The owner-directed 16 endpoint was compared directly with 8 using 8,000 forward
games plus 8,000 seat-swapped mirror games for each of three difficulty
matchups: 48,000 games per count and 96,000 total. Both variants used the same
216 real cards, common seeded deals, blank-credit wild shells, and per-turn
conservation assertions.

| Wilds | Encounter | Matinee target 65% | Feature target 50% | Director's target 41% | Wilds drawn/game | Held at end/game | Multi-wild draws/game |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 8 | 3.85% | 61.8% [60.7–62.8] | 46.0% [44.9–47.1] | 38.5% [37.5–39.6] | 2.55 | 0.990 | 0.087 |
| **16** | **7.41%** | **60.3% [59.2–61.4]** | **48.1% [47.1–49.2]** | **39.5% [38.5–40.6]** | **4.91** | **2.637** | **0.329** |

Compared with 8, sixteen changes player win rate by -1.5pp [-2.8, -0.2] in
Matinee (real), +2.2pp [0.9, 3.5] in Feature (real), and +1.0pp [-0.3, 2.3] in
Director's Cut (noise). Sixteen preserves real tier separation: +12.1pp
Matinee over Feature and +8.6pp Feature over Director's.

The cost is measurable. Relative to 8, sixteen raises average wilds held at the
end from 0.990 to 2.637, multi-wild draws from 0.087 to 0.329 per game, total
cards held from 9.761 to 10.633, and dead turns from 51.3% to 53.3%; draw
connectivity falls from 25.1% to 22.5%. There were still zero stalemates, zero
burned wilds, and zero conservation failures. This pressure will be part of the
post-implementation tuning and direct-play review.

Approved **16 total wild identities**:

1. 12 Angry Men — preserved
2. Casablanca — preserved
3. Citizen Kane — preserved
4. The Wizard of Oz — add
5. 2001: A Space Odyssey — add
6. Psycho — add
7. Seven Samurai — add
8. Singin' in the Rain — add
9. Dr. Strangelove — add
10. Vertigo — add
11. Tokyo Story — add
12. Bicycle Thieves — add
13. In the Mood for Love — add
14. Spirited Away — add
15. Metropolis — add
16. Pather Panchali — add

Wild identities have blank credits, so identity choices do not change the
simulation.

This revised identity lane follows Buri's criterion: every wild is an all-time
film-canon title that does not fit the approved person-link pool as a normal
card. The Wizard of Oz, 2001, Psycho, Dr. Strangelove, Vertigo, and Spirited
Away are credited films with zero exact-person links into the 216; Seven
Samurai, Singin' in the Rain, Tokyo Story, Bicycle Thieves, In the Mood for
Love, Metropolis, and Pather Panchali sit outside the current credited catalog.
The choices are independently
canon-defensible: the [2022 Sight and Sound poll](https://www.bfi.org.uk/news/revealed-results-2022-sight-sound-greatest-films-all-time-poll)
places Vertigo second, Tokyo Story fourth, In the Mood for Love fifth, 2001
sixth, Singin' in the Rain tenth, and Seven Samurai twentieth; individual
entries rank [Pather Panchali thirty-fifth](https://www.bfi.org.uk/film/bfbb9ef1-1b2c-58fd-b030-4f50c4827d91/pather-panchali),
[Bicycle Thieves joint
forty-first](https://www.bfi.org.uk/film/594f7408-2fdd-55a0-a347-79370e42e0ed/bicycle-thieves),
[Metropolis joint sixty-seventh](https://www.bfi.org.uk/film/bda6ff8a-ed7e-5942-980d-c2910c0120ec/metropolis),
and [Spirited Away joint seventy-fifth](https://www.bfi.org.uk/film/f25b5afd-4b55-598b-8bed-f284de120f94/spirited-away).

The approved explicit multi-wild draw behavior is: if a draw of three reveals
multiple wilds, **keep every revealed wild** and burn only the non-wild cards.
The player taps any revealed wild to continue the normal hold/toss/play flow;
that choice does not change the kept set. A hand may therefore grow by more than
one card. This is the direct consequence of the locked “wilds are always kept
and never burned” rule. At sixteen wilds it occurs in about 0.329 draws per game;
the simulation recorded zero burned wilds and zero conservation failures.

## Exact implementation boundary — completed locally

The implementation pass was surgical:

- add the 16 approved full records to `src/data/movies.ts` and graduate their
  unchanged Chronology dated stubs;
- apply the approved series tags and add the exact 216-ID pool plus pure
  legacy/future Daily routing in `src/data/duelPool.ts` and `src/SoloGame.tsx`;
- expand the wild slate in `src/lib/duel.ts` and make `src/DuelGame.tsx` keep all
  wilds on a multi-wild draw;
- rebuild and verify the Chronology pool and 365 Connections grids because the
  global movie catalog grows from 304 to 320;
- update the canonical sim contract, rulebook, live master-plan ledger, direct
  browser coverage, and verification fixtures;
- retune only the existing difficulty controls until the established 65/50/41
  targets are restored, then run the complete local release matrix.

The authoring sim seam in `src/lib/difficulty.ts`, `src/lib/solver.ts`, and
`sim/duel-sim.ts` now evaluates the approved live 216+16 configuration. The
Chronology source stayed byte-identical after rebuilding; Connections was
rebaked for the 320-film credited catalog and passed its exhaustive 14/14 gate.

## Release boundary

Local implementation and verification do not authorize commit, push,
deployment, or indexing. Those actions remain stopped pending a separate owner
approval after review of the Release checkpoint.
