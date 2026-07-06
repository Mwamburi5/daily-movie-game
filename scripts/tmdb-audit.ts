// scripts/tmdb-audit.ts — fact-check Movie entries against TMDB.
//
//   npm run tmdb:audit                              (audits src/data/movies.ts)
//   node scripts/tmdb-audit.ts --input scripts/wave1-candidate.ts
//   node scripts/tmdb-audit.ts --out docs/tmdb-audit.md
//
// CURATION-FIRST, same philosophy as build-chronology-pool.ts: this script
// NEVER writes into src/data. It reads Movie[] entries (hand-curated or
// hand-drafted), asks TMDB about each film, and emits a markdown diff report
// for a human to arbitrate — the wave1-diffs.md pattern, automated. TMDB is a
// second witness, not the judge: it is community-edited and its release dates
// follow its own policy (premiere vs wide release), so a mismatch is a flag,
// not automatically our error.
//
// WHAT IT CHECKS per film:
//   year       — ours vs TMDB primary release year
//   director   — set equality against TMDB crew job 'Director'
//   topCast    — our 5 vs TMDB's top-5 billing (order-sensitive: billing IS
//                the datum; a re-order changes what the card back shows)
//   deepCast   — each name must appear SOMEWHERE in TMDB's full cast
//   writers    — informational only: the meld ladder merged writer into
//                director-rung logic, and writing credits are the messiest
//                data on TMDB, so diffs are listed but never counted as flags
//   spelling   — exact TMDB name strings are printed on any cast/crew diff,
//                because pool matching is exact string equality and one
//                'Robert DeNiro' typo silently breaks every link he carries
//
// The report lands in docs/ (generated file — regenerate, don't hand-edit).

import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import type { Movie } from '../src/data/types.ts'
import { assertCredentials, searchMovie, movieWithCredits, type TmdbMovie } from './tmdb.ts'

// ---- args ----
const argv = process.argv.slice(2)
const argOf = (flag: string): string | undefined => {
  const i = argv.indexOf(flag)
  return i >= 0 ? argv[i + 1] : undefined
}
const INPUT = argOf('--input') ?? 'src/data/movies.ts'
const OUT = argOf('--out') ?? 'docs/tmdb-audit.md'

// ---- load the entries to audit ----
const mod = await import(pathToFileURL(resolve(INPUT)).href)
const entries: Movie[] =
  mod.MOVIES ?? mod.default ?? Object.values(mod).find((v) => Array.isArray(v))
if (!entries?.length) {
  console.error(`${INPUT} exports no Movie[] I can find (looked for MOVIES, default, any array)`)
  process.exit(1)
}

assertCredentials()

// ---- per-film comparison ----
interface Flag {
  field: string
  ours: string
  tmdb: string
}
interface FilmReport {
  movie: Movie
  tmdbId?: number
  flags: Flag[] // real disagreements a human should arbitrate
  notes: string[] // informational (writers, order nits)
  unmatched?: boolean // TMDB search found nothing credible
}

const sameSet = (a: string[], b: string[]) =>
  a.length === b.length && [...a].sort().join('|') === [...b].sort().join('|')

function compare(movie: Movie, tmdb: TmdbMovie): FilmReport {
  const flags: Flag[] = []
  const notes: string[] = []

  const tmdbYear = Number(tmdb.release_date.slice(0, 4)) || 0
  if (tmdbYear && tmdbYear !== movie.year) {
    flags.push({ field: 'year', ours: String(movie.year), tmdb: String(tmdbYear) })
  }

  const directors = tmdb.credits.crew.filter((c) => c.job === 'Director').map((c) => c.name)
  if (!sameSet(movie.director, directors)) {
    flags.push({ field: 'director', ours: movie.director.join(', '), tmdb: directors.join(', ') })
  }

  const tmdbCast = tmdb.credits.cast.map((c) => c.name)
  const top5 = tmdbCast.slice(0, 5)
  if (!sameSet(movie.topCast, top5)) {
    flags.push({ field: 'topCast', ours: movie.topCast.join(', '), tmdb: top5.join(', ') })
  } else if (movie.topCast.join('|') !== top5.join('|')) {
    notes.push(`topCast same 5 names, different billing order — TMDB: ${top5.join(', ')}`)
  }

  const fullCast = new Set(tmdbCast)
  for (const name of movie.deepCast ?? []) {
    if (!fullCast.has(name)) {
      flags.push({ field: 'deepCast', ours: name, tmdb: 'not in TMDB cast (typo? uncredited?)' })
    }
  }

  const writers = [
    ...new Set(tmdb.credits.crew.filter((c) => c.department === 'Writing').map((c) => c.name)),
  ]
  if (!sameSet(movie.writers, writers)) {
    notes.push(`writers — ours: ${movie.writers.join(', ') || '(none)'} · TMDB: ${writers.join(', ')}`)
  }

  return { movie, tmdbId: tmdb.id, flags, notes }
}

