// sim/chronology-verify.ts — the verify gate for Mode 3, Chronology.
//
//   node sim/chronology-verify.ts
//
// Gives Chronology its own verify discipline, the analog of the Duel's 60/60. It
// does two jobs (design/chronology.md, Phase 2):
//   1. assert placement scoring is correct (clean +0, misfire +1, correct slot
//      resolved by date including same-year ties, plus the streak / tight-call
//      mercy economy), and
//   2. measure the difficulty ramp: simulate a year-reasoning player and confirm
//      the clean rate falls as the line fills (gaps tighten), and that a
//      calibrated player beats a naive one on strokes.
//
// Sections and the PASS/FAIL printer mirror sim/verify.ts so the two gates read
// the same. This file is type-stripped by Node at run time, not part of tsconfig.

import {
  HAND_SIZE,
  TIGHT_GAP_YEARS,
  STREAK_TARGET,
  dealRound,
  dealRoundShaped,
  correctSlot,
  scorePlacement,
  gapTightness,
  streakCredit,
  newStreak,
  isLineSorted,
  type ChronologyCard,
  type ChronoDifficulty,
  type PlacementResult,
  type Round,
} from '../src/lib/chronology.ts'
import { readFileSync } from 'node:fs'
import { makeRng } from './rng.ts'
import { wilson, pairedDiff, pctCI, diffCI } from './stats.ts'

let passed = 0
let failed = 0

function check(name: string, cond: boolean, detail = ''): void {
  if (cond) {
    passed++
    console.log(`  \x1b[32m✓\x1b[0m ${name}`)
  } else {
    failed++
    console.log(`  \x1b[31m✗ ${name}\x1b[0m${detail ? `  — ${detail}` : ''}`)
  }
}

function section(title: string): void {
  console.log(`\n  ── ${title} ──`)
}

function note(msg: string): void {
  console.log(`  \x1b[33m·\x1b[0m ${msg}`)
}

function throws(fn: () => unknown): boolean {
  try {
    fn()
    return false
  } catch {
    return true
  }
}

// ── fixtures ──────────────────────────────────────────────────────────────

// The pool THE APP SHIPS. Post-A4 (docs/pool-unification.md) the gate verifies
// the derived artifact itself — src/data/chronology-pool.json, whose records are
// already ChronologyCard-shaped — instead of re-deriving from the retired seed.
// A date fix lands on the canonical movies.ts entry/stub, the build regenerates
// the JSON, and this gate reads the regenerated file: one source, no split
// brain. Read via fs (not import) so node needs no import-attribute and the
// app's Vite-flavored chronologyPool.ts wrapper stays out of the sim layer.
const SEED_POOL: ChronologyCard[] = JSON.parse(
  readFileSync(new URL('../src/data/chronology-pool.json', import.meta.url), 'utf8'),
)
const byId = new Map(SEED_POOL.map((c) => [c.id, c]))
const card = (id: string): ChronologyCard => {
  const c = byId.get(id)
  if (!c) throw new Error(`fixture missing: ${id}`)
  return c
}

// Canonical line order, mirroring the core's compare (date, then id). Used to
// build pre-sorted test lines so correctSlot's invariant is satisfied.
function sortLine(cards: ChronologyCard[]): ChronologyCard[] {
  return cards.slice().sort((a, b) => {
    if (a.releaseDate !== b.releaseDate) return a.releaseDate < b.releaseDate ? -1 : 1
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0
  })
}

console.log('\n  CHRONOLOGY VERIFY')
console.log(`  hand size ${HAND_SIZE}, tight-call window ${TIGHT_GAP_YEARS}y, streak target ${STREAK_TARGET}`)

