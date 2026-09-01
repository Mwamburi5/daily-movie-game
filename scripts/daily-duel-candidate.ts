// Audit snapshot of the 16 outside challengers in Buri's approved 216-film slate.
//
// This module contains only the 16 selected outside challengers. It is an input
// to tmdb-audit/name-audit and must not be imported by runtime code. The 200
// credited fallback cards already live in src/data/movies.ts. Buri approved the
// six policy-covered cast rulings and series tags on 2026-08-25, then approved
// the 2026-09-27 date-gated runtime cutover on 2026-08-26. Runtime code must not
// import this snapshot; the approved records now also live in src/data/movies.ts.

import type { Movie } from '../src/data/types.ts'
import { DAILY_DUEL_POOL_CHALLENGERS } from './daily-duel-pool-challengers.ts'

export const SELECTED_OUTSIDE_CHALLENGER_IDS = [
  'a-quiet-place-part-ii',
  'harry-potter-and-the-deathly-hallows-part-2',
  'speed',
  'die-hard',
  'ghostbusters',
  'top-gun-maverick',
  'john-wick',
  'john-wick-chapter-4',
  'mission-impossible-dead-reckoning-part-one',
  'avengers-infinity-war',
  'avengers-endgame',
  'guardians-of-the-galaxy',
  'spider-man-no-way-home',
  'hidden-figures',
  'thelma-and-louise',
  'the-batman',
] as const

export const STRUCK_OUTSIDE_CHALLENGER_IDS = [
  'guardians-of-the-galaxy-vol-3',
  'everything-everywhere-all-at-once',
  'clueless',
  'legally-blonde',
  'mean-girls-2004',
  'the-breakfast-club',
] as const

// Approved continuity rulings that affect already-credited cards in the 216.
// Series never creates person adjacency; it upgrades an otherwise-legal shared-
// person play to super and enables same-series meld grouping.
export const PROPOSED_EXISTING_SERIES_OVERRIDES: Readonly<Record<string, string>> = {
  'top-gun': 'top-gun',
  'the-avengers': 'avengers',
}

export function applyProposedSeriesPolicy(movie: Movie): Movie {
  const series = PROPOSED_EXISTING_SERIES_OVERRIDES[movie.id]
  return series ? { ...movie, series } : movie
}

const challengerById = new Map(
  DAILY_DUEL_POOL_CHALLENGERS.map((challenger) => [challenger.movie.id, challenger]),
)

const missing = SELECTED_OUTSIDE_CHALLENGER_IDS.filter((id) => !challengerById.has(id))
if (missing.length > 0) {
  throw new Error(`selected Daily / Duel challengers missing from authoring slate: ${missing.join(', ')}`)
}

export const MOVIES: Movie[] = SELECTED_OUTSIDE_CHALLENGER_IDS.map(
  (id) => challengerById.get(id)!.movie,
)

if (MOVIES.length !== 16 || new Set(MOVIES.map((movie) => movie.id)).size !== MOVIES.length) {
  throw new Error('approved Daily / Duel outside draft must contain 16 unique films')
}

export default MOVIES
