import { StrictMode, type ComponentType } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { DUEL_POOL } from './data/duelPool.ts'
import { PUZZLE } from './data/puzzle.ts'
import { isSolvable } from './lib/solver.ts'
import { dailySoloPuzzle, localDateSeed } from './lib/daily.ts'
import { CHRONOLOGY_POOL } from './data/chronologyPool.ts'
import { type ChronoDifficulty, HAND_SIZE, dealRoundShaped, isLineSorted } from './lib/chronology.ts'
import * as progress from './lib/progress.ts'

if (import.meta.env.DEV) {
  // Dev hook for the WS1 meta-state: lets a console (or the preview tools)
  // simulate finishes on arbitrary seeds — tomorrow's continuation, a gap-day
  // reset — without waiting for real midnights. Dev only, never bundled live.
  ;(window as unknown as Record<string, unknown>).__matchcutProgress = progress
  const order = isSolvable(PUZZLE, DUEL_POOL)
  console.assert(order !== null, '[matchcut] Bundled practice puzzle is NOT solvable — fix src/data')
  if (order) {
    const title = (id: string) => DUEL_POOL.find((m) => m.id === id)?.title ?? id
    console.info('[matchcut] practice puzzle solvable, e.g.:', order.map(title).join(' → '))
  }

  // Today's generated Solo daily: solvable by construction (walk deal + solver
  // pass); this asserts the whole pipeline end-to-end before the mode renders.
  // The year-of-seeds bulk gate is sim/solo-verify.ts (`npm run verify:solo`).
  const daily = dailySoloPuzzle(localDateSeed(), DUEL_POOL)
  console.assert(isSolvable(daily, DUEL_POOL) !== null, '[matchcut] Solo daily is NOT solvable — check lib/daily.ts')
  console.info(`[matchcut] solo daily ok: ${daily.id}, par ${daily.par}`)

  // Chronology analog: confirm the bundled pool deals a valid round under EVERY
  // difficulty shape (the anchor is a one-card sorted line, the hand is a full
  // handSize of unique cards) before the mode renders. Covers the daily's
  // 'standard' deal and both practice spreads from the same shared pool.
  for (const d of ['easy', 'standard', 'hard'] as ChronoDifficulty[]) {
    const round = dealRoundShaped(`chronology-dev-${d}`, CHRONOLOGY_POOL, d)
    const ids = new Set([round.anchor.id, ...round.hand.map((c) => c.id)])
    console.assert(
      isLineSorted([round.anchor]) && round.hand.length === HAND_SIZE && ids.size === HAND_SIZE + 1,
      `[matchcut] Chronology '${d}' deal is invalid — check src/data/chronology-pool.json`,
    )
  }
  console.info(`[matchcut] chronology pool ok: ${CHRONOLOGY_POOL.length} films, all difficulties deal`)
}

// Dev-only preview harness (Wave 0, docs/orchestration-plan.md): lets a forge
// agent verify a new component in isolation via ?preview=<name>, with zero
// shared-file edits beyond this block — it just adds a .preview.tsx file.
// The glob is lazy (no `eager: true`) so preview modules are only fetched
// when asked for, and the whole branch is gated on import.meta.env.DEV so it
// tree-shakes out of the prod bundle entirely.
if (import.meta.env.DEV) {
  const previewName = new URLSearchParams(window.location.search).get('preview')
  if (previewName) {
    const previewModules = import.meta.glob('./components/previews/*.preview.tsx')
    const entry = Object.entries(previewModules).find(
      ([path]) => path.split('/').pop() === `${previewName}.preview.tsx`,
    )
    if (entry) {
      const [, loader] = entry
      loader().then((mod) => {
        const Preview = (mod as { default: ComponentType }).default
        createRoot(document.getElementById('root')!).render(
          <StrictMode>
            <Preview />
          </StrictMode>,
        )
      })
    } else {
      const names = Object.keys(previewModules).map((path) => path.split('/').pop()!.replace('.preview.tsx', ''))
      createRoot(document.getElementById('root')!).render(
        <StrictMode>
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-8 text-center">
            <p className="font-serif text-lg font-black italic">No preview named "{previewName}"</p>
            <p className="text-sm text-[#7d7563]">
              {names.length ? `Available: ${names.join(', ')}` : 'No preview files found.'}
            </p>
          </div>
        </StrictMode>,
      )
    }
  } else {
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  }
} else {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
