import { useMemo, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import SoloGame, { type SoloStart } from './SoloGame.tsx'
import DuelGame from './DuelGame.tsx'
import ChronologyGame, { type ChronoStart } from './ChronologyGame.tsx'
import HowToPlay from './components/HowToPlay.tsx'
import { type Difficulty, DIFFICULTIES, DIFFICULTY_META } from './lib/difficulty.ts'
import { localDateSeed } from './lib/daily.ts'
import { dailyStatus, duelRecord, type DailyStatus } from './lib/progress.ts'

type Mode = 'menu' | 'solo' | 'duel' | 'chronology'

// Chronology's OWN practice-spread dial (NOT Duel's difficulty.ts, which is link-
// engine tuned). House voice borrows film-distribution words: a "wide" release is
// spread across the calendar (wide gaps), a "tight" run bunches into one window.
// These flavor the random practice round only; the daily always deals 'standard'.
const CHRONO_PRACTICE: { id: 'easy' | 'hard'; label: string }[] = [
  { id: 'easy', label: 'Wide' },
  { id: 'hard', label: 'Tight' },
]

export default function App() {
  const [mode, setMode] = useState<Mode>('menu')
  const [difficulty, setDifficulty] = useState<Difficulty>('matinee')
  const [chronoStart, setChronoStart] = useState<ChronoStart>({ kind: 'daily' })
  const [soloStart, setSoloStart] = useState<SoloStart>({ kind: 'daily' })
  const [showRules, setShowRules] = useState(false)

  const startChronology = (start: ChronoStart) => {
    setChronoStart(start)
    setMode('chronology')
  }

  const startSolo = (start: SoloStart) => {
    setSoloStart(start)
    setMode('solo')
  }

  // Meta-state for the menu chips, re-read whenever we land back on the menu
  // (mode flips) so a just-finished run shows up without a reload. Display
  // only — deals never touch it (persistence guardrail).
  const todaySeed = localDateSeed()
  const soloChip = useMemo(() => dailyStatus('solo', todaySeed), [mode, todaySeed])
  const chronoChip = useMemo(() => dailyStatus('chronology', todaySeed), [mode, todaySeed])
  const duelChip = useMemo(() => duelRecord(difficulty), [mode, difficulty])

  if (mode === 'solo') return <SoloGame onExit={() => setMode('menu')} start={soloStart} />
  if (mode === 'duel') return <DuelGame onExit={() => setMode('menu')} difficulty={difficulty} />
  if (mode === 'chronology') return <ChronologyGame onExit={() => setMode('menu')} start={chronoStart} />

  return (
    <div
      className="relative mx-auto h-full w-full max-w-[420px] bg-stub-cream"
      style={{
        backgroundImage: 'radial-gradient(rgba(31,58,82,.06) 1px, transparent 1.2px)',
        backgroundSize: '7px 7px',
      }}
    >
      <div className="flex h-full w-full flex-col items-center justify-center gap-10 px-8">
        <div className="text-center">
          <h1 className="font-stub-display text-5xl font-bold italic tracking-tight text-stub-navy">
            Match Cut
          </h1>
          <p className="mt-2 font-stub-ui text-sm text-stub-slate">
            Connect movies by the people who made them.
          </p>
        </div>
        <div className="flex w-full max-w-[300px] flex-col gap-3">
          {/* Hero card: the navy panel echoing the 7a board header — one clear
              primary for the menu (EXTRAPOLATED; menu has no reference PNG). */}
          <div className="rounded-stub-panel bg-stub-navy px-6 py-4 shadow-stub-card-resting">
            <button
              type="button"
              data-mode="duel"
              onClick={() => setMode('duel')}
              className="block w-full text-left active:scale-[0.98]"
            >
              <span className="flex items-baseline justify-between">
                <span className="font-stub-display text-[17px] font-bold text-stub-cream">
                  Duel vs Computer
                </span>
                {duelChip.plays > 0 && (
                  <span
                    data-record-chip="duel"
                    className="rounded-stub-pill bg-stub-cream/10 px-2 py-0.5 font-stub-label text-[10px] font-bold tabular-nums text-stub-cream/75"
                  >
                    {duelChip.wins}/{duelChip.plays} won
                  </span>
                )}
              </span>
              <span className="mt-0.5 block font-stub-ui text-[12px] text-stub-cream/60">
                Take turns scoring links. Race to 20 — high score wins.
              </span>
            </button>
            {/* Difficulty segmented control → Stub pill group: amber-active. */}
            <div className="mt-3 flex gap-1 rounded-stub-pill bg-black/25 p-0.5">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d}
                  type="button"
                  data-difficulty={d}
                  aria-pressed={difficulty === d}
                  onClick={() => setDifficulty(d)}
                  className={`flex-1 rounded-stub-pill px-2 py-1.5 font-stub-label text-[10px] font-bold uppercase tracking-[0.06em] transition-colors ${
                    difficulty === d
                      ? 'bg-stub-amber text-stub-navy shadow-sm'
                      : 'text-stub-cream/55 active:text-stub-cream/80'
                  }`}
                >
                  {DIFFICULTY_META[d].label}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-center font-stub-ui text-[11px] text-stub-cream/45">
              {DIFFICULTY_META[difficulty].blurb}
            </p>
          </div>
          <div className="rounded-stub-panel bg-stub-paper px-6 py-4 shadow-stub-card-resting">
            <button
              type="button"
              data-mode="solo"
              onClick={() => startSolo({ kind: 'daily' })}
              className="block w-full text-left active:scale-[0.98]"
            >
              <span className="flex items-baseline justify-between">
                <span className="font-stub-display text-[17px] font-bold text-stub-navy">
                  Daily Puzzle
                </span>
                <StreakChip mode="solo" status={soloChip} />
              </span>
              <span className="mt-0.5 block font-stub-ui text-[12px] text-stub-slate">
                Today's hand — same for everyone. Fewest flips wins. Golf — low score wins.
              </span>
            </button>
            {/* The daily is the button above; the original hand-designed puzzle
                stays on as a fixed practice round. */}
            <div className="mt-3 flex items-center gap-2">
              <span className="font-stub-label text-[11px] font-semibold uppercase tracking-[0.08em] text-stub-slate">
                practice
              </span>
              <button
                type="button"
                data-solo-practice
                onClick={() => startSolo({ kind: 'practice' })}
                className="flex-1 rounded-stub-pill bg-stub-navy/[0.06] px-2 py-1.5 font-stub-label text-[11px] font-bold text-stub-slate transition-colors active:bg-stub-navy/10 active:text-stub-navy"
              >
                The original hand
              </button>
            </div>
          </div>
          <div className="rounded-stub-panel bg-stub-paper px-6 py-4 shadow-stub-card-resting">
            <button
              type="button"
              data-mode="chronology"
              onClick={() => startChronology({ kind: 'daily' })}
              className="block w-full text-left active:scale-[0.98]"
            >
              <span className="flex items-baseline justify-between">
                <span className="font-stub-display text-[17px] font-bold text-stub-navy">
                  Chronology
                </span>
                <StreakChip mode="chronology" status={chronoChip} />
              </span>
              <span className="mt-0.5 block font-stub-ui text-[12px] text-stub-slate">
                Today's lineup. Place the movies in release order. Golf — low score wins.
              </span>
            </button>
            {/* The daily is the button above; practice is its own affordance —
                each pill starts a fresh random round at that spread. */}
            <div className="mt-3 flex items-center gap-2">
              <span className="font-stub-label text-[11px] font-semibold uppercase tracking-[0.08em] text-stub-slate">
                practice
              </span>
              <div className="flex flex-1 gap-1 rounded-stub-pill bg-stub-navy/[0.06] p-0.5">
                {CHRONO_PRACTICE.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    data-chrono-practice={p.id}
                    onClick={() => startChronology({ kind: 'practice', difficulty: p.id })}
                    className="flex-1 rounded-stub-pill px-2 py-1.5 font-stub-label text-[11px] font-bold text-stub-slate transition-colors active:bg-stub-navy/10 active:text-stub-navy"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button
            type="button"
            data-mode="rules"
            onClick={() => setShowRules(true)}
            className="min-h-11 rounded-stub-panel px-6 py-2.5 text-center font-stub-label text-[13px] font-bold uppercase tracking-[0.06em] text-stub-slate ring-1 ring-inset ring-stub-navy/25 active:scale-[0.98]"
          >
            How to play
          </button>
        </div>
      </div>
      <AnimatePresence>
        {showRules && <HowToPlay onClose={() => setShowRules(false)} />}
      </AnimatePresence>
    </div>
  )
}

// Daily streak chip for a menu mode card. Hidden until there's something to
// show; the ✓ marks today's daily as done (tapping in again just replays it).
function StreakChip({ mode, status }: { mode: string; status: DailyStatus }) {
  if (!status.playedToday && status.streak === 0) return null
  return (
    <span
      data-streak-chip={mode}
      className="rounded-stub-pill bg-stub-amber/15 px-2 py-0.5 font-stub-label text-[10px] font-bold tabular-nums text-stub-amber"
    >
      {status.playedToday && '✓ '}streak {status.streak}
    </span>
  )
}
