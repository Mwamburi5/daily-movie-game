import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { movieById } from './data/movies.ts'
import { DUEL_POOL } from './data/duelPool.ts'
import { PUZZLE } from './data/puzzle.ts'
import { dailySoloPuzzle, localDateSeed } from './lib/daily.ts'
import { hasAnyPlay, isSolvable, sharedPeople, type Role } from './lib/solver.ts'
import { recordDailyFinish, type DailyFinish } from './lib/progress.ts'
import { track } from './lib/analytics.ts'
import StubCard from './components/StubCard.tsx'
import Hand from './components/Hand.tsx'
import HowToPlay from './components/HowToPlay.tsx'
import Results from './components/Results.tsx'

// How a round was started (chosen at the menu, App.tsx), mirroring Chronology's
// ChronoStart. The DAILY is a date-seeded generated deal — solver-guaranteed
// solvable, par priced from the solver's best line — identical for everyone on
// the same local calendar day. PRACTICE is the original hand-designed puzzle
// (marquee-001), kept as a fixed warm-up.
export type SoloStart = { kind: 'daily' } | { kind: 'practice' }

type Status = 'playing' | 'won' | 'stuck'

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
  // Today's seed, fixed at mount (same pattern as Chronology's dailySeed ref) —
  // the deal and the streak record must key off the SAME seed even if midnight
  // passes mid-game.
  const dailySeed = useRef(localDateSeed()).current
  // The puzzle is fixed for the life of the mount: today's generated daily, or
  // the designed practice hand. Restart replays the same board.
  const puzzle = useMemo(
    () => (start.kind === 'daily' ? dailySoloPuzzle(dailySeed, DUEL_POOL) : PUZZLE),
    [start.kind, dailySeed],
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
  const [status, setStatus] = useState<Status>('playing')
  const [showRules, setShowRules] = useState(false)
  // Streak/best readout for the end screen — set by the finish effect below.
  // Meta-state only; nothing gameplay-side reads it (persistence guardrail).
  const [finishMeta, setFinishMeta] = useState<DailyFinish | null>(null)
  const pileZoneRef = useRef<HTMLDivElement>(null)
  const lowerTimer = useRef<number | undefined>(undefined)

  const flips = flippedEver.size + invalids * 2
  const score = flips - comboBonus

  const topId = pile[pile.length - 1]
  const topMovie = movieById.get(topId)!
  const underlays = pile.slice(0, -1).slice(-2)

  // One winning order from the starter, for the stuck screen reveal.
  const solution = useMemo(() => isSolvable(puzzle, DUEL_POOL) ?? [], [puzzle])
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
    if (!faceUp.has(id) && !flippedEver.has(id)) {
      setFlippedEver((prev) => new Set(prev).add(id))
    }
    setFaceUp((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

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

    const card = movieById.get(id)!
    const shared = sharedPeople(topMovie, card)

    if (shared.length === 0) {
      setInvalids((n) => n + 1) // +2 on the flip counter
      setInvalidNonce((n) => n + 1) // trigger shake
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

  const resetGame = () => {
    window.clearTimeout(lowerTimer.current)
    setHand(puzzle.handMovieIds)
    setPile([puzzle.starterMovieId])
    setFaceUp(new Set())
    setFlippedEver(new Set())
    setInvalids(0)
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

  useEffect(() => {
    track('mode_start', { mode: 'solo', kind: start.kind })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Reaching the end screen (won OR stuck) completes the daily. The streak
  // record is once-per-seed inside recordDailyFinish, so a same-day replay via
  // "Play again" just reads back the existing entry (repeat: true). Practice
  // never records — the daily streak is the daily's.
  useEffect(() => {
    if (status === 'playing') return
    track('mode_finish', { mode: 'solo', kind: start.kind })
    if (start.kind !== 'daily') return
    setFinishMeta(recordDailyFinish('solo', dailySeed, status === 'won' ? score : null))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  return (
    <div
      className="h-full overflow-hidden bg-stub-cream"
      style={{
        backgroundImage: 'radial-gradient(rgba(31,58,82,.06) 1px, transparent 1.2px)',
        backgroundSize: '7px 7px',
      }}
    >
      <div className="relative mx-auto h-full w-full max-w-[420px]">
        <header className="flex items-center justify-between rounded-b-stub-header bg-stub-navy px-3 pb-3 pt-4">
          <div className="flex items-center">
            <button
              type="button"
              aria-label="Back to menu"
              onClick={onExit}
              className="flex h-11 w-9 items-center justify-center text-2xl text-stub-cream/80 active:scale-90"
            >
              ‹
            </button>
            <span className="font-stub-display text-lg font-bold tracking-tight text-stub-cream">
              {start.kind === 'daily' ? 'Daily' : 'Practice'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="font-stub-label text-[11px] font-semibold uppercase tracking-wider tabular-nums text-stub-slate-light">
              Flips {flips} · Score {score} · Par {puzzle.par}
            </div>
            <button
              type="button"
              aria-label="How to play"
              data-rules-open
              onClick={() => setShowRules(true)}
              className="flex h-7 w-7 items-center justify-center rounded-stub-pill text-[12px] font-extrabold text-stub-cream/80 ring-1 ring-inset ring-stub-slate-light/50 active:scale-90"
            >
              ?
            </button>
            <button
              type="button"
              aria-label="Restart game"
              onClick={resetGame}
              className="flex h-9 w-9 items-center justify-center rounded-stub-pill text-xl text-stub-cream/80 active:scale-90 active:text-stub-amber"
            >
              ↺
            </button>
          </div>
        </header>

        {/* Discard pile */}
        <section className="absolute inset-x-0 top-16 z-10 flex justify-center">
          <div ref={pileZoneRef} className="relative">
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
            <motion.div layoutId={topId} data-card="pile-top" onTap={() => flipCard(topId)}>
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

        {/* Connection banner + combo badge */}
        <div className="pointer-events-none absolute inset-x-0 top-[306px] z-40 flex flex-col items-center gap-1.5 px-4">
          <AnimatePresence>
            {connection && (
              <motion.div
                key={connection.seq}
                initial={{ opacity: 0, y: reduce ? 0 : 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={reduce ? { duration: 0.15 } : { type: 'spring', stiffness: 320, damping: 24 }}
                className="rounded-stub-pill bg-stub-navy px-4 py-2 text-center font-stub-ui text-[13px] font-semibold text-stub-cream shadow-stub-card-raised"
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

        <Hand
          cards={hand.map((id) => movieById.get(id)!)}
          raisedId={raisedId}
          faceUp={faceUp}
          invalidNonce={invalidNonce}
          onRaise={(id) => status === 'playing' && setRaisedId(id)}
          onFlip={flipCard}
          onDrop={attemptPlay}
        />

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
              onReset={resetGame}
              onMenu={onExit}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showRules && <HowToPlay onClose={() => setShowRules(false)} />}
        </AnimatePresence>
      </div>
    </div>
  )
}
