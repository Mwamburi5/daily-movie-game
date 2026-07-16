// src/lib/progress.ts — versioned localStorage meta-state (WS1 instrumentation).
//
// META-STATE ONLY, per the persistence guardrail (CLAUDE.md, revisited
// 2026-07-04): streaks, played-today, personal bests, duel win/loss record.
// Nothing in here is ever READ by a rule — deals and scoring stay stateless and
// seed-derived. If a future change makes gameplay depend on a value from this
// file, that change is wrong.
//
// Streaks are keyed by the DAILY SEED ('YYYY-MM-DD' from lib/daily.ts
// localDateSeed), not wall-clock time: "consecutive days" means consecutive
// seed strings, so a timezone hop or late-night session can't silently break a
// streak the player earned. All date math here is calendar arithmetic on the
// seed string (via Date.UTC, immune to DST), never `new Date()` comparisons.

import type { Difficulty } from './difficulty.ts'

// Renamed from 'marquee:v1' during the 2026-07-04 rebrand — safe with no
// migration because WS1 never deployed, so no player data exists under the
// old key. Any future key change DOES need a read-old-write-new migration.
const KEY = 'matchcut:v1'

// Day 1 of the public count — the WS1 ship date. Purely cosmetic ("day N" on
// end screens); derived from the seed, so it needs no storage and can't drift.
const DAILY_EPOCH = '2026-07-04'

export interface DailyMeta {
  lastSeed: string | null // seed of the most recent completed daily
  streak: number // consecutive daily seeds completed, ending at lastSeed
  best: number | null // personal best score (golf — lower wins), set on first completion of a seed
}

export interface DuelMeta {
  plays: number
  wins: number
}

interface ProgressV1 {
  v: 1
  solo: DailyMeta
  chronology: DailyMeta
  connections: DailyMeta
  duel: Record<Difficulty, DuelMeta>
  // First-run framing dismissed. META ONLY — a one-shot UI gate (App.tsx), never
  // read by a rule. Optional/additive: a pre-intro blob lacks it → treated as
  // unseen (shows once, then persists). Same additive pattern as `connections`.
  seenIntro?: boolean
  // Duel drag-to-play nudge dismissed (feedback batch 1: "drag it to play took
  // me a sec"). META ONLY, same one-shot additive pattern as seenIntro.
  seenDragPlay?: boolean
}

export type DailyMode = 'solo' | 'chronology' | 'connections'

const freshDaily = (): DailyMeta => ({ lastSeed: null, streak: 0, best: null })

const fresh = (): ProgressV1 => ({
  v: 1,
  solo: freshDaily(),
  chronology: freshDaily(),
  connections: freshDaily(),
  duel: {
    matinee: { plays: 0, wins: 0 },
    feature: { plays: 0, wins: 0 },
    directors: { plays: 0, wins: 0 },
  },
  seenIntro: false,
  seenDragPlay: false,
})

// localStorage can be absent or throwing (Safari private mode, storage full).
// Meta-state is a nicety — every failure path degrades to "no memory", never
// to a broken game.
export function loadProgress(): ProgressV1 {
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return fresh()
    const p = JSON.parse(raw) as ProgressV1
    if (p?.v !== 1 || !p.solo || !p.chronology || !p.duel) return fresh()
    // connections is an additive v1 field (arrived with Mode 4). Backfill it on a
    // pre-connections blob rather than requiring it — a missing mode must never
    // wipe the solo/chronology streaks a player already earned.
    if (!p.connections) p.connections = freshDaily()
    return p
  } catch {
    return fresh()
  }
}

function save(p: ProgressV1): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(p))
  } catch {
    // storage unavailable — play on without memory
  }
}

// ── seed calendar arithmetic ──────────────────────────────────────────────────
// Seeds are 'YYYY-MM-DD'. Date.UTC turns one into a DST-proof day index; the
// local clock is never consulted, so this stays honest across timezones.

function seedToUtc(seed: string): number {
  const [y, m, d] = seed.split('-').map(Number)
  return Date.UTC(y, m - 1, d)
}

