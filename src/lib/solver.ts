import type { Movie, Puzzle } from '../data/types.ts'

export type Role = 'Director' | 'Actor' | 'Writer'

export interface SharedPerson {
  name: string
  role: Role
  // Hidden on at least one of the two cards (deepCast) — a link made
  // entirely of deep people is a "deep cut": knowledge, not card-reading.
  deep: boolean
}

function rolesOf(m: Movie): Map<string, Set<Role>> {
  const map = new Map<string, Set<Role>>()
  const add = (name: string, role: Role) => {
    const set = map.get(name) ?? new Set<Role>()
    set.add(role)
    map.set(name, set)
  }
  m.topCast.forEach((n) => add(n, 'Actor'))
  m.deepCast?.forEach((n) => add(n, 'Actor'))
  m.director.forEach((n) => add(n, 'Director'))
  m.writers.forEach((n) => add(n, 'Writer'))
  return map
}

// People credited on both movies. Ordered top-billing-first so banners prefer
// famous names; display role precedence: Director > Actor > Writer.
export function sharedPeople(a: Movie, b: Movie): SharedPerson[] {
  const ra = rolesOf(a)
  const rb = rolesOf(b)
  const out: SharedPerson[] = []
  const seen = new Set<string>()
  for (const name of [...a.topCast, ...a.director, ...a.writers, ...(a.deepCast ?? [])]) {
    if (seen.has(name)) continue
    seen.add(name)
    if (!rb.has(name)) continue
    const union = new Set([...(ra.get(name) ?? []), ...(rb.get(name) ?? [])])
    const role: Role = union.has('Director') ? 'Director' : union.has('Actor') ? 'Actor' : 'Writer'
    const deep = (a.deepCast?.includes(name) ?? false) || (b.deepCast?.includes(name) ?? false)
    out.push({ name, role, deep })
  }
  return out
}

export function hasAnyPlay(top: Movie, hand: Movie[]): boolean {
  return hand.some((m) => sharedPeople(top, m).length > 0)
}

export type LinkTier = 'standard' | 'strong' | 'super'

// standard: one shared actor · strong: a shared director/writer, or two
// shared people · super: same franchise, or three+ shared people
export function linkTier(a: Movie, b: Movie, shared: SharedPerson[]): LinkTier {
  if ((a.series && a.series === b.series) || shared.length >= 3) return 'super'
  if (shared.length >= 2 || shared.some((s) => s.role !== 'Actor')) return 'strong'
  return 'standard'
}

// The BEST winning order by the combo economy — the line a perfect player would
// play. Exhaustive DFS over all winning orders (hand ≤ 7 → ≤ 5040 leaves),
// scoring each with the same carried-names combo rule SoloGame plays by: a play
// whose shared people intersect the running chain earns −1 and narrows the
// chain; otherwise it starts a fresh chain. Returns null when no winning order
// exists, so this doubles as a solvability check — the daily generator and the
// verify gate both lean on that.
export function bestLine(
  puzzle: Puzzle,
  movies: Movie[],
): { order: string[]; combo: number } | null {
  const byId = new Map(movies.map((m) => [m.id, m]))
  const starter = byId.get(puzzle.starterMovieId)
  if (!starter) return null
  const hand: Movie[] = []
  for (const id of puzzle.handMovieIds) {
    const m = byId.get(id)
    if (!m) return null
    hand.push(m)
  }
  let best: { order: string[]; combo: number } | null = null
  const order: string[] = []
  const dfs = (top: Movie, remaining: Movie[], names: string[] | null, combo: number): void => {
    if (remaining.length === 0) {
      if (!best || combo > best.combo) best = { order: [puzzle.starterMovieId, ...order], combo }
      return
    }
    for (let i = 0; i < remaining.length; i++) {
      const next = remaining[i]
      const shared = sharedPeople(top, next).map((s) => s.name)
      if (shared.length === 0) continue
      const carried = names ? names.filter((n) => shared.includes(n)) : []
      order.push(next.id)
      dfs(
        next,
        remaining.filter((_, j) => j !== i),
        carried.length > 0 ? carried : shared,
        combo + (carried.length > 0 ? 1 : 0),
      )
      order.pop()
    }
  }
  dfs(starter, hand, null, 0)
  return best
}

// DFS over play orderings. Returns one full winning order (starter first) or null.
export function isSolvable(puzzle: Puzzle, movies: Movie[]): string[] | null {
  const byId = new Map(movies.map((m) => [m.id, m]))
  const starter = byId.get(puzzle.starterMovieId)
  if (!starter) return null
  const hand: Movie[] = []
  for (const id of puzzle.handMovieIds) {
    const m = byId.get(id)
    if (!m) return null
    hand.push(m)
  }
  const order: string[] = []
  const dfs = (top: Movie, remaining: Movie[]): boolean => {
    if (remaining.length === 0) return true
    for (let i = 0; i < remaining.length; i++) {
      const next = remaining[i]
      if (sharedPeople(top, next).length === 0) continue
      order.push(next.id)
      if (dfs(next, remaining.filter((_, j) => j !== i))) return true
      order.pop()
    }
    return false
  }
  return dfs(starter, hand) ? [starter.id, ...order] : null
}
