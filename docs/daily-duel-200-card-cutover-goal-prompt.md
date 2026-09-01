# Match Cut 200-card Daily Puzzle + Duel cutover — fresh-session goal prompt

Copy everything inside the block into a fresh Codex `/goal` task.

````text
/goal Design, curate, and—only after my explicit checkpoints—implement Match
Cut's expansion from the frozen 89-film Daily Puzzle/Duel pool to a final
200-real-film pool, then tune an expanded wild-card set. Preserve the existing
89 as the connected spine, use the current 304 credited movies as the safe
fallback, allow outside movies to challenge weaker tail slots, and do not trade
recognizability or creator/era/genre breadth for a same-stars bubble.

Repository:
`/Users/mwamburi/Projects/Daily Movie Game`

## Outcome

Deliver a reviewed, reproducible, locally verified cutover with:

- exactly **200 real Movie cards** shared by Daily Puzzle and Duel;
- all current 89 films retained;
- one canonical person-link connected component, zero isolates, minimum degree
  at least five, and median degree at least 16;
- outside/stub candidates admitted only when they beat a current credited tail
  candidate under the graph, recognizability, breadth, and concentration gates;
- a separately simulated and approved wild-card count, with **8 total wilds as
  the starting hypothesis** and 7/8/9 compared under common-random-number seeds;
- a conscious future-only Daily Puzzle seed cutover or an explicitly approved
  hard re-pin—never a silent reshuffle of already-published dailies;
- Duel difficulty re-measured over at least 4,000 games per matchup and retuned
  only if the paired evidence requires it;
- `RULEBOOK.md`, `sim/RULESET.md`, tests, comments, and the live Ledger updated
  to the final approved contract;
- full local gates green.

This goal contains three human checkpoints. Stop at each one:

1. **Slate checkpoint:** hand me the exact proposed 150-card spine, the
   150→175 and 175→200 fallback layers, and an interactive Keep/Strike/Maybe
   picker containing all outside challengers. Do not edit runtime movie or pool
   sources yet.
2. **Cutover checkpoint:** after I submit the final exact 200, hand me the
   metadata audit, graph/seed impact, proposed Daily effective date, and the
   7/8/9 wild simulation. Do not implement until I approve the exact 200,
   effective-date policy, final wild count/identities, and any new metadata or
   series rulings.
3. **Release checkpoint:** after local implementation and every required gate,
   stop for my review. Do not commit, push, open a PR, merge, deploy, alter
   indexing, or mutate any external account without separate explicit approval.

Continue until the local implementation is complete or a real user ruling is
required. A slow exhaustive verifier is not a blocker; let it finish.

## Meaning of the target

- **200 real films** means 200 fully credited `Movie` records resolved from the
  approved ID list. Wilds are mechanics and are not included in the 200.
- The same approved real-film pool feeds Daily Puzzle and Duel. Keep the current
  `DUEL_POOL_IDS` export/name unless a minimal compatibility alias is genuinely
  clearer; do not perform a broad naming refactor during the cutover.
- Daily Puzzle and Duel pile-play adjacency remains
  `sharedPeople(a, b).length > 0`. Same genre never counts toward graph degree.
- A `series` tag does **not** by itself make a Daily Puzzle or Duel pile play
  legal. It is a separate Duel value: it upgrades a person-connected play to
  super and can form a series meld. Do not inflate person-link metrics with it.
- New full Movie cards may also affect Connections and Chronology. If an outside
  challenger is selected, follow the full content pipeline and surface that
  cross-mode blast radius before implementation. If the final 200 uses only the
  existing 304 credited records, do not rebake or edit other pools needlessly.
- Generated scene artwork is out of scope.

## Read first

Read these sources completely enough to follow their current contracts:

- `AGENTS.md`.
- `docs/master-plan.md`, especially Sections 0, 2, 6, 7, and 9. It is the only
  live build plan; `PLAN.md`, `docs/orchestration-plan.md`, and
  `docs/ui-tasks.md` are history.
- `RULEBOOK.md` and `sim/RULESET.md`.
- `docs/movie-pool-health-report-2026-08-24.md` and
  `docs/movie-pool-health-data-2026-08-24.json`.
