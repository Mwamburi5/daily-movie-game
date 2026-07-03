# Chronology — Design Spec (Mode 3)

> **Working title:** "Chronology." Leading candidate for the real name: **Premiere**
> (release dates are premieres, and it sits well next to "Daily Puzzle" and "Duel").
>
> **Status:** SPEC, not yet built. This doc is the design of record. The "How to
> play" section below is written drop-in ready: when the mode ships, promote it
> into `RULEBOOK.md` as Mode 3 and keep RULEBOOK as the live-game guide.
>
> **Locked decisions (2026-06-27):**
> 1. Core is **insertion** (place into a growing line), not an ascending stack.
> 2. Placement is **hard**: a card is in the right slot or it is not.
> 3. **Pure year.** No casts, no person-links, no connection graph.
> 4. Resolution is the **official TMDB release date** (shown as a year, resolved by date).
> 5. Era window: **1970 to present.**
> 6. Hand size: **10.**

---

## The big idea

Every card is a movie. You arrange movies in the order they were released. No
casts, no connections, no shared people. Just your sense of *when* a film came
out, sharpened against a line that grows more crowded with every card you place.

This is a third, standalone mode beside Daily Puzzle and Duel. It shares none of
the link/scoring engine those two use, so it is built in its own lane and does
not touch `DuelGame.tsx` or the sim parity contract.

Why pure year is the point: the connection game is capped (a film only belongs if
it shares a cast with others), so its universe is small and curated. Chronology
has no such limit. Every recognizable film with a release date is a legal card, so
the pool scales freely, and a large pool is exactly what makes the mode reward
reasoning over memory.

---

## How to play (drop-in ready for RULEBOOK)

### Mode 3 — Chronology (Solo)

> A film-history brain-teaser. No casts, no connections. Just you, a row of
> movies, and your sense of *when*.

**How to play in 30 seconds**

1. One movie starts on the **line**. You hold a hand of cards, titles up, years hidden.
2. On your turn, **slot a card into the line** where you think it belongs in time:
   older to the left, newer to the right.
3. **Right slot, it sticks.** Wrong slot, the card **flips to show its real year**,
   snaps to where it actually goes, and you take a stroke. Either way the line
   stays true, so every flip teaches you something.
4. Empty your hand. Like golf, **low score wins.**

**What's on screen**

```
   Strokes · Streak                      (top bar)

 1979      1994             2016         (the LINE, left = older)
 ┌────┐   ┌────┐           ┌────┐
 │ ●  │ … │ ●  │    ⌄?⌄    │ ●  │         (drop a card into any gap)
 └────┘   └────┘           └────┘
         [ your hand of cards ]          (tap to lift, drag into a gap)
```

**Scoring (golf, so LOW is good)**

- **Clean placement:** +0.
- **Misfire** (wrong gap): **+1 stroke**, and the card reveals and corrects itself.
- **Streak:** three clean placements in a row earns a stroke **back** (−1).
  A `Streak ×3` badge pops.
- **Tight-call mercy:** nailing a gap whose two neighbors are within a few years
  keeps a hot streak alive even if your next card misfires. Rewards the brave call.

**How it ends**

- **Cleared!** your hand is empty. You get an emoji row to share (🎬 clean, 🟥
  misfire), so the shape of your run is shareable like the other two modes.
- There is no "stuck" state. A card can always be placed somewhere, so a round
  always finishes.

**The twist:** every card you place makes the next one harder, because the gaps
get smaller. The first card is a gimme. The last one might be threading 1997
between 1995 and 1999.

---

## Ruleset contract (the part the code must honor)

### 1. Resolution

- Each film carries its **full official TMDB release date** as the hidden
  resolver. The face of the card shows **only the year**.
- The player reasons in years; the game resolves uniquely by date. This means
  there is **always exactly one correct slot**, even for same-year films, which is
  what the hard rule requires.
- Tie handling falls out for free: two same-year films still have a defined
  order by date, so one slot is correct and the player is told the years matched.

### 2. Era window

- Pool is restricted to films released **1970-01-01 to present.**
- Pre-1970 is parked as a future "Classics" era pack. It is excluded at launch
  because lower recognizability would clump the easy (left) end of the line.

### 3. The line and placement

- A round opens with **1 anchor card** face-up on the line and a **hand of 10.**
- A play inserts one hand card into a **gap** (including the two ends).
- `correctSlot(card, line)` = the index where the card's release date falls in
  the current line order.
- **Hard placement:** chosen slot equals correct slot → clean. Otherwise → misfire:
  the card flips, animates to its correct slot, and the line is re-sorted so it
  stays strictly ordered. The line is never allowed to hold a wrong order.

### 4. Scoring economy

| Event | Delta | Notes |
|---|---|---|
| Clean placement | **+0** | |
| Misfire | **+1 stroke** | card reveals and self-corrects |
| Streak of 3 clean | **−1 stroke** | resets the streak counter |
| Tight-call mercy | streak survives one misfire | only if the last clean placement was into a gap whose neighbors are within `TIGHT_GAP_YEARS` |

- `TIGHT_GAP_YEARS` is a tuning constant; start at **3**.
- Final score = strokes − streak credits. Lower is better. Mirrors the Daily
  Puzzle's golf framing so the three modes read as one family.