// ═══════════════════════════════════════════════════════════════════════════
//  #1  SCORING CORRECTNESS
// ═══════════════════════════════════════════════════════════════════════════
function checkScoring(): void {
  section('#1  Scoring correctness (correct slot, deltas, ties)')

  // correctSlot places a card by date within a sorted line.
  const seventies = sortLine([card('jaws'), card('star-wars'), card('alien')])
  check('correctSlot: 1985 film lands after a 1970s line (end gap)', correctSlot(card('back-to-the-future'), seventies) === 3)
  const swAlien = sortLine([card('star-wars'), card('alien')])
  check('correctSlot: 1975 film lands before a [1977,1979] line (start gap)', correctSlot(card('jaws'), swAlien) === 0)

  // Same-year ties resolve by full DATE, the signature case (ruleset §1).
  check('same-year tie: toy-story (Nov) after se7en (Sep) on a [se7en] line', correctSlot(card('toy-story'), [card('se7en')]) === 1)
  check('same-year tie: se7en (Sep) before toy-story (Nov) on a [toy-story] line', correctSlot(card('se7en'), [card('toy-story')]) === 0)
  const around95 = sortLine([card('pulp-fiction'), card('toy-story')])
  check('same-year tie: se7en (1995-09) slots between 1994 and toy-story (1995-11)', correctSlot(card('se7en'), around95) === 1)

  // scorePlacement: clean is +0, misfire is +1, and both report the correct slot.
  const cleanHit = scorePlacement(card('back-to-the-future'), seventies, 3)
  check('scorePlacement: chosen == correct is clean, +0', cleanHit.result === 'clean' && cleanHit.strokeDelta === 0 && cleanHit.correctSlot === 3)
  const miss = scorePlacement(card('back-to-the-future'), seventies, 0)
  check('scorePlacement: chosen != correct is misfire, +1, still reports correct slot', miss.result === 'misfire' && miss.strokeDelta === 1 && miss.correctSlot === 3)

  // gapTightness: interior gaps report the neighbor year span; end gaps are open.
  const ramp = sortLine([card('jaws'), card('alien'), card('back-to-the-future')]) // 1975, 1979, 1985
  check('gapTightness: interior gap = neighbor year span (1979−1975 = 4)', gapTightness(ramp, 1) === 4)
  check('gapTightness: interior gap = neighbor year span (1985−1979 = 6)', gapTightness(ramp, 2) === 6)
  check('gapTightness: start gap is open-ended (Infinity)', gapTightness(ramp, 0) === Infinity)
  check('gapTightness: end gap is open-ended (Infinity)', gapTightness(ramp, 3) === Infinity)

  // The pre-sorted invariant is guarded, not silently mis-answered.
  const unsorted = [card('alien'), card('jaws')] // 1979 before 1975 — out of order
  check('correctSlot guards its pre-sorted invariant (throws on an unsorted line)', throws(() => correctSlot(card('star-wars'), unsorted)))
  check('isLineSorted: true for a sorted line', isLineSorted(seventies))
  check('isLineSorted: false for an unsorted line', !isLineSorted(unsorted))
}

