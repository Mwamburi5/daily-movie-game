// src/components/ChronoCard.tsx — the Chronology card face + 3D flip.
//
// COPIED (not imported) from CardView in src/components/Card.tsx so Chronology
// stays decoupled from Duel's Movie shape (reuse map: copy the mechanics of the
// Movie-typed components). The flip machinery is identical — rotateY + preserve-3d
// + backfaceVisibility, spring (stiffness 280, damping 24), perspective 1000, and
// the reduced-motion crossfade — but the faces differ: the front shows the TITLE
// with the year hidden; the flip reveals the YEAR. That reveal is the signature
// moment of the mode (design/chronology.md §"Phase 3").
//
// The pool has no posterColor, so the card color is derived from `decade` — a
// decade-banded look that doubles as a coarse reasoning cue.

import { motion, useReducedMotion } from 'framer-motion'
import type { ChronologyCard } from '../lib/chronology.ts'

export type ChronoCardSize = 'hand' | 'raised' | 'line'

const DIMS = {
  hand: { w: 78, h: 110, title: 'text-[12px]', year: 'text-[30px]' },
  raised: { w: 150, h: 210, title: 'text-[19px]', year: 'text-[64px]' },
  line: { w: 64, h: 90, title: 'text-[10px]', year: 'text-[22px]' },
} as const

// Decade -> a deep, white-text-legible band color. A coarse era cue, and it makes
// a filled line read as a colored timeline at a glance.
const DECADE_COLOR: Record<number, string> = {
  1970: '#8a5a2b', // sienna
  1980: '#7d3a8c', // purple
  1990: '#1f6f6b', // teal
  2000: '#2f5d8a', // steel blue
  2010: '#3f4a63', // indigo slate
  2020: '#9a3b3b', // brick red
}

export function decadeColor(decade: number): string {
  return DECADE_COLOR[decade] ?? '#5c5347'
}

interface FaceProps {
  card: ChronologyCard
  size: ChronoCardSize
  // When true the front also prints the year (a settled card on the line, where
  // the truth is already known). Pre-placement hand/raised cards keep it hidden.
  showYear?: boolean
  flat?: boolean
}

function FrontFace({ card, size, showYear, flat }: FaceProps) {
  const d = DIMS[size]
  return (
    <div
      className="absolute inset-0 overflow-hidden rounded-xl shadow-[0_8px_22px_rgba(40,32,18,0.25)]"
      style={{
        background: decadeColor(card.decade),
        backfaceVisibility: flat ? undefined : 'hidden',
        WebkitBackfaceVisibility: flat ? undefined : 'hidden',
      }}
    >
      <div className="flex h-full flex-col p-1.5">
        <div className="flex h-full flex-col rounded-lg p-2 ring-1 ring-inset ring-white/30">
          <span className={`font-extrabold leading-[1.12] text-white ${d.title}`}>
            {card.title}
          </span>
          <span className="mt-auto font-semibold tracking-wide text-white/70 text-[10px]">
            {showYear ? card.year : 'year ?'}
          </span>
        </div>
      </div>
    </div>
  )
}

// The reveal face: the year, big. Shown by the flip on a misfire (and used as the
// face-up state on the raised card while it self-corrects).
function BackFace({ card, size, flat }: FaceProps) {
  const d = DIMS[size]
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden rounded-xl bg-[#fcf9f2] p-2 text-center shadow-[0_8px_22px_rgba(40,32,18,0.25)]"
      style={{
        transform: flat ? undefined : 'rotateY(180deg)',
        backfaceVisibility: flat ? undefined : 'hidden',
        WebkitBackfaceVisibility: flat ? undefined : 'hidden',
        borderTop: `5px solid ${decadeColor(card.decade)}`,
      }}
    >
      <span className={`font-serif font-black tabular-nums text-[#23211c] ${d.year}`}>
        {card.year}
      </span>
      <span className="mt-1 line-clamp-3 px-1 text-[10px] font-semibold leading-tight text-[#8a8270]">
        {card.title}
      </span>
    </div>
  )
}

export function ChronoCardView({
  card,
  faceUp,
  size,
  showYear = false,
}: {
  card: ChronologyCard
  faceUp: boolean
  size: ChronoCardSize
  showYear?: boolean
}) {
  const reduce = useReducedMotion()
  const d = DIMS[size]

  // Reduced motion: crossfade the faces instead of a 3D spin (same fallback as
  // CardView).
  if (reduce) {
    return (
      <div className="relative" style={{ width: d.w, height: d.h }}>
        <motion.div
          className="absolute inset-0"
          initial={false}
          animate={{ opacity: faceUp ? 0 : 1 }}
          transition={{ duration: 0.15 }}
        >
          <FrontFace card={card} size={size} showYear={showYear} flat />
        </motion.div>
        <motion.div
          className="absolute inset-0"
          initial={false}
          animate={{ opacity: faceUp ? 1 : 0 }}
          transition={{ duration: 0.15 }}
        >
          <BackFace card={card} size={size} flat />
        </motion.div>
      </div>
    )
  }

  return (
    <div className="relative" style={{ width: d.w, height: d.h, perspective: 1000 }}>
      <motion.div
        className="relative h-full w-full"
        style={{ transformStyle: 'preserve-3d' }}
        initial={false}
        animate={{ rotateY: faceUp ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
      >
        <FrontFace card={card} size={size} showYear={showYear} />
        <BackFace card={card} size={size} />
      </motion.div>
    </div>
  )
}