const DAY_MS = 86_400_000

// The seed one calendar day before `seed` — the streak-continuation test.
export function prevSeed(seed: string): string {
  const d = new Date(seedToUtc(seed) - DAY_MS)
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${d.getUTCFullYear()}-${m}-${day}`
}

// "day N" for the end screens: 1-based count of daily seeds since the epoch.
export function dayNumber(seed: string): number {
  return Math.round((seedToUtc(seed) - seedToUtc(DAILY_EPOCH)) / DAY_MS) + 1
}

// ── recording ─────────────────────────────────────────────────────────────────

export interface DailyFinish {
  day: number
  streak: number
  best: number | null
  repeat: boolean // this seed was already recorded — nothing changed
}

// Record a COMPLETED daily run (reached the end screen — a stuck Solo still
// counts as played). Callers gate on start.kind === 'daily'; practice rounds
// never reach here. Increments at most once per seed: the first completion of
// the day is THE result — replays of the same board don't touch streak or best
// (and can't farm a personal best with foreknowledge of the deal). `score` is
// null when the run has no comparable score (a stuck Solo).
export function recordDailyFinish(mode: DailyMode, seed: string, score: number | null): DailyFinish {
  const p = loadProgress()
  const m = p[mode]
  if (m.lastSeed === seed) {
    return { day: dayNumber(seed), streak: m.streak, best: m.best, repeat: true }
  }
  const streak = m.lastSeed === prevSeed(seed) ? m.streak + 1 : 1
  const best = score !== null && (m.best === null || score < m.best) ? score : m.best
  p[mode] = { lastSeed: seed, streak, best }
  save(p)
  return { day: dayNumber(seed), streak, best, repeat: false }
}

// Duel has no daily — its return signal is replays, so the record is plays and
// wins per difficulty. Every finished duel counts.
export function recordDuelFinish(difficulty: Difficulty, won: boolean): DuelMeta {
  const p = loadProgress()
  const m = p.duel[difficulty] ?? { plays: 0, wins: 0 }
  const next = { plays: m.plays + 1, wins: m.wins + (won ? 1 : 0) }
  p.duel[difficulty] = next
  save(p)
  return next
}

// ── menu surface ──────────────────────────────────────────────────────────────

export interface DailyStatus {
  playedToday: boolean
  streak: number // 0 when the chain is broken (lastSeed is neither today nor yesterday)
}

// What the menu chip shows for a daily mode. A streak whose lastSeed is older
// than yesterday is already dead — show 0, not the stale count.
export function dailyStatus(mode: DailyMode, todaySeed: string): DailyStatus {
  const m = loadProgress()[mode]
  const playedToday = m.lastSeed === todaySeed
  const alive = playedToday || m.lastSeed === prevSeed(todaySeed)
  return { playedToday, streak: alive ? m.streak : 0 }
}

export function duelRecord(difficulty: Difficulty): DuelMeta {
  return loadProgress().duel[difficulty] ?? { plays: 0, wins: 0 }
}

// ── first-run framing ─────────────────────────────────────────────────────────
// A one-shot welcome overlay (App.tsx) — Buri's "minimal framing" call
// (2026-07-08), NOT a tutorial funnel. Meta-state only: a UI gate, never a rule
// input. A blob without the flag reads as unseen, so the intro shows exactly once
// per device and then persists.

export function hasSeenIntro(): boolean {
  return loadProgress().seenIntro === true
}

export function markIntroSeen(): void {
  const p = loadProgress()
  if (p.seenIntro) return
  p.seenIntro = true
  save(p)
}

// ── drag-to-play nudge ────────────────────────────────────────────────────────
// One-shot Duel hint (feedback batch 1): a raised card on a fresh device shows
// "drag it onto a marquee to play" until the player's first drag lands on a
// target, then never again. UI gate only, never a rule input.

export function hasSeenDragPlay(): boolean {
  return loadProgress().seenDragPlay === true
}

export function markDragPlaySeen(): void {
  const p = loadProgress()
  if (p.seenDragPlay) return
  p.seenDragPlay = true
  save(p)
}
