// scripts/tmdb-date-audit.ts — check Chronology dates against TMDB under the
// LOCKED date policy.
//
//   npm run tmdb:dates                               (audits src/data/chronology-pool.json)
//   node scripts/tmdb-date-audit.ts --input src/data/chronology-pool.json --out docs/tmdb-date-audit.md
//
// THE POLICY (scripts/chronology-seed.ts, locked 2026-06-27): releaseDate is
// the US THEATRICAL date — limited openings count, festival premieres and
// streaming dates are excluded. TMDB's headline `release_date` VIOLATES this
// policy (it's usually the earliest date, premieres mixed in), so this script
// never compares against it directly; it asks GET /movie/{id}/release_dates,
// filters to US (iso_3166_1 = 'US'), keeps types 2 + 3 (Theatrical limited +
// Theatrical), and takes the earliest. The headline date is printed only as
// evidence for the human arbitrating a flag.
//
// CURATION-FIRST, same stance as tmdb-audit.ts: this script NEVER writes into
// src/data or scripts/chronology-seed.ts. It emits a grouped diff report for
// arbitration (the wave1-diffs pattern):
//
//   likely-wrong — face-YEAR differs and TMDB's candidate looks like a real
//                  original run (post-1990, no re-release suspicion). These
//                  change the card a player sees; recommend fix.
//   uncertain    — human-call territory: no US theatrical entries, the earliest
//                  US theatrical looks like a re-release masquerading as the
//                  original run (candidate year ≥ 2 over TMDB's own primary
//                  year), or a pre-1990 mismatch (old entries are untyped/noisy
//                  on TMDB — the seed's own caveat).
//   cosmetic     — same face year, different day. Order among same-year films
//                  can shift, the card year can't. Apply-recommended but low
//                  stakes.
//
// A date fix reshuffles the date-seeded Chronology daily: pre-public that's
// free, but the first batch ships only on Buri's explicit confirm
// (PLAN.md Amendment 1 · A2).

import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  assertCredentials,
  searchMovie,
  movieReleaseDates,
  type TmdbReleaseEntry,
} from './tmdb.ts'

// ---- args ----
const argv = process.argv.slice(2)
const argOf = (flag: string): string | undefined => {
  const i = argv.indexOf(flag)
  return i >= 0 ? argv[i + 1] : undefined
}
const INPUT = argOf('--input') ?? 'src/data/chronology-pool.json'
const OUT = argOf('--out') ?? 'docs/tmdb-date-audit.md'

// ---- load the pool ----
interface PoolEntry {
  id: string
  title: string
  year: number
  releaseDate: string
}
const entries: PoolEntry[] = JSON.parse(readFileSync(resolve(INPUT), 'utf8'))
if (!Array.isArray(entries) || !entries.length || !entries[0].releaseDate) {
  console.error(`${INPUT} is not a chronology pool (array with releaseDate entries)`)
  process.exit(1)
}

assertCredentials()

// ---- the policy filter ----
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

// ---- per-film verdicts ----
type Group = 'likely-wrong' | 'uncertain' | 'cosmetic'
interface Verdict {
  entry: PoolEntry
  tmdbId?: number
  group?: Group // undefined = clean
  reason?: string
  tmdbPolicyDay?: string
  tmdbPrimaryDay?: string
  usTheatrical?: TmdbReleaseEntry[] // full evidence for the arbiter
  unmatched?: boolean
}

function judge(entry: PoolEntry, tmdbId: number, primaryDay: string, usEntries: TmdbReleaseEntry[]): Verdict {
  const base: Verdict = { entry, tmdbId, tmdbPrimaryDay: primaryDay || undefined }
  base.usTheatrical = usEntries.filter((e) => THEATRICAL_TYPES.has(e.type))

  const candidate = policyDate(usEntries)
  if (!candidate) {
    const anyUs = usEntries.length > 0
    return {
      ...base,
      group: 'uncertain',
      reason: anyUs
        ? 'US entries exist but none typed theatrical (2/3) — untyped/noisy, human call'
        : 'TMDB has no US release entries at all',
    }
  }

  const tmdbDay = dayOf(candidate.release_date)
  base.tmdbPolicyDay = tmdbDay
  if (tmdbDay === entry.releaseDate) return base // clean

  // Re-release masquerade: on older films the original run can be missing and
  // the earliest "theatrical" entry is a restoration/anniversary run. Signal:
  // the candidate sits ≥2 years after TMDB's own primary date.
  const primaryYear = primaryDay ? yearOf(primaryDay) : 0
  const candYear = yearOf(tmdbDay)
  if (primaryYear && candYear - primaryYear >= 2) {
    return {
      ...base,
      group: 'uncertain',
      reason: `earliest US theatrical (${tmdbDay}${candidate.note ? `, "${candidate.note}"` : ''}) is ${candYear - primaryYear}y after TMDB's primary date — re-release masquerade suspected`,
    }
  }

  const sameFaceYear = candYear === yearOf(entry.releaseDate)
  if (sameFaceYear) {
    return {
      ...base,
      group: 'cosmetic',
      reason: `same face year, day differs (ours ${entry.releaseDate} vs TMDB ${tmdbDay})${entry.year < 1990 ? ' — pre-1990, TMDB day precision is noisy' : ''}`,
    }
  }

  // Face year differs — the serious case. Pre-1990 typing is noisy enough that
  // the seed's caveat applies: demote to a human call rather than "fix it".
  if (entry.year < 1990) {
    return {
      ...base,
      group: 'uncertain',
      reason: `face year differs (ours ${entry.releaseDate} vs TMDB ${tmdbDay}) but pre-1990 TMDB typing is noisy — human call`,
    }
  }
  return {
    ...base,
    group: 'likely-wrong',
    reason: `face year differs: ours ${entry.releaseDate} vs TMDB US-theatrical ${tmdbDay}`,
  }
}

