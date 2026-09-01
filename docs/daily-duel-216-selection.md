# Daily Puzzle / Duel 216-film selection

**Checkpoint:** Selection approved and locally implemented; Release checkpoint

**Submitted receipt:** `/Users/mwamburi/Downloads/matchcut-daily-duel-selection-receipt.md`

**Receipt export:** 2026-08-25T14:04:35.491Z

**Model digest:** `85204248f77b2bea08040127bd2165c4ae00998c3edb153b26d62dae46a9f8c4`

## Buri's decision

Buri submitted a complete picker receipt with 216 Keeps, zero Maybes, and six
Strikes, then explicitly approved going above the prior 200-film target and
selected 216 as the new target. This supersedes the exact-200 count requirement.
On 2026-08-25 Buri then accepted the six policy-covered cast rulings, proposed
series tags, future-only policy, keep-all multi-wild behavior, and the exact
16-wild identity slate. On 2026-08-26 Buri approved **2026-09-27** as the first
216-card Daily date and authorized local implementation. Commit, push,
deployment, and indexing remain outside that approval.

## Selected shape

- 89 locked current cards
- 111 credited fallback additions
- 16 selected outside challengers
- 216 real-film target before wild cards
- 0 unresolved picker decisions

The 16 outside cards remain exported as an audit snapshot in
`scripts/daily-duel-candidate.ts`. Their approved records and series policy are
now mirrored in runtime sources for the date-gated cutover.

## Ruled receipt metrics

| Metric | Selected 216 |
| --- | ---: |
| Person edges | 1,992 |
| Density | 8.58% |
| Visible edge share | 73.19% |
| Components / isolates | 1 / 0 |
| Minimum / median / mean / maximum degree | 5 / 17 / 18.44 / 41 |
| Maximum exact-person card count | 15 |
| Deep-credit card share | 71.76% |

These values use the approved outside-challenger credits and series policy. They
are final graph evidence for the authoring checkpoint, not evidence that runtime
cutover or release occurred.

## Selected outside challengers

1. A Quiet Place Part II (2021)
2. Harry Potter and the Deathly Hallows – Part 2 (2011)
3. Speed (1994)
4. Die Hard (1988)
5. Ghostbusters (1984)
6. Top Gun: Maverick (2022)
7. John Wick (2014)
8. John Wick: Chapter 4 (2023)
9. Mission: Impossible — Dead Reckoning Part One (2023)
10. Avengers: Infinity War (2018)
11. Avengers: Endgame (2019)
12. Guardians of the Galaxy (2014)
13. Spider-Man: No Way Home (2021)
14. Hidden Figures (2016)
15. Thelma & Louise (1991)
16. The Batman (2022)

Hidden Figures was intentionally retained despite failing the provisional entry
floor. It is the sole selected breadth exception and must be called out separately
in the final cutover recommendation.

## Struck outside challengers

1. Guardians of the Galaxy Vol. 3 (2023)
2. Everything Everywhere All at Once (2022)
3. Clueless (1995)
4. Legally Blonde (2001)
5. Mean Girls (2004)
6. The Breakfast Club (1985)

## Cutover decision

- First 216-card Daily: **2026-09-27**.
- Seeds through 2026-09-26 remain on the exact legacy 89-card pool.
- Local implementation stops at the Release checkpoint for review.
