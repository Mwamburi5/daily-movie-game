# Review E — content & deal sanity, first public month (2026-09-27 → 2026-10-31)

Read-only review. No repo file was created, edited, or deleted; no git write ops;
no network. Scripts live only in the session scratchpad
(`reviewE.mjs`, `gates.log`, `table.md`).

Repo state reviewed: branch `codex/preview-gate-skip-toolbar` @ `6b758b0`.

---

## 1. Gate outputs (verbatim summary lines)

| Gate | Command | Result |
|---|---|---|
| Solo daily | `npm run verify:solo` | **8 passed, 0 failed** |
| Chronology | `npm run verify:chronology` | **42 passed, 0 failed** |
| Connections | `npm run verify:connections` | **14 passed, 0 failed** |
| Duel sim | `npm run verify` | **64 passed, 0 failed** |
| Types | `npx tsc --noEmit` | exit 0, no output |

Key notes printed by the gates:

```
  SOLO DAILY VERIFY
  365 days from 2026-09-27 (cutover anchor), pool 216 films, hand 7 + 1 starter
  · min 6 · median 10 · max 12
  · histogram: par 6×1  par 7×9  par 8×27  par 9×72  par 10×108  par 11×99  par 12×49
  ✓ legacy pin holds; 2026-09-26 → 89 and 2026-09-27/28 → 216

  CONNECTIONS DAILY VERIFY
  365 days from 2026-07-06 (anchored), pool 320 films, grid 4×4
  · max groups any single card fits, across the year: 1 (must be 1)
  · genre groups per grid: 0×311  1×54
  ✓ baked grid equals the dealer for all 365 days (bake is current)
```

**Boundary confirmed by direct call to `dailyDuelPoolForSeed`:**
`2026-09-26 → 89` (LEGACY_DUEL_POOL), `2026-09-27 → 216`, `2026-09-28 → 216`.
`DAILY_DUEL_POOL_EFFECTIVE_DATE = '2026-09-27'`, compared as a lexical ISO string.

**Local-date implication.** `localDateSeed()` reads `new Date()` in the *player's*
zone (`getFullYear/getMonth/getDate`). So a player in UTC+13 whose local clock
already says 2026-09-27 while London is still on 2026-09-26 gets the **216-card**
board — and a player in UTC-7 still on 2026-09-26 gets the **89-card** legacy
board for another 7 hours. The cutover therefore rolls around the globe over a
~26-hour band rather than flipping at one instant. This is the locked
"same on the same calendar day in your own zone" rule (daily.ts header), and it
is correct as designed — but it means the launch announcement window and the
first-216 board are not simultaneous worldwide. Worth one line in the launch copy.

---

## 2. Per-day table (35 days)

Columns:
- **orders** — total winning orders (Hamiltonian paths from the starter). 1 = the
  player must find the single line.
- **face-vis orders** — winning orders where *every* link is readable off the card
  faces. `StubCard` renders `topCast` (capped by size) + `director[0]` only;
  `deepCast` and `writers` are **never** rendered (StubCard.tsx:171, 177).
  0 here means every winning line requires at least one link the player cannot
  read and must know or guess (an invalid try costs +2 flips).
- **openers (vis)** — legal first plays, and how many are face-readable.

