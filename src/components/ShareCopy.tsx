import { useEffect, useState } from 'react'
import { track, type EventData } from '../lib/analytics.ts'
import { copyToClipboard } from '../lib/share.ts'

type CopyState = 'idle' | 'copied' | 'failed'

// The "copy result" button + blocked-clipboard fallback, exactly as ChronoResults
// shipped it — now shared so all three end screens behave identically.
// `analytics` names the mode for the 'share' event — the caller supplies it
// because this component can't know which mode it's mounted in.
export default function ShareCopy({ text, analytics }: { text: string; analytics?: EventData }) {
  const [copy, setCopy] = useState<CopyState>('idle')

  // Revert the transient "copied" / "failed" label back to idle after a beat.
  useEffect(() => {
    if (copy === 'idle') return
    const t = window.setTimeout(() => setCopy('idle'), 2200)
    return () => window.clearTimeout(t)
  }, [copy])

  const onCopy = async () => {
    const ok = await copyToClipboard(text)
    // only a landed copy counts as a share — a blocked clipboard shows the
    // select-by-hand fallback, which we can't observe
    if (ok && analytics) track('share', analytics)
    setCopy(ok ? 'copied' : 'failed')
  }

  return (
    <>
      <button
        type="button"
        data-share-copy
        onClick={onCopy}
        aria-live="polite"
        className="mt-5 min-h-12 rounded-stub-pill bg-stub-navy px-7 py-3 text-[15px] font-bold text-stub-cream shadow-stub-card-resting active:scale-95"
      >
        {copy === 'copied' ? 'copied ✓' : copy === 'failed' ? 'select below to copy' : 'copy result'}
      </button>

      {/* Fallback: if the clipboard was blocked, surface the text to select by hand. */}
      {copy === 'failed' && (
        <pre
          data-share-fallback
          className="mt-3 w-full max-w-[280px] select-all whitespace-pre-wrap rounded-stub-panel border border-stub-navy/15 bg-stub-paper px-4 py-3 text-left font-stub-ui text-[13px] text-stub-navy shadow-stub-card-resting"
        >
          {text}
        </pre>
      )}
    </>
  )
}
