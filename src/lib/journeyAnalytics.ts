import { useEffect, useRef } from 'react'
import {
  track,
  type ActionKind,
  type AnalyticsEmitter,
  type AnalyticsEventName,
  type CountBucket,
  type EventData,
  type FrictionKind,
  type HelpState,
  type ModeIdentity,
  type SessionModeOrdinal,
} from './analytics.ts'

let pageModeCount = 0

function nextPageModeOrdinal(): SessionModeOrdinal {
  pageModeCount += 1
  return pageModeCount >= 4 ? '4+' : String(pageModeCount) as SessionModeOrdinal
}

function bucket(count: number): CountBucket {
  return count >= 4 ? '4+' : String(count) as CountBucket
}

export class JourneyAnalytics {
  private readonly identity: ModeIdentity
  private readonly emitEvent: AnalyticsEmitter
  private ordinal: SessionModeOrdinal | null
  private entryStarted = false
  private firstActionSent = false
  private helpIsOpen = false
  private helpReturnArmed = false
  private frictionCount = 0

  constructor(
    identity: ModeIdentity,
    emitEvent: AnalyticsEmitter = track as AnalyticsEmitter,
    ordinal: SessionModeOrdinal | null = null,
  ) {
    this.identity = identity
    this.emitEvent = emitEvent
    this.ordinal = ordinal
  }

  private emit(name: AnalyticsEventName, data: EventData): void {
    try {
      this.emitEvent(name, data)
    } catch {
      // An injected collector is held to the same gameplay-isolation rule.
    }
  }

  startEntry(): void {
    if (this.entryStarted) return
    this.entryStarted = true
    this.ordinal ??= nextPageModeOrdinal()
    this.emit('mode_start', { ...this.identity, session_mode_ordinal: this.ordinal })
  }

  action(action: ActionKind, resolved: boolean): void {
    if (!this.firstActionSent) {
      this.firstActionSent = true
      this.emit('first_action', { ...this.identity, action })
    }
    if (this.helpReturnArmed) {
      this.helpReturnArmed = false
      this.emit('help_return', { mode: this.identity.mode, resolved })
    }
  }

  helpOpen(state: Exclude<HelpState, 'menu'>): void {
    this.helpIsOpen = true
    this.emit('help_open', { mode: this.identity.mode, state })
  }

  helpClose(): void {
    if (!this.helpIsOpen) return
    this.helpIsOpen = false
    this.helpReturnArmed = true
  }

  friction(kind: FrictionKind): void {
    this.frictionCount += 1
    this.emit('friction', {
      mode: this.identity.mode,
      kind,
      count_bucket: bucket(this.frictionCount),
    })
  }

  replay(): void {
    if (!this.entryStarted) this.startEntry()
    this.emit('replay', this.identity)
    this.firstActionSent = false
    this.helpIsOpen = false
    this.helpReturnArmed = false
    this.frictionCount = 0
    this.emit('mode_start', { ...this.identity, session_mode_ordinal: this.ordinal! })
  }
}

export function useJourneyAnalytics(identity: ModeIdentity): JourneyAnalytics {
  const journeyRef = useRef<JourneyAnalytics>()
  if (!journeyRef.current) journeyRef.current = new JourneyAnalytics(identity)

  useEffect(() => {
    journeyRef.current!.startEntry()
  }, [])

  return journeyRef.current
}