| date | Solo par | sol.len | orders | face-vis orders | openers (vis) | Solo flags | Chrono min-gap | Chrono flags | Conn grid | Conn flags |
|---|---|---|---|---|---|---|---|---|---|---|
| 2026-09-27 | 9 | 8 | 2 | 2 | 3 (3) | — | 245d | — | #83 | `actor:Maggie Smith` is 4× harry-potter |
| 2026-09-28 | 11 | 8 | 2 | 0 | 1 (0) | no face-readable line; OPENER INVISIBLE | 124d | — | #84 | — |
| 2026-09-29 | 9 | 8 | 2 | 0 | 3 (3) | no face-readable line | 14d | coin-flip 14d: Gone Girl / Birdman | #85 | — |
| 2026-09-30 | 10 | 8 | 7 | 0 | 3 (3) | no face-readable line | 44d | — | #86 | — |
| 2026-10-01 | 12 | 8 | 1 | 0 | 1 (0) | single line; no face-readable line; OPENER INVISIBLE | 14d | coin-flip 14d: E.T. the Extra-Terrestrial / Blade Runner | #87 | — |
| 2026-10-02 | 12 | 8 | 2 | 0 | 1 (1) | no face-readable line | 469d | — | #88 | `actor:Daniel Radcliffe` is 4× harry-potter |
| 2026-10-03 | 7 | 8 | 432 | 48 | 5 (4) | — | 294d | — | #89 | — |
| 2026-10-04 | 11 | 8 | 1 | 0 | 1 (0) | single line; no face-readable line; OPENER INVISIBLE | 23d | — | #90 | — |
| 2026-10-05 | 11 | 8 | 3 | 3 | 2 (2) | — | 119d | — | #91 | `actor:Ian McKellen` all dir. Peter Jackson |
| 2026-10-06 | 11 | 8 | 6 | 0 | 2 (2) | no face-readable line | 343d | — | #92 | — |
| 2026-10-07 | 11 | 8 | 4 | 0 | 2 (1) | no face-readable line | 5d | coin-flip 5d: Wicked / Moana 2 | #93 | `actor:Robbie Coltrane` is 4× harry-potter |
| 2026-10-08 | 9 | 8 | 6 | 0 | 1 (1) | no face-readable line | 244d | — | #94 | — |
| 2026-10-09 | 10 | 8 | 1 | 1 | 2 (2) | single line | 49d | — | #95 | — |
| 2026-10-10 | 10 | 8 | 24 | 0 | 3 (1) | no face-readable line | 63d | — | #96 | — |
| 2026-10-11 | 9 | 8 | 12 | 0 | 2 (1) | no face-readable line | 336d | — | #97 | — |
| 2026-10-12 | 10 | 8 | 2 | 0 | 3 (3) | no face-readable line | 301d | — | #98 | — |
| 2026-10-13 | 8 | 8 | 276 | 96 | 2 (1) | — | 91d | — | #99 | — |
| 2026-10-14 | 10 | 8 | 2 | 2 | 2 (2) | — | 9d | coin-flip 9d: Terminator 2: Judgment Day / Boyz n the Hood | #100 | — |
| 2026-10-15 | 10 | 8 | 4 | 0 | 3 (2) | no face-readable line | 26d | — | #101 | — |
| 2026-10-16 | 12 | 8 | 1 | 0 | 1 (1) | single line; no face-readable line | 196d | — | #102 | — |
| 2026-10-17 | 11 | 8 | 7 | 0 | 1 (1) | no face-readable line | 14d | coin-flip 14d: Jojo Rabbit / The Irishman | #103 | — |
| 2026-10-18 | 12 | 8 | 1 | 1 | 1 (1) | single line | 343d | — | #104 | — |
| 2026-10-19 | 9 | 8 | 8 | 8 | 4 (4) | — | 161d | — | #105 | `actor:Daniel Radcliffe` is 4× harry-potter |
| 2026-10-20 | 11 | 8 | 1 | 0 | 2 (2) | single line; no face-readable line | 7d | coin-flip 7d: Gangs of New York / Chicago | #106 | `actor:Alan Rickman` is 4× harry-potter |
| 2026-10-21 | 11 | 8 | 2 | 0 | 1 (1) | no face-readable line | 217d | — | #107 | — |
| 2026-10-22 | 11 | 8 | 2 | 0 | 3 (2) | no face-readable line | 406d | — | #108 | — |
| 2026-10-23 | 11 | 8 | 4 | 0 | 1 (1) | no face-readable line | 133d | — | #109 | — |
| 2026-10-24 | 8 | 8 | 24 | 0 | 2 (1) | no face-readable line | 170d | — | #110 | — |
| 2026-10-25 | 10 | 8 | 2 | 2 | 5 (5) | — | 413d | — | #111 | — |
| 2026-10-26 | 11 | 8 | 2 | 0 | 1 (1) | no face-readable line | 397d | — | #112 | — |
| 2026-10-27 | 11 | 8 | 2 | 0 | 1 (1) | no face-readable line | 196d | — | #113 | — |
| 2026-10-28 | 10 | 8 | 1 | 0 | 2 (1) | single line; no face-readable line | 331d | — | #114 | — |
| 2026-10-29 | 11 | 8 | 4 | 0 | 2 (1) | no face-readable line | 0d | **EXACT-DATE TIE** Gladiator II / Wicked | #115 | `actor:Carrie Fisher` is 4× star-wars; `actor:Michael Caine` all dir. Christopher Nolan |
| 2026-10-30 | 11 | 8 | 1 | 0 | 2 (1) | single line; no face-readable line | 268d | — | #116 | — |
| 2026-10-31 | 9 | 8 | 4 | 4 | 2 (2) | — | 303d | — | #117 | — |
Aggregates over the 35 days:

