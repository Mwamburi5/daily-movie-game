// title-fit-inventory.ts — Goal 4 reproducible Connections title-fit corpus.
//
//   node audit/daily-duel-216-launch-readiness-2026-08-27/title-fit-inventory.ts
//
// Read-only evidence tooling: enumerates every title that can appear on a
// Connections tile (union of all 365 baked grids), reruns the EXACT
// tileFontSize math from src/ConnectionsGame.tsx, and flags the two places
// where the floor can break the fit guarantee:
//   width-floor  — longest unbreakable segment needs < 7px to fit the worst-case
//                  69px content line (segment > 13 chars), so at the 7px floor
//                  the segment relies on break-word;
//   clamp-floor  — total length needs < 7px to fit the 5-line clamp
//                  (totalLen > 460/7 ≈ 65.7 chars), so at the floor the clamp
//                  could truncate.
// It then scores each grid by tile density and prints the serving daily dates
// (anchor 2026-07-06 + index) for the densest boards, so the screenshot matrix
// captures real worst-case dailies rather than synthetic strings.

import { readFileSync } from 'node:fs'
import { MOVIES } from '../../src/data/movies.ts'

// exact clone of src/ConnectionsGame.tsx tileFontSize (W5c, recalibrated W5d)
function tileFontSize(title: string): number {
  const longest = title
    .split(/[\s-]+/)
    .reduce((a, w) => (w.length > a.length ? w : a), '')
  const totalLen = title.replace(/\s+/g, ' ').trim().length || 1
  const raw = Math.min(91 / longest.length, 460 / totalLen)
  return Math.max(7, Math.min(10.5, Math.floor(raw)))
}

const titleById = new Map(MOVIES.map((m) => [m.id, m.title]))
const data = JSON.parse(
  readFileSync(new URL('../../src/data/connections-grids.json', import.meta.url), 'utf8'),
)
const grids: { groups: { cat: string; key: string; films: string[] }[] }[] = data.grids

const usedIds = new Set<string>()
for (const g of grids) for (const grp of g.groups) for (const f of grp.films) usedIds.add(f)

interface Row {
  id: string
  title: string
  totalLen: number
  longestSeg: number
  fitPx: number
  estLines: number
  widthFloor: boolean
  clampFloor: boolean
}

const rows: Row[] = [...usedIds].map((id) => {
  const title = titleById.get(id) ?? id
  const longestSeg = title.split(/[\s-]+/).reduce((a, w) => (w.length > a.length ? w : a), '').length
  const totalLen = title.replace(/\s+/g, ' ').trim().length
  const fitPx = tileFontSize(title)
  // chars per 69px worst-case line at fitPx (0.73px/char/px, the component's own
  // measured Domine constant); lines the full title needs at that size
  const charsPerLine = 69 / (0.73 * fitPx)
  const estLines = Math.ceil(totalLen / charsPerLine)
  return {
    id,
    title,
    totalLen,
    longestSeg,
    fitPx,
    estLines,
    widthFloor: 91 / longestSeg < 7,
    clampFloor: 460 / totalLen < 7,
  }
})

rows.sort((a, b) => a.fitPx - b.fitPx || b.totalLen - a.totalLen)

const floors = rows.filter((r) => r.fitPx === 7)
const widthFloor = rows.filter((r) => r.widthFloor)
const clampFloor = rows.filter((r) => r.clampFloor)

console.log(`corpus: ${rows.length} unique titles across ${grids.length} grids (pool ${data.pool}, anchor ${data.anchor})`)
console.log(`fit distribution: ${[7, 8, 9, 10].map((px) => `${px}px×${rows.filter((r) => r.fitPx === px).length}`).join('  ')}`)
console.log(`width-floor breaches (segment > 13 chars): ${widthFloor.length}`)
for (const r of widthFloor) console.log(`  ${r.id} "${r.title}" seg=${r.longestSeg} len=${r.totalLen}`)
console.log(`clamp-floor breaches (totalLen > 65): ${clampFloor.length}`)
for (const r of clampFloor) console.log(`  ${r.id} "${r.title}" len=${r.totalLen} estLines=${r.estLines}`)
console.log(`\nworst 15 by fit then length:`)
for (const r of rows.slice(0, 15))
  console.log(
    `  ${r.fitPx}px  len=${String(r.totalLen).padStart(2)}  seg=${String(r.longestSeg).padStart(2)}  estLines=${r.estLines}  ${r.title}`,
  )

// grid density: worst board = most floor/near-floor tiles, tiebreak by summed
// (10.5 - fitPx). Serving date = anchor + index (dailyConnectionsGrid contract).
const anchorUtc = Date.UTC(2026, 6, 6)
const dateOf = (idx: number) => new Date(anchorUtc + idx * 86_400_000).toISOString().slice(0, 10)
const gridScores = grids.map((g, idx) => {
  const titles = g.groups.flatMap((grp) => grp.films).map((id) => titleById.get(id) ?? id)
  const fits = titles.map(tileFontSize)
  const dense = fits.filter((px) => px <= 8).length
  const score = fits.reduce((a, px) => a + (10.5 - px), 0)
  const longest = titles.reduce((a, t) => (t.length > a.length ? t : a), '')
  return { idx, date: dateOf(idx), dense, score: Math.round(score * 10) / 10, longest }
})
gridScores.sort((a, b) => b.dense - a.dense || b.score - a.score)
console.log(`\ndensest 8 grids (tiles at ≤8px | summed shrink | serving daily date):`)
for (const g of gridScores.slice(0, 8))
  console.log(`  grid ${String(g.idx).padStart(3)}  ${g.date}  dense=${g.dense}  score=${g.score}  longest="${g.longest}"`)

// grids that carry the single worst titles, so the capture can show them live
const worstIds = new Set(rows.slice(0, 6).map((r) => r.id))
console.log(`\ngrids carrying the 6 worst titles:`)
for (const g of grids.map((grid, idx) => ({ grid, idx }))) {
  const hits = g.grid.groups.flatMap((grp) => grp.films).filter((id) => worstIds.has(id))
  if (hits.length) console.log(`  grid ${String(g.idx).padStart(3)}  ${dateOf(g.idx)}  carries: ${hits.join(', ')}`)
}
