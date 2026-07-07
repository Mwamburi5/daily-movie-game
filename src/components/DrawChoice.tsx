import { motion, useReducedMotion } from 'framer-motion'

// DrawChoice — the draw-3-keep-1 modal ("The Stub" design language).
//
// ⚠️ EXTRAPOLATED SURFACE. No reference comp exists for this screen. It is
// composed from the Stub element library under the cohesion ruling: same
// scrim, paper-diorama stack, awning strip, navy/amber pills, and mono
// captions as the six Duel comps. Nearest attested analog is 7c (the recast
// overlay) — this modal is its sibling: a blocking, centered diorama modal for
// a high-stakes "pick one, the rest are gone" beat. (design_handoff_the_stub
// README §7c + §7a/§7b caption/pill grammar; reference the-stub-screens.html
// #7c line 170+.)
//
// PRESENTATIONAL ONLY. The parent computes everything and injects each
// face-down card via `cardSlot` (so this component never imports Card/StubCard
// — StubCard is being forged in parallel and the decoupling keeps them
// independent). We emit exactly one thing: the picked id.
//
// MECHANIC CONTRACT (docs/ui-contracts.md §DrawChoice, DuelGame.tsx:1790–1822):
//   • Cards render FACE-DOWN with an optional amber "CONNECTS" micro-pill (the
//     card shares a person with a marquee pile top) — the tension is picking on
//     a hint, not full information.
//   • The 1–2 unpicked cards are ALREADY spliced out of the deck before this
//     modal renders (decision D1: burned cards are invisible). There is NO
//     "losing cards fly away" — nothing tracks where they went; they simply
//     cease to exist the instant the player taps a keeper. So: no exit anim on
//     the losers, no AnimatePresence needed on this modal (the parent won't
//     wrap one initially — enter-only motion).
//   • Overlay slot is the parent's: absolute inset-0 z-[85] (below the recast
//     modal z-[90], above the turn banner z-40). This component is the
//     self-contained scrim + panel that fills that slot, like 7c does.
//
// The deck can run short, so `options` is 1–3 entries; the card row centers and
// stays legible at feature-phone widths (390 and 375 both hold three cards).

export interface DrawOption {
  /** Card id, echoed back verbatim through onPick. */
  id: string
  /** True → this card shares a person with a marquee pile top (the amber hint). */
  connects: boolean
  /** The face-down card, rendered by the parent (CardView faceUp={false} today). */
  cardSlot: React.ReactNode
}

interface DrawChoiceProps {
  /** 1–3 drawn cards (deck may run short). Rendered left→right in a row. */
  options: DrawOption[]
  /** Commit a keeper. Parent clears the modal + starts the keep/toss/play flow. */
  onPick: (id: string) => void
  /** useReducedMotion() from the parent — swaps the spring for a 150ms fade. */
  reduce: boolean
}

// The amber "CONNECTS" hint pill. Amber is the ONLY action/highlight color
// (README), so the shared-person tell reads as "this is the promising one"
// without spelling out who. Mono 8.5px caps, sitting on the card's top edge —
// the same register as 7b's "+2 ▸" eligibility pills, restyled for a badge.
function ConnectsPill() {
  return (
    <span className="absolute -top-2.5 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-stub-pill bg-stub-amber px-2 py-0.5 font-stub-label text-[8.5px] font-bold uppercase tracking-[0.08em] text-stub-navy shadow-stub-glow-amber">
      Connects
    </span>
  )
}