- Solo: **35/35 solvable**, solution length 8/8 every day, `isSolvable` and
  `bestLine` agree, no malformed deal.
- Par in window: min 7 · median 11 · max 12 (formula bounds [6–12]). Combo
  histogram 0×4, 1×14, 2×8, 3×6, 4×2, 5×1.
- Chronology: 35/35 deal 1 anchor + 10 hand, all unique, all in-pool, every
  `releaseDate` well-formed and `year`/`decade` self-consistent.
- Connections: 35/35 grids exist, 4 groups × 4 films, 16 distinct films, no film
  fits two of its own grid's groups (independently rechecked with my own
  sits/fits), ≤1 genre group, **no grid index repeats in the window** (offsets
  83–117, all distinct).

---

## 3. Findings, ranked

### P0 — a day is broken / unsolvable / missing
**None.** Every one of the 35 days deals, is solvable, and has a grid.

### P1 — a day is unfair in a way the rules promise it isn't

**P1-1 · 2026-10-29 Chronology is a genuine coin flip, and the game tells the
player a falsehood about it.**
The deal contains **Gladiator II** and **Wicked**, both `releaseDate` = `2024-11-22`.
Gladiator II is the **anchor** (its year 2024 is visible on the line); Wicked is in
the hand with its year hidden. There is no date to reason from — `compareCards`
falls through to the `a.id < b.id` tiebreak (chronology.ts), so `gladiator-ii`
sorts before `wicked` purely alphabetically. The player has exactly 0 bits of
information and a 50% forced misfire.

Worse, on a miss `ChronologyGame.tsx:352` says
`actually 2024 — same year, decided by exact date`, and RULEBOOK.md line ~276 says
*"Same-year films still have exactly one right slot, because the game knows the
full release dates behind the scenes."* Both are false here: the dates are
identical and the id decided it. This is the only message the player gets, and it
is misleading on the one day it matters.

Scope: I swept all 365 days from the cutover. Exactly **4 days (1.1%)** deal an
exact-date pair, and one of them lands in the first five weeks:

| day | tied pair | date |
|---|---|---|
| **2026-10-29** | Gladiator II / Wicked | 2024-11-22 |
| 2026-12-09 | Blade Runner / The Thing | 1982-06-25 |
| 2027-04-20 | Black Panther: Wakanda Forever / The Fabelmans | 2022-11-11 |
| 2027-06-23 | Being John Malkovich / Princess Mononoke | 1999-10-29 |

The pool holds **25 exact-date collision pairs** across 482 films (full list in
§7). None of this is a seed problem — it is a *copy and messaging* problem plus a
content-policy question. **I am not proposing a rule, seed, or pool change.**
Cheapest honest fix is a message branch: when the two neighbours share an exact
`releaseDate`, say so ("same day — this one's a tiebreak, take the stroke") rather
than claiming a date decided it. That is one string and one comparison in
`ChronologyGame.tsx`, no rule change, no re-tune. RULEBOOK's same-year paragraph
would need the matching sentence.

### P2 — a day is much harder than the tuning implies

**P2-1 · 26 of 35 Solo dailies have NO fully face-readable winning line.**
On those days every winning order routes through at least one link that exists
only in `deepCast`, `writers`, or a non-first `director` — none of which the card
face renders. A player who reads the cards cannot deduce the line; they must know
the credit or buy the information at +2 flips per wrong try. Par grants exactly
4 slack = 2 wrong tries.

The three worst days are the ones where even the **only legal opening play is
invisible**:

