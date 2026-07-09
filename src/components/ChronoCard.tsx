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
// "The Stub" restyle: the faces now wear the ticket look — cream/paper body,
// 2px navy border, a genre-style left EDGE ACCENT + diamond pip driven by the
// card's DECADE (Chronology's spine equivalent, since the pool has no genre),
// Domine title in navy, and the reveal year set BIG in Domine tabular-nums.
// ChronoCard cannot import StubCard (different card type — ChronologyCard has no
// cast/director/genre), so it echoes the frame anatomy rather than reusing it.
//
// STRUCTURAL RULE (load-bearing): pre-placement the front prints "year ?" and the
// year is OMITTED from the DOM entirely — no-year-leak is the whole point of the
// mode. `showYear` gates the front; the BackFace year only mounts on the flip.

import { motion, useReducedMotion } from 'framer-motion'
import type { ChronologyCard } from '../lib/chronology.ts'

export type ChronoCardSize = 'hand' | 'raised' | 'line'

// Per-size internal scale. `edge` = the cream/decade accent rail on the left; the
// diamond pip sizes off it. Kept width-relative to StubCard's proportions so the
// two card systems read as one family across modes.
// titleBasePx/titleFloorPx feed the adaptive fit (NAME IS THE HERO ride-along,
// Buri 2026-07-08): the front title shrinks so proper-noun single words never
// break mid-glyph — the same class of bug the StubCard redesign fixed. The big
// reveal YEAR stays the hero (Chronology's whole point), untouched.
const DIMS = {
  hand: { w: 78, h: 110, titleBasePx: 12, titleFloorPx: 5, year: 'text-[30px]', pad: 6, edge: 9, radius: '11px', border: 2 },
  raised: { w: 150, h: 210, titleBasePx: 19, titleFloorPx: 10, year: 'text-[64px]', pad: 11, edge: 16, radius: 'var(--radius-stub-panel)', border: 2.5 },
  line: { w: 64, h: 90, titleBasePx: 10, titleFloorPx: 4, year: 'text-[22px]', pad: 5, edge: 7, radius: 'var(--radius-stub-card)', border: 2 },
} as const

// Adaptive title fit — mirrors StubCard.titleFit (kept local: ChronoCard is
// deliberately decoupled from StubCard, see file header). Shrink so the longest
// word fits the box width and the whole title fits `maxLines`; Domine caps ≈
// 0.73px advance per char per font-px. break-word stays as the backstop.
const CHRONO_CAPS_ADVANCE = 0.82 // widest Domine caps ≈ 0.80/char/px + margin (matches StubCard)
function fitTitlePx(title: string, boxW: number, basePx: number, floorPx: number): number {
  const words = title.split(/\s+/).filter(Boolean)
  const longestLen = words.reduce((a, w) => Math.max(a, w.length), 1)
  const totalLen = title.replace(/\s+/g, ' ').trim().length || 1
  const widthCap = boxW / (CHRONO_CAPS_ADVANCE * longestLen)
  const lineCap = (boxW * 3) / (CHRONO_CAPS_ADVANCE * totalLen) // up to 3 lines
  return Math.max(floorPx, Math.min(basePx, widthCap, lineCap))
}

// Decade -> a saturated accent, used as the ticket's left EDGE + diamond pip (not
// a full body fill — the Stub body is always paper). A coarse era cue, and it
// still makes a filled line read as a colored timeline at a glance. The hues are
// nudged toward the Stub navy/plum/slate family so the accents sit on-brand.
const DECADE_COLOR: Record<number, string> = {
  1970: '#8a5a2b', // sienna
  1980: '#7d3a8c', // purple
  1990: '#1f6f6b', // teal-green
  2000: '#2f5d8a', // steel blue
  2010: '#3f4a63', // indigo slate
  2020: '#9a3b3b', // brick red
}

export function decadeColor(decade: number): string {
  return DECADE_COLOR[decade] ?? 'var(--color-stub-slate)'
}

interface FaceProps {
  card: ChronologyCard
  size: ChronoCardSize
  // When true the front also prints the year (a settled card on the line, where
  // the truth is already known). Pre-placement hand/raised cards keep it hidden.
  showYear?: boolean
  flat?: boolean
}

