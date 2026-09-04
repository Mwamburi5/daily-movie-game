import { StrictMode, type ComponentType } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary.tsx'
import { installAnalytics } from './lib/analytics.ts'

// A promoted deployment retires the previous build's content-hashed chunks, so a
// tab left open across a deploy 404s the moment it asks for its first mode.
// Vite dispatches this on that failure; preventDefault stops the lazy import
// from rejecting into a blank root, and one reload picks up the new manifest.
// The sessionStorage one-shot means a genuinely offline device can't spin.
window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault()
  let reloadedOnce = false
  try {
    reloadedOnce = sessionStorage.getItem('matchcut:reloaded-once') === '1'
    if (!reloadedOnce) sessionStorage.setItem('matchcut:reloaded-once', '1')
  } catch {
    // Safari private mode throws on both read and write; without a guard we
    // could loop, so treat an unusable store as "already reloaded".
    reloadedOnce = true
  }
  if (!reloadedOnce) window.location.reload()
})

installAnalytics()

if (import.meta.env.DEV) {
  // Keep heavyweight pool assertions useful in development without making
  // their data dependencies part of the production entry graph.
  void import('./devAssertions.ts').then(({ runDevAssertions }) => runDevAssertions())
}

// Dev-only preview harness (Wave 0, docs/orchestration-plan.md): lets a forge
// agent verify a new component in isolation via ?preview=<name>, with zero
// shared-file edits beyond this block — it just adds a .preview.tsx file.
// The glob is lazy (no `eager: true`) so preview modules are only fetched
// when asked for, and the whole branch is gated on import.meta.env.DEV so it
// tree-shakes out of the prod bundle entirely.
if (import.meta.env.DEV) {
  const previewName = new URLSearchParams(window.location.search).get('preview')
  if (previewName) {
    const previewModules = import.meta.glob('./components/previews/*.preview.tsx')
    const entry = Object.entries(previewModules).find(
      ([path]) => path.split('/').pop() === `${previewName}.preview.tsx`,
    )
    if (entry) {
      const [, loader] = entry
      loader().then((mod) => {
        const Preview = (mod as { default: ComponentType }).default
        createRoot(document.getElementById('root')!).render(
          <StrictMode>
            <Preview />
          </StrictMode>,
        )
      })
    } else {
      const names = Object.keys(previewModules).map((path) => path.split('/').pop()!.replace('.preview.tsx', ''))
      createRoot(document.getElementById('root')!).render(
        <StrictMode>
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-8 text-center">
            <p className="font-serif text-lg font-black italic">No preview named "{previewName}"</p>
            <p className="text-sm text-[#7d7563]">
              {names.length ? `Available: ${names.join(', ')}` : 'No preview files found.'}
            </p>
          </div>
        </StrictMode>,
      )
    }
  } else {
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </StrictMode>,
    )
  }
} else {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  )
}