export default function DrawChoice({ options, onPick, reduce }: DrawChoiceProps) {
  // The parent already threads useReducedMotion, but read it here too so the
  // component is safe to preview/mount standalone. `reduce` prop wins the intent;
  // the hook is only a fallback for a naked mount.
  const hookReduce = useReducedMotion()
  const soft = reduce || hookReduce

  return (
    // Scrim + panel fill the parent's absolute inset-0 z-[85] slot. Navy scrim
    // at .64 (README .62–.66, matching 7c's blocking dim) + the soft amber
    // radial glow behind the panel that 7c uses to spotlight the modal.
    <div className="absolute inset-0 z-[85] flex items-center justify-center px-3">
      <div className="absolute inset-0 bg-stub-scrim" />
      {/* Amber spotlight glow, centered a touch high like 7c's (top ~46%). */}
      <div
        className="pointer-events-none absolute left-1/2 top-[46%] h-[420px] w-[480px] -translate-x-1/2 -translate-y-1/2"
        style={{
          background:
            'radial-gradient(closest-side, rgba(207,149,42,.16), rgba(207,149,42,0) 70%)',
        }}
      />

      {/* Diorama-stack panel — 7c's sibling. Two offset paper layers behind the
          front panel, both 2px navy, 18px radius; layer 2 (deeper) inset 10px /
          offset 8px, layer 1 inset 5px / offset 4px. Wider than 7c (340 vs 300)
          because this modal holds a ROW of three cards, not one. */}
      <motion.div
        className="relative w-full max-w-[340px]"
        initial={soft ? { opacity: 0 } : { opacity: 0, scale: 0.92 }}
        animate={soft ? { opacity: 1 } : { opacity: 1, scale: 1 }}
        transition={
          soft
            ? { duration: 0.15 }
            : { type: 'spring', stiffness: 320, damping: 24 }
        }
      >
        <div className="absolute inset-x-[10px] top-2 -bottom-2 rounded-[18px] border-2 border-stub-navy bg-stub-paper-layer-2" />
        <div className="absolute inset-x-[5px] top-1 -bottom-1 rounded-[18px] border-2 border-stub-navy bg-stub-paper-layer-1" />

        {/* Front panel */}
        <div className="relative flex flex-col items-center rounded-[18px] border-2 border-stub-navy bg-stub-paper px-4 pb-[18px] pt-5 text-center shadow-stub-modal">
          {/* Awning strip — amber/cream 14px stripes riding the top edge (top
              corners only, no bottom border), same as the booth and 7c. */}
          <div
            className="absolute inset-x-[-2px] -top-2 h-2 rounded-t-xl border-2 border-b-0 border-stub-navy"
            style={{
              background:
                'repeating-linear-gradient(90deg, #CF952A 0 14px, #F0EBD8 14px 28px)',
            }}
          />

          {/* Header pill — navy pill, amber mono caps (7b's "LAY OFF — PICK A
              ROW" register). The count adapts when the deck ran short. */}
          <span className="rounded-stub-pill bg-stub-navy px-3.5 py-1.5 font-stub-label text-[9px] font-bold uppercase tracking-[0.18em] text-stub-amber">
            {options.length === 1
              ? 'One left — take it'
              : options.length === 2
                ? 'Draw 2 — keep one'
                : 'Draw 3 — keep one'}
          </span>

          {/* Card row — up to three face-down wells, centered. gap tightens so
              three hand-size cards clear a 375px screen. Each well is a tap
              target ≥44px with an amber press/hover affordance (README:
              takeable → amber border + glow). */}
          <div className="mt-3.5 flex items-start justify-center gap-2">
            {options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                data-draw-choice={opt.id}
                onClick={() => onPick(opt.id)}
                aria-label={
                  opt.connects ? 'Keep this card — it connects' : 'Keep this card'
                }
                // relative for the CONNECTS pill; min targets guarantee ≥44px
                // even if a future cardSlot shrinks. The ring is the amber
                // affordance — resting is a hairline navy, hover/press goes amber
                // + glow (the Stub's "this is selectable/taken" language).
                className="group relative min-h-[44px] min-w-[44px] rounded-stub-card outline-none ring-2 ring-stub-navy/15 transition-all duration-150 hover:ring-stub-amber hover:shadow-stub-glow-amber focus-visible:ring-stub-amber focus-visible:shadow-stub-glow-amber active:scale-95"
              >
                {opt.connects && <ConnectsPill />}
                {opt.cardSlot}
              </button>
            ))}
          </div>

          {/* Footnote — mono slate caption in the comps' voice (7c's "YOUR
              RECAST TOKEN · ONE PER SHOW" register). States the stake + the
              action. Singular-safe when the deck ran to one card. */}
          <span className="mt-3.5 font-stub-label text-[8.5px] font-semibold uppercase tracking-[0.06em] text-stub-slate">
            {options.length <= 1
              ? 'Tap to keep — then play, hold, or toss it'
              : 'The rest leave the show — tap one to keep'}
          </span>
        </div>
      </motion.div>
    </div>
  )
}
