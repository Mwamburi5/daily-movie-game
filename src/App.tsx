import { lazy, Suspense, useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import type { SoloStart } from './SoloGame.tsx'
import type { ChronoStart } from './ChronologyGame.tsx'
import type { ConnectionsStart } from './ConnectionsGame.tsx'
import HowToPlay from './components/HowToPlay.tsx'
import Icon from './components/Icon.tsx'
import { useDialogA11y } from './components/useDialogA11y.ts'
import { type Difficulty, DIFFICULTIES, DIFFICULTY_META } from './lib/difficulty.ts'
import { localDateSeed } from './lib/daily.ts'
import { MOTION } from './lib/motion.ts'
import {
  dailyStatus,
  duelRecord,
  hasSeenIntro,
  markIntroSeen,
  lastDifficulty,
  recordDifficultyPick,
  type DailyStatus,
} from './lib/progress.ts'

type Mode = 'menu' | 'solo' | 'duel' | 'chronology' | 'connections'

// Each mode owns its gameplay code and data graph. Keeping these import()
// boundaries at module scope means React caches the resolved module after its
// first load, while the menu ships without any mode-only component or pool.
const SoloGame = lazy(() => import('./SoloGame.tsx'))
const DuelGame = lazy(() => import('./DuelGame.tsx'))
const ChronologyGame = lazy(() => import('./ChronologyGame.tsx'))
const ConnectionsGame = lazy(() => import('./ConnectionsGame.tsx'))

// Chronology's OWN practice-spread dial (NOT Duel's difficulty.ts, which is link-
// engine tuned). House voice borrows film-distribution words: a "wide" release is
// spread across the calendar (wide gaps), a "tight" run bunches into one window.
// These flavor the random practice round only; the daily always deals 'standard'.
// Subtitles gloss the deal shape (feedback batch 1: bare "wide/tight" read as
// jargon) — spreadDeal spans the whole era, clusterDeal bunches one window.
const CHRONO_PRACTICE: { id: 'easy' | 'hard'; label: string; sub: string }[] = [
  { id: 'easy', label: 'Wide', sub: 'decades apart' },
  { id: 'hard', label: 'Tight', sub: 'same era' },
]

export default function App() {
  // Dev-only boot param (?mode=duel|solo|chronology|connections): lands straight
  // in a mode with its daily start — for the capture/verify tooling, which gets
  // a fresh page per screenshot and can't click through the menu first. Same
  // DEV gate as main.tsx's ?preview harness; tree-shaken out of prod.
  const [mode, setMode] = useState<Mode>(() => {
    if (import.meta.env.DEV) {
      const m = new URLSearchParams(window.location.search).get('mode')
      if (m === 'solo' || m === 'duel' || m === 'chronology' || m === 'connections') return m
    }
    return 'menu'
  })
  // Lazy init from the picker memory (§7·7c): a reload keeps the last-picked
  // tier instead of snapping back to Matinee. Meta-state only — the value still
  // flows into DuelGame as a prop, exactly as a tap would set it.
  const [difficulty, setDifficulty] = useState<Difficulty>(() => lastDifficulty())
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

  if (mode !== 'menu') {
    return (
      <Suspense fallback={<ModeLoading />}>
        {mode === 'solo' && <SoloGame onExit={() => setMode('menu')} start={soloStart} />}
        {mode === 'duel' && <DuelGame onExit={() => setMode('menu')} difficulty={difficulty} />}
        {mode === 'chronology' && <ChronologyGame onExit={() => setMode('menu')} start={chronoStart} />}
        {mode === 'connections' && <ConnectionsGame onExit={() => setMode('menu')} start={connStart} />}
      </Suspense>
    )
  }

  return (
    <div
      className="menu-shell relative mx-auto flex h-full w-full flex-col bg-stub-cream"
      style={{
        backgroundImage: 'radial-gradient(rgba(31,58,82,.06) 1px, transparent 1.2px)',
        backgroundSize: '7px 7px',
      }}
    >
      {/* Navy header — cohesion with the game screens' navy bar (Buri flag c,
          2026-07-07): the menu no longer opens header-less. Carries the wordmark
          and the rules affordance (the old bottom "How to play" button folds
          into this ?, matching every game screen). */}
      <header className="menu-header flex items-center justify-between rounded-b-stub-header bg-stub-navy px-5 pb-4 pt-4">
        <h1 className="font-stub-display text-2xl font-bold italic tracking-tight text-stub-cream">
          Match Cut
        </h1>
        <button
          type="button"
          aria-label="How to play"
          data-rules-open
          onClick={() => setShowRules(true)}
          className="daily-icon-button flex h-8 w-8 items-center justify-center rounded-stub-pill text-[13px] font-extrabold text-stub-cream/80 ring-1 ring-inset ring-stub-slate-light/50 active:scale-90"
        >
          <Icon name="help" size={20} />
        </button>
      </header>

      {/* Scroll container: `my-auto` on the inner column centers the cards when
          they fit (tall phones) and top-aligns + scrolls when they don't — with
          plain justify-center, a 667px viewport clipped the Connections card
          UNREACHABLY (flex centering overflows both ends; the top half can
          never be scrolled to). */}
      <div className="menu-scroll flex min-h-0 w-full flex-1 flex-col items-center overflow-y-auto px-8">
        <main className="menu-workspace my-auto flex w-full flex-col items-center gap-8 py-6">
        <section className="menu-intro text-center" aria-labelledby="menu-program-title">
          <p className="font-stub-label text-[11px] font-bold uppercase tracking-[0.16em] text-stub-amber">
            Tonight&apos;s program
          </p>
          <h2 id="menu-program-title" className="mt-2 font-stub-display text-3xl font-bold text-stub-navy">
            Pick your feature.
          </h2>
          <p className="mt-3 font-stub-ui text-[15px] leading-relaxed text-stub-slate">
            Connect movies by the people who made them. Three fresh dailies, plus the head-to-head cut.
          </p>
          <p className="menu-recommendation mt-4 rounded-stub-panel border border-stub-amber/60 bg-stub-amber/10 px-4 py-3 font-stub-ui text-[14px] leading-snug text-stub-navy">
            <span className="block font-stub-label text-[11px] font-bold uppercase tracking-[0.12em] text-stub-amber">
              Recommended start
            </span>
            Daily Puzzle — a quick hand to learn the links.
          </p>
        </section>
        <div className="menu-mode-grid flex w-full max-w-[300px] flex-col gap-3">
          {/* Card order (Buri, 2026-08-07): dailies lead, Duel demoted to LAST —
              batch-1 feedback had duel comprehension failing across 3 sources and
              zero would-return votes; the deepest mode can't be the front door.
              The old navy hero fill went with it (see the Duel card below) — no
              card is "the" primary now. W5d punched notches stay on every card. */}
          <article className="menu-card menu-card--recommended relative rounded-stub-panel border-2 border-stub-navy bg-stub-paper px-6 py-4 shadow-stub-card-resting">
            <MenuNotches />
            <span data-menu-recommended className="menu-card-kicker mb-2 inline-flex rounded-stub-pill bg-stub-amber px-2.5 py-1 font-stub-label text-[11px] font-bold uppercase tracking-[0.1em] text-stub-navy">
              Start here · daily
            </span>
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
                Today's hand — same for everyone. Play out every card. Golf — low score wins.
              </span>
            </button>
            {/* The daily is the button above; the original hand-designed puzzle
                stays on as a fixed practice round. */}
            <div className="menu-practice-row mt-3 flex items-center gap-2 border-t border-dashed border-stub-navy/20 pt-3">
              <span className="font-stub-label text-[12px] font-semibold uppercase tracking-[0.08em] text-stub-slate">
                practice
              </span>
              <button
                type="button"
                data-solo-practice
                onClick={() => startSolo({ kind: 'practice' })}
                className="min-h-11 flex-1 rounded-stub-pill border-2 border-stub-navy bg-stub-paper px-3 py-2 font-stub-label text-[11px] font-bold uppercase tracking-[0.08em] text-stub-navy transition-colors active:bg-stub-navy/10"
              >
                The original hand
              </button>
            </div>
          </article>
          <article className="menu-card relative rounded-stub-panel border-2 border-stub-navy bg-stub-paper px-6 py-4 shadow-stub-card-resting">
            <MenuNotches />
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
            <div className="menu-practice-row mt-3 flex items-center gap-2 border-t border-dashed border-stub-navy/20 pt-3">
              <span className="font-stub-label text-[12px] font-semibold uppercase tracking-[0.08em] text-stub-slate">
                practice
              </span>
              <div className="flex flex-1 gap-1.5">
                {CHRONO_PRACTICE.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    data-chrono-practice={p.id}
                    onClick={() => startChronology({ kind: 'practice', difficulty: p.id })}
                    className="min-h-11 flex-1 rounded-stub-pill border-2 border-stub-navy bg-stub-paper px-2 py-1.5 font-stub-label text-[11px] font-bold uppercase tracking-[0.08em] text-stub-navy transition-colors active:bg-stub-navy/10"
                  >
                    {p.label}
                    <span className="block text-[10px] font-semibold normal-case tracking-normal text-stub-slate">
                      {p.sub}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </article>
          {/* Connections (Mode 4) — EXTRAPOLATED, composed from the same paper
              panel as the other daily cards (cohesion ruling). */}
          <article className="menu-card relative rounded-stub-panel border-2 border-stub-navy bg-stub-paper px-6 py-4 shadow-stub-card-resting">
            <MenuNotches />
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
            <div className="menu-practice-row mt-3 flex items-center gap-2 border-t border-dashed border-stub-navy/20 pt-3">
              <span className="font-stub-label text-[12px] font-semibold uppercase tracking-[0.08em] text-stub-slate">
                practice
              </span>
              <button
                type="button"
                data-connections-practice
                onClick={() => startConnections({ kind: 'practice' })}
                className="min-h-11 flex-1 rounded-stub-pill border-2 border-stub-navy bg-stub-paper px-3 py-2 font-stub-label text-[11px] font-bold uppercase tracking-[0.08em] text-stub-navy transition-colors active:bg-stub-navy/10"
              >
                Random grid
              </button>
            </div>
          </article>
          {/* Duel — the deep-strategy mode, deliberately last and on the same
              paper panel as the dailies (demoted from the navy hero it launched
              with; Buri, 2026-08-07). Its difficulty picker rides along. */}
          <article className="menu-card relative rounded-stub-panel border-2 border-stub-navy bg-stub-paper px-6 py-4 shadow-stub-card-resting">
            <MenuNotches />
            <button
              type="button"
              data-mode="duel"
              onClick={() => setMode('duel')}
              className="block w-full text-left active:scale-[0.98]"
            >
              <span className="flex items-baseline justify-between">
                <span className="font-stub-display text-[17px] font-bold text-stub-navy">
                  Duel vs Computer
                </span>
                {duelChip.plays > 0 && (
                  <span
                    data-record-chip="duel"
                    className="rounded-stub-pill bg-stub-navy/10 px-2 py-0.5 font-stub-label text-[10px] font-bold tabular-nums text-stub-navy/70"
                  >
                    {duelChip.wins}/{duelChip.plays} won
                  </span>
                )}
              </span>
              <span className="mt-0.5 block font-stub-ui text-[12px] text-stub-slate">
                Take turns scoring links. Race to 20 — high score wins.
              </span>
            </button>
            {/* Difficulty segmented control → Stub pill group: amber-active,
                recolored for the paper panel (was black/25 on navy). */}
            <div className="menu-practice-row mt-3 flex gap-1 rounded-stub-pill bg-stub-navy/10 p-0.5">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d}
                  type="button"
                  data-difficulty={d}
                  aria-pressed={difficulty === d}
                  onClick={() => {
                    setDifficulty(d)
                    recordDifficultyPick(d)
                  }}
                  className={`min-h-11 flex-1 whitespace-nowrap rounded-stub-pill px-2 py-2 font-stub-label text-[10px] font-bold uppercase tracking-[0.04em] transition-colors ${
                    difficulty === d
                      ? 'bg-stub-amber text-stub-navy shadow-sm'
                      : 'text-stub-slate active:text-stub-navy'
                  }`}
                >
                  {DIFFICULTY_META[d].label}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-center font-stub-ui text-[11px] text-stub-slate">
              {DIFFICULTY_META[difficulty].blurb}
            </p>
          </article>
        </div>
        </main>
      </div>
      <AnimatePresence>
        {showRules && <HowToPlay context="overview" onClose={() => setShowRules(false)} />}
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
  // Dialog contract (§7·7b a11y): focus enters, Tab cycles inside, Esc dismisses.
  const dialogRef = useDialogA11y(onDismiss)
  return (
    <motion.div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to Match Cut"
      tabIndex={-1}
      className="absolute inset-0 z-[130] flex items-center justify-center bg-stub-navy/40 px-8 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduce ? MOTION.duration.reduced : MOTION.duration.reveal }}
      data-intro
      onClick={onDismiss}
    >
      <motion.div
        className="w-full max-w-[320px] rounded-stub-panel bg-stub-navy px-7 py-8 text-center shadow-stub-card-resting"
        initial={{ opacity: 0, y: reduce ? 0 : 16, scale: reduce ? 1 : 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: reduce ? 0 : 16, scale: reduce ? 1 : 0.96 }}
        transition={reduce ? { duration: MOTION.duration.reduced } : MOTION.spring.overlay}
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

// Suspense replaces the menu only after a mode is selected, so this deliberate
// interstitial can never cover an already-running deal. Once a module resolves,
// React.lazy caches it and returning to that mode does not show this again.
function ModeLoading() {
  const reduce = useReducedMotion()
  return (
    <div className="daily-mode-shell relative mx-auto flex h-full w-full items-center justify-center bg-stub-cream px-8">
      <motion.div
        role="status"
        aria-live="polite"
        data-mode-loading
        className="relative w-full max-w-[280px] rounded-stub-panel border-2 border-stub-navy bg-stub-paper px-8 py-9 text-center shadow-stub-card-resting"
        initial={{ opacity: 0, y: reduce ? 0 : 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduce ? { duration: MOTION.duration.reduced } : MOTION.spring.overlay}
      >
        <MenuNotches />
        <span className="block font-stub-label text-[10px] font-bold uppercase tracking-[0.18em] text-stub-amber">
          Now showing
        </span>
        <span className="mt-2 block font-stub-display text-2xl font-bold italic text-stub-navy">
          Threading the reel…
        </span>
      </motion.div>
    </div>
  )
}

// Punched side notches for a menu card (comp §4, the 7d score-stub treatment):
// cream circles ringed navy, floating half off each edge at mid-height. No
// clipping needed — the outer half sits cream-on-cream over the dotted page, so
// the ring reads as a punched hole. Identical on every card.
function MenuNotches() {
  return (
    <>
      {(['l', 'r'] as const).map((side) => (
        <span
          key={side}
          className="pointer-events-none absolute rounded-full border-2 border-stub-navy bg-stub-cream"
          style={{
            top: '50%',
            [side === 'l' ? 'left' : 'right']: 0,
            transform: `translate(${side === 'l' ? '-55%' : '55%'}, -50%)`,
            width: 13,
            height: 13,
          }}
        />
      ))}
    </>
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
