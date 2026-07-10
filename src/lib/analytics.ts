// src/lib/analytics.ts — custom events for Vercel Web Analytics (WS1).
//
// Deps are locked, so this rides the SCRIPT-TAG route, not @vercel/analytics:
// index.html installs the `window.va` queue stub and defers
// /_vercel/insights/script.js. Calls made before the script loads pool in
// window.vaq and flush when it arrives; if it never arrives (local dev,
// adblock, Analytics not enabled in the dashboard) everything is a harmless
// no-op — the game must never notice analytics.

interface VaWindow {
  va?: (event: 'event', props: { name: string; data?: Record<string, string | number | boolean> }) => void
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
