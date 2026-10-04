import assert from 'node:assert/strict'
import {
  loadProgress,
  dailyProgram,
  DAILY_MODE_ORDER,
  recordDailyFinish,
  sanitizeProgress,
  type ProgressV1,
} from '../src/lib/progress.ts'

const blankDaily = { lastSeed: null, streak: 0, best: null }
const blankDuel = { plays: 0, wins: 0 }

assert.deepEqual(sanitizeProgress(null), {
  v: 1,
  solo: blankDaily,
  chronology: blankDaily,
  connections: blankDaily,
  duel: { matinee: blankDuel, feature: blankDuel, directors: blankDuel },
  seenDragPlay: false,
  seenOnboarding: false,
})
assert.deepEqual(sanitizeProgress({ v: 2, solo: {} }), sanitizeProgress(null))
assert.deepEqual(sanitizeProgress('wrong primitive'), sanitizeProgress(null))

const legacy = sanitizeProgress({
  v: 1,
  solo: { lastSeed: '2026-08-27', streak: 8, best: -2 },
  chronology: { lastSeed: '2026-08-26', streak: 3, best: 2 },
  duel: {
    matinee: { plays: 12, wins: 7 },
    feature: { plays: 4, wins: 2 },
    directors: { plays: 1, wins: 1 },
  },
  seenIntro: true,
})
assert.deepEqual(legacy.connections, blankDaily)
assert.deepEqual(legacy.solo, { lastSeed: '2026-08-27', streak: 8, best: -2 })
assert.deepEqual(legacy.chronology, { lastSeed: '2026-08-26', streak: 3, best: 2 })
assert.equal(legacy.seenIntro, true)

const partial = sanitizeProgress({
  v: 1,
  solo: { lastSeed: '2026-02-30', streak: 99, best: 4 },
  chronology: 'broken nested record',
  connections: { lastSeed: '2026-08-28', streak: -9, best: 99 },
  duel: {
    matinee: { plays: 3, wins: 8 },
    feature: { plays: -5, wins: 'many' },
    directors: { plays: 9_000_000, wins: 8_000_000 },
  },
  seenDragPlay: 'yes',
  seenOnboarding: 1,
  lastDifficulty: 'impossible',
})
assert.deepEqual(partial.solo, { lastSeed: null, streak: 0, best: 4 })
assert.deepEqual(partial.chronology, blankDaily)
assert.deepEqual(partial.connections, { lastSeed: '2026-08-28', streak: 1, best: 3 })
assert.deepEqual(partial.duel.matinee, { plays: 3, wins: 3 })
assert.deepEqual(partial.duel.feature, blankDuel)
assert.deepEqual(partial.duel.directors, { plays: 1_000_000, wins: 1_000_000 })
assert.equal(partial.seenDragPlay, false)
assert.equal(partial.seenOnboarding, false)
assert.equal(partial.lastDifficulty, undefined)

const valid: ProgressV1 = {
  v: 1,
  solo: { lastSeed: '2026-08-28', streak: 5, best: -3 },
  chronology: { lastSeed: '2026-08-27', streak: 4, best: 0 },
  connections: { lastSeed: '2026-08-26', streak: 2, best: 1 },
  duel: {
    matinee: { plays: 10, wins: 7 },
    feature: { plays: 3, wins: 1 },
    directors: { plays: 2, wins: 2 },
  },
  seenIntro: false,
  seenDragPlay: true,
  seenOnboarding: true,
  lastDifficulty: 'directors',
}
assert.deepEqual(sanitizeProgress(valid), valid)

let stored: string | null = JSON.stringify(valid)
const fakeWindow = {
  localStorage: {
    getItem: () => stored,
    setItem: (_key: string, value: string) => { stored = value },
  },
}
Object.defineProperty(globalThis, 'window', { configurable: true, value: fakeWindow })
assert.deepEqual(loadProgress(), valid)

stored = '{malformed json'
assert.deepEqual(loadProgress(), sanitizeProgress(null))

// All eight passport combinations keep one deterministic order, including
// entering in Connections or Chronology first. No new storage is needed.
const today = '2026-09-13'
for (let mask = 0; mask < 8; mask += 1) {
  const progress = sanitizeProgress(null)
  DAILY_MODE_ORDER.forEach((mode, index) => {
    if (mask & (1 << index)) progress[mode] = { lastSeed: today, streak: 1, best: null }
  })
  stored = JSON.stringify(progress)
  const unfinished = DAILY_MODE_ORDER.filter((_, index) => !(mask & (1 << index)))
  assert.deepEqual(dailyProgram(today), { completed: 3 - unfinished.length, next: unfinished[0] ?? null })
  assert.deepEqual(dailyProgram('2026-09-14'), { completed: 0, next: 'chronology' })
}

stored = JSON.stringify(sanitizeProgress(null))
assert.deepEqual(dailyProgram(today, { mode: 'connections', seed: today }), { completed: 1, next: 'chronology' })
assert.deepEqual(dailyProgram(today, { mode: 'solo', seed: '2026-09-12' }), { completed: 0, next: 'chronology' })
recordDailyFinish('solo', today, null) // a stuck daily stamps without a best
recordDailyFinish('connections', today, null) // a lost daily stamps too
assert.deepEqual(dailyProgram(today), { completed: 2, next: 'chronology' })
const beforeReplay = stored
assert.equal(recordDailyFinish('solo', today, -5).repeat, true)
assert.equal(stored, beforeReplay, 'replays must not change the original completion or best')

stored = JSON.stringify(valid)
fakeWindow.localStorage.setItem = () => { throw new Error('storage blocked') }
assert.doesNotThrow(() => recordDailyFinish('solo', '2026-08-29', 1))
assert.deepEqual(recordDailyFinish('solo', '2026-08-29', 1), {
  day: 57,
  streak: 6,
  best: -3,
  repeat: false,
})

fakeWindow.localStorage.getItem = () => { throw new Error('private mode') }
assert.deepEqual(loadProgress(), sanitizeProgress(null))
assert.deepEqual(dailyProgram(today, { mode: 'solo', seed: today }), { completed: 1, next: 'chronology' })

console.log('progress verifier: malformed, version, nested type, bounds, additive v1, round-trip, storage isolation, all 8 passport states, loss/replay semantics, and daily rollover PASS')