- `docs/pool-expansion-wave3-slate.md`, `docs/wave3-report.md`,
  `docs/wave3-diffs.md`, `docs/stage-b-slates.md`,
  `docs/stage-b-arbitration-docket.md`, and `docs/tmdb-rulings.md` so prior
  keeps, skips, strikes, and metadata rulings remain evidence rather than being
  silently erased.
- `src/data/movies.ts`, `src/data/duelPool.ts`, `src/data/types.ts`, and
  `src/data/chronology-pool.json`.
- `src/lib/daily.ts`, `src/lib/solver.ts`, `src/lib/duel.ts`,
  `src/lib/difficulty.ts`, and `src/lib/connections.ts`.
- `src/SoloGame.tsx` and the deal/wild paths in `src/DuelGame.tsx`. Keep edits
  to `DuelGame.tsx` surgical; no state/reducer refactor.
- `sim/solo-verify.ts`, `sim/verify.ts`, `sim/duel-sim.ts`, `sim/eval.ts`,
  `sim/connections-gen.ts`, and `sim/connections-verify.ts`.
- `.agents/skills/tmdb-check/SKILL.md` before any TMDB command. Activate that
  workflow only against a selected outside-candidate draft or when the goal
  reaches its required pre-merge verification step.

## Authoring-time repository state — verify, do not assume

At prompt creation on 2026-08-24:

- Branch: `codex/daily-mode-polish`.
- HEAD: `ce398376d0c03be5356d64000557817c2f0150c3`
  (`Polish first-run onboarding and menu follow-through`).
- Upstream: `origin/codex/daily-mode-polish`.
- Local branch: one commit ahead / zero behind.
- Current source counts: 304 fully credited Movies, 89 frozen Daily/Duel films,
  three wild mechanics, 482 dated Chronology films, and 365 baked Connections
  grids.
- The following are pre-existing untracked user/review artifacts. Preserve them,
  do not stage them broadly, and do not treat their presence as permission to
  commit them:
  - `docs/full-product-code-review-kickoff-prompt.md`
  - `docs/movie-pool-health-data-2026-08-24.json`
  - `docs/movie-pool-health-report-2026-08-24.md`
  - `docs/pool-expansion-goal-prompt.md`
  - `docs/ui-lock-and-movie-pool-health-kickoff-prompt.md`
  - this prompt may also be untracked.

If branch, SHA, upstream relation, counts, pool contents, or working-tree paths
have materially drifted, inspect and explain the drift before proceeding. Never
discard, clean, overwrite, or stage unrelated user work.

## Recorded owner decision

The earlier health audit recommended holding the 89-film pool. Buri explicitly
rejected that recommendation on 2026-08-24 and directed expansion to 150–200
real films plus more wild cards. Treat expansion as the active product goal.
Retain the original audit verdict as historical evidence; do not rewrite it as
though it was never made.

## Reproduce the recommended construction before curating

Create a small dependency-free author-time script, preferably
`scripts/daily-duel-pool-model.ts`, or use a temporary script first and promote
it only if the result is stable and worth retaining. It must:

1. Import `MOVIES`, `DUEL_POOL`, `sharedPeople`, `linkTier`, and
   `dailySoloPuzzle`; never duplicate their logic.
2. Preserve all current 89 IDs.
3. Build deterministic nested 150, 175, and 200-film supersets.
4. Admit a current credited addition to the modeled sequence only if it has at
   least three direct `sharedPeople` neighbors in the original 89.
5. At each step rank by marginal person-linked edges to the selected pool, then
   visible edges, canonical link-tier value, direct original-89 anchors, and a
   deterministic title tie-break.
6. Report edges, person-link density, visible/deep-only split, tiers, min/median/
   mean/max degree, components, low-degree films, top-person concentration, and
   exact neighbors for every candidate.
7. Simulate the fixed Daily Puzzle window 2026-07-06 through 2027-07-05 and
   report all 365 boards, uniqueness, every film's exposure, top-10 slot share,
   and par distribution.
8. Emit machine-readable JSON and a review-friendly Markdown table. Do not
   modify runtime pool sources.

Authoring-time expected results from the read-only model:

