// sim/connections-verify.ts — the standing verify gate for Mode 4, Connections.
//
//   node sim/connections-verify.ts        (npm run verify:connections)
//
// connections-gen.ts has the deterministic dealer + the ambiguity gate, but no
// standing gate proved a YEAR of dailies at once. This does, mirroring
// sim/solo-verify.ts move for move: 365 consecutive local-calendar seeds derived
// with the SAME localDateSeed both dailies feed their generators — so a given
// date maps to the same seed string in either gate and the two daily gates agree
// on what "a year of dailies" means. One deliberate difference from solo: the window is
// ANCHORED to a fixed date, not rolled from today. A standing digest pin needs
// reproducible grids — a window that slides each run can't be pinned and makes
// the gate itself non-reproducible. The dealer's grids only move when the pool
// moves, and a pool change re-runs this gate, so a fixed anchor loses no coverage
// while gaining a stable pin over exactly the grids it asserts. Each grid:
//   1. SOLVABLE   — 16 cards partition exactly into the 4 intended groups of 4,
//                   and every film genuinely SITS in its assigned group,
//   2. UNAMBIGUOUS— no film FITS ≥2 of the grid's groups, rechecked from the
//                   Movie data with our OWN predicates (not the dealer's gate —
//                   a bug in the dealer's fit() must not hide from its verifier),
//   3. DISTINCT   — 16 unique film ids, 4 distinct group keys,
//   4. LOCK       — ≤ MAX_GENRE_GROUPS genre groups, and the person/series-first
//                   ordering shows up: any genre key sits LAST in the group list,
//   5. DETERMINISTIC — same seed re-dealt twice is byte-identical,
//   6. PIN        — an append-only digest over all 365 grids. Any dealer/pool
//                   change that reshuffles an already-published grid trips it;
//                   bump it ONLY with a conscious cutover, exactly like solo's.
//
// Sections and the PASS/FAIL printer mirror sim/verify.ts / solo-verify.ts /
// chronology-verify.ts so the four gates read the same.

import { createHash } from 'node:crypto'
import { MOVIES } from '../src/data/movies.ts'
import { localDateSeed } from '../src/lib/daily.ts'
import { readFileSync } from 'node:fs'
import { dealGrid, MAX_GENRE_GROUPS } from '../src/lib/connections.ts'
import type { GroupCat, Grid } from '../src/lib/connections.ts'
import type { Movie } from '../src/data/types.ts'

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
const GROUP_SIZE = 4 // 4 groups of 4 = the 16-card board

// Independent credit predicates, rebuilt from the Movie data so this gate does
// NOT lean on the dealer's own sits()/fits()/nets (they aren't exported, and
// borrowing them would let one bug pass its own inspection). Same semantics as
// connections-gen's header: a film SITS in a director group only if it DIRECTED
// it, but FITS (and so would poison) that group if it directed OR wrote it;
// actor groups use the full cast both ways; series/genre are exact both ways.
interface Net {
  directorForm: Set<string>
  directorGate: Set<string>
  cast: Set<string>
  series: string | null
  genre: string
}
function netOf(m: Movie): Net {
  return {
    directorForm: new Set(m.director),
    directorGate: new Set([...m.director, ...m.writers]),
    cast: new Set([...m.topCast, ...(m.deepCast ?? [])]),
    series: m.series ?? null,
    genre: m.genre,
  }
}
function sits(n: Net, cat: GroupCat, key: string): boolean {
  if (cat === 'director') return n.directorForm.has(key)
  if (cat === 'actor') return n.cast.has(key)
  if (cat === 'series') return n.series === key
  return n.genre === key
}
function fits(n: Net, cat: GroupCat, key: string): boolean {
  if (cat === 'director') return n.directorGate.has(key)
  if (cat === 'actor') return n.cast.has(key)
  if (cat === 'series') return n.series === key
  return n.genre === key
}

const nets = new Map<string, Net>(MOVIES.map((m) => [m.id, netOf(m)]))

