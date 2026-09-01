import assert from 'node:assert/strict'
import {
  isValidAnalyticsEvent,
  track,
  type AnalyticsEmitter,
  type AnalyticsEventName,
  type EventData,
} from '../src/lib/analytics.ts'
import { JourneyAnalytics } from '../src/lib/journeyAnalytics.ts'

type Captured = { name: AnalyticsEventName; data: EventData }

const events: Captured[] = []
const capture: AnalyticsEmitter = (name, data) => events.push({ name, data })
const solo = new JourneyAnalytics({ mode: 'solo', kind: 'daily' }, capture, '2')

solo.startEntry()
solo.startEntry() // React StrictMode effect replay must not duplicate entry.
assert.deepEqual(events, [
  { name: 'mode_start', data: { mode: 'solo', kind: 'daily', session_mode_ordinal: '2' } },
])

solo.action('flip', true)
solo.action('play', true)
assert.equal(events.filter((event) => event.name === 'first_action').length, 1)
assert.deepEqual(events.find((event) => event.name === 'first_action'), {
  name: 'first_action',
  data: { mode: 'solo', kind: 'daily', action: 'flip' },
})

solo.helpOpen('playing')
solo.helpClose()
solo.action('play', false)
solo.action('play', true)
assert.deepEqual(events.filter((event) => event.name === 'help_return'), [
  { name: 'help_return', data: { mode: 'solo', resolved: false } },
])

solo.helpOpen('playing')
solo.helpClose()
solo.helpOpen('playing')
solo.helpClose()
solo.action('flip', true)
assert.equal(events.filter((event) => event.name === 'help_open').length, 3)
assert.equal(events.filter((event) => event.name === 'help_return').length, 2)

for (let count = 0; count < 5; count += 1) solo.friction('invalid_play')
assert.deepEqual(
  events.filter((event) => event.name === 'friction').map((event) => event.data.count_bucket),
  ['1', '2', '3', '4+', '4+'],
)

solo.replay()
assert.deepEqual(events.filter((event) => event.name === 'replay'), [
  { name: 'replay', data: { mode: 'solo', kind: 'daily' } },
])
assert.deepEqual(
  events.filter((event) => event.name === 'mode_start').map((event) => event.data.session_mode_ordinal),
  ['2', '2'],
)
solo.action('select', true)
assert.equal(events.filter((event) => event.name === 'first_action').length, 2)

const valid: Array<[AnalyticsEventName, EventData]> = [
  ['mode_start', { mode: 'duel', difficulty: 'feature', session_mode_ordinal: '4+' }],
  ['mode_finish', { mode: 'solo', kind: 'practice', result: 'won', flips: 2, score: -1, par: 3 }],
  ['mode_finish', { mode: 'chronology', kind: 'daily', result: 'cleared', strokes: 4, score: 2 }],
  ['mode_finish', { mode: 'connections', kind: 'daily', result: 'lost' }],
  ['mode_finish', { mode: 'duel', difficulty: 'directors', result: 'draw' }],
  ['share', { mode: 'connections', kind: 'practice' }],
  ['first_action', { mode: 'duel', difficulty: 'matinee', action: 'draw' }],
  ['help_open', { mode: 'overview', state: 'menu' }],
  ['help_return', { mode: 'chronology', resolved: true }],
  ['friction', { mode: 'connections', kind: 'one_away', count_bucket: '3' }],
  ['share_attempt', { mode: 'solo', result: 'manual_fallback' }],
  ['replay', { mode: 'duel', difficulty: 'feature' }],
]
for (const [name, data] of valid) assert.equal(isValidAnalyticsEvent(name, data), true, `${name} valid`)

const forbidden: Array<[unknown, unknown]> = [
  ['mode_start', { mode: 'solo', kind: 'daily' }],
  ['mode_start', { mode: 'solo', kind: 'daily', session_mode_ordinal: '5' }],
  ['first_action', { mode: 'solo', kind: 'daily', action: 'draw' }],
  ['first_action', { mode: 'solo', kind: 'daily', action: 'play', movie_id: 'heat' }],
  ['help_open', { mode: 'overview', state: 'playing' }],
  ['help_open', { mode: 'solo', state: 'playing', text: 'please help' }],
  ['help_return', { mode: 'solo', resolved: 'yes' }],
  ['friction', { mode: 'chronology', kind: 'invalid_play', count_bucket: '1' }],
  ['friction', { mode: 'connections', kind: 'miss', count_bucket: 2 }],
  ['share_attempt', { mode: 'solo', result: 'copied', clipboard: 'movie titles' }],
  ['mode_finish', { mode: 'solo', kind: 'daily', result: 'won', flips: 2, score: 1e20, par: 3 }],
  ['share', { mode: 'solo', kind: 'daily', localStorage: { streak: 7 } }],
  ['replay', { mode: 'duel', difficulty: 'feature', seed: '2026-08-28' }],
  ['unknown_event', { mode: 'solo' }],
]
for (const [name, data] of forbidden) assert.equal(isValidAnalyticsEvent(name, data), false, `${String(name)} rejected`)

// Missing and throwing collectors are both non-fatal. Node has no browser
// window, so the first call exercises the missing path; the injected journey
// emitter exercises a blocked collector without touching gameplay state.
assert.doesNotThrow(() => track('help_open', { mode: 'overview', state: 'menu' }))
assert.equal(track('help_open', { mode: 'overview', state: 'menu' }), false)
const blocked = new JourneyAnalytics(
  { mode: 'duel', difficulty: 'matinee' },
  () => { throw new Error('collector blocked') },
  '1',
)
assert.doesNotThrow(() => {
  blocked.startEntry()
  blocked.action('draw', true)
  blocked.helpOpen('playing')
  blocked.helpClose()
  blocked.action('keep', true)
  blocked.friction('no_play_draw')
  blocked.replay()
})

console.log('analytics verifier: 12 valid contracts, 14 forbidden payloads, exact-once journey gates PASS')
