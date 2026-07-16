import { useEffect, useRef, useState } from 'react'
import { motion, useAnimationControls, useReducedMotion } from 'framer-motion'
import type { Movie } from '../data/types.ts'
import StubCard from './StubCard.tsx'

const CARD_W = 96

// The hand wears the Stub ticket frame. Every card renders as a StubCard —
// including wilds, which StubCard now paints as its own amber-accented wild
// ticket (W3; the legacy gold WildFace/CardView is retired here).
// This game's flip is inverted vs "face up": the resting hand shows the ticket
// FRONT with credits hidden, and FLIP toggles the credit ledger. So StubCard's
// faceUp stays true and the flip maps to reveal.credits — the peek mechanic is
// preserved exactly (no rule change); only the 3D spin becomes an inline reveal.
function HandCardFace({
  movie,
  credits,
  size,
  hint = false,
  hintLabel,
}: {
  movie: Movie
  credits: boolean
  size: 'hand' | 'raised'
  // The hinted fan card delegates the teal frame + "HINT · PACINO" pill to StubCard
  // (README treatment); Hand keeps its own animated pulse on top as the motion layer.
  hint?: boolean
  hintLabel?: string
}) {
  return (
    <StubCard
      movie={movie}
      size={size}
      reveal={{ credits }}
      deepCut={!!movie.deepCast?.length}
      hint={hint}
      hintLabel={hintLabel}
      // The raised card really flips on tap (plus its ⇄ button); fan cards
      // don't (tap raises), and StubCard ignores the hint at hand size anyway.
      flipHint={size === 'raised'}
    />
  )
}

interface HandProps {
  cards: Movie[]
  raisedId: string | null
  // Hint target: this fan card pulses to flag a legal play (easy modes)
  hintId?: string | null
  // Label for the hint pill above the hinted card, e.g. "HINT · PACINO" — the
  // shared person is computed by the parent (hintCard returns an id only).
  hintLabel?: string
  faceUp: ReadonlySet<string>
  invalidNonce: number
  raisedBottom?: number
  // Meld selection mode: taps toggle membership instead of raising
  selectMode?: boolean
  selectedIds?: ReadonlySet<string>
  onToggleSelect?: (id: string) => void
  onRaise: (id: string) => void
  onFlip: (id: string) => void
  onDrop: (id: string, point: { x: number; y: number }) => void
  // Long-press a fan card then slide it to a new slot — manual hand ordering
  onReorder?: (id: string, toIndex: number) => void
}

