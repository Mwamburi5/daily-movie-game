// Privacy-safe custom events for Vercel Web Analytics.
//
// Deps are locked, so this rides Vercel's same-origin script route, not
// @vercel/analytics. Calls made before the collector loads queue in window.vaq;
// analytics must never affect gameplay if validation, the script, or the
// collector is unavailable.

type VaProps = {
  name: string
  data?: Record<string, string | number | boolean>
}

type VaArguments = [event: 'event', props: VaProps]

interface VaWindow {
  va?: (...args: VaArguments) => void
  vaq?: VaArguments[]
}

const ANALYTICS_SCRIPT_PATH = '/_vercel/insights/script.js'

export type AnalyticsMode = 'solo' | 'chronology' | 'connections' | 'duel'
export type DailyKind = 'daily' | 'practice'
export type DuelDifficulty = 'matinee' | 'feature' | 'directors'
export type SessionModeOrdinal = '1' | '2' | '3' | '4+'

export type ModeIdentity =
  | { mode: Exclude<AnalyticsMode, 'duel'>; kind: DailyKind }
  | { mode: 'duel'; difficulty: DuelDifficulty }

export type ActionKind =
  | 'select'
  | 'flip'
  | 'play'
  | 'reveal_solution'
  | 'place'
  | 'submit'
  | 'shuffle'
  | 'deselect'
  | 'draw'
  | 'keep'
  | 'toss'
  | 'meld'
  | 'take'
  | 'final_cut'
  | 'recast'
  | 'pass'
  | 'hint'
  | 'sort'

export type FrictionKind =
  | 'invalid_play'
  | 'misfire'
  | 'repeat_guess'
  | 'one_away'
  | 'miss'
  | 'no_play_draw'

export type CountBucket = '1' | '2' | '3' | '4+'
export type HelpState = 'menu' | 'playing' | 'result'

type SoloFinish = {
  mode: 'solo'
  kind: DailyKind
  result: 'won' | 'stuck'
  flips: number
  score: number
  par: number
}

type ChronologyFinish = {
  mode: 'chronology'
  kind: DailyKind
  result: 'cleared'
  strokes: number
  score: number
}

type ConnectionsFinish = {
  mode: 'connections'
  kind: DailyKind
  result: 'won' | 'lost'
}

type DuelFinish = {
  mode: 'duel'
  difficulty: DuelDifficulty
  result: 'won' | 'lost' | 'draw'
}

export type AnalyticsDataMap = {
  mode_start: ModeIdentity & { session_mode_ordinal: SessionModeOrdinal }
  mode_finish: SoloFinish | ChronologyFinish | ConnectionsFinish | DuelFinish
  share: ModeIdentity
  first_action: ModeIdentity & { action: ActionKind }
  help_open: { mode: AnalyticsMode | 'overview'; state: HelpState }
  help_return: { mode: AnalyticsMode; resolved: boolean }
  friction: { mode: AnalyticsMode; kind: FrictionKind; count_bucket: CountBucket }
  share_attempt: { mode: AnalyticsMode; result: 'copied' | 'manual_fallback' }
  replay: ModeIdentity
}

export type AnalyticsEventName = keyof AnalyticsDataMap
export type EventData = AnalyticsDataMap[AnalyticsEventName]
export type AnalyticsEmitter = (name: AnalyticsEventName, data: EventData) => unknown

const MODES = new Set<AnalyticsMode>(['solo', 'chronology', 'connections', 'duel'])
const KINDS = new Set<DailyKind>(['daily', 'practice'])
const DIFFICULTIES = new Set<DuelDifficulty>(['matinee', 'feature', 'directors'])
const ORDINALS = new Set<SessionModeOrdinal>(['1', '2', '3', '4+'])
const HELP_STATES = new Set<HelpState>(['menu', 'playing', 'result'])
const COUNT_BUCKETS = new Set<CountBucket>(['1', '2', '3', '4+'])

const ACTIONS: Record<AnalyticsMode, ReadonlySet<ActionKind>> = {
  solo: new Set(['select', 'flip', 'play', 'reveal_solution']),
  chronology: new Set(['select', 'place']),
  connections: new Set(['select', 'submit', 'shuffle', 'deselect']),
  duel: new Set(['select', 'flip', 'play', 'draw', 'keep', 'toss', 'meld', 'take', 'final_cut', 'recast', 'pass', 'hint', 'sort']),
}

const FRICTIONS: Record<AnalyticsMode, ReadonlySet<FrictionKind>> = {
  solo: new Set(['invalid_play']),
  chronology: new Set(['misfire']),
  connections: new Set(['repeat_guess', 'one_away', 'miss']),
  duel: new Set(['invalid_play', 'no_play_draw']),
}

function isLocalHost(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]'
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function hasExactKeys(data: Record<string, unknown>, keys: readonly string[]): boolean {
  const actual = Object.keys(data).sort()
  const expected = [...keys].sort()
  return actual.length === expected.length && actual.every((key, index) => key === expected[index])
}

