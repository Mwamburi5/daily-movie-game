// src/lib/daily.ts — the date-seeded Solo daily (Mode 1).
//
// One generator, two callers — SoloGame deals today's puzzle from it at runtime
// and sim/solo-verify.ts bulk-checks a year of seeds through it — the project's
// parity-by-construction principle. This replaced the single hardcoded puzzle
// (src/data/puzzle.ts) on the daily path; that designed hand lives on as the
// menu's practice round.

import type { Movie, Puzzle } from '../data/types.ts'
import { makeRng, type Rng } from './rng.ts'
import { bestLine, sharedPeople } from './solver.ts'

// The player's LOCAL calendar date as 'YYYY-MM-DD', used directly as the daily
// seed (locked decision, from Chronology: "the same on the same calendar day" in
// the player's own zone, not a strict UTC global daily). Canonical home — both
// dailies import it from here so the rollover rule can't drift between modes.
export function localDateSeed(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// Solo's hand size (the board is this + 1 starter). Matches the designed
// marquee-001 shape, so practice and daily play identically.
export const SOLO_HAND_SIZE = 7

// Par = study the whole board (a flip per card, hand + starter) + two misplays'
// worth of slack (+4) − the best combo line the deal allows. So par tracks the
// hand's combo richness: a chain-heavy deal demands you FIND the chain to make
// par. For reference, the designed marquee-001 computes to 8 under this formula
// (its hand-set par of 9 is left as designed).
const PAR_SLACK = 4

// A rejection-sampled random deal is a dead end: a winnable board needs a full
// chain through every card (a Hamiltonian path from the starter), and at the
// pool's ~13% pairwise link density a random 8-card board holds ~3–4 links when
// a chain needs 7 — measured 0 solvable in 400 random deals. So the daily is
// built CONSTRUCTIVELY: walk the link graph starter → 7 successive unused
// neighbors (solvable by construction), then shuffle the hand so its display
// order never leaks the walk. Retries only cover the rare dead-end walk.
const MAX_ATTEMPTS = 50

// Fisher-Yates over a copy, driven by the seeded rng (same shape as chronology's).
function shuffle<T>(arr: T[], rng: Rng): T[] {
  const out = arr.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

// Deal the daily puzzle for a seed: deterministic, solver-GUARANTEED solvable,
// par computed from the solver's best line. Same (seed, pool) → same puzzle, so
// everyone sees the same board on the same day.
export function dailySoloPuzzle(seed: string, movies: Movie[]): Puzzle {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const rng = makeRng(seed, 'solo-deal', attempt)
    const pool = shuffle(movies, rng)
    const path = [pool[0]]
    const used = new Set([pool[0].id])
    while (path.length < SOLO_HAND_SIZE + 1) {
      const top = path[path.length - 1]
      const candidates = pool.filter((m) => !used.has(m.id) && sharedPeople(top, m).length > 0)
      if (candidates.length === 0) break // dead-end walk — redeal
      const next = candidates[Math.floor(rng() * candidates.length)]
      path.push(next)
      used.add(next.id)
    }
    if (path.length < SOLO_HAND_SIZE + 1) continue
    const puzzle: Puzzle = {
      id: `solo-${seed}`,
      starterMovieId: path[0].id,
      handMovieIds: shuffle(path.slice(1), rng).map((m) => m.id),
      par: 0, // placeholder until the solver prices the deal
    }
    // Solvable by construction (the walk itself is a winning order); the solver
    // pass re-proves it independently and prices the BEST line for par.
    const best = bestLine(puzzle, movies)
    if (!best) continue // unreachable, kept as a hard guarantee
    return { ...puzzle, par: SOLO_HAND_SIZE + 1 + PAR_SLACK - best.combo }
  }
  throw new Error(`daily.dailySoloPuzzle: no solvable deal within ${MAX_ATTEMPTS} attempts for seed "${seed}"`)
}
