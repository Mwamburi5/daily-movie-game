// src/data/chronologyPool.ts — the Chronology content layer, loaded into the app.
//
// chronology-pool.json is emitted by `npm run build:chronology-pool` from the
// hand-curated seed (scripts/chronology-seed.ts) and committed, so the app has no
// build-time scrape or runtime network dependency — it imports the JSON the same
// way Solo/Duel import src/data/movies.ts. This module is the one place the raw
// JSON is typed against the core's ChronologyCard shape, mirroring the
// `movieById = new Map(...)` pattern in src/data/movies.ts.

import type { ChronologyCard } from '../lib/chronology.ts'
import poolData from './chronology-pool.json'

export const CHRONOLOGY_POOL = poolData as ChronologyCard[]

// id -> card lookup, one line, same as movieById.
export const chronologyById = new Map(CHRONOLOGY_POOL.map((c) => [c.id, c]))