// The year of seeds under test: 365 consecutive local-calendar days from the
// anchor, built with localDateSeed exactly as the WS4 daily and solo-verify build
// theirs. ANCHOR is the dealer-birth date (2026-07-06) and is FIXED so every run
// asserts and pins the same grids (see the header). new Date(y, m, d+i) rolls
// month/year boundaries for us — no date math beyond that.
const ANCHOR = { y: 2026, m: 6, d: 6 } // m is 0-based: 6 = July
const seeds: string[] = []
for (let i = 0; i < DAYS; i++) {
  seeds.push(localDateSeed(new Date(ANCHOR.y, ANCHOR.m, ANCHOR.d + i)))
}

console.log('\n  CONNECTIONS DAILY VERIFY')
console.log(`  ${DAYS} days from ${seeds[0]} (anchored), pool ${MOVIES.length} films, grid ${GROUP_SIZE}×${GROUP_SIZE}`)

// One deal pass shared by every section.
const grids: Grid[] = seeds.map((s) => dealGrid(s))

// A stable, order-fixed string for one grid — the digest atom. Group order and
// the film order within each group are already normalized by the dealer
// (sample() sorts, quads come in cat order), so JSON is a faithful fingerprint.
const gridStr = (g: Grid): string =>
  g.groups.map((gr) => `${gr.cat}:${gr.key}=${gr.films.join(',')}`).join('|')

// ═══════════════════════════════════════════════════════════════════════════
//  #1  EVERY GRID DEALS, PARTITIONS 4×4, AND EVERY FILM SITS IN ITS GROUP
// ═══════════════════════════════════════════════════════════════════════════
function checkSolvable(): void {
  section(`#1  Every grid deals, partitions 4×4 & every film sits (${DAYS} seeds)`)

  let shapeOk = true
  let poolOk = true
  let sitsOk = true
  let detail = ''
  for (let i = 0; i < grids.length; i++) {
    const g = grids[i]
    const flat = g.groups.flatMap((gr) => gr.films)
    if (g.groups.length !== GROUP_SIZE || g.groups.some((gr) => gr.films.length !== GROUP_SIZE)) {
      shapeOk = false
      detail = detail || `grid for ${seeds[i]} is not 4 groups of 4`
      continue
    }
    if (flat.some((id) => !nets.has(id))) {
      poolOk = false
      detail = detail || `grid for ${seeds[i]} has an off-pool film`
      continue
    }
    // Every card genuinely belongs to the group the dealer put it in — the
    // "solvable" claim re-proven card by card, not trusted.
    for (const gr of g.groups)
      for (const id of gr.films)
        if (!sits(nets.get(id)!, gr.cat, gr.key)) {
          sitsOk = false
          detail = detail || `${id} does not sit in ${gr.cat}:${gr.key} (${seeds[i]})`
        }
  }
  check('every grid is 4 groups of 4 (16 cards)', shapeOk, detail)
  check('every card is an in-pool film', poolOk, detail)
  check('every card sits in its assigned group (partition is real)', sitsOk, detail)
}

// ═══════════════════════════════════════════════════════════════════════════
//  #2  UNAMBIGUOUS — NO FILM FITS TWO OF ITS GRID'S GROUPS
// ═══════════════════════════════════════════════════════════════════════════
function checkUnambiguous(): void {
  section('#2  Unambiguous (no film fits ≥2 groups — rechecked independently)')

  let ok = true
  let detail = ''
  let worstFits = 1
  for (let i = 0; i < grids.length; i++) {
    const g = grids[i]
    for (const id of g.groups.flatMap((gr) => gr.films)) {
      const n = nets.get(id)!
      const fitCount = g.groups.reduce((c, gr) => c + (fits(n, gr.cat, gr.key) ? 1 : 0), 0)
      if (fitCount > worstFits) worstFits = fitCount
      if (fitCount > 1) {
        ok = false
        detail = detail || `${id} fits ${fitCount} groups in ${seeds[i]}`
      }
    }
  }
  note(`max groups any single card fits, across the year: ${worstFits} (must be 1)`)
  check('no card fits two of its grid’s groups (ambiguity gate holds)', ok, detail)
}

