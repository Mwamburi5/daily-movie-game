import { useEffect, useState } from 'react'
import { copyToClipboard } from '../lib/share.ts'

type CopyState = 'idle' | 'copied' | 'failed'

// The "copy result" button + blocked-clipboard fallback, exactly as ChronoResults
// shipped it — now shared so all three end screens behave identically.
export default function ShareCopy({ text }: { text: string }) {
  const [copy, setCopy] = useState<CopyState>('idle')

  // Revert the transient "copied" / "failed" label back to idle after a beat.
  useEffect(() => {
    if (copy === 'idle') return
    const t = window.setTimeout(() => setCopy('idle'), 2200)
    return () => window.clearTimeout(t)
  }, [copy])

  const onCopy = async () => {
    const ok = await copyToClipboard(text)
    setCopy(ok ? 'copied' : 'failed')
  }

  return (
    <>
      <button
        type="button"
        data-share-copy
        onClick={onCopy}
        aria-live="polite"
        className="mt-5 min-h-12 rounded-full bg-[#23211c] px-7 py-3 text-[15px] font-bold text-[#f4efe6] shadow-md active:scale-95"
      >
        {copy === 'copied' ? 'copied ✓' : copy === 'failed' ? 'select below to copy' : 'copy result'}
      </button>

      {/* Fallback: if the clipboard was blocked, surface the text to select by hand. */}
      {copy === 'failed' && (
        <pre
          data-share-fallback
          className="mt-3 w-full max-w-[280px] select-all whitespace-pre-wrap rounded-xl bg-white/70 px-4 py-3 text-left font-sans text-[13px] text-[#23211c] shadow-sm"
        >
          {text}
        </pre>
      )}
    </>
  )
}