### 5. Determinism (daily)

- `dealRound(seed, pool, handSize)` is **deterministic** from a date seed, so the
  daily puzzle is identical for everyone, Wordle-style.
- The same function powers a "random round" by passing a random seed.

### 6. Difficulty dial

- Difficulty lives entirely in **how the hand is dealt**, not in new rules.
  - **Easy:** hand films are spread far apart in time (wide gaps).
  - **Hard:** hand films are tightly clustered (for example a 1990s-only round).
- Same engine, same scoring. The dial is the deal.

---

## Card pool requirements

The pool is the whole content layer. Get this right and the mode is good; get it
wrong (clumped or unrecognizable) and no amount of UI saves it.

**Per round:** 1 anchor + 10 placements = an 11-card board.

**Pool size:**

| Tier | Films | Per decade (1970s-2020s) | Use |
|---|---|---|---|
| Minimum coherent | ~150 | ~25 | enough for tight within-decade gaps and some variety |
| **Launch target** | **300-500** | **~50-80** | kills memorization, supports a daily for 1+ year with no repeat hands, room to tune by era |
| Ceiling | thousands | — | trivial from TMDB, gated only by recognizability |

**Build to 300-500.**

**Three hard constraints on the pool (none is raw availability):**

1. **Recognizability.** Filter TMDB by a popularity / vote-count threshold so
   players can reason from cultural memory. This is the real cap, not film count.
2. **Even decade spread.** Stratify so each decade gets a comparable share.
   Otherwise the line clumps post-2000 and early placements turn trivial while
   modern ones become coin flips.
3. **Resolution.** Carry each film's full release date (constraint #1 of the
   ruleset) so ties are decidable.

**Pool record shape:** `{ id, title, year, releaseDate, decade, popularity }`.

---

## Build plan

The happy fact: this is **almost entirely new files.** It does not touch
`DuelGame.tsx` (highest blast radius in the repo) and it does not touch the Duel's
sim parity contract, because it shares none of the link engine. New mode, new lane.

### Phase 1 — Data pipeline

A small Node script (outside the app bundle) that reads the existing TMDB pipeline
and emits `chronology-pool.json`: pull candidate films, filter by
popularity/vote-count for recognizability, then **stratify** by decade to an even
spread, targeting 300-500 records in the pool shape above. This file is the
content layer; everything downstream reads it.

### Phase 2 — Core logic in `src/lib/` (pure, testable)

New module `src/lib/chronology.ts`, pure functions, no React:

- `dealRound(seed, pool, handSize)` → deterministic anchor + hand.
- `correctSlot(card, line)` → true index by release date.
- `scorePlacement(card, line, chosenSlot)` → clean | misfire + stroke delta.
- `gapTightness(line, slot)` → neighbor span in years, for streak and difficulty.

Keeping these pure mirrors the project's "React and the sim call the same
functions" principle. It also lets a small `sim/chronology-verify.ts` do two jobs:
confirm placement scoring is correct, and **measure the difficulty ramp**
(simulate a naive vs a calibrated player and check that gap density tightens as
the line fills). That gives Chronology its own verify gate, the same discipline as
the Duel's 60/60.

### Phase 3 — Mode UI

`src/ChronologyGame.tsx`, a sibling to `DuelGame.tsx`, wired into the mode picker:

- A horizontal **line** of placed cards with insertable gaps. Reuse the existing
  Framer Motion drag patterns so the feel matches the other modes.
- On drop: call `scorePlacement`. Clean → settle. Misfire → animate the
  **flip-and-snap** to the correct slot and tick a stroke. This flip is the
  signature moment; it is worth the polish.
- Top bar: strokes and streak, in the Daily Puzzle tally style.

### Phase 4 — End state + share

Cleared screen with the emoji row in the same share format as the other two modes,
so all three read as one family.

### Phase 5 — Daily seeding + difficulty dial

Deterministic daily from a date seed. Difficulty implemented purely in the deal
(wide-gap hand for easy, clustered hand for hard) per ruleset #6.

### Phase 6 — Docs — DONE (2026-06-30)

Promote the "How to play" section above into `RULEBOOK.md` as Mode 3, and add a
short canonical note so the docs cover all three modes without drift.

DONE: `RULEBOOK.md` carries "Mode 3 — Chronology (Solo) · NEW" in the Modes 1/2
voice and skeleton, plus the daily-vs-practice split and the Wide/Tight dial. The
intro was restructured into an honest three-mode family note (movie cards + golf +
shareable emoji row); the link framing is now scoped to Modes 1 and 2 only, so
Chronology is never implied to use links. This closes the build plan. The only
remaining track is content: grow the pool to 300-500 (Stage B) and run a human
date-verification pass, then lock the pool before the public daily.

---

## Parked / open items

- **Final name:** Chronology (working) vs Premiere (candidate). Decide before ship.
- **Pre-1970 "Classics" era pack:** future content, excluded at launch.
- **Hand size scaling:** launching fixed at 10. Revisit scaling (8 easy / 12 hard)
  after a play-and-feel pass.
- **`TIGHT_GAP_YEARS`:** starts at 3, tune against real rounds.
- **Multiplayer / Duel variant of Chronology:** not in scope. Solo daily first.
