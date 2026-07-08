import { motion, useReducedMotion } from 'framer-motion'

// The end-of-game highlights reel (handoff screen 7d, "the match in highlights").
// Presentational only — the Duel screen maps its recap data onto RecapItem[] and
// drops this in. Repainted to the Stub language: paper pills, WHO chips, navy
// point chips. Kept self-contained so it renders standalone with no game state.

export interface RecapItem {
  who: 'You' | 'CPU'
  kind: 'meld' | 'super' | 'finalcut'
  text: string
  points: number
}

// kind → short past-tense verb. `text` already carries the specifics (film name,
// meld size), so the verb just frames it — mirrors the inline Duel recap wording.
function recapVerb(kind: RecapItem['kind']): string {
  switch (kind) {
    case 'meld':
      return 'banked'
    case 'super':
      return 'super link:'
    case 'finalcut':
      return 'Final Cut:'
  }
}

export function RecapReel({
  headline,
  summary,
  items,
}: {
  headline: string
  summary?: string
  items: RecapItem[]
}): JSX.Element | null {
  const reduce = useReducedMotion()

  // Nothing to celebrate → render nothing (matches the Duel guard `recap.length > 0`).
  if (items.length === 0) return null

  return (
    <div className="w-full max-w-[300px]">
      <p className="text-left font-stub-ui text-[13px] font-bold leading-snug text-stub-navy">
        {headline}
        {summary && <span className="font-normal text-stub-slate"> {summary}</span>}
      </p>

      <div className="mt-2 max-h-[220px] space-y-2 overflow-y-auto pr-1 text-left">
        {items.map((e, i) => {
          const you = e.who === 'You'
          return (
            <motion.div
              key={i}
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reduce ? { duration: 0 } : { delay: 0.04 * i, duration: 0.22 }}
              className="flex items-center gap-2.5 rounded-stub-panel bg-stub-paper px-3 py-2 shadow-stub-card-resting"
            >
              {/* WHO chip — from the 7d comp: You = amber fill / navy ink, CPU = navy fill / cream ink. */}
              <span
                className={`shrink-0 rounded-stub-pill px-2 py-1 font-stub-label text-[9px] font-bold uppercase tracking-wider ${
                  you ? 'bg-stub-amber text-stub-navy' : 'bg-stub-navy text-stub-cream'
                }`}
              >
                {e.who}
              </span>

              <span className="flex-1 font-stub-ui text-[12px] font-medium leading-tight text-stub-navy">
                {recapVerb(e.kind)} {e.text}
              </span>

              {/* +points in navy to match the 7d comp (Buri ruling 2026-07-07,
                  flag b) — the amber-vs-navy call resolved navy. */}
              <span className="shrink-0 font-stub-display text-[15px] font-bold tabular-nums text-stub-navy">
                +{e.points}
              </span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

export default RecapReel