| Real pool | Person edges | Density | Min / median degree | Components | Daily top-10 slot share |
|---:|---:|---:|---:|---:|---:|
| 89 | 513 | 13.10% | 2 / 11 | 1 | 19.38% |
| 150 | 1,318 | 11.79% | 5 / 17 | 1 | 13.08% |
| 175 | 1,557 | 10.23% | 5 / 17 | 1 | 10.72% |
| 200 | 1,755 | 8.82% | 5 / 16 | 1 | 10.21% |

The expected 200-film fallback has zero isolates, one component, minimum degree
five, and all 200 films appear in the fixed Daily year. If current source data
does not reproduce these values, stop and report the exact difference before
using the authoring-time lists below.

## Authoring-time nested fallback lists

These are reproducibility baselines, not pre-approved final keeps. Recompute
their metrics from current source before presenting them.

### Current 89 → proposed 150-film density spine: add these 61

1. Ocean's Thirteen
2. Contagion
3. Ocean's Twelve
4. True Grit
5. Cloud Atlas
6. 12 Years a Slave
7. 12 Monkeys
8. The Avengers
9. The Insider
10. Carlito's Way
11. The Bourne Identity
12. Toy Story 4
13. Sleepless in Seattle
14. Cars
15. One Battle After Another
16. The Revenant
17. Cast Away
18. You've Got Mail
19. F1
20. Dune: Part Two
21. Dune
22. Children of Men
23. Magnolia
24. Mission: Impossible — Rogue Nation
25. Boogie Nights
26. Edge of Tomorrow
27. Looper
28. Armageddon
29. Days of Thunder
30. Top Gun
31. Mission: Impossible — Ghost Protocol
32. Jerry Maguire
33. The Fifth Element
34. Rain Man
35. Panic Room
36. Vice
37. Crimson Tide
38. Mystic River
39. Apocalypse Now
40. The Incredibles
41. Steve Jobs
42. The Hateful Eight
43. Kill Bill: Vol. 2
44. Do the Right Thing
45. Malcolm X
46. Crazy, Stupid, Love.
47. The Fugitive
48. Moonrise Kingdom
49. The Grand Budapest Hotel
50. Glass Onion: A Knives Out Mystery
51. Skyfall
52. X-Men: First Class
53. The Force Awakens
54. Witness
55. Indiana Jones and the Last Crusade
56. Blade Runner
57. Knives Out
58. Selma
59. Boyz n the Hood
60. Enemy of the State
61. The Royal Tenenbaums

Expected 150-film graph: 1,318 person edges, 11.79% density, one component,
minimum degree five, median degree 17. Every new card has at least three direct
original-89 links and at least 11 final-pool neighbors.

### Proposed 150 → fallback 175: add these 25

62. Bruce Almighty
63. Star Wars: The Last Jedi
64. The Hobbit: An Unexpected Journey
65. The Hurt Locker
66. Spider-Man: Brand New Day
67. Birdman
68. Spotlight
69. Remember the Titans
70. Harry Potter and the Goblet of Fire
71. Kill Bill: Vol. 1
72. The Goonies
73. Step Brothers
74. Mickey 17
75. The Italian Job
76. A Beautiful Mind
77. The Rock
78. Gattaca
79. Argo
80. Gone Girl
81. The Matrix Resurrections
82. Alien
83. Steel Magnolias
84. Ratatouille
85. Ali
86. Gravity

### Proposed 175 → fallback 200: add these 25

87. Miss Congeniality
88. Ocean's 8
89. Julie & Julia
90. The Devil Wears Prada
91. When Harry Met Sally...
92. Sherlock Holmes
93. Tombstone
94. The Doors
95. Finding Nemo
96. Spider-Man
97. WALL-E
98. The Princess Bride
99. BlacKkKlansman
100. Million Dollar Baby
101. Point Break
102. Lost in Translation
103. Harry Potter and the Prisoner of Azkaban
104. E.T. the Extra-Terrestrial
105. Jaws
106. Barbie
107. Batman
108. Marty Supreme
109. Donnie Darko
110. Superbad
111. Nightcrawler

Expected 200-film fallback graph: 1,755 person edges, 8.82% density, one
component, minimum degree five, median degree 16. The added films have at least
seven final-pool person neighbors.

## Outside-candidate challenger lane

The 304 credited records are enough to reach 200 safely. Outside titles are
therefore **challengers for weaker fallback slots**, not automatic additions
beyond 200. Search the current 190 `DATED_STUBS` first, then research entirely
new titles only where they add a specific person/series/breadth advantage.

