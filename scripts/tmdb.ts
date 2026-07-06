// scripts/tmdb.ts — shared TMDB client for author-time scripts.
//
// AUTHOR-TIME ONLY. Like build-chronology-pool.ts and the sim harnesses, this
// never ships: the game reads baked src/data files and makes zero network
// calls. TMDB is a librarian we phone while writing content, not a dependency
// the game has at runtime.
//
// Credentials come from .env.local (gitignored). No dotenv dep — the file is
// three lines of KEY=VALUE, parsed by hand to keep the locked dep list intact.

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const API_BASE = 'https://api.themoviedb.org/3'

// TMDB asks clients to stay under ~50 req/s; we run at ~10/s. At 2 requests
// per film an audit of 300 films finishes in about a minute — patience is
// cheaper than a ban.
const REQUEST_GAP_MS = 100

interface Credentials {
  readToken?: string
  apiKey?: string
}

function loadCredentials(): Credentials {
  const creds: Credentials = {
    readToken: process.env.TMDB_API_READ_TOKEN || undefined,
    apiKey: process.env.TMDB_API_KEY || undefined,
  }
  if (creds.readToken || creds.apiKey) return creds
  let raw: string
  try {
    raw = readFileSync(resolve('.env.local'), 'utf8')
  } catch {
    return creds
  }
  for (const line of raw.split('\n')) {
    const m = line.match(/^\s*(TMDB_API_READ_TOKEN|TMDB_API_KEY)\s*=\s*(\S+)\s*$/)
    if (!m) continue
    if (m[1] === 'TMDB_API_READ_TOKEN') creds.readToken = m[2]
    else creds.apiKey = m[2]
  }
  return creds
}

const CREDS = loadCredentials()

export function assertCredentials(): void {
  if (CREDS.readToken || CREDS.apiKey) return
  console.error(
    'no TMDB credentials found.\n' +
      'paste your API Read Access Token into .env.local at the repo root:\n' +
      '  TMDB_API_READ_TOKEN=eyJ...\n' +
      '(themoviedb.org -> Settings -> API)',
  )
  process.exit(1)
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
let lastRequestAt = 0

// GET an API path with query params, rate-limited and JSON-decoded.
// Prefers the v4 read token (Bearer header); falls back to the v3 api_key.
export async function tmdbGet(path: string, params: Record<string, string> = {}): Promise<any> {
  const wait = lastRequestAt + REQUEST_GAP_MS - Date.now()
  if (wait > 0) await sleep(wait)
  lastRequestAt = Date.now()

  const url = new URL(API_BASE + path)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  const headers: Record<string, string> = { accept: 'application/json' }
  if (CREDS.readToken) headers.Authorization = `Bearer ${CREDS.readToken}`
  else if (CREDS.apiKey) url.searchParams.set('api_key', CREDS.apiKey)

  const res = await fetch(url, { headers })
  if (res.status === 401) {
    throw new Error('TMDB rejected the credentials (401) — check .env.local')
  }
  if (res.status === 429) {
    // rare at our rate, but back off once and retry rather than dying mid-audit
    await sleep(2000)
    return tmdbGet(path, params)
  }
  if (!res.ok) throw new Error(`TMDB ${res.status} on ${path}`)
  return res.json()
}

// ---- typed slices of the two endpoints the scripts use ----

export interface TmdbSearchHit {
  id: number
  title: string
  release_date: string // 'YYYY-MM-DD' or ''
  popularity: number
  vote_count: number
}

export interface TmdbCredits {
  cast: { name: string; order: number }[]
  crew: { name: string; job: string; department: string }[]
}

export interface TmdbMovie {
  id: number
  title: string
  release_date: string
  genres: { id: number; name: string }[]
  belongs_to_collection: { id: number; name: string } | null
  credits: TmdbCredits
}

// Find the TMDB entry for a title. Tries an exact-year search first; if that
// misses, retries unconstrained — OUR year may be the wrong datum, and finding
// the film anyway is how the audit catches that.
export async function searchMovie(title: string, year?: number): Promise<TmdbSearchHit | null> {
  const base = { query: title, include_adult: 'false', language: 'en-US' }
  if (year !== undefined) {
    const withYear = await tmdbGet('/search/movie', { ...base, primary_release_year: String(year) })
    if (withYear.results?.length) return pickHit(withYear.results, title)
  }
  const open = await tmdbGet('/search/movie', base)
  return open.results?.length ? pickHit(open.results, title) : null
}

// Among search hits, prefer an exact (case-insensitive) title match with the
// most votes — "Heat" alone returns a page of Heats, and popularity is
// recency-biased, so vote_count is the fame signal that favors the classic.
function pickHit(results: TmdbSearchHit[], title: string): TmdbSearchHit {
  const wanted = title.toLowerCase()
  const exact = results.filter((r) => r.title.toLowerCase() === wanted)
  const pool = exact.length ? exact : results
  return pool.reduce((a, b) => (b.vote_count > a.vote_count ? b : a))
}

// One round trip for details + full credits.
export async function movieWithCredits(id: number): Promise<TmdbMovie> {
  return tmdbGet(`/movie/${id}`, { append_to_response: 'credits', language: 'en-US' })
}

// ---- release dates (the Chronology date policy lives on top of this) ----

// TMDB release types: 1 Premiere · 2 Theatrical (limited) · 3 Theatrical ·
// 4 Digital · 5 Physical · 6 TV. The locked Chronology policy keeps 2+3 only —
// TMDB's headline release_date mixes premieres in and must never be used for
// Chronology dates.
export interface TmdbReleaseEntry {
  type: number
  release_date: string // ISO datetime, e.g. '1995-09-22T00:00:00.000Z'
  note?: string
}

export interface TmdbCountryReleases {
  iso_3166_1: string
  release_dates: TmdbReleaseEntry[]
}

export async function movieReleaseDates(id: number): Promise<TmdbCountryReleases[]> {
  const res = await tmdbGet(`/movie/${id}/release_dates`)
  return res.results ?? []
}
