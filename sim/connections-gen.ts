// sim/connections-gen.ts — WS2.1 content tool: the Connections cluster shopping
// list + a yield/diagnostic report over the credited pool. Runs BEFORE any new
// films are bought so the buy is driven by data, not vibes.
//
//   node sim/connections-gen.ts                          (npm run gen:connections)
//   node sim/connections-gen.ts --seed 2026-07-04        (demo deal for a seed)
//   node sim/connections-gen.ts --md docs/connections-yield.md
//
// THE ENGINE MOVED (W4 / 2026-07-07): the deterministic dealer + ambiguity gate
// that this file prototyped now live in src/lib/connections.ts (the mode deals
// from them at runtime — the app build graph is src/-only, so the engine can't
// live under sim/). This file keeps its author-time half — the shopping list and
// the CLI yield/accidental-group report — and imports the engine so the report,
// the standing verify, and the React mode all call the SAME dealGrid.
//
// WHAT THE ENGINE BUILDS (recap; full doc lives with the code): candidate 4×4
// Connections grids — 16 films, 4 hidden groups of 4 — from the credited pool,
// with the ambiguity gate (fit ⊇ sit ⇒ usable pools disjoint) and the dealer
// lock (person/series-first, ≤1 genre group). Also reported here (NOT gating —
// promoted to a real check in connections-verify): the "accidental group"
// diagnostic — four films drawn from four DIFFERENT intended groups that happen
// to share a person or genre, an alternative solution the puzzle would call wrong.

import { writeFileSync } from 'node:fs'
import { MOVIES } from '../src/data/movies.ts'
import { makeRng } from './rng.ts'
import {
  CATS,
  buildNets,
  buildKeys,
  usablePools,
  enumerateViable,
  sample,
  dealGrid,
  accidentalGroups,
  DEAL_TRIES,
} from '../src/lib/connections.ts'
import type { GroupCat, GroupKey, Grid } from '../src/lib/connections.ts'
import type { Movie } from '../src/data/types.ts'

// ── Shopping list ───────────────────────────────────────────────────────────
// Directors / actors / series with EXACTLY 3 qualifying films — one buy short of
// a group of 4. Ranked by how many new viable key-quadruples completing them
// unlocks, measured with a best-case phantom 4th film that carries ONLY the
// missing credit (a real film brings a genre and co-stars that can collide, so
// treat each unlock count as an upper bound; the human pick per name decides).
interface ShopItem {
  cat: GroupCat
  key: string
  have: string[]
  unlocked: number
}

export function shoppingList(pool: Movie[]): ShopItem[] {
  const nets = buildNets(pool)
  const keys = buildKeys(pool, nets)
  const big = keys.filter((k) => k.pool.length >= 4)
  const out: ShopItem[] = []
  for (const cand of keys) {
    if (cand.cat === 'genre' || cand.pool.length !== 3) continue
    const phantomId = `~phantom~${cand.cat}~${cand.key}`
    const phantomNets = new Map(nets)
    phantomNets.set(phantomId, {
      directorForm: new Set(cand.cat === 'director' ? [cand.key] : []),
      directorGate: new Set(cand.cat === 'director' ? [cand.key] : []),
      cast: new Set(cand.cat === 'actor' ? [cand.key] : []),
      persons: new Set(cand.cat === 'director' || cand.cat === 'actor' ? [cand.key] : []),
      series: cand.cat === 'series' ? cand.key : null,
      genre: '~phantom-genre~', // shares nothing — the best-case 4th film
    })
    const completed: GroupKey = { ...cand, pool: [...cand.pool, phantomId] }
    // Count viable quadruples CONTAINING the completed key: C(|big|, 3) checks.
    let unlocked = 0
    for (let a = 0; a < big.length; a++)
      for (let b = a + 1; b < big.length; b++)
        for (let c = b + 1; c < big.length; c++)
          if (usablePools([completed, big[a], big[b], big[c]], phantomNets)) unlocked++
    out.push({ cat: cand.cat, key: cand.key, have: cand.pool, unlocked })
  }
  out.sort((x, y) => y.unlocked - x.unlocked || x.key.localeCompare(y.key))
  return out
}

