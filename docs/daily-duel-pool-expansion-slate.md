# Match Cut Daily Puzzle / Duel expansion slate — Checkpoint 1

**Status:** review-only slate and picker; awaiting Buri's completed selection.

**Model result:** exact authoring baseline reproduced from current source.

**Runtime movie/pool sources changed:** no.

**Approval boundary:** no picker state, export, or recommendation is permission to edit
`src/data/`, alter a seed pin, change wilds, tune difficulty, or publish anything.

## Executive call

Keep the proposed 150-card density spine as the stable center of the review. It
preserves all current 89 and lands at one person-link component, minimum degree
five, median degree 17, 77.39% visible person edges, and a maximum exact-person
concentration of 15 cards. Treat cards 151–200 as the competitive tail.

The deterministic 200 is a safe fallback, not the recommended final taste slate.
Fifteen of the 22 requested outside challengers provisionally clear the structural
entry gate. Seven remain visible in the picker but are blocked. The strongest
breadth-plus-graph reconsiderations are *Thelma & Louise*, *Speed*, *Die Hard*,
*Ghostbusters*, and *A Quiet Place Part II*. The highest raw graph additions—
*Top Gun: Maverick*, the Avengers pair, and *Dead Reckoning Part One*—also feed
already dense Action/franchise/star lanes, so their recognizability must earn the
concentration cost rather than letting degree decide automatically.

The picker defaults to the exact 200-film fallback: current 89 + 61-card spine +
50-card tail are Keep; all outside challengers are Maybe. Buri can strike a tail
card and keep a challenger while watching every hard graph floor update live.

## Reproducibility receipt

Run from the repository root:

```sh
node scripts/daily-duel-pool-model.ts
```

Expected terminal result: `daily-duel pool model: MATCH`.

| Real pool | Person edges | Density | Visible share | Min / median degree | Components | Daily unique | Films exposed | Daily top-10 share |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 89 | 513 | 13.10% | 85.77% | 2 / 11 | 1 | 365/365 | 89/89 | 19.38% |
| 150 | 1,318 | 11.79% | 77.39% | 5 / 17 | 1 | 365/365 | 150/150 | 13.08% |
| 175 | 1,557 | 10.23% | 74.89% | 5 / 17 | 1 | 365/365 | 175/175 | 10.72% |
| 200 | 1,755 | 8.82% | 74.70% | 5 / 16 | 1 | 365/365 | 200/200 | 10.21% |

The 200 fallback also has zero isolates, maximum exact-person concentration 15
(Tom Hanks), and a six-value par spread from 7 through 12. Same genre never
counts as adjacency. Series can upgrade a person-connected edge but never creates
one in these figures.

Detailed ranking evidence and every board are in:

- `docs/daily-duel-pool-model-report.md`
- `docs/daily-duel-pool-model-data.json`

## Exact proposed 150-card spine

### Locked current 89 — cards 1–89

1. Goodfellas
2. Casino
3. Taxi Driver
4. The Departed
5. Inception
6. The Dark Knight
7. Interstellar
8. The Martian
9. Pulp Fiction
10. Django Unchained
11. Inglourious Basterds
12. Once Upon a Time in Hollywood
13. Forrest Gump
14. Catch Me If You Can
15. Saving Private Ryan
16. Jurassic Park
17. The Wolf of Wall Street
18. Titanic
19. Fight Club
20. Good Will Hunting
21. The Godfather
22. The Godfather Part II
23. Heat
24. The Irishman
25. Shutter Island
26. The Aviator
27. Gangs of New York
28. Batman Begins
29. The Prestige
30. Se7en
31. The Shawshank Redemption
32. The Green Mile
33. Apollo 13
34. Schindler's List
35. Reservoir Dogs
36. Gladiator
37. American Gangster
38. Toy Story
39. The Dark Knight Rises
40. The Godfather Part III
41. Toy Story 2
42. Raging Bull
43. Scarface
44. The Untouchables
45. Jackie Brown
46. Joker
47. American Hustle
48. The Fighter
49. Training Day
50. Inside Man
51. Philadelphia
52. The Silence of the Lambs
53. No Country for Old Men
54. Fargo
55. The Big Lebowski
56. Ocean's Eleven
57. The Big Short
58. Moneyball
59. The Social Network
60. Zodiac
61. A Few Good Men
62. Lincoln
63. There Will Be Blood
64. Raiders of the Lost Ark
65. Unforgiven
66. The Truman Show
67. Eternal Sunshine of the Spotless Mind
68. The Sixth Sense
69. Memento
70. Dunkirk
71. Oppenheimer
72. The Matrix
73. The Matrix Reloaded
74. The Matrix Revolutions
75. Blade Runner 2049
76. Arrival
77. Sicario
78. Prisoners
79. Collateral
80. Mission: Impossible
81. Mission: Impossible 2
82. Mission: Impossible — Fallout
83. Iron Man
84. Ford v Ferrari
85. The Fellowship of the Ring
86. The Two Towers
87. The Return of the King
88. Monsters, Inc.
89. Toy Story 3