// The Stub-style decade rail: a cream column at the card's left edge holding a
// decade-colored diamond pip up top and a decade-colored inset bar below — the
// Chronology analog of StubCard's genre spine. Legible down to the 64px line size.
function EdgeRail({ accent, size }: { accent: string; size: ChronoCardSize }) {
  const d = DIMS[size]
  const pip = Math.max(4, d.edge - 3)
  return (
    <div
      className="relative flex flex-none flex-col items-center"
      style={{ width: d.edge, background: 'var(--color-stub-cream)', paddingBlock: d.pad * 0.5 }}
    >
      <div
        className="flex-none"
        style={{ width: pip, height: pip, background: accent, transform: 'rotate(45deg)' }}
      />
      <div
        className="flex-1"
        style={{ width: Math.max(3, d.edge - 4), marginBlock: d.pad * 0.5, background: accent, borderRadius: 999 }}
      />
    </div>
  )
}

function FrontFace({ card, size, showYear, flat }: FaceProps) {
  const d = DIMS[size]
  const accent = decadeColor(card.decade)
  // Title box = card − edge rail − 3px perf − the body's left/right padding
  // − a 4px safety buffer (the measured render width runs a touch under the raw
  // arithmetic; the buffer keeps the longest word inside the real box).
  const titleBoxW = Math.max(1, d.w - d.edge - 3 - d.pad * 0.6 - d.pad - 4)
  const titlePx = fitTitlePx(card.title, titleBoxW, d.titleBasePx, d.titleFloorPx)
  return (
    <div
      className="absolute inset-0 box-border flex overflow-hidden border-solid"
      style={{
        background: 'var(--color-stub-paper)',
        borderWidth: d.border,
        borderColor: 'var(--color-stub-navy)',
        borderRadius: d.radius,
        boxShadow: size === 'raised' ? 'var(--shadow-stub-card-raised)' : 'var(--shadow-stub-card-resting)',
        backfaceVisibility: flat ? undefined : 'hidden',
        WebkitBackfaceVisibility: flat ? undefined : 'hidden',
      }}
    >
      <EdgeRail accent={accent} size={size} />
      {/* dotted navy perforation — the rail↔body seam, echoing StubCard */}
      <div className="flex-none self-stretch" style={{ width: 3, display: 'flex', justifyContent: 'center' }}>
        <div
          style={{
            width: 2,
            height: '100%',
            backgroundImage: 'repeating-linear-gradient(var(--color-stub-navy) 0 2px, transparent 2px 5px)',
          }}
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between" style={{ padding: d.pad, paddingLeft: d.pad * 0.6 }}>
        <span
          className="min-w-0 break-words font-stub-display uppercase leading-[1.05] text-stub-navy"
          style={{ fontSize: titlePx, fontWeight: 700, hyphens: 'manual' }}
        >
          {card.title}
        </span>
        {/* year row — pre-placement prints the mono placeholder; the year itself
            is OMITTED from the DOM unless showYear (no-year-leak, structural). */}
        <span
          className="mt-auto font-stub-label uppercase tracking-wider text-stub-slate text-[9px]"
          style={{ fontWeight: 600, fontVariantNumeric: showYear ? 'tabular-nums' : undefined }}
        >
          {showYear ? card.year : 'year ?'}
        </span>
      </div>
    </div>
  )
}

// The reveal face: the year, big, in Domine. Shown by the flip on a misfire (and
// used as the face-up state on the raised card while it self-corrects). The
// decade accent runs as a top edge here (the card's era, framed in the ticket).
function BackFace({ card, size, flat }: FaceProps) {
  const d = DIMS[size]
  const accent = decadeColor(card.decade)
  return (
    <div
      className={`absolute inset-0 flex flex-col items-center justify-center overflow-hidden text-center ${
        size === 'line' ? 'p-1.5' : 'p-2'
      }`}
      style={{
        background: 'var(--color-stub-paper)',
        borderWidth: d.border,
        borderColor: 'var(--color-stub-navy)',
        borderStyle: 'solid',
        borderRadius: d.radius,
        borderTopWidth: size === 'raised' ? 6 : 5,
        borderTopColor: accent,
        boxShadow: size === 'raised' ? 'var(--shadow-stub-card-raised)' : 'var(--shadow-stub-card-resting)',
        transform: flat ? undefined : 'rotateY(180deg)',
        backfaceVisibility: flat ? undefined : 'hidden',
        WebkitBackfaceVisibility: flat ? undefined : 'hidden',
      }}
    >
      {/* decade diamond pip — the era marker, mirroring the front rail's pip */}
      <span
        className="mb-1 flex-none"
        style={{ width: Math.max(5, d.edge - 3), height: Math.max(5, d.edge - 3), background: accent, transform: 'rotate(45deg)' }}
      />
      <span className={`font-stub-display font-bold tabular-nums text-stub-navy ${d.year}`}>
        {card.year}
      </span>
      <span className="mt-1 line-clamp-3 px-1 font-stub-ui text-[10px] font-semibold leading-tight text-stub-slate">
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
