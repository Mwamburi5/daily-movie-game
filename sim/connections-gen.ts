// sim/connections-gen.ts — WS2.1 content tool: the Connections grid generator +
// cluster shopping list. Runs BEFORE any new films are bought so the wave-1 buy
// is driven by data, not vibes.
//
//   node sim/connections-gen.ts                          (npm run gen:connections)
//   node sim/connections-gen.ts --seed 2026-07-04        (demo deal for a seed)
//   node sim/connections-gen.ts --md docs/connections-yield.md
//
// WHAT IT BUILDS: candidate 4×4 Connections grids — 16 films, 4 hidden groups of
// 4 — from the CREDITED pool (src/data/movies.ts, the tuned 89). Groups come from
// the meld-ladder metadata: director / actor / series / genre. No UI, no mode
// code — WS4 builds the mode; this is a content tool and the engine prototype.
//
// THE AMBIGUITY GATE (hard): if any film in a candidate grid fits two of its four
// groups, the grid is rejected. "Fits" is deliberately WIDER than "can sit in":
//   - a film SITS in a director group only if that person DIRECTED it, but it
//     FITS (and so poisons) the group if that person directed OR wrote it — a
//     Nolan-written film in another group makes "Nolan films" ambiguous to a
//     player who knows the credit, even though it isn't a Nolan-directed film;
//   - actor groups use the FULL cast (topCast + deepCast) for both sitting and
//     fitting — deep cuts are real credits (the game's own link rules count
//     them), so they both form groups and create ambiguity;
//   - series/genre are exact-match both ways.
// Because fit ⊇ sit, the gate has a clean consequence: within a chosen set of 4
// keys, a film USABLE for group g (sits in g, fits no other key) can't be usable
// for two groups — the usable pools are disjoint by construction. So a 4-key set
// is viable iff every usable pool has ≥4 films, ANY pick of 4-from-each passes
// the gate, and the exact grid count is a product of binomials. No search.
//
// DETERMINISM: dealGrid(seed) uses the same makeRng discipline as the rest of
// sim/ — same seed, same grid, forever (until the pool changes; the WS4 daily
// will pin like solo-verify does).
//
// Also reported (NOT gating — proposed as a WS4 gate check, see the doc): the
// "accidental group" diagnostic. The spec gate is film-local; it can't see four
// films drawn from four DIFFERENT groups that happen to share a person or genre.
// Those four are a coherent group a player could legitimately pick — an
// alternative solution the puzzle would call wrong. We sample one grid per
// viable key-set and count how often that happens.

import { writeFileSync } from 'node:fs'
import { MOVIES } from '../src/data/movies.ts'
import { makeRng } from './rng.ts'
import type { Rng } from './rng.ts'
import type { Movie } from '../src/data/types.ts'

export type GroupCat = 'director' | 'actor' | 'series' | 'genre'

// THE DEALER LOCK (master-plan §3·W4, a design lock — not a heuristic). Grids are
// built person/series-first: director/actor/series keys before genre. CATS order
// encodes that priority, and it is what buildKeys sorts by — so genre keys always
// come LAST in the key list and the enumerator's nested walk reaches them last
// (property a). The hard half of the lock — at most ONE genre group per grid
// (property b) — is enforced in enumerateViable, so it holds on the *viable
// space itself* and thus for every consumer (dealer, verify, WS4 mode) by
// construction, not by luck of the seed. Strict accidental-free (property c)
// stays where it was: the DEAL_TRIES walk against accidentalGroups.
const CATS: GroupCat[] = ['director', 'actor', 'series', 'genre']
// At most this many genre groups may share a grid. The lock pins it to 1; named
// so the invariant reads once and the verify can assert the same constant.
export const MAX_GENRE_GROUPS = 1
const genreCount = (quad: GroupKey[]): number => quad.reduce((n, k) => n + (k.cat === 'genre' ? 1 : 0), 0)

export interface GroupKey {
  cat: GroupCat
  key: string
  pool: string[] // film ids that can SIT in this group (formation predicate)
}

export interface Grid {
  groups: { cat: GroupCat; key: string; films: string[] }[]
}

// Per-film credit nets, precomputed once. directorGate ⊇ directorForm is what
// makes the usable-pool disjointness proof above hold.
interface Net {
  directorForm: Set<string> // m.director — who can HEAD a director group this film sits in
  directorGate: Set<string> // m.director + m.writers — who this film poisons as a director key
  cast: Set<string> // topCast + deepCast — sits AND poisons actor groups
  persons: Set<string> // directorGate ∪ cast, deduped once — the widest person net
  series: string | null
  genre: string
}

