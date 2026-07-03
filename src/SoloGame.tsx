import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { MOVIES, movieById } from './data/movies.ts'
import { PUZZLE } from './data/puzzle.ts'
import { dailySoloPuzzle, localDateSeed } from './lib/daily.ts'
import { hasAnyPlay, isSolvable, sharedPeople, type Role } from './lib/solver.ts'
import { CardView } from './components/Card.tsx'
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
  // The puzzle is fixed for the life of the mount: today's generated daily, or
  // the designed practice hand. Restart replays the same board.
  const puzzle = useMemo(
    () => (start.kind === 'daily' ? dailySoloPuzzle(localDateSeed(), MOVIES) : PUZZLE),
    [start.kind],
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
  const pileZoneRef = useRef<HTMLDivElement>(null)
  const lowerTimer = useRef<number | undefined>(undefined)

  const flips = flippedEver.size + invalids * 2
  const score = flips - comboBonus

  const topId = pile[pile.length - 1]
  const topMovie = movieById.get(topId)!
  const underlays = pile.slice(0, -1).slice(-2)

  // One winning order from the starter, for the stuck screen reveal.
  const solution = useMemo(() => isSolvable(puzzle, MOVIES) ?? [], [puzzle])
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

  return (
    <div className="h-full overflow-hidden">
      <div className="relative mx-auto h-full w-full max-w-[420px]">
        <header className="flex items-center justify-between px-3 pb-1 pt-4">
          <div className="flex items-center">
            <button
              type="button"
              aria-label="Back to menu"
              onClick={onExit}
              className="flex h-11 w-9 items-center justify-center text-2xl text-[#7d7563] active:scale-90"
            >
              ‹
            </button>
            <span className="font-serif text-lg font-black italic tracking-tight">
              {start.kind === 'daily' ? 'Daily' : 'Practice'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="text-[12px] font-medium tabular-nums text-[#7d7563]">
              Flips {flips} · Score {score} · Par {puzzle.par}
            </div>
            <button
              type="button"
              aria-label="How to play"
              data-rules-open
              onClick={() => setShowRules(true)}
              className="flex h-11 w-8 items-center justify-center text-[13px] font-extrabold text-[#7d7563] active:scale-90"
            >
              ?
            </button>
            <button
              type="button"
              aria-label="Restart game"
              onClick={resetGame}
              className="flex h-11 w-11 items-center justify-center rounded-full text-xl text-[#7d7563] active:scale-90 active:text-[#23211c]"
            >
              ↺
            </button>
          </div>
        </header>

        {/* Discard pile */}
        <section className="absolute inset-x-0 top-16 z-10 flex justify-center">
          <div ref={pileZoneRef} className="relative">
            {underlays.map((id, i) => (
              <div
                key={id}
                className="absolute inset-0 rounded-xl"
                style={{
                  background: movieById.get(id)!.posterColor,
                  transform: `rotate(${i % 2 === 0 ? -4 : 3}deg)`,
                  opacity: 0.45,
                }}
              />
            ))}
            <motion.div layoutId={topId} data-card="pile-top" onTap={() => flipCard(topId)}>
              <CardView movie={topMovie} faceUp={faceUp.has(topId)} size="pile" />
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
                className="rounded-full bg-[#23211c] px-4 py-2 text-center text-[13px] font-semibold text-[#f4efe6] shadow-md"
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
                className="rounded-full bg-[#b3541e] px-4 py-1.5 text-[12px] font-extrabold uppercase tracking-wider text-white shadow-md"
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
              onReset={resetGame}
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