### Density-spine additions — cards 90–150

90. Ocean's Thirteen
91. Contagion
92. Ocean's Twelve
93. True Grit
94. Cloud Atlas
95. 12 Years a Slave
96. 12 Monkeys
97. The Avengers
98. The Insider
99. Carlito's Way
100. The Bourne Identity
101. Toy Story 4
102. Sleepless in Seattle
103. Cars
104. One Battle After Another
105. The Revenant
106. Cast Away
107. You've Got Mail
108. F1
109. Dune: Part Two
110. Dune
111. Children of Men
112. Magnolia
113. Mission: Impossible — Rogue Nation
114. Boogie Nights
115. Edge of Tomorrow
116. Looper
117. Armageddon
118. Days of Thunder
119. Top Gun
120. Mission: Impossible — Ghost Protocol
121. Jerry Maguire
122. The Fifth Element
123. Rain Man
124. Panic Room
125. Vice
126. Crimson Tide
127. Mystic River
128. Apocalypse Now
129. The Incredibles
130. Steve Jobs
131. The Hateful Eight
132. Kill Bill: Vol. 2
133. Do the Right Thing
134. Malcolm X
135. Crazy, Stupid, Love.
136. The Fugitive
137. Moonrise Kingdom
138. The Grand Budapest Hotel
139. Glass Onion: A Knives Out Mystery
140. Skyfall
141. X-Men: First Class
142. The Force Awakens
143. Witness
144. Indiana Jones and the Last Crusade
145. Blade Runner
146. Knives Out
147. Selma
148. Boyz n the Hood
149. Enemy of the State
150. The Royal Tenenbaums

Every added spine card has at least three direct original-89 person neighbors and
at least 11 neighbors in the final fallback. This is the stable graph center; it
is visually teal in the picker and distinct from the purple competitive tail.

## Exact 150→175 fallback layer — cards 151–175

151. Bruce Almighty
152. Star Wars: The Last Jedi
153. The Hobbit: An Unexpected Journey
154. The Hurt Locker
155. Spider-Man: Brand New Day
156. Birdman
157. Spotlight
158. Remember the Titans
159. Harry Potter and the Goblet of Fire
160. Kill Bill: Vol. 1
161. The Goonies
162. Step Brothers
163. Mickey 17
164. The Italian Job
165. A Beautiful Mind
166. The Rock
167. Gattaca
168. Argo
169. Gone Girl
170. The Matrix Resurrections
171. Alien
172. Steel Magnolias
173. Ratatouille
174. Ali
175. Gravity

## Exact 175→200 fallback layer — cards 176–200

176. Miss Congeniality
177. Ocean's 8
178. Julie & Julia
179. The Devil Wears Prada
180. When Harry Met Sally...
181. Sherlock Holmes
182. Tombstone
183. The Doors
184. Finding Nemo
185. Spider-Man
186. WALL-E
187. The Princess Bride
188. BlacKkKlansman
189. Million Dollar Baby
190. Point Break
191. Lost in Translation
192. Harry Potter and the Prisoner of Azkaban
193. E.T. the Extra-Terrestrial
194. Jaws
195. Barbie
196. Batman
197. Marty Supreme
198. Donnie Darko
199. Superbad
200. Nightcrawler

## Outside-challenger lane

All figures below use provisional review-only relation scaffolds. `Spine links`
is person degree / visible degree against the fixed 150. `Fallback degree` is
person degree against the deterministic 200 before a swap. Passing requires at
least 3 / 2 spine links and at least seven fallback links. Series and genre do
not create these counts.