Start by revisiting, without assuming approval:

- *A Quiet Place Part II*
- *Harry Potter and the Deathly Hallows – Part 2*
- *Speed*
- *Die Hard*
- *Ghostbusters*
- *Top Gun: Maverick*
- *John Wick* and *John Wick: Chapter 4* as a package
- *Mission: Impossible — Dead Reckoning Part One*
- *Avengers: Infinity War* and *Avengers: Endgame* as a package
- *Guardians of the Galaxy* and *Guardians of the Galaxy Vol. 3* as a package
- *Spider-Man: No Way Home*
- *Everything Everywhere All at Once*
- *Hidden Figures*
- *Thelma & Louise*
- the previously skipped H-lane favorites in
  `docs/pool-expansion-wave3-slate.md`: *Clueless*, *Legally Blonde*,
  *Mean Girls*, *The Breakfast Club*, *Ghostbusters*, *Die Hard*,
  *Top Gun: Maverick*, and *The Batman*.

Previous skip/strike decisions remain evidence. The new request reopens
comparison, not automatic reversal. Flag prior status on every picker card.

An outside candidate may enter the proposed final 200 only after a fully
credited review-only Movie draft proves:

- at least three person-linked neighbors in the proposed 150-film spine;
- at least two visible-credit neighbors;
- at least seven person-linked neighbors in the proposed final 200;
- no reliance on same genre or a series-only edge for those counts;
- at least one clear reason beyond feeding an already dominant star/director:
  recognizability, era/genre/creator breadth, a useful bridge, or a coherent
  package;
- exact title/remake/continuity identity;
- no exact person exceeds 15 cards in the final pool without a separately
  presented owner exception.

Packages do not bypass the gate. Each member must attach to the 150 spine, or
the package must be explicitly labeled as a lower-density breadth exception for
my ruling. Never fabricate deep cast or series tags to make a candidate pass.

## Required review slate and visual picker — Checkpoint 1

Create `docs/daily-duel-pool-expansion-slate.md` and a local interactive picker.
The picker is an authoring tool, not a production screen. Reuse the prior
Keep/Strike/Maybe interaction contract from `docs/pool-expansion-goal-prompt.md`:

- fast phone and desktop review;
- Keep / Strike / Maybe, undo, previous/next, keyboard shortcuts, filters, sort,
  local persistence, reset confirmation, and Markdown + JSON export;
- a locked-current-89 badge, proposed-150 badge, 150→175 fallback badge,
  175→200 fallback badge, or outside-challenger badge;
- prior selection status from Wave 3/Stage B;
- exact title/year, current credited vs dated stub vs entirely new;
- direct links to original 89, links to proposed 150, projected final degree,
  visible/deep-only split, standard/strong/super person-edge tiers, series value
  shown separately, exact neighbor titles, and top shared people;
- projected final count, component count, min/median degree, density, visible
  edge share, concentration, decade/genre/series distribution, and deep-cut
  share updating live;
- a warning when a selection would drop below 200, break the graph floors, push
  a person above 15, or depend on unverified metadata.

The stable 150-film proposal must be visually distinguishable from the 50
competitive tail slots. Do not interpret partial picker state as approval.
Hand me the picker and stop until I explicitly say the selection is complete.

## Selection receipt and exact 200

After I submit the picker:

1. Save the exact Keep/Strike/Maybe export as a selection receipt.
2. Confirm exactly 200 real films, all 89 current IDs present, no duplicate IDs,
   and every ID resolves to one fully credited Movie.
3. Recompute the graph from the exact selection. Required floors:
   - one person-link component;
   - zero isolates;
   - minimum degree at least five;
   - median degree at least 16;
   - person-link density at least 8.5%;
   - visible person edges at least 70% of person-linked edges;
   - no exact person above 15 cards unless I approved the exception.
4. Re-run the fixed 365-day Daily window. Required floors:
   - 365/365 deals generated and solver-winnable;
   - at least 95% unique boards, preferably 365/365;
   - every selected film appears at least once;
   - top-10 film slot share no greater than 12%;
   - par remains within the current formula bounds and has at least three
     distinct values.
5. If any floor fails, do not weaken it silently. Identify the cards causing the
   failure and return to the picker with the smallest swap set.

