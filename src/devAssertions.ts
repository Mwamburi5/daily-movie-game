import { CHRONOLOGY_POOL } from './data/chronologyPool.ts'
import { DUEL_POOL } from './data/duelPool.ts'
import { PUZZLE } from './data/puzzle.ts'
import { type ChronoDifficulty, HAND_SIZE, dealRoundShaped, isLineSorted } from './lib/chronology.ts'
import { dailySoloPuzzle, localDateSeed } from './lib/daily.ts'
import * as progress from './lib/progress.ts'
import { isSolvable } from './lib/solver.ts'

// Development-only assertions are imported dynamically behind import.meta.env.DEV
// in main.tsx. Production replaces that guard with false and drops this entire
// module and its movie pools from the entry graph.
export function runDevAssertions() {
  ;(window as unknown as Record<string, unknown>).__matchcutProgress = progress

  const order = isSolvable(PUZZLE, DUEL_POOL)
  console.assert(order !== null, '[matchcut] Bundled practice puzzle is NOT solvable — fix src/data')
  if (order) {
    const title = (id: string) => DUEL_POOL.find((m) => m.id === id)?.title ?? id
    console.info('[matchcut] practice puzzle solvable, e.g.:', order.map(title).join(' → '))
  }

  const daily = dailySoloPuzzle(localDateSeed(), DUEL_POOL)
  console.assert(isSolvable(daily, DUEL_POOL) !== null, '[matchcut] Solo daily is NOT solvable — check lib/daily.ts')
  console.info(`[matchcut] solo daily ok: ${daily.id}, par ${daily.par}`)

  for (const difficulty of ['easy', 'standard', 'hard'] as ChronoDifficulty[]) {
    const round = dealRoundShaped(`chronology-dev-${difficulty}`, CHRONOLOGY_POOL, difficulty)
    const ids = new Set([round.anchor.id, ...round.hand.map((card) => card.id)])
    console.assert(
      isLineSorted([round.anchor]) && round.hand.length === HAND_SIZE && ids.size === HAND_SIZE + 1,
      `[matchcut] Chronology '${difficulty}' deal is invalid — check src/data/chronology-pool.json`,
    )
  }
  console.info(`[matchcut] chronology pool ok: ${CHRONOLOGY_POOL.length} films, all difficulties deal`)
}
