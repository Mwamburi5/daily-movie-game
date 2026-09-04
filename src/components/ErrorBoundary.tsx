import { Component, type ErrorInfo, type ReactNode } from 'react'

// The same public issue chooser the help sheet points at (HowToPlay.tsx). It is
// duplicated rather than imported so the boundary carries no dependency on a
// module that could itself be the thing that threw.
const SUPPORT_URL = 'https://github.com/Mwamburi5/daily-movie-game/issues/new/choose'

// Why this exists: <Suspense> only handles a *pending* promise. A rejected lazy
// import (a tab left open across a deploy asks for a content-hashed chunk that
// the new deployment retired) or any uncaught render throw makes React 18
// unmount the entire root — the player gets a blank white page with no message
// and no way back. This is the floor under that: one card, one reload, one way
// to report it.
export default class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Dev only: the browser smoke suite treats a console error as a fault, and
    // production React already surfaces the error itself. This branch is gated
    // on import.meta.env.DEV so it tree-shakes out of the shipped entry chunk.
    if (import.meta.env.DEV) console.error('match cut: render boundary caught', error, info)
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div
        className="flex h-full w-full items-center justify-center bg-stub-cream p-6"
        data-error-boundary
      >
        <div className="w-full max-w-[380px] rounded-stub-panel border-2 border-stub-navy bg-stub-paper p-5 shadow-stub-card-resting">
          <h1 className="font-stub-display text-[20px] font-bold text-stub-navy">The reel jammed.</h1>
          <p className="mt-2 font-stub-ui text-[14px] leading-relaxed text-stub-slate">
            Something broke while this screen was loading. Reloading almost always brings today’s
            games straight back — nothing you have played is lost.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 inline-flex min-h-11 items-center rounded-stub-pill bg-stub-navy px-5 py-2 font-stub-ui text-[13px] font-bold text-stub-cream shadow-stub-card-resting active:scale-[0.99]"
            data-error-reload
          >
            Reload
          </button>
          <a
            href={SUPPORT_URL}
            target="_blank"
            rel="noreferrer noopener"
            aria-label="Open public GitHub support (opens in a new tab)"
            className="mt-3 block font-stub-ui text-[13px] font-bold text-stub-navy underline decoration-stub-amber decoration-2 underline-offset-4"
          >
            Open public GitHub support
          </a>
        </div>
      </div>
    )
  }
}
