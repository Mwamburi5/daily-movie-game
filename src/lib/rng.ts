// Seedable RNG — dependency-free, deterministic, fast.
//
// Canonical home. This used to live in sim/rng.ts; it was lifted here so the app
// (src/lib/chronology.ts → the daily deal) can pull a SEEDED stream at runtime
// without dragging sim/ into the app build graph (tsconfig only includes src/).
// sim/rng.ts now re-exports this unchanged, so the sim keeps its existing imports.
//
// Why this exists: the shipped game shuffles with Math.random (fine for play),
// but to MEASURE rules — and to make a daily puzzle identical for everyone — we
// need reproducible runs and "paired deals": every variant playing the exact same
// shuffles so a comparison isolates the rule, not the luck of the draw (Common
// Random Numbers / variance reduction).
//
// xmur3 turns a string/number into a well-mixed 32-bit seed; mulberry32 is a
// compact, statistically solid PRNG returning floats in [0, 1) like Math.random.

export type Rng = () => number

// Hash a string to a 32-bit seed generator. Call the returned fn to pull seeds.
function xmur3(str: string): () => number {
  let h = 1779033703 ^ str.length
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    h ^= h >>> 16
    return h >>> 0
  }
}

// mulberry32: tiny PRNG, period 2^32, good distribution for our purposes.
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Build an independent RNG stream from a master seed and any label parts.
// Same (master, ...parts) always yields the same stream — this is what makes
// the deal stream variant-INDEPENDENT (parts never include the rule set) while
// the decision stream gets a different label, so the two never interfere.
export function makeRng(master: number | string, ...parts: (string | number)[]): Rng {
  const seedGen = xmur3([master, ...parts].join('|'))
  return mulberry32(seedGen())
}
