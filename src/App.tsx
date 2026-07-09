import { useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import SoloGame, { type SoloStart } from './SoloGame.tsx'
import DuelGame from './DuelGame.tsx'
import ChronologyGame, { type ChronoStart } from './ChronologyGame.tsx'
import ConnectionsGame, { type ConnectionsStart } from './ConnectionsGame.tsx'
import HowToPlay from './components/HowToPlay.tsx'
import { type Difficulty, DIFFICULTIES, DIFFICULTY_META } from './lib/difficulty.ts'
import { localDateSeed } from './lib/daily.ts'
import { dailyStatus, duelRecord, hasSeenIntro, markIntroSeen, type DailyStatus } from './lib/progress.ts'

type Mode = 'menu' | 'solo' | 'duel' | 'chronology' | 'connections'

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
  const [connStart, setConnStart] = useState<ConnectionsStart>({ kind: 'daily' })
  const [soloStart, setSoloStart] = useState<SoloStart>({ kind: 'daily' })
  const [showRules, setShowRules] = useState(false)
  // First-run framing: shown once per device, before the menu makes sense.
  // Lazy init reads the meta flag a single time (persistence guardrail: display
  // only). Dismiss persists so it never nags a returning player.
  const [showIntro, setShowIntro] = useState(() => !hasSeenIntro())
  const dismissIntro = () => {
    markIntroSeen()
    setShowIntro(false)
  }

  const startChronology = (start: ChronoStart) => {
    setChronoStart(start)
    setMode('chronology')
  }

  const startConnections = (start: ConnectionsStart) => {
    setConnStart(start)
    setMode('connections')
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
  const connChip = useMemo(() => dailyStatus('connections', todaySeed), [mode, todaySeed])
  const duelChip = useMemo(() => duelRecord(difficulty), [mode, difficulty])

  if (mode === 'solo') return <SoloGame onExit={() => setMode('menu')} start={soloStart} />
  if (mode === 'duel') return <DuelGame onExit={() => setMode('menu')} difficulty={difficulty} />
  if (mode === 'chronology') return <ChronologyGame onExit={() => setMode('menu')} start={chronoStart} />
  if (mode === 'connections') return <ConnectionsGame onExit={() => setMode('menu')} start={connStart} />

  return (
    <div
      className="relative mx-auto flex h-full w-full max-w-[420px] flex-col bg-stub-cream"
      style={{
        backgroundImage: 'radial-gradient(rgba(31,58,82,.06) 1px, transparent 1.2px)',
        backgroundSize: '7px 7px',
      }}
    >
      {/* Navy header — cohesion with the game screens' navy bar (Buri flag c,
          2026-07-07): the menu no longer opens header-less. Carries the wordmark
          and the rules affordance (the old bottom "How to play" button folds
          into this ?, matching every game screen). */}
      <header className="flex items-center justify-between rounded-b-stub-header bg-stub-navy px-5 pb-4 pt-4">
        <h1 className="font-stub-display text-2xl font-bold italic tracking-tight text-stub-cream">
          Match Cut
        </h1>
        <button
          type="button"
          aria-label="How to play"
          data-rules-open
          onClick={() => setShowRules(true)}
          className="flex h-8 w-8 items-center justify-center rounded-stub-pill text-[13px] font-extrabold text-stub-cream/80 ring-1 ring-inset ring-stub-slate-light/50 active:scale-90"
        >
          ?
        </button>
      </header>

      <div className="flex w-full flex-1 flex-col items-center justify-center gap-8 px-8">
        <p className="text-center font-stub-ui text-sm text-stub-slate">
          Connect movies by the people who made them.
        </p>
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
          {/* Connections (Mode 4) — EXTRAPOLATED, composed from the same paper
              panel as the other daily cards (cohesion ruling). */}
          <div className="rounded-stub-panel bg-stub-paper px-6 py-4 shadow-stub-card-resting">
            <button
              type="button"
              data-mode="connections"
              onClick={() => startConnections({ kind: 'daily' })}
              className="block w-full text-left active:scale-[0.98]"
            >
              <span className="flex items-baseline justify-between">
                <span className="font-stub-display text-[17px] font-bold text-stub-navy">
                  Connections
                </span>
                <StreakChip mode="connections" status={connChip} />
              </span>
              <span className="mt-0.5 block font-stub-ui text-[12px] text-stub-slate">
                Today's sixteen. Find four groups of four — same director, actor, series, or genre.
              </span>
            </button>
            {/* The daily is the button above; practice deals a fresh verified grid. */}
            <div className="mt-3 flex items-center gap-2">
              <span className="font-stub-label text-[11px] font-semibold uppercase tracking-[0.08em] text-stub-slate">
                practice
              </span>
              <button
                type="button"
                data-connections-practice
                onClick={() => startConnections({ kind: 'practice' })}
                className="flex-1 rounded-stub-pill bg-stub-navy/[0.06] px-2 py-1.5 font-stub-label text-[11px] font-bold text-stub-slate transition-colors active:bg-stub-navy/10 active:text-stub-navy"
              >
                Random grid
              </button>
            </div>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {showRules && <HowToPlay onClose={() => setShowRules(false)} />}
        {showIntro && <IntroOverlay onDismiss={dismissIntro} />}
      </AnimatePresence>
    </div>
  )
}

// One-shot first-run framing (Buri: "minimal framing now", 2026-07-08). NOT a
// tutorial funnel — a single welcome beat that answers "what is this?" before the
// four cards land, then never returns (gated by the seenIntro meta flag).
// Composed from the menu's own Stub tokens: navy hero panel, amber primary, cream
// text — the cohesion ruling (EXTRAPOLATED; no reference comp). Tapping the scrim
// or Play both dismiss; the card stops propagation so an inside tap doesn't.
function IntroOverlay({ onDismiss }: { onDismiss: () => void }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className="absolute inset-0 z-[130] flex items-center justify-center bg-stub-navy/40 px-8 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduce ? 0.15 : 0.25 }}
      data-intro
      onClick={onDismiss}
    >
      <motion.div
        className="w-full max-w-[320px] rounded-stub-panel bg-stub-navy px-7 py-8 text-center shadow-stub-card-resting"
        initial={{ opacity: 0, y: reduce ? 0 : 16, scale: reduce ? 1 : 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: reduce ? 0 : 16, scale: reduce ? 1 : 0.96 }}
        transition={reduce ? { duration: 0.15 } : { type: 'spring', stiffness: 320, damping: 26 }}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="font-stub-label text-[10px] font-bold uppercase tracking-[0.18em] text-stub-amber">
          Welcome to
        </p>
        <h2 className="mt-1 font-stub-display text-3xl font-bold italic tracking-tight text-stub-cream">
          Match Cut
        </h2>
        <p className="mt-4 font-stub-ui text-[13.5px] leading-relaxed text-stub-cream/80">
          Movies connect through the people who make them — the actors, directors, and series they share.
        </p>
        <p className="mt-2.5 font-stub-ui text-[13.5px] leading-relaxed text-stub-cream/80">
          Four ways to play with those links. Fresh puzzles daily.
        </p>
        <button
          type="button"
          data-intro-dismiss
          onClick={onDismiss}
          className="mt-6 w-full rounded-stub-pill bg-stub-amber px-6 py-3 font-stub-label text-[13px] font-bold uppercase tracking-wider text-stub-navy shadow-stub-card-resting active:scale-[0.98]"
        >
          Play
        </button>
        <p className="mt-3 font-stub-ui text-[11px] text-stub-cream/45">
          New here? Tap ? any time for the full rules.
        </p>
      </motion.div>
    </motion.div>
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