export default function Hand({
  cards,
  raisedId,
  hintId,
  hintLabel,
  faceUp,
  invalidNonce,
  raisedBottom = 238,
  selectMode = false,
  selectedIds,
  onToggleSelect,
  onRaise,
  onFlip,
  onDrop,
  onReorder,
}: HandProps) {
  const reduce = useReducedMotion()
  const spring = reduce
    ? ({ duration: 0.15 } as const)
    : ({ type: 'spring', stiffness: 380, damping: 30 } as const)
  const n = cards.length
  // Fan tightens as the hand grows (duel draws can exceed 7 cards). Width 372
  // (was 360) + cap 47: at 7 cards each covered card's visible sliver gains
  // ~2px of title — part of the C4 readability pass (feedback batch 1); still
  // clears the 375px viewport with margin at the outer cards' tilt.
  const spacing = Math.min(47, (372 - CARD_W) / Math.max(n - 1, 1))
  const raised = cards.find((c) => c.id === raisedId)

  // ── Long-press drag-to-reorder ───────────────────────────────────────────
  // Tap still raises (or toggles in select mode); a ~280ms press "grabs" a card
  // so a horizontal slide can re-slot it. Off during meld selection. The resting
  // animate below stays identical to the no-reorder version — grab only swaps
  // which target a card animates toward, never how the fan is laid out.
  const fanRef = useRef<HTMLDivElement>(null)
  const [grabbedId, setGrabbedId] = useState<string | null>(null)
  const [grabX, setGrabX] = useState(0)
  const grabCenter = useRef(0) // fan centre in screen px, captured when a grab starts
  const pressTimer = useRef<number | undefined>(undefined)
  const downAt = useRef<{ x: number; id: string } | null>(null)
  const didGrab = useRef(false) // suppresses the tap that would fire after a grab
  const reorderable = !!onReorder && !selectMode

  const clearPress = () => {
    window.clearTimeout(pressTimer.current)
    pressTimer.current = undefined
  }
  // Screen x → nearest fan slot index
  const indexFromX = (x: number) => {
    const slot = (x - grabCenter.current) / spacing + (n - 1) / 2
    return Math.max(0, Math.min(n - 1, Math.round(slot)))
  }
  const startPress = (x: number, id: string) => {
    downAt.current = { x, id }
    didGrab.current = false
    if (!reorderable) return
    pressTimer.current = window.setTimeout(() => {
      const rect = fanRef.current?.getBoundingClientRect()
      grabCenter.current = rect ? rect.left + rect.width / 2 : x
      setGrabX(x)
      setGrabbedId(id)
      didGrab.current = true
    }, 280)
  }
  const movePress = (x: number, id: string) => {
    if (grabbedId === id) {
      setGrabX(x)
      const to = indexFromX(x)
      const from = cards.findIndex((c) => c.id === id)
      if (to !== from) onReorder?.(id, to)
      return
    }
    // A real slide before the hold lands isn't a long-press — drop the timer
    if (downAt.current && Math.abs(x - downAt.current.x) > 8) clearPress()
  }
  const upPress = (id: string) => {
    clearPress()
    const wasGrab = grabbedId === id
    if (wasGrab) setGrabbedId(null)
    downAt.current = null
    if (!wasGrab && !didGrab.current) {
      if (selectMode) onToggleSelect?.(id)
      else onRaise(id)
    }
  }
  const cancelPress = (id: string) => {
    clearPress()
    if (grabbedId === id) setGrabbedId(null)
    downAt.current = null
  }
  useEffect(() => () => clearPress(), [])

  return (
    <>
      {/* Raised card slot — only the raised card is draggable/playable */}
      <div
        className="pointer-events-none absolute inset-x-0 z-50 flex justify-center"
        style={{ bottom: raisedBottom }}
      >
        {raised && (
          <RaisedCard
            key={raised.id}
            movie={raised}
            faceUp={faceUp.has(raised.id)}
            invalidNonce={invalidNonce}
            reduce={!!reduce}
            onFlip={onFlip}
            onDrop={onDrop}
          />
        )}
      </div>

      {/* Fan — raised card keeps its slot as a gap until played or lowered */}
      <div
        ref={fanRef}
        className="absolute inset-x-0 bottom-0 z-30 h-[225px]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {cards.map((m, i) => {
          if (m.id === raisedId) return null
          const off = i - (n - 1) / 2
          const selected = selectMode && !!selectedIds?.has(m.id)
          const hinted = m.id === hintId
          const grabbed = m.id === grabbedId
          const lift = selected ? 26 : hinted ? 22 : 0
          return (
            <motion.div
              key={m.id}
              layoutId={m.id}
              data-card={m.id}
              className="absolute left-1/2 top-6"
              style={{
                marginLeft: -CARD_W / 2,
                zIndex: grabbed ? 60 : hinted ? 40 : 10 + i,
                touchAction: 'none',
              }}
              animate={
                grabbed
                  ? { x: grabX - grabCenter.current, y: -48 }
                  : { x: off * spacing, y: Math.abs(off) ** 1.7 * 5 - lift }
              }
              transition={grabbed ? { type: 'spring', stiffness: 700, damping: 42 } : spring}
              onPointerDown={(e) => {
                if (reorderable) {
                  try {
                    e.currentTarget.setPointerCapture(e.pointerId)
                  } catch {
                    /* capture unsupported — tap/drag still work */
                  }
                }
                startPress(e.clientX, m.id)
              }}
              onPointerMove={(e) => movePress(e.clientX, m.id)}
              onPointerUp={() => upPress(m.id)}
              onPointerCancel={() => cancelPress(m.id)}
            >
              <motion.div
                // Tilt 3.5°/slot (was 5): the flatter fan keeps neighboring
                // title bands parallel enough to scan (C4 readability pass).
                animate={{ rotate: grabbed ? 0 : off * 3.5, scale: grabbed ? 1.06 : 1 }}
                transition={spring}
                className="relative"
              >
                <HandCardFace
                  movie={m}
                  credits={faceUp.has(m.id)}
                  size="hand"
                  hint={hinted}
                  hintLabel={hinted ? hintLabel : undefined}
                />
                {selected && (
                  <div className="pointer-events-none absolute inset-0 rounded-xl ring-4 ring-stub-amber/80" />
                )}
                {hinted && !reduce && (
                  <motion.div
                    data-hint-pulse
                    className="pointer-events-none absolute -inset-1 rounded-xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.2, 1, 0.4, 1, 0.6] }}
                    transition={{ duration: 2.4, times: [0, 0.2, 0.5, 0.7, 1] }}
                    style={{ boxShadow: '0 0 0 3px rgba(44,137,161,0.9), 0 0 18px 5px rgba(44,137,161,0.5)' }}
                  />
                )}
                {hinted && reduce && (
                  <div
                    data-hint-pulse
                    className="pointer-events-none absolute inset-0 rounded-xl ring-4 ring-stub-teal"
                  />
                )}
              </motion.div>
            </motion.div>
          )
        })}
      </div>
    </>
  )
}

function RaisedCard({
  movie,
  faceUp,
  invalidNonce,
  reduce,
  onFlip,
  onDrop,
}: {
  movie: Movie
  faceUp: boolean
  invalidNonce: number
  reduce: boolean
  onFlip: (id: string) => void
  onDrop: (id: string, point: { x: number; y: number }) => void
}) {
  const controls = useAnimationControls()
  const firstRender = useRef(true)

  // Damped horizontal shake on invalid play (opacity pulse if reduced motion)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    controls.start(
      reduce
        ? { opacity: [1, 0.35, 1], transition: { duration: 0.3 } }
        : { x: [0, -16, 13, -9, 6, -3, 0], transition: { duration: 0.45 } },
    )
  }, [invalidNonce, controls, reduce])

  return (
    <motion.div
      layoutId={movie.id}
      data-card={`raised-${movie.id}`}
      className="pointer-events-auto relative"
      style={{ touchAction: 'none', zIndex: 60 }}
      drag
      dragSnapToOrigin
      dragMomentum={false}
      dragElastic={0.7}
      whileDrag={{ scale: 1.04 }}
      transition={
        reduce ? { duration: 0.15 } : { type: 'spring', stiffness: 380, damping: 30 }
      }
      onTap={() => onFlip(movie.id)}
      onDragEnd={(_, info) => onDrop(movie.id, info.point)}
    >
      <motion.div animate={controls}>
        <HandCardFace movie={movie} credits={faceUp} size="raised" />
      </motion.div>
      <button
        type="button"
        aria-label="Flip card"
        className="absolute -bottom-3 -right-3 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-[#23211c] text-lg text-[#f4efe6] shadow-lg active:scale-95"
        onPointerDownCapture={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation()
          onFlip(movie.id)
        }}
      >
        ⇄
      </button>
    </motion.div>
  )
}