// ═══════════════════════════════════════════════════════════════════════════
//  #2  STREAK + TIGHT-CALL ECONOMY  (one shared implementation)
// ═══════════════════════════════════════════════════════════════════════════
function checkStreak(): void {
  section('#2  Streak + tight-call mercy economy')

  const WIDE = 10 // a wide gap: not a tight call
  const TIGHT = 2 // within TIGHT_GAP_YEARS (3): a tight call

  check('newStreak starts empty', newStreak().streak === 0 && newStreak().mercyArmed === false)

  // Three clean placements credit −1 on the third and reset the counter.
  const a = streakCredit(newStreak(), 'clean', WIDE)
  const b = streakCredit(a.state, 'clean', WIDE)
  const c = streakCredit(b.state, 'clean', WIDE)
  check('streak of 3 clean credits −1 and pops the badge', c.creditDelta === -1 && c.badge === true)
  check('streak resets to 0 after the credit', c.state.streak === 0)
  check('no credit before the third clean', a.creditDelta === 0 && b.creditDelta === 0)

  // A plain misfire (no shield) resets the streak.
  const reset = streakCredit({ streak: 2, mercyArmed: false }, 'misfire', Infinity)
  check('misfire with no shield resets the streak', reset.state.streak === 0 && reset.mercyUsed === false)

  // Tight-call mercy: a clean into a tight gap arms a shield that survives one miss.
  const armed = streakCredit({ streak: 1, mercyArmed: false }, 'clean', TIGHT)
  check('clean into a tight gap arms the mercy shield', armed.state.mercyArmed === true && armed.state.streak === 2)
  const survived = streakCredit(armed.state, 'misfire', Infinity)
  check('armed shield: a misfire is absorbed, streak survives, shield spent', survived.mercyUsed === true && survived.state.streak === 2 && survived.state.mercyArmed === false)
  const resume = streakCredit(survived.state, 'clean', WIDE)
  check('after mercy, a clean still completes the streak credit', resume.creditDelta === -1 && resume.badge === true)

  // End gaps (Infinity) are never tight, so they never arm the shield.
  const endClean = streakCredit(newStreak(), 'clean', Infinity)
  check('clean into an open-ended end gap does NOT arm mercy', endClean.state.mercyArmed === false)

  // A credit-completing clean that is itself a tight call still re-arms the shield.
  const tightCredit = streakCredit({ streak: 2, mercyArmed: false }, 'clean', TIGHT)
  check('a tight clean that triggers the credit also re-arms mercy', tightCredit.creditDelta === -1 && tightCredit.state.mercyArmed === true && tightCredit.state.streak === 0)

  // Purity: streakCredit never mutates the state it was handed.
  const before = { streak: 2, mercyArmed: true }
  streakCredit(before, 'misfire', Infinity)
  check('streakCredit is pure (does not mutate prev)', before.streak === 2 && before.mercyArmed === true)
}

// ═══════════════════════════════════════════════════════════════════════════
//  #3  DETERMINISTIC DEAL
// ═══════════════════════════════════════════════════════════════════════════
function checkDeal(): void {
  section('#3  Deterministic deal')

  const r1 = dealRound('daily-2026-06-28', SEED_POOL, HAND_SIZE)
  const r2 = dealRound('daily-2026-06-28', SEED_POOL, HAND_SIZE)
  const ids = (r: typeof r1) => [r.anchor.id, ...r.hand.map((c) => c.id)]
  check('same seed → identical anchor and hand', ids(r1).join() === ids(r2).join())
  check('hand length equals handSize', r1.hand.length === HAND_SIZE)
  check('anchor is never also in the hand', !r1.hand.some((c) => c.id === r1.anchor.id))
  check('the dealt board is all-unique', new Set(ids(r1)).size === HAND_SIZE + 1)

  const r3 = dealRound('daily-2026-06-29', SEED_POOL, HAND_SIZE)
  check('different seed → different deal', ids(r1).join() !== ids(r3).join())

  check('dealRound refuses a too-small pool', throws(() => dealRound('x', SEED_POOL.slice(0, 5), HAND_SIZE)))
}

// ═══════════════════════════════════════════════════════════════════════════
//  #4  DIFFICULTY RAMP  (the skill-hypothesis check)
// ═══════════════════════════════════════════════════════════════════════════

// A synthetic, evenly-spread pool (two films per year, 1970–2025) so the ramp is
// measured over many varied rounds, not the 13-film sample. The even spread is
// the launch pool's defining property (PRD §8), so it is the right test bed.
function syntheticPool(): ChronologyCard[] {
  const pool: ChronologyCard[] = []
  for (let year = 1970; year <= 2025; year++) {
    for (const [tag, md] of [['a', '03-10'], ['b', '09-20']] as const) {
      pool.push({
        id: `f-${year}-${tag}`,
        title: `Film ${year}${tag}`,
        year,
        releaseDate: `${year}-${md}`,
        decade: Math.floor(year / 10) * 10,
        popularity: 0,
      })
    }
  }
  return pool
}

const RAMP_POOL = syntheticPool()