// ═══════════════════════════════════════════════════════════════════════════
//  #3  DISTINCT — 16 UNIQUE FILMS, 4 UNIQUE GROUP KEYS
// ═══════════════════════════════════════════════════════════════════════════
function checkDistinct(): void {
  section('#3  Distinct (16 unique film ids, 4 distinct group keys)')

  let filmsOk = true
  let keysOk = true
  let detail = ''
  for (let i = 0; i < grids.length; i++) {
    const g = grids[i]
    const films = g.groups.flatMap((gr) => gr.films)
    if (new Set(films).size !== GROUP_SIZE * GROUP_SIZE) {
      filmsOk = false
      detail = detail || `duplicate film across groups in ${seeds[i]}`
    }
    // A key is (cat, key) — the same person heading two groups would be a
    // degenerate puzzle; the same string under two cats would not.
    const keys = g.groups.map((gr) => `${gr.cat}:${gr.key}`)
    if (new Set(keys).size !== GROUP_SIZE) {
      keysOk = false
      detail = detail || `duplicate group key in ${seeds[i]}`
    }
  }
  check('all 16 films distinct within a grid', filmsOk, detail)
  check('all 4 group keys distinct within a grid', keysOk, detail)
}

// ═══════════════════════════════════════════════════════════════════════════
//  #4  THE DEALER LOCK — ≤1 GENRE GROUP, PERSON/SERIES-FIRST ORDER
// ═══════════════════════════════════════════════════════════════════════════
function checkLock(): void {
  section(`#4  Dealer lock (≤${MAX_GENRE_GROUPS} genre group, person/series-first)`)

  let capOk = true
  let orderOk = true
  let detail = ''
  const genreHist: Record<number, number> = {}
  for (let i = 0; i < grids.length; i++) {
    const cats = grids[i].groups.map((gr) => gr.cat)
    const genres = cats.filter((c) => c === 'genre').length
    genreHist[genres] = (genreHist[genres] ?? 0) + 1
    if (genres > MAX_GENRE_GROUPS) {
      capOk = false
      detail = detail || `${genres} genre groups in ${seeds[i]}`
    }
    // Property (a) made observable: a genre group, when present, is the LAST
    // group — director/actor/series were tried and placed ahead of it.
    const firstGenre = cats.indexOf('genre')
    if (firstGenre !== -1 && firstGenre !== cats.length - 1) {
      orderOk = false
      detail = detail || `genre group not last in ${seeds[i]} (${cats.join(',')})`
    }
  }
  note(`genre groups per grid: ${Object.entries(genreHist).map(([k, v]) => `${k}×${v}`).join('  ')}`)
  check(`every grid has ≤${MAX_GENRE_GROUPS} genre group`, capOk, detail)
  check('genre group (when present) is placed last (person/series-first)', orderOk, detail)
}