## Metadata build for selected outside challengers only

If every selected film already exists in `MOVIES`, skip this phase and state
that no credited/Chronology/Connections content change is needed.

For selected outside films only:

1. Create a review-only `scripts/daily-duel-candidate.ts` exporting exactly the
   new full Movie objects.
2. Reuse canonical IDs and dates for graduated `DATED_STUBS`; never duplicate a
   film across `MOVIES` and `DATED_STUBS`.
3. Follow the standing conventions: primary directors, screenplay writers only,
   defensible recognizability-first top cast, real useful deep cast, exact-name
   consistency, single existing genre family, and deliberate continuity-scoped
   series IDs.
4. Activate the `tmdb-check` skill against the draft, run the probe first, run
   live+draft name consistency, filter settled rulings, and present only new
   disagreements for my arbitration. TMDB is evidence, never the curator or an
   auto-writer.
5. Run the locked US-theatrical date workflow for new/changed dates and surface
   festival, premiere, re-release, and streaming-only traps.
6. Stop for every genuinely new metadata, spelling, date, series, or billing
   ruling.

Do not merge candidate objects into runtime sources before the rulings are
resolved and I approve the exact 200.

## Daily Puzzle cutover design

Changing the pool reshuffles deterministic Daily Puzzle boards. Treat this as a
content-version migration, not a routine list edit.

Prepare two options with exact code impact and recommend the safer one:

1. **Recommended: future-only versioned cutover.** Buri chooses an effective
   local-calendar date. Seeds before it continue to resolve against the frozen
   89; seeds on/after it use the approved 200. Keep the routing pure,
   deterministic, and non-persistent. Store no rule-bearing pool state in
   localStorage.
2. **Hard cutover/re-pin.** All seeds immediately resolve against the 200 and the
   append-only pin is consciously replaced. This requires explicit approval of
   the historical reshuffle.

Do not invent the effective date. At Checkpoint 2, ask me to approve the date
and one of the two policies. If versioning is selected, add boundary tests for
day-before, effective date, and day-after; verify time-zone/local-date behavior.

## Wild-card design and simulation

Wild count is a mechanic/tuning change, separate from film selection.

Current baseline:

- 89 real cards + 3 wilds;
- after starter, two seven-card hands, and the second Double Feature pile, the
  draw deck has 73 real + 3 wild = 76;
- wild encounter share in that draw deck is 3/76 = 3.95%.

For 200 real cards, the same setup leaves 184 real draw cards. The proportional
starting hypothesis is 8 wilds: 8/192 = 4.17%. Compare **7, 8, and 9 total
wilds**; do not assume proportion alone proves the correct answer.

Build the smallest sim seam needed to parameterize pool and wild identities
without duplicating React rules. Use common-random-number seeds and run:

```sh
npm run sim -- 4000 --seed=200824
npm run eval -- tune 4000 --seed=200824 --assert
npm run eval -- report 4000 --seed=200824 --assert
```

Adjust the exact CLI only if current scripts prove these arguments differ;
record the actual commands. Use 8,000 games when the measured difference is two
percentage points or less.

For each 7/8/9 variant, compare at minimum:

- Matinee / Feature / Director's Cut player win rate and Wilson CI against the
  established 65 / 50 / 41 targets;
- paired tier gaps and the full-flow first-player fairness mirror;
- turns, end reasons, stalemates, net-score gap, cards held, dead turns, longest
  dead streak, draw connectivity, supers, runs, meld points, and recasts;
- wilds drawn, force-kept, played, used as meld fillers, left covering a pile,
  blocking Take, held at end, and used to go out;
- conservation of every real card and every unique wild ID.

Keep the current rules locked while testing: draw-3, Double Feature, race to 20,
wild transparency, force-keep, ≤1 wild/meld, ≥2 real/meld, zero wild points, and
wild-blocks-take. If the larger pool suggests changing target score, hand size,
draw count, meld floor, or any other rule, stop and request separate approval.
Do not fold a rule change into difficulty tuning.

Recommend one wild count from evidence. The count and the identities are two
decisions: wild Movie shells have blank credits and private genres, so their
titles do not improve person connectivity. A useful identity lane is iconic
low-link favorites, but present the title slate for my choice. Preserve the
current `12 Angry Men`, `Casablanca`, and `Citizen Kane` unless I explicitly
strike one.

