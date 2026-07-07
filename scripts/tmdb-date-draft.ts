// scripts/tmdb-date-draft.ts — draft Chronology policy dates for a plain
// title list (Stage B date-drafting tool, docs/stage-b-plan.md "The draft
// tool call").
//
//   npx tsx scripts/tmdb-date-draft.ts titles.txt
//   node scripts/tmdb-date-draft.ts titles.txt docs/stage-b-date-draft-titles.md
//
// WHAT THIS IS: tmdb-date-audit.ts minus the comparison. Buri picks WHICH
// films (era-stratified, recognizability is a human judgment); this script
// only types the dates — TMDB search -> release_dates -> the same LOCKED
// US-theatrical policy (types 2+3, limited counts, earliest, no premieres).
// Every drafted date still passes Buri's arbitration before it can become a
// DATED_STUBS entry (curation-first holds, same as every other tmdb-*.ts).
//
// CURATION-FIRST: this script NEVER writes src/data or scripts/*-seed.ts. It
// only emits a review file for a human to read and rule on (the
// wave1-diffs.md / tmdb-date-audit.md pattern).
//
// The policy filter (THEATRICAL_TYPES / policyDate / dayOf / yearOf) is
// copied from scripts/tmdb-date-audit.ts rather than imported: that script
// doesn't export them, and this tool isn't allowed to edit it. Keep the two
// copies in sync if the policy ever changes.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname, basename, extname } from 'node:path'
import {
  assertCredentials,
  tmdbGet,
  movieReleaseDates,
  type TmdbSearchHit,
  type TmdbReleaseEntry,
} from './tmdb.ts'

// ---- args ----
// argv[0] = title-list file (required), argv[1] = output file (optional).
const argv = process.argv.slice(2)
const INPUT = argv[0]
if (!INPUT) {
  console.error('usage: tmdb-date-draft.ts <title-list-file> [output-file]')
  console.error('  one title per line, optional trailing "(YYYY)" disambiguation year')
  console.error('  blank lines and lines starting with # are ignored')
  process.exit(1)
}
const inputBase = basename(INPUT, extname(INPUT))
const OUT = argv[1] ?? `docs/stage-b-date-draft-${inputBase}.md`

// ---- parse the title list ----
// "Movie Title" or "Movie Title (1995)" per line.
interface TitleQuery {
  raw: string
  title: string
  year?: number
}
const YEAR_SUFFIX = /^(.*?)\s*\((\d{4})\)\s*$/

function parseTitleList(path: string): TitleQuery[] {
  const raw = readFileSync(resolve(path), 'utf8')
  const queries: TitleQuery[] = []
  for (const line of raw.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const m = trimmed.match(YEAR_SUFFIX)
    if (m) queries.push({ raw: trimmed, title: m[1], year: Number(m[2]) })
    else queries.push({ raw: trimmed, title: trimmed })
  }
  return queries
}

const queries = parseTitleList(INPUT)
if (!queries.length) {
  console.error(`${INPUT} has no title lines (blank / all comments?)`)
  process.exit(1)
}

assertCredentials()

// ---- the policy filter ----
// Copied from scripts/tmdb-date-audit.ts (not exported there; keep in sync).
const US = 'US'
const THEATRICAL_TYPES = new Set([2, 3]) // limited + wide; never 1 (premiere)

const dayOf = (iso: string): string => iso.slice(0, 10)
const yearOf = (day: string): number => Number(day.slice(0, 4))

// Earliest US theatrical (types 2+3) — the policy date, if TMDB has one.
function policyDate(usEntries: TmdbReleaseEntry[]): TmdbReleaseEntry | null {
  const theatrical = usEntries
    .filter((e) => THEATRICAL_TYPES.has(e.type) && e.release_date)
    .sort((a, b) => (a.release_date < b.release_date ? -1 : 1))
  return theatrical[0] ?? null
}

// ---- matching: reuse tmdb.ts's client, but keep the raw hit list ----
// (searchMovie() in tmdb.ts already auto-picks a "best" hit by exact-title +
// vote_count; that's right for auditing a title we already trust, but here
// the whole point is to catch bad matches before they become a draft date,
// so this script re-runs the same /search/movie endpoint via the shared
// tmdbGet() client and inspects the candidate list itself rather than
// silently trusting one pick.)
async function searchCandidates(title: string, year?: number): Promise<TmdbSearchHit[]> {
  const base = { query: title, include_adult: 'false', language: 'en-US' }
  if (year !== undefined) {
    const withYear = await tmdbGet('/search/movie', { ...base, primary_release_year: String(year) })
    if (withYear.results?.length) return withYear.results
  }
  const open = await tmdbGet('/search/movie', base)
  return open.results ?? []
}

