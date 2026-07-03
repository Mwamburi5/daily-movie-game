// scripts/build-chronology-pool.ts — Phase 1 data pipeline.
//
//   node scripts/build-chronology-pool.ts
//
// CURATION-FIRST. This repo makes content by hand (src/data/movies.ts,
// puzzle.ts), not by scraping; recognizability is a human judgment, and TMDB
// `popularity` is recency-biased, so an auto-filter would clump the pool toward
// the 2010s and starve the 1970s, the exact failure the spec warns against. So
// the pipeline is curate-then-validate, not scrape-then-filter:
//
//   curated seed (human picks famous films, era-spread by hand, dates filled by
//        a manual lookup under the locked date policy; see scripts/chronology-seed.ts)
//     -> enrich: confirm every entry carries a date (no network; dates are committed)
//     -> validate the hard constraints (era window, even decade spread,
//        unique ids, decidable ISO dates) and REFUSE to emit on any violation
//     -> normalize (derive year + decade from releaseDate)
//     -> write chronology-pool.json
//
// This file lives OUTSIDE the app bundle and runs at author time only, like the
// sim harnesses. It is not in tsconfig's include, so it is type-stripped by Node
// at run time, not typechecked by `npm run build`.
//
// Pool record shape (canonical, from design/chronology.md):
//   { id, title, year, releaseDate, decade, popularity }

import { writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { CHRONOLOGY_SEED, type SeedEntry } from './chronology-seed.ts'

// One emitted pool record. Mirrors ChronologyCard in src/lib/chronology.ts; kept
// as a local shape so this author-time script has no app import dependency.
// In the curation-first model `popularity` is carried through the locked record
// shape for future tuning, but it is informational, not the recognizability gate.
interface PoolRecord {
  id: string
  title: string
  year: number
  releaseDate: string
  decade: number
  popularity: number
}

// A date-bearing seed entry (post-enrich): releaseDate is guaranteed present.
type DatedEntry = SeedEntry & { releaseDate: string }

// Era window: films released on or after this date only. Pre-1970 is parked.
const ERA_START_YEAR = 1970

// Stratification floor the validator enforces: a comparable share per decade so
// the line does not clump post-2000. Stage A targets ~25 per decade; this is the
// floor with slack. Stage B tightens it toward 50 to 80 as the pool grows to 300
// to 500 across the 1970s through the 2020s.
const PER_DECADE_MIN = 20

// Emit into src/data so the app imports the pool like any other content module
// (src/data/movies.ts), and tsconfig (include: ["src"]) typechecks it. The build
// graph never reaches outside src/ for content.
const OUT_PATH = 'src/data/chronology-pool.json'

const yearOf = (releaseDate: string): number => Number(releaseDate.slice(0, 4))
const decadeOf = (year: number): number => Math.floor(year / 10) * 10

// Step 1: load the hand-curated seed list (the recognizability decision). The
// seed is committed source authored like movies.ts, not pulled at build time.
function loadSeed(): SeedEntry[] {
  return CHRONOLOGY_SEED
}

// Step 2: ensure every entry has its canonical release date. Dates are filled by
// hand in the seed under the locked US-theatrical policy and committed, so there
// is no runtime network dependency; this step just confirms none is missing and
// narrows the type. (A future TMDB cross-check could slot in here.)
export function enrichDates(seed: SeedEntry[]): DatedEntry[] {
  const missing = seed.filter((e) => !e.releaseDate || e.releaseDate.trim() === '')
  if (missing.length) {
    throw new Error(`enrichDates: ${missing.length} entr${missing.length === 1 ? 'y has' : 'ies have'} no releaseDate: ${missing.map((e) => e.id).join(', ')}`)
  }
  return seed as DatedEntry[]
}

// Is `s` a real calendar date in strict ISO 'YYYY-MM-DD' form? Rejects both
// malformed strings and impossible dates (e.g. 2023-02-30) via a round-trip.
export function isValidIsoDate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false
  const [y, m, d] = s.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d
}

