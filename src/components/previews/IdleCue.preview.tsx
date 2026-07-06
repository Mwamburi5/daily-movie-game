import { useState } from 'react'
import IdleCue from '../IdleCue.tsx'

// Preview convention (src/components/previews/Sample.preview.tsx). Shows the
// visible state (the brief's required case) plus toggles for hidden and
// reduced-motion so both branches are exercisable in one place.
export default function IdleCuePreview() {
  const [visible, setVisible] = useState(true)
  const [reduce, setReduce] = useState(false)

  return (
    <div className="relative h-[420px] w-full max-w-[420px] bg-stub-cream">
      <IdleCue visible={visible} reduce={reduce} />

      <div className="absolute inset-x-0 bottom-4 flex flex-col items-center gap-2 px-4">
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="rounded-full bg-stub-navy px-3 py-1 text-[11px] font-semibold text-stub-cream"
        >
          visible: {String(visible)} (toggle)
        </button>
        <button
          type="button"
          onClick={() => setReduce((r) => !r)}
          className="rounded-full bg-stub-navy px-3 py-1 text-[11px] font-semibold text-stub-cream"
        >
          reduce: {String(reduce)} (toggle — pulse should stop/start)
        </button>
      </div>
    </div>
  )
}