// One round played by a "year-reasoning" player: it knows each card's year only
// approximately (uniform integer noise ±k) and places by comparing that estimate
// against the years already on the line. After every placement the card lands in
// its CORRECT slot and the line stays sorted (the hard-placement rule), so the
// gaps genuinely tighten as the hand empties — which is what makes the ramp real.
function playRound(seed: string, k: number): { results: PlacementResult[]; strokes: number; sortedThroughout: boolean } {
  const round = dealRound(seed, RAMP_POOL, HAND_SIZE)
  const rng = makeRng(seed, 'play', k)
  let line: ChronologyCard[] = [round.anchor]
  const results: PlacementResult[] = []
  let strokes = 0
  let sortedThroughout = true
  for (const c of round.hand) {
    if (!isLineSorted(line)) sortedThroughout = false
    const estimate = c.year + (Math.floor(rng() * (2 * k + 1)) - k)
    let guess = 0
    for (const placed of line) if (placed.year < estimate) guess++
    const p = scorePlacement(c, line, guess)
    results.push(p.result)
    strokes += p.strokeDelta
    line = [...line.slice(0, p.correctSlot), c, ...line.slice(p.correctSlot)]
  }
  return { results, strokes, sortedThroughout }
}

function checkRamp(): void {
  section('#4  Difficulty ramp (clean rate falls as the line fills)')

  const ROUNDS = 800
  const RAMP_K = 3 // a representative year-reasoning player

  const clean = new Array(HAND_SIZE).fill(0)
  const total = new Array(HAND_SIZE).fill(0)
  let invariantHeld = true
  for (let i = 0; i < ROUNDS; i++) {
    const r = playRound(`ramp-${i}`, RAMP_K)
    if (!r.sortedThroughout) invariantHeld = false
    r.results.forEach((res, idx) => {
      total[idx]++
      if (res === 'clean') clean[idx]++
    })
  }
  check('line stays sorted through every placement (hard-placement invariant)', invariantHeld)

  // Per-index clean rate, printed so the trend is visible, not just asserted.
  const rate = clean.map((c, i) => c / total[i])
  note('clean rate by placement index (line grows left→right):')
  note('  ' + rate.map((p, i) => `#${i}:${(100 * p).toFixed(0)}%`).join('  '))

  // Compare the first third of placements (wide gaps) against the last third
  // (tight gaps) with Wilson intervals; a real downward trend means the early
  // interval sits entirely above the late one.
  const sum = (arr: number[], lo: number, hi: number) => arr.slice(lo, hi).reduce((a, b) => a + b, 0)
  const early = wilson(sum(clean, 0, 3), sum(total, 0, 3))
  const late = wilson(sum(clean, 7, 10), sum(total, 7, 10))
  note(`early placements (#0–2): ${pctCI(early)}`)
  note(`late  placements (#7–9): ${pctCI(late)}`)
  check('clean rate falls from early to late placements (point estimate)', early.p > late.p)
  check('the decline is statistically real (Wilson intervals do not overlap)', early.lo > late.hi)

  // Skill matters: a calibrated player (small noise) takes fewer strokes than a
  // naive one (large noise) on the SAME deals (paired, so luck cancels).
  const naive: number[] = []
  const calibrated: number[] = []
  for (let i = 0; i < ROUNDS; i++) {
    naive.push(playRound(`cmp-${i}`, 5).strokes)
    calibrated.push(playRound(`cmp-${i}`, 1).strokes)
  }
  const gap = pairedDiff(naive, calibrated)
  note(`naive − calibrated strokes per round: ${diffCI(gap)}`)
  check('a calibrated player beats a naive player on strokes (paired, real)', gap.diff > 0 && gap.real)

  // The easy/hard difficulty DIAL (wide-gap vs clustered deals, design §6) is a
  // Phase 5 layer on top of this uniform deal; its spread assertion is section #5.
  note('easy/hard deal-spread assertion lands in #5 (the difficulty dial)')
}

// ═══════════════════════════════════════════════════════════════════════════
//  #5  DIFFICULTY DIAL — DEAL SPREAD  (Phase 5: the dial is the deal)
// ═══════════════════════════════════════════════════════════════════════════