| day | par | winning orders | legal openers | face-readable openers | the forced first link |
|---|---|---|---|---|---|
| 2026-09-28 | 11 | 2 | 1 | **0** | The Dark Knight → Shawshank via **Morgan Freeman (deepCast)** |
| 2026-10-01 | 12 | **1** | 1 | **0** | A Few Good Men → Steve Jobs via **Aaron Sorkin (writer — never on the face)** |
| 2026-10-04 | 11 | **1** | 1 | **0** | Enemy of the State → The Italian Job via **Seth Green (deepCast)** |

2026-10-04 is the hardest board in the window: one winning order, 2 face-visible
board edges against 6 invisible ones, and 5 of the 7 links on the forced line are
hidden (Seth Green, Edward Norton-deep, Willem Dafoe-deep, Mark Fergus + Hawk Ostby
as writers, Chiwetel Ejiofor-deep). A card-reading player expects ~3 wrong tries
just to open — already over the 2-try par budget before the puzzle starts.

Note the second public day, **2026-09-28**, is one of these three. Day one
(2026-09-27) is by contrast excellent — 11 visible edges, 0 invisible, 3 visible
openers, and a legible Tom Cruise → MI → Jerry Maguire → A Few Good Men →
Batman → Spotlight → Birdman → The Revenant chain. Good launch board; the day
after is a cliff.

8 of 35 days (23%) have exactly one winning order: 10-01, 10-04, 10-09, 10-16,
10-18, 10-20, 10-28, 10-30.

This is **not a bug** — deep cuts are a designed mechanic (RULEBOOK "Deep cuts",
the DEEP CUT stamp, and `+N DEEPER CREDITS` on the raised face all announce that
a card carries hidden credits). It *is* a tuning fact the 216-card cutover changed
and that `verify:solo` does not measure: the gate proves solvability and par
bounds, never *findability*. Flagging as expectation-setting for launch, not as
something to fix by re-seeding.

**P2-2 · Par variance in the window is cosmetic, not a difficulty signal.**
Worth stating because "par outlier" is the obvious thing to look for and it is a
red herring here. `par = 8 + 4 − bestCombo` and a perfect line scores
`8 − bestCombo`, so **par is always exactly 4 strokes above optimal play** on
every day. The 7→12 spread just tracks combo richness. There are no par outliers
to re-seed; window min 7, max 12 both sit inside the formula bounds [6–12], and
the 365-day gate reports min 6 / median 10 / max 12.

**P2-3 · Launch-day Connections group reads as a franchise, not as its label.**
2026-09-27 grid #83 has `actor: Maggie Smith` = Chamber of Secrets, Goblet of
Fire, Prisoner of Azkaban, Sorcerer's Stone — i.e. four Harry Potter films.
Players will sort it instantly as "the Harry Potter ones" and the reveal will say
"Maggie Smith", which lands as a shrug rather than an aha. The ambiguity gate
correctly passes it (no `series:harry-potter` key is in that grid, so no film fits
two groups), but the gate cannot see this class.

Six such groups fall in the window — five Harry Potter, one Star Wars:

| day | group | actually |
|---|---|---|
| **2026-09-27** | `actor:Maggie Smith` | 4× harry-potter |
| 2026-10-02 | `actor:Daniel Radcliffe` | 4× harry-potter |
| 2026-10-07 | `actor:Robbie Coltrane` | 4× harry-potter |
| 2026-10-19 | `actor:Daniel Radcliffe` | 4× harry-potter |
| 2026-10-20 | `actor:Alan Rickman` | 4× harry-potter |
| 2026-10-29 | `actor:Carrie Fisher` | 4× star-wars |

Plus two "actor group is secretly a director group": 2026-10-05
`actor:Ian McKellen` = 4 Peter Jackson films; 2026-10-29 `actor:Michael Caine` =
4 Nolan films. Across the full 365-day bake this class hits **47 groups**.

**P2-4 · Two 2026 titles in the Chronology pool carry forward-looking dates.**
`the-super-mario-galaxy-movie` (2026-04-01) and `spider-man-brand-new-day`
(2026-07-31) both resolve *before* the 09-27 launch, so nothing in this window
asks a player to place an unreleased film — good. But both are dated close enough
to the present that an announced-date slip would silently make a daily's answer
wrong. Both are dealt inside the window: Spider-Man: Brand New Day on 2026-10-16,
Super Mario Galaxy on 2026-10-20. These are the two dates most worth a human
re-confirmation before launch (see §6 quick wins; no TMDB call was made here).