// ---- run ----
console.log(`auditing ${entries.length} films from ${INPUT} against TMDB...`)
const reports: FilmReport[] = []
let done = 0
for (const movie of entries) {
  try {
    const hit = await searchMovie(movie.title, movie.year)
    if (!hit) {
      reports.push({ movie, flags: [], notes: [], unmatched: true })
    } else {
      reports.push(compare(movie, await movieWithCredits(hit.id)))
    }
  } catch (err) {
    reports.push({
      movie,
      flags: [],
      notes: [`audit errored: ${err instanceof Error ? err.message : String(err)}`],
      unmatched: true,
    })
  }
  done += 1
  if (done % 25 === 0) console.log(`  ...${done}/${entries.length}`)
}

// ---- report ----
const clean = reports.filter((r) => !r.unmatched && r.flags.length === 0)
const flagged = reports.filter((r) => r.flags.length > 0)
const unmatched = reports.filter((r) => r.unmatched)

const lines: string[] = []
lines.push(`# TMDB audit — ${INPUT}`)
lines.push('')
lines.push('GENERATED by scripts/tmdb-audit.ts — regenerate, don\'t hand-edit.')
lines.push('TMDB is a second witness, not the judge: arbitrate every flag by hand')
lines.push('(the wave1-diffs.md pattern). Data © TMDB, used under the free tier.')
lines.push('')
lines.push(`- films audited: **${reports.length}**`)
lines.push(`- clean (agree with TMDB): **${clean.length}**`)
lines.push(`- flagged for arbitration: **${flagged.length}**`)
lines.push(`- no TMDB match found: **${unmatched.length}**`)
lines.push('')

if (flagged.length) {
  lines.push('## Flagged — needs a human ruling')
  lines.push('')
  for (const r of flagged) {
    lines.push(`### ${r.movie.title} (${r.movie.year}) — \`${r.movie.id}\` · [tmdb ${r.tmdbId}](https://www.themoviedb.org/movie/${r.tmdbId})`)
    lines.push('')
    lines.push('| field | ours | TMDB |')
    lines.push('|---|---|---|')
    for (const f of r.flags) lines.push(`| ${f.field} | ${f.ours} | ${f.tmdb} |`)
    lines.push('')
    for (const n of r.notes) lines.push(`- ℹ️ ${n}`)
    if (r.notes.length) lines.push('')
  }
}

if (unmatched.length) {
  lines.push('## No TMDB match (check title spelling / year)')
  lines.push('')
  for (const r of unmatched) {
    lines.push(`- ${r.movie.title} (${r.movie.year}) — \`${r.movie.id}\`${r.notes[0] ? ` — ${r.notes[0]}` : ''}`)
  }
  lines.push('')
}

const infoOnly = clean.filter((r) => r.notes.length > 0)
if (infoOnly.length) {
  lines.push('## Clean, with informational notes (no action required)')
  lines.push('')
  for (const r of infoOnly) {
    lines.push(`### ${r.movie.title} (${r.movie.year})`)
    for (const n of r.notes) lines.push(`- ${n}`)
    lines.push('')
  }
}

writeFileSync(resolve(OUT), lines.join('\n'))
console.log(`\nwrote ${OUT}`)
console.log(`clean ${clean.length} · flagged ${flagged.length} · unmatched ${unmatched.length}`)
