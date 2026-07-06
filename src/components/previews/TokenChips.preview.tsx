import { useState } from 'react'
import TokenChips from '../TokenChips.tsx'

// Preview convention (src/components/previews/Sample.preview.tsx). Covers both
// `side` values and both spent/available states side by side, plus an
// interactive player-side toggle so `fcArmed` and the disabled state are
// exercisable, not just illustrated.
export default function TokenChipsPreview() {
  const [fcArmed, setFcArmed] = useState(false)
  const [playerFinalCut, setPlayerFinalCut] = useState(true)

  return (
    <div className="flex h-full w-full flex-col items-center gap-10 bg-stub-cream p-8">
      <section className="flex flex-col items-center gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-stub-slate">side=&quot;cpu&quot; (read-only)</p>
        <div className="flex gap-6 rounded-stub-panel border-2 border-stub-navy bg-stub-paper p-4">
          <TokenChips side="cpu" finalCut recast />
          <TokenChips side="cpu" finalCut={false} recast={false} />
        </div>
      </section>

      <section className="flex flex-col items-center gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-stub-slate">
          side=&quot;player&quot; (Final Cut interactive)
        </p>
        <div className="flex gap-6 rounded-stub-panel border-2 border-stub-navy bg-stub-paper p-4">
          <TokenChips
            side="player"
            finalCut={playerFinalCut}
            recast
            fcArmed={fcArmed}
            onToggleFinalCut={() => setFcArmed((a) => !a)}
          />
          <TokenChips side="player" finalCut={false} recast={false} />
        </div>
        <button
          type="button"
          onClick={() => setPlayerFinalCut((v) => !v)}
          className="mt-2 rounded-full bg-stub-navy px-3 py-1 text-[11px] font-semibold text-stub-cream"
        >
          toggle player Final Cut spent/available ({playerFinalCut ? 'available' : 'spent'})
        </button>
      </section>

      <p className="max-w-xs text-center text-[11px] text-stub-slate">
        fcArmed: {String(fcArmed)} — click the left player Final Cut chip to arm/disarm it.
      </p>
    </div>
  )
}
