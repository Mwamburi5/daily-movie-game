# Daily Puzzle / Duel 200-film construction model

**Generated:** 2026-08-25T21:08:58.405Z

**Source:** current `MOVIES`, `DUEL_POOL`, `sharedPeople`, `linkTier`, and `dailySoloPuzzle`

**Runtime data changed:** no

**Overall baseline:** MATCH

## Reproduction

```sh
node scripts/daily-duel-pool-model.ts
```

The model preserves all 89 current IDs. A current credited addition is eligible only
with at least three direct person-linked neighbors in the original 89. At each step
it ranks marginal person edges, visible edges, ordinal canonical tier value
(standard 1 / strong 2 / super 3), original-89 anchors, then title and ID.

## Baseline comparison

| Real pool | Person edges | Density | Visible share | Min / median degree | Components | Daily unique | Films exposed | Top-10 slot share | Baseline |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 89 | 513 | 13.10% | 85.77% | 2 / 11 | 1 | 365/365 | 89/89 | 19.38% | MATCH |
| 150 | 1318 | 11.79% | 77.39% | 5 / 17 | 1 | 365/365 | 150/150 | 13.08% | MATCH |
| 175 | 1557 | 10.23% | 74.89% | 5 / 17 | 1 | 365/365 | 175/175 | 10.72% | MATCH |
| 200 | 1755 | 8.82% | 74.70% | 5 / 16 | 1 | 365/365 | 200/200 | 10.21% | MATCH |

Machine-readable evidence, every board, exact candidate neighbors, concentrations,
and distribution data are in `docs/daily-duel-pool-model-data.json`.

## Approved 216-film slate — metadata and series approved

Buri approved the submitted 216-Keep receipt on 2026-08-25, superseding the
former exact-200 count target. The 216 combines the fallback 200 with the 16
outside cards in `scripts/daily-duel-candidate.ts`. Outside-card credits are
approved under the standing recognizability-first policy. This authoring view
also applies Buri's approved `top-gun` tag to existing `top-gun` and
`avengers` tag to existing `the-avengers`.

| Metric | Selected 216 | Floor | Result |
| --- | ---: | ---: | --- |
| Person edges | 1992 | — | evidence |
| Density | 8.58% | ≥ 8.50% | PASS |
| Visible edge share | 73.19% | ≥ 70.00% | PASS |
| Components / isolates | 1 / 0 | 1 / 0 | PASS |
| Minimum / median degree | 5 / 17 | ≥ 5 / ≥ 16 | PASS |
| Maximum exact-person cards | 15 | ≤ 15 | PASS |
| Daily unique boards | 365/365 | 365/365 | PASS |
| Films exposed | 216/216 | 216/216 | PASS |
| Distinct par values | 6 | ≥ 3 | PASS |

Approved 216 digest: `d9b988232fabddadd2616d4fcc6c1ad604bce1207106b9ac6539784b50a38fdb`

## Exact nested fallback

### Original 89 → proposed 150: add 61

