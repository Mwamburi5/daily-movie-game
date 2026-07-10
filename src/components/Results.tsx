import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { matchCutShare } from '../lib/share.ts'
import type { DailyFinish } from '../lib/progress.ts'
import ShareCopy from './ShareCopy.tsx'

interface SolutionStep {
  title: string
  via: string | null
}

interface ResultsProps {
  status: 'won' | 'stuck'
  score: number
  par: number
  flips: number
  invalids: number
  comboBonus: number
  cardsLeft: number
  emoji: string
  solution: SolutionStep[]
  daily: DailyFinish | null // streak readout — null on practice rounds
  onReset: () => void
  onMenu: () => void // back to the mode menu (W5d: every end screen routes home)
}

export default function Results({
  status,
  score,
  par,
  flips,
  invalids,
  comboBonus,
  cardsLeft,
  emoji,
  solution,
  daily,
  onReset,
  onMenu,
}: ResultsProps) {
  const reduce = useReducedMotion()
  const [showSolution, setShowSolution] = useState(false)

  const diff = score - par
  const golf = diff === 0 ? 'even par' : diff < 0 ? `${-diff} under par` : `${diff} over par`

  // Family share format (see lib/share.ts): mode line, golf score line, emoji row.
  // A stuck run is still shareable — the 🧱 already ends the emoji row.
  const shareLine =
    status === 'won'
      ? `score ${score}, par ${par} (${golf})`
      : `stuck — ${cardsLeft} left in hand, par ${par}`
  const text = matchCutShare('Daily Puzzle', shareLine, emoji)

  return (
    <motion.div
      className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-stub-scrim px-6 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: reduce ? 0.2 : 0.9, duration: reduce ? 0.15 : 0.35 }}
    >
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.85, y: 14 }}
        animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
        transition={
          reduce
            ? { delay: 0.25, duration: 0.15 }
            : { delay: 1.0, type: 'spring', stiffness: 260, damping: 22 }
        }
        className="flex w-full max-w-[340px] flex-col items-center rounded-stub-header bg-stub-cream px-6 py-7 shadow-stub-modal"
      >
        {/* Amber dot row — the Stub's header flourish (7d). */}
        <div className="mb-3 flex gap-1.5" aria-hidden>
          {[0, 1, 2, 3, 4].map((d) => (
            <span key={d} className="h-1.5 w-1.5 rounded-full bg-stub-amber" />
          ))}
        </div>

        <h2 className="font-stub-display text-4xl font-bold text-stub-navy">
          {status === 'won' ? 'Solved!' : 'Stuck.'}
        </h2>

        {status === 'won' ? (
          <p className="mt-3 font-stub-ui text-lg font-semibold text-stub-navy">
            Solved in {score}, par {par} <span className="text-stub-slate">({golf})</span>
          </p>
        ) : (
          <p className="mt-3 font-stub-ui text-lg font-semibold text-stub-navy">
            No playable cards left — {cardsLeft} stranded in hand.
          </p>
        )}

        <p className="mt-1 font-stub-ui text-sm text-stub-slate">
          {flips} {flips === 1 ? 'flip' : 'flips'} · {invalids} invalid{' '}
          {invalids === 1 ? 'play' : 'plays'}
          {comboBonus > 0 && ` · combo −${comboBonus}`}
        </p>

        {daily && (
          <p
            className="mt-1 font-stub-label text-[12px] font-bold uppercase tracking-wider text-stub-slate tabular-nums"
            data-daily-meta
          >
            day {daily.day} · streak {daily.streak}
            {daily.best !== null && ` · best ${daily.best}`}
            {daily.repeat && ' · already played today'}
          </p>
        )}

        <div className="mt-5 rounded-stub-panel bg-stub-paper px-5 py-3 text-xl tracking-wider shadow-stub-card-resting">
          {emoji}
        </div>

        <ShareCopy text={text} />

        <button
          type="button"
          onClick={onReset}
          className="mt-3 min-h-12 rounded-stub-pill bg-stub-amber px-7 py-3 font-stub-ui text-[15px] font-bold text-stub-navy shadow-stub-card-resting active:scale-95"
        >
          Play again
        </button>

        {status === 'stuck' && !showSolution && (
          <button
            type="button"
            onClick={() => setShowSolution(true)}
            className="mt-3 min-h-12 rounded-stub-pill border-2 border-stub-navy bg-stub-paper px-7 py-3 font-stub-ui text-[15px] font-bold text-stub-navy shadow-stub-card-resting active:scale-95"
          >
            Reveal one solution
          </button>
        )}

        <button
          type="button"
          onClick={onMenu}
          className="mt-3 min-h-12 rounded-stub-pill border-2 border-stub-navy bg-stub-paper px-7 py-3 font-stub-ui text-[15px] font-bold text-stub-navy active:scale-95"
        >
          Menu
        </button>

        {showSolution && (
          <div className="mt-5 max-h-[300px] w-full max-w-[300px] overflow-y-auto rounded-stub-panel bg-stub-paper px-5 py-4 text-left shadow-stub-card-resting">
            {solution.map((step, i) => (
              <div key={step.title}>
                {step.via && (
                  <div className="py-0.5 pl-3 font-stub-ui text-[11px] text-stub-slate">
                    ↓ via {step.via}
                  </div>
                )}
                <div
                  className={`font-stub-ui text-[13px] ${
                    i === 0 ? 'text-stub-slate' : 'font-semibold text-stub-navy'
                  }`}
                >
                  {step.title}
                  {i === 0 && ' — starter'}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
