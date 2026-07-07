import { motion } from 'framer-motion'
import type { Movie } from '../data/types.ts'

// RecastOffer — the 7c "drama moment" overlay ("The Stub" design language).
//
// Taz (the CPU) is about to land a super link or a Final Cut; the player may
// spend their one recast token to cancel it, or allow it. This is the CPU
// offer overlay (docs/ui-contracts.md §RecastOffer, Candidate A) — NOT the
// take-to-meld glow (Candidate B), which is a separate mechanic and out of
// scope here.
//
// PRESENTATIONAL. Two plain callbacks out, no refs. The double-tap guard
// (`resolvingOffer`) lives in DuelGame's callback implementations — this
// component fires each callback at most once per tap and knows nothing about
// it (see docs/ui-contracts.md Cross-zone notes: don't hand a raw mutable ref
// into a dumb component).
//
// The component owns the FULL overlay (scrim + amber glow + modal), exactly
// like today's inline zone, so the parent's existing AnimatePresence wrapper
// keeps working unchanged: root is a motion.div with initial/animate/exit
// opacity. z-index stays z-[90] — the app's z-map (draw-choice 85 < recast 90
// < game-over 100) wins over the README's design-doc z-60 scale.
//
// The offered card is injected by the parent as `cardSlot` (today's CardView,
// StubCard after W3); we wrap it in the navy-border + amber-ring slot and
// never import a card component ourselves.

export interface RecastOfferProps {
  /** true → Final Cut consequence ("no connection needed"); false → super link. */
  finalCut: boolean
  /** The offered film — its title is the Domine headline above the card. */
  movie: Movie
  /**
   * Parent-injected card render (CardView today, StubCard after W3). We wrap it
   * so the slot gets the navy border + amber ring; do NOT import Card/StubCard.
   */
  cardSlot: React.ReactNode
  /** Spend the recast token, cancel Taz's play. Fired at most once per tap. */
  onRecast: () => void
  /** Let the held play resolve. Fired at most once per tap. */
  onAllow: () => void
  /** useReducedMotion() result, threaded by the parent (today's shape). */
  reduce: boolean
}

export default function RecastOffer({
  finalCut,
  movie,
  cardSlot,
  onRecast,
  onAllow,
  reduce,
}: RecastOfferProps) {
  // Consequence line — comp copy wins over today's inline strings (README §7c).
  const consequence = finalCut
    ? 'Final Cut — no connection needed'
    : 'Super link — +4 and an encore'

  return (
    <motion.div
      // Full-board overlay. Keep the app's z-[90] slot (see file header on the
      // z-map). initial/animate/exit opacity so the parent's AnimatePresence
      // wrapper drives the fade with its existing timing.
      className="absolute inset-0 z-[90] flex flex-col items-center justify-center px-[42px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduce ? 0.1 : 0.2 }}
      role="dialog"
      aria-modal="true"
      aria-label={`Taz plays ${movie.title} — recast or allow`}
    >
      {/* Navy scrim + soft amber radial glow. These exact rgba values have no
          stub token (README §7c sanctions them verbatim). Glow is centered a
          touch high (~46%) behind the modal, per the comp. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'rgba(31, 58, 82, .66)' }}
      />
      <div
        className="pointer-events-none absolute left-1/2 top-[46%] h-[480px] w-[560px] -translate-x-1/2 -translate-y-1/2"
        style={{
          background:
            'radial-gradient(closest-side, rgba(207,149,42,.16), rgba(207,149,42,0) 70%)',
        }}
      />

      {/* Paper-diorama stack, r18 (the comp overrides the 14px panel radius to
          18px here). Two offset paper layers behind the front panel — same
          technique as TazCorner's house booth, tuned to the 7c offsets
          (inset-x 10/5, top 8/4, bottom -8/-4). */}
      <div className="relative w-full max-w-[300px]">
        <div className="absolute inset-x-[10px] top-2 -bottom-2 rounded-[18px] border-2 border-stub-navy bg-stub-paper-layer-2" />
        <div className="absolute inset-x-[5px] top-1 -bottom-1 rounded-[18px] border-2 border-stub-navy bg-stub-paper-layer-1" />

        {/* Front panel */}
        <div className="relative flex flex-col items-center rounded-[18px] border-2 border-stub-navy bg-stub-paper px-5 pb-[18px] pt-5 text-center shadow-stub-modal">
          {/* Awning strip — amber/cream 14px stripes, 8px tall, riding the top
              edge (2px wider than the panel, no bottom border, top corners
              only). 12px top-corner radius matches the comp. */}
          <div
            className="absolute inset-x-[-2px] -top-2 h-2 rounded-t-[12px] border-2 border-b-0 border-stub-navy"
            style={{
              background:
                'repeating-linear-gradient(90deg, #CF952A 0 14px, #F0EBD8 14px 28px)',
            }}
          />

          {/* TAZ PLAYS — mono slate eyebrow. Wide tracking per the comp. */}
          <span className="font-stub-label text-[9px] font-semibold uppercase tracking-[0.18em] text-stub-slate">
            TAZ PLAYS
          </span>

          {/* Movie title — Domine 26px navy. */}
          <div className="mt-[5px] font-stub-display text-[26px] font-bold leading-none text-stub-navy">
            {movie.title}
          </div>

          {/* Consequence line — Inter 11.5px, stub-red (negative-only). */}
          <div className="mt-1 font-stub-ui text-[11.5px] font-semibold text-stub-red">
            {consequence}
          </div>

          {/* Offered card slot — parent injects the render; we own the frame:
              128px wide, navy border, amber ring (0 0 0 3px rgba(207,149,42,.85)
              — no token, sanctioned). The card render is centered inside. */}
          <div
            className="mt-[14px] flex w-[128px] items-center justify-center overflow-hidden rounded-stub-card border-2 border-stub-navy bg-stub-paper"
            style={{
              boxShadow:
                '0 0 0 3px rgba(207,149,42,.85), 0 8px 20px rgba(9,22,34,.35)',
            }}
          >
            {cardSlot}
          </div>

          {/* Primary — solid amber, navy text. ≥44px tap target (13px v-pad +
              text ≈ 45px). Single onClick; the double-fire guard is the
              parent's. */}
          <button
            type="button"
            data-offer="recast"
            onClick={onRecast}
            className="mt-[18px] w-full rounded-stub-pill bg-stub-amber py-[13px] font-stub-ui text-[12px] font-extrabold uppercase tracking-[0.08em] text-stub-navy active:scale-[0.98]"
          >
            RECAST — CANCEL IT
          </button>

          {/* Secondary — paper with 2px navy border, navy text. */}
          <button
            type="button"
            data-offer="allow"
            onClick={onAllow}
            className="mt-2 w-full rounded-stub-pill border-2 border-stub-navy bg-stub-paper py-3 font-stub-ui text-[12px] font-extrabold uppercase tracking-[0.08em] text-stub-navy active:scale-[0.98]"
          >
            ALLOW IT
          </button>

          {/* Footnote — mono slate. */}
          <span className="mt-[10px] font-stub-label text-[8.5px] font-semibold uppercase tracking-[0.06em] text-stub-slate">
            YOUR RECAST TOKEN · ONE PER SHOW
          </span>
        </div>
      </div>
    </motion.div>
  )
}