1. Ocean's Thirteen (2007) `oceans-thirteen`
2. Contagion (2011) `contagion`
3. Ocean's Twelve (2004) `oceans-twelve`
4. True Grit (2010) `true-grit`
5. Cloud Atlas (2012) `cloud-atlas`
6. 12 Years a Slave (2013) `12-years-a-slave`
7. 12 Monkeys (1995) `twelve-monkeys`
8. The Avengers (2012) `the-avengers`
9. The Insider (1999) `the-insider`
10. Carlito's Way (1993) `carlitos-way`
11. The Bourne Identity (2002) `the-bourne-identity`
12. Toy Story 4 (2019) `toy-story-4`
13. Sleepless in Seattle (1993) `sleepless-in-seattle`
14. Cars (2006) `cars`
15. One Battle After Another (2025) `one-battle-after-another`
16. The Revenant (2015) `the-revenant`
17. Cast Away (2000) `cast-away`
18. You've Got Mail (1998) `youve-got-mail`
19. F1 (2025) `f1`
20. Dune: Part Two (2024) `dune-part-two`
21. Dune (2021) `dune`
22. Children of Men (2006) `children-of-men`
23. Magnolia (1999) `magnolia`
24. Mission: Impossible — Rogue Nation (2015) `mission-impossible-rogue-nation`
25. Boogie Nights (1997) `boogie-nights`
26. Edge of Tomorrow (2014) `edge-of-tomorrow`
27. Looper (2012) `looper`
28. Armageddon (1998) `armageddon`
29. Days of Thunder (1990) `days-of-thunder`
30. Top Gun (1986) `top-gun`
31. Mission: Impossible — Ghost Protocol (2011) `mission-impossible-ghost-protocol`
32. Jerry Maguire (1996) `jerry-maguire`
33. The Fifth Element (1997) `the-fifth-element`
34. Rain Man (1988) `rain-man`
35. Panic Room (2002) `panic-room`
36. Vice (2018) `vice`
37. Crimson Tide (1995) `crimson-tide`
38. Mystic River (2003) `mystic-river`
39. Apocalypse Now (1979) `apocalypse-now`
40. The Incredibles (2004) `the-incredibles`
41. Steve Jobs (2015) `steve-jobs`
42. The Hateful Eight (2015) `the-hateful-eight`
43. Kill Bill: Vol. 2 (2004) `kill-bill-vol-2`
44. Do the Right Thing (1989) `do-the-right-thing`
45. Malcolm X (1992) `malcolm-x`
46. Crazy, Stupid, Love. (2011) `crazy-stupid-love`
47. The Fugitive (1993) `the-fugitive`
48. Moonrise Kingdom (2012) `moonrise-kingdom`
49. The Grand Budapest Hotel (2014) `the-grand-budapest-hotel`
50. Glass Onion: A Knives Out Mystery (2022) `glass-onion-a-knives-out-mystery`
51. Skyfall (2012) `skyfall`
52. X-Men: First Class (2011) `x-men-first-class`
53. The Force Awakens (2015) `the-force-awakens`
54. Witness (1985) `witness`
55. Indiana Jones and the Last Crusade (1989) `indiana-jones-and-the-last-crusade`
56. Blade Runner (1982) `blade-runner`
57. Knives Out (2019) `knives-out`
58. Selma (2014) `selma`
59. Boyz n the Hood (1991) `boyz-n-the-hood`
60. Enemy of the State (1998) `enemy-of-the-state`
61. The Royal Tenenbaums (2001) `the-royal-tenenbaums`

### Proposed 150 → fallback 175: add 25

1. Bruce Almighty (2003) `bruce-almighty`
2. Star Wars: The Last Jedi (2017) `star-wars-the-last-jedi`
3. The Hobbit: An Unexpected Journey (2012) `the-hobbit-an-unexpected-journey`
4. The Hurt Locker (2009) `the-hurt-locker`
5. Spider-Man: Brand New Day (2026) `spider-man-brand-new-day`
6. Birdman (2014) `birdman`
7. Spotlight (2015) `spotlight`
8. Remember the Titans (2000) `remember-the-titans`
9. Harry Potter and the Goblet of Fire (2005) `harry-potter-and-the-goblet-of-fire`
10. Kill Bill: Vol. 1 (2003) `kill-bill-vol-1`
11. The Goonies (1985) `the-goonies`
12. Step Brothers (2008) `step-brothers`
13. Mickey 17 (2025) `mickey-17`
14. The Italian Job (2003) `the-italian-job`
15. A Beautiful Mind (2001) `a-beautiful-mind`
16. The Rock (1996) `the-rock`
17. Gattaca (1997) `gattaca`
18. Argo (2012) `argo`
19. Gone Girl (2014) `gone-girl`
20. The Matrix Resurrections (2021) `the-matrix-resurrections`
21. Alien (1979) `alien`
22. Steel Magnolias (1989) `steel-magnolias`
23. Ratatouille (2007) `ratatouille`
24. Ali (2001) `ali`
25. Gravity (2013) `gravity`

### Fallback 175 → fallback 200: add 25

