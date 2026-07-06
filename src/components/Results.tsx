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
      className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-[#f4efe6]/95 px-8 text-center"
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
        className="flex w-full flex-col items-center"
      >
        <h2 className="font-serif text-4xl font-black italic">
          {status === 'won' ? 'Solved!' : 'Stuck.'}
        </h2>

        {status === 'won' ? (
          <p className="mt-3 text-lg font-semibold">
            Solved in {score}, par {par} <span className="text-[#7d7563]">({golf})</span>
          </p>
        ) : (
          <p className="mt-3 text-lg font-semibold">
            No playable cards left — {cardsLeft} stranded in hand.
          </p>
        )}

        <p className="mt-1 text-sm text-[#7d7563]">
          {flips} {flips === 1 ? 'flip' : 'flips'} · {invalids} invalid{' '}
          {invalids === 1 ? 'play' : 'plays'}
          {comboBonus > 0 && ` · combo −${comboBonus}`}
        </p>

        {daily && (
          <p className="mt-1 text-[13px] font-semibold text-[#9a917c] tabular-nums" data-daily-meta>
            day {daily.day} · streak {daily.streak}
            {daily.best !== null && ` · best ${daily.best}`}
            {daily.repeat && ' · already played today'}
          </p>
        )}

        <div className="mt-5 rounded-xl bg-white/70 px-5 py-3 text-xl tracking-wider shadow-sm">
          {emoji}
        </div>

        <ShareCopy text={text} />

        <button
          type="button"
          onClick={onReset}
          className="mt-3 min-h-12 rounded-full bg-white/70 px-7 py-3 text-[15px] font-bold text-[#23211c] shadow-sm active:scale-95"
        >
          Play again
        </button>

        {status === 'stuck' && !showSolution && (
          <button
            type="button"
            onClick={() => setShowSolution(true)}
            className="mt-3 min-h-12 rounded-full bg-white/70 px-7 py-3 text-[15px] font-bold text-[#23211c] shadow-sm active:scale-95"
          >
            Reveal one solution
          </button>
        )}

        {showSolution && (
          <div className="mt-5 max-h-[300px] w-full max-w-[300px] overflow-y-auto rounded-xl bg-white/70 px-5 py-4 text-left shadow-sm">
            {solution.map((step, i) => (
              <div key={step.title}>
                {step.via && (
                  <div className="py-0.5 pl-3 text-[11px] text-[#9a917c]">↓ via {step.via}</div>
                )}
                <div className={`text-[13px] ${i === 0 ? 'text-[#9a917c]' : 'font-semibold'}`}>
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
