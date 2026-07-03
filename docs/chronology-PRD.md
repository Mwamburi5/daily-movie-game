# Chronology, Product Requirements Document

> Working title: Chronology (candidate real name: Premiere). Derived from
> `design/chronology.md`, which is the locked design of record. This PRD restates
> that spec as requirements; it does not redesign it. Anything the spec leaves
> open is listed under Open questions, not decided here.

## 1. Problem and goal

Marquee has two live modes, Daily Puzzle (solo golf) and Duel vs Computer. Both
run on one engine: the link graph of shared cast and crew. That engine caps the
content. A film only belongs in the pool if it shares people with other films, so
the universe is small, curated, and eventually memorizable.

The goal of Chronology is a third, standalone mode whose content scales freely.
Every recognizable film with a release date is a legal card, so the pool can grow
to hundreds of films without the curation bottleneck. The player arranges movies
in the order they were released. The single skill under test is the player's
sense of when a film came out, sharpened against a line that grows more crowded
with every placement.

## 2. The skill hypothesis (reward reasoning over recall)

The mode should reward reasoning more than rote memory. The bet:

- A pool of 300 to 500 films, dealt fresh each day, makes pure memorization
  impractical. You cannot have every release date stored, so you reason.
- Reasoning cues are cultural: era of the star, look of the effects, the
  cultural moment a film belongs to. These let a player who does not know an
  exact year still infer a decade and a relative position.
- Difficulty rises within a single round as gaps tighten. Early placements are
  coarse (which decade); late placements are fine (which year inside a cluster).
  The same film is easy on an empty line and hard on a crowded one, so skill is
  the ability to reason about narrowing intervals, not to recall a fact.

The hypothesis is measurable: if reasoning is the real skill, clean placement
rate should fall as the line fills (gaps shrink), and players should still finish
rounds (no dead ends). See Success metrics.

## 3. Target player and modes context

Same audience as the existing modes: a casual daily player who likes a short,
shareable film puzzle. Chronology sits beside the other two as one family:

- Daily Puzzle: solve a hand of linked films in as few flips as possible (golf).
- Duel vs Computer: take turns scoring links; highest net wins.
- Chronology: place a hand of films into a year-ordered line (golf).

All three read as one family through shared golf framing (low score wins) and a
shared share format (an emoji row). Chronology is solo and daily first.

## 4. Scope

In scope:

- A solo, single-round insertion game over a year-ordered line.
- A deterministic daily round from a date seed, plus a random round.
- Golf scoring with streak credit and tight-call mercy.
- A data pipeline that produces `chronology-pool.json` (300 to 500 films).
- Pure core logic in `src/lib/chronology.ts`, verifiable in `sim/`.
- A Cleared screen with a shareable emoji row.
- A difficulty dial implemented purely in how the hand is dealt.

Out of scope (parked, see spec Parked items):

- Pre-1970 Classics era pack.
- Hand size scaling (launch is fixed at 10).
- Any multiplayer or Duel variant of Chronology.
- Any sharing of the Duel link engine, sim parity contract, or scoring.
- Persistence (localStorage), consistent with the rest of the app.

## 5. The mechanic

- A round opens with 1 anchor card face up on the line and a hand of 10, titles
  up and years hidden.
- On a turn the player inserts one hand card into a gap on the line. Gaps include
  the two ends, so there are (line length + 1) legal gaps.
- Placement is hard. The chosen gap either equals the correct slot or it does
  not.
  - Correct: the card sticks, clean, +0.
  - Wrong: the card flips to reveal its real year, animates to its correct slot,
    the line re-sorts so it stays strictly ordered, and the player takes a
    stroke. The line is never left out of order, so every flip teaches the real
    year.
- The hand empties one card at a time. There is no stuck state: a card can always
  be placed somewhere, so a round always finishes.
- The flip and snap is the signature moment of the mode and is worth the polish.

## 6. Ruleset contract (the part the code must honor)

This restates section "Ruleset contract" of the spec. The code must honor it
exactly; changes to it are rule changes, not tuning.

1. Resolution. Each film carries its full official TMDB release date as the
   hidden resolver. The card face shows only the year. The player reasons in
   years; the game resolves uniquely by date. There is always exactly one correct
   slot, even for same-year films. Ties resolve by date, so one slot is correct
   and the player is told the years matched.