1. Miss Congeniality (2000) `miss-congeniality`
2. Ocean's 8 (2018) `oceans-8`
3. Julie & Julia (2009) `julie-and-julia`
4. The Devil Wears Prada (2006) `the-devil-wears-prada`
5. When Harry Met Sally... (1989) `when-harry-met-sally`
6. Sherlock Holmes (2009) `sherlock-holmes`
7. Tombstone (1993) `tombstone`
8. The Doors (1991) `the-doors`
9. Finding Nemo (2003) `finding-nemo`
10. Spider-Man (2002) `spider-man`
11. WALL-E (2008) `wall-e`
12. The Princess Bride (1987) `the-princess-bride`
13. BlacKkKlansman (2018) `blackkklansman`
14. Million Dollar Baby (2004) `million-dollar-baby`
15. Point Break (1991) `point-break`
16. Lost in Translation (2003) `lost-in-translation`
17. Harry Potter and the Prisoner of Azkaban (2004) `harry-potter-and-the-prisoner-of-azkaban`
18. E.T. the Extra-Terrestrial (1982) `e-t-the-extra-terrestrial`
19. Jaws (1975) `jaws`
20. Barbie (2023) `barbie`
21. Batman (1989) `batman`
22. Marty Supreme (2025) `marty-supreme`
23. Donnie Darko (2001) `donnie-darko`
24. Superbad (2007) `superbad`
25. Nightcrawler (2014) `nightcrawler`

## Admission evidence