### P3 — cosmetic

- **P3-1 · Back-to-back Connections category repeats.** `actor:Michael Keaton`
  is a group on **both 2026-09-27 and 2026-09-28** — the first two public days.
  Also `director:Pete Docter` on 10-11/10-12 and `actor:John Ratzenberger` on
  10-16/10-17. Nothing is broken; it just reads as thin content on launch week.
  Repeat counts in-window: Daniel Day-Lewis ×4, Pete Docter ×4, Michael Keaton ×3,
  Julianne Moore ×3, James Earl Jones ×3, Jon Voight ×3, Christopher Nolan ×3.
- **P3-2 · Harry Potter over-representation in the Connections bake.**
  Goblet of Fire appears in **9 of the 35** grids, Prisoner of Azkaban in 8,
  Deathly Hallows Pt 2 in 7, Sorcerer's Stone in 6, Chamber of Secrets in 5.
  144 of the 238 distinct films used in the window appear more than once.
- **P3-3 · Cross-mode film collisions** (cosmetic; the three modes are independent
  games). 25 of 35 days share at least one film across two modes. The loudest is
  **2026-10-12**, where `the-dark-knight-rises` appears in Solo, Chronology *and*
  Connections on the same day; `the-dark-knight` is in both Solo and Chronology
  that day too. No day has the Solo starter also serving as the Chronology anchor.
- **P3-4 · Solo film repetition within the month.** `the-dark-knight` appears on
  6 of the 35 boards; `the-dark-knight-rises`, `inception`,
  `spider-man-no-way-home`, `iron-man` and `collateral` on 5 each. Twelve films
  appear on two *consecutive* days (gattaca 10-10/10-11, dunkirk 10-12/10-13,
  vice 10-13/10-14, true-grit 10-22/10-23, …). Expected: 35 days × 8 cards = 280
  draws from a 216-card pool. Only one starter repeats: `batman` on 10-05 and
  10-18, thirteen days apart.
- **P3-5 · Chronology film repetition.** 82 films repeat within the month; the
  most frequent (Amélie, Edward Scissorhands, Chicago, Beverly Hills Cop) appear
  4× each. 385 draws from a 482-card pool, so expected.
- **P3-6 · Dash style is inconsistent across titles.** The Mission: Impossible
  titles use an em dash (`Mission: Impossible — Fallout`) while
  `Harry Potter and the Deathly Hallows – Part 2` and
  `Star Wars: Episode I – The Phantom Menace` use an en dash. Both are deliberate
  Unicode, not mojibake, but they are two different characters for the same job.
  Cosmetic only — ids are ASCII, and nothing matches on the title string.
- **P3-7 · Near-coin-flip Chronology days.** Six days beyond the P1 have a pair
  within 14 days of each other, i.e. the placement is effectively a guess even
  for a well-informed player: 09-29 (Gone Girl / Birdman, 14d), 10-01 (E.T. /
  Blade Runner, 14d), 10-07 (Wicked / Moana 2, 5d), 10-14 (T2 / Boyz n the Hood,
  9d), 10-17 (Jojo Rabbit / The Irishman, 14d), 10-20 (Gangs of New York /
  Chicago, 7d). These are *fine* — the tight-call mercy shield exists exactly for
  this, and the "same year, decided by exact date" message is truthful here. Noted
  so they aren't mistaken for the P1.

---

## 4. Connections bake horizon

```
anchor : 2026-07-06   (day 0)
grids  : 365          (offsets 0..364)
pool   : 320 films
```

- Last **pinned** day: **2027-07-05** (offset 364).
- The launch window uses offsets **83–117** — comfortably inside, 247 days of
  headroom past 2026-10-31.
