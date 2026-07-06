// sim/solo-verify.ts — the verify gate for Mode 1, the Solo daily.
//
//   node sim/solo-verify.ts          (npm run verify:solo)
//
// Solo had ZERO headless coverage (the one hardcoded puzzle was solver-checked
// once at dev startup); now that the daily is GENERATED (src/lib/daily.ts), this
// gate bulk-proves the next 365 calendar days before anyone plays them:
//   1. every daily deals and is genuinely winnable — the solver's line is
//      re-validated move by move against sharedPeople, not just trusted,
//   2. par lands inside the formula's bounds and its distribution is sane
//      (min/median/max reported),
//   3. the generator is deterministic per seed, distinct across seeds, and
//      PINNED on a known date — the append-only guard: an algorithm change that
//      would silently reshuffle already-published dailies trips the pin.
//
// Sections and the PASS/FAIL printer mirror sim/verify.ts / chronology-verify.ts
// so the three gates read the same.

import { movieById } from '../src/data/movies.ts'
import { DUEL_POOL } from '../src/data/duelPool.ts'
import { dailySoloPuzzle, localDateSeed, SOLO_HAND_SIZE } from '../src/lib/daily.ts'
import { isSolvable, sharedPeople } from '../src/lib/solver.ts'
import type { Puzzle } from '../src/data/types.ts'

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

const DAYS = 365

// The year of seeds under test: today forward, in the player's local zone —
// exactly the strings SoloGame will feed dailySoloPuzzle on those days.
const base = new Date()
const seeds: string[] = []
for (let i = 0; i < DAYS; i++) {
  seeds.push(localDateSeed(new Date(base.getFullYear(), base.getMonth(), base.getDate() + i)))
}

console.log('\n  SOLO DAILY VERIFY')
console.log(`  ${DAYS} days from ${seeds[0]}, pool ${DUEL_POOL.length} films, hand ${SOLO_HAND_SIZE} + 1 starter`)

// One generation pass shared by all sections.
const puzzles: Puzzle[] = seeds.map((s) => dailySoloPuzzle(s, DUEL_POOL))

// ═══════════════════════════════════════════════════════════════════════════
//  #1  EVERY DAILY DEALS AND IS WINNABLE
// ═══════════════════════════════════════════════════════════════════════════
function checkSolvable(): void {
  section(`#1  Every daily deals & is winnable (${DAYS} seeds)`)

  let formedOk = true
  let solvedOk = true
  let lineOk = true
  let detail = ''
  for (let i = 0; i < puzzles.length; i++) {
    const p = puzzles[i]
    const board = [p.starterMovieId, ...p.handMovieIds]
    if (
      p.id !== `solo-${seeds[i]}` ||
      p.handMovieIds.length !== SOLO_HAND_SIZE ||
      new Set(board).size !== SOLO_HAND_SIZE + 1 ||
      board.some((id) => !movieById.has(id))
    ) {
      formedOk = false
      detail = detail || `malformed puzzle for ${seeds[i]}`
      continue
    }
    const order = isSolvable(p, DUEL_POOL)
    if (!order) {
      solvedOk = false
      detail = detail || `unsolvable daily for ${seeds[i]}`
      continue
    }
    // Re-validate the solver's line independently: right cards, starter first,
    // and every consecutive pair genuinely shares a person.
    const validLine =
      order[0] === p.starterMovieId &&
      order.length === board.length &&
      new Set(order).size === order.length &&
      order.every((id) => board.includes(id)) &&
      order.slice(1).every((id, j) => sharedPeople(movieById.get(order[j])!, movieById.get(id)!).length > 0)
    if (!validLine) {
      lineOk = false
      detail = detail || `solver line fails re-validation for ${seeds[i]}`
    }
  }
  check(`every puzzle well-formed (id, ${SOLO_HAND_SIZE}+1 unique pool cards)`, formedOk, detail)
  check('every daily is solver-winnable', solvedOk, detail)
  check('every winning line re-validates move by move (sharedPeople > 0)', lineOk, detail)
}

// ═══════════════════════════════════════════════════════════════════════════
//  #2  PAR DISTRIBUTION
// ═══════════════════════════════════════════════════════════════════════════
function checkPar(): void {
  section('#2  Par distribution (computed from the best line)')

  // Formula bounds: par = (hand+1) + 4 − bestCombo, combo ∈ [0..hand−1] → [6..12].
  const LO = SOLO_HAND_SIZE + 1 + 4 - (SOLO_HAND_SIZE - 1)
  const HI = SOLO_HAND_SIZE + 1 + 4
  const pars = puzzles.map((p) => p.par).sort((a, b) => a - b)
  const hist: Record<number, number> = {}
  for (const p of pars) hist[p] = (hist[p] ?? 0) + 1
  note(`min ${pars[0]} · median ${pars[Math.floor(DAYS / 2)]} · max ${pars[DAYS - 1]}`)
  note(`histogram: ${Object.entries(hist).map(([k, v]) => `par ${k}×${v}`).join('  ')}`)
  check(`every par within formula bounds [${LO}–${HI}]`, pars[0] >= LO && pars[DAYS - 1] <= HI, `saw ${pars[0]}–${pars[DAYS - 1]}`)
  check('pars vary across the year (not one flat value)', new Set(pars).size >= 3, `${new Set(pars).size} distinct`)
}

// ═══════════════════════════════════════════════════════════════════════════
//  #3  DETERMINISM, DISTINCTNESS & THE APPEND-ONLY PIN
// ═══════════════════════════════════════════════════════════════════════════
function checkDeterminism(): void {
  section('#3  Determinism, distinctness & the append-only pin')

  // Same seed → byte-identical puzzle, across the whole year.
  const detOk = puzzles.every((p, i) => JSON.stringify(p) === JSON.stringify(dailySoloPuzzle(seeds[i], DUEL_POOL)))
  check(`deterministic per seed (${DAYS}× regenerated identically)`, detOk)

  // Different days → different boards (catches a seed-ignoring bug).
  const distinct = new Set(puzzles.map((p) => [p.starterMovieId, ...p.handMovieIds].join('|'))).size
  check(`days are distinct (${distinct}/${DAYS} unique boards)`, distinct > DAYS * 0.95)

  // PIN — the append-only guard. 2026-07-03's daily, recorded at generator
  // birth. If an algorithm/pool change reshuffles it, every already-published
  // daily shifted with it: bump this pin ONLY with a conscious cutover plan.
  const pinned = dailySoloPuzzle('2026-07-03', DUEL_POOL)
  check(
    'pinned seed 2026-07-03 → Once Upon a Time in Hollywood board, par 9',
    pinned.starterMovieId === 'once-upon-a-time-in-hollywood' &&
      pinned.par === 9 &&
      pinned.handMovieIds.join() ===
        ['monsters-inc', 'joker', 'reservoir-dogs', 'the-irishman', 'the-godfather-part-ii', 'heat', 'taxi-driver'].join(),
    `got ${pinned.starterMovieId}, par ${pinned.par}`,
  )
}

// ── run ──────────────────────────────────────────────────────────────────
checkSolvable()
checkPar()
checkDeterminism()
console.log(`\n  ${passed} passed, ${failed} failed\n`)
process.exit(failed > 0 ? 1 : 0)