type Flag =
  | 'CLEAN'
  | 'CHECK: ambiguous-match'
  | 'CHECK: no-us-theatrical'
  | 'CHECK: multiple-theatrical-candidates'
  | 'NOT-FOUND'

interface Draft {
  query: TitleQuery
  tmdbId?: number
  tmdbTitle?: string
  primaryDay?: string
  policyDay?: string // the drafted date, or undefined = NONE
  usEvidence?: TmdbReleaseEntry[]
  flag: Flag
  note?: string
}

function pickBest(hits: TmdbSearchHit[], q: TitleQuery): { hit: TmdbSearchHit; ambiguous: boolean; note?: string } {
  const wanted = q.title.toLowerCase()
  const exact = hits.filter((h) => h.title.toLowerCase() === wanted)
  const pool = exact.length ? exact : hits

  // Prefer year proximity when the caller gave one; else fall back to votes.
  let ranked: TmdbSearchHit[]
  if (q.year !== undefined) {
    ranked = [...pool].sort((a, b) => {
      const ay = a.release_date ? Math.abs(yearOf(a.release_date) - q.year!) : 999
      const by = b.release_date ? Math.abs(yearOf(b.release_date) - q.year!) : 999
      if (ay !== by) return ay - by
      return b.vote_count - a.vote_count
    })
  } else {
    ranked = [...pool].sort((a, b) => b.vote_count - a.vote_count)
  }
  const best = ranked[0]

  // Ambiguous if: no exact-title hit at all (title mismatch risk), OR two+
  // plausible candidates are close in signal (same year-distance and votes
  // within 2x of each other) — a human should eyeball the pick.
  if (!exact.length) {
    return { hit: best, ambiguous: true, note: `no exact title match; closest TMDB title is "${best.title}"` }
  }
  if (ranked.length > 1) {
    const runnerUp = ranked[1]
    const bestDist = q.year !== undefined && best.release_date ? Math.abs(yearOf(best.release_date) - q.year) : 0
    const runnerDist = q.year !== undefined && runnerUp.release_date ? Math.abs(yearOf(runnerUp.release_date) - q.year) : 0
    const votesClose = runnerUp.vote_count > 0 && best.vote_count / runnerUp.vote_count < 2
    if (bestDist === runnerDist && votesClose) {
      return {
        hit: best,
        ambiguous: true,
        note: `${exact.length} same-title candidates, top two close in votes/year (picked id ${best.id}, ${best.release_date?.slice(0, 4) ?? '?'} over id ${runnerUp.id}, ${runnerUp.release_date?.slice(0, 4) ?? '?'})`,
      }
    }
  }
  return { hit: best, ambiguous: false }
}

// ---- run ----
console.log(`drafting ${queries.length} titles from ${INPUT} against TMDB (policy: US theatrical, types 2+3, earliest)...`)
const drafts: Draft[] = []
let done = 0
for (const q of queries) {
  try {
    const hits = await searchCandidates(q.title, q.year)
    if (!hits.length) {
      drafts.push({ query: q, flag: 'NOT-FOUND' })
    } else {
      const { hit, ambiguous, note } = pickBest(hits, q)
      const countries = await movieReleaseDates(hit.id)
      const usEntries = countries.find((c) => c.iso_3166_1 === US)?.release_dates ?? []
      const usTheatrical = usEntries.filter((e) => THEATRICAL_TYPES.has(e.type))
      const candidate = policyDate(usEntries)

      let flag: Flag = 'CLEAN'
      let flagNote = note
      if (ambiguous) {
        flag = 'CHECK: ambiguous-match'
      } else if (!candidate) {
        flag = 'CHECK: no-us-theatrical'
        flagNote = usEntries.length
          ? 'US entries exist but none typed theatrical (2/3) — untyped/noisy, human call'
          : 'TMDB has no US release entries at all'
      } else if (usTheatrical.length > 1) {
        // Suspicious spread: a real re-release gap, or a note field flagging
        // a special/anniversary run mixed in with the original.
        const days = usTheatrical.map((e) => dayOf(e.release_date))
        const spanYears = yearOf(days[days.length - 1]) - yearOf(days[0])
        const suspiciousNote = usTheatrical.some((e) => /anniversary|re-?release|restoration|special/i.test(e.note ?? ''))
        if (spanYears >= 2 || suspiciousNote) {
          flag = 'CHECK: multiple-theatrical-candidates'
          flagNote = `${usTheatrical.length} US theatrical entries spanning ${days[0]}..${days[days.length - 1]}${suspiciousNote ? ' (note field suggests a re-release)' : ''}`
        }
      }

      drafts.push({
        query: q,
        tmdbId: hit.id,
        tmdbTitle: hit.title,
        primaryDay: hit.release_date || undefined,
        policyDay: candidate ? dayOf(candidate.release_date) : undefined,
        usEvidence: usEntries, // full US rows, not just theatrical — evidence should show everything
        flag,
        note: flagNote,
      })
    }
  } catch (err) {
    drafts.push({
      query: q,
      flag: 'NOT-FOUND',
      note: `lookup errored: ${err instanceof Error ? err.message : String(err)}`,
    })
  }
  done += 1
  if (done % 25 === 0) console.log(`  ...${done}/${queries.length}`)
}

