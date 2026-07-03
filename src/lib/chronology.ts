// src/lib/chronology.ts — pure core for Mode 3, Chronology.
//
// React-free so the mode UI (src/ChronologyGame.tsx) and the verify harness
// (sim/chronology-verify.ts) call the SAME code, the project's parity-by-
// construction principle. This module shares nothing with the Duel link engine.
//
// Canonical design: design/chronology.md. Requirements: docs/chronology-PRD.md.

import { makeRng, type Rng } from './rng.ts'

// A film in the Chronology pool. `releaseDate` is the hidden resolver (full ISO
// 'YYYY-MM-DD'); the card face shows only `year`. `decade` is the stratification
// bucket (e.g. 1990); `popularity` is the recognizability signal from TMDB.
export interface ChronologyCard {
  id: string
  title: string
  year: number
  releaseDate: string
  decade: number
  popularity: number
}

// A dealt round: one anchor on the line, plus the hand to place.
export interface Round {
  anchor: ChronologyCard
  hand: ChronologyCard[]
}

// Outcome of one placement. `clean` sticks; `misfire` flips and self-corrects.
export type PlacementResult = 'clean' | 'misfire'

// The score of a single placement. `strokeDelta` is the base golf delta
// (+0 clean, +1 misfire); streak credit and tight-call mercy are applied by the
// caller via streakCredit, not here. `correctSlot` is where the card actually
// belongs, so the UI can animate the snap.
export interface Placement {
  result: PlacementResult
  correctSlot: number
  strokeDelta: number
}

// Launch hand size: 1 anchor plus this many placements per round.
export const HAND_SIZE = 10

// Tight-call mercy threshold: a clean placement into a gap whose neighbors are
// within this many years lets a hot streak survive one later misfire. Tuning
// constant, starts at 3 (see ruleset contract section 4).
export const TIGHT_GAP_YEARS = 3

// A clean streak of this many placements credits a stroke back, then resets.
export const STREAK_TARGET = 3

// ── ordering ────────────────────────────────────────────────────────────────

// The canonical order of the line: by full release DATE, so same-year films
// still have a defined order. ISO 'YYYY-MM-DD' strings sort chronologically as
// plain strings, so a lexical compare IS a date compare. `id` is the final
// tiebreak, so two films sharing an exact date still get one stable, total order
// — guaranteeing exactly one correct slot for every card (ruleset §1).
function compareCards(a: ChronologyCard, b: ChronologyCard): number {
  if (a.releaseDate !== b.releaseDate) return a.releaseDate < b.releaseDate ? -1 : 1
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0
}

// Is `line` already in canonical (date) order? correctSlot, scorePlacement and
// gapTightness all assume a pre-sorted line — the hard-placement rule guarantees
// it by re-sorting after every miss, so the invariant always holds in real play.
// Exposed so callers (and the verify gate) can assert it cheaply.
export function isLineSorted(line: ChronologyCard[]): boolean {
  for (let i = 1; i < line.length; i++) {
    if (compareCards(line[i - 1], line[i]) > 0) return false
  }
  return true
}

// ── deal ──────────────────────────────────────────────────────────────────

// Deal a deterministic round from a seed. Same (seed, pool, handSize) always
// yields the same anchor and hand, so the daily is identical for everyone and a
// random seed powers a one-off round. The anchor is never also in the hand.
//
// Pool size is content, not code: a bigger pool just feeds more candidates here,
// so growing the pool needs no change to the deal. The difficulty dial (wide vs
// clustered hands, design/chronology.md §6) is a Phase 5 layer ON TOP of this
// uniform deal; the core deal stays a plain shuffle.
export function dealRound(
  seed: number | string,
  pool: ChronologyCard[],
  handSize: number = HAND_SIZE,
): Round {
  const need = handSize + 1
  if (pool.length < need) {
    throw new Error(
      `chronology.dealRound: pool has ${pool.length} cards, need ${need} (1 anchor + ${handSize} hand)`,
    )
  }
  // Keyed deal stream, mirroring the Duel's "seed in the sim, Math.random in the
  // app" pattern. The label keeps this stream independent of any other use of
  // the same seed.
  const rng: Rng = makeRng(seed, 'chronology-deal')
  const drawn = shuffle(pool, rng).slice(0, need)
  return { anchor: drawn[0], hand: drawn.slice(1) }
}

