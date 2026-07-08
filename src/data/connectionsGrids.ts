// src/data/connectionsGrids.ts — the Connections content layer, loaded into the app.
//
// connections-grids.json is emitted by `npm run build:connections-grids` from the
// dealer (src/lib/connections.ts dealGrid) over the pinned 365-day anchor window,
// and committed — so the app has no build-time enumeration or runtime dependency
// on the dealer (which OOMs a browser; see the engine header). The mode imports
// these baked grids the same way Chronology imports its pool JSON. This module is
// the one place the raw JSON is typed against the engine's Grid shape, mirroring
// chronologyPool.ts / the `movieById = new Map(...)` pattern in movies.ts.

import type { Grid } from '../lib/connections.ts'
import { localDateSeed } from '../lib/daily.ts'
import { makeRng } from '../lib/rng.ts'
import data from './connections-grids.json'

// Seed of the window's first day (day 0). dailyConnectionsGrid keys by calendar
// offset from here, so for the whole pinned year the daily IS the dealer's
// seed-output (sim/connections-verify.ts asserts that equality).
export const CONNECTIONS_ANCHOR = data.anchor as string

// The 365 baked grids in seed order — the array order is the contract; the
// runtime indexes it by offset, so it must never be re-sorted.
export const CONNECTIONS_GRIDS = data.grids as Grid[]

// ── The runtime daily / practice accessors (app-only) ─────────────────────────
// These live in the data layer, not src/lib/connections.ts, so the engine stays
// free of the JSON import and the sim can load it under raw Node. They select
// from the baked set — never the OOM-heavy dealer.
const DAY_MS = 86_400_000
function seedToUtc(seed: string): number {
  const [y, m, d] = seed.split('-').map(Number)
  return Date.UTC(y, m - 1, d)
}

// Today's grid, keyed by whole-day offset from the anchor. Inside the pinned year
// (offset 0..364) this is the exact grid dealGrid produced for that seed — so
// everyone sees the same board on the same local calendar day (Wordle-style, the
// Solo/Chronology contract). Past the year it wraps deterministically through the
// verified set (a well-past-launch horizon; the pool LOCKs and the published-daily
// pin lands in W5 before any public daily).
export function dailyConnectionsGrid(seed: string = localDateSeed()): Grid {
  const n = CONNECTIONS_GRIDS.length
  const offset = Math.round((seedToUtc(seed) - seedToUtc(CONNECTIONS_ANCHOR)) / DAY_MS)
  return CONNECTIONS_GRIDS[((offset % n) + n) % n]
}

// A fresh practice grid — any verified grid from the baked set, deterministic per
// token so a given round re-deals identically (parity with Chronology practice).
export function practiceConnectionsGrid(token: string): Grid {
  const n = CONNECTIONS_GRIDS.length
  const rng = makeRng('connections-practice', token)
  return CONNECTIONS_GRIDS[Math.floor(rng() * n)]
}
