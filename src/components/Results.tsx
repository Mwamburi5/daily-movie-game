import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useDialogA11y } from './useDialogA11y.ts'
import { matchCutShare } from '../lib/share.ts'
import type { ModeIdentity } from '../lib/analytics.ts'
import type { DailyFinish } from '../lib/progress.ts'
import ShareCopy from './ShareCopy.tsx'
import ResultActions from './ResultActions.tsx'
import ResultMeaning from './ResultMeaning.tsx'

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
  practice: boolean // practice hand: marks the share line, relabels replay
  analytics: ModeIdentity // mode identity for the share event (SoloGame owns kind)
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
  practice,
  analytics,
  onReset,
  onMenu,
}: ResultsProps) {
  const reduce = useReducedMotion()
  const [showSolution, setShowSolution] = useState(false)
  // Trap-only dialog (§7·7b a11y): terminal screen, routes via its buttons.
  const dialogRef = useDialogA11y()

  const diff = score - par
  const golf = diff === 0 ? 'even par' : diff < 0 ? `${-diff} under par` : `${diff} over par`

  // Family share format (see lib/share.ts): mode line, golf score line, emoji row.
  // A stuck run is still shareable — the 🧱 already ends the emoji row.
  // Practice hands carry a marker (§7·7c) so they can't pass for the daily;
  // the brand line stays byte-identical for dailies.
  const shareLine =
    status === 'won'
      ? `score ${score}, par ${par} (${golf})`
      : `stuck — ${cardsLeft} left in hand, par ${par}`
  const text = matchCutShare('Daily Puzzle', `${practice ? 'practice · ' : ''}${shareLine}`, emoji)

  return (
    // overflow-y-auto + my-auto on the card (the App.tsx menu fix): centers
    // when the card fits, scrolls when the revealed solution makes it taller
    // than a 667px viewport — plain justify-center clips both ends.
    <motion.div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={status === 'won' ? 'Solved — results' : 'Stuck — results'}
      tabIndex={-1}
      className="absolute inset-0 z-[100] flex flex-col items-center overflow-y-auto bg-stub-scrim px-6 py-6 text-center"
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
        className="my-auto flex w-full max-w-[340px] flex-col items-center rounded-stub-header bg-stub-cream px-6 py-7 shadow-stub-modal"
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
            {/* "Solved in −1" reads like a bug once combo credits push the score
                negative — it's a score, not a move count. Say so. */}
            Score {score} · par {par} <span className="text-stub-slate">({golf})</span>
          </p>
        ) : (
          <p className="mt-3 font-stub-ui text-lg font-semibold text-stub-navy">
            No playable cards left — {cardsLeft} stranded in hand.
          </p>
        )}

        <ResultMeaning
          direction={status === 'won' ? 'Lower is better' : 'Round ended'}
          detail={status === 'won' ? `Score ${score} vs par ${par}` : 'No legal connection remained'}
        />

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
            {/* The streak counts finishing, not winning (RULEBOOK "showing up"), so a
                rising streak on a stuck hand reads like a bug unless the line says why. */}
            day {daily.day} · streak {daily.streak}
            {status !== 'won' && ' · showing up counts'}
            {daily.best !== null && ` · best ${daily.best}`}
            {daily.repeat && ' · already played today'}
          </p>
        )}

        <div className="mt-5 rounded-stub-panel bg-stub-paper px-5 py-3 text-xl tracking-wider shadow-stub-card-resting">
          {emoji}
        </div>

        <ShareCopy text={text} analytics={analytics} />

        {status === 'stuck' && !showSolution && (
          <button
            type="button"
            onClick={() => setShowSolution(true)}
            className="mt-3 min-h-12 rounded-stub-pill border-2 border-stub-navy bg-stub-paper px-7 py-3 font-stub-ui text-[15px] font-bold text-stub-navy shadow-stub-card-resting active:scale-95"
          >
            Reveal one solution
          </button>
        )}

        <ResultActions
          primaryLabel={practice ? 'Replay this hand' : 'Replay today’s hand'}
          onPrimary={onReset}
          onMenu={onMenu}
        />

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