// The mean neighbor year-span of a full board (anchor + hand) once date-sorted —
// the yardstick for how spread-out a deal is. Easy should be wide, hard tight,
// with the SAME engine and scoring (the dial only changes the deal).
function meanNeighborSpan(round: Round): number {
  const sorted = sortLine([round.anchor, ...round.hand])
  let span = 0
  for (let i = 1; i < sorted.length; i++) span += sorted[i].year - sorted[i - 1].year
  return span / (sorted.length - 1)
}

function checkSpread(): void {
  section('#5  Difficulty dial — deal spread (easy wide vs hard tight)')

  const ids = (r: Round) => [r.anchor.id, ...r.hand.map((c) => c.id)]

  // The shaped deal is deterministic and well-formed for every shape.
  const e1 = dealRoundShaped('spread-seed', RAMP_POOL, 'easy')
  const e2 = dealRoundShaped('spread-seed', RAMP_POOL, 'easy')
  check('shaped deal is deterministic (same seed + difficulty → identical board)', ids(e1).join() === ids(e2).join())
  check('easy deal yields handSize+1 unique cards', e1.hand.length === HAND_SIZE && new Set(ids(e1)).size === HAND_SIZE + 1)
  const h1 = dealRoundShaped('spread-seed', RAMP_POOL, 'hard')
  check('hard deal yields handSize+1 unique cards', h1.hand.length === HAND_SIZE && new Set(ids(h1)).size === HAND_SIZE + 1)

  // The DAILY rides the uniform deal: the 'standard' shape is exactly dealRound,
  // so the date-seeded daily is the neutral board the rest of the gate covers.
  const std = dealRoundShaped('daily-2026-06-28', SEED_POOL, 'standard')
  const base = dealRound('daily-2026-06-28', SEED_POOL, HAND_SIZE)
  check("the daily's 'standard' shape is exactly the uniform deal", ids(std).join() === ids(base).join())

  // Over many seeds (paired by seed, so the pool is the only shared variable),
  // hard deals cluster tighter than easy deals spread. This is the PRD §9
  // secondary metric: the spread of difficulty between easy and hard.
  const ROUNDS = 400
  const easySpans: number[] = []
  const hardSpans: number[] = []
  for (let i = 0; i < ROUNDS; i++) {
    easySpans.push(meanNeighborSpan(dealRoundShaped(`spread-${i}`, RAMP_POOL, 'easy')))
    hardSpans.push(meanNeighborSpan(dealRoundShaped(`spread-${i}`, RAMP_POOL, 'hard')))
  }
  const avg = (a: number[]) => a.reduce((s, x) => s + x, 0) / a.length
  note(`mean neighbor span — easy ${avg(easySpans).toFixed(2)}y vs hard ${avg(hardSpans).toFixed(2)}y`)
  const gap = pairedDiff(easySpans, hardSpans)
  note(`easy − hard span per round: +${gap.diff.toFixed(2)}y [${gap.lo.toFixed(2)}–${gap.hi.toFixed(2)}] ${gap.real ? 'REAL' : 'noise'}`)
  check('hard deals are tighter than easy on average (point estimate)', avg(hardSpans) < avg(easySpans))
  check('the easy-vs-hard spread gap is statistically real (paired CI excludes 0)', gap.diff > 0 && gap.real)

  // Graceful degradation: a pool barely big enough for one board still deals a
  // hard round — the cluster window clamps to the whole pool instead of throwing.
  const thin = RAMP_POOL.slice(0, HAND_SIZE + 1)
  check('hard degrades gracefully on a thin pool (deals, not throws)', !throws(() => dealRoundShaped('thin', thin, 'hard' as ChronoDifficulty)))
}

// ── run ──────────────────────────────────────────────────────────────────
checkScoring()
checkStreak()
checkDeal()
checkRamp()
checkSpread()
console.log(`\n  ${passed} passed, ${failed} failed\n`)
process.exit(failed > 0 ? 1 : 0)