// ── CLI report ───────────────────────────────────────────────────────────────
const isMain = process.argv[1]?.endsWith('connections-gen.ts')

if (isMain) {
  const args = process.argv.slice(2)
  const argOf = (flag: string): string | null => {
    const i = args.indexOf(flag)
    return i >= 0 && args[i + 1] ? args[i + 1] : null
  }
  const seed = argOf('--seed') ?? '2026-07-04'
  const mdPath = argOf('--md')

  const titleOf = new Map(MOVIES.map((m) => [m.id, m.title]))
  const t = (id: string): string => titleOf.get(id) ?? id
  const nets = buildNets(MOVIES)
  const keys = buildKeys(MOVIES, nets)
  const md: string[] = []
  const say = (line = '') => {
    console.log(line)
    md.push(line.replace(/\x1b\[[0-9;]*m/g, ''))
  }
  const head = (s: string) => {
    console.log(`\n  \x1b[1m── ${s} ──\x1b[0m`)
    md.push(`\n## ${s}\n`)
  }

  console.log('\n  CONNECTIONS GRID GENERATOR — yield & cluster shopping list')
  md.push('# Connections yield & cluster shopping list')
  md.push(
    `\nEmitted by \`npm run gen:connections\` (sim/connections-gen.ts) on the credited pool. Re-run per wave — the ambiguity gate must hold on every pool bump (PLAN.md WS2).\n`,
  )
  say(`  pool: ${MOVIES.length} credited films (src/data/movies.ts)`)

  head('Key census (formation pools)')
  for (const cat of CATS) {
    const of = keys.filter((k) => k.cat === cat)
    const ready = of.filter((k) => k.pool.length >= 4)
    const short = of.filter((k) => k.pool.length === 3)
    say(`  ${cat}: ${ready.length} group-ready (≥4 films) · ${short.length} at exactly 3`)
    if (ready.length > 0)
      say(`    ready: ${ready.map((k) => `${k.key} (${k.pool.length})`).join(' · ')}`)
  }

  head('Yield')
  const viable = enumerateViable(keys, nets)
  const bigKeys = keys.filter((k) => k.pool.length >= 4)
  const quadCandidates =
    (bigKeys.length * (bigKeys.length - 1) * (bigKeys.length - 2) * (bigKeys.length - 3)) / 24
  const totalGrids = viable.reduce((acc, v) => acc + v.grids, 0n)
  say(`  viable key-quadruples (≥1 unambiguous grid): ${viable.length} of ${quadCandidates} candidate key-sets`)
  say(`  distinct film-level grids across them: ${totalGrids.toLocaleString('en-US')}`)
  say(`  (a "distinct puzzle" in the meaningful sense = a key-quadruple; film-level`)
  say(`   variety within one quadruple mostly reshuffles genre filler)`)
  const mix = new Map<string, number>()
  for (const v of viable) {
    const m = v.quad.map((g) => g.cat[0]).sort().join('')
    mix.set(m, (mix.get(m) ?? 0) + 1)
  }
  const mixLine = [...mix.entries()]
    .sort((x, y) => y[1] - x[1])
    .map(([k, n]) => `${k}×${n}`)
    .join(' · ')
  say(`  category mixes (d/a/s/g per key-set): ${mixLine || 'none'}`)

  head('Accidental-group diagnostic (NOT gating — proposed WS4 check)')
  const STRICT_TRIES = 8
  // Past wave 1 the viable space is in the hundreds of thousands — checking every
  // set would take hours, so the diagnostic runs on a seeded sample and reports
  // rates. Under the cap (the original 89-film pool) it still checks every set,
  // with the same per-index rng stream, so pre-wave numbers reproduce exactly.
  const DIAG_CAP = 20000
  const sampled = viable.length <= DIAG_CAP
    ? viable.map((v, i) => [v, i] as const)
    : (() => {
        const rng = makeRng('yield-diagnostic-sample')
        const idx = new Set<number>()
        while (idx.size < DIAG_CAP) idx.add(Math.floor(rng() * viable.length))
        return [...idx].sort((a, b) => a - b).map((i) => [viable[i], i] as const)
      })()
  if (sampled.length < viable.length)
    say(`  (diagnostic sampled ${sampled.length.toLocaleString('en-US')} of ${viable.length.toLocaleString('en-US')} viable key-sets — rates, not totals)`)
  let dirtyFirst = 0
  let strictOk = 0
  const offenders = new Map<string, number>()
  for (const [v, i] of sampled) {
    const rng = makeRng('yield-example', i)
    const pools = usablePools(v.quad, nets)!
    let clean = false
    for (let tries = 0; tries < STRICT_TRIES && !clean; tries++) {
      const grid: Grid = {
        groups: v.quad.map((g, gi) => ({ cat: g.cat, key: g.key, films: sample(pools[gi], 4, rng) })),
      }
      const acc = accidentalGroups(grid, nets)
      if (acc.length === 0) clean = true
      else if (tries === 0) {
        dirtyFirst++
        for (const a of acc) offenders.set(a.key, (offenders.get(a.key) ?? 0) + 1)
      }
    }
    if (clean) strictOk++
  }
  say(`  first sampled grid per checked key-set: ${dirtyFirst}/${sampled.length} contain a coherent`)
  say(`  4-set spanning groups (an alternative solution the puzzle would call wrong)`)
  const worst = [...offenders.entries()].sort((x, y) => y[1] - x[1]).slice(0, 6)
  if (worst.length > 0) say(`  most frequent: ${worst.map(([k, n]) => `${k} ×${n}`).join(' · ')}`)
  say(`  STRICT yield (≥1 accidental-free grid within ${STRICT_TRIES} seeded tries):`)
  const strictRate = strictOk / sampled.length
  const strictEst = sampled.length < viable.length
    ? ` ≈ ${Math.round(strictRate * viable.length).toLocaleString('en-US')} of ${viable.length.toLocaleString('en-US')} extrapolated`
    : ''
  say(`  ${strictOk}/${sampled.length} checked key-sets${strictEst} — lower bound; the dealer retries up to ${DEAL_TRIES}`)

  head(`Demo deal (seed "${seed}")`)
  const grid = dealGrid(seed)
  for (const g of grid.groups) say(`  [${g.cat}] ${g.key}: ${g.films.map(t).join(' · ')}`)
  const demoAcc = accidentalGroups(grid, nets)
  say(
    demoAcc.length === 0
      ? '  accidental-free ✓'
      : `  ⚠ accidental group(s) survived ${DEAL_TRIES} tries: ${demoAcc.map((a) => a.key).join(' · ')}`,
  )
  const again = dealGrid(seed)
  say(
    JSON.stringify(grid) === JSON.stringify(again)
      ? '  determinism: same seed re-dealt identically ✓'
      : '  determinism: RE-DEAL DIFFERED ✗ (bug)',
  )

  head('Cluster shopping list (one film short of a group of 4)')
  say('  unlock counts use a best-case phantom 4th film (only the missing credit);')
  say('  a real pick can land lower if its genre/co-stars collide. Human pass decides.')
  say('')
  const shop = shoppingList(MOVIES)
  for (const s of shop.filter((s) => s.unlocked > 0))
    say(`  +${String(s.unlocked).padStart(3)} key-sets · ${s.cat.padEnd(8)} ${s.key} — has: ${s.have.map(t).join(' · ')}`)
  const zeros = shop.filter((s) => s.unlocked === 0)
  if (zeros.length > 0) {
    say('')
    say(`  ${zeros.length} more at exactly 3 unlock nothing even completed (their films`)
    say(`  collide with every partner key): ${zeros.map((s) => `${s.key} (${s.cat})`).join(' · ')}`)
  }

  say('')
  if (mdPath) {
    writeFileSync(mdPath, md.join('\n') + '\n')
    console.log(`  report written to ${mdPath}\n`)
  }
}