| Rank | Layer | Film | 89 anchors | Admission edges | Visible | Tier value | Final degree |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 89→150 | Ocean's Thirteen (2007) | 21 | 21 | 20 | 28 | 32 |
| 2 | 89→150 | Contagion (2011) | 17 | 18 | 15 | 20 | 31 |
| 3 | 89→150 | Ocean's Twelve (2004) | 16 | 18 | 16 | 26 | 26 |
| 4 | 89→150 | True Grit (2010) | 15 | 18 | 17 | 24 | 23 |
| 5 | 89→150 | Cloud Atlas (2012) | 16 | 16 | 13 | 22 | 25 |
| 6 | 89→150 | 12 Years a Slave (2013) | 14 | 16 | 10 | 17 | 24 |
| 7 | 89→150 | 12 Monkeys (1995) | 12 | 15 | 13 | 16 | 27 |
| 8 | 89→150 | The Avengers (2012) | 15 | 15 | 8 | 18 | 28 |
| 9 | 89→150 | The Insider (1999) | 12 | 14 | 13 | 17 | 20 |
| 10 | 89→150 | Carlito's Way (1993) | 13 | 15 | 12 | 19 | 21 |
| 11 | 89→150 | The Bourne Identity (2002) | 10 | 14 | 13 | 14 | 16 |
| 12 | 89→150 | Toy Story 4 (2019) | 13 | 14 | 11 | 21 | 23 |
| 13 | 89→150 | Sleepless in Seattle (1993) | 12 | 14 | 11 | 15 | 23 |
| 14 | 89→150 | Cars (2006) | 11 | 14 | 2 | 22 | 28 |
| 15 | 89→150 | One Battle After Another (2025) | 12 | 13 | 13 | 14 | 20 |
| 16 | 89→150 | The Revenant (2015) | 12 | 13 | 13 | 14 | 16 |
| 17 | 89→150 | Cast Away (2000) | 9 | 13 | 12 | 15 | 14 |
| 18 | 89→150 | You've Got Mail (1998) | 9 | 14 | 13 | 16 | 20 |
| 19 | 89→150 | F1 (2025) | 9 | 13 | 12 | 13 | 16 |
| 20 | 89→150 | Dune: Part Two (2024) | 12 | 14 | 9 | 19 | 21 |
| 21 | 89→150 | Dune (2021) | 10 | 14 | 11 | 23 | 23 |
| 22 | 89→150 | Children of Men (2006) | 11 | 13 | 10 | 15 | 20 |
| 23 | 89→150 | Magnolia (1999) | 11 | 13 | 13 | 16 | 24 |
| 24 | 89→150 | Mission: Impossible — Rogue Nation (2015) | 10 | 14 | 10 | 20 | 22 |
| 25 | 89→150 | Boogie Nights (1997) | 9 | 14 | 9 | 19 | 19 |
| 26 | 89→150 | Edge of Tomorrow (2014) | 10 | 13 | 12 | 17 | 23 |
| 27 | 89→150 | Looper (2012) | 10 | 13 | 11 | 13 | 21 |
| 28 | 89→150 | Armageddon (1998) | 11 | 14 | 9 | 15 | 23 |
| 29 | 89→150 | Days of Thunder (1990) | 9 | 13 | 10 | 16 | 21 |
| 30 | 89→150 | Top Gun (1986) | 8 | 14 | 11 | 15 | 24 |
| 31 | 89→150 | Mission: Impossible — Ghost Protocol (2011) | 8 | 14 | 12 | 22 | 20 |
| 32 | 89→150 | Jerry Maguire (1996) | 6 | 13 | 12 | 14 | 17 |
| 33 | 89→150 | The Fifth Element (1997) | 10 | 13 | 7 | 13 | 19 |
| 34 | 89→150 | Rain Man (1988) | 5 | 12 | 12 | 12 | 12 |
| 35 | 89→150 | Panic Room (2002) | 11 | 12 | 11 | 19 | 14 |
| 36 | 89→150 | Vice (2018) | 12 | 12 | 11 | 16 | 17 |
| 37 | 89→150 | Crimson Tide (1995) | 8 | 12 | 10 | 14 | 18 |
| 38 | 89→150 | Mystic River (2003) | 8 | 12 | 10 | 13 | 17 |
| 39 | 89→150 | Apocalypse Now (1979) | 10 | 13 | 6 | 17 | 21 |
| 40 | 89→150 | The Incredibles (2004) | 9 | 12 | 5 | 13 | 16 |
| 41 | 89→150 | Steve Jobs (2015) | 8 | 11 | 9 | 14 | 14 |
| 42 | 89→150 | The Hateful Eight (2015) | 9 | 11 | 8 | 21 | 16 |
| 43 | 89→150 | Kill Bill: Vol. 2 (2004) | 9 | 12 | 7 | 21 | 17 |
| 44 | 89→150 | Do the Right Thing (1989) | 9 | 13 | 1 | 14 | 15 |
| 45 | 89→150 | Malcolm X (1992) | 6 | 12 | 6 | 15 | 17 |
| 46 | 89→150 | Crazy, Stupid, Love. (2011) | 5 | 11 | 8 | 13 | 19 |
| 47 | 89→150 | The Fugitive (1993) | 7 | 12 | 4 | 12 | 16 |
| 48 | 89→150 | Moonrise Kingdom (2012) | 7 | 11 | 7 | 12 | 17 |
| 49 | 89→150 | The Grand Budapest Hotel (2014) | 8 | 12 | 2 | 14 | 24 |
| 50 | 89→150 | Glass Onion: A Knives Out Mystery (2022) | 6 | 12 | 3 | 13 | 20 |
| 51 | 89→150 | Skyfall (2012) | 5 | 11 | 8 | 13 | 14 |
| 52 | 89→150 | X-Men: First Class (2011) | 6 | 11 | 7 | 11 | 11 |
| 53 | 89→150 | The Force Awakens (2015) | 5 | 11 | 5 | 14 | 18 |
| 54 | 89→150 | Witness (1985) | 6 | 12 | 6 | 13 | 15 |
| 55 | 89→150 | Indiana Jones and the Last Crusade (1989) | 8 | 12 | 11 | 18 | 16 |
| 56 | 89→150 | Blade Runner (1982) | 6 | 13 | 12 | 19 | 16 |
| 57 | 89→150 | Knives Out (2019) | 4 | 11 | 5 | 13 | 15 |
| 58 | 89→150 | Selma (2014) | 7 | 12 | 1 | 12 | 14 |
| 59 | 89→150 | Boyz n the Hood (1991) | 5 | 11 | 8 | 12 | 12 |
| 60 | 89→150 | Enemy of the State (1998) | 5 | 11 | 6 | 14 | 14 |
| 61 | 89→150 | The Royal Tenenbaums (2001) | 3 | 11 | 8 | 14 | 13 |
| 62 | 150→175 | Bruce Almighty (2003) | 9 | 11 | 5 | 11 | 12 |
| 63 | 150→175 | Star Wars: The Last Jedi (2017) | 4 | 11 | 4 | 16 | 14 |
| 64 | 150→175 | The Hobbit: An Unexpected Journey (2012) | 8 | 12 | 3 | 19 | 15 |
| 65 | 150→175 | The Hurt Locker (2009) | 5 | 11 | 4 | 11 | 14 |
| 66 | 150→175 | Spider-Man: Brand New Day (2026) | 7 | 11 | 3 | 12 | 14 |
| 67 | 150→175 | Birdman (2014) | 3 | 10 | 6 | 11 | 14 |
| 68 | 150→175 | Spotlight (2015) | 6 | 10 | 8 | 10 | 15 |
| 69 | 150→175 | Remember the Titans (2000) | 6 | 10 | 6 | 10 | 11 |
| 70 | 150→175 | Harry Potter and the Goblet of Fire (2005) | 5 | 10 | 1 | 10 | 11 |
| 71 | 150→175 | Kill Bill: Vol. 1 (2003) | 6 | 9 | 9 | 18 | 11 |
| 72 | 150→175 | The Goonies (1985) | 6 | 9 | 8 | 9 | 9 |
| 73 | 150→175 | Step Brothers (2008) | 4 | 9 | 7 | 11 | 10 |
| 74 | 150→175 | Mickey 17 (2025) | 5 | 9 | 7 | 9 | 9 |
| 75 | 150→175 | The Italian Job (2003) | 3 | 9 | 7 | 9 | 9 |
| 76 | 150→175 | A Beautiful Mind (2001) | 5 | 9 | 6 | 11 | 11 |
| 77 | 150→175 | The Rock (1996) | 4 | 9 | 7 | 10 | 11 |
| 78 | 150→175 | Gattaca (1997) | 3 | 9 | 6 | 10 | 11 |
| 79 | 150→175 | Argo (2012) | 6 | 10 | 6 | 12 | 11 |
| 80 | 150→175 | Gone Girl (2014) | 5 | 9 | 8 | 15 | 10 |
| 81 | 150→175 | The Matrix Resurrections (2021) | 5 | 9 | 5 | 16 | 10 |
| 82 | 150→175 | Alien (1979) | 6 | 9 | 5 | 13 | 12 |
| 83 | 150→175 | Steel Magnolias (1989) | 4 | 9 | 5 | 9 | 9 |
| 84 | 150→175 | Ratatouille (2007) | 3 | 9 | 4 | 11 | 9 |
| 85 | 150→175 | Ali (2001) | 5 | 8 | 8 | 14 | 8 |
| 86 | 150→175 | Gravity (2013) | 3 | 8 | 8 | 9 | 11 |
| 87 | 175→200 | Miss Congeniality (2000) | 6 | 9 | 7 | 9 | 10 |
| 88 | 175→200 | Ocean's 8 (2018) | 5 | 9 | 6 | 9 | 10 |
| 89 | 175→200 | Julie & Julia (2009) | 4 | 8 | 7 | 10 | 10 |
| 90 | 175→200 | The Devil Wears Prada (2006) | 4 | 9 | 8 | 10 | 9 |
| 91 | 175→200 | When Harry Met Sally... (1989) | 3 | 9 | 7 | 15 | 11 |
| 92 | 175→200 | Sherlock Holmes (2009) | 3 | 8 | 7 | 8 | 8 |
| 93 | 175→200 | Tombstone (1993) | 4 | 8 | 6 | 8 | 10 |
| 94 | 175→200 | The Doors (1991) | 3 | 8 | 7 | 10 | 8 |
| 95 | 175→200 | Finding Nemo (2003) | 5 | 8 | 5 | 13 | 10 |
| 96 | 175→200 | Spider-Man (2002) | 4 | 8 | 7 | 12 | 8 |
| 97 | 175→200 | WALL-E (2008) | 4 | 8 | 5 | 15 | 8 |
| 98 | 175→200 | The Princess Bride (1987) | 6 | 8 | 5 | 12 | 8 |
| 99 | 175→200 | BlacKkKlansman (2018) | 3 | 8 | 5 | 11 | 8 |
| 100 | 175→200 | Million Dollar Baby (2004) | 6 | 8 | 5 | 10 | 8 |
| 101 | 175→200 | Point Break (1991) | 5 | 8 | 5 | 9 | 9 |
| 102 | 175→200 | Lost in Translation (2003) | 3 | 8 | 5 | 9 | 8 |
| 103 | 175→200 | Harry Potter and the Prisoner of Azkaban (2004) | 4 | 8 | 3 | 12 | 8 |
| 104 | 175→200 | E.T. the Extra-Terrestrial (1982) | 6 | 7 | 7 | 14 | 9 |
| 105 | 175→200 | Jaws (1975) | 6 | 8 | 8 | 16 | 8 |
| 106 | 175→200 | Barbie (2023) | 4 | 7 | 6 | 8 | 8 |
| 107 | 175→200 | Batman (1989) | 4 | 7 | 6 | 7 | 7 |
| 108 | 175→200 | Marty Supreme (2025) | 3 | 7 | 6 | 7 | 7 |
| 109 | 175→200 | Donnie Darko (2001) | 3 | 7 | 4 | 7 | 9 |
| 110 | 175→200 | Superbad (2007) | 3 | 8 | 2 | 8 | 8 |
| 111 | 175→200 | Nightcrawler (2014) | 4 | 7 | 6 | 7 | 7 |