- From **2027-07-06** onward `dailyConnectionsGrid` wraps modulo 365, so
  2027-07-06 silently re-serves grid #0 (= the 2026-07-06 board) and the year
  repeats forever. That is documented and intentional
  (`connectionsGrids.ts`: *"Past the year it wraps deterministically through the
  verified set"*), but it is a real content cliff **~10 months after launch**.
- The bake is current: `verify:connections` #6 proves the 365 baked grids are
  byte-equal to what `dealGrid` produces today, so nothing has drifted since the
  pool moved to 320 films.

Solo and Chronology have **no** horizon — both generate at runtime from a seed, so
they never run out.

---

## 5. Things I checked that are FINE

- Every one of the 35 Solo dailies is solvable; the solver's line re-validates
  move-by-move; solution length is 8 on all 35 days. No trivial 1-step deal exists
  or can exist — the board is always a full 8-card chain by construction.
- Par never leaves the formula bounds; par is a constant +4 over optimal, so no
  day is mispriced relative to another.
- Pool boundary is exact and timezone-pure: `2026-09-26 → 89`, `2026-09-27 → 216`.
  The legacy pin (`2026-07-03` → once-upon-a-time-in-hollywood, par 9) still
  holds, so no already-published daily has shifted.
- Chronology: all 482 pool records complete and self-consistent — every
  `releaseDate` is a valid `YYYY-MM-DD`, `year` always equals the date's year,
  `decade` always equals `floor(year/10)*10`, `popularity` always numeric. Zero
  duplicate ids, zero duplicate titles.
- No Chronology card in the window is an unreleased film as of its own daily date.
- Connections: no duplicate film inside any of the 35 grids; no grid index reused
  in the window; the ambiguity gate holds under my own independently written
  sits/fits predicate (I did not borrow the dealer's); ≤1 genre group everywhere;
  all four group keys distinct per grid.
- 216-film Duel pool data quality: **zero** field gaps across all 216 (year,
  director, topCast ≥2, writers, genre, title all present). No mojibake, no
  double spaces, no trailing whitespace, no duplicate titles, no duplicate ids.
- `docs/name-audit.md` is clean and current in spirit: 2,797 credit occurrences,
  1,421 distinct spellings, **0 suspicious clusters**. No repeat of the
  David Peoples / David Webb Peoples split.
- All six struck outside-challengers from `docs/daily-duel-216-selection.md`
  (Guardians Vol. 3, Everything Everywhere All at Once, Clueless, Legally Blonde,
  Mean Girls, The Breakfast Club) are absent from `DUEL_POOL` **and** from
  `MOVIES` entirely. Nothing that was ruled out has leaked back in.
- Non-ASCII titles are all deliberate and correct (`Amélie`, em/en dashes) — no
  encoding damage anywhere.
- `soul` and `kpop-demon-hunters` are correctly absent from the Chronology pool
  per the streaming-era ruling in `docs/tmdb-rulings.md`; `soul` is still a
  credited Duel film, as ruled.
- International date policy is applied consistently — Memories of Murder (2005),
  Princess Mononoke (1999), Spirited Away (2002), Taken (2009), The Hurt Locker
  (2009) all carry first-US-theatrical dates per the standing policy, and the card
  `year` follows the policy date in each case.

---

## 6. Content quick wins (with cost)

| # | Win | Cost | Why now |
|---|---|---|---|
| 1 | **Same-exact-date message branch in `ChronologyGame.tsx`** — when the miss is against a card sharing the *identical* `releaseDate`, say "same release day — tiebreak" instead of "decided by exact date". Update the matching RULEBOOK sentence in the same pass (CLAUDE.md rule). | ~1 string + 1 comparison; no rule, seed or pool change; `verify:chronology` unaffected (42/42 asserts the *scoring*, not the copy) | Fires on **2026-10-29**, inside the launch month. Currently the game states something false. |
| 2 | **Extend the Connections bake past 2027-07-05** — re-run `npm run build:connections-grids` with a larger `days`, then `verify:connections`. | One generator run (memory-hungry, `--max-old-space-size=20480`) + one gate run + a committed JSON | Not urgent (247 days of headroom) but cheap now and awkward later: after the wrap the year silently repeats. Do it **before** any published-daily pin lands, not after. |
| 3 | **Content pass on franchise-shaped actor groups** — the dealer will happily hand `actor:Maggie Smith` four Harry Potter films. A post-filter ("reject a non-series group whose 4 films share one `series`") would kill 47 of 365 grids. | Dealer change → re-bake → re-verify → **this is a content/dealer change, not a quick win**; raise it as its own decision | Hits launch day. If it's not fixed, the cheap alternative is to accept it and let the reveal label do the work. |
| 4 | **Re-confirm the two 2026 Chronology dates by hand** (Super Mario Galaxy 2026-04-01, Spider-Man: Brand New Day 2026-07-31) before launch. | Two lookups | They are dealt on 2026-10-16 and 2026-10-20. Forward-dated records are the one class that can go stale without any code changing. |
| 5 | **TMDB re-audit clock.** The 6-month clock from the 2026-07-05 audit is due **2027-01-05** — ~3 months after launch, and after the first month under review. Nothing is overdue today. | Calendar entry | Two content waves and a pool move to 216/320 films have landed since; the next audit is the natural place for items 4 and for any 2025–26 date that firmed up. |
| 6 | **Launch copy: name the local-midnight rollover.** The 216-card cutover reaches players over a ~26-hour band because the seed is the local date. | One sentence | Avoids "why does my friend have a different board" on day one. |

No typos were found in titles or people names — the name audit is clean and the
title sweep found nothing beyond the two dash styles in P3-6.

---

## 7. Appendix — the 25 exact-date collision pairs in the Chronology pool

Each of these will produce a pure-guess placement on any future day both cards are
dealt. (4 of the 365 days from the cutover actually hit one.)

```
1982-06-25  Blade Runner | The Thing
1984-06-08  Ghostbusters | Gremlins
1988-07-15  A Fish Called Wanda | Die Hard
1991-07-12  Boyz n the Hood | Point Break
1992-11-25  Aladdin | The Bodyguard
1995-11-22  Casino | Toy Story
1995-12-15  Heat | Jumanji
1999-08-06  The Iron Giant | The Sixth Sense
1999-10-29  Being John Malkovich | Princess Mononoke
2000-10-06  Meet the Parents | Requiem for a Dream
2000-12-22  Cast Away | Miss Congeniality
2001-05-18  Moulin Rouge! | Shrek
2001-11-16  Amélie | Harry Potter and the Sorcerer's Stone
2003-05-30  Finding Nemo | The Italian Job
2005-07-15  Charlie and the Chocolate Factory | Memories of Murder | Wedding Crashers
2005-11-18  Harry Potter and the Goblet of Fire | Walk the Line
2012-11-09  Lincoln | Skyfall
2015-12-25  The Hateful Eight | The Revenant
2019-12-25  1917 | Little Women
2021-10-22  Dune | The French Dispatch
2022-03-25  Everything Everywhere All at Once | RRR
2022-11-11  Black Panther: Wakanda Forever | The Fabelmans
2023-06-02  Past Lives | Spider-Man: Across the Spider-Verse
2023-07-21  Barbie | Oppenheimer
2024-11-22  Gladiator II | Wicked
```

---

## Least confident

The P2-1 "no face-readable line" metric. I modelled the card face as
`topCast + director[0]` from `StubCard.buildLedger`, which is generous — at hand
(2 cast) and pile (3 cast) sizes fewer names show, so the true readable count is
lower, not higher. But I did not play a real round, so I may be understating what
a player actually learns: flipping a card, the pile banner, and Taz's lines may
surface a hidden credit I treated as invisible, and a `+N DEEPER CREDITS` stamp
plus a wrong try is real information the metric ignores. The direction of the
finding is solid; the severity could be a notch softer than P2.

## What Buri might be missing

The 216-card cutover changed Solo's *findability* without changing anything the
gates measure. `verify:solo` proves every daily is solvable and every par is in
bounds — it has no assertion that a winning line is *discoverable from the card
faces*, and the 216 pool is far deeper in `deepCast` than the 89 was
(the selection receipt itself records 71.76% deep-credit card share and only
73.19% visible edge share). The result is that 26 of the first 35 public dailies
require at least one credit the game deliberately hides, and day two is one of the
three worst boards in the month. That is a launch-week retention risk that reads
as "this game is unfair" rather than "this game is hard", and it is invisible to
every gate in the repo. If it matters, the cheap instrument is a new
non-blocking readout in `verify:solo` — "face-readable winning lines per day" —
which measures the gap without touching a rule, a seed, or the pool.
