// scripts/name-audit.ts — cross-pool name-consistency check.
//
//   npm run audit:names                       (checks src/data/movies.ts)
//   node scripts/name-audit.ts --input src/data/movies.ts --input scripts/wave2-candidate.ts
//   node scripts/name-audit.ts --out docs/name-audit.md
//
// WHY: pool matching is exact string equality, so one person stored under two
// spellings silently drops every link between the two halves. 'David Peoples'
// (Unforgiven) vs 'David Webb Peoples' (Blade Runner) killed that writer link
// until the 2026-07-05 wave-2 cross-check tripped over it by accident. This
// script hunts for that failure mode on purpose: it groups every credit name
// (director/writers/topCast/deepCast) by normalized keys and reports clusters
// where the SAME person is plausibly stored under DIFFERENT spellings.
//
// CURATION-FIRST, same contract as tmdb-audit.ts: this script NEVER writes
// src/data. It emits a markdown report for a human to arbitrate (the
// wave1-diffs.md pattern). Expect false positives — two real, distinct people
// can share a near-identical name — so a cluster is a question, not a verdict.
// Ruled-distinct pairs are recorded in docs/tmdb-rulings.md (field nameSplit)
// so the next run treats them as settled.
//
// LOCAL-ONLY: no TMDB, no network, no credentials — runs even while the API
// key is missing. Pass --input more than once to sweep a draft wave and the
// live pool together (the cross-pool case that caught Peoples).
//
// MATCH TIERS (drive the report's two groups):
//   fold-identical — same after case/diacritic folding and squashing spaces
//                    and punctuation ('Robert DeNiro' = 'Robert De Niro').
//                    Near-certainly one person, one spelling is a typo.
//   structural     — one name's tokens are an ordered subsequence of the
//                    other's, single letters expand as initials, and the
//                    first and last tokens must both match ('David Peoples'
//                    ⊆ 'David Webb Peoples', 'Samuel Jackson' ⊆ 'Samuel L.
//                    Jackson'). The anchor keeps 'Janet Peoples' out of the
//                    'David Webb Peoples' cluster. Needs a human ruling.

import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import type { Movie } from '../src/data/types.ts'

// ---- args ----
const argv = process.argv.slice(2)
const inputs: string[] = []
let out = 'docs/name-audit.md'
for (let i = 0; i < argv.length; i += 1) {
  if (argv[i] === '--input' && argv[i + 1]) inputs.push(argv[(i += 1)])
  if (argv[i] === '--out' && argv[i + 1]) out = argv[(i += 1)]
}
if (inputs.length === 0) inputs.push('src/data/movies.ts')

// ---- load every Movie[] to sweep ----
interface Occurrence {
  name: string
  movieId: string
  field: 'director' | 'writers' | 'topCast' | 'deepCast'
  source: string
}
const FIELDS = ['director', 'writers', 'topCast', 'deepCast'] as const

const occurrences: Occurrence[] = []
for (const input of inputs) {
  const mod = await import(pathToFileURL(resolve(input)).href)
  const entries: Movie[] =
    mod.MOVIES ?? mod.default ?? Object.values(mod).find((v) => Array.isArray(v))
  if (!entries?.length) {
    console.error(`${input} exports no Movie[] I can find (looked for MOVIES, default, any array)`)
    process.exit(1)
  }
  for (const movie of entries) {
    for (const field of FIELDS) {
      for (const name of movie[field] ?? []) {
        occurrences.push({ name, movieId: movie.id, field, source: input })
      }
    }
  }
}

// ---- normalization ----
// NFD strips combining marks (é→e); the map catches letters NFD can't split.
const FOLD_MAP: Record<string, string> = {
  ø: 'o', ł: 'l', ß: 'ss', æ: 'ae', œ: 'oe', đ: 'd', ð: 'd', þ: 'th', ħ: 'h', ı: 'i',
}
const fold = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\x00-\x7f]/g, (ch) => FOLD_MAP[ch] ?? ch)

// squash: letters/digits only — spacing and punctuation variants collide here
const squash = (s: string) => fold(s).replace(/[^a-z0-9]/g, '')
const tokens = (s: string) => fold(s).split(/[^a-z0-9]+/).filter(Boolean)

// a single letter reads as an initial for the other token ('l' ~ 'lee')
const tokenMatch = (a: string, b: string) =>
  a === b || (a.length === 1 && b.startsWith(a)) || (b.length === 1 && a.startsWith(b))

