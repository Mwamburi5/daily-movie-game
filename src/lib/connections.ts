// src/lib/connections.ts — the Connections (Mode 4) engine: the deterministic
// grid dealer + its ambiguity gate, plus the date-seeded daily the React mode
// deals from.
//
// CANONICAL HOME. This engine was born as a prototype inside sim/connections-gen.ts
// ("WS4 builds the mode; this is a content tool and the engine prototype"). W4 IS
// WS4, so the pure engine is lifted here — exactly as rng.ts was — so the app can
// deal a grid at runtime without dragging sim/ into the app build graph (tsconfig
// only includes src/; sim/connections-gen.ts imports node:fs for its CLI report).
// sim/connections-gen.ts now imports this engine for its yield/shopping report, and
// sim/connections-verify.ts gates it — so React and both sim tools call the SAME
// dealGrid, parity by construction, never a fork. The pin over dealGrid's output
// (verify:connections #5) is byte-identical across this move.
//
// WHAT IT BUILDS: 4×4 Connections grids — 16 films, 4 hidden groups of 4 — from
// the credited pool (src/data/movies.ts). Groups come from the meld-ladder
// metadata: director / actor / series / genre.
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
// DETERMINISM: dealGrid(seed) uses the same makeRng discipline as the rest of the
// project — same seed, same grid, forever (until the pool changes; the daily pins
// like solo-verify does, in sim/connections-verify.ts).

import { MOVIES } from '../data/movies.ts'
import { makeRng } from './rng.ts'
import type { Rng } from './rng.ts'
import { localDateSeed } from './daily.ts'
import type { Movie } from '../data/types.ts'

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
export const CATS: GroupCat[] = ['director', 'actor', 'series', 'genre']
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
export interface Net {
  directorForm: Set<string> // m.director — who can HEAD a director group this film sits in
  directorGate: Set<string> // m.director + m.writers — who this film poisons as a director key
  cast: Set<string> // topCast + deepCast — sits AND poisons actor groups
  persons: Set<string> // directorGate ∪ cast, deduped once — the widest person net
  series: string | null
  genre: string
}

export function buildNets(pool: Movie[]): Map<string, Net> {
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

// Only fits() is needed by the dealer: a film's SITTING in a group is guaranteed
// by construction (buildKeys puts a film in a key's formation pool only if it
// sits), so the gate just needs to reject films that ALSO fit another key. The
// independent solvable recheck (sim/connections-verify.ts) rebuilds its own
// sits() from the Movie data — a verifier must not borrow the dealer's predicate.
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
export function usablePools(quad: GroupKey[], nets: Map<string, Net>): string[][] | null {
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

export interface Viable {
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
export function sample<T>(arr: T[], k: number, rng: Rng): T[] {
  const a = [...arr]
  for (let i = 0; i < k; i++) {
    const j = i + Math.floor(rng() * (a.length - i))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a.slice(0, k).sort()
}

// The deterministic dealer — the mode's engine. The nets/keys/viable triple is a
// pure function of the pool, so it's cached per pool (see dealFor): the WS4 mode
// and the standing verify both deal hundreds of grids from the same pool, and
// re-enumerating ~10M quads each call turns a seconds-long gate into an
// hours-long one. The cache changes nothing about the OUTPUT — same pool, same
// viable set, same order — it just does the "precompute viable sets once" this
// comment used to promise. Beyond the hard gate, the dealer insists on
// accidental-free grids (see the diagnostic below): the seed picks a starting
// key-set, then it walks — up to DEAL_TRIES seeded assignments per set, advancing
// to the next viable set when one can't field a clean grid (some sets never can:
// a genre key whose usable pool overlaps another group's hidden credits). The
// seed stream makes the whole walk deterministic; the spec-gate-only fallback is
// unreachable while the strict yield is nonzero.
export const DEAL_TRIES = 16

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

// The React-facing daily. Both dailies (solo, connections) derive their seed
// with localDateSeed, so a given calendar day maps to the same seed string in
// either mode and sim/connections-verify.ts asserts the exact grids this returns.
// Deals only pre-verified grids by construction — it IS dealGrid, the same
// function the standing gate pins.
export function dailyConnectionsGrid(seed: string = localDateSeed(), pool: Movie[] = MOVIES): Grid {
  return dealGrid(seed, pool)
}

// ── Accidental-group diagnostic (used by the dealer's strict walk; the CLI
// report re-uses it) ────────────────────────────────────────────────────────
// A coherent 4-set the puzzle would mark wrong: some person/series/genre shared
// by ≥4 grid films that do NOT all live in one intended group. Person matching
// uses the widest net (directors + writers + full cast) — the knowledgeable
// player is exactly who trips over these.
export function accidentalGroups(grid: Grid, nets: Map<string, Net>): { key: string; films: string[] }[] {
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