| Film | Year | Local source | Spine links | Fallback degree | Gate | Prior evidence |
|---|---:|---|---:|---:|---|---|
| A Quiet Place Part II | 2021 | dated stub | 8 / 6 | 9 | PASS | pre-Wave-3 stub; not selected as a full card |
| Harry Potter and the Deathly Hallows – Part 2 | 2011 | dated stub | 9 / 3 | 13 | PASS | Stage B KEEP for Chronology |
| Speed | 1994 | dated stub | 8 / 6 | 13 | PASS | Stage B KEEP for Chronology |
| Die Hard | 1988 | dated stub | 9 / 8 | 11 | PASS | Wave 3 H-lane SKIPPED |
| Ghostbusters | 1984 | dated stub | 5 / 2 | 9 | PASS | Wave 3 H-lane SKIPPED |
| Top Gun: Maverick | 2022 | dated stub | 18 / 15 | 23 | PASS | Wave 3 H-lane SKIPPED |
| John Wick | 2014 | dated stub | 7 / 3 | 11 | PASS | Stage B KEEP for Chronology |
| John Wick: Chapter 4 | 2023 | dated stub | 8 / 6 | 10 | PASS | pre-Wave-3 stub; not selected as a full card |
| Mission: Impossible — Dead Reckoning Part One | 2023 | dated stub | 16 / 15 | 16 | PASS | Stage B KEEP for Chronology |
| Avengers: Infinity War | 2018 | dated stub | 16 / 9 | 22 | PASS | Stage B KEEP for Chronology |
| Avengers: Endgame | 2019 | dated stub | 17 / 9 | 23 | PASS | Stage B KEEP for Chronology |
| Guardians of the Galaxy | 2014 | dated stub | 8 / 2 | 8 | PASS | Stage B KEEP for Chronology |
| Guardians of the Galaxy Vol. 3 | 2023 | dated stub | 8 / 1 | 8 | **BLOCKED** | Stage B KEEP; misses visible-link floor |
| Spider-Man: No Way Home | 2021 | dated stub | 11 / 4 | 15 | PASS | pre-Wave-3 stub; not selected as a full card |
| Everything Everywhere All at Once | 2022 | dated stub | 1 / 1 | 1 | **BLOCKED** | pre-Wave-3 stub; breadth exception only |
| Hidden Figures | 2016 | dated stub | 3 / 3 | 4 | **BLOCKED** | Stage B KEEP; misses final-degree floor |
| Thelma & Louise | 1991 | dated stub | 24 / 21 | 26 | PASS | Stage B KEEP for Chronology |
| Clueless | 1995 | entirely new | 0 / 0 | 1 | **BLOCKED** | Wave 3 H-lane SKIPPED |
| Legally Blonde | 2001 | entirely new | 3 / 1 | 4 | **BLOCKED** | Wave 3 H-lane SKIPPED |
| Mean Girls (2004) | 2004 | entirely new | 0 / 0 | 2 | **BLOCKED** | Wave 3 H-lane SKIPPED |
| The Breakfast Club | 1985 | dated stub | 0 / 0 | 0 | **BLOCKED** | Wave 3 H-lane SKIPPED |
| The Batman | 2022 | dated stub | 8 / 2 | 11 | PASS | Wave 3 H-lane SKIPPED |

### Package findings

- Both John Wick cards pass independently.
- Both Avengers cards pass independently, but the package compounds superhero
  and ensemble concentration.
- *Guardians of the Galaxy* passes; *Vol. 3* does not. The package therefore does
  not pass as a package.
- *Top Gun: Maverick* and *A Quiet Place Part II* would require explicit series
  rulings on their existing first-film cards; those proposed series values are
  shown separately and do not inflate the graph.
- *Spider-Man: No Way Home* is the Holland continuity. It must not share the
  Raimi *Spider-Man* series; the provisional tag matches *Brand New Day* only.

### Blocked breadth favorites

The blocked titles remain in the picker because they carry real taste and breadth
questions. Keeping one is not a normal substitution: Buri would be asking for a
lower-density exception or a broader support package. The current hard floors
must not be weakened silently. *Everything Everywhere All at Once*, *Hidden
Figures*, *Clueless*, *Legally Blonde*, *Mean Girls*, and *The Breakfast Club*
are exactly the titles most likely to test whether the graph contract is crowding
out recognizable breadth; the picker makes that tradeoff explicit.

## Interactive Keep / Strike / Maybe picker

Open `tools/daily-duel-pool-picker/index.html` in a browser. The tool is standalone
and works from `file://`; it makes no network calls and exposes no credential.

Features implemented:

- phone and desktop layouts;
- Keep / Strike / Maybe, previous/next, undo, keyboard `K` / `S` / `M` / `U`
  and arrow navigation;
- search, layer/decision/gate filters, multiple sorts, local persistence, and a
  confirmed reset;
- locked-current-89, proposed-150, 150→175, 175→200, and outside badges;
- prior decision evidence, source class, exact identity, provisional metadata
  warnings, package and series notes;
- original-89 / spine-150 / fallback-200 link counts, visible/deep split,
  standard/strong/super tiers, top shared people, exact live neighbors, and
  floor-preserving tail-swap suggestions;
- live count, components, isolates, min/median degree, density, visible share,
  exact-person concentration, decades, genres, series tags, and deep-credit share;
- warnings for count drift, broken graph floors, person count above 15, blocked
  challenger Keeps, and unverified selected metadata;
- Markdown and JSON receipt export, both explicitly marked not approved.

Generated picker data lives at `tools/daily-duel-pool-picker/data.js` and is
rewritten by the model script, so the UI and the evidence share one digest.

## What Buri needs to do

1. Review the teal 150-card spine and purple 50-card tail.
2. Review all 22 outside challengers, including the seven blocked breadth cards.
3. Use Strike/Keep swaps until the live Keep set is exactly 200 and all desired
   judgments are final; clear every Maybe.
4. Export both receipts and explicitly say the selection is complete.

Only then will the goal save the exact selection receipt, run the exact-200 graph
and 365-day audit, prepare selected outside Movie drafts, design the Daily seed
cutover options, and simulate 7/8/9 wilds for Checkpoint 2.