// short's tokens as an ordered subsequence of long's, first+last anchored
function structuralMatch(aTok: string[], bTok: string[]): boolean {
  const [short, long] = aTok.length <= bTok.length ? [aTok, bTok] : [bTok, aTok]
  if (short.length < 2) return false // one-token names (Cher) match nothing
  if (!tokenMatch(short[0], long[0])) return false
  if (!tokenMatch(short[short.length - 1], long[long.length - 1])) return false
  let j = 0
  for (const t of short) {
    while (j < long.length && !tokenMatch(t, long[j])) j += 1
    if (j >= long.length) return false
    j += 1
  }
  return true
}

// ---- cluster distinct spellings (union-find over pairwise matches) ----
const byName = new Map<string, Occurrence[]>()
for (const occ of occurrences) {
  const list = byName.get(occ.name) ?? []
  list.push(occ)
  byName.set(occ.name, list)
}
const names = [...byName.keys()]
const squashOf = new Map(names.map((n) => [n, squash(n)]))
const tokensOf = new Map(names.map((n) => [n, tokens(n)]))

const parent = new Map(names.map((n) => [n, n]))
const find = (n: string): string => {
  let root = n
  while (parent.get(root) !== root) root = parent.get(root)!
  parent.set(n, root)
  return root
}
const union = (a: string, b: string) => parent.set(find(a), find(b))

let foldPairs = 0
let structuralPairs = 0
for (let i = 0; i < names.length; i += 1) {
  for (let j = i + 1; j < names.length; j += 1) {
    const a = names[i]
    const b = names[j]
    if (squashOf.get(a) === squashOf.get(b)) {
      foldPairs += 1
      union(a, b)
    } else if (structuralMatch(tokensOf.get(a)!, tokensOf.get(b)!)) {
      structuralPairs += 1
      union(a, b)
    }
  }
}

const clusters = new Map<string, string[]>()
for (const n of names) {
  const root = find(n)
  const members = clusters.get(root) ?? []
  members.push(n)
  clusters.set(root, members)
}
const suspicious = [...clusters.values()]
  .filter((members) => members.length >= 2)
  .map((members) => ({
    members: members.sort(),
    // fold-identical only if EVERY member squashes to the same key
    certain: members.every((m) => squashOf.get(m) === squashOf.get(members[0])),
  }))
  .sort((a, b) => a.members[0].localeCompare(b.members[0]))

// ---- report ----
const certain = suspicious.filter((c) => c.certain)
const arbitrate = suspicious.filter((c) => !c.certain)

const describe = (name: string) =>
  byName
    .get(name)!
    .map((o) => `\`${o.movieId}\` (${o.field}${inputs.length > 1 ? `, ${o.source}` : ''})`)
    .join(', ')

const lines: string[] = []
lines.push(`# Name-consistency audit — ${inputs.join(' + ')}`)
lines.push('')
lines.push("GENERATED by scripts/name-audit.ts — regenerate, don't hand-edit.")
lines.push('Pool matching is exact string equality: one person under two spellings')
lines.push('silently breaks every link between the halves (the David Peoples ×')
lines.push('David Webb Peoples split). Every cluster below is a QUESTION for a')
lines.push('human — two real people can share a near-identical name. Never bulk-fix.')
lines.push('Ruled-distinct pairs belong in docs/tmdb-rulings.md (field nameSplit).')
lines.push('')
lines.push(`- credit occurrences swept: **${occurrences.length}**`)
lines.push(`- distinct spellings: **${names.length}**`)
lines.push(`- suspicious clusters: **${suspicious.length}** (${certain.length} fold-identical, ${arbitrate.length} structural)`)
lines.push('')

if (certain.length) {
  lines.push('## Group 1 — fold-identical (near-certainly the same person; pick one spelling)')
  lines.push('')
  for (const c of certain) {
    lines.push(`### ${c.members.join('  ×  ')}`)
    for (const m of c.members) lines.push(`- '${m}' — ${describe(m)}`)
    lines.push('')
  }
}

if (arbitrate.length) {
  lines.push('## Group 2 — structural near-match (needs a ruling: same person, or distinct?)')
  lines.push('')
  for (const c of arbitrate) {
    lines.push(`### ${c.members.join('  ×  ')}`)
    for (const m of c.members) lines.push(`- '${m}' — ${describe(m)}`)
    lines.push('')
  }
}

if (!suspicious.length) {
  lines.push('## All clear')
  lines.push('')
  lines.push('No spelling clusters found — every credit name is unique after folding.')
  lines.push('')
}

writeFileSync(resolve(out), lines.join('\n'))
console.log(`swept ${occurrences.length} credits, ${names.length} distinct spellings from ${inputs.join(' + ')}`)
console.log(`clusters: ${suspicious.length} (${certain.length} fold-identical · ${arbitrate.length} structural) — pairs matched: ${foldPairs} fold, ${structuralPairs} structural`)
console.log(`wrote ${out}`)