// ---- report ----
const byFlag = (f: Flag) => drafts.filter((d) => d.flag === f)
const clean = byFlag('CLEAN')

const evidenceRows = (d: Draft): string[] => {
  if (!d.usEvidence?.length) return ['  - (no US release-date entries at all)']
  return d.usEvidence.map((e) => {
    const typeName = e.type === 1 ? 'premiere' : e.type === 2 ? 'theatrical-limited' : e.type === 3 ? 'theatrical' : e.type === 4 ? 'digital' : e.type === 5 ? 'physical' : e.type === 6 ? 'tv' : `type${e.type}`
    return `  - ${dayOf(e.release_date)} — t${e.type} (${typeName})${e.note ? ` — note: "${e.note}"` : ''}`
  })
}

const lines: string[] = []
lines.push(`# Stage B date draft — ${INPUT}`)
lines.push('')
lines.push('GENERATED by scripts/tmdb-date-draft.ts for human arbitration — never merge')
lines.push('straight into src/data or a *-seed.ts. Policy: US theatrical (types 2+3,')
lines.push('limited counts as theatrical), earliest, per the lock in')
lines.push('scripts/chronology-seed.ts. TMDB only types the dates; Buri chose which')
lines.push('films and still rules on every drafted date before it merges (see')
lines.push('docs/stage-b-plan.md "The draft tool call"). Data © TMDB, free tier.')
lines.push('')
lines.push(`- titles drafted: **${drafts.length}**`)
lines.push(`- CLEAN: **${clean.length}**`)
lines.push(`- CHECK: ambiguous-match: **${byFlag('CHECK: ambiguous-match').length}**`)
lines.push(`- CHECK: no-us-theatrical: **${byFlag('CHECK: no-us-theatrical').length}**`)
lines.push(`- CHECK: multiple-theatrical-candidates: **${byFlag('CHECK: multiple-theatrical-candidates').length}**`)
lines.push(`- NOT-FOUND: **${byFlag('NOT-FOUND').length}**`)
lines.push('')

for (const d of drafts) {
  const label = d.tmdbTitle ? `${d.tmdbTitle}${d.tmdbId ? ` [tmdb ${d.tmdbId}](https://www.themoviedb.org/movie/${d.tmdbId})` : ''}` : '(no TMDB match)'
  lines.push(`## ${d.query.raw}`)
  lines.push('')
  lines.push(`- matched: ${label}`)
  lines.push(`- flag: **${d.flag}**${d.note ? ` — ${d.note}` : ''}`)
  lines.push(`- drafted policy date: **${d.policyDay ?? 'NONE'}**${d.primaryDay ? ` (TMDB headline date: ${dayOf(d.primaryDay)}, shown as evidence only)` : ''}`)
  if (d.flag !== 'NOT-FOUND') {
    lines.push('- US release-date evidence:')
    lines.push(...evidenceRows(d))
  }
  lines.push('')
}

lines.push('## Summary by flag')
lines.push('')
lines.push(`| flag | count |`)
lines.push(`|---|---|`)
lines.push(`| CLEAN | ${clean.length} |`)
lines.push(`| CHECK: ambiguous-match | ${byFlag('CHECK: ambiguous-match').length} |`)
lines.push(`| CHECK: no-us-theatrical | ${byFlag('CHECK: no-us-theatrical').length} |`)
lines.push(`| CHECK: multiple-theatrical-candidates | ${byFlag('CHECK: multiple-theatrical-candidates').length} |`)
lines.push(`| NOT-FOUND | ${byFlag('NOT-FOUND').length} |`)
lines.push('')

mkdirSync(dirname(resolve(OUT)), { recursive: true })
writeFileSync(resolve(OUT), lines.join('\n'))
console.log(`\nwrote ${OUT}`)
console.log(
  `CLEAN ${clean.length} · ambiguous-match ${byFlag('CHECK: ambiguous-match').length} · no-us-theatrical ${byFlag('CHECK: no-us-theatrical').length} · multiple-candidates ${byFlag('CHECK: multiple-theatrical-candidates').length} · NOT-FOUND ${byFlag('NOT-FOUND').length}`,
)

if (byFlag('NOT-FOUND').length > 0) {
  console.error(`\n${byFlag('NOT-FOUND').length} title(s) had no TMDB match at all — batch failing loud.`)
  process.exit(1)
}