## Current credited records excluded by the three-anchor gate

These records remain available for breadth review, but the deterministic fallback
does not admit them because they have fewer than three direct original-89 links.

| Film | Year | Original-89 anchors |
| --- | --- | --- |
| A Quiet Place | 2018 | 2 |
| Aliens | 1986 | 2 |
| Avatar | 2009 | 2 |
| Being John Malkovich | 1999 | 2 |
| Chicago | 2002 | 2 |
| Fantastic Mr. Fox | 2009 | 2 |
| Frankenstein (2025) | 2025 | 2 |
| Harry Potter and the Sorcerer's Stone | 2001 | 2 |
| Jumanji | 1995 | 2 |
| La La Land | 2016 | 2 |
| Little Women | 2019 | 2 |
| Men in Black | 1997 | 2 |
| One Flew Over the Cuckoo's Nest | 1975 | 2 |
| Ray | 2004 | 2 |
| Return of the Jedi | 1983 | 2 |
| School of Rock | 2003 | 2 |
| Sideways | 2004 | 2 |
| Snowpiercer | 2014 | 2 |
| Star Wars | 1977 | 2 |
| The Empire Strikes Back | 1980 | 2 |
| The Good, the Bad and the Ugly | 1966 | 2 |
| The Notebook | 2004 | 2 |
| The Shining | 1980 | 2 |
| The Super Mario Galaxy Movie | 2026 | 2 |
| Up | 2009 | 2 |
| American History X | 1998 | 1 |
| Anchorman: The Legend of Ron Burgundy | 2004 | 1 |
| Back to the Future | 1985 | 1 |
| Before Sunrise | 1995 | 1 |
| Escape from New York | 1981 | 1 |
| Full Metal Jacket | 1987 | 1 |
| Gran Torino | 2008 | 1 |
| Grease | 1978 | 1 |
| Harry Potter and the Chamber of Secrets | 2002 | 1 |
| Inside Out | 2015 | 1 |
| Notting Hill | 1999 | 1 |
| Pretty Woman | 1990 | 1 |
| Shaun of the Dead | 2004 | 1 |
| Shrek | 2001 | 1 |
| Superman (David Corenswet) | 2025 | 1 |
| Terminator 2: Judgment Day | 1991 | 1 |
| The Exorcist | 1973 | 1 |
| The Iron Giant | 1999 | 1 |
| The Terminator | 1984 | 1 |
| The Thing | 1982 | 1 |
| Who Framed Roger Rabbit | 1988 | 1 |
| Wicked | 2024 | 1 |
| 2001: A Space Odyssey | 1968 | 0 |
| Amélie | 2001 | 0 |
| Casablanca | 1942 | 0 |
| Crouching Tiger, Hidden Dragon | 2000 | 0 |
| Dr. Strangelove | 1964 | 0 |
| Ex Machina | 2015 | 0 |
| Get Out | 2017 | 0 |
| Godzilla Minus One | 2023 | 0 |
| Halloween | 1978 | 0 |
| Howl's Moving Castle | 2005 | 0 |
| I Am Legend | 2007 | 0 |
| KPop Demon Hunters | 2025 | 0 |
| Lady Bird | 2017 | 0 |
| Love & Basketball | 2000 | 0 |
| Memories of Murder | 2005 | 0 |
| My Neighbor Totoro | 1993 | 0 |
| North by Northwest | 1959 | 0 |
| Oldboy | 2005 | 0 |
| Parasite | 2019 | 0 |
| Past Lives | 2023 | 0 |
| Portrait of a Lady on Fire | 2019 | 0 |
| Princess Mononoke | 1999 | 0 |
| Psycho | 1960 | 0 |
| Rear Window | 1954 | 0 |
| Roma | 2018 | 0 |
| RRR | 2022 | 0 |
| Scream | 1996 | 0 |
| Sinners | 2025 | 0 |
| Slumdog Millionaire | 2008 | 0 |
| Spirited Away | 2002 | 0 |
| The Farewell | 2019 | 0 |
| The Lion King | 1994 | 0 |
| The Wizard of Oz | 1939 | 0 |
| They Live | 1988 | 0 |
| Vertigo | 1958 | 0 |
| Whiplash | 2014 | 0 |
