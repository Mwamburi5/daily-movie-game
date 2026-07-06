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
    <div className="relative mx-auto h-full w-full max-w-[420px]">
      <div className="flex h-full w-full flex-col items-center justify-center gap-10 px-8">
        <div className="text-center">
          <h1 className="font-serif text-5xl font-black italic tracking-tight">Match Cut</h1>
          <p className="mt-2 text-sm text-[#7d7563]">Connect movies by the people who made them.</p>
        </div>
        <div className="flex w-full max-w-[300px] flex-col gap-3">
          <div className="rounded-2xl bg-[#23211c] px-6 py-4 shadow-md">
            <button
              type="button"
              data-mode="duel"
              onClick={() => setMode('duel')}
              className="block w-full text-left active:scale-[0.98]"
            >
              <span className="flex items-baseline justify-between">
                <span className="text-[16px] font-bold text-[#f4efe6]">Duel vs Computer</span>
                {duelChip.plays > 0 && (
                  <span
                    data-record-chip="duel"
                    className="rounded-full bg-[#f4efe6]/10 px-2 py-0.5 text-[10px] font-extrabold tabular-nums text-[#f4efe6]/70"
                  >
                    {duelChip.wins}/{duelChip.plays} won
                  </span>
                )}
              </span>
              <span className="mt-0.5 block text-[12px] text-[#f4efe6]/60">
                Take turns scoring links. Race to 20 — high score wins.
              </span>
            </button>
            <div className="mt-3 flex gap-1 rounded-full bg-black/25 p-0.5">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d}
                  type="button"
                  data-difficulty={d}
                  aria-pressed={difficulty === d}
                  onClick={() => setDifficulty(d)}
                  className={`flex-1 rounded-full px-2 py-1.5 text-[10px] font-bold transition-colors ${
                    difficulty === d
                      ? 'bg-[#f4efe6] text-[#23211c] shadow-sm'
                      : 'text-[#f4efe6]/55 active:text-[#f4efe6]/80'
                  }`}
                >
                  {DIFFICULTY_META[d].label}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-center text-[11px] text-[#f4efe6]/45">
              {DIFFICULTY_META[difficulty].blurb}
            </p>
          </div>
          <div className="rounded-2xl bg-white/70 px-6 py-4 shadow-sm">
            <button
              type="button"
              data-mode="solo"
              onClick={() => startSolo({ kind: 'daily' })}
              className="block w-full text-left active:scale-[0.98]"
            >
              <span className="flex items-baseline justify-between">
                <span className="text-[16px] font-bold text-[#23211c]">Daily Puzzle</span>
                <StreakChip mode="solo" status={soloChip} />
              </span>
              <span className="mt-0.5 block text-[12px] text-[#7d7563]">
                Today's hand — same for everyone. Fewest flips wins. Golf — low score wins.
              </span>
            </button>
            {/* The daily is the button above; the original hand-designed puzzle
                stays on as a fixed practice round. */}
            <div className="mt-3 flex items-center gap-2">
              <span className="text-[11px] font-semibold text-[#9a917c]">practice</span>
              <button
                type="button"
                data-solo-practice
                onClick={() => startSolo({ kind: 'practice' })}
                className="flex-1 rounded-full bg-[#23211c]/[0.06] px-2 py-1.5 text-[11px] font-bold text-[#7d7563] transition-colors active:bg-[#23211c]/10 active:text-[#23211c]"
              >
                The original hand
              </button>
            </div>
          </div>
          <div className="rounded-2xl bg-white/70 px-6 py-4 shadow-sm">
            <button
              type="button"
              data-mode="chronology"
              onClick={() => startChronology({ kind: 'daily' })}
              className="block w-full text-left active:scale-[0.98]"
            >
              <span className="flex items-baseline justify-between">
                <span className="text-[16px] font-bold text-[#23211c]">Chronology</span>
                <StreakChip mode="chronology" status={chronoChip} />
              </span>
              <span className="mt-0.5 block text-[12px] text-[#7d7563]">
                Today's lineup. Place the movies in release order. Golf — low score wins.
              </span>
            </button>
            {/* The daily is the button above; practice is its own affordance —
                each pill starts a fresh random round at that spread. */}
            <div className="mt-3 flex items-center gap-2">
              <span className="text-[11px] font-semibold text-[#9a917c]">practice</span>
              <div className="flex flex-1 gap-1 rounded-full bg-[#23211c]/[0.06] p-0.5">
                {CHRONO_PRACTICE.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    data-chrono-practice={p.id}
                    onClick={() => startChronology({ kind: 'practice', difficulty: p.id })}
                    className="flex-1 rounded-full px-2 py-1.5 text-[11px] font-bold text-[#7d7563] transition-colors active:bg-[#23211c]/10 active:text-[#23211c]"
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
            className="min-h-11 rounded-2xl px-6 py-2.5 text-center text-[13px] font-bold text-[#7d7563] ring-1 ring-inset ring-[#c5bca6] active:scale-[0.98]"
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
      className="rounded-full bg-[#b3541e]/10 px-2 py-0.5 text-[10px] font-extrabold tabular-nums text-[#b3541e]"
    >
      {status.playedToday && '✓ '}streak {status.streak}
    </span>
  )
}