2. Era window. Films released 1970-01-01 to present only. Pre-1970 is parked.
3. The line and placement. A round opens with 1 anchor and a hand of 10.
   `correctSlot(card, line)` is the index where the card's release date falls in
   the current line order. Hard placement: chosen slot equals correct slot is
   clean; otherwise misfire, flip, snap, re-sort. The line is never allowed to
   hold a wrong order.
4. Determinism. `dealRound(seed, pool, handSize)` is deterministic from a date
   seed, so the daily is identical for everyone. The same function powers a
   random round from a random seed.
5. Difficulty dial. Difficulty lives entirely in how the hand is dealt, not in
   new rules. Easy spreads hand films far apart in time; hard clusters them. Same
   engine, same scoring.

## 7. Scoring

Golf framing, low score wins, mirroring Daily Puzzle so the family reads as one.

| Event | Delta | Notes |
|---|---|---|
| Clean placement | +0 | |
| Misfire | +1 stroke | card reveals and self-corrects |
| Streak of 3 clean | -1 stroke | resets the streak counter |
| Tight-call mercy | streak survives one misfire | only if the last clean placement was into a gap whose neighbors are within `TIGHT_GAP_YEARS` |

- `TIGHT_GAP_YEARS` is a tuning constant; it starts at 3.
- Final score = strokes minus streak credits. Lower is better.
- Streak state and tight-call mercy are session state computed by the caller
  (the mode UI and the sim) from per-placement results plus `gapTightness`. The
  pure core scores one placement at a time; it does not hold the running streak.

## 8. Data requirements

The pool is the whole content layer. A clumped or unrecognizable pool sinks the
mode no matter how good the UI is.

- Pool record shape: `{ id, title, year, releaseDate, decade, popularity }`.
  `releaseDate` is the full ISO date and is the hidden resolver; `year` is the
  card face; `decade` is the stratification bucket; `popularity` is the
  recognizability signal.
- Size: build to 300 to 500 records, roughly 50 to 80 per decade across the
  1970s through the 2020s. Minimum coherent is about 150.
- Three hard constraints on the pool:
  1. Recognizability. The pool is hand-curated, the way `src/data/movies.ts`
     already is; a human picks famous films so players can reason from cultural
     memory. This is deliberately not an automated popularity filter: TMDB
     popularity is recency-biased and would clump the pool toward recent decades,
     working against constraint 2. Popularity, if carried, is informational, not
     the gate. The seed bootstraps from the 89 already-recognizable titles in
     `src/data/movies.ts` (a one-time copy of titles, not a runtime import: the two
     pools stay decoupled, the shapes differ, and `movies.ts` is governed by
     Duel's link needs, so coupling would let a Duel edit shift the Chronology
     daily). Those 89 carry no release date and are clumped toward 1990 to 2019
     (1970s 3, 1980s 4, 2020s 1), so the bulk of new curation is 1970s, 1980s, and
     2020s films, all enriched with dates.
  2. Even decade spread. Curate a comparable share per decade, or the line clumps
     post-2000 and early placements turn trivial while modern ones become coin
     flips. The build script validates this and refuses to emit an uneven pool.
  3. Resolution. Carry each film's full release date so ties are decidable. Dates
     are filled by a manual lookup under the locked date policy below and
     committed, so there is no runtime dependency.

Date resolution policy (locked 2026-06-27): `releaseDate` is the US theatrical
release date. Festival premieres (Cannes, Venice) and streaming-only dates are
excluded; the first US public theatrical opening wins (limited counts). Rationale:
the mode is played from cultural memory, which tracks the theatrical arrival, not
the festival premiere; TMDB's primary date is often the earliest and mixes
policies film to film, so dates are curated by hand to apply one policy
consistently. The starter sample lives in `scripts/chronology-seed.ts`.
- Per round the board is 1 anchor plus 10 placements, an 11-card board.
- A pool of 300 to 500 supports a daily for more than a year with no repeated
  hands and leaves room to tune by era.

## 9. Success metrics

All are measurable; the first three are checkable in the sim before any player
data exists, the last two require analytics once shipped.

- Round completion rate. Share of started rounds that reach Cleared. Because
  there is no stuck state, the only loss is abandonment. Target above 90 percent
  of started rounds completed.
