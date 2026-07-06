// ScoreRace — the race-to-20 header score visualization (The Stub, screens 7a
// default / 7e compact). Presentational only: it receives every value via props
// and owns no game state. The one exception is an internal *display* value for
// each score so we can tick the numerals up independently of the instant prop
// change — that's animation state, not game state.
//
// Contract: docs/ui-contracts.md § ScoreRace (FROZEN). Props/types below mirror
// that section exactly; `compact?` is the one orchestrator-approved extension
// for the 7e small-phone variant.
import { useEffect, useRef, useState } from 'react'
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  type MotionValue,
} from 'framer-motion'

// DuelStatus / RunState are structurally identical to their DuelGame.tsx
// definitions (DuelGame.tsx:82, :101). Redeclared here so the component stays
// self-contained (a presentational component must not import from the 1,300-line
// game container). If the game's shapes change, these mirror them by contract.
type DuelStatus = 'playerTurn' | 'cpuTurn' | 'recastOffer' | 'over'
interface RunState {
  people: string[]
  count: number
  pileIdx: number
}

export interface ScoreRaceProps {
  /** Player's live score (useState in DuelGame; mutated in ~9 places). */
  playerScore: number
  /** CPU's live score, mutated symmetrically. */
  cpuScore: number
  /** Drives which side reads as "active" and the centered turn caption. */
  status: DuelStatus
  /** When non-null on the player's turn, the caption reads `Run ×N?`. */
  runState: RunState | null
  /** Derived (`status === 'over'`); gates the "show ends at…" hint. */
  gameOver: boolean
  /** Imported constant from lib/duel.ts (race-to-20). The bar is a tug-of-war
   *  across a single track, so each side's share is score / (playerScore +
   *  cpuScore) — TARGET_SCORE sets the "SHOW ENDS AT N" hint, not the fill. */
  TARGET_SCORE: number
  /** 7e small-phone variant: one inline row, scores at each end, no labels. */
  compact?: boolean
}

// Count-up numeral. Framer's animated MotionValue can't render directly as text,
// so we bridge it to React state and round. Reduced-motion callers get an
// instant crossfade instead of travel (the parent already passes the timing
// down via `reduce`), so here we simply snap the display value with no spring.
function useCountUp(target: number, reduce: boolean): number {
  const mv = useMotionValue(target)
  // Spring, not tween: matches the header's snappy feel; capped well under the
  // 400ms interaction budget from the token sheet (stiffness/damping tuned so a
  // typical +1…+8 delta settles in ~250–350ms).
  const spring = useSpring(mv, { stiffness: 260, damping: 26 })
  const source: MotionValue<number> = reduce ? mv : spring
  const [display, setDisplay] = useState(target)

  useEffect(() => {
    mv.set(target)
  }, [mv, target])

  useEffect(() => {
    if (reduce) {
      // No travel under reduced motion — snap and let the wrapper crossfade.
      setDisplay(target)
      return
    }
    const unsub = source.on('change', (v) => setDisplay(Math.round(v)))
    return unsub
  }, [source, reduce, target])

  return display
}

// The shared tug-of-war fill. `share` is 0–1; width animates 500ms ease-out
// (var(--dur-race)) on score change per the token sheet. Under reduced motion
// the width still needs to reflect the new score, but without the travel beat —
// so we drop the transition to a 150ms crossfade-equivalent snap.
function RaceFill({ share, reduce }: { share: number; reduce: boolean }) {
  return (
    <motion.div
      className="h-full bg-stub-amber"
      // Percentage width so the amber grows left→right and the navy-mid
      // remainder fills behind it (single track, not two flex children — a lone
      // absolutely-tracked fill keeps the animation to one property).
      initial={false}
      animate={{ width: `${Math.round(share * 100)}%` }}
      transition={
        reduce
          ? { duration: 0.15 } // reduced-motion: crossfade-length snap, no ease-out travel
          : { duration: 0.5, ease: 'easeOut' } // var(--dur-race): 500ms ease-out
      }
    />
  )
}

