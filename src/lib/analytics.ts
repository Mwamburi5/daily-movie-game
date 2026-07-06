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

// The two WS1 events: mode_start / mode_finish, with {mode, kind, difficulty?}.
// kind is daily|practice for the two dailies; Duel sends difficulty instead.
export function track(
  name: 'mode_start' | 'mode_finish',
  data: Record<string, string | number | boolean>,
): void {
  try {
    ;(window as VaWindow).va?.('event', { name, data })
  } catch {
    // analytics must never break the game
  }
}
