import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { movieById } from './data/movies.ts'
import { LEGACY_DUEL_POOL, dailyDuelPoolForSeed } from './data/duelPool.ts'
import { PUZZLE } from './data/puzzle.ts'
import { dailySoloPuzzle, localDateSeed } from './lib/daily.ts'
import { hasAnyPlay, isSolvable, sharedPeople, type Role } from './lib/solver.ts'
import { recordDailyFinish, type DailyFinish } from './lib/progress.ts'
import { track } from './lib/analytics.ts'
import { useJourneyAnalytics } from './lib/journeyAnalytics.ts'
import { MOTION } from './lib/motion.ts'
import StubCard from './components/StubCard.tsx'
import Hand from './components/Hand.tsx'
import HowToPlay from './components/HowToPlay.tsx'
import Icon from './components/Icon.tsx'
import DailyModeHeader from './components/DailyModeHeader.tsx'
import Results from './components/Results.tsx'
import soloSpotlightUrl from './assets/solo-spotlight.webp'

// How a round was started (chosen at the menu, App.tsx), mirroring Chronology's
// ChronoStart. The DAILY is a date-seeded generated deal — solver-guaranteed
// solvable, par priced from the solver's best line — identical for everyone on
// the same local calendar day. PRACTICE is the original hand-designed puzzle
// (marquee-001), kept as a fixed warm-up.
export type SoloStart = { kind: 'daily' } | { kind: 'practice' }

type Status = 'playing' | 'won' | 'stuck'

const initialDailySeed = () => {
  if (import.meta.env.VITE_E2E === '1') {
    const override = new URLSearchParams(window.location.search).get('dailySeed')
    if (override && /^\d{4}-\d{2}-\d{2}$/.test(override)) return override
  }
  return localDateSeed()
}

// "Robert De Niro" -> "De Niro", for the combo badge
const surname = (name: string) => {
  const parts = name.split(' ')
  return parts.length > 1 ? parts.slice(1).join(' ') : name
}

interface Connection {
  name: string
  role: Role
  comboCount: number // 0 = no combo, >=3 = films chained via this person
  seq: number
}