function buildNets(pool: Movie[]): Map<string, Net> {
  const nets = new Map<string, Net>()
  for (const m of pool) {
    const directorGate = new Set([...m.director, ...m.writers])
    const cast = new Set([...m.topCast, ...(m.deepCast ?? [])])
    nets.set(m.id, {
      directorForm: new Set(m.director),
      directorGate,
      cast,
      // Precompute the merged person net once. accidentalGroups runs this union
      // millions of times during a pathological deal walk; hoisting it here (same
      // elements, same insertion order = same bucket order) is a pure speedup.
      persons: new Set([...directorGate, ...cast]),
      series: m.series ?? null,
      genre: m.genre,
    })
  }
  return nets
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

// Every (cat, key) with its formation pool — INCLUDING undersized ones, because
// the shopping list wants the exactly-3s. Sorted deterministically so the seeded
// dealer is stable run to run — and, per the lock (property a), by CATS order
// FIRST, so director/actor/series keys precede genre and are placed before it in
// every downstream 4-subset walk. The localeCompare tiebreak only orders keys
// WITHIN a category; the cat rank is what carries the person/series-first lock.
export function buildKeys(pool: Movie[], nets: Map<string, Net>): GroupKey[] {
  const byCat = new Map<GroupCat, Map<string, string[]>>(CATS.map((c) => [c, new Map()]))
  const add = (cat: GroupCat, key: string, id: string) => {
    const m = byCat.get(cat)!
    const g = m.get(key) ?? []
    g.push(id)
    m.set(key, g)
  }
  for (const m of pool) {
    const n = nets.get(m.id)!
    for (const d of n.directorForm) add('director', d, m.id)
    for (const a of n.cast) add('actor', a, m.id)
    if (n.series) add('series', n.series, m.id)
    add('genre', n.genre, m.id)
  }
  const keys: GroupKey[] = []
  for (const cat of CATS)
    for (const [key, ids] of byCat.get(cat)!) keys.push({ cat, key, pool: ids })
  keys.sort((a, b) => CATS.indexOf(a.cat) - CATS.indexOf(b.cat) || a.key.localeCompare(b.key))
  return keys
}

// The gate, applied at the key level: usable(g) = sits in g, fits NO other key
// in the quadruple. Disjoint by the fit ⊇ sit argument in the header. Returns
// null unless all four pools can field a full group.
function usablePools(quad: GroupKey[], nets: Map<string, Net>): string[][] | null {
  const pools: string[][] = []
  for (let i = 0; i < quad.length; i++) {
    const p = quad[i].pool.filter((id) => {
      const n = nets.get(id)!
      return quad.every((h, j) => j === i || !fits(n, h.cat, h.key))
    })
    if (p.length < 4) return null
    pools.push(p)
  }
  return pools
}

const choose4 = (n: number): bigint =>
  n < 4 ? 0n : (BigInt(n) * BigInt(n - 1) * BigInt(n - 2) * BigInt(n - 3)) / 24n

interface Viable {
  quad: GroupKey[]
  sizes: number[] // usable-pool sizes only — pools are recomputed on demand
  grids: bigint // exact count of gate-passing film assignments for this key-set
}

// Exhaustive enumeration over all 4-subsets of the ≥4-film keys. Storing the
// full usable pools per viable set OOMs past ~150 films (wave 1 grew the
// group-ready keys enough that C(K,4) reaches the millions), so each entry
// keeps only the pool SIZES; usablePools is deterministic, so consumers
// re-derive the pools for just the sets they actually visit.
//
// LOCK (property b) enforced here: a quad carrying >MAX_GENRE_GROUPS genre keys
// is dropped BEFORE usablePools, so it never enters the viable space. Every
// consumer draws from this list — dealGrid, the yield report, the WS4 mode — so
// the ≤1-genre invariant holds by construction, and it's the cheap check too
// (a hidden multi-genre grid would otherwise be one bad seed away). Because big
// is buildKeys-sorted, the four indices are always in cat order, i.e. any genre
// keys sit at the tail of the quad (property a made concrete at the walk).
export function enumerateViable(keys: GroupKey[], nets: Map<string, Net>): Viable[] {
  const big = keys.filter((k) => k.pool.length >= 4)
  const out: Viable[] = []
  for (let a = 0; a < big.length; a++)
    for (let b = a + 1; b < big.length; b++)
      for (let c = b + 1; c < big.length; c++)
        for (let d = c + 1; d < big.length; d++) {
          const quad = [big[a], big[b], big[c], big[d]]
          if (genreCount(quad) > MAX_GENRE_GROUPS) continue // the lock: ≤1 genre group
          const pools = usablePools(quad, nets)
          if (pools)
            out.push({
              quad,
              sizes: pools.map((p) => p.length),
              grids: pools.reduce((acc, p) => acc * choose4(p.length), 1n),
            })
        }
  return out
}

// Seeded partial Fisher–Yates: first k of a seeded shuffle, order-normalized.
function sample<T>(arr: T[], k: number, rng: Rng): T[] {
  const a = [...arr]
  for (let i = 0; i < k; i++) {
    const j = i + Math.floor(rng() * (a.length - i))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a.slice(0, k).sort()
}

// The deterministic dealer — the WS4 engine prototype. The nets/keys/viable
// triple is a pure function of the pool, so it's cached per pool (see dealFor):
// the WS4 mode and the standing verify both deal hundreds of grids from the same
// pool, and re-enumerating ~10M quads each call turns a seconds-long gate into an
// hours-long one. The cache changes nothing about the OUTPUT — same pool, same
// viable set, same order — it just does the "precompute viable sets once" this
// comment used to promise. Beyond the hard gate, the dealer insists on
// accidental-free grids (see the diagnostic below): the seed picks a starting
// key-set, then it walks — up to DEAL_TRIES seeded assignments per set, advancing
// to the next viable set when one can't field a clean grid (some sets never can:
// a genre key whose usable pool overlaps another group's hidden credits). The
// seed stream makes the whole walk deterministic; the spec-gate-only fallback is
// unreachable while the strict yield is nonzero.
const DEAL_TRIES = 16

interface DealCtx {
  nets: Map<string, Net>
  viable: Viable[]
  // Lazy memo of usablePools by viable index. The accidental-free walk can, for a
  // pathological start, step through thousands of viable sets before one fields a
  // clean grid — and different seeds walk overlapping index ranges, so without
  // this the standing verify recomputes the same usablePools thousands of times.
  // Grows only to the indices actually visited (usually a thin slice of viable),
  // and the arrays are identical to a fresh call, so the deal output is unchanged.
  poolsAt: (idx: number) => string[][]
}
// Keyed by pool identity (default MOVIES is a stable reference; a caller passing
// its own array gets its own entry). WeakMap so a throwaway pool can be GC'd.
const dealCtxCache = new WeakMap<Movie[], DealCtx>()

function dealFor(pool: Movie[]): DealCtx {
  const hit = dealCtxCache.get(pool)
  if (hit) return hit
  const nets = buildNets(pool)
  const viable = enumerateViable(buildKeys(pool, nets), nets)
  if (viable.length === 0) throw new Error('pool supports no unambiguous grid')
  const memo = new Map<number, string[][]>()
  const poolsAt = (idx: number): string[][] => {
    let p = memo.get(idx)
    if (!p) {
      p = usablePools(viable[idx].quad, nets)! // enumerateViable already sized it ≥4
      memo.set(idx, p)
    }
    return p
  }
  const ctx: DealCtx = { nets, viable, poolsAt }
  dealCtxCache.set(pool, ctx)
  return ctx
}

export function dealGrid(seed: string, pool: Movie[] = MOVIES): Grid {
  const { nets, viable, poolsAt } = dealFor(pool)
  const rng = makeRng(seed, 'connections-grid')
  const start = Math.floor(rng() * viable.length)
  let grid: Grid = { groups: [] }
  for (let q = 0; q < viable.length; q++) {
    const idx = (start + q) % viable.length
    const v = viable[idx]
    const pools = poolsAt(idx) // deterministic — same arrays enumerateViable sized
    for (let tries = 0; tries < DEAL_TRIES; tries++) {
      grid = {
        groups: v.quad.map((g, i) => ({ cat: g.cat, key: g.key, films: sample(pools[i], 4, rng) })),
      }
      if (accidentalGroups(grid, nets).length === 0) return grid
    }
  }
  return grid
}

// ── Accidental-group diagnostic (reported, not gating) ─────────────────────
// A coherent 4-set the puzzle would mark wrong: some person/series/genre shared
// by ≥4 grid films that do NOT all live in one intended group. Person matching
// uses the widest net (directors + writers + full cast) — the knowledgeable
// player is exactly who trips over these.
function accidentalGroups(grid: Grid, nets: Map<string, Net>): { key: string; films: string[] }[] {
  const all = grid.groups.flatMap((g) => g.films)
  const home = new Map<string, number>()
  grid.groups.forEach((g, gi) => g.films.forEach((id) => home.set(id, gi)))
  const buckets = new Map<string, string[]>()
  const add = (key: string, id: string) => {
    const b = buckets.get(key) ?? []
    b.push(id)
    buckets.set(key, b)
  }
  for (const id of all) {
    const n = nets.get(id)!
    for (const p of n.persons) add(`person:${p}`, id) // directorGate ∪ cast, precomputed
    if (n.series) add(`series:${n.series}`, id)
    add(`genre:${n.genre}`, id)
  }
  const out: { key: string; films: string[] }[] = []
  for (const [key, ids] of buckets) {
    if (ids.length < 4) continue
    if (new Set(ids.map((id) => home.get(id))).size > 1) out.push({ key, films: ids })
  }
  return out
}

// ── Shopping list ───────────────────────────────────────────────────────────
// Directors / actors / series with EXACTLY 3 qualifying films — one buy short of
// a group. Ranked by how many new viable key-quadruples completing them unlocks,
// measured with a best-case phantom 4th film that carries ONLY the missing
// credit (a real film brings a genre and co-stars that can collide, so treat
// each unlock count as an upper bound; the human pick per name decides).
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
