// src/lib/analytics.ts — custom events for Vercel Web Analytics (WS1).
//
// Deps are locked, so this rides Vercel's same-origin script route, not
// @vercel/analytics. Keeping the loader in this module removes inline script
// from index.html and lets the app run with script-src 'self'. Calls made
// before the collector loads queue in window.vaq; analytics must never affect
// gameplay if the script is unavailable or blocked.

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

function isLocalHost(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]'
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

// Flat primitives only — Vercel custom-event props don't nest, and nothing
// here may ever carry PII (mode/kind/difficulty/outcome numbers only).
export type EventData = Record<string, string | number | boolean>

// Three events: mode_start / mode_finish with {mode, kind|difficulty} —
// kind is daily|practice for the dailies; Duel sends difficulty instead —
// plus 'share' (SEND window, 2026-07-10), fired on a successful clipboard
// copy with the same mode identity. mode_finish also carries the mode's
// natural outcome (Duel result, Solo flips/score/par, Chronology strokes,
// Connections result) so the interview cross-check can read how games went.
export function track(name: 'mode_start' | 'mode_finish' | 'share', data: EventData): void {
  try {
    ;(window as VaWindow).va?.('event', { name, data })
  } catch {
    // analytics must never break the game
  }
}