export default function ScoreRace({
  playerScore,
  cpuScore,
  status,
  runState,
  gameOver,
  TARGET_SCORE,
  compact = false,
}: ScoreRaceProps) {
  const reduce = useReducedMotion() ?? false

  const youDisplay = useCountUp(playerScore, reduce)
  const tazDisplay = useCountUp(cpuScore, reduce)

  // Tug-of-war share: player's slice of the combined track. At 0–0 the bar sits
  // centered (both at half) so the empty state doesn't collapse to one side.
  const total = playerScore + cpuScore
  const playerShare = total === 0 ? 0.5 : playerScore / total

  // The caption is NOT the separate turn pill — it's the mid-header context line
  // the contract keys off `status` + `runState`. A run offer takes priority on
  // the player's turn.
  const caption =
    status === 'playerTurn'
      ? runState
        ? `Run ×${runState.count + 1}?`
        : 'Your turn'
      : status === 'cpuTurn' || status === 'recastOffer'
        ? "Taz's turn"
        : ''

  // === 7e compact: one inline row, 17px Domine scores at each end, no labels ===
  if (compact) {
    return (
      <div
        className="flex flex-1 items-center gap-2"
        data-score={`${playerScore}-${cpuScore}`}
        data-turn={status}
      >
        <ScoreNumeral value={youDisplay} className="text-[17px] text-stub-cream" reduce={reduce} />
        <div className="flex h-2 flex-1 overflow-hidden rounded-stub-pill border border-stub-cream/45">
          <RaceFill share={playerShare} reduce={reduce} />
          <div className="h-full flex-1 bg-stub-navy-mid" />
        </div>
        <ScoreNumeral value={tazDisplay} className="text-[17px] text-stub-slate-faint" reduce={reduce} />
      </div>
    )
  }

  // === 7a default: two-row block — scores + labels + centered caption, then bar ===
  return (
    <div data-score={`${playerScore}-${cpuScore}`} data-turn={status}>
      <div className="relative mt-3 flex items-end justify-between">
        {/* YOU: 40px Domine cream + amber mono label */}
        <div className="flex items-baseline gap-2">
          <ScoreNumeral value={youDisplay} className="text-[40px] text-stub-cream" reduce={reduce} />
          <span className="font-stub-label text-[9px] font-semibold uppercase tracking-[0.16em] text-stub-amber">
            YOU
          </span>
        </div>

        {/* Centered turn caption (the amber turn pill proper is a separate zone;
            this is the status/run context line the contract owns). Hidden once
            the game is over so no stale "your turn" lingers on the recap. */}
        {caption && !gameOver && (
          <span className="mb-1 rounded-stub-pill bg-stub-amber px-3.5 py-1.5 font-stub-label text-[8.5px] font-bold uppercase tracking-[0.12em] text-stub-navy">
            {caption}
          </span>
        )}

        {/* TAZ: muted label + 40px slate-faint score */}
        <div className="flex items-baseline gap-2">
          <span className="font-stub-label text-[9px] font-semibold uppercase tracking-[0.16em] text-stub-slate-light">
            TAZ
          </span>
          <ScoreNumeral value={tazDisplay} className="text-[40px] text-stub-slate-faint" reduce={reduce} />
        </div>
      </div>

      {/* Race bar: 10px tall, 999px radius, 1px cream-at-45% border, one shared
          tug-of-war track — amber fill grows left→right, remainder navy-mid. */}
      <div className="relative mt-3 flex h-2.5 overflow-hidden rounded-stub-pill border border-stub-cream/45">
        <RaceFill share={playerShare} reduce={reduce} />
        <div className="h-full flex-1 bg-stub-navy-mid" />
      </div>

      {/* "SHOW ENDS AT N" hint — hidden once gameOver per contract. Lives here so
          the header block carries its own target caption. */}
      {!gameOver && (
        <span
          className="mt-1 block font-stub-label text-[9px] font-semibold uppercase tracking-[0.14em] text-stub-amber"
          data-target-hint
        >
          Show ends at {TARGET_SCORE}
        </span>
      )}
    </div>
  )
}

// Domine display numeral with tabular-nums (scores must not reflow width as they
// tick). The reduced-motion path swaps the count-up travel for a 150ms opacity
// crossfade on value change — no numeric travel, matching the token sheet.
function ScoreNumeral({
  value,
  className,
  reduce,
}: {
  value: number
  className: string
  reduce: boolean
}) {
  const prev = useRef(value)
  const changed = prev.current !== value
  prev.current = value

  if (reduce) {
    return (
      <motion.span
        key={value} // remount on change so the crossfade retriggers even for equal-looking frames
        initial={changed ? { opacity: 0.4 } : false}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }} // var(--dur-reduced)
        className={`font-stub-display font-bold leading-[0.9] tabular-nums ${className}`}
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {value}
      </motion.span>
    )
  }

  return (
    <span
      className={`font-stub-display font-bold leading-[0.9] tabular-nums ${className}`}
      style={{ fontVariantNumeric: 'tabular-nums' }}
    >
      {value}
    </span>
  )
}