- Stroke distribution. Median strokes per 10-card round in a target band that
  feels fair but not trivial; a starting target is a median of 3 to 5 strokes and
  a clean placement rate of 50 to 70 percent across a representative sample. The
  band is tuned against real rounds.
- Difficulty ramp (the skill hypothesis check). Clean placement rate should
  decline as the line fills, because gaps shrink. The sim measures clean rate by
  placement index and asserts a downward trend; a flat or rising trend means the
  ramp is broken.
- Day-over-day retention. For the daily, the share of players who return the next
  day (D1) and after a week (D7). These are the headline engagement numbers once
  analytics exist.
- Share rate. Share of completed rounds whose emoji row is copied, a proxy for
  the result feeling worth sharing.

Secondary, for tuning: tight-call mercy trigger frequency (to calibrate
`TIGHT_GAP_YEARS`), and the spread of difficulty between easy and hard deals.

## 10. Risks and open questions

Risks:

- Pool quality risk. A clumped or low-recognizability pool makes early placements
  trivial and late ones coin flips. Mitigated by the popularity threshold and
  decade stratification, both verifiable before ship.
- Same-year ambiguity. Two same-year films are decidable by date but can feel
  unfair to a player reasoning only in years. Mitigated by telling the player the
  years matched on a same-year misfire.
- Difficulty ramp risk. If gaps do not tighten as expected, the mode is either
  flat or punishing. Mitigated by the sim ramp measurement.
- Tuning drift. `TIGHT_GAP_YEARS` and the difficulty spreads are guesses until
  tuned against real rounds.

Open questions (the spec leaves these open; they are not decided here):

- Final name: Chronology (working) or Premiere (candidate). Decide before ship.
- Source of the pool (resolved). The spec says reuse the existing TMDB pipeline,
  but no such pipeline exists; `src/data/movies.ts` is hand-authored. Decision:
  stay curation-first to match the repo and protect the even-decade-spread
  constraint. Dates are filled by manual lookup under the locked date policy in
  section 6 (US theatrical release). The remaining curation note, not a blocker:
  foreign and awards films whose US-theatrical year differs from the festival year
  shift the card's face year, so the curator accepts or drops them case by case.
- Exact difficulty model. The spec names easy (wide gaps) and hard (clustered)
  but not the precise deal algorithm, the number of difficulty tiers, or whether
  the daily uses a fixed difficulty.
- Where streak and tight-call state live precisely (resolved in Phase 2). The
  caller owns the running `StreakState` and advances it through the pure
  `streakCredit(prev, result, gapYears)` helper in `src/lib/chronology.ts` (with
  `newStreak()` for a fresh round), so the UI and the sim share one implementation
  of the streak and tight-call mercy economy. The per-placement core
  (`scorePlacement`) still scores one card at a time and holds no running state.
  Phase 3 wires the UI to the same helper.
- Hand size scaling (8 easy, 12 hard) is parked until a play-and-feel pass.
- Pre-1970 Classics era pack is parked future content.

## 11. Milestones

Tracks the 6 build phases in the spec; detailed tasks live in
`docs/chronology-tasks.md`.

1. Data pipeline. A hand-curated seed (recognizability and decade spread decided
   by a human) is date-enriched, validated against the hard constraints, and
   emitted as `chronology-pool.json`, 300 to 500 records. Built in two stages: a
   ~150-film evenly-spread pool to unblock core, UI, and feel work, then expanded
   to 300 to 500 before the public daily launches. Pool size is a parameter to the
   deal, so growth is content-only; but it must be locked before the public daily,
   since the daily deal is a function of the pool.
2. Core logic. Pure functions in `src/lib/chronology.ts`, no React, fully typed,
   covering deal, correct slot, scoring, and gap tightness.
3. Mode UI. `src/ChronologyGame.tsx`, a sibling to `DuelGame.tsx`, with the
   horizontal line, insertable gaps, and the flip and snap on misfire.
4. End state and share. A Cleared screen with the emoji row in the family share
   format.
5. Daily seeding and difficulty dial. Deterministic daily from a date seed;
   difficulty implemented purely in the deal.
6. Docs. Promote the spec's How to play into `RULEBOOK.md` as Mode 3 on ship, and
   add a short canonical note covering all three modes.
