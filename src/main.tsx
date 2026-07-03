import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { MOVIES } from './data/movies.ts'
import { PUZZLE } from './data/puzzle.ts'
import { isSolvable } from './lib/solver.ts'
import { dailySoloPuzzle, localDateSeed } from './lib/daily.ts'
import { CHRONOLOGY_POOL } from './data/chronologyPool.ts'
import { type ChronoDifficulty, HAND_SIZE, dealRoundShaped, isLineSorted } from './lib/chronology.ts'

if (import.meta.env.DEV) {
  const order = isSolvable(PUZZLE, MOVIES)
  console.assert(order !== null, '[marquee] Bundled practice puzzle is NOT solvable — fix src/data')
  if (order) {
    const title = (id: string) => MOVIES.find((m) => m.id === id)?.title ?? id
    console.info('[marquee] practice puzzle solvable, e.g.:', order.map(title).join(' → '))
  }

  // Today's generated Solo daily: solvable by construction (walk deal + solver
  // pass); this asserts the whole pipeline end-to-end before the mode renders.
  // The year-of-seeds bulk gate is sim/solo-verify.ts (`npm run verify:solo`).
  const daily = dailySoloPuzzle(localDateSeed(), MOVIES)
  console.assert(isSolvable(daily, MOVIES) !== null, '[marquee] Solo daily is NOT solvable — check lib/daily.ts')
  console.info(`[marquee] solo daily ok: ${daily.id}, par ${daily.par}`)

  // Chronology analog: confirm the bundled pool deals a valid round under EVERY
  // difficulty shape (the anchor is a one-card sorted line, the hand is a full
  // handSize of unique cards) before the mode renders. Covers the daily's
  // 'standard' deal and both practice spreads from the same shared pool.
  for (const d of ['easy', 'standard', 'hard'] as ChronoDifficulty[]) {
    const round = dealRoundShaped(`chronology-dev-${d}`, CHRONOLOGY_POOL, d)
    const ids = new Set([round.anchor.id, ...round.hand.map((c) => c.id)])
    console.assert(
      isLineSorted([round.anchor]) && round.hand.length === HAND_SIZE && ids.size === HAND_SIZE + 1,
      `[marquee] Chronology '${d}' deal is invalid — check src/data/chronology-pool.json`,
    )
  }
  console.info(`[marquee] chronology pool ok: ${CHRONOLOGY_POOL.length} films, all difficulties deal`)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