// Step 3: enforce the spec's hard constraints. Collects EVERY violation and
// throws one report, so a curator fixes them all in one pass rather than playing
// whack-a-mole. A bad pool can never ship: era window respected, every decade
// meets PER_DECADE_MIN, ids unique, every releaseDate a decidable ISO date.
export function validate(entries: DatedEntry[]): void {
  const errors: string[] = []
  const nextYear = new Date().getUTCFullYear() + 1 // allow near-future scheduled releases

  // ids unique
  const seen = new Set<string>()
  for (const e of entries) {
    if (seen.has(e.id)) errors.push(`duplicate id: ${e.id}`)
    seen.add(e.id)
  }

  // every date valid + inside the era window
  for (const e of entries) {
    if (!isValidIsoDate(e.releaseDate)) {
      errors.push(`invalid ISO date for ${e.id}: "${e.releaseDate}"`)
      continue
    }
    const year = yearOf(e.releaseDate)
    if (year < ERA_START_YEAR) errors.push(`${e.id} (${e.releaseDate}) is before the era window (${ERA_START_YEAR})`)
    if (year > nextYear) errors.push(`${e.id} (${e.releaseDate}) is implausibly far in the future (> ${nextYear})`)
  }

  // even decade spread: every decade present must meet the floor, and no decade
  // in the 1970s..current range may be empty
  const byDecade = new Map<number, number>()
  for (const e of entries) {
    if (!isValidIsoDate(e.releaseDate)) continue
    const dec = decadeOf(yearOf(e.releaseDate))
    byDecade.set(dec, (byDecade.get(dec) ?? 0) + 1)
  }
  const lastDecade = decadeOf(nextYear - 1)
  for (let dec = ERA_START_YEAR; dec <= lastDecade; dec += 10) {
    const count = byDecade.get(dec) ?? 0
    if (count < PER_DECADE_MIN) {
      errors.push(`decade ${dec}s has ${count} films, below the per-decade minimum of ${PER_DECADE_MIN}`)
    }
  }

  if (errors.length) {
    throw new Error(`validate: ${errors.length} violation(s):\n  - ${errors.join('\n  - ')}`)
  }
}

// Step 4: shape a validated entry into the canonical pool record, deriving `year`
// and `decade` from the resolved release date. `popularity` is carried if the
// curator supplied it, else 0 (informational, not the recognizability gate).
export function toPoolRecord(entry: DatedEntry): PoolRecord {
  const year = yearOf(entry.releaseDate)
  return {
    id: entry.id,
    title: entry.title,
    year,
    releaseDate: entry.releaseDate,
    decade: decadeOf(year),
    popularity: entry.popularity ?? 0,
  }
}

function main(): void {
  const seed = loadSeed()
  const dated = enrichDates(seed)
  validate(dated)
  const pool = dated.map(toPoolRecord).sort((a, b) =>
    a.releaseDate < b.releaseDate ? -1 : a.releaseDate > b.releaseDate ? 1 : a.id < b.id ? -1 : 1,
  )
  writeFileSync(OUT_PATH, JSON.stringify(pool, null, 2) + '\n')

  // Report the decade histogram so an uneven pool is visible at a glance, the
  // same measure-don't-guess discipline the sim uses.
  const hist = new Map<number, number>()
  for (const r of pool) hist.set(r.decade, (hist.get(r.decade) ?? 0) + 1)
  const decades = [...hist.keys()].sort((a, b) => a - b)
  console.log(`wrote ${pool.length} films to ${OUT_PATH}`)
  console.log('  decade spread: ' + decades.map((d) => `${d}s:${hist.get(d)}`).join('  '))
}

// Run only when invoked directly (node scripts/build-chronology-pool.ts), so the
// validate/enrich helpers can be imported and tested without emitting a file.
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    main()
  } catch (err) {
    console.error((err as Error).message)
    process.exit(1)
  }
}
