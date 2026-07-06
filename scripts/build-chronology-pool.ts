// scripts/build-chronology-pool.ts — Phase 1 data pipeline.
//
//   node scripts/build-chronology-pool.ts
//
// CURATION-FIRST. This repo makes content by hand (src/data/movies.ts,
// puzzle.ts), not by scraping; recognizability is a human judgment, and TMDB
// `popularity` is recency-biased, so an auto-filter would clump the pool toward
// the 2010s and starve the 1970s, the exact failure the spec warns against. So
// the pipeline is curate-then-validate, not scrape-then-filter.
//
// UNIFIED SOURCE (A4, docs/pool-unification.md — executed 2026-07-06). The pool
// is DERIVED from the one canonical database, src/data/movies.ts, in two grades:
//   • credited films that carry a `releaseDate` (MOVIES.filter(m => m.releaseDate)),
//   • dated stubs (DATED_STUBS): films with a policy date but no credits yet.
// The retired scripts/chronology-seed.ts used to be this source; dates now live
// on the canonical entries/stubs, so a Chronology date fix lands there. The
// pipeline is unchanged downstream of the source:
//
//   union (credited-with-date ∪ dated stubs; dates filled by a manual lookup
//        under the locked US-theatrical policy; see the movies.ts date-policy note)
//     -> enrich: confirm every entry carries a date (no network; dates are committed)
//     -> validate the hard constraints (era window, even decade spread, unique ids,
//        decidable ISO dates, AND stub ids disjoint from MOVIES) — REFUSE on any violation
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
import { MOVIES, DATED_STUBS } from '../src/data/movies.ts'

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

// A date-bearing pool-source entry (post-enrich): releaseDate is guaranteed
// present. This is the seam both grades (credited-with-date, dated stub) reduce
// to before validate/emit — the same shape the retired seed produced, so the
// validator and emit downstream are untouched.
interface DatedEntry {
  id: string
  title: string
  releaseDate: string
  popularity?: number
}

// Chronology-title overrides for the handful of credited films whose Duel
// card-face title (Movie.title) differs from the title the Chronology pool shows
// — a deliberate title-convention split, the same class ruled ours-correct in
// docs/tmdb-rulings.md. The Duel card keeps the short form; the Chronology view
// keeps the fuller form the pool always carried, so the derived JSON stays
// byte-identical. Dated stubs carry their own Chronology title directly and need
// no override. loadUnion() asserts every id here actually diverges, so a stale
// entry can't silently lie. (When such a film graduates or is renamed, update
// here in the same pass.)
const CHRONO_TITLE_OVERRIDES: Record<string, string> = {
  'the-fellowship-of-the-ring': 'The Lord of the Rings: The Fellowship of the Ring',
  'the-two-towers': 'The Lord of the Rings: The Two Towers',
  'the-return-of-the-king': 'The Lord of the Rings: The Return of the King',
  'mission-impossible-fallout': 'Mission: Impossible - Fallout',
}

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

// Step 1: assemble the pool source from the canonical database — the two grades
// unioned into one DatedEntry list (the recognizability decision now lives in
// movies.ts: a film is in the Chronology pool iff it carries a releaseDate, as a
// credited Movie or a DatedStub). Credited films take the Chronology-title
// override where their card-face title deliberately differs; stubs carry their
// title as-is. Emit order matches the retired seed by re-sorting downstream.
function loadUnion(): DatedEntry[] {
  const movieIds = new Set(MOVIES.map((m) => m.id))

  // Assert every override actually diverges from the current card-face title, so
  // a stale override can never silently rewrite a title that already matches.
  for (const [id, chronoTitle] of Object.entries(CHRONO_TITLE_OVERRIDES)) {
    const m = MOVIES.find((x) => x.id === id)
    if (!m) throw new Error(`CHRONO_TITLE_OVERRIDES: no MOVIES entry for '${id}' (stale override?)`)
    if (m.title === chronoTitle) throw new Error(`CHRONO_TITLE_OVERRIDES: '${id}' no longer diverges (Movie.title already '${chronoTitle}'); drop the override`)
  }

  const credited: DatedEntry[] = MOVIES.filter((m) => m.releaseDate).map((m) => ({
    id: m.id,
    title: CHRONO_TITLE_OVERRIDES[m.id] ?? m.title,
    releaseDate: m.releaseDate as string,
  }))

  const stubs: DatedEntry[] = DATED_STUBS.map((s) => ({
    id: s.id,
    title: s.title,
    releaseDate: s.releaseDate,
  }))

  // Stub ids MUST be disjoint from MOVIES ids: a stub that collides with a
  // credited film is a graduation that wasn't finished (delete the stub). Caught
  // here with a clear message before the generic unique-id check muddies it.
  const collisions = stubs.filter((s) => movieIds.has(s.id)).map((s) => s.id)
  if (collisions.length) {
    throw new Error(`loadUnion: ${collisions.length} DATED_STUBS id(s) collide with MOVIES (graduate them — delete the stub): ${collisions.join(', ')}`)
  }

  return [...credited, ...stubs]
}

// Step 2: ensure every entry has its canonical release date. Dates are filled by
// hand on the canonical entries/stubs under the locked US-theatrical policy and
// committed, so there is no runtime network dependency; this step just confirms
// none is missing (a stub or credited film with a blank date is a bug, not a
// silent drop). (A future TMDB cross-check could slot in here.)
export function enrichDates(entries: DatedEntry[]): DatedEntry[] {
  const missing = entries.filter((e) => !e.releaseDate || e.releaseDate.trim() === '')
  if (missing.length) {
    throw new Error(`enrichDates: ${missing.length} entr${missing.length === 1 ? 'y has' : 'ies have'} no releaseDate: ${missing.map((e) => e.id).join(', ')}`)
  }
  return entries
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
  const union = loadUnion()
  const dated = enrichDates(union)
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
