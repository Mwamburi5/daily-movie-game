import { useEffect, useState } from 'react'
import { progressStorageUnavailable } from '../lib/progress.ts'

// A failed meta-state write should be visible without preventing play.
export default function ProgressNotice() {
  const [unavailable, setUnavailable] = useState(progressStorageUnavailable)
  useEffect(() => {
    const refresh = () => setUnavailable(progressStorageUnavailable())
    refresh()
    window.addEventListener('matchcut:progress-change', refresh)
    return () => window.removeEventListener('matchcut:progress-change', refresh)
  }, [])
  return unavailable ? (
    <p role="status" className="progress-notice col-span-full mt-3 rounded-stub-panel border border-stub-navy/30 bg-stub-paper px-3 py-2 font-stub-ui text-[13px] leading-snug text-stub-navy" data-progress-notice>
      Progress cannot be saved in this browser right now. You can keep playing; completed records may be lost when you leave.
    </p>
  ) : null
}
