// sim/rng.ts — the seedable RNG now lives in src/lib/rng.ts so the app can pull a
// seeded stream at runtime without depending on sim/. This file re-exports it
// unchanged, so existing sim imports (`./rng.ts`) keep working with no behavior
// change. The `export type` for Rng is deliberate: Node's runtime type-stripping
// can't tell a type from a value, so a bare re-export would survive as a runtime
// value import and crash.

export { makeRng, mulberry32 } from '../src/lib/rng.ts'
export type { Rng } from '../src/lib/rng.ts'