// ═══════════════════════════════════════════════════════════════════════════
//  #5  DETERMINISM & THE APPEND-ONLY PIN
// ═══════════════════════════════════════════════════════════════════════════
function checkDeterminism(): void {
  section('#5  Determinism & the append-only pin')

  // Same seed → byte-identical grid, re-dealt across the whole year — the same
  // full-365 statement solo-verify makes (its #3), so the two daily gates read
  // alike. This is the verify's costlier half: the dealer's accidental-free walk
  // makes ~40 of the 365 seeds crawl through thousands of key-sets (see the return
  // note on dealer performance), so the second pass is not cheap — but a standing
  // gate should re-derive, not trust.
  const detOk = grids.every((g, i) => JSON.stringify(g) === JSON.stringify(dealGrid(seeds[i])))
  check(`deterministic per seed (${DAYS}× re-dealt identically)`, detOk)

  // PIN — the append-only guard. A single digest over all 365 grids, in seed
  // order. If the dealer or the pool changes such that ANY published grid moves,
  // the digest changes and this fails: bump PIN_DIGEST only with a conscious
  // cutover plan (there are no published Connections dailies yet — this pin is
  // being established at dealer birth, exactly as solo-verify's 2026-07-03 pin
  // was). PIN_DAY is a human-legible spot-check of one concrete grid so a
  // failure shows WHAT moved, not just that the digest differs.
  // Established at dealer birth over the anchor window 2026-07-06 → 2027-07-05,
  // pool 237 films. Bump ONLY with a conscious cutover.
  const digest = createHash('sha256')
    .update(seeds.map((s, i) => `${s}#${gridStr(grids[i])}`).join('\n'))
    .digest('hex')
  const PIN_DIGEST = 'f21e79debb47d4e48034c08a471be6ec1857f9fa598f5ac294d2ab06487b8448'
  check(
    `pinned digest over ${DAYS} grids from ${seeds[0]}`,
    digest === PIN_DIGEST,
    `got ${digest}`,
  )

  // A single concrete grid, so a pin failure shows WHAT moved, not just that the
  // digest differs. The anchor's first day.
  const PIN_DAY = '2026-07-06'
  const PIN_DAY_STR =
    'actor:Gary Oldman=batman-begins,oppenheimer,the-dark-knight,the-fifth-element|' +
    'actor:Gene Hackman=crimson-tide,enemy-of-the-state,the-royal-tenenbaums,unforgiven|' +
    'actor:Jonah Hill=django-unchained,moneyball,superbad,the-wolf-of-wall-street|' +
    'actor:Josh Brolin=dune,no-country-for-old-men,sicario,the-goonies'
  const pinnedGrid = dealGrid(PIN_DAY)
  check(
    `pinned seed ${PIN_DAY} → its exact grid (4 actor groups)`,
    gridStr(pinnedGrid) === PIN_DAY_STR,
    `got ${gridStr(pinnedGrid)}`,
  )
}

// ═══════════════════════════════════════════════════════════════════════════
//  #6  BAKED RUNTIME PARITY — the app serves exactly what the dealer deals
// ═══════════════════════════════════════════════════════════════════════════
// The browser can't run dealGrid (it enumerates ~9.5M viable sets — OOM), so the
// mode reads baked grids from src/data/connections-grids.json (built by
// scripts/build-connections-grids.ts over THIS window). This is the guard that
// the baked file never drifts from the dealer: in seed order, the baked grids
// must equal the grids dealGrid produced above. The runtime accessor
// (dailyConnectionsGrid, src/data/connectionsGrids.ts) indexes this same array by
// day-offset, so proving the FILE matches the dealer proves the daily does too.
// Read via fs — not import — so Node needs no import-attribute and the app's
// Vite-flavored wrapper stays out of the sim layer (same convention as
// chronology-verify's pool read). If the pool changes, #5's pin trips AND this
// trips until the bake is re-run, so a stale JSON can't ship silently.
function checkBaked(): void {
  section('#6  Baked runtime parity (connections-grids.json === dealer over the window)')

  const baked = JSON.parse(
    readFileSync(new URL('../src/data/connections-grids.json', import.meta.url), 'utf8'),
  ) as { anchor: string; grids: Grid[] }

  check(
    `baked set covers the window (${baked.grids.length} grids)`,
    baked.grids.length === DAYS,
    `got ${baked.grids.length}, expected ${DAYS} — re-run npm run build:connections-grids`,
  )
  check(
    `baked anchor matches this window's day 0 (${seeds[0]})`,
    baked.anchor === seeds[0],
    `baked anchor ${baked.anchor}`,
  )

  // The load-bearing assertion: baked grid i equals dealGrid(seeds[i]) for the
  // whole window. grids[i] is that dealer output from the shared pass at the top.
  let parityOk = true
  let detail = ''
  for (let i = 0; i < seeds.length; i++) {
    if (!baked.grids[i] || gridStr(baked.grids[i]) !== gridStr(grids[i])) {
      parityOk = false
      detail = detail || `${seeds[i]}: baked grid ≠ dealer grid — re-run npm run build:connections-grids`
    }
  }
  check(`baked grid equals the dealer for all ${DAYS} days (bake is current)`, parityOk, detail)
}

// ── run ──────────────────────────────────────────────────────────────────
checkSolvable()
checkUnambiguous()
checkDistinct()
checkLock()
checkDeterminism()
checkBaked()
console.log(`\n  ${passed} passed, ${failed} failed\n`)
process.exit(failed > 0 ? 1 : 0)
