import { lazy, Suspense, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import type { SoloStart } from './SoloGame.tsx'
import type { ChronoStart } from './ChronologyGame.tsx'
import type { ConnectionsStart } from './ConnectionsGame.tsx'
import HowToPlay from './components/HowToPlay.tsx'
import Icon from './components/Icon.tsx'
import Onboarding from './components/Onboarding.tsx'
import { type Difficulty, DIFFICULTIES, DIFFICULTY_META } from './lib/difficulty.ts'
import { localDateSeed } from './lib/daily.ts'
import { MOTION } from './lib/motion.ts'
import {
  dailyStatus,
  duelRecord,
  hasSeenOnboarding,
  markOnboardingSeen,
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
  const rulesButtonRef = useRef<HTMLButtonElement>(null)
  // First-run onboarding: the four static screens, shown once per device before
  // the menu makes sense. Lazy init reads the meta flag a single time
  // (persistence guardrail: display only). Dismissing persists, so it never nags
  // a returning player — and the help sheet can still replay it on demand.
  const [showOnboarding, setShowOnboarding] = useState(() => !hasSeenOnboarding())
  const dismissOnboarding = () => {
    markOnboardingSeen()
    setShowOnboarding(false)
    // The first-run flow has no surviving trigger, and replay unmounts its help-
    // sheet trigger. Give both exits one deterministic destination on the menu.
    window.requestAnimationFrame(() => rulesButtonRef.current?.focus())
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
  const dailyPassport = [
    { mode: 'solo', label: 'Puzzle', status: soloChip },
    { mode: 'chronology', label: 'Chronology', status: chronoChip },
    { mode: 'connections', label: 'Connections', status: connChip },
  ] as const

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
      className="app-shell menu-shell relative mx-auto flex h-full w-full flex-col bg-stub-cream"
      style={{
        backgroundImage: 'radial-gradient(rgba(31,58,82,.06) 1px, transparent 1.2px)',
        backgroundSize: '7px 7px',
      }}
    >
      {/* Navy header — cohesion with the game screens' navy bar (Buri flag c,
          2026-07-07): the menu no longer opens header-less. Carries the wordmark
          and the rules affordance (the old bottom "How to play" button folds
          into this ?, matching every game screen). */}
      <header className="app-shell-header menu-header relative flex items-center justify-between px-5">
        <h1 className="font-stub-display text-2xl font-bold italic tracking-tight text-stub-cream">
          Match Cut
        </h1>
        <button
          ref={rulesButtonRef}
          type="button"
          aria-label="How to play"
          data-rules-open
          onClick={() => setShowRules(true)}
          className="app-help-button daily-icon-button text-[13px] font-extrabold active:scale-90"
        >
          <Icon name="help" size={20} />
        </button>
        <span className="app-shell-header-tab" aria-hidden="true" />
      </header>

      {/* Scroll container: `my-auto` on the inner column centers the cards when
          they fit (tall phones) and top-aligns + scrolls when they don't — with
          plain justify-center, a 667px viewport clipped the Connections card
          UNREACHABLY (flex centering overflows both ends; the top half can
          never be scrolled to). */}
      <div className="menu-scroll flex min-h-0 w-full flex-1 flex-col items-center overflow-y-auto px-8">
        <main className="menu-workspace my-auto flex w-full flex-col items-center gap-6 py-5">
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
          <DailyPassport entries={dailyPassport} />
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
                <span className="block">Learn the links</span>
                <span className="menu-practice-purpose">fixed warm-up hand</span>
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
                    <span className="menu-practice-purpose">
                      {p.id === 'easy' ? 'train range' : 'train close calls'}
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
                <span className="block">Train grouping</span>
                <span className="menu-practice-purpose">fresh random grid</span>
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
        {showRules && (
          <HowToPlay
            context="overview"
            onClose={() => setShowRules(false)}
            onReplayIntro={() => {
              setShowRules(false)
              setShowOnboarding(true)
            }}
          />
        )}
        {showOnboarding && <Onboarding onDismiss={dismissOnboarding} />}
      </AnimatePresence>
    </div>
  )
}

function DailyPassport({
  entries,
}: {
  entries: readonly { mode: string; label: string; status: DailyStatus }[]
}) {
  const stamped = entries.filter((entry) => entry.status.playedToday).length
  const complete = stamped === entries.length
  return (
    <section
      className={`daily-passport ${complete ? 'daily-passport--complete' : ''}`}
      aria-label={
        complete
          ? `Triple Feature complete: all ${entries.length} daily modes completed today`
          : `Daily passport: ${stamped} of ${entries.length} daily modes completed today`
      }
      data-daily-passport
    >
      <div className="daily-passport-heading">
        <span>{complete ? 'Triple Feature' : 'Daily passport'}</span>
        <span className="tabular-nums">{complete ? 'complete ✓' : `${stamped}/${entries.length} stamped`}</span>
      </div>
      <div className="daily-passport-stamps">
        {entries.map((entry) => (
          <span
            key={entry.mode}
            className={`daily-passport-stamp ${entry.status.playedToday ? 'daily-passport-stamp--done' : ''}`}
            data-passport-mode={entry.mode}
          >
            <span aria-hidden="true">{entry.status.playedToday ? '✓' : '·'}</span>
            {entry.label}
          </span>
        ))}
      </div>
      <p>
        {complete
          ? 'Tonight’s program complete. Come back tomorrow for three fresh stubs.'
          : 'Stored on this device only. Practice never stamps the card.'}
      </p>
    </section>
  )
}

// Suspense replaces the menu only after a mode is selected, so this deliberate
// interstitial can never cover an already-running deal. Once a module resolves,
// React.lazy caches it and returning to that mode does not show this again.
function ModeLoading() {
  const reduce = useReducedMotion()
  return (
    <div className="app-shell daily-mode-shell relative mx-auto flex h-full w-full items-center justify-center bg-stub-cream px-8">
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
