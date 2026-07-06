import { motion } from 'framer-motion'

// The one-move/idle turn cue (DuelGame.tsx:1540-1553). The 7-condition
// visibility gate (status === 'playerTurn' && !runState && pendingDraw ===
// null && drawChoice === null && !meldSelect && raisedId === null &&
// !gameOver) stays in the PARENT per docs/ui-contracts.md IdleCue "Props
// in" — this component only renders the cue visual given a precomputed
// `visible` boolean, so the six/seven-condition guard isn't duplicated here.
export default function IdleCue({
  visible,
  reduce,
}: {
  visible: boolean
  reduce: boolean
}) {
  if (!visible) return null
  return (
    <div className="pointer-events-none absolute inset-x-0 top-[372px] z-[var(--z-resting)] flex justify-center px-6">
      <motion.span
        // Subtle pulse (Stub: amber accent, JetBrains Mono caps micro-label,
        // <=400ms per README "Motion") — static under prefers-reduced-motion.
        animate={reduce ? undefined : { opacity: [0.7, 1, 0.7] }}
        transition={reduce ? undefined : { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        className="rounded-stub-pill border-2 border-stub-amber bg-stub-navy px-3 py-1 font-stub-label text-[10px] font-bold uppercase tracking-[.1em] text-stub-amber"
      >
        one move — play a card or draw
      </motion.span>
    </div>
  )
}