// Fisher-Yates over a copy, driven by the seeded rng so the deal is reproducible.
function shuffle<T>(arr: T[], rng: Rng): T[] {
  const out = arr.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

// ── difficulty dial (Phase 5: the dial is the deal, not a rule) ───────────────

// The three deal shapes. `standard` is the plain uniform shuffle the DAILY rides
// (so the daily board is comparable for everyone); `easy` and `hard` flavor the
// random/practice round only. Modeled as a union (not just easy/hard) so the
// daily can name its neutral shape and reuse one deal entry point. Difficulty
// lives ENTIRELY here in how the hand is dealt — same engine, same scoring
// (design/chronology.md §6).
export type ChronoDifficulty = 'easy' | 'standard' | 'hard'

// Hard-deal window: how many date-adjacent candidates to cluster within before
// sampling the hand. Bigger than `need` so the sample has some choice, but small
// enough that the chosen cards bunch in time (tight gaps). Tuning, not contract —
// the verify spread assertion confirms hard ends up tighter than easy, whatever
// this is. A small factor over a thin pool clamps to the whole pool (degrade
// gracefully, never throw) and just widens the window.
const HARD_WINDOW_FACTOR = 1.6

// Deal a difficulty-shaped round, deterministic from the seed on top of the same
// keyed rng stream pattern as dealRound. All three shapes yield `handSize + 1`
// unique cards. `standard` delegates to dealRound unchanged, so the daily (which
// always deals standard) is exactly the uniform deal the verify gate already
// covers. This is additive: the rule and scoring functions below are untouched.
export function dealRoundShaped(
  seed: number | string,
  pool: ChronologyCard[],
  difficulty: ChronoDifficulty = 'standard',
  handSize: number = HAND_SIZE,
): Round {
  if (difficulty === 'standard') return dealRound(seed, pool, handSize)

  const need = handSize + 1
  if (pool.length < need) {
    throw new Error(
      `chronology.dealRoundShaped: pool has ${pool.length} cards, need ${need} (1 anchor + ${handSize} hand)`,
    )
  }
  // A difficulty-labeled stream, so easy and hard draw independently of each
  // other and of the standard daily for the same date seed.
  const rng: Rng = makeRng(seed, 'chronology-deal', difficulty)
  const sorted = pool.slice().sort(compareCards)
  const chosen = difficulty === 'easy' ? spreadDeal(sorted, need, rng) : clusterDeal(sorted, need, rng)
  // Final shuffle only fixes WHICH chosen card is the anchor; the spread/cluster
  // shape is already set, so this does not undo it.
  const drawn = shuffle(chosen, rng)
  return { anchor: drawn[0], hand: drawn.slice(1) }
}

// EASY: spread the hand far apart in time (wide gaps). Partition the date-sorted
// pool into `need` equal contiguous segments and pick one card from each. The
// segments are disjoint and cover the whole era, so the picks are unique AND
// span the full timeline with comparable gaps — wide neighbor spans by design.
function spreadDeal(sorted: ChronologyCard[], need: number, rng: Rng): ChronologyCard[] {
  const n = sorted.length
  const picks: ChronologyCard[] = []
  for (let i = 0; i < need; i++) {
    const lo = Math.floor((i * n) / need)
    const hi = Math.floor(((i + 1) * n) / need) // exclusive; last segment ends at n
    const idx = lo + Math.floor(rng() * Math.max(1, hi - lo))
    picks.push(sorted[idx])
  }
  return picks
}

// HARD: cluster the hand into a narrow time window (tight gaps, e.g. a 1990s-only
// round). Take one contiguous window of the date-sorted pool and sample the hand
// from within it, so the chosen cards bunch close together. The window slides by
// seed (different eras on different days). Degrades gracefully: a pool barely big
// enough clamps the window to the whole pool instead of throwing.
function clusterDeal(sorted: ChronologyCard[], need: number, rng: Rng): ChronologyCard[] {
  const n = sorted.length
  const windowSize = Math.min(n, Math.max(need, Math.round(need * HARD_WINDOW_FACTOR)))
  const start = Math.floor(rng() * (n - windowSize + 1))
  const window = sorted.slice(start, start + windowSize)
  return shuffle(window, rng).slice(0, need)
}

// ── placement ───────────────────────────────────────────────────────────────

// The index where `card` belongs in the current `line`, by release DATE (not
// just year), so same-year films still resolve to exactly one correct slot.
//
// INVARIANT: `line` MUST already be in canonical date order. The hard-placement
// rule keeps it that way (a miss re-sorts the line), so this holds throughout a
// round. Guarded below rather than silently returning a wrong slot, because an
// unsorted line is a caller bug, not a recoverable input.
//
// Returns an insertion index in [0, line.length].
export function correctSlot(card: ChronologyCard, line: ChronologyCard[]): number {
  if (!isLineSorted(line)) {
    throw new Error('chronology.correctSlot: line must be pre-sorted by release date')
  }
  let slot = 0
  while (slot < line.length && compareCards(line[slot], card) < 0) slot++
  return slot
}

// Score one hard placement. Clean (+0) when `chosenSlot` equals the correct slot,
// misfire (+1) otherwise. Pure: the streak and tight-call economy is the caller's
// (see streakCredit). `correctSlot` is reported so the UI can animate the snap.
export function scorePlacement(
  card: ChronologyCard,
  line: ChronologyCard[],
  chosenSlot: number,
): Placement {
  const slot = correctSlot(card, line)
  const result: PlacementResult = chosenSlot === slot ? 'clean' : 'misfire'
  return { result, correctSlot: slot, strokeDelta: result === 'clean' ? 0 : 1 }
}

// The year span between the two neighbors of `slot` in `line` — the yardstick for
// tight-call mercy and for measuring how the difficulty ramps as the line fills.
// `slot` is an insertion index in [0, line.length]. An end gap has only one
// neighbor and is open-ended, so it is reported as Infinity (never a tight call).
export function gapTightness(line: ChronologyCard[], slot: number): number {
  if (slot <= 0 || slot >= line.length) return Infinity
  return line[slot].year - line[slot - 1].year
}

// ── streak + tight-call economy (the one shared implementation) ───────────────

// Running streak state the caller threads across placements. The pure core does
// not hold it (scorePlacement scores one card at a time); the UI and the sim both
// own a StreakState and advance it through streakCredit, so the streak and
// tight-call mercy economy has exactly ONE implementation, not two that drift.
export interface StreakState {
  // Consecutive clean placements counted toward the next stroke credit (0..2;
  // hitting STREAK_TARGET awards a credit and resets to 0).
  streak: number
  // A tight-call shield: armed by a clean placement into a tight gap, it lets the
  // streak survive the next misfire (consumed once).
  mercyArmed: boolean
}

// What one placement did to the economy, on top of scorePlacement's strokeDelta.
export interface StreakOutcome {
  state: StreakState // the new running state to carry forward
  creditDelta: number // strokes credited back this placement (0 or -1)
  badge: boolean // a Streak ×3 fired this placement (show the badge)
  mercyUsed: boolean // a tight-call shield absorbed a misfire this placement
}

// A fresh streak at the start of a round. A factory (not a shared const) so no
// caller can accidentally mutate a singleton.
export function newStreak(): StreakState {
  return { streak: 0, mercyArmed: false }
}

// Advance the streak economy by one placement. Pure: returns the next state plus
// what happened, never mutates `prev`.
//
// - clean: extends the streak; on reaching STREAK_TARGET it credits −1 and resets.
//   The shield is (re)armed iff this clean landed in a tight gap (gapYears within
//   TIGHT_GAP_YEARS). End gaps report Infinity, so they never arm it.
// - misfire: if a shield was armed it absorbs the miss (streak survives, shield
//   spent); otherwise the streak resets. Either way the +1 stroke is scorePlacement's.
//
// `gapYears` is the tightness of the gap the card landed in (from gapTightness);
// it only matters on a clean placement. Centralizing the TIGHT_GAP_YEARS compare
// here is the point — callers pass the raw span, the economy decides "tight".
export function streakCredit(
  prev: StreakState,
  result: PlacementResult,
  gapYears: number,
): StreakOutcome {
  if (result === 'clean') {
    const tight = gapYears <= TIGHT_GAP_YEARS
    const streak = prev.streak + 1
    if (streak >= STREAK_TARGET) {
      return {
        state: { streak: 0, mercyArmed: tight },
        creditDelta: -1,
        badge: true,
        mercyUsed: false,
      }
    }
    return { state: { streak, mercyArmed: tight }, creditDelta: 0, badge: false, mercyUsed: false }
  }
  // misfire
  if (prev.mercyArmed) {
    // The shield absorbs this miss: streak is preserved, shield is spent.
    return {
      state: { streak: prev.streak, mercyArmed: false },
      creditDelta: 0,
      badge: false,
      mercyUsed: true,
    }
  }
  return { state: newStreak(), creditDelta: 0, badge: false, mercyUsed: false }
}