function isIntegerBetween(value: unknown, min: number, max: number): value is number {
  return Number.isSafeInteger(value) && (value as number) >= min && (value as number) <= max
}

function validIdentity(data: Record<string, unknown>): data is Record<string, unknown> & ModeIdentity {
  if (!MODES.has(data.mode as AnalyticsMode)) return false
  if (data.mode === 'duel') return DIFFICULTIES.has(data.difficulty as DuelDifficulty) && data.kind === undefined
  return KINDS.has(data.kind as DailyKind) && data.difficulty === undefined
}

function identityKeys(data: Record<string, unknown>): string[] {
  return data.mode === 'duel' ? ['mode', 'difficulty'] : ['mode', 'kind']
}

// Runtime validation is intentionally stricter than TypeScript: collector calls
// can originate in browser JavaScript, and no arbitrary string or nested value
// is allowed to enter the queue.
export function isValidAnalyticsEvent(name: unknown, value: unknown): value is EventData {
  if (typeof name !== 'string' || !isPlainRecord(value)) return false
  const data = value

  if (name === 'mode_start') {
    return validIdentity(data)
      && hasExactKeys(data, [...identityKeys(data), 'session_mode_ordinal'])
      && ORDINALS.has(data.session_mode_ordinal as SessionModeOrdinal)
  }

  if (name === 'mode_finish') {
    if (!validIdentity(data)) return false
    if (data.mode === 'solo') {
      return hasExactKeys(data, ['mode', 'kind', 'result', 'flips', 'score', 'par'])
        && (data.result === 'won' || data.result === 'stuck')
        && isIntegerBetween(data.flips, 0, 1_000)
        && isIntegerBetween(data.score, -1_000, 1_000)
        && isIntegerBetween(data.par, -1_000, 1_000)
    }
    if (data.mode === 'chronology') {
      return hasExactKeys(data, ['mode', 'kind', 'result', 'strokes', 'score'])
        && data.result === 'cleared'
        && isIntegerBetween(data.strokes, 0, 1_000)
        && isIntegerBetween(data.score, -1_000, 1_000)
    }
    if (data.mode === 'connections') {
      return hasExactKeys(data, ['mode', 'kind', 'result'])
        && (data.result === 'won' || data.result === 'lost')
    }
    return hasExactKeys(data, ['mode', 'difficulty', 'result'])
      && (data.result === 'won' || data.result === 'lost' || data.result === 'draw')
  }

  if (name === 'share' || name === 'replay') {
    return validIdentity(data) && hasExactKeys(data, identityKeys(data))
  }

  if (name === 'first_action') {
    return validIdentity(data)
      && hasExactKeys(data, [...identityKeys(data), 'action'])
      && ACTIONS[data.mode].has(data.action as ActionKind)
  }

  if (name === 'help_open') {
    return hasExactKeys(data, ['mode', 'state'])
      && (data.mode === 'overview' || MODES.has(data.mode as AnalyticsMode))
      && HELP_STATES.has(data.state as HelpState)
      && (data.mode === 'overview' ? data.state === 'menu' : true)
  }

  if (name === 'help_return') {
    return hasExactKeys(data, ['mode', 'resolved'])
      && MODES.has(data.mode as AnalyticsMode)
      && typeof data.resolved === 'boolean'
  }

  if (name === 'friction') {
    return hasExactKeys(data, ['mode', 'kind', 'count_bucket'])
      && MODES.has(data.mode as AnalyticsMode)
      && FRICTIONS[data.mode as AnalyticsMode].has(data.kind as FrictionKind)
      && COUNT_BUCKETS.has(data.count_bucket as CountBucket)
  }

  if (name === 'share_attempt') {
    return hasExactKeys(data, ['mode', 'result'])
      && MODES.has(data.mode as AnalyticsMode)
      && (data.result === 'copied' || data.result === 'manual_fallback')
  }

  return false
}

export function installAnalytics(): void {
  const analyticsWindow = window as VaWindow
  analyticsWindow.va ??= (...args: VaArguments) => {
    ;(analyticsWindow.vaq ??= []).push(args)
  }

  // Vercel owns this same-origin route only on deployments. Keep local preview
  // quiet while retaining the queue stub for deterministic browser coverage.
  if (isLocalHost(window.location.hostname)) return
  if (document.querySelector(`script[src="${ANALYTICS_SCRIPT_PATH}"]`)) return

  const script = document.createElement('script')
  script.defer = true
  script.src = ANALYTICS_SCRIPT_PATH
  script.dataset.vercelAnalytics = 'true'
  document.head.appendChild(script)
}

export function track<Name extends AnalyticsEventName>(name: Name, data: AnalyticsDataMap[Name]): boolean {
  try {
    if (!isValidAnalyticsEvent(name, data) || typeof window === 'undefined') return false
    ;(window as VaWindow).va?.('event', { name, data })
    return true
  } catch {
    // Analytics must never break the game.
    return false
  }
}