Stop at Checkpoint 2 with:

- exact final 200 and selection receipt;
- graph and Daily-window proof;
- every selected outside Movie draft and audit/ruling status;
- recommended effective date/policy;
- 7/8/9 wild comparison and recommended count;
- proposed added wild identities;
- exact source files that implementation would touch.

## Implementation after Checkpoint 2 approval

Make the smallest coherent change.

### Existing-credited-only final 200

- Update the approved real-film ID list in `src/data/duelPool.ts`.
- Implement the approved Daily pool-version routing with pure data/functions.
- Do not edit `MOVIES`, Chronology, or Connections data.

### Final 200 containing outside films

- First merge only approved full Movie entries into `src/data/movies.ts` and
  graduate any selected stubs.
- Rebuild `src/data/chronology-pool.json` only when date membership changed.
- Re-run/rebake Connections only because `MOVIES` changed; update its content
  pins consciously and verify the 365 grids.
- Then update the approved Daily/Duel ID list.

### Wilds and parity

- Update `WILD_TITLES`, `WILD_IDS`, and `WILD_MOVIES` in `src/lib/duel.ts` to the
  approved unique total.
- Keep React and sim consuming the shared arrays; do not create parallel wild
  definitions.
- Update hard-coded pool/wild assertions and stale comments in
  `sim/verify.ts`, `sim/duel-sim.ts`, `src/DuelGame.tsx`, and other exact-count
  sites found by search.
- Update `sim/RULESET.md` and `RULEBOOK.md` because pool setup and wild count are
  player-facing contract changes. Do not change unrelated rules.
- Retune only the minimum difficulty knobs justified by paired 4,000+ game
  evidence. Record before/after results. Do not chase a point estimate whose CI
  already contains the target.

Update `docs/master-plan.md` Ledger with the exact selection receipt, effective
date, pool digest, wild count, tune results, gates, and remaining release gate.

## Required verification

Run the full applicable matrix from the repository root:

```sh
npm run build
npm run check:bundle
npm run check:security
npm run verify
npm run verify:solo
npm run verify:chronology
npm run verify:connections
npm run test:smoke
npm run audit:names
npm run eval -- tune 4000 --seed=200824 --assert
npm run eval -- report 4000 --seed=200824 --assert
git diff --check
```

If no external Movie entries changed, `audit:names`, Chronology, and Connections
should remain structurally unchanged, but still run the standing gates because
the release matrix requires them. If external entries changed, also run every
skill-prescribed TMDB/name/date command and the proper rebuilds before these
gates.

Add or update tests proving:

- exact 200 real IDs, all unique and resolved;
- all original 89 still present;
- approved pool digest/pin;
- exact approved wild total and unique IDs;
- real/wild conservation under full flow;
- Daily version boundary or consciously replaced hard pin;
- 365-day solvability/exposure floors;
- React/sim parity for deal shape and wild behavior;
- browser smoke for a real Duel draw containing a new wild and a Daily board
  containing at least one newly admitted real card, using deterministic test
  seams rather than flaky random waiting.

Do not weaken a gate, raise a bundle budget, remove a pin, or normalize a changed
baseline merely to make the suite green. Diagnose and explain all drift.

## Final local handoff — Checkpoint 3

Provide:

- exact final 200, grouped as original 89 / density-spine additions / selected
  tail / outside challengers;
- Keep/Strike/Maybe receipt and prior-status overrides;
- before/after graph, exposure, decade, genre, series, and person-concentration
  metrics;
- exact Daily effective-date policy and boundary proof;
- selected wild count/identities and 7/8/9 evidence;
- Duel before/after tuning and fairness results with CIs;
- external Movie entries, stub graduations, TMDB/name/date flags, and Buri's
  rulings, if applicable;
- files changed and exact gate results;
- pool and wild digests/pins;
- explicit confirmation of whether Chronology or Connections changed;
- remaining real-device/attended/release risks;
- confirmation that no commit, push, PR, merge, deployment, external mutation,
  or indexing change occurred.

Stop for my review. Do not commit unless I separately authorize the exact staged
candidate, and never push, deploy, or alter indexing without their own approval.
````
