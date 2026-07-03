// sim/chronology-eval.ts — the tuning readout for Mode 3, Chronology.
//
//   node sim/chronology-eval.ts [rounds]        (npm run eval:chronology)
//
// The sibling of `npm run eval tune`: where chronology-verify.ts PROVES claims
// (scoring correct, ramp real, spread real), this REPORTS the numbers a designer
// tunes against — clean rate, perfect-round rate, and the full score distribution
// per difficulty (standard = the daily's shape, easy, hard), for the same two
// player models the verify gate already defined:
//
//   naive       — year estimate off by up to ±5y (verify's k=5 player)
//   calibrated  — year estimate off by up to ±1y (verify's k=1 player)
//
// Two deliberate differences from the verify ramp:
//   1. REAL pool. The ramp measures on a synthetic evenly-spread pool to keep its
//      monotonicity claim clean; tuning must read the actual shipped 162-film
//      pool, era skew and all.
//   2. FULL golf economy. The ramp counts raw strokes; here every placement runs
//      the streak + tight-call mercy economy (streakCredit) exactly as the UI
//      does, so "score" means what the player sees: strokes − credits (can go
//      under 0 — golf under par).
//
// Everything is seeded, so the readout is reproducible run to run. Per RULESET
// §12, the default round count stays ≥4000.

import {
  HAND_SIZE,
  dealRoundShaped,
  scorePlacement,
  gapTightness,
  streakCredit,
  newStreak,
  type ChronologyCard,
  type ChronoDifficulty,
} from '../src/lib/chronology.ts'
import { CHRONOLOGY_SEED, type SeedEntry } from '../scripts/chronology-seed.ts'
import { makeRng } from './rng.ts'
import { wilson, pairedDiff, pctCI } from './stats.ts'

// The shipped pool, derived from the curated seed exactly as the build script
// (and chronology-verify.ts) derive it. Node can't import the committed JSON
// without an import attribute Vite doesn't need, so the sim layer reads the seed
// — the JSON's single source — instead of the app's chronologyPool.ts wrapper.
function toCard(e: SeedEntry): ChronologyCard {
  const year = Number(e.releaseDate.slice(0, 4))
  return {
    id: e.id,
    title: e.title,
    year,
    releaseDate: e.releaseDate,
    decade: Math.floor(year / 10) * 10,
    popularity: e.popularity ?? 0,
  }
}
const CHRONOLOGY_POOL = CHRONOLOGY_SEED.map(toCard)

const ROUNDS = Number(process.argv[2] ?? 4000)

// The two players the verify gate defined (its k=5 naive and k=1 calibrated).
const MODELS = [
  { name: 'naive', k: 5 },
  { name: 'calibrated', k: 1 },
] as const

const DIFFICULTIES: ChronoDifficulty[] = ['standard', 'easy', 'hard']

interface RoundStats {
  score: number // strokes − credits, the number on the player's screen
  cleans: number // clean placements (of HAND_SIZE)
  credits: number // −1 streak credits earned
  mercies: number // tight-call shields that absorbed a misfire
}

// One full round: the verify gate's year-reasoning player (noise ±k), played
// through the real scoring pipeline — scorePlacement, then the streak economy on
// the PRE-insert line at the correct slot, exactly ChronologyGame's order.
function playRound(seed: string, k: number, difficulty: ChronoDifficulty): RoundStats {
  const round = dealRoundShaped(seed, CHRONOLOGY_POOL, difficulty)
  const rng = makeRng(seed, 'play', k)
  let line: ChronologyCard[] = [round.anchor]
  let streak = newStreak()
  let strokes = 0
  let credits = 0
  let cleans = 0
  let mercies = 0
  for (const c of round.hand) {
    const estimate = c.year + (Math.floor(rng() * (2 * k + 1)) - k)
    let guess = 0
    for (const placed of line) if (placed.year < estimate) guess++
    const p = scorePlacement(c, line, guess)
    strokes += p.strokeDelta
    if (p.result === 'clean') cleans++
    const tight = gapTightness(line, p.correctSlot)
    const outcome = streakCredit(streak, p.result, tight)
    streak = outcome.state
    credits += -outcome.creditDelta
    if (outcome.mercyUsed) mercies++
    line = [...line.slice(0, p.correctSlot), c, ...line.slice(p.correctSlot)]
  }
  return { score: strokes - credits, cleans, credits, mercies }
}

const pct = (x: number) => `${(100 * x).toFixed(1)}%`
const quantile = (sorted: number[], q: number) => sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))]

function report(): void {
  console.log(`\n  CHRONOLOGY TUNING READOUT — ${ROUNDS} rounds per cell, real pool (${CHRONOLOGY_POOL.length} films)`)
  console.log(`  score = strokes − streak credits (golf: lower is better; negative = under par)\n`)

  for (const difficulty of DIFFICULTIES) {
    const label = difficulty === 'standard' ? 'standard (the daily)' : difficulty
    console.log(`  ── ${label} ──`)
    const scoresByModel: Record<string, number[]> = {}
    for (const model of MODELS) {
      const stats: RoundStats[] = []
      for (let i = 0; i < ROUNDS; i++) stats.push(playRound(`chrono-eval-${difficulty}-${i}`, model.k, difficulty))
      const scores = stats.map((s) => s.score).sort((a, b) => a - b)
      scoresByModel[model.name] = stats.map((s) => s.score)
      const cleanTotal = stats.reduce((a, s) => a + s.cleans, 0)
      const clean = wilson(cleanTotal, ROUNDS * HAND_SIZE)
      const perfect = wilson(stats.filter((s) => s.cleans === HAND_SIZE).length, ROUNDS)
      const parOrBetter = wilson(stats.filter((s) => s.score <= 0).length, ROUNDS)
      const mean = scoresByModel[model.name].reduce((a, b) => a + b, 0) / ROUNDS
      const credits = stats.reduce((a, s) => a + s.credits, 0) / ROUNDS
      const mercies = stats.reduce((a, s) => a + s.mercies, 0) / ROUNDS
      console.log(`  ${model.name.padEnd(11)} clean ${pctCI(clean)}   perfect ${pct(perfect.p)}   score ≤0 ${pct(parOrBetter.p)}`)
      console.log(
        `  ${''.padEnd(11)} score mean ${mean.toFixed(2)}  min ${scores[0]}  p25 ${quantile(scores, 0.25)}  median ${quantile(scores, 0.5)}  p75 ${quantile(scores, 0.75)}  p90 ${quantile(scores, 0.9)}  max ${scores[scores.length - 1]}   credits/rd ${credits.toFixed(2)}  mercy/rd ${mercies.toFixed(2)}`,
      )
    }
    // Skill headroom on this shape: same deals (paired by seed), naive − calibrated.
    // Formatted by hand: diffCI renders percentage points, but this gap is in
    // STROKES per round.
    const gap = pairedDiff(scoresByModel.naive, scoresByModel.calibrated)
    console.log(
      `  skill gap    naive − calibrated: +${gap.diff.toFixed(2)} strokes/round [${gap.lo.toFixed(2)}–${gap.hi.toFixed(2)}] ${gap.real ? 'REAL' : 'noise'}\n`,
    )
  }
}

report()