export default function SoloGame({ onExit, start }: { onExit: () => void; start: SoloStart }) {
  const reduce = useReducedMotion()
  const journey = useJourneyAnalytics({ mode: 'solo', kind: start.kind })
  // Today's seed, fixed at mount (same pattern as Chronology's dailySeed ref) —
  // the deal and the streak record must key off the SAME seed even if midnight
  // passes mid-game.
  const dailySeed = useRef(initialDailySeed()).current
  const puzzlePool = useMemo(
    () => (start.kind === 'daily' ? dailyDuelPoolForSeed(dailySeed) : LEGACY_DUEL_POOL),
    [start.kind, dailySeed],
  )
  // The puzzle is fixed for the life of the mount: today's generated daily, or
  // the designed practice hand. Restart replays the same board.
  const puzzle = useMemo(
    () => (start.kind === 'daily' ? dailySoloPuzzle(dailySeed, puzzlePool) : PUZZLE),
    [start.kind, dailySeed, puzzlePool],
  )
  const [hand, setHand] = useState<string[]>(puzzle.handMovieIds)
  const [pile, setPile] = useState<string[]>([puzzle.starterMovieId])
  const [faceUp, setFaceUp] = useState<ReadonlySet<string>>(() => new Set())
  const [flippedEver, setFlippedEver] = useState<ReadonlySet<string>>(() => new Set())
  const [invalids, setInvalids] = useState(0)
  const [combo, setCombo] = useState<{ names: string[]; count: number } | null>(null)
  const [comboBonus, setComboBonus] = useState(0)
  const [connection, setConnection] = useState<Connection | null>(null)
  const [playLog, setPlayLog] = useState<{ id: string; flipped: boolean }[]>([])
  const [raisedId, setRaisedId] = useState<string | null>(null)
  const [invalidNonce, setInvalidNonce] = useState(0)
  const [invalidNotice, setInvalidNotice] = useState(false)
  // Nonce for the header's "+1" pulse — first flips are the scored move players
  // miss (feedback batch 1: the counter ticked silently), so the cost announces
  // itself at the moment it's paid.
  const [flipPulse, setFlipPulse] = useState(0)
  const [status, setStatus] = useState<Status>('playing')
  const [showRules, setShowRules] = useState(false)
  // Streak/best readout for the end screen — set by the finish effect below.
  // Meta-state only; nothing gameplay-side reads it (persistence guardrail).
  const [finishMeta, setFinishMeta] = useState<DailyFinish | null>(null)
  const pileZoneRef = useRef<HTMLDivElement>(null)
  const lowerTimer = useRef<number | undefined>(undefined)
  const invalidNoticeTimer = useRef<number | undefined>(undefined)

  const flips = flippedEver.size + invalids * 2
  const score = flips - comboBonus

  // Escape lowers the raised card (§7·7b a11y) — the keyboard's tap-elsewhere.
  // Dialogs (rules/results) capture Escape first and stop propagation.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setRaisedId(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(
    () => () => {
      window.clearTimeout(lowerTimer.current)
      window.clearTimeout(invalidNoticeTimer.current)
    },
    [],
  )

  const topId = pile[pile.length - 1]
  const topMovie = movieById.get(topId)!
  const raisedMovie = raisedId === null ? null : movieById.get(raisedId)!
  const raisedConnects = raisedMovie !== null && sharedPeople(topMovie, raisedMovie).length > 0
  const underlays = pile.slice(0, -1).slice(-2)

  // One winning order from the starter, for the stuck screen reveal.
  const solution = useMemo(() => isSolvable(puzzle, puzzlePool) ?? [], [puzzle, puzzlePool])
  const solutionSteps = useMemo(
    () =>
      solution.map((id, i) => {
        const m = movieById.get(id)!
        const via =
          i === 0 ? null : sharedPeople(movieById.get(solution[i - 1])!, m)[0]?.name ?? null
        return { title: `${m.title} (${m.year})`, via }
      }),
    [solution],
  )

  const emoji =
    '🎬' +
    playLog.map((p) => (p.flipped ? '🟨' : '🟩')).join('') +
    (status === 'stuck' ? '🧱' : '')

  const flipCard = (id: string) => {
    if (status !== 'playing') return
    journey.action('flip', true)
    if (!faceUp.has(id) && !flippedEver.has(id)) {
      setFlippedEver((prev) => new Set(prev).add(id))
      setFlipPulse((n) => n + 1)
    }
    setFaceUp((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Geometry-free play core (§7·7b a11y): the drag resolver and the keyboard
  // pile-top activation both land here, so the two paths can't drift.
  const playCard = (id: string) => {
    if (status !== 'playing') return
    const card = movieById.get(id)!
    const shared = sharedPeople(topMovie, card)
    journey.action('play', shared.length > 0)

    if (shared.length === 0) {
      journey.friction('invalid_play')
      setInvalids((n) => n + 1) // +2 on the flip counter
      setInvalidNonce((n) => n + 1) // trigger shake
      setInvalidNotice(true)
      window.clearTimeout(invalidNoticeTimer.current)
      invalidNoticeTimer.current = window.setTimeout(() => setInvalidNotice(false), 1800)
      window.clearTimeout(lowerTimer.current)
      lowerTimer.current = window.setTimeout(() => setRaisedId(null), 650)
      return
    }

    // Combo: consecutive plays connected via the same person. The candidate
    // set narrows each play; surviving names keep the chain alive.
    const sharedNames = shared.map((s) => s.name)
    const carried = combo ? combo.names.filter((n) => sharedNames.includes(n)) : []
    const nextCombo =
      carried.length > 0
        ? { names: carried, count: combo!.count + 1 }
        : { names: sharedNames, count: 2 }
    if (carried.length > 0) setComboBonus((b) => b + 1) // −1 per card chained beyond the first link
    setCombo(nextCombo)

    const display = shared.find((s) => nextCombo.names.includes(s.name)) ?? shared[0]
    setConnection({
      name: display.name,
      role: display.role,
      comboCount: nextCombo.count >= 3 ? nextCombo.count : 0,
      seq: pile.length,
    })

    const newHand = hand.filter((h) => h !== id)
    setPile((p) => [...p, id])
    setHand(newHand)
    setRaisedId(null)
    setFaceUp((prev) => {
      const next = new Set(prev)
      next.delete(id) // land face-front on the pile
      return next
    })
    setPlayLog((l) => [...l, { id, flipped: flippedEver.has(id) }])

    if (newHand.length === 0) {
      setStatus('won')
    } else if (!hasAnyPlay(card, newHand.map((h) => movieById.get(h)!))) {
      setStatus('stuck')
    }
  }

  // Drag resolver: hit-test the drop point against the pile zone, then play.
  const attemptPlay = (id: string, point: { x: number; y: number }) => {
    if (status !== 'playing') return
    const zone = pileZoneRef.current?.getBoundingClientRect()
    if (!zone) return
    const m = 60 // "on or near the pile"
    const inZone =
      point.x >= zone.left - m &&
      point.x <= zone.right + m &&
      point.y >= zone.top - m &&
      point.y <= zone.bottom + m
    if (!inZone) return // springs back to raised slot
    playCard(id)
  }

  // One activation contract for pointer, touch, and keyboard. A held card
  // routes to the same geometry-free play core as drag; an empty hand target
  // keeps the established flip-for-credits behavior.
  const activatePile = () => {
    if (raisedId !== null) playCard(raisedId)
    else flipCard(topId)
  }

  const resetGame = () => {
    journey.replay()
    window.clearTimeout(lowerTimer.current)
    window.clearTimeout(invalidNoticeTimer.current)
    setHand(puzzle.handMovieIds)
    setPile([puzzle.starterMovieId])
    setFaceUp(new Set())
    setFlippedEver(new Set())
    setFlipPulse(0)
    setInvalids(0)
    setInvalidNotice(false)
    setCombo(null)
    setComboBonus(0)
    setConnection(null)
    setPlayLog([])
    setRaisedId(null)
    setStatus('playing')
  }

  // Banner auto-dismiss
  useEffect(() => {
    if (!connection) return
    const t = window.setTimeout(() => setConnection(null), 2600)
    return () => window.clearTimeout(t)
  }, [connection])

  // Reaching the end screen (won OR stuck) completes the daily. The streak
  // record is once-per-seed inside recordDailyFinish, so a same-day replay via
  // "Play again" just reads back the existing entry (repeat: true). Practice
  // never records — the daily streak is the daily's.
  useEffect(() => {
    if (status === 'playing') return
    // outcome ride-alongs, all settled by the time status flips: won|stuck,
    // flips (flippedEver + invalid penalty), score (flips − combo), solver par
    track('mode_finish', {
      mode: 'solo',
      kind: start.kind,
      result: status,
      flips,
      score,
      par: puzzle.par,
    })
    if (start.kind !== 'daily') return
    setFinishMeta(recordDailyFinish('solo', dailySeed, status === 'won' ? score : null))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  return (
    <div
      className="h-full overflow-hidden bg-stub-cream"
    >
      <div
        className="app-shell daily-mode-shell relative mx-auto h-full w-full bg-stub-cream"
        data-mode-stage="solo"
        style={{
          backgroundImage: `url(${soloSpotlightUrl})`,
          backgroundPosition: 'center top',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
        }}
      >
        <DailyModeHeader
          title="Daily Puzzle"
          eyebrow={start.kind === 'daily' ? 'daily' : 'practice'}
          onBack={onExit}
          className="daily-mode-header--solo"
          right={
            <div className="solo-header-right flex items-center gap-1.5">
              <div
                className="app-counter-group grid grid-cols-3 gap-1 text-center tabular-nums"
                role="text"
                aria-label={`Flips ${flips}, score ${score}, par ${puzzle.par}`}
              >
                <span className="relative flex min-w-8 flex-col items-center leading-none">
                  <span className="app-counter-value text-stub-cream">{flips}</span>
                  <span className="app-counter-label solo-score-label mt-0.5 text-stub-slate-light">Flip</span>
                  {/* "+1" pops off the counter on each first flip (re-flips are free,
                      so no pulse) — the flip cost teaches itself. Keyed remount per
                      flip; the spent span sits invisible until the next one. */}
                  {flipPulse > 0 && (
                    <motion.span
                      key={flipPulse}
                      aria-hidden="true"
                      initial={{ opacity: 1, y: reduce ? 0 : 3 }}
                      animate={{ opacity: 0, y: reduce ? 0 : -13 }}
                      transition={{ duration: reduce ? 0.6 : 0.9, ease: 'easeOut' }}
                      className="pointer-events-none absolute -top-4 left-1/2 -translate-x-1/2 text-[12px] font-extrabold text-stub-amber"
                    >
                      +1
                    </motion.span>
                  )}
                </span>
                <span className="flex min-w-8 flex-col items-center leading-none">
                  <span className="app-counter-value text-stub-cream">{score}</span>
                  <span className="app-counter-label solo-score-label mt-0.5 text-stub-slate-light">Score</span>
                </span>
                <span className="flex min-w-8 flex-col items-center leading-none">
                  <span className="app-counter-value text-stub-cream">{puzzle.par}</span>
                  <span className="app-counter-label solo-score-label mt-0.5 text-stub-slate-light">Par</span>
                </span>
              </div>
              <div className="solo-header-actions flex items-center gap-1">
                <button
                  type="button"
                  aria-label="How to play"
                  data-rules-open
                  onClick={() => {
                    journey.helpOpen(status === 'playing' ? 'playing' : 'result')
                    setShowRules(true)
                  }}
                  className="app-help-button daily-icon-button text-[12px] font-extrabold active:scale-90"
                >
                  <Icon name="help" size={20} />
                </button>
                <button
                  type="button"
                  aria-label="Restart game"
                  onClick={resetGame}
                  className="daily-icon-button flex h-9 w-9 items-center justify-center rounded-stub-pill text-xl text-stub-cream/80 active:scale-90 active:text-stub-amber"
                >
                  <Icon name="restart" size={20} />
                </button>
              </div>
            </div>
          }
        />

        {/* Discard pile */}
        <section
          className={`solo-pile-stage absolute inset-x-0 flex justify-center ${
            raisedId !== null ? 'z-30' : 'z-10'
          }`}
        >
          <p
            className={`solo-zone-label absolute font-stub-label text-[12px] font-bold uppercase tracking-[0.14em] ${
              raisedId !== null && raisedConnects ? 'text-stub-amber' : 'text-stub-navy/70'
            }`}
          >
            {raisedId !== null && raisedConnects ? 'Play here' : 'Now playing'}
          </p>
          <div
            ref={pileZoneRef}
            className={`solo-play-target relative ${
              raisedId !== null
                ? raisedConnects
                  ? 'solo-play-target--active'
                  : 'solo-play-target--blocked'
                : ''
            }`}
            data-play-target="pile"
            data-target-active={raisedId !== null ? raisedConnects : undefined}
          >
            {/* Underlay stack: thin navy-edged paper ticket slabs, so the pile
                reads as a stack of stubs rather than colored rectangles. Faint
                navy tint + resting shadow, same rotate/opacity stagger. */}
            {underlays.map((id, i) => (
              <div
                key={id}
                className="absolute inset-0 border border-stub-navy/40 bg-stub-paper"
                style={{
                  borderRadius: 'var(--radius-stub-card)',
                  // faint navy tint (inset) layered over the resting drop-shadow
                  boxShadow: 'inset 0 0 0 100px rgba(31,58,82,.05), var(--shadow-stub-card-resting)',
                  transform: `rotate(${i % 2 === 0 ? -4 : 3}deg)`,
                  opacity: 0.6,
                }}
              />
            ))}
            <motion.div
              layoutId={topId}
              data-card="pile-top"
              data-movie-id={topId}
              onClick={activatePile}
              // One explicit keyboard path avoids Framer's accessible onTap
              // synthesizing a second activation after this handler.
              role="button"
              tabIndex={0}
              aria-pressed={raisedId === null ? faceUp.has(topId) : undefined}
              aria-label={
                raisedId !== null
                  ? `Play ${movieById.get(raisedId)!.title} onto the pile — top card ${topMovie.title}`
                  : `Pile top: ${topMovie.title}, ${topMovie.year} — flip for credits`
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  if (!e.repeat) activatePile()
                }
              }}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: -12, rotate: -1.5 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={reduce ? { duration: MOTION.duration.reduced } : MOTION.spring.raised}
            >
              <StubCard
                movie={topMovie}
                size="pile"
                reveal={{ credits: faceUp.has(topId) }}
                deepCut={!!topMovie.deepCast?.length}
                flipHint
              />
            </motion.div>
          </div>
        </section>

        <AnimatePresence>
          {!connection && status === 'playing' && playLog.length === 0 && (
            <motion.p
              data-first-move-guidance
              className="solo-stage-instruction pointer-events-none absolute inset-x-0 z-10 px-4 text-center font-stub-label text-[12px] font-bold uppercase leading-relaxed tracking-[0.07em] text-stub-navy"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduce ? 0.15 : 0.25 }}
            >
              {raisedId === null
                ? 'First move · choose a hand ticket'
                : raisedConnects
                  ? 'Now tap the glowing pile · or drag the card there'
                  : 'No link yet · flip for credits or choose another ticket'}
            </motion.p>
          )}
        </AnimatePresence>

        {/* SR live mirror (§7·7b a11y): announce each landed connection —
            always mounted, unlike the AnimatePresence banner below. */}
        <div className="sr-only" role="status" aria-live="polite">
          {invalidNotice
            ? 'No valid shared credit. Two-stroke penalty.'
            : connection
              ? `Connected via ${connection.name} (${connection.role})` +
                (connection.comboCount >= 3 ? ` — combo ×${connection.comboCount}` : '')
              : ''}
        </div>

        {/* Connection banner + combo badge */}
        <div className="solo-feedback pointer-events-none absolute inset-x-0 z-40 flex flex-col items-center gap-1.5 px-4">
          <AnimatePresence>
            {invalidNotice && (
              <motion.div
                key={`invalid-${invalidNonce}`}
                data-solo-invalid
                initial={{ opacity: 0, y: reduce ? 0 : 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduce ? MOTION.duration.reduced : MOTION.duration.reveal }}
                className="app-feedback-banner rounded-stub-pill bg-stub-red px-4 py-2 text-center font-stub-ui text-[13px] font-semibold text-stub-paper shadow-stub-card-raised"
              >
                No shared credit · +2
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {connection && !invalidNotice && (
              <motion.div
                key={connection.seq}
                initial={{ opacity: 0, y: reduce ? 0 : 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={reduce ? { duration: MOTION.duration.reduced } : MOTION.spring.settle}
                className="app-feedback-banner rounded-stub-pill bg-stub-navy px-4 py-2 text-center font-stub-ui text-[13px] font-semibold text-stub-cream shadow-stub-card-raised"
              >
                Connected via {connection.name} ({connection.role})
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {connection && connection.comboCount >= 3 && (
              <motion.div
                key={`combo-${connection.seq}`}
                data-combo-badge
                initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.3, rotate: -8 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0 }}
                transition={
                  reduce ? { duration: 0.15 } : { type: 'spring', stiffness: 460, damping: 13 }
                }
                className="rounded-stub-pill bg-stub-amber px-4 py-1.5 font-stub-label text-[12px] font-extrabold uppercase tracking-wider text-stub-navy shadow-stub-glow-amber"
              >
                {surname(connection.name)} ×{connection.comboCount}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tap-elsewhere-to-lower backdrop (under the hand, over the pile) */}
        {raisedId !== null && (
          <div className="absolute inset-0 z-20" onPointerDown={() => setRaisedId(null)} />
        )}

        <p className="solo-hand-label pointer-events-none absolute z-10 hidden font-stub-label text-[12px] font-bold uppercase tracking-[0.14em] text-stub-navy/70">
          Your hand · {hand.length} tickets
        </p>

        <Hand
          cards={hand.map((id) => movieById.get(id)!)}
          raisedId={raisedId}
          faceUp={faceUp}
          invalidNonce={invalidNonce}
          raisedBottom={256}
          onRaise={(id) => {
            if (status !== 'playing') return
            journey.action('select', true)
            setRaisedId(id)
          }}
          onFlip={flipCard}
          onDrop={attemptPlay}
          fanClassName="daily-solo-hand"
          raisedClassName="daily-solo-raised"
          layout="rack"
        />

        {/* Test-only terminal seam. Vite replaces the flag at build time, so
            the normal production bundle removes this branch and marker. */}
        {import.meta.env.VITE_E2E === '1' && (
          <>
            <button
              type="button"
              data-testid="matchcut-e2e-complete"
              className="hidden"
              onClick={() => {
                setHand([])
                setStatus('won')
              }}
            />
            <button
              type="button"
              data-testid="matchcut-e2e-stuck"
              className="hidden"
              onClick={() => setStatus('stuck')}
            />
          </>
        )}

        <AnimatePresence>
          {status !== 'playing' && (
            <Results
              status={status}
              score={score}
              par={puzzle.par}
              flips={flips}
              invalids={invalids}
              comboBonus={comboBonus}
              cardsLeft={hand.length}
              emoji={emoji}
              solution={solutionSteps}
              daily={start.kind === 'daily' ? finishMeta : null}
              practice={start.kind === 'practice'}
              analytics={{ mode: 'solo', kind: start.kind }}
              onReset={resetGame}
              onMenu={onExit}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showRules && (
            <HowToPlay
              context="solo"
              onClose={() => {
                journey.helpClose()
                setShowRules(false)
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
