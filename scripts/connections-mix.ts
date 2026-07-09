// scripts/connections-mix.ts — category-mix / grid-hardness readout for the
// baked Connections daily window. Reads src/data/connections-grids.json (the
// pinned 365-day bake) and reports how the four category kinds
// (director/actor/series/genre) are distributed across the daily grids.
//
//   node scripts/connections-mix.ts
//
// This is the evidence for the W5b "category-diversity constraint" decision
// (master-plan Flag 5): if the mix skews to all-actor boards, a dealer
// constraint may be warranted — but that's a never-trivial re-bake, so we
// decide it with this histogram in hand, not blind. Re-run after any pool
// growth (P2) — the mix shifts as directors/series enter the pool.

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const baked = JSON.parse(readFileSync(join(here, '../src/data/connections-grids.json'), 'utf8')) as {
  anchor: string
  days: number
  grids: { groups: { cat: string }[] }[]
}

const CAT_LETTER: Record<string, string> = { director: 'd', actor: 'a', series: 's', genre: 'g' }
const N = baked.grids.length

// Per-grid "shape" = the sorted multiset of category letters, e.g. 'aaaa' (four
// actors), 'aaad' (three actors + a director). Distinct shapes ranked by count.
const shapeCount = new Map<string, number>()
const catTotals: Record<string, number> = { director: 0, actor: 0, series: 0, genre: 0 }
const distinctCatsHist = new Map<number, number>() // #distinct categories in a grid → count
let genreGrids = 0
let multiGenreGrids = 0 // must be 0 — the dealer lock caps genre at ≤1/grid

for (const grid of baked.grids) {
  const cats = grid.groups.map((g) => g.cat)
  cats.forEach((c) => (catTotals[c] = (catTotals[c] ?? 0) + 1))
  const shape = cats.map((c) => CAT_LETTER[c] ?? '?').sort().join('')
  shapeCount.set(shape, (shapeCount.get(shape) ?? 0) + 1)
  const distinct = new Set(cats).size
  distinctCatsHist.set(distinct, (distinctCatsHist.get(distinct) ?? 0) + 1)
  const genres = cats.filter((c) => c === 'genre').length
  if (genres >= 1) genreGrids++
  if (genres > 1) multiGenreGrids++
}

const pct = (n: number) => `${((n / N) * 100).toFixed(1)}%`

console.log(`\n  CONNECTIONS CATEGORY-MIX READOUT — ${N}-day baked window (anchor ${baked.anchor})`)
console.log(`  shape = the 4 group kinds per grid, sorted (d=director a=actor s=series g=genre)\n`)

console.log('  ── grid shapes (most common first) ──')
;[...shapeCount.entries()]
  .sort((a, b) => b[1] - a[1])
  .forEach(([shape, n]) => console.log(`    ${shape}   ${String(n).padStart(3)}   ${pct(n)}`))

console.log('\n  ── distinct categories per grid ──')
;[...distinctCatsHist.entries()]
  .sort((a, b) => a[0] - b[0])
  .forEach(([d, n]) => console.log(`    ${d} distinct   ${String(n).padStart(3)}   ${pct(n)}`))

console.log('\n  ── group-kind totals (of ' + N * 4 + ' groups) ──')
Object.entries(catTotals)
  .sort((a, b) => b[1] - a[1])
  .forEach(([c, n]) => console.log(`    ${c.padEnd(9)} ${String(n).padStart(4)}   ${pct(n / 4)} of grids carry one on avg`))

console.log('\n  ── genre-group cap (dealer lock: ≤1 genre/grid) ──')
console.log(`    grids with a genre group: ${genreGrids} (${pct(genreGrids)})`)
console.log(`    grids with >1 genre group: ${multiGenreGrids}  ${multiGenreGrids === 0 ? '✓ cap holds' : '✗ CAP VIOLATED'}`)
console.log('')