// ---- run ----
console.log(`date-auditing ${entries.length} films from ${INPUT} against TMDB (policy: US theatrical, types 2+3, earliest)...`)
const verdicts: Verdict[] = []
let done = 0
for (const entry of entries) {
  try {
    const hit = await searchMovie(entry.title, entry.year)
    if (!hit) {
      verdicts.push({ entry, unmatched: true })
    } else {
      const countries = await movieReleaseDates(hit.id)
      const usEntries = countries.find((c) => c.iso_3166_1 === US)?.release_dates ?? []
      verdicts.push(judge(entry, hit.id, dayOf(hit.release_date ?? ''), usEntries))
    }
  } catch (err) {
    verdicts.push({
      entry,
      unmatched: true,
      reason: `audit errored: ${err instanceof Error ? err.message : String(err)}`,
    })
  }
  done += 1
  if (done % 25 === 0) console.log(`  ...${done}/${entries.length}`)
}

// ---- report ----
const clean = verdicts.filter((v) => !v.unmatched && !v.group)
const unmatched = verdicts.filter((v) => v.unmatched)
const grouped = (g: Group) => verdicts.filter((v) => v.group === g)

const evidence = (v: Verdict): string => {
  const parts: string[] = []
  parts.push(`ours **${v.entry.releaseDate}**`)
  parts.push(`policy ${v.tmdbPolicyDay ?? '—'}`)
  parts.push(`headline ${v.tmdbPrimaryDay ?? '—'}`)
  const us = (v.usTheatrical ?? [])
    .map((e) => `${dayOf(e.release_date)} (t${e.type}${e.note ? ` "${e.note}"` : ''})`)
    .join(' · ')
  parts.push(`US theatrical: ${us || 'none'}`)
  return parts.join(' | ')
}

const lines: string[] = []
lines.push(`# TMDB date audit — ${INPUT}`)
lines.push('')
lines.push("GENERATED by scripts/tmdb-date-audit.ts — regenerate, don't hand-edit.")
lines.push('Policy: US theatrical (types 2+3, limited counts), earliest — per the lock')
lines.push("in scripts/chronology-seed.ts. TMDB's headline release_date is shown as")
lines.push('evidence only. TMDB is a witness, not a judge: every flag is arbitrated by')
lines.push('hand; fixes land in chronology-seed.ts, never here. Data © TMDB, free tier.')
lines.push('')
lines.push(`- films audited: **${verdicts.length}**`)
lines.push(`- clean (policy date matches): **${clean.length}**`)
lines.push(`- likely-wrong: **${grouped('likely-wrong').length}** · uncertain: **${grouped('uncertain').length}** · cosmetic: **${grouped('cosmetic').length}**`)
lines.push(`- no TMDB match: **${unmatched.length}**`)
lines.push('')
lines.push('⚠ Applying any fix reshuffles the date-seeded Chronology daily — first batch')
lines.push('ships only on an explicit confirm (PLAN.md Amendment 1 · A2).')
lines.push('')

const section = (title: string, g: Group, blurb: string) => {
  const rows = grouped(g)
  if (!rows.length) return
  lines.push(`## ${title} (${rows.length})`)
  lines.push('')
  lines.push(blurb)
  lines.push('')
  for (const v of rows) {
    lines.push(`1. \`${v.entry.id}\` · ${v.entry.title} (${v.entry.year}) · [tmdb ${v.tmdbId}](https://www.themoviedb.org/movie/${v.tmdbId})`)
    lines.push(`   - ${v.reason}`)
    lines.push(`   - ${evidence(v)}`)
  }
  lines.push('')
}

section('Group 1 — likely-wrong (recommend fix)', 'likely-wrong',
  'Face YEAR differs and the TMDB candidate looks like a genuine original run.')
section('Group 2 — uncertain (human calls)', 'uncertain',
  'No usable US theatrical entry, re-release masquerade suspected, or pre-1990 noise.')
section('Group 3 — cosmetic (same face year, day differs)', 'cosmetic',
  'Card year unchanged; same-year ordering could shift. Apply-recommended, low stakes.')

if (unmatched.length) {
  lines.push(`## No TMDB match (${unmatched.length})`)
  lines.push('')
  for (const v of unmatched) {
    lines.push(`- ${v.entry.title} (${v.entry.year}) — \`${v.entry.id}\`${v.reason ? ` — ${v.reason}` : ''}`)
  }
  lines.push('')
}

writeFileSync(resolve(OUT), lines.join('\n'))
console.log(`\nwrote ${OUT}`)
console.log(
  `clean ${clean.length} · likely-wrong ${grouped('likely-wrong').length} · uncertain ${grouped('uncertain').length} · cosmetic ${grouped('cosmetic').length} · unmatched ${unmatched.length}`,
)
